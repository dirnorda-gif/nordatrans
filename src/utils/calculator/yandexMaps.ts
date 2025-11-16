// src/utils/calculator/yandexMaps.ts
// Функции для работы с Яндекс.Картами

import { YANDEX_API_KEY } from "./constants";

console.log('📦 [YandexMaps] Загрузка модуля Яндекс.Карт');

export interface Suggestion {
  displayName: string;
  value: string;
  coordinates?: [number, number];
}

/**
 * Получает подсказки городов от Яндекс.Карт
 */
export const fetchSuggestions = async (
  query: string,
  setSuggestions: (suggestions: Suggestion[]) => void,
  setShowSuggestions: (show: boolean) => void,
  setIsLoading: (loading: boolean) => void
): Promise<void> => {
  console.log('🔍 [fetchSuggestions] Запрос подсказок для:', query);
  
  if (!query || query.trim().length < 2) {
    console.log('⚠️ [fetchSuggestions] Запрос слишком короткий, пропускаем');
    setSuggestions([]);
    setShowSuggestions(false);
    setIsLoading(false);
    return;
  }

  setIsLoading(true);
  console.log('⏳ [fetchSuggestions] Начало загрузки подсказок...');

  try {
    const searchQuery = query.includes("Россия") ? query : `Россия, ${query}`;
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&geocode=${encodeURIComponent(
      searchQuery
    )}&format=json&results=10&lang=ru_RU`;

    console.log('🌐 [fetchSuggestions] URL запроса:', url);

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('❌ [fetchSuggestions] Ошибка HTTP:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📥 [fetchSuggestions] Получен ответ от API:', data);

    const geoObjects =
      data.response?.GeoObjectCollection?.featureMember || [];
    
    console.log('📍 [fetchSuggestions] Количество найденных объектов:', geoObjects.length);

    const suggestions: Suggestion[] = geoObjects
      .map((item: any, index: number) => {
        const geoObject = item.GeoObject;
        const name = geoObject.name;
        const description = geoObject.description;
        const fullName = description ? `${name}, ${description}` : name;
        const pos = geoObject.Point.pos.split(" ");
        const coordinates: [number, number] = [
          parseFloat(pos[1]),
          parseFloat(pos[0]),
        ];

        console.log(`  ${index + 1}. ${fullName} [${coordinates.join(', ')}]`);

        return {
          displayName: fullName,
          value: name,
          coordinates,
        };
      })
      .filter((suggestion: Suggestion) => {
        const isRussia =
          suggestion.displayName.toLowerCase().includes("россия");
        console.log(`  Фильтр: "${suggestion.value}" - ${isRussia ? '✅ Россия' : '❌ Не Россия'}`);
        return isRussia;
      });

    console.log('✅ [fetchSuggestions] Отфильтровано подсказок:', suggestions.length);

    setSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0);
  } catch (error) {
    console.error("❌ [fetchSuggestions] Ошибка при получении подсказок:", error);
    setSuggestions([]);
    setShowSuggestions(false);
  } finally {
    setIsLoading(false);
    console.log('✅ [fetchSuggestions] Загрузка завершена');
  }
};

/**
 * Рассчитывает маршрут между двумя точками
 */
export const calculateRoute = async (
  fromCoordinates: [number, number],
  toCoordinates: [number, number]
): Promise<{ distance: number; duration: number } | null> => {
  console.log('🗺️ [calculateRoute] Расчёт маршрута');
  console.log('  Откуда:', fromCoordinates);
  console.log('  Куда:', toCoordinates);

  return new Promise((resolve) => {
    if (typeof window === "undefined" || !(window as any).ymaps) {
      console.error("❌ [calculateRoute] Яндекс.Карты не загружены");
      resolve(null);
      return;
    }

    console.log('⏳ [calculateRoute] Инициализация Яндекс.Карт...');

    (window as any).ymaps.ready(() => {
      console.log('✅ [calculateRoute] Яндекс.Карты готовы');
      
      const multiRoute = new (window as any).ymaps.multiRouter.MultiRoute(
        {
          referencePoints: [fromCoordinates, toCoordinates],
          params: { routingMode: "auto" },
        },
        { boundsAutoApply: true }
      );

      multiRoute.model.events.add("requestsuccess", () => {
        console.log('✅ [calculateRoute] Маршрут успешно рассчитан');
        
        const activeRoute = multiRoute.getActiveRoute();
        if (activeRoute) {
          const distanceMeters = activeRoute.properties.get("distance").value;
          const durationSeconds = activeRoute.properties.get("duration").value;

          const distanceKm = Math.round(distanceMeters / 1000);
          const durationHours = Math.round(durationSeconds / 3600);

          console.log('📊 [calculateRoute] Результаты:');
          console.log('  Расстояние:', distanceMeters, 'м (', distanceKm, 'км)');
          console.log('  Время в пути:', durationSeconds, 'с (', durationHours, 'ч)');

          // Возвращаем расстояние в метрах, а не в километрах!
          resolve({ distance: distanceMeters, duration: durationSeconds });
        } else {
          console.error("❌ [calculateRoute] Активный маршрут не найден");
          resolve(null);
        }
      });

      multiRoute.model.events.add("requesterror", (error: any) => {
        console.error("❌ [calculateRoute] Ошибка при расчёте маршрута:", error);
        resolve(null);
      });
    });
  });
};

/**
 * Загружает скрипт Яндекс.Карт (если ещё не загружен)
 */
export const loadYandexMapsScript = (): Promise<void> => {
  console.log('📦 [loadYandexMapsScript] Проверка загрузки скрипта Яндекс.Карт');
  
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      console.error("❌ [loadYandexMapsScript] Window не определён (SSR?)");
      reject(new Error("Window is not defined"));
      return;
    }

    if ((window as any).ymaps) {
      console.log('✅ [loadYandexMapsScript] Скрипт уже загружен');
      resolve();
      return;
    }

    console.log('⏳ [loadYandexMapsScript] Загрузка скрипта...');

    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_API_KEY}&lang=ru_RU`;
    script.async = true;
    
    script.onload = () => {
      console.log('✅ [loadYandexMapsScript] Скрипт успешно загружен');
      resolve();
    };
    
    script.onerror = (error) => {
      console.error("❌ [loadYandexMapsScript] Ошибка загрузки скрипта:", error);
      reject(error);
    };
    
    document.head.appendChild(script);
  });
};

console.log('✅ [YandexMaps] Модуль Яндекс.Карт загружен');

