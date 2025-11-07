// Единый алгоритм: фиксированная podacha, разные стоимости 1 м³ для категорий

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
const PODACHA = 6000; // Фиксированная podacha для всех
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

// Подбираем стоимость 1 м³ для каждой категории объемов
// Для 1-6 м³: подбираем так, чтобы 6 м³ = 23,866 ₽
const costPerM3_1_6 = (TARGET_COST_6M3 - PODACHA) / 6; // 2,977.67 ₽

// Для 7-12 м³: используем стоимость от 20т, но подбираем podacha так, чтобы 7 м³ >= 6 м³
const costPerM3_7_12 = full20tCost / TRUCK_20T_CAPACITY; // 831.60 ₽
const cost6m3 = PODACHA + (6 * costPerM3_1_6); // 23,866 ₽
const target7m3 = cost6m3 + 500; // 24,366 ₽ (немного выше 6 м³)
const PODACHA_7_12 = target7m3 - (7 * costPerM3_7_12); // Подбираем podacha

// Для 13-20 м³: используем стоимость от 20т, подбираем podacha
const cost12m3 = PODACHA_7_12 + (12 * costPerM3_7_12);
const target13m3 = Math.max(cost12m3, 24619) + 200;
const costPerM3_13_20 = full20tCost / TRUCK_20T_CAPACITY; // 831.60 ₽
const PODACHA_13_20 = target13m3 - (13 * costPerM3_13_20);

function getCostPerM3ForVolume(volume) {
  if (volume <= 6) return costPerM3_1_6;
  if (volume <= 12) return costPerM3_7_12;
  if (volume <= 20) return costPerM3_13_20;
  return costPerM3_13_20; // Для больших объемов
}

console.log('МОСКВА → САНКТ-ПЕТЕРБУРГ');
console.log(`(${route.distance} км, тариф 20т: ${route.tariff20t} ₽/км)`);
console.log('');
console.log('ЕДИНЫЙ АЛГОРИТМ:');
console.log(`PODACHA (фиксированная для всех): ${PODACHA.toLocaleString('ru-RU')} ₽`);
console.log('');
console.log('PODACHA и стоимость 1 м³ по категориям:');
console.log(`  1-6 м³:  PODACHA = ${PODACHA} ₽, стоимость_1_м³ = ${costPerM3_1_6.toFixed(2)} ₽`);
console.log(`  7-12 м³: PODACHA = ${PODACHA_7_12.toFixed(0)} ₽, стоимость_1_м³ = ${costPerM3_7_12.toFixed(2)} ₽`);
console.log(`  13-20 м³: PODACHA = ${PODACHA_13_20.toFixed(0)} ₽, стоимость_1_м³ = ${costPerM3_13_20.toFixed(2)} ₽`);
console.log('');
console.log('Формула: Итоговая стоимость = PODACHA(категория) + (объем × стоимость_1_м³(категория))');
console.log('');
console.log('Объем    Старая логика    Единый алгоритм');
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
  
  // ЕДИНЫЙ АЛГОРИТМ: podacha и стоимость 1 м³ зависят от категории
  let calc;
  
  if (volume >= TRUCK_20T_CAPACITY) {
    // Для полной 20т фуры (80 м³) - без podacha, полная стоимость
    calc = Math.round(full20tCost);
  } else {
    let podacha_used, costPerM3_used;
    
    if (volume <= 6) {
      podacha_used = PODACHA;
      costPerM3_used = costPerM3_1_6;
    } else if (volume <= 12) {
      podacha_used = PODACHA_7_12;
      costPerM3_used = costPerM3_7_12;
    } else {
      podacha_used = PODACHA_13_20;
      costPerM3_used = costPerM3_13_20;
    }
    
    calc = Math.round(podacha_used + (volume * costPerM3_used));
    
    // ВАЖНО: стоимость не может быть меньше предыдущей
    if (calc < prevNewCost) {
      calc = prevNewCost;
    }
  }
  
  const unifiedCost = Math.max(calc, MINIMUM_COST);
  prevNewCost = unifiedCost;
  
  const volumeStr = `${volume} м³`.padEnd(9);
  const oldStr = `${oldCostFinal.toLocaleString('ru-RU')} ₽`.padEnd(17);
  const newStr = `${unifiedCost.toLocaleString('ru-RU')} ₽`;
  
  console.log(`${volumeStr}${oldStr}${newStr}`);
}

console.log('');
console.log('ПРОВЕРКА:');
console.log(`6 м³ = ${PODACHA} + (6 × ${costPerM3_1_6.toFixed(2)}) = ${Math.round(PODACHA + (6 * costPerM3_1_6))} ₽`);
console.log(`Целевая стоимость 6 м³: ${TARGET_COST_6M3} ₽`);

