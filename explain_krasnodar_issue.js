// Объяснение, почему для Москва → Краснодар цены 6-20 м³ одинаковые

console.log('ОБЪЯСНЕНИЕ: Почему цены 6-20 м³ одинаковые для Москва → Краснодар');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// Тарифы в базе данных
const tariffsBase = {
  "20т": 95.2,
  "10т": 72.5,
  "5т": 57.5,
  "3т": 0,      // Отсутствует
  "1.5т": 0,    // Отсутствует
  "500кг": 0,   // Отсутствует
};

// Коэффициенты
const coefficients = {
  "3т": 0.33,
  "1.5т": 0.22,
  "500кг": 0.15,
};

console.log('ШАГ 1: Тарифы в базе данных');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Категория    Тариф в базе');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
for (const [cat, tariff] of Object.entries(tariffsBase)) {
  console.log(`${cat.padEnd(10)}${tariff > 0 ? tariff + ' ₽/км' : '0 (отсутствует, рассчитывается)'}`);
}
console.log('');

console.log('ШАГ 2: Расчет тарифов через коэффициент от 20т');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Формула: Тариф = Тариф_20т × Коэффициент');
console.log('');

// Расчет через коэффициент
const calculated3t = tariffsBase["20т"] * coefficients["3т"];
const calculated15t = tariffsBase["20т"] * coefficients["1.5т"];
const calculated500 = tariffsBase["20т"] * coefficients["500кг"];

console.log('3т:   95.2 × 0.33 = ' + calculated3t.toFixed(2) + ' ₽/км');
console.log('1.5т: 95.2 × 0.22 = ' + calculated15t.toFixed(2) + ' ₽/км');
console.log('500кг: 95.2 × 0.15 = ' + calculated500.toFixed(2) + ' ₽/км');
console.log('');

console.log('ШАГ 3: Применение правила минимального тарифа');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Правило: Рассчитанный тариф не должен быть меньше предыдущей категории');
console.log('');

// Проверка для 3т
console.log('Для категории 3т:');
console.log(`  Рассчитанный тариф: ${calculated3t.toFixed(2)} ₽/км`);
console.log(`  Предыдущая категория (5т): ${tariffsBase["5т"]} ₽/км`);
if (calculated3t < tariffsBase["5т"]) {
  console.log(`  ⚠ ПРОБЛЕМА: ${calculated3t.toFixed(2)} < ${tariffsBase["5т"]}`);
  console.log(`  → Применено правило: используется тариф 5т = ${tariffsBase["5т"]} ₽/км`);
  const final3t = tariffsBase["5т"];
  console.log(`  ИТОГОВЫЙ тариф 3т: ${final3t} ₽/км`);
  console.log('');
  
  // Проверка для 1.5т
  console.log('Для категории 1.5т:');
  console.log(`  Рассчитанный тариф: ${calculated15t.toFixed(2)} ₽/км`);
  console.log(`  Предыдущая категория (3т): ${final3t} ₽/км (уже скорректирован)`);
  if (calculated15t < final3t) {
    console.log(`  ⚠ ПРОБЛЕМА: ${calculated15t.toFixed(2)} < ${final3t}`);
    console.log(`  → Применено правило: используется тариф 3т = ${final3t} ₽/км`);
    const final15t = final3t;
    console.log(`  ИТОГОВЫЙ тариф 1.5т: ${final15t} ₽/км`);
    console.log('');
    
    // Итоговая таблица
    console.log('ШАГ 4: ИТОГОВЫЕ ТАРИФЫ');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Категория    Итоговый тариф    Полная машина (1347 км)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`1.5т        ${final15t.toFixed(2)} ₽/км        ${Math.round(final15t * 1347).toLocaleString('ru-RU')} ₽ (6 м³)`);
    console.log(`3т          ${final3t.toFixed(2)} ₽/км        ${Math.round(final3t * 1347).toLocaleString('ru-RU')} ₽ (12 м³)`);
    console.log(`5т          ${tariffsBase["5т"].toFixed(2)} ₽/км        ${Math.round(tariffsBase["5т"] * 1347).toLocaleString('ru-RU')} ₽ (20 м³)`);
    console.log(`10т         ${tariffsBase["10т"].toFixed(2)} ₽/км        ${Math.round(tariffsBase["10т"] * 1347).toLocaleString('ru-RU')} ₽ (40 м³)`);
    console.log(`20т         ${tariffsBase["20т"].toFixed(2)} ₽/км        ${Math.round(tariffsBase["20т"] * 1347).toLocaleString('ru-RU')} ₽ (80 м³)`);
    console.log('');
    
    console.log('ВЫВОД:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Все категории 1.5т, 3т и 5т имеют ОДИНАКОВЫЙ тариф = 57.5 ₽/км');
    console.log('поэтому полные машины этих категорий стоят одинаково:');
    console.log('  • 6 м³ (1.5т) = 77,453 ₽');
    console.log('  • 12 м³ (3т) = 77,453 ₽');
    console.log('  • 20 м³ (5т) = 77,453 ₽');
    console.log('');
    console.log('Это происходит потому что:');
    console.log('1. Тарифы 3т и 1.5т отсутствуют в базе');
    console.log('2. Расчет через коэффициент дает слишком низкие значения');
    console.log('3. Правило поднимает их до тарифа предыдущей категории (5т)');
    console.log('4. В результате все три категории равны тарифу 5т');
    console.log('');
    console.log('РЕШЕНИЕ:');
    console.log('Нужно добавить реальные тарифы для 3т и 1.5т в базу данных,');
    console.log('чтобы они не рассчитывались через коэффициент и правило не применялось.');
  }
}

