/**
 * Менеджер глобального кэша маршрутов
 * Обеспечивает единое хранилище данных маршрутов между всеми страницами
 * Включает проверку версии тарифов для обнаружения несоответствий
 */

import { TARIFF_VERSION } from "./shippingCalculator";

interface RouteData {
  version?: string;
  tariffVersion?: string; // Версия тарифной сетки, на основе которой создан кэш
  generatedAt?: string;
  expiresAt?: string;
  routes: {
    toMoscow: any[];
    fromMoscow: any[];
  };
}

// Глобальный кэш маршрутов (сохраняется между переключениями страниц)
let globalRouteCache: RouteData | null = null;

// Флаг загрузки (чтобы предотвратить множественные одновременные запросы)
let isLoading = false;

// Очередь коллбэков, ожидающих загрузку
let loadingCallbacks: Array<(data: RouteData) => void> = [];

/**
 * Получить кэшированные данные маршрутов
 * @returns Данные маршрутов или null, если еще не загружены
 */
export const getRouteCache = (): RouteData | null => {
  return globalRouteCache;
};

/**
 * Загрузить данные маршрутов с задержкой
 * @param delay Задержка в миллисекундах (по умолчанию 1000мс)
 * @returns Promise с данными маршрутов
 */
export const loadRouteCacheDelayed = async (delay: number = 1000): Promise<RouteData> => {
  // Если данные уже загружены - возвращаем сразу
  if (globalRouteCache) {
    return Promise.resolve(globalRouteCache);
  }

  // Если данные уже загружаются - ждём завершения
  if (isLoading) {
    return new Promise((resolve) => {
      loadingCallbacks.push(resolve);
    });
  }

  // Начинаем загрузку
  isLoading = true;

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const data = await import("@/data/routeCache.json");
        globalRouteCache = data.default as RouteData;
        
        // Проверка версии тарифов
        checkTariffVersionCompatibility(globalRouteCache);
        
        console.log('✅ Данные маршрутов загружены (глобальный кэш)');
        
        // Уведомляем все ожидающие коллбэки
        loadingCallbacks.forEach(callback => callback(globalRouteCache!));
        loadingCallbacks = [];
        
        isLoading = false;
        resolve(globalRouteCache);
      } catch (error) {
        console.error('❌ Ошибка загрузки данных маршрутов:', error);
        isLoading = false;
        reject(error);
      }
    }, delay);
  });
};

/**
 * Очистить кэш (для тестирования или принудительного обновления)
 */
export const clearRouteCache = (): void => {
  globalRouteCache = null;
  console.log('🗑️ Кэш маршрутов очищен');
};

/**
 * Проверка совместимости версий тарифов
 * Выводит предупреждения в консоль при несоответствии версий
 * @param cacheData Данные из routeCache.json
 */
const checkTariffVersionCompatibility = (cacheData: RouteData): void => {
  const cacheTariffVersion = cacheData?.tariffVersion;
  const currentTariffVersion = TARIFF_VERSION;

  if (!cacheTariffVersion) {
    console.warn(
      '%c⚠️ ВАЖНО: routeCache.json не содержит версию тарифов!',
      'color: orange; font-weight: bold; font-size: 14px;'
    );
    console.warn(
      '   Аккордеон может показывать устаревшие цены.\n' +
      '   Проверьте соответствие цен в аккордеоне и калькуляторе.\n' +
      '   При необходимости обновите routeCache.json.'
    );
    return;
  }

  if (cacheTariffVersion !== currentTariffVersion) {
    console.error(
      '%c🚨 КРИТИЧЕСКОЕ ПРЕДУПРЕЖДЕНИЕ: Версии тарифов не совпадают!',
      'color: red; font-weight: bold; font-size: 16px; background: yellow; padding: 5px;'
    );
    console.error(
      `   Версия тарифов в routeCache.json: ${cacheTariffVersion}\n` +
      `   Текущая версия тарифов в коде: ${currentTariffVersion}\n\n` +
      '   ❌ Аккордеон показывает УСТАРЕВШИЕ цены!\n' +
      '   ✅ Калькулятор использует АКТУАЛЬНЫЕ тарифы.\n\n' +
      '   ⚠️  Цены в аккордеоне и калькуляторе НЕ СОВПАДАЮТ!\n\n' +
      '   🔧 ДЕЙСТВИЯ:\n' +
      '   1. Обновите routeCache.json с новыми ценами\n' +
      '   2. Установите tariffVersion: "' + currentTariffVersion + '"\n' +
      '   3. Увеличьте версию кэша (version)\n' +
      '   4. Обновите дату generatedAt\n\n' +
      '   📖 См. инструкцию: КАК-ОБНОВИТЬ-КЭШ.md'
    );

    // Опционально: автоматически очистить кэш (закомментировано для безопасности)
    // console.warn('🗑️ Автоматически очищаю устаревший кэш...');
    // globalRouteCache = null;
  } else {
    console.log(
      `✅ Версия тарифов совпадает (${currentTariffVersion}) - кэш актуален`
    );
  }
};

/**
 * Получить текущую версию тарифов
 * @returns Версия тарифной сетки
 */
export const getCurrentTariffVersion = (): string => {
  return TARIFF_VERSION;
};

