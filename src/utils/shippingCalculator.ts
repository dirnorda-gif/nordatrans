// src/utils/shippingCalculator.ts

// ==================== ТИПЫ ====================
interface TariffConfig {
  fromMoscow: { [city: string]: string };
  toMoscow: { [city: string]: string };
}

interface WeightCoefficients {
  fromMoscow: {
    "10т": number;
    "5т": number;
    "3т": number;
    "1.5т": number;
    "500кг": number;
  };
  toMoscow: {
    "10т": number;
    "5т": number;
    "3т": number;
    "1.5т": number;
    "500кг": number;
  };
}

type TruckCapacity = "20т" | "10т" | "5т" | "3т" | "1.5т" | "500кг";

interface CalculationResult {
  cost: number;
  costPerKm: number;
  truckCapacity: TruckCapacity;
  details: {
    direction: string;
    weightCategory: TruckCapacity;
    volumeCategory: TruckCapacity;
    finalCategory: TruckCapacity;
    distance: number;
    ratePerKm: number;
    cityUsed?: string;
    calculatedCost?: number;
    minimumApplied?: boolean;
  };
}

// ==================== КОНСТАНТЫ ====================
const MINIMUM_COST = 7500; // Минимальная стоимость перевозки

// ==================== РЕАЛЬНЫЕ ТАРИФЫ ====================
const tariffConfig: TariffConfig = {
  fromMoscow: {
    "Тула": "153.9/124.0/99.0/0/66.2/0",
    "Владимир": "143.0/85.0/0/0/0/0",
    "Калуга": "133.8/116.9/0/0/83.7/0",
    "Ярославль": "132.0/90.9/83.2/0/56.7/0",
    "Тверь": "128.0/103.9/112.3/0/56.5/0",
    "Рязань": "118.2/99.0/101.5/0/59.1/0",
    "Вязьма": "114.2/0/0/0/0/0",
    "Нижний Новгород": "106.0/72.3/51.8/0/38.1/0",
    "Чебоксары": "101.8/0/0/0/0/0",
    "Великий Новгород": "98.4/71.4/0/0/0/0",
    "Тамбов": "95.5/0/0/0/0/0",
    "Санкт-Петербург": "94.5/72.9/53.8/0/33.9/0",
    "Краснодар": "95.2/72.5/57.5/0/0/0",
    "Ростов-на-Дону": "99.0/68.0/58.9/0/34.7/0",
    "Казань": "89.0/71.1/50.8/0/36.8/0",
    "Воронеж": "88.9/79.5/60.6/0/39.3/0",
    "Волгоград": "89.1/69.3/58.9/0/0/0",
    "Ставрополь": "86.9/0/0/0/0/0",
    "Смоленск": "73.7/58.7/0/0/0/0",
    "Вологда": "82.0/86.0/0/0/0/0",
    "Петрозаводск": "82.0/0/0/0/0/0",
    "Набережные Челны": "83.5/71.3/0/0/0/0",
    "Уфа": "81.2/59.6/0/0/0/0",
    "Самара": "77.6/65.5/48.4/0/35.2/0",
    "Саратов": "80.4/65.8/48.6/0/0/0",
    "Оренбург": "84.7/54.0/0/0/0/0",
    "Пермь": "77.9/70.1/0/0/0/0",
    "Екатеринбург": "74.0/62.8/51.9/0/35.5/0",
    "Челябинск": "81.0/49.2/0/0/0/0",
    "Тюмень": "74.5/0/0/0/0/0",
    "Новосибирск": "73.8/65.1/0/0/0/0",
    "Красноярск": "70.0/0/0/0/0/0",
    "Иркутск": "66.5/0/0/0/0/0",
    "Благовещенск": "57.2/0/0/0/0/0",
    "Хабаровск": "57.6/0/0/0/0/0",
    "Владивосток": "56.6/0/0/0/0/0"
  },
  toMoscow: {
    "Тула": "164.1/125.3/87.3/0/65/0",
    "Рязань": "170.1/144.6/90.1/0/56.7/0",
    "Калуга": "153.6/135.5/0/0/0/0",
    "Владимир": "140.2/96.0/80.9/0/65.1/0",
    "Тверь": "139.5/106.1/96.3/0/57.1/40.6",
    "Вязьма": "145.4/0/0/0/0/0",
    "Ярославль": "105.7/72.4/72.1/0/43.4/0",
    "Тамбов": "89.7/0/0/0/0/0",
    "Вологда": "92.8/56.1/0/0/0/0",
    "Смоленск": "92.6/68.3/55.7/0/0/0",
    "Воронеж": "78.5/63.7/31.1/0/31/0",
    "Нижний Новгород": "92.1/61.1/50.6/0/35.3/17.3",
    "Чебоксары": "67.8/0/0/0/0/0",
    "Великий Новгород": "64.7/0/0/0/0/0",
    "Санкт-Петербург": "55.6/48.3/37.3/0/29.3/10.9",
    "Петрозаводск": "54.8/0/0/0/0/0",
    "Казань": "56.4/49.4/41.3/0/23.5/9",
    "Набережные Челны": "55.3/0/0/0/0/0",
    "Уфа": "44.7/36.3/0/0/0/0",
    "Самара": "50.1/64.0/31.2/0/0/0",
    "Саратов": "58.2/44.9/39.7/0/0/0",
    "Оренбург": "36.8/0/0/0/0/0",
    "Волгоград": "59.7/37.1/0/0/0/7.71",
    "Ростов-на-Дону": "35.4/42.0/22.9/0/0/7",
    "Краснодар": "35.6/37.6/26.3/0/14.7/5.7",
    "Ставрополь": "39.6/34.8/0/0/0/0",
    "Пермь": "46.9/0/0/0/0/0",
    "Екатеринбург": "38.9/39.3/27.1/0/19.6/0",
    "Челябинск": "43.5/44.1/0/0/0/0",
    "Тюмень": "38.1/0/0/0/0/0",
    "Новосибирск": "31.5/33.7/0/0/0/0",
    "Красноярск": "33.3/0/0/0/0/0",
    "Иркутск": "37.7/0/0/0/0/0",
    "Благовещенск": "60.4/0/0/0/0/0",
    "Хабаровск": "48.8/0/0/0/0/0",
    "Владивосток": "60.6/69.7/0/0/0/0"
  }
};

// ==================== РЕАЛЬНЫЕ КОЭФФИЦИЕНТЫ ====================
// Коэффициенты для расчета отсутствующих тарифов относительно 20т
// Формула: Тариф = Тариф_20т * Коэффициент

const weightCoefficients: WeightCoefficients = {
  toMoscow: {
    "10т": 0.76,
    "5т": 0.71,
    "3т": 0.31,
    "1.5т": 0.21,
    "500кг": 0.14
  },
  fromMoscow: {
    "10т": 0.81,   // +7% от "В Москву" (0.76 * 1.07)
    "5т": 0.76,    // +7% от "В Москву" (0.71 * 1.07)
    "3т": 0.33,    // +7% от "В Москву" (0.31 * 1.07)
    "1.5т": 0.22,  // +7% от "В Москву" (0.21 * 1.07)
    "500кг": 0.15  // +7% от "В Москву" (0.14 * 1.07)
  }
};

// ==================== ОПРЕДЕЛЕНИЕ КАТЕГОРИЙ ====================

/**
 * Определяет грузоподъемность машины по весу груза
 */
const getWeightCategory = (weightKg: number): TruckCapacity => {
  if (weightKg <= 500) return "500кг";
  if (weightKg <= 1500) return "1.5т";
  if (weightKg <= 3000) return "3т";
  if (weightKg <= 5000) return "5т";
  if (weightKg <= 10000) return "10т";
  return "20т";
};

/**
 * Определяет грузоподъемность машины по объему груза
 */
const getVolumeCategory = (volumeM3: number): TruckCapacity => {
  if (volumeM3 >= 46) return "20т";   // 46-82 м³
  if (volumeM3 >= 30) return "10т";   // 30-45 м³
  if (volumeM3 >= 15) return "5т";    // 15-30 м³
  if (volumeM3 >= 9) return "3т";     // 9-15 м³
  if (volumeM3 >= 6) return "1.5т";   // 6-9 м³
  
  // Для объемов 1-6 м³ используем интерполяцию
  if (volumeM3 >= 4) return "1.5т";   // 4-6 м³ → 1.5т
  if (volumeM3 >= 2.5) return "1.5т"; // 2.5-4 м³ → 1.5т
  return "500кг";                     // 1-2.5 м³ → 500кг
};

/**
 * Определяет приоритет категории (для сравнения)
 */
const getCategoryWeight = (category: TruckCapacity): number => {
  const weights: Record<TruckCapacity, number> = {
    "500кг": 1,
    "1.5т": 2,
    "3т": 3,
    "5т": 4,
    "10т": 5,
    "20т": 6
  };
  return weights[category];
};

/**
 * Определяет итоговую категорию машины (максимум из веса и объема)
 */
const getFinalCategory = (weightKg: number, volumeM3: number): {
  weightCategory: TruckCapacity;
  volumeCategory: TruckCapacity;
  finalCategory: TruckCapacity;
} => {
  const weightCategory = getWeightCategory(weightKg);
  const volumeCategory = getVolumeCategory(volumeM3);
  
  // Берем максимальную категорию (решает проблему "тонна пуха")
  const finalCategory = getCategoryWeight(weightCategory) > getCategoryWeight(volumeCategory)
    ? weightCategory
    : volumeCategory;
  
  return { weightCategory, volumeCategory, finalCategory };
};

// ==================== РАСЧЕТ СТОИМОСТИ ====================

/**
 * Нормализует название города
 */
const normalizeCityName = (city: string): string => {
  return city.trim().replace(/\s+/g, " ");
};

/**
 * Находит город в базе тарифов (с нечетким поиском)
 */
const findCityInTariffs = (city: string, direction: "fromMoscow" | "toMoscow"): string | null => {
  const normalizedCity = normalizeCityName(city).toLowerCase();
  const cities = Object.keys(tariffConfig[direction]);
  
  // Точное совпадение
  for (const tariffCity of cities) {
    if (tariffCity.toLowerCase() === normalizedCity) {
      return tariffCity;
    }
  }
  
  // Частичное совпадение
  for (const tariffCity of cities) {
    if (tariffCity.toLowerCase().includes(normalizedCity) || 
        normalizedCity.includes(tariffCity.toLowerCase())) {
      return tariffCity;
    }
  }
  
  return null;
};

/**
 * Получает стоимость за километр
 */
const getCostPerKm = (
  city: string,
  direction: "fromMoscow" | "toMoscow",
  category: TruckCapacity
): number => {
  const foundCity = findCityInTariffs(city, direction);
  
  if (!foundCity) {
    console.warn(`Город "${city}" не найден в базе тарифов`);
    return 0;
  }
  
  const tariffString = tariffConfig[direction][foundCity];
  
  // Парсим: "153.9/124.0/99.0/0/66.2/0"
  const [t20, t10, t5, t3, t15, t500] = tariffString.split("/").map(parseFloat);
  
  const tariffs: Record<TruckCapacity, number> = {
    "20т": t20,
    "10т": t10,
    "5т": t5,
    "3т": t3,
    "1.5т": t15,
    "500кг": t500
  };
  
  let costPerKm = tariffs[category];
  
  // Если тариф отсутствует (0), рассчитываем через коэффициент от 20т
  if (!costPerKm || costPerKm === 0) {
    const base20tRate = tariffs["20т"];
    
    if (category !== "20т" && base20tRate > 0) {
      const coefficient = weightCoefficients[direction][category];
      costPerKm = base20tRate * coefficient;
    } else {
      costPerKm = base20tRate;
    }
  }
  
  return costPerKm;
};

/**
 * ГЛАВНАЯ ФУНКЦИЯ: Расчет стоимости перевозки
 */
export const calculateShippingCost = (
  fromCity: string,
  toCity: string,
  distanceKm: number,
  weightKg: number,
  volumeM3: number
): CalculationResult | null => {
  
  if (!fromCity || !toCity || !distanceKm) {
    return null;
  }
  
  // Определяем направление
  const isMoscowOrigin = fromCity.toLowerCase().includes("москва") || fromCity.toLowerCase() === "москва";
  const isMoscowDestination = toCity.toLowerCase().includes("москва") || toCity.toLowerCase() === "москва";
  
  let direction: "fromMoscow" | "toMoscow" | "city-to-city";
  let targetCity: string;
  let directionLabel: string;
  
  if (isMoscowOrigin && !isMoscowDestination) {
    direction = "fromMoscow";
    targetCity = toCity;
    directionLabel = "Из Москвы";
  } else if (!isMoscowOrigin && isMoscowDestination) {
    direction = "toMoscow";
    targetCity = fromCity;
    directionLabel = "В Москву";
  } else {
    // Маршрут город-город: среднее между направлениями
    direction = "city-to-city";
    directionLabel = "Город-Город";
    
    const categories = getFinalCategory(weightKg, volumeM3);
    
    // Получаем тарифы для обоих городов
    const cost1From = getCostPerKm(fromCity, "fromMoscow", categories.finalCategory);
    const cost1To = getCostPerKm(fromCity, "toMoscow", categories.finalCategory);
    const cost2From = getCostPerKm(toCity, "fromMoscow", categories.finalCategory);
    const cost2To = getCostPerKm(toCity, "toMoscow", categories.finalCategory);
    
    // Среднее значение
    const validCosts = [cost1From, cost1To, cost2From, cost2To].filter(c => c > 0);
    const avgCostPerKm = validCosts.length > 0 
      ? validCosts.reduce((a, b) => a + b, 0) / validCosts.length 
      : 0;
    
    if (!avgCostPerKm || avgCostPerKm === 0) {
      console.warn("Не удалось рассчитать среднюю стоимость для маршрута город-город");
      return null;
    }
    
    const calculatedCost = Math.round(avgCostPerKm * distanceKm);
    const finalCost = Math.max(calculatedCost, MINIMUM_COST);
    const wasMinimumApplied = finalCost !== calculatedCost;
    
    return {
      cost: finalCost,
      costPerKm: avgCostPerKm,
      truckCapacity: categories.finalCategory,
      details: {
        direction: directionLabel,
        weightCategory: categories.weightCategory,
        volumeCategory: categories.volumeCategory,
        finalCategory: categories.finalCategory,
        distance: distanceKm,
        ratePerKm: avgCostPerKm,
        calculatedCost: calculatedCost,
        minimumApplied: wasMinimumApplied
      }
    };
  }
  
  // Определяем категорию машины
  const categories = getFinalCategory(weightKg, volumeM3);
  
  // Получаем стоимость за км
  const costPerKm = getCostPerKm(targetCity, direction, categories.finalCategory);
  
  if (!costPerKm || costPerKm === 0) {
    console.warn(`Не удалось получить тариф для города ${targetCity}`);
    return null;
  }
  
  // Рассчитываем стоимость
  const calculatedCost = Math.round(costPerKm * distanceKm);
  
  // Применяем минимальную стоимость
  const finalCost = Math.max(calculatedCost, MINIMUM_COST);
  const wasMinimumApplied = finalCost !== calculatedCost;
  
  const foundCity = findCityInTariffs(targetCity, direction);
  
  return {
    cost: finalCost,
    costPerKm: costPerKm,
    truckCapacity: categories.finalCategory,
    details: {
      direction: directionLabel,
      weightCategory: categories.weightCategory,
      volumeCategory: categories.volumeCategory,
      finalCategory: categories.finalCategory,
      distance: distanceKm,
      ratePerKm: costPerKm,
      cityUsed: foundCity || undefined,
      calculatedCost: calculatedCost,
      minimumApplied: wasMinimumApplied
    }
  };
};

/**
 * Форматирует категорию для отображения
 */
export const formatTruckCapacity = (capacity: TruckCapacity): string => {
  const labels: Record<TruckCapacity, string> = {
    "500кг": "до 500 кг",
    "1.5т": "1,5 тонны",
    "3т": "3 тонны",
    "5т": "5 тонн",
    "10т": "10 тонн",
    "20т": "20 тонн"
  };
  return labels[capacity];
};

