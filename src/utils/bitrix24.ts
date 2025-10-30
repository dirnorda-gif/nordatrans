// src/utils/bitrix24.ts

import { getActualUTMParams, getYandexClientId } from './analytics';

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
  additionalInfo?: {
    cargoType?: string;
    direction?: string;
    costPerKm?: number;
    minimumApplied?: boolean;
    // Домашний переезд
    movingItems?: {
      boxes?: boolean;
      furniture?: boolean;
      appliances?: boolean;
    };
    boxesCount?: string;
    furnitureDetails?: string;
    appliancesDetails?: string;
    // Промышленные товары
    cargoPackaging?: string;
    palletCount?: string;
    cargoNature?: string;
    // Продукты питания
    truckType?: string;
    temperatureMode?: string;
    foodPackaging?: string;
    foodPalletCount?: string;
    // Другое
    otherPackaging?: string;
    otherPalletCount?: string;
    otherNature?: string;
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
  
  // Домашний переезд
  if (info.cargoType === 'Домашний переезд' && info.movingItems) {
    details += '\n\nДЕТАЛИ ДОМАШНЕГО ПЕРЕЕЗДА:';
    if (info.movingItems.boxes) {
      details += `\n- Коробки${info.boxesCount ? ` (${info.boxesCount} шт.)` : ''}`;
    }
    if (info.movingItems.furniture) {
      details += `\n- Мебель${info.furnitureDetails ? `: ${info.furnitureDetails}` : ''}`;
    }
    if (info.movingItems.appliances) {
      details += `\n- Бытовая техника${info.appliancesDetails ? `: ${info.appliancesDetails}` : ''}`;
    }
  }
  
  // Промышленные товары
  if (info.cargoType === 'Промышленные товары') {
    details += '\n\nДЕТАЛИ ПРОМЫШЛЕННЫХ ТОВАРОВ:';
    if (info.cargoPackaging) {
      const packagingMap: Record<string, string> = {
        'pallets': 'На палетах',
        'individual': 'Индивидуальная упаковка',
        'bulk': 'Навалом (без упаковки)',
        'loose': 'Россыпью'
      };
      details += `\n- Упаковка: ${packagingMap[info.cargoPackaging] || info.cargoPackaging}`;
      if (info.cargoPackaging === 'pallets' && info.palletCount) {
        details += ` (${info.palletCount} шт.)`;
      }
    }
    if (info.cargoNature) {
      details += `\n- Характер груза: ${info.cargoNature}`;
    }
  }
  
  // Продукты питания
  if (info.cargoType === 'Продукты питания') {
    details += '\n\nДЕТАЛИ ПРОДУКТОВ ПИТАНИЯ:';
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
        'containers': 'В контейнерах'
      };
      details += `\n- Упаковка: ${packagingMap[info.foodPackaging] || info.foodPackaging}`;
      if (info.foodPackaging === 'pallets' && info.foodPalletCount) {
        details += ` (${info.foodPalletCount} шт.)`;
      }
    }
  }
  
  // Другое
  if (info.cargoType === 'Другое') {
    details += '\n\nДЕТАЛИ ГРУЗА:';
    if (info.otherPackaging) {
      const packagingMap: Record<string, string> = {
        'pallets': 'На палетах',
        'individual': 'Индивидуальная упаковка',
        'bulk': 'Навалом (без упаковки)',
        'loose': 'Россыпью'
      };
      details += `\n- Упаковка: ${packagingMap[info.otherPackaging] || info.otherPackaging}`;
      if (info.otherPackaging === 'pallets' && info.otherPalletCount) {
        details += ` (${info.otherPalletCount} шт.)`;
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
    const comment = `
===========================================
ЗАЯВКА НА РАСЧЕТ СТОИМОСТИ ДОСТАВКИ
===========================================

МАРШРУТ:
Откуда: ${removeCountryFromCity(data.fromCity)}
Куда: ${removeCountryFromCity(data.toCity)}
Расстояние: ${data.distance} км
Направление: ${data.additionalInfo?.direction || 'Не указано'}

ПАРАМЕТРЫ ГРУЗА:
Вес: ${data.weight} кг
Объем: ${data.volume} м³
Требуемая машина: ${data.truckCapacity}${data.additionalInfo?.cargoType ? `\nТип груза: ${data.additionalInfo.cargoType}` : ''}${formatCargoDetails(data)}

СТОИМОСТЬ ПЕРЕВОЗКИ:
ИТОГО: ${data.cost.toLocaleString('ru-RU')} руб.
${data.additionalInfo?.costPerKm ? `Тариф за км: ${data.additionalInfo.costPerKm.toFixed(2)} руб/км` : ''}
${data.additionalInfo?.minimumApplied ? 'Применена минимальная стоимость (7 500 руб)' : ''}

КОНТАКТ КЛИЕНТА:
Способ связи: ${data.contactMethod === 'phone' ? 'Телефон' : 'WhatsApp'}
Номер: ${data.phone}
${data.additionalInfo?.cargoType ? `\nТип груза: ${data.additionalInfo.cargoType}` : ''}${data.additionalInfo?.packaging ? `\nУпаковка: ${data.additionalInfo.packaging}` : ''}
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

    // Очищаем названия городов от страны
    const cleanFromCity = removeCountryFromCity(data.fromCity);
    const cleanToCity = removeCountryFromCity(data.toCity);
    
    console.log('🏙️ Очистка названий городов:');
    console.log('   Откуда:', data.fromCity, '→', cleanFromCity);
    console.log('   Куда:', data.toCity, '→', cleanToCity);

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
    console.log('📊 Yandex Client ID (UF_CRM_1759567366):', leadFields.UF_CRM_1759567366);
    console.log('📊 UTM метки:', {
      source: leadFields.UTM_SOURCE || 'не указано',
      medium: leadFields.UTM_MEDIUM || 'не указано',
      campaign: leadFields.UTM_CAMPAIGN || 'не указано',
      content: leadFields.UTM_CONTENT || 'не указано',
      term: leadFields.UTM_TERM || 'не указано'
    });
    console.log('💬 Комментарий (первые 200 символов):', comment.substring(0, 200) + '...');

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

