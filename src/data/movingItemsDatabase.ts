// База данных типовых предметов для конструктора переезда
// Все размеры в сантиметрах (Д x Ш x В), объём в кубических метрах

export interface MovingItem {
  id: string;
  name: string;
  category: 'furniture' | 'appliances' | 'boxes' | 'other';
  length: number;  // см
  width: number;   // см
  height: number;  // см
  volume: number;  // м³
  keywords: string[]; // для поиска
}

export const MOVING_ITEMS_DATABASE: MovingItem[] = [
  // ============ МЕБЕЛЬ ============
  {
    id: 'sofa_2seat',
    name: 'Диван 2-местный',
    category: 'furniture',
    length: 150,
    width: 80,
    height: 85,
    volume: 1.02,
    keywords: ['диван', 'софа', '2', 'двухместный']
  },
  {
    id: 'sofa_3seat',
    name: 'Диван 3-местный',
    category: 'furniture',
    length: 200,
    width: 90,
    height: 90,
    volume: 1.62,
    keywords: ['диван', 'софа', '3', 'трехместный']
  },
  {
    id: 'sofa_corner',
    name: 'Угловой диван',
    category: 'furniture',
    length: 250,
    width: 180,
    height: 90,
    volume: 4.05,
    keywords: ['диван', 'угловой', 'уголок']
  },
  {
    id: 'sofa_bed',
    name: 'Диван-кровать',
    category: 'furniture',
    length: 200,
    width: 90,
    height: 90,
    volume: 1.62,
    keywords: ['диван', 'кровать', 'раскладной']
  },
  {
    id: 'wardrobe_2door',
    name: 'Шкаф 2-створчатый',
    category: 'furniture',
    length: 120,
    width: 60,
    height: 200,
    volume: 1.44,
    keywords: ['шкаф', '2', 'двухстворчатый', 'платяной']
  },
  {
    id: 'wardrobe_3door',
    name: 'Шкаф 3-створчатый',
    category: 'furniture',
    length: 180,
    width: 60,
    height: 200,
    volume: 2.16,
    keywords: ['шкаф', '3', 'трехстворчатый', 'платяной']
  },
  {
    id: 'wardrobe_corner',
    name: 'Шкаф угловой',
    category: 'furniture',
    length: 100,
    width: 100,
    height: 200,
    volume: 2.0,
    keywords: ['шкаф', 'угловой']
  },
  {
    id: 'wardrobe_sliding',
    name: 'Шкаф-купе 2-створчатый',
    category: 'furniture',
    length: 150,
    width: 60,
    height: 200,
    volume: 1.8,
    keywords: ['шкаф', 'купе', 'раздвижной']
  },
  {
    id: 'bed_single',
    name: 'Кровать односпальная',
    category: 'furniture',
    length: 200,
    width: 90,
    height: 50,
    volume: 0.90,
    keywords: ['кровать', 'одно', 'спальная', '1']
  },
  {
    id: 'bed_double',
    name: 'Кровать двуспальная',
    category: 'furniture',
    length: 200,
    width: 160,
    height: 50,
    volume: 1.60,
    keywords: ['кровать', 'двух', 'спальная', '2']
  },
  {
    id: 'bed_king',
    name: 'Кровать King Size',
    category: 'furniture',
    length: 200,
    width: 180,
    height: 50,
    volume: 1.80,
    keywords: ['кровать', 'king', 'кинг', 'большая']
  },
  {
    id: 'table_dining',
    name: 'Стол обеденный',
    category: 'furniture',
    length: 120,
    width: 80,
    height: 75,
    volume: 0.72,
    keywords: ['стол', 'обеденный', 'кухонный']
  },
  {
    id: 'table_computer',
    name: 'Стол компьютерный',
    category: 'furniture',
    length: 120,
    width: 60,
    height: 75,
    volume: 0.54,
    keywords: ['стол', 'компьютерный', 'письменный']
  },
  {
    id: 'table_coffee',
    name: 'Журнальный столик',
    category: 'furniture',
    length: 100,
    width: 60,
    height: 45,
    volume: 0.27,
    keywords: ['стол', 'журнальный', 'кофейный']
  },
  {
    id: 'chair',
    name: 'Стул',
    category: 'furniture',
    length: 45,
    width: 45,
    height: 95,
    volume: 0.19,
    keywords: ['стул', 'табурет']
  },
  {
    id: 'armchair',
    name: 'Кресло',
    category: 'furniture',
    length: 80,
    width: 80,
    height: 90,
    volume: 0.58,
    keywords: ['кресло']
  },
  {
    id: 'bookshelf',
    name: 'Стеллаж книжный',
    category: 'furniture',
    length: 80,
    width: 40,
    height: 180,
    volume: 0.58,
    keywords: ['стеллаж', 'книжный', 'полка']
  },
  {
    id: 'dresser',
    name: 'Комод',
    category: 'furniture',
    length: 100,
    width: 50,
    height: 90,
    volume: 0.45,
    keywords: ['комод', 'тумба']
  },
  {
    id: 'nightstand',
    name: 'Тумба прикроватная',
    category: 'furniture',
    length: 50,
    width: 40,
    height: 50,
    volume: 0.10,
    keywords: ['тумба', 'прикроватная', 'тумбочка']
  },
  {
    id: 'tv_stand',
    name: 'ТВ-тумба',
    category: 'furniture',
    length: 120,
    width: 40,
    height: 50,
    volume: 0.24,
    keywords: ['тв', 'телевизор', 'тумба']
  },

  // ============ БЫТОВАЯ ТЕХНИКА ============
  {
    id: 'fridge_standard',
    name: 'Холодильник средний (до 1.8м)',
    category: 'appliances',
    length: 60,
    width: 67,
    height: 180,
    volume: 0.72,
    keywords: ['холодильник', 'стандартный', 'средний', '1.8']
  },
  {
    id: 'fridge_tall',
    name: 'Холодильник высокий (до 2.1м)',
    category: 'appliances',
    length: 60,
    width: 67,
    height: 210,
    volume: 0.84,
    keywords: ['холодильник', 'высокий', 'большой', '2.1']
  },
  {
    id: 'fridge_large',
    name: 'Холодильник Side-by-Side (до 1.8м)',
    category: 'appliances',
    length: 121,
    width: 70,
    height: 180,
    volume: 1.53,
    keywords: ['холодильник', 'большой', 'side', 'сайд', 'америка', 'двустворчатый']
  },
  {
    id: 'fridge_small',
    name: 'Холодильник малый (до 0.85м)',
    category: 'appliances',
    length: 50,
    width: 50,
    height: 85,
    volume: 0.21,
    keywords: ['холодильник', 'маленький', 'мини', 'низкий']
  },
  {
    id: 'washing_machine',
    name: 'Стиральная машина',
    category: 'appliances',
    length: 60,
    width: 60,
    height: 85,
    volume: 0.31,
    keywords: ['стиральная', 'машина', 'стиралка']
  },
  {
    id: 'dishwasher',
    name: 'Посудомоечная машина',
    category: 'appliances',
    length: 60,
    width: 60,
    height: 85,
    volume: 0.31,
    keywords: ['посудомоечная', 'машина', 'посудомойка']
  },
  {
    id: 'dryer',
    name: 'Сушильная машина',
    category: 'appliances',
    length: 60,
    width: 60,
    height: 85,
    volume: 0.31,
    keywords: ['сушильная', 'машина', 'сушилка']
  },
  {
    id: 'stove',
    name: 'Плита газовая/электрическая',
    category: 'appliances',
    length: 60,
    width: 60,
    height: 85,
    volume: 0.31,
    keywords: ['плита', 'газовая', 'электрическая']
  },
  {
    id: 'microwave',
    name: 'Микроволновая печь',
    category: 'appliances',
    length: 50,
    width: 40,
    height: 30,
    volume: 0.06,
    keywords: ['микроволновка', 'свч', 'печь']
  },
  {
    id: 'tv_32',
    name: 'Телевизор 32"',
    category: 'appliances',
    length: 80,
    width: 20,
    height: 50,
    volume: 0.08,
    keywords: ['телевизор', 'тв', '32', 'маленький']
  },
  {
    id: 'tv_43',
    name: 'Телевизор 43"',
    category: 'appliances',
    length: 100,
    width: 20,
    height: 60,
    volume: 0.12,
    keywords: ['телевизор', 'тв', '43', 'средний']
  },
  {
    id: 'tv_55',
    name: 'Телевизор 55"',
    category: 'appliances',
    length: 130,
    width: 30,
    height: 80,
    volume: 0.31,
    keywords: ['телевизор', 'тв', '55', 'большой']
  },
  {
    id: 'tv_65',
    name: 'Телевизор 65"',
    category: 'appliances',
    length: 150,
    width: 30,
    height: 90,
    volume: 0.41,
    keywords: ['телевизор', 'тв', '65', 'огромный']
  },
  {
    id: 'vacuum',
    name: 'Пылесос',
    category: 'appliances',
    length: 40,
    width: 30,
    height: 30,
    volume: 0.04,
    keywords: ['пылесос']
  },

  // ============ КОРОБКИ ============
  {
    id: 'box_small',
    name: 'Коробка малая (30×30×30 см)',
    category: 'boxes',
    length: 30,
    width: 30,
    height: 30,
    volume: 0.027,
    keywords: ['коробка', 'малая', 'маленькая', '30']
  },
  {
    id: 'box_medium',
    name: 'Коробка средняя (40×40×40 см)',
    category: 'boxes',
    length: 40,
    width: 40,
    height: 40,
    volume: 0.064,
    keywords: ['коробка', 'средняя', '40']
  },
  {
    id: 'box_large',
    name: 'Коробка большая (50×50×50 см)',
    category: 'boxes',
    length: 50,
    width: 50,
    height: 50,
    volume: 0.125,
    keywords: ['коробка', 'большая', '50']
  },
  {
    id: 'box_wardrobe',
    name: 'Коробка для одежды (60×50×100 см)',
    category: 'boxes',
    length: 60,
    width: 50,
    height: 100,
    volume: 0.30,
    keywords: ['коробка', 'одежда', 'гардероб', '60']
  },
  {
    id: 'box_book',
    name: 'Коробка для книг (35×25×25 см)',
    category: 'boxes',
    length: 35,
    width: 25,
    height: 25,
    volume: 0.022,
    keywords: ['коробка', 'книги', 'маленькая']
  },

  // ============ ПРОЧЕЕ ============
  {
    id: 'mattress_single',
    name: 'Матрас односпальный',
    category: 'other',
    length: 200,
    width: 90,
    height: 20,
    volume: 0.36,
    keywords: ['матрас', 'одно', '1']
  },
  {
    id: 'mattress_double',
    name: 'Матрас двуспальный',
    category: 'other',
    length: 200,
    width: 160,
    height: 20,
    volume: 0.64,
    keywords: ['матрас', 'двух', '2']
  },
  {
    id: 'bicycle',
    name: 'Велосипед',
    category: 'other',
    length: 180,
    width: 60,
    height: 110,
    volume: 1.19,
    keywords: ['велосипед', 'байк']
  },
  {
    id: 'stroller',
    name: 'Детская коляска',
    category: 'other',
    length: 100,
    width: 60,
    height: 100,
    volume: 0.60,
    keywords: ['коляска', 'детская']
  },
  {
    id: 'suitcase_large',
    name: 'Чемодан большой',
    category: 'other',
    length: 75,
    width: 50,
    height: 30,
    volume: 0.11,
    keywords: ['чемодан', 'большой']
  },
  {
    id: 'suitcase_medium',
    name: 'Чемодан средний',
    category: 'other',
    length: 65,
    width: 45,
    height: 25,
    volume: 0.07,
    keywords: ['чемодан', 'средний']
  },
  {
    id: 'mirror',
    name: 'Зеркало большое',
    category: 'other',
    length: 100,
    width: 5,
    height: 180,
    volume: 0.09,
    keywords: ['зеркало']
  },
  {
    id: 'painting',
    name: 'Картина/Постер',
    category: 'other',
    length: 80,
    width: 5,
    height: 100,
    volume: 0.04,
    keywords: ['картина', 'постер', 'рама']
  },
  {
    id: 'lamp_floor',
    name: 'Торшер',
    category: 'other',
    length: 40,
    width: 40,
    height: 150,
    volume: 0.24,
    keywords: ['торшер', 'лампа', 'светильник']
  },
  {
    id: 'plant_large',
    name: 'Комнатное растение большое',
    category: 'other',
    length: 50,
    width: 50,
    height: 100,
    volume: 0.25,
    keywords: ['растение', 'цветок', 'большое']
  },
  {
    id: 'carpet',
    name: 'Ковёр (свёрнутый)',
    category: 'other',
    length: 200,
    width: 30,
    height: 30,
    volume: 0.18,
    keywords: ['ковер', 'палас']
  },
];

// Коэффициент упаковки (реальный объём в кузове больше из-за зазоров)
export const PACKING_COEFFICIENT = 1.3;

// Характеристики фургонов (высота кузова в сантиметрах)
export const TRUCK_HEIGHTS = {
  "500кг": 160,   // Портер: 1.6м
  "1.5т": 160,    // Газель: 1.6м
  "3т": 200,      // 3-тонник: 2.0м
  "5т": 220,      // 5-тонник: 2.2м
  "10т": 235,     // 10-тонник: 2.35м
  "20т": 240      // 20-тонник (фура): 2.4м
} as const;

// Категории для фильтрации
export const CATEGORIES = {
  furniture: { name: 'Мебель', icon: '🛋️', color: '#083cb5' },
  appliances: { name: 'Бытовая техника', icon: '📺', color: '#405b9a' },
  boxes: { name: 'Коробки', icon: '📦', color: '#050b18' },
  other: { name: 'Прочее', icon: '🎯', color: '#5a6b8a' },
} as const;

// Функция поиска предметов
export function searchItems(query: string): MovingItem[] {
  if (!query || query.trim().length < 2) {
    return MOVING_ITEMS_DATABASE;
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return MOVING_ITEMS_DATABASE.filter(item => {
    // Поиск в названии
    if (item.name.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    
    // Поиск по ключевым словам
    return item.keywords.some(keyword => 
      keyword.includes(normalizedQuery) || normalizedQuery.includes(keyword)
    );
  });
}

// Функция получения предметов по категории
export function getItemsByCategory(category: keyof typeof CATEGORIES): MovingItem[] {
  return MOVING_ITEMS_DATABASE.filter(item => item.category === category);
}

