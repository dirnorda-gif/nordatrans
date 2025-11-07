/**
 * Скрипт для пересчета всех цен в аккордеоне по новой логике v1.3.0
 * Использует линейную интерполяцию и реальные тарифы из WhatsApp
 */

const fs = require('fs');
const path = require('path');

// ==================== КОНСТАНТЫ ====================
const MINIMUM_COST = 7500;
const TARIFF_VERSION = "1.3.0";

// Вместимость машин (в м³)
const TRUCK_CAPACITY_M3 = {
  "500кг": 3,
  "1.5т": 6,
  "3т": 12,
  "5т": 20,
  "10т": 40,
  "20т": 80
};

// ==================== РЕАЛЬНЫЕ ТАРИФЫ ====================
const tariffConfig = {
  fromMoscow: {
    "Тула": "153.9/124.0/99.0/0/66.2/0",
    "Владимир": "143.0/85.0/0/0/0/0",
    "Калуга": "133.8/116.9/0/0/83.7/0",
    "Ярославль": "132.0/90.9/83.2/0/56.7/0",
    "Тверь": "128.0/103.9/112.3/0/56.5/0",
    "Рязань": "118.2/99.0/101.5/0/59.1/0",
    "Вязьма": "114.2/0/0/0/0/0",
    "Нижний Новгород": "106.0/72.3/51.8/0/38.1/0",
    "Чебоксары": "101.8/0/0/0/0/0",
    "Великий Новгород": "98.4/71.4/0/0/0/0",
    "Тамбов": "95.5/0/0/0/0/0",
    "Санкт-Петербург": "94.5/72.9/53.8/40.3/33.9/0",
    "Краснодар": "95.2/72.5/57.5/0/0/0",
    "Ростов-на-Дону": "99.0/68.0/58.9/46.9/34.7/0",
    "Казань": "89.0/71.1/50.8/0/36.8/0",
    "Воронеж": "88.9/79.5/60.6/0/39.3/0",
    "Волгоград": "89.1/69.3/58.9/0/0/0",
    "Ставрополь": "86.9/0/0/0/0/0",
    "Смоленск": "73.7/58.7/0/0/0/0",
    "Вологда": "82.0/86.0/0/0/0/0",
    "Петрозаводск": "82.0/0/0/0/0/0",
    "Набережные Челны": "83.5/71.3/0/0/0/0",
    "Уфа": "81.2/59.6/0/0/0/0",
    "Самара": "77.6/65.5/48.4/0/35.2/0",
    "Саратов": "80.4/65.8/48.6/0/0/0",
    "Оренбург": "84.7/54.0/0/0/0/0",
    "Пермь": "77.9/70.1/0/0/0/0",
    "Екатеринбург": "74.0/62.8/51.9/0/35.5/0",
    "Челябинск": "81.0/49.2/0/0/0/0",
    "Тюмень": "74.5/0/0/0/0/0",
    "Новосибирск": "73.8/65.1/0/0/0/0",
    "Красноярск": "70.0/0/0/0/0/0",
    "Иркутск": "66.5/0/0/0/0/0",
    "Благовещенск": "57.2/0/0/0/0/0",
    "Хабаровск": "57.6/0/0/0/0/0",
    "Владивосток": "56.6/0/0/0/0/0",
    "Сочи": "95.4/72.5/57.5/0/0/0"
  },
  toMoscow: {
    "Тула": "164.1/125.3/87.3/0/65/0",
    "Рязань": "170.1/144.6/90.1/0/56.7/0",
    "Калуга": "153.6/135.5/0/0/0/0",
    "Владимир": "140.2/96.0/80.9/0/65.1/0",
    "Тверь": "139.5/106.1/96.3/0/57.1/40.6",
    "Вязьма": "145.4/0/0/0/0/0",
    "Ярославль": "105.7/72.4/72.1/0/43.4/0",
    "Тамбов": "89.7/0/0/0/0/0",
    "Вологда": "92.8/56.1/0/0/0/0",
    "Смоленск": "92.6/68.3/55.7/0/0/0",
    "Воронеж": "78.5/63.7/31.1/0/31/0",
    "Нижний Новгород": "92.1/61.1/50.6/0/35.3/17.3",
    "Чебоксары": "67.8/0/0/0/0/0",
    "Великий Новгород": "64.7/0/0/0/0/0",
    "Санкт-Петербург": "55.6/48.3/37.3/0/29.3/10.9",
    "Петрозаводск": "54.8/0/0/0/0/0",
    "Казань": "56.4/49.4/41.3/0/23.5/9",
    "Набережные Челны": "55.3/0/0/0/0/0",
    "Уфа": "44.7/36.3/0/0/0/0",
    "Самара": "50.1/64.0/31.2/0/0/0",
    "Саратов": "58.2/44.9/39.7/0/0/0",
    "Оренбург": "36.8/0/0/0/0/0",
    "Волгоград": "59.7/37.1/0/0/0/7.71",
    "Ростов-на-Дону": "35.4/42.0/22.9/0/0/7",
    "Краснодар": "35.6/37.6/26.3/0/14.7/5.7",
    "Ставрополь": "39.6/34.8/0/0/0/0",
    "Пермь": "46.9/0/0/0/0/0",
    "Екатеринбург": "38.9/39.3/27.1/0/19.6/0",
    "Челябинск": "43.5/44.1/0/0/0/0",
    "Тюмень": "38.1/0/0/0/0/0",
    "Новосибирск": "31.5/33.7/0/0/0/0",
    "Красноярск": "33.3/0/0/0/0/0",
    "Иркутск": "37.7/0/0/0/0/0",
    "Благовещенск": "60.4/0/0/0/0/0",
    "Хабаровск": "48.8/0/0/0/0/0",
    "Владивосток": "60.6/69.7/0/0/0/0",
    "Сочи": "35.6/37.6/26.3/0/14.7/5.7"
  }
};

// Коэффициенты для расчета отсутствующих тарифов (только для 500кг)
const weightCoefficients = {
  toMoscow: {
    "10т": 0.76,
    "5т": 0.71,
    "3т": 0.31,
    "1.5т": 0.21,
    "500кг": 0.14
  },
  fromMoscow: {
    "10т": 0.81,
    "5т": 0.76,
    "3т": 0.33,
    "1.5т": 0.22,
    "500кг": 0.15
  }
};

// ==================== РАССТОЯНИЯ ====================
const distances = {
  "Волгоград": 971,
  "Екатеринбург": 1660,
  "Казань": 813,
  "Краснодар": 1347,
  "Красноярск": 4041,
  "Магнитогорск": 1656,
  "Нижний Новгород": 434,
  "Новосибирск": 3267,
  "Ростов-на-Дону": 1078,
  "Самара": 1090,
  "Санкт-Петербург": 704,
  "Сочи": 1624,
  "Тверь": 183,
  "Уфа": 1327,
  "Челябинск": 1919
};

// ==================== ФУНКЦИИ ====================

/**
 * Линейная интерполяция между двумя точками
 */
function interpolate(x1, y1, x2, y2, x) {
  const ratio = (x - x1) / (x2 - x1);
  return y1 + (y2 - y1) * ratio;
}

/**
 * Интерполяция тарифа между соседними реальными значениями
 */
function interpolateTariff(tariffs, targetCategory, direction) {
  const categoryOrder = ["500кг", "1.5т", "3т", "5т", "10т", "20т"];
  const categoryWeights = { "500кг": 0.5, "1.5т": 1.5, "3т": 3, "5т": 5, "10т": 10, "20т": 20 };
  
  const targetWeight = categoryWeights[targetCategory];
  const targetIndex = categoryOrder.indexOf(targetCategory);
  
  // Ищем ближайший нижний тариф
  let lowerCategory = null;
  let lowerTariff = null;
  for (let i = targetIndex - 1; i >= 0; i--) {
    const cat = categoryOrder[i];
    if (tariffs[cat] > 0) {
      lowerCategory = cat;
      lowerTariff = tariffs[cat];
      break;
    }
  }
  
  // Ищем ближайший верхний тариф
  let upperCategory = null;
  let upperTariff = null;
  for (let i = targetIndex + 1; i < categoryOrder.length; i++) {
    const cat = categoryOrder[i];
    if (tariffs[cat] > 0) {
      upperCategory = cat;
      upperTariff = tariffs[cat];
      break;
    }
  }
  
  // Если нашли оба - интерполируем
  if (lowerCategory && upperCategory) {
    const lowerWeight = categoryWeights[lowerCategory];
    const upperWeight = categoryWeights[upperCategory];
    return interpolate(lowerWeight, lowerTariff, upperWeight, upperTariff, targetWeight);
  }
  
  // Если нашли только один - используем коэффициент от 20т
  const base20tRate = tariffs["20т"];
  const coefficient = weightCoefficients[direction][targetCategory];
  return base20tRate * coefficient;
}

/**
 * Получить тариф за км для конкретной категории
 */
function getCostPerKm(city, direction, category) {
  const tariffString = tariffConfig[direction][city];
  if (!tariffString) {
    console.warn(`Город "${city}" не найден в базе тарифов`);
    return 0;
  }
  
  // Парсим: "153.9/124.0/99.0/0/66.2/0"
  const [t20, t10, t5, t3, t15, t500] = tariffString.split("/").map(parseFloat);
  
  const tariffs = {
    "20т": t20,
    "10т": t10,
    "5т": t5,
    "3т": t3,
    "1.5т": t15,
    "500кг": t500
  };
  
  let costPerKm = tariffs[category];
  
  // Если тариф отсутствует (0), применяем интерполяцию или коэффициент
  if (!costPerKm || costPerKm === 0) {
    const base20tRate = tariffs["20т"];
    
    if (category === "500кг") {
      // Для 500кг используем коэффициент от 20т
      const coefficient = weightCoefficients[direction]["500кг"];
      costPerKm = base20tRate * coefficient;
    } else if (category !== "20т" && base20tRate > 0) {
      // Для 10т, 5т, 3т, 1.5т применяем линейную интерполяцию
      costPerKm = interpolateTariff(tariffs, category, direction);
    } else {
      costPerKm = base20tRate;
    }
  }
  
  return costPerKm;
}

/**
 * Рассчитать стоимость для конкретной категории веса
 */
function calculatePrice(city, direction, distance, category) {
  const costPerKm = getCostPerKm(city, direction, category);
  const calculatedCost = Math.round(costPerKm * distance);
  return Math.max(calculatedCost, MINIMUM_COST);
}

/**
 * Форматировать цену для отображения
 */
function formatPrice(price) {
  return `${price.toLocaleString('ru-RU')} ₽`;
}

/**
 * Получить название категории для аккордеона
 */
function getCategoryName(category) {
  const names = {
    "500кг": "до 500 кг",
    "1.5т": "1,5 т",
    "3т": "3 т",
    "5т": "5 т",
    "10т": "10 т",
    "20т": "20 т"
  };
  return names[category] || category;
}

// ==================== ГЕНЕРАЦИЯ ДАННЫХ ====================

function generateRouteCache() {
  const categories = ["500кг", "1.5т", "3т", "5т", "10т", "20т"];
  
  const routesToMoscow = [];
  const routesFromMoscow = [];
  
  console.log("🔄 Начинаем пересчет всех маршрутов...\n");
  
  for (const [city, distance] of Object.entries(distances)) {
    // Проверяем наличие тарифов
    if (!tariffConfig.toMoscow[city] || !tariffConfig.fromMoscow[city]) {
      console.warn(`⚠️ Город "${city}" пропущен - нет тарифов`);
      continue;
    }
    
    console.log(`📍 ${city} (${distance} км)`);
    
    // В Москву
    const pricesToMoscow = [];
    for (const category of categories) {
      const price = calculatePrice(city, "toMoscow", distance, category);
      pricesToMoscow.push({
        weight: getCategoryName(category),
        price: formatPrice(price)
      });
    }
    
    routesToMoscow.push({
      from: city,
      to: "Москва",
      distance: `${distance} км`,
      prices: pricesToMoscow
    });
    
    // Из Москвы
    const pricesFromMoscow = [];
    for (const category of categories) {
      const price = calculatePrice(city, "fromMoscow", distance, category);
      pricesFromMoscow.push({
        weight: getCategoryName(category),
        price: formatPrice(price)
      });
    }
    
    routesFromMoscow.push({
      from: "Москва",
      to: city,
      distance: `${distance} км`,
      prices: pricesFromMoscow
    });
  }
  
  const result = {
    version: "1.0.1",
    tariffVersion: TARIFF_VERSION,
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    routes: {
      toMoscow: routesToMoscow,
      fromMoscow: routesFromMoscow
    }
  };
  
  console.log("\n✅ Пересчет завершен!");
  console.log(`📊 Всего маршрутов: ${routesToMoscow.length * 2}`);
  console.log(`💰 Всего цен: ${routesToMoscow.length * 2 * categories.length}`);
  
  return result;
}

// ==================== MAIN ====================

const newCache = generateRouteCache();

// Сохраняем в файл
const outputPath = path.join(__dirname, 'src', 'data', 'routeCache.json');
fs.writeFileSync(outputPath, JSON.stringify(newCache, null, 2), 'utf-8');

console.log(`\n💾 Файл сохранен: ${outputPath}`);
console.log(`\n🎯 Версия тарифов: ${TARIFF_VERSION}`);
console.log(`📅 Дата генерации: ${new Date().toLocaleString('ru-RU')}`);
console.log(`\n✨ Готово! Кэш обновлен с новой логикой v1.3.0`);

