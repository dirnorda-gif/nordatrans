// Пересчет всех маршрутов до 20 м³

const routes = [
  {
    name: "Москва → Санкт-Петербург",
    distance: 704,
    tariff15t: 33.9,
    tariff3t: 0, // Рассчитаем через коэффициент
    tariff5t: 53.8,
    tariff20t: 94.5,
  },
  {
    name: "Москва → Ярославль",
    distance: 282,
    tariff15t: 56.7,
    tariff3t: 0,
    tariff5t: 83.2,
    tariff20t: 132.0,
  },
  {
    name: "Москва → Ростов-на-Дону",
    distance: 1078,
    tariff15t: 34.7,
    tariff3t: 0,
    tariff5t: 58.9,
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
const GAZELLE_CAPACITY = 6; // 1.5т = 6 м³
const TRUCK_3T_CAPACITY = 12; // 3т = 12 м³
const TRUCK_5T_CAPACITY = 20; // 5т = 20 м³
const MINIMUM_COST = 7500;
const MIN_LOAD_FACTOR = 0.3;

// Коэффициенты для расчета отсутствующих тарифов
const COEFF_3T_FROM_MOSCOW = 0.33;
const COEFF_15T_FROM_MOSCOW = 0.22;

function getTariffForVolume(route, volume) {
  if (volume <= 6) {
    // Газель 1.5т
    if (route.tariff15t) return route.tariff15t;
    // Для Новосибирска рассчитываем через коэффициент
    if (route.name === "Москва → Новосибирск") {
      return route.tariff20t * COEFF_15T_FROM_MOSCOW;
    }
  } else if (volume <= 12) {
    // 3т
    if (route.tariff3t && route.tariff3t > 0) return route.tariff3t;
    return route.tariff20t * COEFF_3T_FROM_MOSCOW;
  } else if (volume <= 20) {
    // 5т
    if (route.tariff5t && route.tariff5t > 0) return route.tariff5t;
    return route.tariff20t * 0.76; // Коэффициент для 5т
  }
  return route.tariff20t; // 20т
}

function getTruckCapacity(volume) {
  if (volume <= 6) return GAZELLE_CAPACITY;
  if (volume <= 12) return TRUCK_3T_CAPACITY;
  if (volume <= 20) return TRUCK_5T_CAPACITY;
  return 80; // 20т
}

let output = '';

for (const route of routes) {
  // Для Новосибирска рассчитываем все тарифы
  if (route.name === "Москва → Новосибирск") {
    route.tariff15t = route.tariff20t * COEFF_15T_FROM_MOSCOW;
    route.tariff3t = route.tariff20t * COEFF_3T_FROM_MOSCOW;
    route.tariff5t = route.tariff20t * 0.76;
  }
  
  output += `${route.name}\n`;
  if (route.name === "Москва → Новосибирск") {
    output += `(${route.distance} км, тариф 20т: ${route.tariff20t} ₽/км)\n`;
  } else {
    output += `(${route.distance} км, тариф газели: ${route.tariff15t} ₽/км)\n`;
  }
  output += '\n';
  output += 'Объем    Старая логика    Подача 3000    Подача 4000\n';
  
  for (let volume = 1; volume <= 20; volume++) {
    const tariff = getTariffForVolume(route, volume);
    const truckCapacity = getTruckCapacity(volume);
    const fullTruckCost = tariff * route.distance;
    
    // СТАРАЯ ЛОГИКА (пропорциональная)
    const loadFactor = Math.max(volume / truckCapacity, MIN_LOAD_FACTOR);
    const oldCost = Math.round(fullTruckCost * loadFactor);
    const oldCostFinal = Math.max(oldCost, MINIMUM_COST);
    
    // НОВАЯ ЛОГИКА (с podacha только для ≤ 6 м³)
    let newCost_3000, newCost_4000;
    
    if (volume <= 6) {
      // Логика с podacha
      const costPerM3_3000 = (fullTruckCost - PODACHA_3000) / GAZELLE_CAPACITY;
      const costPerM3_4000 = (fullTruckCost - PODACHA_4000) / GAZELLE_CAPACITY;
      
      const calc_3000 = Math.round(PODACHA_3000 + (volume * costPerM3_3000));
      const calc_4000 = Math.round(PODACHA_4000 + (volume * costPerM3_4000));
      
      newCost_3000 = Math.max(calc_3000, MINIMUM_COST);
      newCost_4000 = Math.max(calc_4000, MINIMUM_COST);
    } else {
      // Для объемов > 6 м³ используем старую пропорциональную логику
      // (podacha не применяется)
      newCost_3000 = oldCostFinal;
      newCost_4000 = oldCostFinal;
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

