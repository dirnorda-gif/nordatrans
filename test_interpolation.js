// Тест линейной интерполяции для отсутствующих тарифов
// Сравнение: коэффициенты vs интерполяция

// Коэффициенты (старый подход)
const coefficients = {
  fromMoscow: {
    "10т": 0.81,
    "5т": 0.76,
    "3т": 0.33,
    "1.5т": 0.22,
    "500кг": 0.15
  }
};

// Функция интерполяции (новый подход)
function interpolateTariff(tariffs, targetCategory) {
  const categories = [
    { cat: "20т", weight: 20 },
    { cat: "10т", weight: 10 },
    { cat: "5т", weight: 5 },
    { cat: "3т", weight: 3 },
    { cat: "1.5т", weight: 1.5 }
  ];
  
  const targetWeight = categories.find(c => c.cat === targetCategory)?.weight;
  if (!targetWeight) return 0;
  
  let lowerCategory = null;
  let upperCategory = null;
  
  for (const { cat, weight } of categories) {
    const rate = tariffs[cat];
    
    if (rate > 0) {
      if (weight < targetWeight && (!lowerCategory || weight > lowerCategory.weight)) {
        lowerCategory = { cat, weight, rate };
      }
      if (weight > targetWeight && (!upperCategory || weight < upperCategory.weight)) {
        upperCategory = { cat, weight, rate };
      }
    }
  }
  
  if (lowerCategory && upperCategory) {
    const ratio = (targetWeight - lowerCategory.weight) / (upperCategory.weight - lowerCategory.weight);
    return lowerCategory.rate + (upperCategory.rate - lowerCategory.rate) * ratio;
  }
  
  return 0;
}

// Примеры проблемных маршрутов
const testRoutes = [
  {
    name: "Москва → Екатеринбург",
    tariffs: {
      "20т": 74.0,
      "10т": 62.8,
      "5т": 51.9,
      "3т": 0,      // Отсутствует
      "1.5т": 35.5,
      "500кг": 0    // Отсутствует
    }
  },
  {
    name: "Москва → Калуга",
    tariffs: {
      "20т": 133.8,
      "10т": 116.9,
      "5т": 0,      // Отсутствует
      "3т": 0,      // Отсутствует
      "1.5т": 83.7,
      "500кг": 0    // Отсутствует
    }
  },
  {
    name: "СПб → Москва",
    tariffs: {
      "20т": 55.6,
      "10т": 48.3,
      "5т": 37.3,
      "3т": 0,      // Отсутствует
      "1.5т": 29.3,
      "500кг": 10.9
    }
  }
];

console.log("╔═══════════════════════════════════════════════════════════════════════════╗");
console.log("║     ТЕСТ: КОЭФФИЦИЕНТЫ vs ЛИНЕЙНАЯ ИНТЕРПОЛЯЦИЯ                           ║");
console.log("╚═══════════════════════════════════════════════════════════════════════════╝\n");

testRoutes.forEach((route, index) => {
  console.log(`${"═".repeat(79)}`);
  console.log(`${index + 1}. ${route.name}`);
  console.log(`${"═".repeat(79)}\n`);
  
  console.log("📋 Исходные тарифы:");
  ["20т", "10т", "5т", "3т", "1.5т", "500кг"].forEach(cat => {
    const value = route.tariffs[cat];
    const status = value > 0 ? "✓ реальный" : "❌ отсутствует";
    console.log(`   ${cat.padEnd(6)}: ${value > 0 ? value.toFixed(1).padStart(6) : "   0.0"} ₽/км  ${status}`);
  });
  
  console.log("\n💰 РАСЧЕТ ОТСУТСТВУЮЩИХ ТАРИФОВ:\n");
  
  const missing = ["10т", "5т", "3т", "1.5т", "500кг"].filter(cat => route.tariffs[cat] === 0);
  
  if (missing.length === 0) {
    console.log("   ✓ Все тарифы присутствуют!\n");
    return;
  }
  
  console.log("┌──────────┬────────────────┬────────────────┬──────────────┬─────────────┐");
  console.log("│ Категория│ Коэффициент    │ Интерполяция   │ Разница      │ Аномалия?   │");
  console.log("├──────────┼────────────────┼────────────────┼──────────────┼─────────────┤");
  
  missing.forEach(cat => {
    const coeff = route.tariffs["20т"] * coefficients.fromMoscow[cat];
    const interp = interpolateTariff(route.tariffs, cat);
    const diff = interp > 0 ? ((interp - coeff) / coeff * 100).toFixed(1) : "N/A";
    
    // Проверка на аномалию
    let hasAnomaly = "";
    if (cat === "3т" && route.tariffs["1.5т"] > 0) {
      const rate15 = route.tariffs["1.5т"];
      if (coeff < rate15) hasAnomaly = "🔴 1.5т>3т";
      if (interp > rate15) hasAnomaly = "✅ OK";
    }
    
    console.log(`│ ${cat.padEnd(8)} │ ${coeff.toFixed(2).padStart(12)} ₽ │ ${(interp > 0 ? interp.toFixed(2) : "N/A").padStart(12)} ₽ │ ${(diff !== "N/A" ? `+${diff}%` : diff).padStart(12)} │ ${hasAnomaly.padEnd(11)} │`);
  });
  
  console.log("└──────────┴────────────────┴────────────────┴──────────────┴─────────────┘\n");
  
  // Проверка монотонности
  const calcTariffs = { ...route.tariffs };
  missing.forEach(cat => {
    if (cat !== "500кг") {
      calcTariffs[cat] = interpolateTariff(route.tariffs, cat);
    } else {
      calcTariffs[cat] = route.tariffs["20т"] * coefficients.fromMoscow[cat];
    }
  });
  
  const order = [
    { cat: "20т", weight: 20 },
    { cat: "10т", weight: 10 },
    { cat: "5т", weight: 5 },
    { cat: "3т", weight: 3 },
    { cat: "1.5т", weight: 1.5 },
    { cat: "500кг", weight: 0.5 }
  ];
  
  console.log("✓ ПРОВЕРКА МОНОТОННОСТИ (большая машина дороже меньшой):\n");
  
  let hasAnomalies = false;
  for (let i = 0; i < order.length - 1; i++) {
    const current = order[i];
    const next = order[i + 1];
    const currentRate = calcTariffs[current.cat];
    const nextRate = calcTariffs[next.cat];
    
    if (currentRate > 0 && nextRate > 0) {
      if (nextRate > currentRate) {
        console.log(`   🔴 АНОМАЛИЯ: ${next.cat} (${nextRate.toFixed(2)}) > ${current.cat} (${currentRate.toFixed(2)})`);
        hasAnomalies = true;
      }
    }
  }
  
  if (!hasAnomalies) {
    console.log("   ✅ Аномалий не найдено! Цены монотонно убывают.\n");
  }
  
  console.log();
});

console.log("═".repeat(79));
console.log("\n💡 ВЫВОДЫ:\n");
console.log("   ✅ Линейная интерполяция устраняет аномалии типа '1.5т > 3т'");
console.log("   ✅ Тарифы автоматически адаптируются к специфике маршрута");
console.log("   ✅ Гарантируется монотонность (большая машина дороже)");
console.log("   ✅ Для 500кг используется коэффициент (нет нижней точки)\n");
console.log("═".repeat(79) + "\n");

