// Тест нового правила проверки минимального тарифа
// Маршрут: Москва → Краснодар (несколько нулей в тарифах)

// Данные маршрута
const route = {
  name: "Москва → Краснодар",
  distance: 1347,
  // Тарифы из базы: "95.2/72.5/57.5/0/0/0"
  // Формат: "20т/10т/5т/3т/1.5т/500кг"
  tariffs: {
    "20т": 95.2,
    "10т": 72.5,
    "5т": 57.5,
    "3т": 0,      // Отсутствует - будет рассчитываться
    "1.5т": 0,    // Отсутствует - будет рассчитываться
    "500кг": 0,   // Отсутствует - будет рассчитываться
  }
};

// Коэффициенты для расчета (из fromMoscow)
const coefficients = {
  "10т": 0.81,
  "5т": 0.76,
  "3т": 0.33,
  "1.5т": 0.22,
  "500кг": 0.15
};

// Порядок категорий
const categoryOrder = ["20т", "10т", "5т", "3т", "1.5т", "500кг"];

// Функция расчета тарифа БЕЗ правила (старая логика)
function calculateTariffWithoutRule(category) {
  const tariff = route.tariffs[category];
  
  if (tariff && tariff > 0) {
    return tariff; // Тариф есть в базе
  }
  
  // Рассчитываем через коэффициент от 20т
  const base20tRate = route.tariffs["20т"];
  if (category !== "20т" && base20tRate > 0) {
    const coefficient = coefficients[category];
    return base20tRate * coefficient;
  }
  
  return base20tRate;
}

// Функция расчета тарифа С правилом (новая логика)
function calculateTariffWithRule(category) {
  const tariff = route.tariffs[category];
  
  if (tariff && tariff > 0) {
    return tariff; // Тариф есть в базе
  }
  
  // Рассчитываем через коэффициент от 20т
  const base20tRate = route.tariffs["20т"];
  let costPerKm;
  
  if (category !== "20т" && base20tRate > 0) {
    const coefficient = coefficients[category];
    costPerKm = base20tRate * coefficient;
    
    // 🆕 ПРАВИЛО: Рассчитанный тариф не должен быть меньше предыдущей категории
    const currentIndex = categoryOrder.indexOf(category);
    
    if (currentIndex > 0) {
      // Ищем предыдущую категорию с ненулевым тарифом
      for (let i = currentIndex - 1; i >= 0; i--) {
        const prevCategory = categoryOrder[i];
        const prevTariff = route.tariffs[prevCategory];
        
        // Если предыдущая категория имеет тариф (не 0)
        if (prevTariff && prevTariff > 0) {
          // Если рассчитанный тариф меньше предыдущего, используем предыдущий
          if (costPerKm < prevTariff) {
            costPerKm = prevTariff;
          }
          break;
        }
      }
    }
    
    return costPerKm;
  }
  
  return base20tRate;
}

console.log('ТЕСТ ПРАВИЛА ПРОВЕРКИ МИНИМАЛЬНОГО ТАРИФА');
console.log('Маршрут: ' + route.name);
console.log('Расстояние: ' + route.distance + ' км');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

console.log('ТАРИФЫ В БАЗЕ:');
console.log('  20т:   ' + route.tariffs["20т"] + ' ₽/км');
console.log('  10т:   ' + route.tariffs["10т"] + ' ₽/км');
console.log('  5т:    ' + route.tariffs["5т"] + ' ₽/км');
console.log('  3т:    ' + (route.tariffs["3т"] || '0 (рассчитывается)'));
console.log('  1.5т:  ' + (route.tariffs["1.5т"] || '0 (рассчитывается)'));
console.log('  500кг: ' + (route.tariffs["500кг"] || '0 (рассчитывается)'));
console.log('');

console.log('РАСЧЕТ ТАРИФОВ:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Категория    БЕЗ правила    С правилом    Изменение    Стоимость полной машины');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

for (const category of categoryOrder) {
  const withoutRule = calculateTariffWithoutRule(category);
  const withRule = calculateTariffWithRule(category);
  const change = withRule !== withoutRule;
  const fullMachineCost = Math.round(withRule * route.distance);
  
  const catStr = category.padEnd(10);
  const withoutStr = `${withoutRule.toFixed(2)} ₽/км`.padEnd(17);
  const withStr = `${withRule.toFixed(2)} ₽/км`.padEnd(16);
  const changeStr = change ? '✓ ИЗМЕНЕНО' : '─'.padEnd(12);
  const costStr = `${fullMachineCost.toLocaleString('ru-RU')} ₽`;
  
  console.log(`${catStr}${withoutStr}${withStr}${changeStr}${costStr}`);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// Детальный анализ для категорий с нулями
console.log('ДЕТАЛЬНЫЙ АНАЛИЗ ДЛЯ КАТЕГОРИЙ С ОТСУТСТВУЮЩИМИ ТАРИФАМИ:');
console.log('');

// 3т
const tariff3t_without = calculateTariffWithoutRule("3т");
const tariff3t_with = calculateTariffWithRule("3т");
console.log('3т:');
console.log(`  Расчет через коэффициент: ${route.tariffs["20т"]} × ${coefficients["3т"]} = ${tariff3t_without.toFixed(2)} ₽/км`);
console.log(`  Предыдущая категория (5т): ${route.tariffs["5т"]} ₽/км`);
if (tariff3t_without < route.tariffs["5т"]) {
  console.log(`  ⚠ Проблема: ${tariff3t_without.toFixed(2)} < ${route.tariffs["5т"]} → используется ${route.tariffs["5т"]} ₽/км`);
} else {
  console.log(`  ✓ OK: ${tariff3t_without.toFixed(2)} >= ${route.tariffs["5т"]}`);
}
console.log(`  Итоговый тариф: ${tariff3t_with.toFixed(2)} ₽/км`);
console.log('');

// 1.5т
const tariff15t_without = calculateTariffWithoutRule("1.5т");
const tariff15t_with = calculateTariffWithRule("1.5т");
console.log('1.5т:');
console.log(`  Расчет через коэффициент: ${route.tariffs["20т"]} × ${coefficients["1.5т"]} = ${tariff15t_without.toFixed(2)} ₽/км`);
// Ищем предыдущую категорию (3т теперь тоже рассчитывается)
let prevCategory15t = "5т";
let prevTariff15t = route.tariffs["5т"];
if (!prevTariff15t || prevTariff15t === 0) {
  prevCategory15t = "10т";
  prevTariff15t = route.tariffs["10т"];
}
console.log(`  Предыдущая категория (${prevCategory15t}): ${prevTariff15t} ₽/км`);
if (tariff15t_without < prevTariff15t) {
  console.log(`  ⚠ Проблема: ${tariff15t_without.toFixed(2)} < ${prevTariff15t} → используется ${prevTariff15t} ₽/км`);
} else {
  console.log(`  ✓ OK: ${tariff15t_without.toFixed(2)} >= ${prevTariff15t}`);
}
console.log(`  Итоговый тариф: ${tariff15t_with.toFixed(2)} ₽/км`);
console.log('');

// 500кг
const tariff500_without = calculateTariffWithoutRule("500кг");
const tariff500_with = calculateTariffWithRule("500кг");
console.log('500кг:');
console.log(`  Расчет через коэффициент: ${route.tariffs["20т"]} × ${coefficients["500кг"]} = ${tariff500_without.toFixed(2)} ₽/км`);
// Ищем предыдущую категорию
let prevCategory500 = "1.5т";
let prevTariff500 = route.tariffs["1.5т"] || tariff15t_with; // Используем рассчитанный тариф 1.5т
if (!prevTariff500 || prevTariff500 === 0) {
  prevCategory500 = "3т";
  prevTariff500 = route.tariffs["3т"] || tariff3t_with;
}
if (!prevTariff500 || prevTariff500 === 0) {
  prevCategory500 = "5т";
  prevTariff500 = route.tariffs["5т"];
}
console.log(`  Предыдущая категория (${prevCategory500}): ${prevTariff500.toFixed(2)} ₽/км`);
if (tariff500_without < prevTariff500) {
  console.log(`  ⚠ Проблема: ${tariff500_without.toFixed(2)} < ${prevTariff500.toFixed(2)} → используется ${prevTariff500.toFixed(2)} ₽/км`);
} else {
  console.log(`  ✓ OK: ${tariff500_without.toFixed(2)} >= ${prevTariff500.toFixed(2)}`);
}
console.log(`  Итоговый тариф: ${tariff500_with.toFixed(2)} ₽/км`);
console.log('');

console.log('ВЫВОД:');
console.log('Правило автоматически исправляет ситуации, когда рассчитанный через');
console.log('коэффициент тариф получается меньше тарифа предыдущей категории.');
console.log('Это предотвращает падение цен при переходе к меньшим категориям машин.');

