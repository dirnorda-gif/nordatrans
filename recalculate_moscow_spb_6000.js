// Расчет для Москва → Санкт-Петербург с подачей 6000

const route = {
  name: "Москва → Санкт-Петербург",
  distance: 704,
  tariff15t: 33.9,
  tariff3t: 0, // Рассчитаем через коэффициент
  tariff5t: 53.8,
  tariff10t: 72.9,
  tariff20t: 94.5,
};

// Константы
const PODACHA_6000 = 6000;
const TRUCK_20T_CAPACITY = 80; // 20т = 80 м³
const MINIMUM_COST = 7500;
const MIN_LOAD_FACTOR = 0.3;

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

console.log('МОСКВА → САНКТ-ПЕТЕРБУРГ');
console.log(`(${route.distance} км, тариф 20т: ${route.tariff20t} ₽/км)`);
console.log(`Подача (PODACHA): ${PODACHA_6000.toLocaleString('ru-RU')} ₽`);
console.log('');
console.log('Объем    Старая логика    Новый расчет');
console.log('');

for (let volume = 1; volume <= 20; volume++) {
  // СТАРАЯ ЛОГИКА: определяем категорию машины и используем её тариф
  const category = getTruckCategoryForVolume(volume);
  const truckCapacity = TRUCK_CAPACITY[category];
  const tariff = getTariffForCategory(route, category);
  const fullTruckCost = tariff * route.distance;
  
  const loadFactor = Math.max(volume / truckCapacity, MIN_LOAD_FACTOR);
  const oldCost = Math.round(fullTruckCost * loadFactor);
  const oldCostFinal = Math.max(oldCost, MINIMUM_COST);
  
  // НОВЫЙ РАСЧЕТ: все объемы от 20т фуры с podacha 6000
  let newCost;
  
  if (volume >= TRUCK_20T_CAPACITY) {
    // Для полной 20т фуры (80 м³) - без podacha, полная стоимость
    newCost = Math.round(full20tCost);
  } else {
    // Для всех остальных объемов: podacha + (объем × стоимость_1_м³)
    // где стоимость_1_м³ = (полная_стоимость_20т - podacha) / 80
    const costPerM3 = (full20tCost - PODACHA_6000) / TRUCK_20T_CAPACITY;
    const calc = Math.round(PODACHA_6000 + (volume * costPerM3));
    newCost = Math.max(calc, MINIMUM_COST);
  }
  
  const volumeStr = `${volume} м³`.padEnd(9);
  const oldStr = `${oldCostFinal.toLocaleString('ru-RU')} ₽`.padEnd(17);
  const newStr = `${newCost.toLocaleString('ru-RU')} ₽`;
  
  console.log(`${volumeStr}${oldStr}${newStr}`);
}

console.log('');
console.log('Примечание: Новый расчет основан на 20т фуре (80 м³)');
console.log(`Стоимость 1 м³ = (${full20tCost.toFixed(0)} - ${PODACHA_6000}) / 80 = ${((full20tCost - PODACHA_6000) / 80).toFixed(2)} ₽`);

