// Тест: Москва-Екатеринбург после внедрения линейной интерполяции

const DISTANCE = 1660; // км

// Коэффициент (старый подход)
const COEFF_3T = 0.33;

// Реальные тарифы
const tariffs = {
  "20т": 74.0,
  "10т": 62.8,
  "5т": 51.9,
  "3т": 0,      // Отсутствует
  "1.5т": 35.5,
  "500кг": 0
};

// Интерполяция для 3т
const lower = { cat: "1.5т", weight: 1.5, rate: 35.5 };
const upper = { cat: "5т", weight: 5, rate: 51.9 };
const targetWeight = 3;

const ratio = (targetWeight - lower.weight) / (upper.weight - lower.weight);
const interpolated_3t = lower.rate + (upper.rate - lower.rate) * ratio;

console.log("╔═══════════════════════════════════════════════════════════════════════╗");
console.log("║       ТЕСТ: МОСКВА → ЕКАТЕРИНБУРГ С ЛИНЕЙНОЙ ИНТЕРПОЛЯЦИЕЙ           ║");
console.log("╚═══════════════════════════════════════════════════════════════════════╝\n");

console.log("📍 МАРШРУТ: Москва → Екатеринбург");
console.log(`📏 Расстояние: ${DISTANCE} км\n`);

console.log("📊 РЕАЛЬНЫЕ ТАРИФЫ:");
console.log(`   20т  = ${tariffs["20т"].toFixed(1)} ₽/км ✓`);
console.log(`   10т  = ${tariffs["10т"].toFixed(1)} ₽/км ✓`);
console.log(`   5т   = ${tariffs["5т"].toFixed(1)} ₽/км ✓`);
console.log(`   3т   = отсутствует ❌`);
console.log(`   1.5т = ${tariffs["1.5т"].toFixed(1)} ₽/км ✓\n`);

console.log("═".repeat(75) + "\n");

console.log("🔢 РАСЧЕТ ТАРИФА 3Т:\n");

// Старый подход
const old_3t = tariffs["20т"] * COEFF_3T;
console.log("1️⃣  СТАРЫЙ ПОДХОД (коэффициент):");
console.log(`   Тариф 3т = Тариф 20т × коэффициент`);
console.log(`   Тариф 3т = ${tariffs["20т"]} × ${COEFF_3T}`);
console.log(`   Тариф 3т = ${old_3t.toFixed(2)} ₽/км\n`);

// Новый подход
console.log("2️⃣  НОВЫЙ ПОДХОД (линейная интерполяция):");
console.log(`   Нижняя точка: ${lower.cat} (${lower.weight}т) = ${lower.rate} ₽/км`);
console.log(`   Верхняя точка: ${upper.cat} (${upper.weight}т) = ${upper.rate} ₽/км`);
console.log(`   Целевой вес: ${targetWeight}т`);
console.log();
console.log(`   Позиция = (${targetWeight} - ${lower.weight}) / (${upper.weight} - ${lower.weight})`);
console.log(`   Позиция = ${ratio.toFixed(4)}`);
console.log();
console.log(`   Тариф 3т = ${lower.rate} + (${upper.rate} - ${lower.rate}) × ${ratio.toFixed(4)}`);
console.log(`   Тариф 3т = ${lower.rate} + ${(upper.rate - lower.rate).toFixed(1)} × ${ratio.toFixed(4)}`);
console.log(`   Тариф 3т = ${interpolated_3t.toFixed(2)} ₽/км ✅\n`);

console.log("═".repeat(75) + "\n");

console.log("📈 СРАВНЕНИЕ РЕЗУЛЬТАТОВ:\n");

console.log("┌─────────────────────────┬──────────────┬──────────────┬──────────────┐");
console.log("│ Параметр                │ Коэффициент  │ Интерполяция │ Изменение    │");
console.log("├─────────────────────────┼──────────────┼──────────────┼──────────────┤");
console.log(`│ Тариф 3т (₽/км)         │ ${old_3t.toFixed(2).padStart(12)} │ ${interpolated_3t.toFixed(2).padStart(12)} │ ${((interpolated_3t - old_3t) / old_3t * 100).toFixed(1).padStart(10)}%  │`);
console.log(`│ Стоимость для 12 м³ (₽) │ ${Math.round(old_3t * DISTANCE).toLocaleString('ru-RU').padStart(12)} │ ${Math.round(interpolated_3t * DISTANCE).toLocaleString('ru-RU').padStart(12)} │ ${((interpolated_3t - old_3t) * DISTANCE).toFixed(0).padStart(9)} ₽  │`);
console.log("└─────────────────────────┴──────────────┴──────────────┴──────────────┘\n");

console.log("⚠️  ПРОВЕРКА НА АНОМАЛИИ:\n");

const rate_1_5t = tariffs["1.5т"];
const rate_3t_old = old_3t;
const rate_3t_new = interpolated_3t;
const rate_5t = tariffs["5т"];

console.log("СТАРЫЙ ПОДХОД:");
if (rate_1_5t > rate_3t_old) {
  console.log(`   🔴 АНОМАЛИЯ: 1.5т (${rate_1_5t}) > 3т (${rate_3t_old.toFixed(2)}) - разница ${((rate_1_5t - rate_3t_old) / rate_3t_old * 100).toFixed(1)}%`);
} else {
  console.log(`   ✅ OK: порядок правильный`);
}

console.log("\nНОВЫЙ ПОДХОД:");
if (rate_1_5t < rate_3t_new && rate_3t_new < rate_5t) {
  console.log(`   ✅ OK: монотонность соблюдена`);
  console.log(`   ✓ 1.5т (${rate_1_5t}) < 3т (${rate_3t_new.toFixed(2)}) < 5т (${rate_5t})`);
} else {
  console.log(`   🔴 Проблема с монотонностью`);
}

console.log("\n" + "═".repeat(75) + "\n");

console.log("💡 ВЫВОДЫ:\n");
console.log("   ✅ Линейная интерполяция устраняет аномалию '1.5т > 3т'");
console.log("   ✅ Тариф 3т теперь логично находится между 1.5т и 5т");
console.log(`   ✅ Стоимость для 12 м³ увеличилась на ${Math.round((interpolated_3t - old_3t) * DISTANCE).toLocaleString('ru-RU')} ₽ (+${((interpolated_3t - old_3t) / old_3t * 100).toFixed(1)}%)`);
console.log("   ✅ Цена стала более реалистичной и справедливой\n");

console.log("═".repeat(75) + "\n");

