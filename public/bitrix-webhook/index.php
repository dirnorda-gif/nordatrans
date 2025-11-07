<?php
/**
 * Bitrix24 Webhook Handler для отправки целей в Яндекс.Метрику
 * 
 * URL: https://nordatrans.ru/bitrix-webhook/index.php
 * Токен: cd7p8htqy86kby1wu8ajqa7bpr2kbmfl
 * 
 * Обрабатывает события:
 * - ONCRMDEALUPDATE - изменение сделки (статус WON/LOSE)
 * 
 * Отправляет цели в Яндекс.Метрику:
 * - success_deal (+ сумма сделки) - при выигранной сделке
 * - lost_deal - при проигранной сделке
 */

// Заголовки для CORS и Content-Type
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Обработка preflight запроса
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Проверка токена безопасности
$token = $_GET['token'] ?? '';
if ($token !== 'cd7p8htqy86kby1wu8ajqa7bpr2kbmfl') {
    http_response_code(403);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid token'
    ]);
    exit;
}

// Получаем данные от Bitrix24
$input = file_get_contents('php://input');
$webhook = json_decode($input, true);

// Логируем входящий запрос (опционально)
$log_enabled = true; // Установите false чтобы отключить логирование
if ($log_enabled) {
    $log_file = __DIR__ . '/webhook.log';
    $log_entry = "\n=== " . date('Y-m-d H:i:s') . " ===\n";
    $log_entry .= "Method: " . $_SERVER['REQUEST_METHOD'] . "\n";
    $log_entry .= "Input: " . $input . "\n";
    file_put_contents($log_file, $log_entry, FILE_APPEND);
}

// Проверяем наличие данных
if (!$webhook || !is_array($webhook)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid webhook data'
    ]);
    exit;
}

// Получаем данные события
$event = $webhook['event'] ?? '';
$stageId = $webhook['data']['FIELDS']['STAGE_ID'] ?? '';
$dealId = $webhook['data']['FIELDS']['ID'] ?? null;
$opportunity = $webhook['data']['FIELDS']['OPPORTUNITY'] ?? 0;

// Получаем Яндекс Client ID из сделки
// Пробуем несколько полей где может храниться Client ID
$clientId = null;
$possibleFields = [
    'UF_CRM_1759567366',  // Основное поле
    'UF_CRM_68E166F070914',
    'UF_CRM_1605630294'
];

foreach ($possibleFields as $field) {
    if (!empty($webhook['data']['FIELDS'][$field])) {
        $clientId = $webhook['data']['FIELDS'][$field];
        break;
    }
}

// Если не нашли в полях, ищем в комментариях
if (!$clientId && !empty($webhook['data']['FIELDS']['COMMENTS'])) {
    $comments = $webhook['data']['FIELDS']['COMMENTS'];
    if (preg_match('/Яндекс Метрика Client ID:\s*([^\s\n]+)/', $comments, $matches)) {
        $clientId = $matches[1];
    } elseif (preg_match('/(1757\d+)/', $comments, $matches)) {
        $clientId = $matches[1];
    }
}

// Если всё равно не нашли, используем ID сделки
if (!$clientId) {
    $clientId = 'deal_' . $dealId;
}

// Определяем цель на основе статуса сделки
$goal = null;
$revenue = 0;

// Проверяем выигранную сделку
if (stripos($stageId, 'WON') !== false || 
    stripos($stageId, 'SUCCESS') !== false ||
    $stageId === 'C9:WON' || 
    $stageId === 'C1:WON') {
    
    $goal = 'success_deal';
    $revenue = floatval($opportunity);
}
// Проверяем проигранную сделку
elseif (stripos($stageId, 'LOSE') !== false || 
        stripos($stageId, 'LOST') !== false ||
        $stageId === 'C9:LOSE' || 
        $stageId === 'C1:LOSE') {
    
    $goal = 'lost_deal';
    $revenue = 0;
}

// Если цель определена, отправляем в Яндекс.Метрику
if ($goal) {
    $result = sendToYandexMetrika($clientId, $goal, $revenue, $dealId);
    
    if ($log_enabled) {
        $log_entry = "Goal sent: {$goal}\n";
        $log_entry .= "Client ID: {$clientId}\n";
        $log_entry .= "Revenue: {$revenue}\n";
        $log_entry .= "Deal ID: {$dealId}\n";
        $log_entry .= "Result: " . json_encode($result) . "\n";
        file_put_contents($log_file, $log_entry, FILE_APPEND);
    }
    
    echo json_encode([
        'status' => 'success',
        'goal' => $goal,
        'client_id' => $clientId,
        'revenue' => $revenue,
        'deal_id' => $dealId,
        'metrika_result' => $result
    ]);
} else {
    // Статус не требует отправки цели
    echo json_encode([
        'status' => 'skipped',
        'message' => 'Stage does not require goal',
        'stage_id' => $stageId,
        'event' => $event
    ]);
}

/**
 * Отправляет событие в Яндекс.Метрику через Measurement Protocol
 * 
 * @param string $clientId - Yandex Client ID
 * @param string $goalName - Название цели (success_deal, lost_deal)
 * @param float $revenue - Сумма сделки (для success_deal)
 * @param int $dealId - ID сделки в Bitrix24
 * @return array - Результат отправки
 */
function sendToYandexMetrika($clientId, $goalName, $revenue, $dealId) {
    // Параметры для Yandex Measurement Protocol
    $params = [
        'tid' => '57594511',           // ID счетчика Яндекс.Метрики
        'cid' => $clientId,             // Client ID пользователя
        't' => 'event',                 // Тип - событие
        'ea' => $goalName,              // Действие события (название цели)
        'ev' => floatval($revenue),     // Значение события (сумма сделки)
        'ec' => 'crm_deal',             // Категория события
        'el' => 'deal_' . $dealId,      // Метка события
    ];
    
    // Формируем URL
    $url = 'https://mc.yandex.ru/collect?' . http_build_query($params);
    
    // Отправляем запрос
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => 5,
            'ignore_errors' => true
        ]
    ]);
    
    $response = @file_get_contents($url, false, $context);
    
    // Получаем код ответа
    $responseCode = 200;
    if (isset($http_response_header)) {
        foreach ($http_response_header as $header) {
            if (preg_match('/HTTP\/\d\.\d\s+(\d+)/', $header, $matches)) {
                $responseCode = intval($matches[1]);
                break;
            }
        }
    }
    
    return [
        'url' => $url,
        'response_code' => $responseCode,
        'success' => ($responseCode >= 200 && $responseCode < 300)
    ];
}

