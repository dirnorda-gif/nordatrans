// src/utils/bitrix24.ts

import { getActualUTMParams, getYandexClientId } from './analytics';

// Интерфейс для предмета из конструктора
interface ConstructorItem {
  item: {
    name: string;
    length: number;
    width: number;
    height: number;
    volume: number;
  };
  quantity: number;
}

interface Bitrix24LeadData {
  fromCity: string;
  toCity: string;
  phone: string;
  distance: number;
  weight: number;
  volume: number;
  cost: number;
  truckCapacity: string;
  contactMethod: 'phone' | 'whatsapp';
  deliveryDays?: string; // Срок доставки
  additionalInfo?: {
    cargoType?: string;
    direction?: string;
    costPerKm?: number;
    minimumApplied?: boolean;
    // Домашний переезд
    usedConstructor?: boolean; // Флаг использования конструктора переезда
    constructorItems?: ConstructorItem[]; // Список предметов из конструктора (компактный вывод)
    // Промышленные товары
    cargoPackaging?: string;
    palletCount?: string;
    cargoNature?: string;
    // Вес одной палеты (для всех типов, если используется палетная логики)
    palletWeightPerKg?: string;
    // Продукты питания
    truckType?: string;
    temperatureMode?: string;
    foodPackaging?: string;
    foodPalletCount?: string;
    // Другое
    otherPackaging?: string;
    otherPalletCount?: string;
    otherNature?: string;
    // Новый калькулятор со стрелочными шагами
    transportType?: string;
    isConstructorUsed?: boolean;
    constructorUrl?: string;
    // Упаковка для коммерческих грузов (новый калькулятор)
    packaging?: string; // "pallets" | "boxes" | "bulk"
    newPalletCount?: string;
    newPalletWeight?: string;
  };
}

interface Bitrix24Response {
  result?: number;
  error?: string;
  error_description?: string;
}

/**
 * Убирает название страны из названия города
 * Например: "Москва, Россия" -> "Москва"
 */
const removeCountryFromCity = (cityName: string): string => {
  if (!cityName) return cityName;
  
  // Удаляем ", Россия" в любом регистре
  let cleanedCity = cityName
    .replace(/, Россия$/i, '')     // ", Россия" в конце строки
    .replace(/, Russia$/i, '')     // ", Russia" в конце строки
    .replace(/,\s*Россия$/i, '')   // ", Россия" или ",Россия" в конце
    .replace(/,\s*Russia$/i, '')   // ", Russia" или ",Russia" в конце
    .replace(/Россия$/i, '')       // "Россия" в конце без запятой
    .replace(/Russia$/i, '');      // "Russia" в конце без запятой
  
  return cleanedCity.trim();
};

/**
 * Форматирует дополнительную информацию о грузе в зависимости от типа
 */
const formatCargoDetails = (data: Bitrix24LeadData): string => {
  const info = data.additionalInfo;
  if (!info) return '';
  
  let details = '';
  
  // ========== ДОМАШНИЙ ПЕРЕЕЗД ==========
  if (info.cargoType === 'Домашний переезд') {
    details += '\n\nДЕТАЛИ ДОМАШНЕГО ПЕРЕЕЗДА:';
    
    // Показываем объем груза (всегда есть)
    details += `\n- Объем груза: ${data.volume} м³`;
    
    // Указываем как был рассчитан объем
    if (info.usedConstructor) {
      details += '\n- Способ расчета: КОНСТРУКТОР ПЕРЕЕЗДА';
      
      // Компактный список предметов с габаритами
      if (info.constructorItems && info.constructorItems.length > 0) {
        details += '\n\nСПИСОК ВЕЩЕЙ:';
        
        info.constructorItems.forEach((constructorItem) => {
          const item = constructorItem.item;
          const qty = constructorItem.quantity;
          
          // Краткий формат: Название × кол-во (Д×Ш×В см)
          details += `\n• ${item.name} × ${qty} шт. (${item.length}×${item.width}×${item.height} см)`;
        });
        
        // Подсчитываем общее количество предметов
        const totalItems = info.constructorItems.reduce((sum, ci) => sum + ci.quantity, 0);
        details += `\n\nВСЕГО ПРЕДМЕТОВ: ${totalItems} шт.`;
      }
    } else {
      details += '\n- Способ расчета: ВЫБРАН ПОЛЬЗОВАТЕЛЕМ ВРУЧНУЮ';
    }
  }
  
  // ========== ПРОМЫШЛЕННЫЕ ТОВАРЫ ==========
  if (info.cargoType === 'Промышленные товары') {
    details += '\n\nДЕТАЛИ ПРОМЫШЛЕННЫХ ТОВАРОВ:';
    
    // Объем и вес (пользователь выбирает сам)
    details += `\n- Объем груза: ${data.volume} м³`;
    details += `\n- Вес груза: ${data.weight >= 1000 ? `${(data.weight / 1000).toFixed(1)} т` : `${data.weight} кг`}`;
    
    if (info.cargoPackaging) {
      const packagingMap: Record<string, string> = {
        'pallets': 'На палетах',
        'individual': 'Индивидуальная упаковка',
        'bulk': 'Навалом (без упаковки)',
        'loose': 'Россыпью'
      };
      details += `\n- Упаковка: ${packagingMap[info.cargoPackaging] || info.cargoPackaging}`;
      if (info.cargoPackaging === 'pallets') {
        if (info.palletCount) details += ` (${info.palletCount} шт.)`;
        if (info.palletWeightPerKg) details += `\n- Вес одной палеты: ${info.palletWeightPerKg} кг`;
      }
    }
    if (info.cargoNature) {
      details += `\n- Характер груза: ${info.cargoNature}`;
    }
  }
  
  // ========== ПРОДУКТЫ ПИТАНИЯ ==========
  if (info.cargoType === 'Продукты питания') {
    details += '\n\nДЕТАЛИ ПРОДУКТОВ ПИТАНИЯ:';
    
    // Объем и вес (пользователь выбирает сам)
    details += `\n- Объем груза: ${data.volume} м³`;
    details += `\n- Вес груза: ${data.weight >= 1000 ? `${(data.weight / 1000).toFixed(1)} т` : `${data.weight} кг`}`;
    
    if (info.truckType) {
      const truckTypeMap: Record<string, string> = {
        'tented': 'Тентованный',
        'isoterm': 'Изотерм',
        'refrigerator': 'Рефрижератор'
      };
      details += `\n- Тип фургона: ${truckTypeMap[info.truckType] || info.truckType}`;
      if (info.truckType === 'refrigerator' && info.temperatureMode) {
        details += ` (${info.temperatureMode}°C)`;
      }
    }
    if (info.foodPackaging) {
      const packagingMap: Record<string, string> = {
        'pallets': 'На палетах',
        'boxes': 'В коробках',
        'individual': 'Индивидуальная упаковка',
        'bulk': 'Навалом (без упаковки)',
        'loose': 'Россыпью'
      };
      details += `\n- Упаковка: ${packagingMap[info.foodPackaging] || info.foodPackaging}`;
      if (info.foodPackaging === 'pallets') {
        if (info.foodPalletCount) details += ` (${info.foodPalletCount} шт.)`;
        if (info.palletWeightPerKg) details += `\n- Вес одной палеты: ${info.palletWeightPerKg} кг`;
      }
    }
  }
  
  // ========== ДРУГОЕ ==========
  if (info.cargoType === 'Другое') {
    details += '\n\nДЕТАЛИ ГРУЗА:';
    
    // Объем и вес (пользователь выбирает сам)
    details += `\n- Объем груза: ${data.volume} м³`;
    details += `\n- Вес груза: ${data.weight >= 1000 ? `${(data.weight / 1000).toFixed(1)} т` : `${data.weight} кг`}`;
    
    if (info.otherPackaging) {
      const packagingMap: Record<string, string> = {
        'pallets': 'На палетах',
        'individual': 'Индивидуальная упаковка',
        'bulk': 'Навалом (без упаковки)',
        'loose': 'Россыпью'
      };
      details += `\n- Упаковка: ${packagingMap[info.otherPackaging] || info.otherPackaging}`;
      if (info.otherPackaging === 'pallets') {
        if (info.otherPalletCount) details += ` (${info.otherPalletCount} шт.)`;
        if (info.palletWeightPerKg) details += `\n- Вес одной палеты: ${info.palletWeightPerKg} кг`;
      }
    }
    if (info.otherNature) {
      details += `\n- Характер груза: ${info.otherNature}`;
    }
  }
  
  return details;
};

/**
 * Создает лид в Bitrix24 с UTM метками и Яндекс Client ID
 */
export const createBitrix24Lead = async (
  data: Bitrix24LeadData
): Promise<{ success: boolean; leadId?: number; error?: string }> => {
  
  const webhookUrl = 'https://nordatrans.bitrix24.ru/rest/1/la8f9cfu3icpekuz/';
  
  try {
    // Получаем UTM метки и Яндекс Client ID
    const utmParams = getActualUTMParams();
    const yandexClientId = getYandexClientId();

    // Формируем подробный комментарий с расчётом (без Unicode символов для совместимости с Bitrix24)
    // Формируем строку упаковки
    let packagingStr = '';
    if (data.additionalInfo?.packaging) {
      const packagingNames: Record<string, string> = {
        'pallets': 'На палетах',
        'boxes': 'В коробках',
        'bulk': 'Россыпью'
      };
      packagingStr = `Упаковка: ${packagingNames[data.additionalInfo.packaging] || data.additionalInfo.packaging}`;
      
      if (data.additionalInfo.packaging === 'pallets' && data.additionalInfo.newPalletCount && data.additionalInfo.newPalletWeight) {
        packagingStr += `\nКол-во палет: ${data.additionalInfo.newPalletCount}`;
        packagingStr += `\nВес одной палеты: ${data.additionalInfo.newPalletWeight} кг`;
      }
    }

    let comment = `
===========================================
ЗАЯВКА НА РАСЧЕТ СТОИМОСТИ ДОСТАВКИ
===========================================

Откуда: ${removeCountryFromCity(data.fromCity)}
Куда: ${removeCountryFromCity(data.toCity)}
${data.additionalInfo?.transportType ? `Тип перевозки: ${data.additionalInfo.transportType}` : ''}
${packagingStr ? packagingStr + '\n' : ''}Объём: ${data.volume} м³
Вес: ${(data.weight / 1000).toFixed(1)} т

Предварительная стоимость: ${data.cost.toLocaleString('ru-RU')} руб.
Расстояние: ${Math.round(data.distance)} км
${data.deliveryDays ? `Срок доставки: ${data.deliveryDays}` : ''}

Способ связи: ${data.contactMethod === 'phone' ? 'Телефон' : 'WhatsApp'}
Рекомендуемый транспорт: ${data.truckCapacity}
${yandexClientId ? `\nЯндекс Метрика Client ID: ${yandexClientId}` : ''}

===========================================
Заявка создана через калькулятор на сайте
Дата и время: ${new Date().toLocaleString('ru-RU', {
  day: '2-digit',
  month: '2-digit', 
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
===========================================
    `.trim();
    
    // Добавляем компактную информацию о конструкторе
    console.log('🔍 [Bitrix24] ===== ПРОВЕРКА ДАННЫХ КОНСТРУКТОРА =====');
    console.log('🔍 [Bitrix24] data.additionalInfo:', data.additionalInfo);
    console.log('🔍 [Bitrix24] data.additionalInfo?.transportType:', data.additionalInfo?.transportType);
    console.log('🔍 [Bitrix24] data.additionalInfo?.isConstructorUsed:', data.additionalInfo?.isConstructorUsed);
    console.log('🔍 [Bitrix24] data.additionalInfo?.constructorUrl:', data.additionalInfo?.constructorUrl);
    console.log('🔍 [Bitrix24] data.additionalInfo?.constructorItems (количество):', data.additionalInfo?.constructorItems?.length || 0);
    
    if (data.additionalInfo?.isConstructorUsed && data.additionalInfo?.constructorItems && data.additionalInfo.constructorItems.length > 0) {
      console.log('✅ [Bitrix24] Добавляем КОМПАКТНУЮ информацию о конструкторе');
      
      comment += '\n\n===========================================';
      comment += '\nОБЪЁМ РАССЧИТАН ЧЕРЕЗ КОНСТРУКТОР ПЕРЕЕЗДА';
      comment += '\n===========================================\n';
      
      // Компактный список: Название Д×Ш×В см Хшт
      data.additionalInfo.constructorItems.forEach((ci) => {
        const item = ci.item;
        comment += `\n${item.name} ${item.length}×${item.width}×${item.height} см ${ci.quantity}шт`;
      });
      
      // Добавляем ссылку на конструктор
      console.log('🔗 [Bitrix24] Проверка constructorUrl:', {
        exists: !!data.additionalInfo.constructorUrl,
        value: data.additionalInfo.constructorUrl,
        type: typeof data.additionalInfo.constructorUrl,
        length: data.additionalInfo.constructorUrl?.length
      });
      
      if (data.additionalInfo.constructorUrl) {
        comment += `\n\n🔗 Ссылка на расчёт: ${data.additionalInfo.constructorUrl}`;
        comment += '\n(Менеджер может открыть для просмотра полного списка)';
        console.log('✅ [Bitrix24] Ссылка добавлена в комментарий');
      } else {
        console.warn('⚠️ [Bitrix24] constructorUrl пустой, ссылка НЕ добавлена');
      }
      
      console.log('✅ [Bitrix24] Компактная информация добавлена. Новая длина:', comment.length);
    } else {
      console.log('⚠️ [Bitrix24] Конструктор не использовался или нет данных');
      console.log('⚠️ [Bitrix24] Причина:', {
        isConstructorUsedFalse: !data.additionalInfo?.isConstructorUsed,
        constructorItemsEmpty: !data.additionalInfo?.constructorItems || data.additionalInfo.constructorItems.length === 0
      });
    }

    // Очищаем названия городов от страны
    const cleanFromCity = removeCountryFromCity(data.fromCity);
    const cleanToCity = removeCountryFromCity(data.toCity);
    
    console.log('🏙️ Очистка названий городов:');
    console.log('   Откуда:', data.fromCity, '→', cleanFromCity);
    console.log('   Куда:', data.toCity, '→', cleanToCity);

    // Логируем финальный комментарий
    console.log('📝 [Bitrix24] ===== ФИНАЛЬНЫЙ КОММЕНТАРИЙ =====');
    console.log('📝 [Bitrix24] Длина комментария:', comment.length);
    console.log('📝 [Bitrix24] Первые 500 символов:', comment.substring(0, 500));
    console.log('📝 [Bitrix24] Последние 500 символов:', comment.substring(Math.max(0, comment.length - 500)));
    console.log('📝 [Bitrix24] Содержит "КОНСТРУКТОР":', comment.includes('КОНСТРУКТОР'));
    console.log('📝 [Bitrix24] Содержит "ССЫЛКА":', comment.includes('ССЫЛКА'));
    
    // Формируем данные для создания лида
    const leadFields: any = {
      TITLE: `Перевозка ${cleanFromCity} → ${cleanToCity} (${data.cost.toLocaleString('ru-RU')} ₽)`,
      NAME: 'Клиент с сайта',
      PHONE: [
        {
          VALUE: data.phone,
          VALUE_TYPE: data.contactMethod === 'whatsapp' ? 'WORK' : 'MOBILE'
        }
      ],
      COMMENTS: comment,
      SOURCE_ID: 'WEB',
      CURRENCY_ID: 'RUB',
      
      // Пользовательские поля для городов (без названия страны)
      UF_CRM_1605030443: cleanFromCity, // Откуда
      UF_CRM_1605030456: cleanToCity,   // Куда
    };
    
    // Добавляем ссылку на конструктор в отдельное поле (если есть)
    if (data.additionalInfo?.constructorUrl) {
      leadFields.UF_CRM_1763321505007 = data.additionalInfo.constructorUrl; // Ссылка на конструктор переезда
      console.log('🔗 [Bitrix24] Ссылка на конструктор добавлена в поле UF_CRM_1763321505007:', data.additionalInfo.constructorUrl);
    }

    // Добавляем UTM метки (стандартные поля Bitrix24)
    if (utmParams.utm_source) {
      leadFields.UTM_SOURCE = utmParams.utm_source;
    }
    if (utmParams.utm_medium) {
      leadFields.UTM_MEDIUM = utmParams.utm_medium;
    }
    if (utmParams.utm_campaign) {
      leadFields.UTM_CAMPAIGN = utmParams.utm_campaign;
    }
    if (utmParams.utm_content) {
      leadFields.UTM_CONTENT = utmParams.utm_content;
    }
    if (utmParams.utm_term) {
      leadFields.UTM_TERM = utmParams.utm_term;
    }

    // Добавляем Яндекс Client ID в правильное поле
    if (yandexClientId) {
      leadFields.UF_CRM_1759567366 = yandexClientId;
    }

    console.log('📤 Отправка лида в Bitrix24...');
    console.log('📋 Название:', leadFields.TITLE);
    console.log('📞 Телефон:', data.phone);
    console.log('📍 Откуда (UF_CRM_1605030443):', leadFields.UF_CRM_1605030443);
    console.log('📍 Куда (UF_CRM_1605030456):', leadFields.UF_CRM_1605030456);
    console.log('🔗 Ссылка на конструктор (UF_CRM_1763321505007):', leadFields.UF_CRM_1763321505007 || 'не указано');
    console.log('📊 Yandex Client ID (UF_CRM_1759567366):', leadFields.UF_CRM_1759567366);
    console.log('📊 UTM метки:', {
      source: leadFields.UTM_SOURCE || 'не указано',
      medium: leadFields.UTM_MEDIUM || 'не указано',
      campaign: leadFields.UTM_CAMPAIGN || 'не указано',
      content: leadFields.UTM_CONTENT || 'не указано',
      term: leadFields.UTM_TERM || 'не указано'
    });
    console.log('💬 Комментарий (первые 200 символов):', comment.substring(0, 200) + '...');

    // ===== ФИНАЛЬНАЯ ПРОВЕРКА ПЕРЕД ОТПРАВКОЙ =====
    console.log('🚀 [Bitrix24] ========== ФИНАЛЬНАЯ ПРОВЕРКА ==========');
    console.log('🚀 [Bitrix24] leadFields.COMMENTS (длина):', leadFields.COMMENTS.length);
    console.log('🚀 [Bitrix24] leadFields.COMMENTS (полный текст):');
    console.log(leadFields.COMMENTS);
    console.log('🚀 [Bitrix24] Содержит "КОНСТРУКТОР":', leadFields.COMMENTS.includes('КОНСТРУКТОР'));
    console.log('🚀 [Bitrix24] Содержит "🔗":', leadFields.COMMENTS.includes('🔗'));
    console.log('🚀 [Bitrix24] ========================================');

    // Отправляем запрос в Bitrix24
    const response = await fetch(`${webhookUrl}crm.lead.add.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: leadFields
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: Bitrix24Response = await response.json();

    if (result.error) {
      console.error('❌ Ошибка Bitrix24:', result.error_description);
      return {
        success: false,
        error: result.error_description || result.error
      };
    }

    console.log('✅ Лид успешно создан в Bitrix24. ID:', result.result);
    console.log('📊 UTM метки:', utmParams);
    console.log('📊 Yandex Client ID:', yandexClientId);
    
    // Отправляем цель new_lead в Яндекс.Метрику
    if (typeof window !== 'undefined' && window.ym) {
      window.ym(57594511, 'reachGoal', 'new_lead', {
        lead_id: result.result
      });
      console.log('📊 Яндекс.Метрика: цель new_lead отправлена для лида #' + result.result);
    }
    
    return {
      success: true,
      leadId: result.result
    };

  } catch (error) {
    console.error('❌ Ошибка при создании лида:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    };
  }
};

/**
 * Создает лид обратного звонка с 10% скидкой в Bitrix24
 */
export const createCallbackLead = async (
  phone: string,
  name?: string
): Promise<{ success: boolean; leadId?: number; error?: string }> => {
  
  const webhookUrl = 'https://nordatrans.bitrix24.ru/rest/1/la8f9cfu3icpekuz/';
  
  try {
    // Получаем UTM метки и Яндекс Client ID
    const utmParams = getActualUTMParams();
    const yandexClientId = getYandexClientId();

    // Формируем комментарий
    const comment = `
===========================================
ЗАКАЗ ОБРАТНОГО ЗВОНКА СО СКИДКОЙ 10%
===========================================

КОНТАКТ КЛИЕНТА:
Имя: ${name || 'Не указано'}
Телефон: ${phone}

АКЦИЯ:
Клиент запросил обратный звонок для получения скидки 10% на первую перевозку.

${yandexClientId ? `Яндекс Метрика Client ID: ${yandexClientId}` : ''}

===========================================
Заявка создана через форму обратного звонка
Дата и время: ${new Date().toLocaleString('ru-RU', {
  day: '2-digit',
  month: '2-digit', 
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
===========================================
    `.trim();

    // Формируем данные для создания лида
    const leadFields: any = {
      TITLE: `Обратный звонок - Скидка 10% (${phone})`,
      NAME: name || 'Клиент с сайта',
      PHONE: [
        {
          VALUE: phone,
          VALUE_TYPE: 'MOBILE'
        }
      ],
      COMMENTS: comment,
      SOURCE_ID: 'WEB',
      CURRENCY_ID: 'RUB',
    };

    // Добавляем UTM метки
    if (utmParams.utm_source) {
      leadFields.UTM_SOURCE = utmParams.utm_source;
    }
    if (utmParams.utm_medium) {
      leadFields.UTM_MEDIUM = utmParams.utm_medium;
    }
    if (utmParams.utm_campaign) {
      leadFields.UTM_CAMPAIGN = utmParams.utm_campaign;
    }
    if (utmParams.utm_content) {
      leadFields.UTM_CONTENT = utmParams.utm_content;
    }
    if (utmParams.utm_term) {
      leadFields.UTM_TERM = utmParams.utm_term;
    }

    // Добавляем Яндекс Client ID
    if (yandexClientId) {
      leadFields.UF_CRM_1759567366 = yandexClientId;
    }

    console.log('📤 Отправка лида обратного звонка в Bitrix24...');
    console.log('📋 Название:', leadFields.TITLE);
    console.log('📞 Телефон:', phone);
    console.log('📊 Yandex Client ID:', leadFields.UF_CRM_1759567366);

    // Отправляем запрос в Bitrix24
    const response = await fetch(`${webhookUrl}crm.lead.add.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: leadFields
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: Bitrix24Response = await response.json();

    if (result.error) {
      console.error('❌ Ошибка Bitrix24:', result.error_description);
      return {
        success: false,
        error: result.error_description || result.error
      };
    }

    console.log('✅ Лид обратного звонка успешно создан в Bitrix24. ID:', result.result);
    
    // Отправляем цель new_lead в Яндекс.Метрику
    if (typeof window !== 'undefined' && window.ym) {
      window.ym(57594511, 'reachGoal', 'new_lead', {
        lead_id: result.result,
        lead_type: 'callback'
      });
      console.log('📊 Яндекс.Метрика: цель new_lead отправлена для лида обратного звонка #' + result.result);
    }
    
    return {
      success: true,
      leadId: result.result
    };

  } catch (error) {
    console.error('❌ Ошибка при создании лида обратного звонка:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    };
  }
};

/**
 * Проверяет доступность Bitrix24 API
 */
export const testBitrix24Connection = async (): Promise<boolean> => {
  const webhookUrl = 'https://nordatrans.bitrix24.ru/rest/1/la8f9cfu3icpekuz/';
  
  try {
    const response = await fetch(`${webhookUrl}profile.json`);
    const result = await response.json();
    console.log('✅ Bitrix24 подключен:', result.result?.NAME, result.result?.LAST_NAME);
    return !result.error;
  } catch (error) {
    console.error('❌ Ошибка подключения к Bitrix24:', error);
    return false;
  }
};

/**
 * Сохраняет расчет пользователя для последующего сопоставления со звонком
 * Используется для коллтрекинга без динамических номеров
 */
export const saveCalculationForCallMatching = async (data: {
  fromCity: string;
  toCity: string;
  volume?: number;
  cost?: number;
  phone?: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    // Получаем Яндекс Client ID
    const yandexClientId = getYandexClientId();
    
    if (!yandexClientId) {
      console.warn('⚠️ Яндекс Client ID не найден, используем временный ID');
    }

    // Отправляем расчет на сервер для сохранения
    const response = await fetch('https://nordatrans.ru/api/save-calculation.php', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: yandexClientId || 'temp_' + Date.now(),
        from_city: data.fromCity,
        to_city: data.toCity,
        route: `${data.fromCity} → ${data.toCity}`,
        volume: data.volume,
        cost: data.cost,
        phone: data.phone,
        timestamp: Date.now()
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status === 'success') {
      console.log('💾 Расчет сохранен для сопоставления звонков:', {
        route: `${data.fromCity} → ${data.toCity}`,
        client_id: yandexClientId
      });
      return { success: true };
    } else {
      console.error('❌ Ошибка сохранения расчета:', result.message);
      return { success: false, error: result.message };
    }

  } catch (error) {
    console.error('❌ Ошибка при сохранении расчета для коллтрекинга:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    };
  }
};

