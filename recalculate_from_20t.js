// Пересчет: все объемы рассчитываются от 20т фуры (80 м³)

const routes = [
  {
    name: "Москва → Санкт-Петербург",
    distance: 704,
    tariff20t: 94.5,
  },
  {
    name: "Москва → Ярославль",
    distance: 282,
    tariff20t: 132.0,
  },
  {
    name: "Москва → Ростов-на-Дону",
    distance: 1078,
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
const TRUCK_20T_CAPACITY = 80; // 20т = 80 м³ (20000 кг / 250 = 80 м³)
const MINIMUM_COST = 7500;
const MIN_LOAD_FACTOR = 0.3;

let output = '';

for (const route of routes) {
  const full20tCost = route.tariff20t * route.distance;
  
  output += `${route.name}\n`;
  output += `(${route.distance} км, тариф 20т: ${route.tariff20t} ₽/км)\n`;
  output += '\n';
  output += 'Объем    Старая логика    Подача 3000    Подача 4000\n';
  
  let prevOldCost = 0;
  let prevNewCost_3000 = 0;
  let prevNewCost_4000 = 0;
  
  for (let volume = 1; volume <= 20; volume++) {
    // СТАРАЯ ЛОГИКА (пропорциональная от 20т фуры)
    const loadFactor = Math.max(volume / TRUCK_20T_CAPACITY, MIN_LOAD_FACTOR);
    const oldCost = Math.round(full20tCost * loadFactor);
    const oldCostFinal = Math.max(Math.max(oldCost, prevOldCost), MINIMUM_COST);
    prevOldCost = oldCostFinal;
    
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

