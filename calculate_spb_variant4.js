// Расчет стоимости для Москва → Санкт-Петербург
// Используя Вариант 4 (линейная интерполяция)

// Конфигурация маршрута
const config = {
  distance: 704,
  tariffs: {
    '1.5т': 33.9,
    '3т': 40.3,     // Обновлен: реальный тариф
    '5т': 53.8,
    '10т': 72.9,
    '20т': 94.5,
  },
  
  // Расчет реперных точек из тарифов
  // Реперная точка 6 м³ (полная газель)
  referencePoint6m3: 704 * 33.9, // = 23,866 ₽
  
  // Реперные точки для больших машин
  referencePoints: {
    '3т': {
      volumeM3: 12,
      // Тариф 3т обновлен до реального значения
      priceRub: 704 * 40.3, // = 28,371 ₽
      tariffPerKm: 40.3,
    },
    '5т': {
      volumeM3: 20,
      priceRub: 704 * 53.8, // = 37,875 ₽
      tariffPerKm: 53.8,
    },
    '10т': {
      volumeM3: 40,
      priceRub: 704 * 72.9, // = 51,322 ₽
      tariffPerKm: 72.9,
    },
    '20т': {
      volumeM3: 80,
      priceRub: 704 * 94.5, // = 66,528 ₽
      tariffPerKm: 94.5,
    },
  },
};

// У нас нет данных логиста для 1-5 м³, поэтому используем пропорциональный расчет
// от реперной точки 6 м³, аналогично логике из предыдущих расчетов
// Но можем использовать данные из старой логики калькулятора как опорные точки

// Данные из старой логики калькулятора для 1-6 м³ (для справки)
const oldLogicPrices = {
  1: 7500,   // MINIMUM_COST
  2: 7955,
  3: 11933,
  4: 15910,
  5: 19888,
  6: 23866,  // Реперная точка
};

// Вариант: используем пропорциональный расчет от 6 м³
// Но лучше использовать линейную интерполяцию от 1 м³ к 6 м³
// Используем минимальную стоимость для 1 м³ и реперную точку для 6 м³
// Для промежуточных точек интерполируем

// Функция линейной интерполяции
function linearInterpolation(x1, y1, x2, y2, x) {
  if (x2 === x1) return y1;
  const slope = (y2 - y1) / (x2 - x1);
  return y1 + slope * (x - x1);
}

// Расчет стоимости для объемов 1-6 м³
// Используем пропорциональную логику: от минимальной стоимости (1 м³) к реперной точке (6 м³)
function calculateSmallVolume(volumeM3) {
  if (volumeM3 < 1) return 7500; // MINIMUM_COST
  if (volumeM3 > 6) throw new Error("Только для объемов ≤ 6 м³");
  
  const { referencePoint6m3 } = config;
  const minCost = 7500; // MINIMUM_COST для 1 м³
  
  // Линейная интерполяция от (1, 7500) до (6, 23866)
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

// Расчет стоимости для объемов 7-12 м³ (переход к 3т)
function calculateMediumVolume(volumeM3) {
  if (volumeM3 < 7 || volumeM3 > 12) {
    throw new Error("Только для объемов 7-12 м³");
  }
  
  const { referencePoint6m3, referencePoints } = config;
  const point3t = referencePoints['3т'];
  
  return linearInterpolation(
    6, referencePoint6m3,
    point3t.volumeM3, point3t.priceRub,
    volumeM3
  );
}

// Расчет стоимости для объемов 13-20 м³ (переход к 5т)
function calculateLargeVolume(volumeM3) {
  if (volumeM3 < 13 || volumeM3 > 20) {
    throw new Error("Только для объемов 13-20 м³");
  }
  
  const { referencePoints } = config;
  const point3t = referencePoints['3т'];
  const point5t = referencePoints['5т'];
  
  return linearInterpolation(
    point3t.volumeM3, point3t.priceRub,
    point5t.volumeM3, point5t.priceRub,
    volumeM3
  );
}

// Расчет стоимости для объемов 21-40 м³ (переход к 10т)
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

// Расчет стоимости для объемов 41-80 м³ (переход к 20т)
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
    // Для объемов > 80 м³ используем пропорциональный расчет
    const point20t = config.referencePoints['20т'];
    result = (vol / point20t.volumeM3) * point20t.priceRub;
  }
  
  return Math.max(Math.round(result), 7500); // MINIMUM_COST
}

// Вывод результатов
console.log('РАСЧЕТ СТОИМОСТИ: Москва → Санкт-Петербург');
console.log('Используется Вариант 4 (линейная интерполяция)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

console.log('РЕПЕРНЫЕ ТОЧКИ:');
console.log(`  6 м³ (1.5т):  ${config.referencePoint6m3.toLocaleString('ru-RU')} ₽ (704 км × ${config.tariffs['1.5т']} ₽/км)`);
console.log(`  12 м³ (3т):   ${config.referencePoints['3т'].priceRub.toLocaleString('ru-RU')} ₽ (704 км × ${config.referencePoints['3т'].tariffPerKm.toFixed(2)} ₽/км)`);
console.log(`  20 м³ (5т):   ${config.referencePoints['5т'].priceRub.toLocaleString('ru-RU')} ₽ (704 км × ${config.referencePoints['5т'].tariffPerKm} ₽/км)`);
console.log(`  40 м³ (10т):  ${config.referencePoints['10т'].priceRub.toLocaleString('ru-RU')} ₽ (704 км × ${config.referencePoints['10т'].tariffPerKm} ₽/км)`);
console.log(`  80 м³ (20т):  ${config.referencePoints['20т'].priceRub.toLocaleString('ru-RU')} ₽ (704 км × ${config.referencePoints['20т'].tariffPerKm} ₽/км)`);
console.log('');

console.log('ОБЪЕМ     НОВАЯ ЛОГИКА    РЕПЕРНАЯ ТОЧКА     СРАВНЕНИЕ');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Расчеты для 1-15 м³ (каждый куб)
for (let vol = 1; vol <= 15; vol++) {
  const cost = calculateCost(vol);
  const volStr = `${vol} м³`.padEnd(10);
  const costStr = `${cost.toLocaleString('ru-RU')} ₽`.padEnd(17);
  
  // Проверяем, является ли это реперной точкой
  let refPointStr = '─'.padEnd(17);
  let comparisonStr = '';
  
  if (vol === 6) {
    refPointStr = '6 м³ = 23,866 ₽'.padEnd(17);
    const diff = cost - config.referencePoint6m3;
    comparisonStr = diff === 0 ? '✓ Совпадает' : `Разница: ${diff > 0 ? '+' : ''}${diff} ₽`;
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
  
  // Проверяем, является ли это реперной точкой
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
  const expStr = `${point.expected.toLocaleString('ru-RU')} ₽`.padEnd(23);
  const diff = calculated - point.expected;
  const status = Math.abs(diff) < 10 
    ? '✓ Точное совпадение' 
    : `⚠ Разница: ${diff > 0 ? '+' : ''}${diff} ₽`;
  
  console.log(`${volStr}${calcStr}${expStr}${status}`);
}

console.log('');
console.log('ПРИМЕЧАНИЯ:');
console.log('• Реперная точка 6 м³ = стоимость полной газели из тарифной сетки');
console.log('• Для объемов 1-6 м³ используется линейная интерполяция от минимальной стоимости (1 м³)');
console.log('• Сегменты интерполяции:');
console.log('  - 1-6 м³: между минимальной стоимостью (1 м³) и реперной точкой 6 м³');
console.log('  - 7-12 м³: между 6 м³ и полной 3т машиной');
console.log('  - 13-20 м³: между 3т и 5т машинами');
console.log('  - 21-40 м³: между 5т и 10т машинами');
console.log('  - 41-80 м³: между 10т и 20т машинами');
console.log('• Для 1-5 м³ нет данных логиста, используется пропорциональный расчет');

