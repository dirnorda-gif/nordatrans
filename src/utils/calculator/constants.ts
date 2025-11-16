// src/utils/calculator/constants.ts
// Константы для модульного калькулятора

console.log('📦 [Constants] Загрузка констант калькулятора');

// ============================================================================
// API КЛЮЧИ
// ============================================================================
export const YANDEX_API_KEY = "a4100971-3502-473d-ac00-0c63115f8fa2";

// ============================================================================
// КОЭФФИЦИЕНТЫ
// ============================================================================
export const REFRIGERATOR_COEFFICIENT = 1.3; // Коэффициент для рефрижератора

// ============================================================================
// ТИПЫ ПЕРЕВОЗОК
// ============================================================================
export const TRANSPORT_TYPES = [
  { id: "moving", label: "Домашний переезд", icon: "🏠" },
  { id: "cargo", label: "Промышленные товары", icon: "📦" },
  { id: "food", label: "Продукты питания", icon: "🍎" },
  { id: "other", label: "Другое", icon: "📋" },
] as const;

export type TransportTypeId = typeof TRANSPORT_TYPES[number]["id"];

// ============================================================================
// ШАГИ ОБЪЁМА И ВЕСА
// ============================================================================

// Для ЧАСТНЫХ ЛИЦ (Домашний переезд) - от 0 до 82 м³ с шагом 1
export const VOLUME_STEPS_PRIVATE = Array.from({ length: 83 }, (_, i) => i);

// Для КОММЕРЧЕСКИХ грузов (фиксированные значения)
export const VOLUME_STEPS_COMMERCIAL = [
  0, 2, 4, 6, 9, 12, 15, 20, 30, 40, 45, 60, 82,
];

// Шаги веса для ЧАСТНЫХ ЛИЦ (Домашний переезд)
export const WEIGHT_STEPS_PRIVATE = [
  0, 100, 300, 500, 700, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000,
  10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000,
];

// Шаги веса для КОММЕРЧЕСКИХ грузов
export const WEIGHT_STEPS_COMMERCIAL = [
  0, 500, 1000, 1500, 3000, 5000, 10000, 15000, 20000,
];

console.log('✅ [Constants] Константы загружены:', {
  transportTypes: TRANSPORT_TYPES.length,
  volumeStepsPrivate: VOLUME_STEPS_PRIVATE.length,
  volumeStepsCommercial: VOLUME_STEPS_COMMERCIAL.length,
  weightStepsPrivate: WEIGHT_STEPS_PRIVATE.length,
  weightStepsCommercial: WEIGHT_STEPS_COMMERCIAL.length,
});

// ============================================================================
// ОПЦИИ УПАКОВКИ
// ============================================================================
export const PACKAGING_OPTIONS = {
  cargo: [
    { value: "pallets", label: "Палеты" },
    { value: "no-packaging", label: "Без упаковки" },
  ],
  food: [
    { value: "pallets", label: "Палеты" },
    { value: "boxes", label: "Коробки" },
    { value: "containers", label: "Контейнеры" },
  ],
  other: [
    { value: "pallets", label: "Палеты" },
    { value: "boxes", label: "Коробки" },
    { value: "no-packaging", label: "Без упаковки" },
  ],
} as const;

// ============================================================================
// ТИПЫ МАШИН ДЛЯ ПРОДУКТОВ ПИТАНИЯ
// ============================================================================
export const TRUCK_TYPES_FOOD = [
  { value: "refrigerator", label: "Рефрижератор" },
  { value: "isothermal", label: "Изотермический фургон" },
] as const;

// ============================================================================
// ТЕМПЕРАТУРНЫЕ РЕЖИМЫ
// ============================================================================
export const TEMPERATURE_MODES = [
  { value: "frozen", label: "Заморозка (-18°C)" },
  { value: "chilled", label: "Охлаждение (+2°C до +6°C)" },
  { value: "room", label: "Комнатная температура" },
] as const;

// ============================================================================
// ИНФОРМАЦИЯ О ГРУЗОВИКАХ
// ============================================================================
export const TRUCK_INFO = {
  porter: {
    name: "Портер",
    capacity: "800кг",
    volumeCapacity: "6 м³",
    dimensions: "2,65м × 1,5м × 1,6м",
    description: "Компактный грузовик для небольших перевозок",
  },
  gazelle: {
    name: "Газель",
    capacity: "1,5т",
    volumeCapacity: "9 м³",
    dimensions: "3м × 1,95м × 1,6м",
    description: "Популярный выбор для городских перевозок",
  },
  "3ton": {
    name: "3 тонны",
    capacity: "3т",
    volumeCapacity: "15 м³",
    dimensions: "3,80м × 2,1м × 2м",
    description: "Средний грузовик для перевозки мебели",
  },
  "5ton": {
    name: "5 тонн",
    capacity: "5т",
    volumeCapacity: "30 м³",
    dimensions: "4-6м × 2,3м × 2,2м",
    description: "Вместительный грузовик для больших объемов",
  },
  "10ton": {
    name: "10 тонн",
    capacity: "10т",
    volumeCapacity: "45 м³",
    dimensions: "6-9м × 2,4м × 2,35м",
    description: "Большой грузовик для коммерческих перевозок",
  },
  "20ton": {
    name: "20 тонн",
    capacity: "20т",
    volumeCapacity: "82 м³",
    dimensions: "13,6м × 2,45м × 2,65м",
    description: "Фура для крупногабаритных грузов",
  },
} as const;

console.log('✅ [Constants] Информация о грузовиках загружена:', Object.keys(TRUCK_INFO));

