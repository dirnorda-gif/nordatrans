// Единый алгоритм с разными значениями podacha для разных категорий объемов

const route = {
  name: "Москва → Санкт-Петербург",
  distance: 704,
  tariff15t: 33.9,
  tariff3t: 0,
  tariff5t: 53.8,
  tariff10t: 72.9,
  tariff20t: 94.5,
};

// Константы
const TRUCK_20T_CAPACITY = 80;
const MINIMUM_COST = 7500;
const MIN_LOAD_FACTOR = 0.3;

// Целевая стоимость 6 м³ (справедливая цена из старой логики)
const TARGET_COST_6M3 = 23866;

// Вместимость машин (для старой логики)
const TRUCK_CAPACITY = {
  "1.5т": 6,
  "3т": 12,
  "5т": 20,
  "10т": 40,
  "20т": 80,
};

// Коэффициенты
const COEFF_3T_FROM_MOSCOW = 0.33;

function getTruckCategoryForVolume(volume) {
  if (volume <= 6) return "1.5т";
  if (volume <= 12) return "3т";
  if (volume <= 20) return "5т";
  if (volume <= 40) return "10т";
  return "20т";
}

function getTariffForCategory(route, category) {
  switch(category) {
    case "1.5т": return route.tariff15t;
    case "3т": return route.tariff3t > 0 ? route.tariff3t : route.tariff20t * COEFF_3T_FROM_MOSCOW;
    case "5т": return route.tariff5t;
    case "10т": return route.tariff10t;
    case "20т": return route.tariff20t;
  }
}

const full20tCost = route.tariff20t * route.distance;
const costPerM3 = full20tCost / TRUCK_20T_CAPACITY; // 831.60 ₽

// Подбираем PODACHA для разных категорий объемов
// Для 1-6 м³: подбираем так, чтобы 6 м³ = 23,866 ₽
const PODACHA_1_6 = TARGET_COST_6M3 - (6 * costPerM3); // 18,876 ₽

// Для 7-12 м³: подбираем так, чтобы 7 м³ был немного больше 6 м³
// 7 м³ должен быть >= 23,866 + небольшая разница
const target7m3 = TARGET_COST_6M3 + 1000; // Например, 24,866 ₽
const PODACHA_7_12 = target7m3 - (7 * costPerM3); // ~19,045 ₽

// Для 13-20 м³: подбираем так, чтобы 13 м³ был немного больше 12 м³
const cost12m3 = PODACHA_7_12 + (12 * costPerM3);
const target13m3 = Math.max(cost12m3, 24619) + 500; // Немного больше старой логики
const PODACHA_13_20 = target13m3 - (13 * costPerM3);

function getPodachaForVolume(volume) {
  if (volume <= 6) return PODACHA_1_6;
  if (volume <= 12) return PODACHA_7_12;
  if (volume <= 20) return PODACHA_13_20;
  return 0; // Для полной 20т без podacha
}

console.log('МОСКВА → САНКТ-ПЕТЕРБУРГ');
console.log(`(${route.distance} км, тариф 20т: ${route.tariff20t} ₽/км)`);
console.log('');
console.log('ЕДИНЫЙ АЛГОРИТМ С РАЗНЫМИ PODACHA:');
console.log(`Стоимость 1 м³ (от 20т) = ${costPerM3.toFixed(2)} ₽`);
console.log('');
console.log('PODACHA по категориям:');
console.log(`  1-6 м³:  ${PODACHA_1_6.toFixed(0)} ₽ (подобрана для 6 м³ = 23,866 ₽)`);
console.log(`  7-12 м³: ${PODACHA_7_12.toFixed(0)} ₽`);
console.log(`  13-20 м³: ${PODACHA_13_20.toFixed(0)} ₽`);
console.log('');
console.log('Формула: Итоговая стоимость = PODACHA(категория) + (объем × 831.60)');
console.log('');
console.log('Объем    Старая логика    Единый алгоритм    PODACHA');
console.log('');

let prevNewCost = 0;

for (let volume = 1; volume <= 20; volume++) {
  // СТАРАЯ ЛОГИКА
  const category = getTruckCategoryForVolume(volume);
  const truckCapacity = TRUCK_CAPACITY[category];
  const tariff = getTariffForCategory(route, category);
  const fullTruckCost = tariff * route.distance;
  
  const loadFactor = Math.max(volume / truckCapacity, MIN_LOAD_FACTOR);
  const oldCost = Math.round(fullTruckCost * loadFactor);
  const oldCostFinal = Math.max(oldCost, MINIMUM_COST);
  
  // ЕДИНЫЙ АЛГОРИТМ: podacha зависит от категории объема
  const podacha = getPodachaForVolume(volume);
  let calc;
  
  if (volume >= TRUCK_20T_CAPACITY) {
    // Для полной 20т фуры (80 м³) - без podacha, полная стоимость
    calc = Math.round(full20tCost);
  } else {
    calc = Math.round(podacha + (volume * costPerM3));
    
    // ВАЖНО: стоимость не может быть меньше предыдущей
    if (calc < prevNewCost) {
      calc = prevNewCost;
    }
  }
  
  const unifiedCost = Math.max(calc, MINIMUM_COST);
  prevNewCost = unifiedCost;
  
  const volumeStr = `${volume} м³`.padEnd(9);
  const oldStr = `${oldCostFinal.toLocaleString('ru-RU')} ₽`.padEnd(17);
  const newStr = `${unifiedCost.toLocaleString('ru-RU')} ₽`.padEnd(20);
  const podachaStr = `${podacha.toFixed(0)} ₽`;
  
  console.log(`${volumeStr}${oldStr}${newStr}${podachaStr}`);
}

console.log('');
console.log('ПРОВЕРКА:');
console.log(`6 м³ = ${PODACHA_1_6.toFixed(0)} + (6 × ${costPerM3.toFixed(2)}) = ${Math.round(PODACHA_1_6 + (6 * costPerM3))} ₽`);
console.log(`Целевая стоимость 6 м³: ${TARGET_COST_6M3} ₽`);

