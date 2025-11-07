// Расчет стоимости для Москва → Санкт-Петербург
// Используя Вариант 4 (линейная интерполяция)

// Конфигурация маршрута
const config = {
  distance: 704,
  tariffs: {
    '1.5т': 33.9,     // Из конфига
    '3т': 40.3,       // Из конфига
    '5т': 53.8,       // Из конфига
    '10т': 72.9,      // Из конфига
    '20т': 94.5,      // Из конфига
    '500кг': 0,       // Отсутствует - будет рассчитываться
  },
  
  // Коэффициенты для расчета отсутствующих тарифов
  coefficients: {
    '500кг': 0.15,
  },
};

// Функция расчета тарифа (упрощенная логика без проверок)
function calculateTariffWithRule(category) {
  const tariff = config.tariffs[category];
  
  // Если тариф указан в конфиге, возвращаем его
  if (tariff && tariff > 0) {
    return tariff;
  }
  
  const base20tRate = config.tariffs["20т"];
  
  // Если тариф = 0, рассчитываем через коэффициент от 20т
  if (category !== "20т" && base20tRate > 0) {
    const coefficient = config.coefficients[category];
    if (coefficient) {
      // Простой расчет через коэффициент, без дополнительных проверок
      return base20tRate * coefficient;
    }
    return 0;
  }
  
  return base20tRate;
}

// Расчет реперных точек
const tariff15t = config.tariffs['1.5т'];
const tariff3t = config.tariffs['3т'];
const tariff5t = config.tariffs['5т'];
const tariff10t = config.tariffs['10т'];
const tariff20t = config.tariffs['20т'];
const tariff500kg = calculateTariffWithRule('500кг');

config.referencePoint6m3 = config.distance * tariff15t;
config.referencePoints = {
  '3т': {
    volumeM3: 12,
    priceRub: config.distance * tariff3t,
    tariffPerKm: tariff3t,
  },
  '5т': {
    volumeM3: 20,
    priceRub: config.distance * tariff5t,
    tariffPerKm: tariff5t,
  },
  '10т': {
    volumeM3: 40,
    priceRub: config.distance * tariff10t,
    tariffPerKm: tariff10t,
  },
  '20т': {
    volumeM3: 80,
    priceRub: config.distance * tariff20t,
    tariffPerKm: tariff20t,
  },
};

// Функция линейной интерполяции
function linearInterpolation(x1, y1, x2, y2, x) {
  if (x2 === x1) return y1;
  const slope = (y2 - y1) / (x2 - x1);
  return y1 + slope * (x - x1);
}

// Расчет стоимости для объемов 1-6 м³
function calculateSmallVolume(volumeM3) {
  if (volumeM3 < 1) return 7500;
  if (volumeM3 > 6) throw new Error("Только для объемов ≤ 6 м³");
  
  const { referencePoint6m3 } = config;
  const minCost = 7500;
  
  if (volumeM3 === 1) {
    return minCost;
  } else if (volumeM3 <= 6) {
    return linearInterpolation(
      1, minCost,
      6, referencePoint6m3,
      volumeM3
    );
  } else {
    return referencePoint6m3;
  }
}

// Расчет стоимости для объемов 7-12 м³
function calculateMediumVolume(volumeM3) {
  if (volumeM3 < 7 || volumeM3 > 12) {
    throw new Error("Только для объемов 7-12 м³");
  }
  
  const { referencePoint6m3, referencePoints } = config;
  const point3t = referencePoints['3т'];
  
  // Если стоимость полных машин одинаковая (из-за одинаковых тарифов),
  // используем пропорциональный расчет от объема
  if (Math.abs(referencePoint6m3 - point3t.priceRub) < 100) {
    // Используем тариф 3т машины и пропорциональный расчет с учетом объема
    const tariff3t = point3t.tariffPerKm;
    const truckCapacity3t = 12; // м³
    const loadFactor = Math.max(volumeM3 / truckCapacity3t, 0.3); // Минимум 30% загрузки
    return tariff3t * config.distance * loadFactor;
  }
  
  // Если тарифы разные, используем интерполяцию
  return linearInterpolation(
    6, referencePoint6m3,
    point3t.volumeM3, point3t.priceRub,
    volumeM3
  );
}

// Расчет стоимости для объемов 13-20 м³
function calculateLargeVolume(volumeM3) {
  if (volumeM3 < 13 || volumeM3 > 20) {
    throw new Error("Только для объемов 13-20 м³");
  }
  
  const { referencePoints } = config;
  const point3t = referencePoints['3т'];
  const point5t = referencePoints['5т'];
  
  // Если стоимость полных машин одинаковая, используем пропорциональный расчет
  if (Math.abs(point3t.priceRub - point5t.priceRub) < 100) {
    const tariff5t = point5t.tariffPerKm;
    const truckCapacity5t = 20; // м³
    const loadFactor = Math.max(volumeM3 / truckCapacity5t, 0.3); // Минимум 30% загрузки
    return tariff5t * config.distance * loadFactor;
  }
  
  // Если тарифы разные, используем интерполяцию
  return linearInterpolation(
    point3t.volumeM3, point3t.priceRub,
    point5t.volumeM3, point5t.priceRub,
    volumeM3
  );
}

// Расчет стоимости для объемов 21-40 м³
function calculateExtraLargeVolume(volumeM3) {
  if (volumeM3 < 21 || volumeM3 > 40) {
    throw new Error("Только для объемов 21-40 м³");
  }
  
  const { referencePoints } = config;
  const point5t = referencePoints['5т'];
  const point10t = referencePoints['10т'];
  
  return linearInterpolation(
    point5t.volumeM3, point5t.priceRub,
    point10t.volumeM3, point10t.priceRub,
    volumeM3
  );
}

// Расчет стоимости для объемов 41-80 м³
function calculateHugeVolume(volumeM3) {
  if (volumeM3 < 41 || volumeM3 > 80) {
    throw new Error("Только для объемов 41-80 м³");
  }
  
  const { referencePoints } = config;
  const point10t = referencePoints['10т'];
  const point20t = referencePoints['20т'];
  
  return linearInterpolation(
    point10t.volumeM3, point10t.priceRub,
    point20t.volumeM3, point20t.priceRub,
    volumeM3
  );
}

// Главная функция расчета
function calculateCost(volumeM3) {
  const vol = Math.max(1, volumeM3);
  
  let result;
  
  if (vol <= 6) {
    result = calculateSmallVolume(vol);
  } else if (vol <= 12) {
    result = calculateMediumVolume(vol);
  } else if (vol <= 20) {
    result = calculateLargeVolume(vol);
  } else if (vol <= 40) {
    result = calculateExtraLargeVolume(vol);
  } else if (vol <= 80) {
    result = calculateHugeVolume(vol);
  } else {
    const point20t = config.referencePoints['20т'];
    result = (vol / point20t.volumeM3) * point20t.priceRub;
  }
  
  return Math.max(Math.round(result), 7500);
}

// Вывод результатов
console.log('РАСЧЕТ СТОИМОСТИ: Москва → Санкт-Петербург');
console.log('Используется Вариант 4 (линейная интерполяция)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

console.log('ТАРИФЫ:');
console.log(`  20т:  ${tariff20t.toFixed(2)} ₽/км (из конфига)`);
console.log(`  10т:  ${tariff10t.toFixed(2)} ₽/км (из конфига)`);
console.log(`  5т:   ${tariff5t.toFixed(2)} ₽/км (из конфига)`);
console.log(`  3т:   ${tariff3t.toFixed(2)} ₽/км (из конфига)`);
console.log(`  1.5т: ${tariff15t.toFixed(2)} ₽/км (из конфига)`);
console.log(`  500кг: ${tariff500kg.toFixed(2)} ₽/км (94.5 × 0.15)`);
console.log('');

console.log('РЕПЕРНЫЕ ТОЧКИ:');
console.log(`  6 м³ (1.5т):  ${config.referencePoint6m3.toLocaleString('ru-RU')} ₽`);
console.log(`  12 м³ (3т):   ${config.referencePoints['3т'].priceRub.toLocaleString('ru-RU')} ₽`);
console.log(`  20 м³ (5т):   ${config.referencePoints['5т'].priceRub.toLocaleString('ru-RU')} ₽`);
console.log(`  40 м³ (10т):  ${config.referencePoints['10т'].priceRub.toLocaleString('ru-RU')} ₽`);
console.log(`  80 м³ (20т):  ${config.referencePoints['20т'].priceRub.toLocaleString('ru-RU')} ₽`);
console.log('');

console.log('ОБЪЕМ     НОВАЯ ЛОГИКА    РЕПЕРНАЯ ТОЧКА     СРАВНЕНИЕ');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Расчеты для 1-15 м³ (каждый куб)
for (let vol = 1; vol <= 15; vol++) {
  const cost = calculateCost(vol);
  const volStr = `${vol} м³`.padEnd(10);
  const costStr = `${cost.toLocaleString('ru-RU')} ₽`.padEnd(17);
  
  let refPointStr = '─'.padEnd(17);
  let comparisonStr = '';
  
  if (vol === 6) {
    const refPrice = Math.round(config.referencePoint6m3);
    refPointStr = `6 м³ = ${refPrice.toLocaleString('ru-RU')} ₽`.padEnd(17);
    const diff = cost - refPrice;
    comparisonStr = Math.abs(diff) < 10 ? '✓ Совпадает' : `Разница: ${diff > 0 ? '+' : ''}${diff} ₽`;
  } else if (vol === 12) {
    const refPrice = config.referencePoints['3т'].priceRub;
    refPointStr = `12 м³ = ${refPrice.toLocaleString('ru-RU')} ₽`.padEnd(17);
    const diff = cost - refPrice;
    comparisonStr = Math.abs(diff) < 10 ? '✓ Совпадает' : `Разница: ${diff > 0 ? '+' : ''}${diff} ₽`;
  } else if (vol === 20) {
    const refPrice = config.referencePoints['5т'].priceRub;
    refPointStr = `20 м³ = ${refPrice.toLocaleString('ru-RU')} ₽`.padEnd(17);
    const diff = cost - refPrice;
    comparisonStr = Math.abs(diff) < 10 ? '✓ Совпадает' : `Разница: ${diff > 0 ? '+' : ''}${diff} ₽`;
  } else if (vol === 40) {
    const refPrice = config.referencePoints['10т'].priceRub;
    refPointStr = `40 м³ = ${refPrice.toLocaleString('ru-RU')} ₽`.padEnd(17);
    const diff = cost - refPrice;
    comparisonStr = Math.abs(diff) < 10 ? '✓ Совпадает' : `Разница: ${diff > 0 ? '+' : ''}${diff} ₽`;
  }
  
  console.log(`${volStr}${costStr}${refPointStr}${comparisonStr}`);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Расчеты для 16-80 м³ с шагом 2 м³
for (let vol = 16; vol <= 80; vol += 2) {
  const cost = calculateCost(vol);
  const volStr = `${vol} м³`.padEnd(10);
  const costStr = `${cost.toLocaleString('ru-RU')} ₽`.padEnd(17);
  
  let refPointStr = '─'.padEnd(17);
  let comparisonStr = '';
  
  if (vol === 20) {
    const refPrice = config.referencePoints['5т'].priceRub;
    refPointStr = `20 м³ = ${refPrice.toLocaleString('ru-RU')} ₽`.padEnd(17);
    const diff = cost - refPrice;
    comparisonStr = Math.abs(diff) < 10 ? '✓ Совпадает' : `Разница: ${diff > 0 ? '+' : ''}${diff} ₽`;
  } else if (vol === 40) {
    const refPrice = config.referencePoints['10т'].priceRub;
    refPointStr = `40 м³ = ${refPrice.toLocaleString('ru-RU')} ₽`.padEnd(17);
    const diff = cost - refPrice;
    comparisonStr = Math.abs(diff) < 10 ? '✓ Совпадает' : `Разница: ${diff > 0 ? '+' : ''}${diff} ₽`;
  } else if (vol === 80) {
    const refPrice = config.referencePoints['20т'].priceRub;
    refPointStr = `80 м³ = ${refPrice.toLocaleString('ru-RU')} ₽`.padEnd(17);
    const diff = cost - refPrice;
    comparisonStr = Math.abs(diff) < 10 ? '✓ Совпадает' : `Разница: ${diff > 0 ? '+' : ''}${diff} ₽`;
  }
  
  console.log(`${volStr}${costStr}${refPointStr}${comparisonStr}`);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// Итоговая таблица реперных точек
console.log('РЕПЕРНЫЕ ТОЧКИ:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Объем    Новая логика    Ожидаемая стоимость    Статус');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const refPoints = [
  { vol: 6, name: '6 м³ (1.5т)', expected: config.referencePoint6m3 },
  { vol: 12, name: '12 м³ (3т)', expected: config.referencePoints['3т'].priceRub },
  { vol: 20, name: '20 м³ (5т)', expected: config.referencePoints['5т'].priceRub },
  { vol: 40, name: '40 м³ (10т)', expected: config.referencePoints['10т'].priceRub },
  { vol: 80, name: '80 м³ (20т)', expected: config.referencePoints['20т'].priceRub },
];

for (const point of refPoints) {
  const calculated = calculateCost(point.vol);
  const volStr = point.name.padEnd(15);
  const calcStr = `${calculated.toLocaleString('ru-RU')} ₽`.padEnd(17);
  const expStr = `${Math.round(point.expected).toLocaleString('ru-RU')} ₽`.padEnd(23);
  const diff = calculated - Math.round(point.expected);
  const status = Math.abs(diff) < 10 
    ? '✓ Точное совпадение' 
    : `⚠ Разница: ${diff > 0 ? '+' : ''}${diff} ₽`;
  
  console.log(`${volStr}${calcStr}${expStr}${status}`);
}

