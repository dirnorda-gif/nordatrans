/**
 * Менеджер глобального кэша маршрутов
 * Обеспечивает единое хранилище данных маршрутов между всеми страницами
 */

interface RouteData {
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

