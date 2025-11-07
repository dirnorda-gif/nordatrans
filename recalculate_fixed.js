// Пересчет: новая логика от 20т, старая логика - правильная (по категориям машин)

const routes = [
  {
    name: "Москва → Санкт-Петербург",
    distance: 704,
    tariff15t: 33.9,
    tariff3t: 0, // Рассчитаем через коэффициент
    tariff5t: 53.8,
    tariff10t: 72.9,
    tariff20t: 94.5,
  },
  {
    name: "Москва → Ярославль",
    distance: 282,
    tariff15t: 56.7,
    tariff3t: 0,
    tariff5t: 83.2,
    tariff10t: 90.9,
    tariff20t: 132.0,
  },
  {
    name: "Москва → Ростов-на-Дону",
    distance: 1078,
    tariff15t: 34.7,
    tariff3t: 0,
    tariff5t: 58.9,
    tariff10t: 68.0,
    tariff20t: 99.0,
  },
  {
    name: "Москва → Новосибирск",
    distance: 3267,
    tariff20t: 73.8,
  }
];

// Константы
const PODACHA_3000 = 3000;
const PODACHA_4000 = 4000;
const TRUCK_20T_CAPACITY = 80; // 20т = 80 м³
const MINIMUM_COST = 7500;
const MIN_LOAD_FACTOR = 0.3;

// Вместимость машин (по старой логике)
const TRUCK_CAPACITY = {
  "1.5т": 6,
  "3т": 12,
  "5т": 20,
  "10т": 40,
  "20т": 80,
};

// Коэффициенты
const COEFF_3T_FROM_MOSCOW = 0.33;
const COEFF_15T_FROM_MOSCOW = 0.22;
const COEFF_5T_FROM_MOSCOW = 0.76;
const COEFF_10T_FROM_MOSCOW = 0.81;

function getTruckCategoryForVolume(volume) {
  if (volume <= 6) return "1.5т";
  if (volume <= 12) return "3т";
  if (volume <= 20) return "5т";
  if (volume <= 40) return "10т";
  return "20т";
}

function getTariffForCategory(route, category) {
  if (route.name === "Москва → Новосибирск") {
    switch(category) {
      case "1.5т": return route.tariff20t * COEFF_15T_FROM_MOSCOW;
      case "3т": return route.tariff20t * COEFF_3T_FROM_MOSCOW;
      case "5т": return route.tariff20t * COEFF_5T_FROM_MOSCOW;
      case "10т": return route.tariff20t * COEFF_10T_FROM_MOSCOW;
      case "20т": return route.tariff20t;
    }
  }
  
  switch(category) {
    case "1.5т": return route.tariff15t;
    case "3т": return route.tariff3t > 0 ? route.tariff3t : route.tariff20t * COEFF_3T_FROM_MOSCOW;
    case "5т": return route.tariff5t > 0 ? route.tariff5t : route.tariff20t * COEFF_5T_FROM_MOSCOW;
    case "10т": return route.tariff10t > 0 ? route.tariff10t : route.tariff20t * COEFF_10T_FROM_MOSCOW;
    case "20т": return route.tariff20t;
  }
}

let output = '';

for (const route of routes) {
  const full20tCost = route.tariff20t * route.distance;
  
  output += `${route.name}\n`;
  if (route.name === "Москва → Новосибирск") {
    output += `(${route.distance} км, тариф 20т: ${route.tariff20t} ₽/км)\n`;
  } else {
    output += `(${route.distance} км, тариф 20т: ${route.tariff20t} ₽/км)\n`;
  }
  output += '\n';
  output += 'Объем    Старая логика    Подача 3000    Подача 4000\n';
  
  let prevNewCost_3000 = 0;
  let prevNewCost_4000 = 0;
  
  for (let volume = 1; volume <= 20; volume++) {
    // СТАРАЯ ЛОГИКА (правильная): определяем категорию машины и используем её тариф
    const category = getTruckCategoryForVolume(volume);
    const truckCapacity = TRUCK_CAPACITY[category];
    const tariff = getTariffForCategory(route, category);
    const fullTruckCost = tariff * route.distance;
    
    const loadFactor = Math.max(volume / truckCapacity, MIN_LOAD_FACTOR);
    const oldCost = Math.round(fullTruckCost * loadFactor);
    const oldCostFinal = Math.max(oldCost, MINIMUM_COST);
    
    // НОВАЯ ЛОГИКА: все объемы от 20т фуры с podacha (кроме полной 80 м³)
    let newCost_3000, newCost_4000;
    
    if (volume >= TRUCK_20T_CAPACITY) {
      // Для полной 20т фуры (80 м³) - без podacha, полная стоимость
      newCost_3000 = Math.round(full20tCost);
      newCost_4000 = Math.round(full20tCost);
    } else {
      // Для всех остальных объемов: podacha + (объем × стоимость_1_м³)
      // где стоимость_1_м³ = (полная_стоимость_20т - podacha) / 80
      const costPerM3_3000 = (full20tCost - PODACHA_3000) / TRUCK_20T_CAPACITY;
      const costPerM3_4000 = (full20tCost - PODACHA_4000) / TRUCK_20T_CAPACITY;
      
      const calc_3000 = Math.round(PODACHA_3000 + (volume * costPerM3_3000));
      const calc_4000 = Math.round(PODACHA_4000 + (volume * costPerM3_4000));
      
      // Применяем правило: стоимость не может быть меньше предыдущей
      const newCost_3000_raw = Math.max(Math.max(calc_3000, prevNewCost_3000), MINIMUM_COST);
      const newCost_4000_raw = Math.max(Math.max(calc_4000, prevNewCost_4000), MINIMUM_COST);
      
      newCost_3000 = newCost_3000_raw;
      newCost_4000 = newCost_4000_raw;
      
      prevNewCost_3000 = newCost_3000;
      prevNewCost_4000 = newCost_4000;
    }
    
    const volumeStr = `${volume} м³`.padEnd(9);
    const oldStr = `${oldCostFinal.toLocaleString('ru-RU')} ₽`.padEnd(17);
    const p3000Str = `${newCost_3000.toLocaleString('ru-RU')} ₽`.padEnd(15);
    const p4000Str = `${newCost_4000.toLocaleString('ru-RU')} ₽`;
    
    output += `${volumeStr}${oldStr}${p3000Str}${p4000Str}\n`;
  }
  
  output += '\n\n';
}

console.log(output);

