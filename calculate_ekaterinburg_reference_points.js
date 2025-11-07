// Расчет стоимости для Москва → Екатеринбург по всем реперным точкам
// Используется текущая логика калькулятора (podacha, палетная логика, пропорциональный расчет)

// Конфигурация маршрута
const config = {
  distance: 1818, // Москва - Екатеринбург (примерно)
  fromCity: "Москва",
  toCity: "Екатеринбург",
  
  // Тарифы "Из Москвы" (74.0/62.8/51.9/0/35.5/0)
  tariffsFromMoscow: {
    '20т': 74.0,
    '10т': 62.8,
    '5т': 51.9,
    '3т': 0,        // Рассчитывается через коэффициент
    '1.5т': 35.5,
    '500кг': 0,     // Рассчитывается через коэффициент
  },
  
  // Тарифы "В Москву" (38.9/39.3/27.1/0/19.6/0)
  tariffsToMoscow: {
    '20т': 38.9,
    '10т': 39.3,
    '5т': 27.1,
    '3т': 0,        // Рассчитывается через коэффициент
    '1.5т': 19.6,
    '500кг': 0,     // Рассчитывается через коэффициент
  },
  
  // Коэффициенты для расчета отсутствующих тарифов
  coefficients: {
    fromMoscow: {
      '3т': 0.33,
      '500кг': 0.15,
    },
    toMoscow: {
      '3т': 0.31,
      '500кг': 0.14,
    }
  },
  
  // Вместимость машин
  truckCapacity: {
    '500кг': 2,
    '1.5т': 6,
    '3т': 12,
    '5т': 20,
    '10т': 40,
    '20т': 80,
  },
  
  // Константы
  MINIMUM_COST: 7500,
  PODACHA: 4000,
  MAX_VOLUME_FOR_PODACHA: 6,
  WEIGHT_TO_VOLUME_RATIO: 250, // 250 кг = 1 м³
  PALLET_VOLUME_M3: 2,
};

// Функция расчета тарифа
function getTariff(direction, category) {
  const tariffs = direction === 'fromMoscow' ? config.tariffsFromMoscow : config.tariffsToMoscow;
  const coefficients = config.coefficients[direction];
  const tariff = tariffs[category];
  
  if (tariff && tariff > 0) {
    return tariff;
  }
  
  // Рассчитываем через коэффициент от 20т
  const base20tRate = tariffs['20т'];
  if (category !== '20т' && base20tRate > 0 && coefficients[category]) {
    return base20tRate * coefficients[category];
  }
  
  return 0;
}

// Определение категории машины по объему
function getVolumeCategory(volumeM3) {
  if (volumeM3 >= 46) return '20т';
  if (volumeM3 >= 30) return '10т';
  if (volumeM3 >= 15) return '5т';
  if (volumeM3 >= 9) return '3т';
  if (volumeM3 >= 6) return '1.5т';
  if (volumeM3 >= 4) return '1.5т';
  if (volumeM3 >= 2.5) return '1.5т';
  return '500кг';
}

// Определение категории машины по весу
function getWeightCategory(weightKg) {
  if (weightKg <= 500) return '500кг';
  if (weightKg <= 1500) return '1.5т';
  if (weightKg <= 3000) return '3т';
  if (weightKg <= 5000) return '5т';
  if (weightKg <= 10000) return '10т';
  return '20т';
}

// Приоритет категории
function getCategoryWeight(category) {
  const weights = {
    '500кг': 1,
    '1.5т': 2,
    '3т': 3,
    '5т': 4,
    '10т': 5,
    '20т': 6
  };
  return weights[category];
}

// Итоговая категория (максимум из веса и объема)
function getFinalCategory(weightKg, volumeM3) {
  const weightCategory = getWeightCategory(weightKg);
  const volumeCategory = getVolumeCategory(volumeM3);
  
  return getCategoryWeight(weightCategory) > getCategoryWeight(volumeCategory)
    ? weightCategory
    : volumeCategory;
}

// Расчет для малых грузов (≤ 6 м³) с podacha
function calculateSmallCargoCost(direction, volumeM3, weightKg) {
  const costPerKmGazelle = getTariff(direction, '1.5т');
  if (!costPerKmGazelle || costPerKmGazelle === 0) return null;
  
  const fullGazelleCost = costPerKmGazelle * config.distance;
  const gazelleCapacity = config.truckCapacity['1.5т']; // 6 м³
  const costPerM3 = (fullGazelleCost - config.PODACHA) / gazelleCapacity;
  const calculatedCost = Math.round(config.PODACHA + (volumeM3 * costPerM3));
  const finalCost = Math.max(calculatedCost, config.MINIMUM_COST);
  
  return {
    cost: finalCost,
    category: '1.5т',
    method: 'podacha',
    details: {
      podacha: config.PODACHA,
      costPerM3: costPerM3,
      fullGazelleCost: fullGazelleCost,
      calculatedCost: calculatedCost,
    }
  };
}

// Палетная логика
function calculatePalletBasedCost(direction, weightKg, volumeM3) {
  const logisticVolume = Math.max(volumeM3, weightKg / config.WEIGHT_TO_VOLUME_RATIO);
  const numberOfPallets = Math.max(1, Math.ceil(logisticVolume / config.PALLET_VOLUME_M3));
  const palletVolumeM3 = config.PALLET_VOLUME_M3;
  const palletWeightKg = weightKg > 0 ? weightKg / numberOfPallets : 0;
  
  const costPerKm20t = getTariff(direction, '20т');
  if (!costPerKm20t || costPerKm20t === 0) return null;
  
  const TRUCK_20T_VOLUME_M3 = config.truckCapacity['20т'];
  const TRUCK_20T_WEIGHT_KG = 20000;
  
  const palletsByVolume = Math.floor(TRUCK_20T_VOLUME_M3 / palletVolumeM3);
  const palletsByWeight = palletWeightKg > 0 
    ? Math.floor(TRUCK_20T_WEIGHT_KG / palletWeightKg) 
    : Infinity;
  const palletsPerFullTruck = Math.min(palletsByVolume, palletsByWeight);
  
  const fullTruckCost = Math.round(costPerKm20t * config.distance);
  const pricePerPallet = fullTruckCost / palletsPerFullTruck;
  const calculatedCost = Math.round(numberOfPallets * pricePerPallet);
  const finalCost = Math.max(calculatedCost, config.MINIMUM_COST);
  
  return {
    cost: finalCost,
    category: getFinalCategory(weightKg, volumeM3),
    method: 'pallet',
    details: {
      numberOfPallets,
      palletsPerFullTruck,
      pricePerPallet,
      fullTruckCost,
    }
  };
}

// Пропорциональный расчет
function calculateProportionalCost(direction, volumeM3, weightKg) {
  const truckCategory = getFinalCategory(weightKg, volumeM3);
  const costPerKm = getTariff(direction, truckCategory);
  
  if (!costPerKm || costPerKm === 0) {
    return null;
  }
  
  const truckCapacity = config.truckCapacity[truckCategory];
  const loadFactor = Math.max(volumeM3 / truckCapacity, 0.3);
  const calculatedCost = Math.round(costPerKm * config.distance * loadFactor);
  const finalCost = Math.max(calculatedCost, config.MINIMUM_COST);
  
  return {
    cost: finalCost,
    category: truckCategory,
    method: 'proportional',
    details: {
      costPerKm,
      truckCapacity,
      loadFactor,
      loadPercentage: loadFactor * 100,
    }
  };
}

// Главная функция расчета
function calculateShippingCost(direction, weightKg, volumeM3, transportType) {
  // Рассчитываем логистический объем
  const logisticVolume = Math.max(volumeM3, weightKg / config.WEIGHT_TO_VOLUME_RATIO);
  
  // Для малых грузов (≤ 6 м³) применяем логику с podacha
  if (logisticVolume <= config.MAX_VOLUME_FOR_PODACHA) {
    const result = calculateSmallCargoCost(direction, volumeM3, weightKg);
    if (result) return result;
  }
  
  // 🆕 Для домашних переездов используем расчет по объему (пропорциональный), а не палетную логику
  const isMoving = transportType === "Домашний переезд";
  
  // Палетная логика для грузов > 6 м³ (только для коммерческих грузов)
  if (!isMoving) {
    const palletBased = calculatePalletBasedCost(direction, weightKg, volumeM3);
    if (palletBased) {
      return palletBased;
    }
  }
  
  // Для домашних переездов и как fallback используем пропорциональный расчет по объему
  return calculateProportionalCost(direction, volumeM3, weightKg);
}

// Реперные точки по объему
const referenceVolumes = [
  1, 2.5, 4, 6,      // Границы для podacha и 1.5т
  9,                  // Граница для 3т
  15,                 // Граница для 5т
  30,                 // Граница для 10т
  46,                 // Граница для 20т
  80,                 // Полная 20т фура
];

// Реперные точки по весу (для расчета логистического объема)
const referenceWeights = [
  0, 250, 500,        // До 500кг
  1000, 1500,        // 1.5т
  2000, 3000,        // 3т
  4000, 5000,        // 5т
  8000, 10000,       // 10т
  15000, 20000,      // 20т
];

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('РАСЧЕТ СТОИМОСТИ: Москва → Екатеринбург');
console.log('Расстояние: 1818 км');
console.log('Тип расчета: Коммерческие грузы (палетная логика для грузов > 6 м³)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// Вывод тарифов
console.log('ТАРИФЫ "ИЗ МОСКВЫ":');
console.log('  20т:  74.0 ₽/км');
console.log('  10т:  62.8 ₽/км');
console.log('  5т:   51.9 ₽/км');
console.log(`  3т:   ${getTariff('fromMoscow', '3т').toFixed(2)} ₽/км (74.0 × 0.33)`);
console.log('  1.5т: 35.5 ₽/км');
console.log(`  500кг: ${getTariff('fromMoscow', '500кг').toFixed(2)} ₽/км (74.0 × 0.15)`);
console.log('');

console.log('ТАРИФЫ "В МОСКВУ":');
console.log('  20т:  38.9 ₽/км');
console.log('  10т:  39.3 ₽/км');
console.log('  5т:   27.1 ₽/км');
console.log(`  3т:   ${getTariff('toMoscow', '3т').toFixed(2)} ₽/км (38.9 × 0.31)`);
console.log('  1.5т: 19.6 ₽/км');
console.log(`  500кг: ${getTariff('toMoscow', '500кг').toFixed(2)} ₽/км (38.9 × 0.14)`);
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// Расчеты для "Из Москвы"
console.log('НАПРАВЛЕНИЕ: ИЗ МОСКВЫ');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Объем    Вес        Категория    Метод           Стоимость');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

for (const volume of referenceVolumes) {
  // Для каждого объема определяем соответствующий вес (250 кг = 1 м³)
  const weight = Math.max(volume * config.WEIGHT_TO_VOLUME_RATIO, 500);
  const result = calculateShippingCost('fromMoscow', weight, volume, undefined);
  
  if (result) {
    const volStr = `${volume} м³`.padEnd(9);
    const weightStr = `${Math.round(weight)} кг`.padEnd(11);
    const catStr = result.category.padEnd(13);
    const methodStr = result.method.padEnd(16);
    const costStr = `${result.cost.toLocaleString('ru-RU')} ₽`;
    
    console.log(`${volStr}${weightStr}${catStr}${methodStr}${costStr}`);
  }
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// Расчеты для "В Москву"
console.log('НАПРАВЛЕНИЕ: В МОСКВУ');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Объем    Вес        Категория    Метод           Стоимость');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

for (const volume of referenceVolumes) {
  const weight = Math.max(volume * config.WEIGHT_TO_VOLUME_RATIO, 500);
  const result = calculateShippingCost('toMoscow', weight, volume, undefined);
  
  if (result) {
    const volStr = `${volume} м³`.padEnd(9);
    const weightStr = `${Math.round(weight)} кг`.padEnd(11);
    const catStr = result.category.padEnd(13);
    const methodStr = result.method.padEnd(16);
    const costStr = `${result.cost.toLocaleString('ru-RU')} ₽`;
    
    console.log(`${volStr}${weightStr}${catStr}${methodStr}${costStr}`);
  }
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// Дополнительные расчеты для разных соотношений вес/объем
console.log('ДОПОЛНИТЕЛЬНЫЕ РАСЧЕТЫ (разные соотношения вес/объем):');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Объем    Вес        Логист.объем    Категория    Направление    Стоимость');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const testCases = [
  { volume: 5, weight: 500 },      // Легкий объемный груз
  { volume: 5, weight: 2000 },    // Нормальное соотношение
  { volume: 10, weight: 500 },    // Очень легкий объемный груз
  { volume: 10, weight: 5000 },   // Тяжелый груз
  { volume: 20, weight: 1000 },    // Легкий для 20 м³
  { volume: 20, weight: 10000 },   // Тяжелый для 20 м³
];

for (const test of testCases) {
  const logisticVol = Math.max(test.volume, test.weight / config.WEIGHT_TO_VOLUME_RATIO);
  
  for (const direction of ['fromMoscow', 'toMoscow']) {
    const result = calculateShippingCost(direction, test.weight, test.volume, undefined);
    if (result) {
      const volStr = `${test.volume} м³`.padEnd(9);
      const weightStr = `${test.weight} кг`.padEnd(11);
      const logVolStr = `${logisticVol.toFixed(1)} м³`.padEnd(16);
      const catStr = result.category.padEnd(13);
      const dirStr = (direction === 'fromMoscow' ? 'Из Москвы' : 'В Москву').padEnd(15);
      const costStr = `${result.cost.toLocaleString('ru-RU')} ₽`;
      
      console.log(`${volStr}${weightStr}${logVolStr}${catStr}${dirStr}${costStr}`);
    }
  }
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// Расчеты для домашних переездов (пропорциональный расчет по объему)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('ДОМАШНИЙ ПЕРЕЕЗД (расчет по объему, без палетной логики)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('НАПРАВЛЕНИЕ: ИЗ МОСКВЫ');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Объем    Вес        Категория    Метод           Стоимость');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

for (const volume of referenceVolumes) {
  const weight = Math.max(volume * config.WEIGHT_TO_VOLUME_RATIO, 500);
  const result = calculateShippingCost('fromMoscow', weight, volume, "Домашний переезд");
  
  if (result) {
    const volStr = `${volume} м³`.padEnd(9);
    const weightStr = `${Math.round(weight)} кг`.padEnd(11);
    const catStr = result.category.padEnd(13);
    const methodStr = result.method.padEnd(16);
    const costStr = `${result.cost.toLocaleString('ru-RU')} ₽`;
    
    console.log(`${volStr}${weightStr}${catStr}${methodStr}${costStr}`);
  }
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('НАПРАВЛЕНИЕ: В МОСКВУ');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Объем    Вес        Категория    Метод           Стоимость');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

for (const volume of referenceVolumes) {
  const weight = Math.max(volume * config.WEIGHT_TO_VOLUME_RATIO, 500);
  const result = calculateShippingCost('toMoscow', weight, volume, "Домашний переезд");
  
  if (result) {
    const volStr = `${volume} м³`.padEnd(9);
    const weightStr = `${Math.round(weight)} кг`.padEnd(11);
    const catStr = result.category.padEnd(13);
    const methodStr = result.method.padEnd(16);
    const costStr = `${result.cost.toLocaleString('ru-RU')} ₽`;
    
    console.log(`${volStr}${weightStr}${catStr}${methodStr}${costStr}`);
  }
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

