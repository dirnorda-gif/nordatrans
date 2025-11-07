// Пересчет с новой логикой: podacha применяется ко всем объемам (кроме полной 20т)

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
const MINIMUM_COST = 7500;
const MIN_LOAD_FACTOR = 0.3;

// Вместимость машин
const TRUCK_CAPACITY = {
  "1.5т": 6,   // 1500 кг / 250 = 6 м³
  "3т": 12,    // 3000 кг / 250 = 12 м³
  "5т": 20,    // 5000 кг / 250 = 20 м³
  "10т": 40,   // 10000 кг / 250 = 40 м³
  "20т": 80,   // 20000 кг / 250 = 80 м³
};

// Коэффициенты для расчета отсутствующих тарифов
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
    // Для Новосибирска все тарифы рассчитываем через коэффициенты
    switch(category) {
      case "1.5т": return route.tariff20t * COEFF_15T_FROM_MOSCOW;
      case "3т": return route.tariff20t * COEFF_3T_FROM_MOSCOW;
      case "5т": return route.tariff20t * COEFF_5T_FROM_MOSCOW;
      case "10т": return route.tariff20t * COEFF_10T_FROM_MOSCOW;
      case "20т": return route.tariff20t;
    }
  }
  
  // Для других маршрутов используем реальные тарифы или коэффициенты
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
  output += `${route.name}\n`;
  if (route.name === "Москва → Новосибирск") {
    output += `(${route.distance} км, тариф 20т: ${route.tariff20t} ₽/км)\n`;
  } else {
    output += `(${route.distance} км, тариф газели: ${route.tariff15t} ₽/км)\n`;
  }
  output += '\n';
  output += 'Объем    Старая логика    Подача 3000    Подача 4000\n';
  
  for (let volume = 1; volume <= 20; volume++) {
    const category = getTruckCategoryForVolume(volume);
    const truckCapacity = TRUCK_CAPACITY[category];
    const tariff = getTariffForCategory(route, category);
    const fullTruckCost = tariff * route.distance;
    
    // СТАРАЯ ЛОГИКА (пропорциональная)
    const loadFactor = Math.max(volume / truckCapacity, MIN_LOAD_FACTOR);
    const oldCost = Math.round(fullTruckCost * loadFactor);
    const oldCostFinal = Math.max(oldCost, MINIMUM_COST);
    
    // НОВАЯ ЛОГИКА: podacha применяется ко всем объемам, кроме полной машины
    let newCost_3000, newCost_4000;
    
    if (volume >= truckCapacity) {
      // Для полной машины - без podacha, полная стоимость (округленная)
      newCost_3000 = Math.round(fullTruckCost);
      newCost_4000 = Math.round(fullTruckCost);
    } else {
      // Для всех остальных объемов: podacha + (объем × стоимость_1_м³)
      // где стоимость_1_м³ = (полная_стоимость - podacha) / вместимость
      const costPerM3_3000 = (fullTruckCost - PODACHA_3000) / truckCapacity;
      const costPerM3_4000 = (fullTruckCost - PODACHA_4000) / truckCapacity;
      
      const calc_3000 = Math.round(PODACHA_3000 + (volume * costPerM3_3000));
      const calc_4000 = Math.round(PODACHA_4000 + (volume * costPerM3_4000));
      
      newCost_3000 = Math.max(calc_3000, MINIMUM_COST);
      newCost_4000 = Math.max(calc_4000, MINIMUM_COST);
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

