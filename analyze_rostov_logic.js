// Анализ данных логиста и предложение вариантов логики

const logicData = {
  // Данные логиста
  logisticPrices: {
    1: 11000,
    2: 16000,
    3: 23000,
    4: 27000,
    5: 31000,
    6: 36000 // среднее между 35-37k
  },
  
  // Реперная точка из калькулятора
  reference6m3: 37407,
  
  // Следующая точка (полная 3т машина)
  full3t: 50558, // 12 м³
  
  // Фиксированный тариф газели
  gazelleTariff: 34.7, // ₽/км
  distance: 1078
};

console.log('АНАЛИЗ: Москва → Ростов-на-Дону');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('ДАННЫЕ ЛОГИСТА (1-6 м³):');
console.log(`  1 м³ = ${logicData.logisticPrices[1].toLocaleString('ru-RU')} ₽`);
console.log(`  2 м³ = ${logicData.logisticPrices[2].toLocaleString('ru-RU')} ₽`);
console.log(`  3 м³ = ${logicData.logisticPrices[3].toLocaleString('ru-RU')} ₽`);
console.log(`  4 м³ = ${logicData.logisticPrices[4].toLocaleString('ru-RU')} ₽`);
console.log(`  5 м³ = ${logicData.logisticPrices[5].toLocaleString('ru-RU')} ₽`);
console.log(`  6 м³ = ${logicData.logisticPrices[6].toLocaleString('ru-RU')} ₽ (реперная точка)`);
console.log('');
console.log(`РЕПЕРНАЯ ТОЧКА (из калькулятора): 6 м³ = ${logicData.reference6m3.toLocaleString('ru-RU')} ₽`);
console.log(`СЛЕДУЮЩАЯ ТОЧКА: 12 м³ (полная 3т) = ${logicData.full3t.toLocaleString('ru-RU')} ₽`);
console.log('');

// Вариант 1: Полиномиальная интерполяция
console.log('ВАРИАНТ 1: Полиномиальная интерполяция');
console.log('Используем полином 2-й степени для точного соответствия данным логиста');
console.log('Формула: price = a*x² + b*x + c');
console.log('');

// Решаем систему уравнений для полинома 2-й степени
// Используем точки: (1, 11000), (3, 23000), (6, 37407)
// x²*a + x*b + c = y

// Для точки (1, 11000): a + b + c = 11000
// Для точки (3, 23000): 9a + 3b + c = 23000
// Для точки (6, 37407): 36a + 6b + c = 37407

// Решение системы:
// Из первого: c = 11000 - a - b
// Подставляем во второе: 9a + 3b + 11000 - a - b = 23000 => 8a + 2b = 12000 => 4a + b = 6000
// Подставляем в третье: 36a + 6b + 11000 - a - b = 37407 => 35a + 5b = 26407
// Из второго: b = 6000 - 4a
// Подставляем в третье: 35a + 5(6000 - 4a) = 26407 => 35a + 30000 - 20a = 26407 => 15a = -3593 => a = -239.53
// b = 6000 - 4(-239.53) = 6000 + 958.12 = 6958.12
// c = 11000 - (-239.53) - 6958.12 = 11000 + 239.53 - 6958.12 = 4281.41

const a = -239.53;
const b = 6958.12;
const c = 4281.41;

console.log('Коэффициенты полинома:');
console.log(`  a = ${a.toFixed(2)}`);
console.log(`  b = ${b.toFixed(2)}`);
console.log(`  c = ${c.toFixed(2)}`);
console.log('');
console.log('Результаты интерполяции:');
for (let vol = 1; vol <= 6; vol++) {
  const calculated = Math.round(a * vol * vol + b * vol + c);
  const logistic = logicData.logisticPrices[vol];
  const diff = calculated - logistic;
  console.log(`  ${vol} м³: ${calculated.toLocaleString('ru-RU')} ₽ (логист: ${logistic.toLocaleString('ru-RU')} ₽, разница: ${diff > 0 ? '+' : ''}${diff} ₽)`);
}
console.log('');

// Вариант 2: Podacha + пропорциональный рост
console.log('ВАРИАНТ 2: Podacha + пропорциональный рост');
console.log('Формула: price = PODACHA + (объем × стоимость_1_м³)');
console.log('Подбираем PODACHA и стоимость_1_м³ так, чтобы:');
console.log('  - 6 м³ = 37,407 ₽ (реперная точка)');
console.log('  - 1 м³ ≈ 11,000 ₽ (данные логиста)');
console.log('');

// Если 6 м³ = PODACHA + 6 × costPerM3 = 37407
// Если 1 м³ = PODACHA + 1 × costPerM3 ≈ 11000
// Тогда: (PODACHA + 6c) - (PODACHA + 1c) = 37407 - 11000 => 5c = 26407 => c = 5281.4
// PODACHA = 11000 - 5281.4 = 5718.6

const podacha = 5718.6;
const costPerM3 = 5281.4;

console.log(`PODACHA = ${podacha.toFixed(2)} ₽`);
console.log(`Стоимость 1 м³ = ${costPerM3.toFixed(2)} ₽`);
console.log('');
console.log('Результаты расчета:');
for (let vol = 1; vol <= 6; vol++) {
  const calculated = Math.round(podacha + (vol * costPerM3));
  const logistic = logicData.logisticPrices[vol];
  const diff = calculated - logistic;
  console.log(`  ${vol} м³: ${calculated.toLocaleString('ru-RU')} ₽ (логист: ${logistic.toLocaleString('ru-RU')} ₽, разница: ${diff > 0 ? '+' : ''}${diff} ₽)`);
}
console.log('');

// Вариант 3: Ступенчатая функция с разными podacha
console.log('ВАРИАНТ 3: Ступенчатая функция с разными podacha');
console.log('Используем разные podacha для разных диапазонов объемов');
console.log('');

const podachaByRange = {
  '1-2': 5500,
  '3-4': 7000,
  '5-6': 8500
};

const costPerM3ByRange = {
  '1-2': 5500, // чтобы 2 м³ ≈ 16,000
  '3-4': 5000, // чтобы 4 м³ ≈ 27,000
  '5-6': 4800  // чтобы 6 м³ = 37,407
};

console.log('Параметры по диапазонам:');
console.log('  1-2 м³: PODACHA = 5,500 ₽, стоимость_1_м³ = 5,500 ₽');
console.log('  3-4 м³: PODACHA = 7,000 ₽, стоимость_1_м³ = 5,000 ₽');
console.log('  5-6 м³: PODACHA = 8,500 ₽, стоимость_1_м³ = 4,800 ₽');
console.log('');
console.log('Результаты расчета:');
for (let vol = 1; vol <= 6; vol++) {
  let pod, cost;
  if (vol <= 2) {
    pod = podachaByRange['1-2'];
    cost = costPerM3ByRange['1-2'];
  } else if (vol <= 4) {
    pod = podachaByRange['3-4'];
    cost = costPerM3ByRange['3-4'];
  } else {
    pod = podachaByRange['5-6'];
    cost = costPerM3ByRange['5-6'];
  }
  const calculated = Math.round(pod + (vol * cost));
  const logistic = logicData.logisticPrices[vol];
  const diff = calculated - logistic;
  console.log(`  ${vol} м³: ${calculated.toLocaleString('ru-RU')} ₽ (логист: ${logistic.toLocaleString('ru-RU')} ₽, разница: ${diff > 0 ? '+' : ''}${diff} ₽)`);
}
console.log('');

// Вариант 4: Линейная интерполяция между ключевыми точками
console.log('ВАРИАНТ 4: Линейная интерполяция между ключевыми точками');
console.log('Используем прямые линии между точками логиста');
console.log('');

function linearInterpolation(x1, y1, x2, y2, x) {
  const slope = (y2 - y1) / (x2 - x1);
  return y1 + slope * (x - x1);
}

console.log('Сегменты:');
console.log('  1-2 м³: линейная между (1, 11000) и (2, 16000)');
console.log('  2-3 м³: линейная между (2, 16000) и (3, 23000)');
console.log('  3-4 м³: линейная между (3, 23000) и (4, 27000)');
console.log('  4-5 м³: линейная между (4, 27000) и (5, 31000)');
console.log('  5-6 м³: линейная между (5, 31000) и (6, 37407)');
console.log('');
console.log('Результаты интерполяции:');
for (let vol = 1; vol <= 6; vol++) {
  let calculated;
  if (vol === 1) calculated = 11000;
  else if (vol === 2) calculated = 16000;
  else if (vol === 3) calculated = 23000;
  else if (vol === 4) calculated = 27000;
  else if (vol === 5) calculated = 31000;
  else if (vol === 6) calculated = logicData.reference6m3;
  
  // Для дробных значений используем интерполяцию
  if (vol < 2) calculated = linearInterpolation(1, 11000, 2, 16000, vol);
  else if (vol < 3) calculated = linearInterpolation(2, 16000, 3, 23000, vol);
  else if (vol < 4) calculated = linearInterpolation(3, 23000, 4, 27000, vol);
  else if (vol < 5) calculated = linearInterpolation(4, 27000, 5, 31000, vol);
  else if (vol < 6) calculated = linearInterpolation(5, 31000, 6, logicData.reference6m3, vol);
  else calculated = logicData.reference6m3;
  
  calculated = Math.round(calculated);
  const logistic = logicData.logisticPrices[vol];
  const diff = calculated - logistic;
  console.log(`  ${vol} м³: ${calculated.toLocaleString('ru-RU')} ₽ (логист: ${logistic.toLocaleString('ru-RU')} ₽, разница: ${diff > 0 ? '+' : ''}${diff} ₽)`);
}
console.log('');

// Вариант 5: Экспоненциальный рост с podacha
console.log('ВАРИАНТ 5: Экспоненциальный/степенной рост');
console.log('Формула: price = PODACHA + baseCost × volume^exponent');
console.log('Подбираем параметры для соответствия данным логиста');
console.log('');

// Подбираем вручную для достижения нужных значений
const basePodacha = 8500;
const baseCost = 4500;
const exponent = 1.15; // немного больше линейного для ускорения роста

console.log(`PODACHA = ${basePodacha.toFixed(0)} ₽`);
console.log(`Базовая стоимость = ${baseCost.toFixed(0)} ₽`);
console.log(`Показатель степени = ${exponent.toFixed(2)}`);
console.log('Результаты расчета:');
for (let vol = 1; vol <= 6; vol++) {
  const calculated = Math.round(basePodacha + (baseCost * Math.pow(vol, exponent)));
  const logistic = logicData.logisticPrices[vol];
  const diff = calculated - logistic;
  console.log(`  ${vol} м³: ${calculated.toLocaleString('ru-RU')} ₽ (логист: ${logistic.toLocaleString('ru-RU')} ₽, разница: ${diff > 0 ? '+' : ''}${diff} ₽)`);
}

console.log('');
console.log('РЕКОМЕНДАЦИЯ:');
console.log('Лучше всего подходит Вариант 4 (линейная интерполяция) - он точно');
console.log('соответствует данным логиста для целых значений и плавно');
console.log('интерполирует для дробных. Альтернатива - Вариант 1 (полином)');
console.log('для более гладкой кривой.');

