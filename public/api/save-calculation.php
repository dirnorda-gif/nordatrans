<?php
/**
 * Сохранение расчета пользователя для сопоставления со звонками
 * 
 * Принимает данные расчета с сайта и сохраняет их в JSON файл.
 * Используется для коллтрекинга без динамических номеров.
 * 
 * @author Norda Trans
 * @version 1.0
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Обработка preflight запроса
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Только POST запросы
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

// Получаем данные
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Валидация обязательных полей
if (!$data || !isset($data['client_id']) || !isset($data['route'])) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error', 
        'message' => 'Invalid data: client_id and route are required'
    ]);
    exit;
}

// Путь к файлу с расчетами
$dataFile = __DIR__ . '/../data/calculator-sessions.json';
$dataDir = dirname($dataFile);

// Создаем директорию если не существует
if (!is_dir($dataDir)) {
    if (!mkdir($dataDir, 0755, true)) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Cannot create data directory'
        ]);
        exit;
    }
}

// Загружаем существующие данные
$sessions = [];
if (file_exists($dataFile)) {
    $json = file_get_contents($dataFile);
    $sessions = json_decode($json, true) ?: [];
}

// Добавляем новый расчет
$newSession = [
    'client_id' => $data['client_id'],
    'from_city' => $data['from_city'] ?? '',
    'to_city' => $data['to_city'] ?? '',
    'route' => $data['route'],
    'volume' => $data['volume'] ?? null,
    'cost' => $data['cost'] ?? null,
    'phone' => $data['phone'] ?? null,
    'timestamp' => $data['timestamp'] ?? (time() * 1000),
    'created_at' => date('Y-m-d H:i:s'),
    'matched' => false,
    'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
];

$sessions[] = $newSession;

// Очищаем старые записи (старше 7 дней)
$sevenDaysAgo = time() - (7 * 24 * 60 * 60);
$sessions = array_filter($sessions, function($session) use ($sevenDaysAgo) {
    $sessionTime = isset($session['timestamp']) ? ($session['timestamp'] / 1000) : 0;
    return $sessionTime > $sevenDaysAgo;
});

// Переиндексируем массив
$sessions = array_values($sessions);

// Сохраняем обратно в файл
$jsonOptions = JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES;
if (file_put_contents($dataFile, json_encode($sessions, $jsonOptions)) === false) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Cannot write to data file'
    ]);
    exit;
}

// Логируем в отдельный файл (опционально)
$logEnabled = true;
if ($logEnabled) {
    $logFile = __DIR__ . '/save-calculation.log';
    $logEntry = date('Y-m-d H:i:s') . " | " . 
                "Client: {$data['client_id']} | " .
                "Route: {$data['route']} | " .
                "Sessions: " . count($sessions) . "\n";
    @file_put_contents($logFile, $logEntry, FILE_APPEND);
}

// Возвращаем успех
echo json_encode([
    'status' => 'success',
    'message' => 'Calculation saved',
    'sessions_count' => count($sessions),
    'session_id' => count($sessions) - 1
]);
?>

