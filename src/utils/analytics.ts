// src/utils/analytics.ts

/**
 * Получает UTM метки из URL
 */
export const getUTMParams = (): {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
} => {
  const params = new URLSearchParams(window.location.search);
  
  const utmParams = {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_content: params.get('utm_content') || undefined,
    utm_term: params.get('utm_term') || undefined,
  };
  
  // Проверяем, есть ли UTM метки в URL
  const hasUTM = Object.values(utmParams).some(value => value !== undefined);
  if (hasUTM) {
    console.log('🔗 UTM метки найдены в URL:', utmParams);
  } else {
    console.log('🔗 UTM метки в URL отсутствуют');
  }
  
  return utmParams;
};

/**
 * Сохраняет UTM метки в localStorage (для сохранения между сессиями)
 */
export const saveUTMParams = (): void => {
  const utmParams = getUTMParams();
  
  // Сохраняем только если есть хотя бы одна UTM метка
  if (Object.values(utmParams).some(value => value !== undefined)) {
    localStorage.setItem('utm_params', JSON.stringify(utmParams));
    localStorage.setItem('utm_params_timestamp', Date.now().toString());
    console.log('📊 UTM метки сохранены:', utmParams);
  }
};

/**
 * Получает сохраненные UTM метки из localStorage
 * (актуальны 30 дней)
 */
export const getSavedUTMParams = (): {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
} | null => {
  const savedParams = localStorage.getItem('utm_params');
  const timestamp = localStorage.getItem('utm_params_timestamp');
  
  if (!savedParams || !timestamp) {
    return null;
  }
  
  // Проверяем, не устарели ли данные (30 дней = 30 * 24 * 60 * 60 * 1000)
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  const isExpired = Date.now() - parseInt(timestamp) > thirtyDaysInMs;
  
  if (isExpired) {
    localStorage.removeItem('utm_params');
    localStorage.removeItem('utm_params_timestamp');
    return null;
  }
  
  try {
    return JSON.parse(savedParams);
  } catch {
    return null;
  }
};

/**
 * Получает актуальные UTM метки (из URL или из сохраненных)
 */
export const getActualUTMParams = () => {
  const currentUTM = getUTMParams();
  const hasCurrentUTM = Object.values(currentUTM).some(value => value !== undefined);
  
  if (hasCurrentUTM) {
    console.log('✅ Используются UTM метки из URL');
    return currentUTM;
  }
  
  const savedUTM = getSavedUTMParams();
  if (savedUTM && Object.values(savedUTM).some(value => value !== undefined)) {
    console.log('✅ Используются сохраненные UTM метки:', savedUTM);
    return savedUTM;
  }
  
  console.log('⚠️ UTM метки не найдены ни в URL, ни в localStorage');
  return {};
};

/**
 * Получает значение cookie по имени
 */
const getCookie = (name: string): string | null => {
  const matches = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)')
  );
  return matches ? decodeURIComponent(matches[1]) : null;
};

/**
 * Получает Яндекс Метрика Client ID для счётчика 57594511
 */
export const getYandexClientId = (): string | null => {
  try {
    const COUNTER_ID = 57594511;
    
    // Способ 1: Через Яндекс Метрику API
    if (typeof window !== 'undefined' && (window as any).ym) {
      const clientId = (window as any).ym[COUNTER_ID]?.getClientID?.();
      if (clientId) {
        console.log('✅ Yandex Client ID получен через API:', clientId);
        // Сохраняем для последующего использования
        localStorage.setItem('ym_client_id', clientId.toString());
        return clientId.toString();
      }
    }

    // Способ 2: Из cookie _ym_uid (User ID от Яндекс Метрики)
    const ymUid = getCookie('_ym_uid');
    if (ymUid) {
      console.log('✅ Yandex Client ID получен из cookie:', ymUid);
      localStorage.setItem('ym_client_id', ymUid);
      return ymUid;
    }

    // Способ 3: Из localStorage (если сохраняли ранее)
    const savedClientId = localStorage.getItem('ym_client_id');
    if (savedClientId) {
      console.log('✅ Yandex Client ID получен из localStorage:', savedClientId);
      return savedClientId;
    }

    console.warn('⚠️ Yandex Client ID не найден. Возможно, метрика еще не загружена.');
    return null;
  } catch (error) {
    console.error('❌ Ошибка получения Yandex Client ID:', error);
    return null;
  }
};

/**
 * Сохраняет Яндекс Client ID в localStorage
 */
export const saveYandexClientId = (clientId: string): void => {
  localStorage.setItem('ym_client_id', clientId);
  console.log('💾 Yandex Client ID сохранён:', clientId);
};

/**
 * Инициализация отслеживания при загрузке страницы
 */
export const initAnalytics = (): void => {
  // Сохраняем UTM метки при первой загрузке
  saveUTMParams();
  
  // Пытаемся получить и сохранить Yandex Client ID
  // Повторяем попытку через 2 секунды, если метрика еще не загружена
  const tryGetClientId = () => {
    const clientId = getYandexClientId();
    if (clientId) {
      saveYandexClientId(clientId);
    } else {
      // Повторная попытка через 2 секунды
      setTimeout(() => {
        const retryClientId = getYandexClientId();
        if (retryClientId) {
          saveYandexClientId(retryClientId);
        }
      }, 2000);
    }
  };
  
  tryGetClientId();
  
  console.log('📊 Аналитика инициализирована:', {
    utm: getActualUTMParams(),
  });
};

