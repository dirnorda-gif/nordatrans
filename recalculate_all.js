// Пересчет всех маршрутов с podacha 3000 и 4000

const routes = [
  {
    name: "Москва → Санкт-Петербург",
    distance: 704,
    tariff15t: 33.9,
  },
  {
    name: "Москва → Ярославль",
    distance: 282,
    tariff15t: 56.7,
  },
  {
    name: "Москва → Ростов-на-Дону",
    distance: 1078,
    tariff15t: 34.7,
  },
  {
    name: "Москва → Новосибирск",
    distance: 3267,
    tariff15t: 73.8 * 0.22, // Рассчитываем через коэффициент от 20т
  }
];

// Константы
const PODACHA_3000 = 3000;
const PODACHA_4000 = 4000;
const GAZELLE_CAPACITY = 6;
const MINIMUM_COST = 7500;
const MIN_LOAD_FACTOR = 0.3;

let output = '';

for (const route of routes) {
  const fullGazelleCost = route.tariff15t * route.distance;
  
  // Расчет для podacha 3000
  const costPerM3_3000 = (fullGazelleCost - PODACHA_3000) / GAZELLE_CAPACITY;
  
  // Расчет для podacha 4000
  const costPerM3_4000 = (fullGazelleCost - PODACHA_4000) / GAZELLE_CAPACITY;
  
  // Старая логика (пропорциональная)
  const oldLogic = [];
  for (let volume = 1; volume <= 6; volume++) {
    const loadFactor = Math.max(volume / GAZELLE_CAPACITY, MIN_LOAD_FACTOR);
    const oldCost = Math.round(fullGazelleCost * loadFactor);
    oldLogic.push(Math.max(oldCost, MINIMUM_COST));
  }
  
  output += `${route.name}\n`;
  if (route.name === "Москва → Новосибирск") {
    output += `(${route.distance} км, тариф ${route.tariff15t.toFixed(1)} ₽/км)\n`;
  } else {
    output += `(${route.distance} км, тариф ${route.tariff15t} ₽/км)\n`;
  }
  output += '\n';
  output += 'Объем    Старая логика    Подача 3000    Подача 4000\n';
  
  for (let volume = 1; volume <= 6; volume++) {
    const podacha3000_cost = Math.round(PODACHA_3000 + (volume * costPerM3_3000));
    const podacha4000_cost = Math.round(PODACHA_4000 + (volume * costPerM3_4000));
    
    const final_3000 = Math.max(podacha3000_cost, MINIMUM_COST);
    const final_4000 = Math.max(podacha4000_cost, MINIMUM_COST);
    
    const volumeStr = `${volume} м³`.padEnd(9);
    const oldStr = `${oldLogic[volume - 1].toLocaleString('ru-RU')} ₽`.padEnd(17);
    const p3000Str = `${final_3000.toLocaleString('ru-RU')} ₽`.padEnd(15);
    const p4000Str = `${final_4000.toLocaleString('ru-RU')} ₽`;
    
    output += `${volumeStr}${oldStr}${p3000Str}${p4000Str}\n`;
  }
  
  output += '\n\n';
}

console.log(output);

