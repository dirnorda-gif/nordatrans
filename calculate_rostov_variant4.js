// Расчет стоимости для Москва → Ростов-на-Дону
// Используя Вариант 4 (линейная интерполяция)

// Конфигурация маршрута
const config = {
  // Данные логиста для 1-5 м³
  logisticPoints: [
    { volumeM3: 1, priceRub: 11000 },
    { volumeM3: 2, priceRub: 16000 },
    { volumeM3: 3, priceRub: 23000 },
    { volumeM3: 4, priceRub: 27000 },
    { volumeM3: 5, priceRub: 31000 },
  ],
  
  // Реперная точка 6 м³ (полная газель)
  referencePoint6m3: 37407,
  
  // Реперные точки для больших машин
  referencePoints: {
    '3т': { volumeM3: 12, priceRub: 50558 },   // 1078 км × 46.9 ₽/км
    '5т': { volumeM3: 20, priceRub: 63494 },      // 1078 км × 58.9 ₽/км
    '10т': { volumeM3: 40, priceRub: 73304 },    // 1078 км × 68.0 ₽/км
    '20т': { volumeM3: 80, priceRub: 106722 },  // 1078 км × 99.0 ₽/км
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
  if (volumeM3 < 1) return 7500; // MINIMUM_COST
  if (volumeM3 > 6) throw new Error("Только для объемов ≤ 6 м³");
  
  const { logisticPoints, referencePoint6m3 } = config;
  
  if (volumeM3 === 1) {
    return logisticPoints[0].priceRub;
  } else if (volumeM3 <= 2) {
    return linearInterpolation(
      1, logisticPoints[0].priceRub,
      2, logisticPoints[1].priceRub,
      volumeM3
    );
  } else if (volumeM3 <= 3) {
    return linearInterpolation(
      2, logisticPoints[1].priceRub,
      3, logisticPoints[2].priceRub,
      volumeM3
    );
  } else if (volumeM3 <= 4) {
    return linearInterpolation(
      3, logisticPoints[2].priceRub,
      4, logisticPoints[3].priceRub,
      volumeM3
    );
  } else if (volumeM3 <= 5) {
    return linearInterpolation(
      4, logisticPoints[3].priceRub,
      5, logisticPoints[4].priceRub,
      volumeM3
    );
  } else if (volumeM3 <= 6) {
    return linearInterpolation(
      5, logisticPoints[4].priceRub,
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
console.log('РАСЧЕТ СТОИМОСТИ: Москва → Ростов-на-Дону');
console.log('Используется Вариант 4 (линейная интерполяция)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
    refPointStr = '6 м³ = 37,407 ₽'.padEnd(17);
    const diff = cost - 37407;
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
  { vol: 6, name: '6 м³ (1.5т)', expected: 37407 },
  { vol: 12, name: '12 м³ (3т)', expected: 50558 },
  { vol: 20, name: '20 м³ (5т)', expected: 63494 },
  { vol: 40, name: '40 м³ (10т)', expected: 73304 },
  { vol: 80, name: '80 м³ (20т)', expected: 106722 },
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
console.log('• Сегменты интерполяции:');
console.log('  - 1-6 м³: между точками логиста и реперной точкой 6 м³');
console.log('  - 7-12 м³: между 6 м³ и полной 3т машиной');
console.log('  - 13-20 м³: между 3т и 5т машинами');
console.log('  - 21-40 м³: между 5т и 10т машинами');
console.log('  - 41-80 м³: между 10т и 20т машинами');

