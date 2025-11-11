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

// 🆕 Вместимость машин (для пропорционального расчета)
// Вместимость рассчитывается по формуле: вес_машины / 250 кг (где 250 кг = 1 м³)
const TRUCK_CAPACITY_M3: Record<TruckCapacity, number> = {
  "20т": 80,   // 20-тонная фура (20000 кг / 250 = 80 м³, округлено)
  "10т": 40,   // 10-тонник (10000 кг / 250 = 40 м³)
  "5т": 20,    // 5-тонник (5000 кг / 250 = 20 м³)
  "3т": 12,    // 3-тонник (3000 кг / 250 = 12 м³)
  "1.5т": 6,   // Газель (1500 кг / 250 = 6 м³)
  "500кг": 2   // Малый фургон (500 кг / 250 = 2 м³)
};

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
    // 🆕 Поля для коммерческой логики
    isCommercialCalculation?: boolean;
    loadFactor?: number;           // Коэффициент загрузки (0-1)
    loadPercentage?: number;        // Процент загрузки фуры
    weightRatio?: number;           // Доля по весу
    volumeRatio?: number;           // Доля по объему
    // 🆕 Поля для малых грузов (≤ 6 м³)
    isSmallCargo?: boolean;        // Признак малого груза
    podacha?: number;              // Стоимость подачи
    costPerM3?: number;            // Стоимость за 1 м³
    fullGazelleCost?: number;      // Стоимость полной Газели
  };
}

// ==================== ВЕРСИОНИРОВАНИЕ ТАРИФОВ ====================
/**
 * Версия тарифной сетки
 * ВАЖНО: При изменении тарифов в tariffConfig ОБЯЗАТЕЛЬНО увеличить эту версию!
 * Это обеспечит автоматическое обнаружение несоответствия с routeCache.json
 * 
 * 🆕 ИЗМЕНЕНИЕ v1.3.2 (04.11.2025):
 * - ИСПРАВЛЕНИЕ ЛОГИКИ ДЛЯ МАРШРУТОВ ГОРОД-ГОРОД
 * - Теперь используется ТОЛЬКО тариф "Москва → город назначения" (fromMoscow для toCity)
 * - Ранее ошибочно усреднялись все 4 тарифа (fromMoscow и toMoscow для обоих городов)
 * - Новая логика проще, безопаснее для бизнеса и соответствует требованиям
 * - Цены для город-город теперь выше и корректнее
 * 
 * v1.3.1 (03.11.2025):
 * - АВТОМАТИЧЕСКИЙ ПОИСК БЛИЖАЙШЕГО ГОРОДА для городов отсутствующих в базе тарифов
 * - Использует координаты Яндекс.Карт для определения географически ближайшего города
 * - ВСЕГДА применяет тариф "Из Москвы" (fromMoscow) для ближайшего города (выше, безопаснее)
 * - Работает для всех типов маршрутов: Москва-Город, Город-Москва, Город-Город
 * - Решает проблему с городами типа "Новый Уренгой", "Сургут" и другими
 * - База координат: 80+ крупнейших городов России
 * 
 * v1.3.0 (03.11.2025):
 * - ЛИНЕЙНАЯ ИНТЕРПОЛЯЦИЯ для отсутствующих тарифов внутри диапазона 20т-1.5т
 * - Вместо фиксированных коэффициентов используется интерполяция между реальными соседними тарифами
 * - Для 500кг по-прежнему используется коэффициент (нет нижней точки)
 * - Устраняет большинство аномалий типа "1.5т дороже 3т"
 * - Автоматически адаптируется к изменениям тарифов
 * - Учитывает специфику каждого конкретного маршрута
 * 
 * v1.2.0 (03.11.2025):
 * - СЕГМЕНТНАЯ ИНТЕРПОЛЯЦИЯ между реперными точками для грузов >6 м³
 * - Реперные точки: 6, 12, 20, 40, 80 м³ (стоимость полных машин)
 * - Между точками: линейная интерполяция (плавный рост цены)
 * - Гарантируется 100% совпадение всех реперных точек с аккордеоном
 */
export const TARIFF_VERSION = "1.3.2";
export const TARIFF_UPDATED_AT = "2025-11-04";

// ==================== КОНСТАНТЫ ====================
const MINIMUM_COST = 7500; // Минимальная стоимость перевозки
// Палетная модель (для дальнейших расчётов и проверок)
export const PALLET_VOLUME_M3 = 2;            // 1 палета = 2 м³ (стандартный объем европалеты)
export const GAZELLE_PALLET_CAPACITY = 4;     // 1.5т машина = 4 палеты (реальная вместимость)
// Коэффициент пересчета веса в объем для логистического расчета
const WEIGHT_TO_VOLUME_RATIO = 250;           // 250 кг = 1 м³
// Стоимость подачи автомобиля (применяется только для грузов ≤ 6 м³)
// TODO: Калибровать по реальным данным для маршрута Москва-СПб
const PODACHA = 4000;                         // Стоимость подачи автомобиля
// Максимальный объем для применения логики с podacha
const MAX_VOLUME_FOR_PODACHA = 6;            // Применяем podacha для грузов до 6 м³ (1.5т)

// Вместимость по палетам и предельный вес по категориям
// РЕАЛЬНАЯ вместимость машин (с учетом практики погрузки)
const PALLET_CAPACITY_BY_TRUCK: Record<Exclude<TruckCapacity, "500кг">, number> = {
  "1.5т": 4,   // Газель: 4 палеты (6 м³, плотная укладка)
  "3т": 6,     // 3т машина: 6 палет (12 м³)
  "5т": 10,    // 5т машина: 10 палет (20 м³)
  "10т": 20,   // 10т машина: 20 палет (40 м³)
  "20т": 33    // 20т фура: 33 палеты (82 м³, с учетом зазоров)
};

const MAX_WEIGHT_BY_TRUCK_KG: Record<Exclude<TruckCapacity, "500кг">, number> = {
  "1.5т": 1500,
  "3т": 3000,
  "5т": 5000,
  "10т": 10000,
  "20т": 20000
};

/**
 * Определяет категорию машины по количеству палет и весу
 */
const pickTruckByPalletsAndWeight = (pallets: number, totalWeightKg: number): Exclude<TruckCapacity, "500кг"> => {
  const order: Array<Exclude<TruckCapacity, "500кг">> = ["1.5т", "3т", "5т", "10т", "20т"];
  for (const cat of order) {
    const cap = PALLET_CAPACITY_BY_TRUCK[cat];
    const maxW = MAX_WEIGHT_BY_TRUCK_KG[cat];
    if (pallets <= cap && totalWeightKg <= maxW) return cat;
  }
  return "20т"; // запасной вариант
};

/**
 * Расчет стоимости по палетной логике (новая логика: цена палеты от полной 20т фуры)
 * Определяем сколько палет поместится в 20т фуру (минимум по объему и весу)
 * Стоимость полной 20т фуры / количество палет = цена одной палеты
 * Итоговая стоимость = количество палет * цена палеты (минимум 7500 ₽)
 */
const calculatePalletBasedCost = (
  fromOrToCity: string,
  direction: "fromMoscow" | "toMoscow",
  distanceKm: number,
  weightKg: number,
  volumeM3: number
) => {
  // Определяем параметры одной палеты
  // Логистический объем: берем максимум из фактического объема и объема, рассчитанного по весу
  // 250 кг = 1 м³
  const logisticVolume = Math.max(volumeM3, weightKg / WEIGHT_TO_VOLUME_RATIO);
  const numberOfPallets = Math.max(1, Math.ceil(logisticVolume / PALLET_VOLUME_M3));
  const palletVolumeM3 = PALLET_VOLUME_M3; // 2 м³ на палету
  const palletWeightKg = weightKg > 0 ? weightKg / numberOfPallets : 0; // Вес одной палеты
  
  // Получаем тариф для 20т фуры
  const costPerKm20t = getCostPerKm(fromOrToCity, direction, "20т");
  if (!costPerKm20t || costPerKm20t === 0) return null;
  
  // Параметры 20т фуры
  const TRUCK_20T_VOLUME_M3 = TRUCK_CAPACITY_M3["20т"]; // 80 м³ (20000 кг / 250 = 80 м³)
  const TRUCK_20T_WEIGHT_KG = 20000; // 20 тонн = 20000 кг
  
  // Сколько палет поместится в 20т фуру?
  // По объёму: floor(80 / объём_палеты)
  // По весу: floor(20000 / вес_палеты) - только если вес указан
  // Берём минимум (что ограничивает раньше)
  const palletsByVolume = Math.floor(TRUCK_20T_VOLUME_M3 / palletVolumeM3);
  const palletsByWeight = palletWeightKg > 0 
    ? Math.floor(TRUCK_20T_WEIGHT_KG / palletWeightKg) 
    : Infinity; // Если вес не указан, ограничение только по объёму
  const palletsPerFullTruck = Math.min(palletsByVolume, palletsByWeight);
  
  // Стоимость полной 20т фуры на этом маршруте
  const fullTruckCost = Math.round(costPerKm20t * distanceKm);
  
  // Цена одной палеты
  const pricePerPallet = fullTruckCost / palletsPerFullTruck;
  
  // Итоговая стоимость = количество палет * цена палеты (минимум 7500 ₽)
  const calculatedCost = Math.round(numberOfPallets * pricePerPallet);
  const finalCost = Math.max(calculatedCost, MINIMUM_COST);
  
  // Определяем категорию по итоговому количеству палет (для совместимости)
  const truckCategory = pickTruckByPalletsAndWeight(numberOfPallets, weightKg);
  
  return { 
    cost: finalCost, 
    category: truckCategory as TruckCapacity, 
    ratePerKm: costPerKm20t, 
    pallets: numberOfPallets, 
    palletsCapacity: palletsPerFullTruck, 
    isFull: numberOfPallets >= palletsPerFullTruck 
  };
};

// ==================== РЕАЛЬНЫЕ ТАРИФЫ ====================
// ⚠️ ВАЖНО: При изменении ЛЮБОГО тарифа в tariffConfig ОБЯЗАТЕЛЬНО:
// 1. Увеличить TARIFF_VERSION выше
// 2. Обновить TARIFF_UPDATED_AT
// 3. Обновить routeCache.json с новыми ценами и установить tariffVersion
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
    "Санкт-Петербург": "94.5/72.9/53.8/40.3/33.9/0",
    "Краснодар": "95.2/72.5/57.5/0/0/0",
    "Ростов-на-Дону": "99.0/68.0/58.9/46.9/34.7/0",
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

// ==================== КООРДИНАТЫ ГОРОДОВ ====================
// Координаты центров городов для поиска ближайшего города
interface CityCoordinates {
  [city: string]: [number, number]; // [latitude, longitude]
}

const cityCoordinates: CityCoordinates = {
  "Москва": [55.7558, 37.6173],
  "Санкт-Петербург": [59.9343, 30.3351],
  "Новосибирск": [55.0084, 82.9357],
  "Екатеринбург": [56.8389, 60.6057],
  "Казань": [55.8304, 49.0661],
  "Нижний Новгород": [56.2965, 43.9361],
  "Челябинск": [55.1644, 61.4368],
  "Самара": [53.1959, 50.1002],
  "Омск": [54.9885, 73.3242],
  "Ростов-на-Дону": [47.2357, 39.7015],
  "Уфа": [54.7388, 55.9721],
  "Красноярск": [56.0153, 92.8932],
  "Воронеж": [51.6605, 39.2005],
  "Пермь": [58.0105, 56.2502],
  "Волгоград": [48.7080, 44.5133],
  "Краснодар": [45.0355, 38.9753],
  "Саратов": [51.5924, 46.0348],
  "Тюмень": [57.1530, 65.5343],
  "Тольятти": [53.5303, 49.3461],
  "Ижевск": [56.8519, 53.2048],
  "Барнаул": [53.3481, 83.7799],
  "Ульяновск": [54.3142, 48.4031],
  "Иркутск": [52.2869, 104.3050],
  "Хабаровск": [48.4827, 135.0838],
  "Ярославль": [57.6261, 39.8845],
  "Владивосток": [43.1056, 131.8735],
  "Махачкала": [42.9849, 47.5047],
  "Томск": [56.4977, 84.9744],
  "Оренбург": [51.7727, 55.0988],
  "Кемерово": [55.3547, 86.0861],
  "Новокузнецк": [53.7577, 87.1360],
  "Рязань": [54.6269, 39.6916],
  "Набережные Челны": [55.7430, 52.3951],
  "Пенза": [53.1950, 45.0184],
  "Липецк": [52.6109, 39.5986],
  "Киров": [58.6035, 49.6680],
  "Чебоксары": [56.1439, 47.2489],
  "Калининград": [54.7065, 20.5110],
  "Тула": [54.1961, 37.6182],
  "Курск": [51.7303, 36.1929],
  "Ставрополь": [45.0428, 41.9734],
  "Сочи": [43.6028, 39.7342],
  "Улан-Удэ": [51.8272, 107.6063],
  "Тверь": [56.8587, 35.9176],
  "Магнитогорск": [53.4071, 58.9794],
  "Иваново": [56.9970, 40.9737],
  "Брянск": [53.2521, 34.3717],
  "Белгород": [50.5997, 36.5989],
  "Сургут": [61.2500, 73.3964],
  "Владимир": [56.1294, 40.4063],
  "Чита": [52.0330, 113.4995],
  "Нижний Тагил": [57.9197, 59.9650],
  "Архангельск": [64.5401, 40.5433],
  "Калуга": [54.5293, 36.2754],
  "Симферополь": [44.9572, 34.1108],
  "Смоленск": [54.7903, 32.0408],
  "Волжский": [48.7854, 44.7753],
  "Курган": [55.4500, 65.3333],
  "Орёл": [52.9651, 36.0785],
  "Череповец": [59.1303, 37.9089],
  "Владикавказ": [43.0231, 44.6820],
  "Вологда": [59.2239, 39.8843],
  "Мурманск": [68.9585, 33.0827],
  "Саранск": [54.1838, 45.1749],
  "Якутск": [62.0355, 129.6755],
  "Тамбов": [52.7213, 41.4520],
  "Петрозаводск": [61.7849, 34.3469],
  "Кострома": [57.7679, 40.9269],
  "Благовещенск": [50.2667, 127.5272],
  "Комсомольск-на-Амуре": [50.5497, 137.0062],
  "Стерлитамак": [53.6247, 55.9508],
  "Таганрог": [47.2362, 38.8969],
  "Йошкар-Ола": [56.6346, 47.8910],
  "Нижневартовск": [60.9344, 76.5531],
  "Братск": [56.1515, 101.6140],
  "Новороссийск": [44.7230, 37.7687],
  "Великий Новгород": [58.5218, 31.2755],
  "Вязьма": [55.2103, 34.2963],
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
 * 🆕 СЕГМЕНТНАЯ ИНТЕРПОЛЯЦИЯ между реперными точками (для грузов >6 м³)
 * Гарантирует плавный рост цены и 100% совпадение с реперными точками
 */
const calculateSegmentedCost = (
  volumeM3: number,
  weightKg: number,
  direction: "fromMoscow" | "toMoscow",
  targetCity: string,
  distanceKm: number
): { cost: number; category: TruckCapacity; details: any } | null => {
  
  // Рассчитываем реперные точки (стоимость полных машин)
  const referencePoints = [
    { 
      volume: 6, 
      category: "1.5т" as TruckCapacity,
      cost: getCostPerKm(targetCity, direction, "1.5т") * distanceKm 
    },
    { 
      volume: 12, 
      category: "3т" as TruckCapacity,
      cost: getCostPerKm(targetCity, direction, "3т") * distanceKm 
    },
    { 
      volume: 20, 
      category: "5т" as TruckCapacity,
      cost: getCostPerKm(targetCity, direction, "5т") * distanceKm 
    },
    { 
      volume: 40, 
      category: "10т" as TruckCapacity,
      cost: getCostPerKm(targetCity, direction, "10т") * distanceKm 
    },
    { 
      volume: 80, 
      category: "20т" as TruckCapacity,
      cost: getCostPerKm(targetCity, direction, "20т") * distanceKm 
    }
  ];
  
  // Проверка валидности реперных точек
  for (const point of referencePoints) {
    if (!point.cost || point.cost === 0) {
      console.warn(`Не удалось получить тариф для ${point.category}`);
      return null;
    }
  }
  
  // Находим сегмент, в который попадает груз
  for (let i = 0; i < referencePoints.length - 1; i++) {
    const p1 = referencePoints[i];
    const p2 = referencePoints[i + 1];
    
    if (volumeM3 <= p2.volume) {
      // Линейная интерполяция между двумя реперными точками
      const ratio = (volumeM3 - p1.volume) / (p2.volume - p1.volume);
      const calculatedCost = Math.round(p1.cost + (p2.cost - p1.cost) * ratio);
      const finalCost = Math.max(calculatedCost, MINIMUM_COST);
      
      // Определяем категорию машины для груза
      const categories = getFinalCategory(weightKg, volumeM3);
      
      return {
        cost: finalCost,
        category: categories.finalCategory,
        details: {
          costPerKm: p2.cost / distanceKm,
          calculatedCost,
          minimumApplied: finalCost !== calculatedCost,
          segmentStart: p1.volume,
          segmentEnd: p2.volume,
          interpolationRatio: ratio,
          referencePoint1: p1.cost,
          referencePoint2: p2.cost,
          isSegmentedCalculation: true
        }
      };
    }
  }
  
  // Для грузов >80 м³ - экстраполяция от последней точки
  const lastPoint = referencePoints[referencePoints.length - 1];
  const extraVolume = volumeM3 - lastPoint.volume;
  const costPerExtraM3 = (lastPoint.cost / lastPoint.volume) * 1.2; // +20% за превышение
  const calculatedCost = Math.round(lastPoint.cost + extraVolume * costPerExtraM3);
  const finalCost = Math.max(calculatedCost, MINIMUM_COST);
  
  const categories = getFinalCategory(weightKg, volumeM3);
  
  return {
    cost: finalCost,
    category: "20т",
    details: {
      costPerKm: lastPoint.cost / distanceKm,
      calculatedCost,
      minimumApplied: finalCost !== calculatedCost,
      isOverCapacity: true,
      extraVolume: extraVolume,
      isSegmentedCalculation: true
    }
  };
};

/**
 * 🆕 Расчет стоимости для малых грузов (≤ 6 м³) с применением podacha
 * Логика: podacha + (объем_груза × стоимость_1_м³)
 * Где стоимость_1_м³ = (стоимость_полной_газели - podacha) / 6
 * 
 * Это обеспечивает:
 * - Для полной газели (6 м³): podacha + (6 × ((полная_стоимость - podacha) / 6)) = полная_стоимость ✓
 * - Для малых грузов: podacha обеспечивает минимальную рентабельность
 */
const calculateSmallCargoCost = (
  volumeM3: number,
  weightKg: number,
  direction: "fromMoscow" | "toMoscow",
  targetCity: string,
  distanceKm: number
): { cost: number; category: TruckCapacity; details: any } | null => {
  
  // Получаем тариф для полной газели (1.5т)
  const costPerKmGazelle = getCostPerKm(targetCity, direction, "1.5т");
  
  if (!costPerKmGazelle || costPerKmGazelle === 0) {
    return null;
  }
  
  // Стоимость полной газели (6 м³) на этом маршруте
  const fullGazelleCost = costPerKmGazelle * distanceKm;
  
  // Вместимость газели (6 м³)
  const gazelleCapacity = TRUCK_CAPACITY_M3["1.5т"]; // 6 м³
  
  // Стоимость 1 м³ рассчитывается из стоимости полной машины БЕЗ podacha
  // Это гарантирует, что для полной машины итоговая стоимость = fullGazelleCost
  const costPerM3 = (fullGazelleCost - PODACHA) / gazelleCapacity;
  
  // Итоговая стоимость = podacha + (объем × стоимость_1_м³)
  const calculatedCost = Math.round(PODACHA + (volumeM3 * costPerM3));
  
  // Применяем минимум 7500₽
  const finalCost = Math.max(calculatedCost, MINIMUM_COST);
  
  // Определяем категорию машины
  const categories = getFinalCategory(weightKg, volumeM3);
  
  return {
    cost: finalCost,
    category: "1.5т", // Для малых грузов всегда используется газель
    details: {
      costPerKm: costPerKmGazelle,
      truckCapacity: gazelleCapacity,
      podacha: PODACHA,
      costPerM3: costPerM3,
      fullGazelleCost: fullGazelleCost,
      calculatedCost: calculatedCost,
      minimumApplied: finalCost !== calculatedCost,
      isSmallCargo: true,
      loadFactor: volumeM3 / gazelleCapacity,
      loadPercentage: (volumeM3 / gazelleCapacity) * 100,
      weightCategory: categories.weightCategory,
      volumeCategory: categories.volumeCategory,
      finalCategory: categories.finalCategory
    }
  };
};

/**
 * Нормализует название города
 */
const normalizeCityName = (city: string): string => {
  let normalized = city.trim().replace(/\s+/g, " ");
  
  // Убираем префикс "Россия, " если есть
  normalized = normalized.replace(/^Россия,\s*/i, "");
  
  // Разбиваем по запятым и берем последнюю часть (обычно это название города)
  const parts = normalized.split(",").map(p => p.trim());
  
  // Если есть несколько частей, берем последнюю (название города)
  if (parts.length > 1) {
    normalized = parts[parts.length - 1];
  }
  
  // Убираем региональные суффиксы, которые могут остаться
  normalized = normalized.replace(/\s+(область|край|республика|АО|округ)$/i, "");
  
  return normalized.trim();
};

/**
 * Вычисляет расстояние между двумя точками по формуле Haversine
 */
const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Радиус Земли в км
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Находит ближайший город из базы тарифов к заданным координатам
 * 🎯 ВСЕГДА использует направление "fromMoscow" (тарифы выше, безопаснее для бизнеса)
 */
const findNearestCity = (
  targetCoordinates: [number, number]
): string | null => {
  // 🔥 ВАЖНО: Всегда ищем в направлении fromMoscow
  const cities = Object.keys(tariffConfig.fromMoscow);
  let nearestCity: string | null = null;
  let minDistance = Infinity;
  
  for (const city of cities) {
    const coords = cityCoordinates[city];
    if (!coords) continue;
    
    const distance = calculateDistance(
      targetCoordinates[0], 
      targetCoordinates[1],
      coords[0],
      coords[1]
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  }
  
  if (nearestCity) {
    console.log(`🎯 Город не найден в базе тарифов. Использован ближайший: ${nearestCity} (расстояние: ${Math.round(minDistance)} км)`);
    console.log(`📊 Будет использован тариф: Москва → ${nearestCity}`);
  }
  
  return nearestCity;
};

/**
 * Находит город в базе тарифов (с нечетким поиском и поиском ближайшего)
 * 🆕 Если город не найден, ищет ближайший город из базы тарифов
 * 🎯 При поиске ближайшего ВСЕГДА используется направление "fromMoscow"
 */
const findCityInTariffs = (
  city: string, 
  direction: "fromMoscow" | "toMoscow",
  coordinates?: [number, number]
): string | null => {
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
  
  // 🆕 Если город не найден и есть координаты - ищем ближайший город
  // 🎯 ВАЖНО: При поиске ближайшего города direction игнорируется,
  //           всегда используется "fromMoscow" (тарифы выше)
  if (coordinates) {
    console.log(`⚠️ Город "${city}" не найден в базе тарифов. Поиск ближайшего города...`);
    return findNearestCity(coordinates);
  }
  
  return null;
};

/**
 * Получает стоимость за километр
 * 🆕 v1.3.0: Использует линейную интерполяцию для отсутствующих тарифов (10т, 5т, 3т, 1.5т)
 * 🆕 v1.3.1: При использовании ближайшего города ВСЕГДА берёт тариф fromMoscow
 * Для 500кг используется коэффициент
 */
const getCostPerKm = (
  city: string,
  direction: "fromMoscow" | "toMoscow",
  category: TruckCapacity,
  coordinates?: [number, number]
): number => {
  const foundCity = findCityInTariffs(city, direction, coordinates);
  
  if (!foundCity) {
    console.warn(`Город "${city}" не найден в базе тарифов`);
    return 0;
  }
  
  // 🎯 КРИТИЧЕСКИ ВАЖНО: Если город найден через координаты (ближайший),
  //    ВСЕГДА используем направление fromMoscow, даже если запрошено toMoscow
  const wasFoundByCoordinates = coordinates && city.toLowerCase() !== foundCity.toLowerCase();
  const effectiveDirection = wasFoundByCoordinates ? "fromMoscow" : direction;
  
  if (wasFoundByCoordinates) {
    console.log(`📊 Используется тариф: Москва → ${foundCity} (вместо ${direction === "toMoscow" ? "обратного" : "прямого"} направления)`);
  }
  
  const tariffString = tariffConfig[effectiveDirection][foundCity];
  
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
  
  // Если тариф отсутствует (0), применяем интерполяцию или коэффициент
  if (!costPerKm || costPerKm === 0) {
    const base20tRate = tariffs["20т"];
    
    if (category === "500кг") {
      // Для 500кг используем коэффициент от 20т
      const coefficient = weightCoefficients[effectiveDirection]["500кг"];
      costPerKm = base20tRate * coefficient;
    } else if (category !== "20т" && base20tRate > 0) {
      // Для 10т, 5т, 3т, 1.5т применяем линейную интерполяцию между соседними реальными тарифами
      costPerKm = interpolateTariff(tariffs, category, effectiveDirection);
    } else {
      costPerKm = base20tRate;
    }
  }
  
  return costPerKm;
};

/**
 * 🆕 Линейная интерполяция тарифа между соседними реальными значениями
 * Используется для категорий: 10т, 5т, 3т, 1.5т
 */
const interpolateTariff = (
  tariffs: Record<TruckCapacity, number>,
  targetCategory: TruckCapacity,
  direction: "fromMoscow" | "toMoscow"
): number => {
  // Порядок категорий и их веса в тоннах
  const categories: Array<{ cat: TruckCapacity; weight: number }> = [
    { cat: "20т", weight: 20 },
    { cat: "10т", weight: 10 },
    { cat: "5т", weight: 5 },
    { cat: "3т", weight: 3 },
    { cat: "1.5т", weight: 1.5 }
  ];
  
  const targetWeight = categories.find(c => c.cat === targetCategory)?.weight;
  if (!targetWeight) return 0;
  
  // Находим ближайшие реальные тарифы снизу и сверху
  let lowerCategory: { cat: TruckCapacity; weight: number; rate: number } | null = null;
  let upperCategory: { cat: TruckCapacity; weight: number; rate: number } | null = null;
  
  for (const { cat, weight } of categories) {
    const rate = tariffs[cat];
    
    if (rate > 0) { // Есть реальный тариф
      if (weight < targetWeight && (!lowerCategory || weight > lowerCategory.weight)) {
        lowerCategory = { cat, weight, rate };
      }
      if (weight > targetWeight && (!upperCategory || weight < upperCategory.weight)) {
        upperCategory = { cat, weight, rate };
      }
    }
  }
  
  // Если найдены обе соседние точки - интерполируем
  if (lowerCategory && upperCategory) {
    const ratio = (targetWeight - lowerCategory.weight) / (upperCategory.weight - lowerCategory.weight);
    const interpolated = lowerCategory.rate + (upperCategory.rate - lowerCategory.rate) * ratio;
    
    return interpolated;
  }
  
  // Если нет соседних точек - используем коэффициент от 20т (fallback)
  const base20tRate = tariffs["20т"];
  const coefficient = weightCoefficients[direction][targetCategory];
  return base20tRate * (coefficient || 0);
};

/**
 * ГЛАВНАЯ ФУНКЦИЯ: Расчет стоимости перевозки
 * 🆕 Использует пропорциональную логику для всех типов грузов
 * 🆕 v1.3.1: Поддержка автоматического поиска ближайшего города
 */
export const calculateShippingCost = (
  fromCity: string,
  toCity: string,
  distanceKm: number,
  weightKg: number,
  volumeM3: number,
  transportType?: string,
  fromCoordinates?: [number, number], // 🆕 Координаты города отправления
  toCoordinates?: [number, number]    // 🆕 Координаты города назначения
): CalculationResult | null => {
  
  if (!fromCity || !toCity || !distanceKm) {
    return null;
  }
  
  // Определяем направление (используем нормализацию для корректной проверки)
  const normalizedFromCity = normalizeCityName(fromCity).toLowerCase();
  const normalizedToCity = normalizeCityName(toCity).toLowerCase();
  
  const isMoscowOrigin = normalizedFromCity.includes("москва") || normalizedFromCity === "москва";
  const isMoscowDestination = normalizedToCity.includes("москва") || normalizedToCity === "москва";
  
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
  }
  
  // 🆕 ЕДИНАЯ ПРОПОРЦИОНАЛЬНАЯ ЛОГИКА для всех типов грузов
  
  if (direction === "city-to-city") {
    // Маршрут город-город: используем тариф fromMoscow для города НАЗНАЧЕНИЯ
    // 🎯 ВАЖНО: Берём только тариф "Москва → город назначения" (выше, безопаснее для бизнеса)
    const categories = getFinalCategory(weightKg, volumeM3);
    
    // Получаем тариф fromMoscow для города назначения (toCity)
    const costPerKm = getCostPerKm(toCity, "fromMoscow", categories.finalCategory, toCoordinates);
    
    if (!costPerKm || costPerKm === 0) {
      console.warn(`Не удалось получить тариф fromMoscow для города "${toCity}"`);
      return null;
    }
    
    console.log(`🚛 Город-Город: ${fromCity} → ${toCity}`);
    console.log(`📊 Используется тариф: Москва → ${toCity} = ${costPerKm.toFixed(2)} руб/км`);
    
    // Пропорциональный расчет
    const truckCapacity = TRUCK_CAPACITY_M3[categories.finalCategory];
    const loadFactor = Math.max(volumeM3 / truckCapacity, 0.3);
    const calculatedCost = Math.round(costPerKm * distanceKm * loadFactor);
    const finalCost = Math.max(calculatedCost, MINIMUM_COST);
    
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
        calculatedCost: calculatedCost,
        minimumApplied: finalCost !== calculatedCost,
        cityUsed: toCity
      }
    };
  }
  
  // Маршруты из/в Москву: сначала пробуем палетную логику (DOGRUZ), затем при необходимости пропорциональную
  // Передаём координаты целевого города (не Москвы)
  const targetCoords = isMoscowOrigin ? toCoordinates : fromCoordinates;
  const foundCity = findCityInTariffs(targetCity, direction, targetCoords);
  if (!foundCity) {
    console.warn(`Город "${targetCity}" не найден в базе тарифов`);
    return null;
  }
  
  // 🆕 Для малых грузов (≤ 6 м³) применяем логику с podacha
  // Рассчитываем логистический объем: max(объем, вес/250)
  const logisticVolume = Math.max(volumeM3, weightKg / WEIGHT_TO_VOLUME_RATIO);
  if (logisticVolume <= MAX_VOLUME_FOR_PODACHA) {
    const smallCargoResult = calculateSmallCargoCost(volumeM3, weightKg, direction, foundCity, distanceKm);
    if (smallCargoResult) {
      const categories = getFinalCategory(weightKg, volumeM3);
      return {
        cost: smallCargoResult.cost,
        costPerKm: smallCargoResult.details.costPerKm,
        truckCapacity: smallCargoResult.category,
        details: {
          direction: directionLabel,
          weightCategory: categories.weightCategory,
          volumeCategory: categories.volumeCategory,
          finalCategory: categories.finalCategory,
          distance: distanceKm,
          ratePerKm: smallCargoResult.details.costPerKm,
          cityUsed: foundCity,
          calculatedCost: smallCargoResult.details.calculatedCost,
          minimumApplied: smallCargoResult.details.minimumApplied,
          isSmallCargo: true,
          podacha: smallCargoResult.details.podacha,
          costPerM3: smallCargoResult.details.costPerM3,
          fullGazelleCost: smallCargoResult.details.fullGazelleCost,
          loadFactor: smallCargoResult.details.loadFactor,
          loadPercentage: smallCargoResult.details.loadPercentage
        }
      };
    }
  }
  
  // 🆕 ИЗМЕНЕНИЕ v1.2.0: Сегментная интерполяция для ВСЕХ грузов > 6 м³
  // Линейная интерполяция между реперными точками (6, 12, 20, 40, 80 м³)
  // Гарантирует 100% совпадение с реперными точками и плавный рост цены без аномалий
  
  // Сегментная интерполяция по объему (для всех объемов > 6 м³)
  const result = calculateSegmentedCost(volumeM3, weightKg, direction, foundCity, distanceKm);
  
  if (!result) {
    console.warn(`Не удалось рассчитать стоимость для ${targetCity}`);
    return null;
  }
  
  const categories = getFinalCategory(weightKg, volumeM3);
  
  return {
    cost: result.cost,
    costPerKm: result.details.costPerKm,
    truckCapacity: result.category,
    details: {
      direction: directionLabel,
      weightCategory: categories.weightCategory,
      volumeCategory: categories.volumeCategory,
      finalCategory: categories.finalCategory,
      distance: distanceKm,
      ratePerKm: result.details.costPerKm,
      cityUsed: foundCity,
      calculatedCost: result.details.calculatedCost,
      minimumApplied: result.details.minimumApplied
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

/**
 * 🆕 Генерирует сетку цен для калибровки podacha
 * Выводит расчетные стоимости для объемов от 1 до 6 м³ на заданном маршруте
 * Используется для сравнения с реальными ценами и калибровки значения PODACHA
 */
export const generatePriceGrid = (
  fromCity: string,
  toCity: string,
  distanceKm: number
): Array<{ volume: number; calculatedCost: number; details: any }> | null => {
  const grid: Array<{ volume: number; calculatedCost: number; details: any }> = [];
  
  // Генерируем сетку от 1 до 6 м³
  for (let volume = 1; volume <= 6; volume++) {
    // Для каждого объема рассчитываем вес (по логике 250 кг = 1 м³)
    const weightKg = volume * WEIGHT_TO_VOLUME_RATIO;
    
    const result = calculateShippingCost(fromCity, toCity, distanceKm, weightKg, volume);
    
    if (result) {
      grid.push({
        volume,
        calculatedCost: result.cost,
        details: {
          podacha: result.details.podacha,
          costPerM3: result.details.costPerM3,
          fullGazelleCost: result.details.fullGazelleCost,
          minimumApplied: result.details.minimumApplied,
          isSmallCargo: result.details.isSmallCargo,
          ratePerKm: result.details.ratePerKm
        }
      });
    }
  }
  
  return grid.length > 0 ? grid : null;
};

