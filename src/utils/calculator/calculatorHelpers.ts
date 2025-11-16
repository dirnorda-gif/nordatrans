// src/utils/calculator/calculatorHelpers.ts
// Вспомогательные функции для калькулятора

import { TRUCK_INFO } from "./constants";

console.log('📦 [CalculatorHelpers] Загрузка вспомогательных функций');

/**
 * Получает информацию о грузовике по объёму груза
 */
export const getTruckInfoByVolume = (volume: number) => {
  console.log('🚚 [getTruckInfoByVolume] Подбор грузовика для объёма:', volume, 'м³');
  
  let truckInfo;
  
  if (volume <= 6) {
    truckInfo = TRUCK_INFO.porter;
  } else if (volume <= 9) {
    truckInfo = TRUCK_INFO.gazelle;
  } else if (volume <= 15) {
    truckInfo = TRUCK_INFO["3ton"];
  } else if (volume <= 30) {
    truckInfo = TRUCK_INFO["5ton"];
  } else if (volume <= 45) {
    truckInfo = TRUCK_INFO["10ton"];
  } else {
    truckInfo = TRUCK_INFO["20ton"];
  }
  
  console.log('✅ [getTruckInfoByVolume] Подобран грузовик:', truckInfo.name);
  
  return truckInfo;
};

/**
 * Находит ближайший индекс в массиве шагов
 */
export const findClosestVolumeIndex = (
  targetVolume: number,
  steps: number[]
): number => {
  console.log('🔍 [findClosestVolumeIndex] Поиск ближайшего индекса для объёма:', targetVolume);
  
  if (targetVolume <= steps[0]) {
    console.log('✅ [findClosestVolumeIndex] Объём меньше минимального, возврат индекса 0');
    return 0;
  }
  
  if (targetVolume >= steps[steps.length - 1]) {
    console.log('✅ [findClosestVolumeIndex] Объём больше максимального, возврат последнего индекса:', steps.length - 1);
    return steps.length - 1;
  }
  
  let closestIndex = 0;
  let minDiff = Math.abs(steps[0] - targetVolume);
  
  for (let i = 1; i < steps.length; i++) {
    const diff = Math.abs(steps[i] - targetVolume);
    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = i;
    }
  }
  
  console.log('✅ [findClosestVolumeIndex] Найден ближайший индекс:', closestIndex, '(значение:', steps[closestIndex], 'м³)');
  
  return closestIndex;
};

/**
 * Форматирует объём для отображения
 */
export const formatVolume = (volume: number): string => {
  return `${volume} м³`;
};

/**
 * Форматирует вес для отображения
 */
export const formatWeight = (weight: number): string => {
  if (weight >= 1000) {
    return `${(weight / 1000).toFixed(1)} т`;
  }
  return `${weight} кг`;
};

/**
 * Нормализует название города (убирает "Россия, " и региональные суффиксы)
 */
export const normalizeCityName = (city: string): string => {
  console.log('🏙️ [normalizeCityName] Нормализация города:', city);
  
  let normalized = city.trim().replace(/\s+/g, " ");
  
  // Убираем префикс "Россия, " если есть
  normalized = normalized.replace(/^Россия,\s*/i, "");
  
  // Разбиваем по запятым и берем последнюю часть (обычно это название города)
  const parts = normalized.split(",").map(p => p.trim());
  
  // Если есть несколько частей, берем последнюю (название города)
  if (parts.length > 1) {
    normalized = parts[parts.length - 1];
  }
  
  // Убираем региональные суффиксы
  normalized = normalized.replace(/\s+(область|край|республика|АО|округ)$/i, "");
  
  const result = normalized.trim();
  console.log('✅ [normalizeCityName] Результат нормализации:', result);
  
  return result;
};

/**
 * Рассчитывает срок доставки в днях на основе расстояния
 * Формула: 1 день на каждые 800 км (минимум 1 день)
 */
export const calculateDeliveryDays = (distanceKm: number): number => {
  console.log('📅 [calculateDeliveryDays] Расчёт срока доставки для расстояния:', distanceKm, 'км');
  
  const days = Math.max(1, Math.ceil(distanceKm / 800));
  
  console.log('✅ [calculateDeliveryDays] Срок доставки:', days, 'дней');
  
  return days;
};

/**
 * Форматирует срок доставки с правильным склонением слова "день"
 */
export const formatDeliveryDays = (days: number): string => {
  if (days === 1) return `${days} день`;
  if (days >= 2 && days <= 4) return `${days} дня`;
  return `${days} дней`;
};

console.log('✅ [CalculatorHelpers] Вспомогательные функции загружены');

