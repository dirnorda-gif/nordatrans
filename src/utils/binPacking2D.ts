// 2D Bin Packing алгоритм (MaxRects Algorithm) для упаковки груза в кузов
// Учитывает реальные габариты предметов и их ориентацию
// Использует метод Maximum Rectangles для оптимальной упаковки

import type { MovingItem } from "@/data/movingItemsDatabase";

// ==================== ТИПЫ ====================

export type TruckType = "500кг" | "1.5т" | "3т" | "5т" | "10т" | "20т";

export interface TruckDimensions {
  length: number;  // Длина кузова (X, от кабины к задним дверям), см
  width: number;   // Ширина кузова (Y, слева направо), см
  height: number;  // Высота кузова (Z, от пола до потолка), см
  name: string;    // Название
}

export interface ItemOrientation {
  length: number;  // Размер вдоль оси X, см
  width: number;   // Размер вдоль оси Y, см
}

export interface PlacedItem {
  item: MovingItem;
  x: number;          // Позиция по длине (от кабины), см
  y: number;          // Позиция по ширине (от левого борта), см
  z: number;          // Высота от пола кузова, см
  width: number;      // Реальная ширина в кузове, см
  height: number;     // Реальная длина в кузове, см
  orientation: 0 | 1; // Какая ориентация использована (0 или 1)
  shelfIndex: number; // На какой полке размещён (для совместимости с визуализацией)
}

interface FreeRectangle {
  x: number;      // Позиция по длине, см
  y: number;      // Позиция по ширине, см
  width: number;  // Ширина свободного пространства, см
  height: number; // Длина свободного пространства, см
}

export interface Shelf {
  index: number;       // Номер полки
  y: number;           // Позиция полки от левого борта, см
  width: number;       // Ширина полки, см
  usedLength: number;  // Сколько длины уже занято, см
  maxHeight: number;   // Высота самого высокого предмета на полке, см
  items: PlacedItem[]; // Размещённые предметы
}

export interface PackingWarning {
  type: 'height' | 'floor' | 'unpacked';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  item?: MovingItem;
}

export interface PackingResult {
  // Результаты упаковки
  placed: PlacedItem[];       // Размещённые предметы
  unpacked: MovingItem[];     // Не поместившиеся предметы
  shelves: Shelf[];           // Полки с предметами
  
  // Метрики
  floorUtilization: number;   // Процент заполненности пола (0-100)
  volumeUtilization: number;  // Процент заполненности объёма (0-100)
  
  // Предупреждения
  warnings: PackingWarning[];
  
  // Рекомендации
  truckType: TruckType;
  truckDimensions: TruckDimensions;
  recommendation: string;
}

// ==================== КОНСТАНТЫ ====================

// Габариты кузовов (реальные данные)
export const TRUCK_DIMENSIONS: Record<TruckType, TruckDimensions> = {
  "500кг": { 
    length: 180, 
    width: 120, 
    height: 160, 
    name: "500кг (малый фургон)" 
  },
  "1.5т": { 
    length: 300, 
    width: 180, 
    height: 180, 
    name: "1.5т (Газель)" 
  },
  "3т": { 
    length: 420, 
    width: 200, 
    height: 200, 
    name: "3т" 
  },
  "5т": { 
    length: 600, 
    width: 240, 
    height: 220, 
    name: "5т" 
  },
  "10т": { 
    length: 700, 
    width: 245, 
    height: 235, 
    name: "10т" 
  },
  "20т": { 
    length: 1360, 
    width: 245, 
    height: 240, 
    name: "20т (фура)" 
  }
};

const TRUCK_ORDER: TruckType[] = ["500кг", "1.5т", "3т", "5т", "10т", "20т"];

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

/**
 * Определение ориентаций предмета (2 варианта: как есть и повёрнуто 90°)
 */
function getOrientations(item: MovingItem): [ItemOrientation, ItemOrientation] {
  return [
    { length: item.length, width: item.width },   // Ориентация 0
    { length: item.width, width: item.length }    // Ориентация 1 (повёрнуто)
  ];
}

/**
 * Проверка: является ли предмет вертикальным (шкаф, холодильник)
 */
function isVerticalItem(item: MovingItem): boolean {
  // Шкафы и холодильники ставятся вертикально
  return (
    item.category === 'furniture' && item.keywords.some(k => k.includes('шкаф')) ||
    item.category === 'appliances' && item.keywords.some(k => k.includes('холодильник'))
  );
}

/**
 * Проверка: нужно ли крепить предмет к стенке (высота >= 170 см)
 */
function needsWallSupport(item: MovingItem): boolean {
  // Высокие шкафы и холодильники нужно крепить к стенке
  return isVerticalItem(item) && item.height >= 170;
}

/**
 * Проверка: можно ли ставить предметы друг на друга (коробки)
 */
function isStackable(item: MovingItem): boolean {
  return item.category === 'boxes';
}

/**
 * Проверка: можно ли использовать предмет как основание для стопки
 * ВРЕМЕННО НЕ ИСПОЛЬЗУЕТСЯ - размещение коробок на мебели отключено
 */
// function canSupportStack(item: MovingItem): boolean {
//   // Коробки, диваны, кровати, столы могут служить основанием
//   return (
//     item.category === 'boxes' ||
//     (item.category === 'furniture' && (
//       item.keywords.some(k => k.includes('диван')) ||
//       item.keywords.some(k => k.includes('кровать')) ||
//       item.keywords.some(k => k.includes('стол'))
//     ))
//   );
// }

/**
 * Проверка: находится ли позиция у стенки фургона
 */
function isNearWall(
  x: number, 
  y: number, 
  itemWidth: number, 
  itemHeight: number,
  truckWidth: number,
  truckLength: number,
  threshold: number = 5 // см от стенки
): boolean {
  // Левая стенка (y = 0)
  if (y <= threshold) return true;
  
  // Правая стенка (y + itemWidth >= truckWidth)
  if (y + itemWidth >= truckWidth - threshold) return true;
  
  // Передняя стенка (x = 0, у кабины)
  if (x <= threshold) return true;
  
  // Задняя стенка (x + itemHeight >= truckLength)
  if (x + itemHeight >= truckLength - threshold) return true;
  
  return false;
}

/**
 * Приоритет предмета для сортировки (больше = выше приоритет)
 */
function getItemPriority(item: MovingItem): number {
  let priority = 0;
  
  // Приоритет 1: Вертикальные предметы (шкафы, холодильники) первыми
  if (isVerticalItem(item)) {
    priority += 10000;
  }
  
  // Приоритет 2: Площадь (крупные первыми)
  const area = item.length * item.width;
  priority += area;
  
  // Приоритет 3: Высота (высокие первыми)
  priority += item.height * 0.1;
  
  return priority;
}

/**
 * Приоритет категории для группировки
 */
function getCategoryPriority(category: string): number {
  const priorities: Record<string, number> = {
    'furniture': 1000,    // Мебель первой (диваны, кровати)
    'appliances': 900,    // Техника второй (стиралки, плиты)
    'boxes': 100,         // Коробки последними (будут сверху)
    'other': 500
  };
  return priorities[category] || 500;
}

/**
 * Сортировка предметов по приоритету с группировкой по категориям
 */
function sortItemsByPriority(items: MovingItem[]): MovingItem[] {
  return [...items].sort((a, b) => {
    const priorityA = getItemPriority(a);
    const priorityB = getItemPriority(b);
    const categoryA = getCategoryPriority(a.category);
    const categoryB = getCategoryPriority(b.category);
    
    // Сначала сортируем по приоритету предмета
    if (Math.abs(priorityB - priorityA) > 100) {
      return priorityB - priorityA;
    }
    
    // Если приоритеты близки, группируем по категориям
    if (categoryB !== categoryA) {
      return categoryB - categoryA;
    }
    
    // Внутри категории - по приоритету
    return priorityB - priorityA;
  });
}

// ==================== ФУНКЦИИ ПОСТОПТИМИЗАЦИИ ====================

/**
 * Проверка: можно ли разместить предмет в позиции без пересечений
 */
function canPlaceAt(
  x: number,
  y: number,
  length: number,
  width: number,
  placedItems: PlacedItem[],
  excludeItem?: PlacedItem,
  truckLength?: number,
  truckWidth?: number
): boolean {
  // Проверяем границы кузова
  if (truckLength && x + length > truckLength) return false;
  if (truckWidth && y + width > truckWidth) return false;
  if (x < 0 || y < 0) return false;
  
  // Проверяем пересечения с другими предметами
  for (const placed of placedItems) {
    if (excludeItem && placed === excludeItem) continue;
    
    const intersects = !(
      x + length <= placed.x ||
      x >= placed.x + placed.height ||
      y + width <= placed.y ||
      y >= placed.y + placed.width
    );
    
    if (intersects) return false;
  }
  
  return true;
}

/**
 * Постоптимизация: перераспределение предметов для минимизации длины
 */
function optimizePlacement(
  placedItems: PlacedItem[],
  truck: TruckDimensions
): PlacedItem[] {
  if (placedItems.length === 0) return placedItems;
  
  const maxUsedLengthBefore = Math.max(...placedItems.map(p => p.x + p.height));
  
  // Создаём копию для работы
  const optimized = [...placedItems];
  
  // Сортируем предметы: сначала те, что дальше от кабины
  const itemsByDistance = optimized
    .map((item, index) => ({ item, index, distance: item.x }))
    .sort((a, b) => b.distance - a.distance);
  
  let improved = true;
  let iterations = 0;
  const maxIterations = 5; // Увеличили до 5 итераций
  
  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;
    
    console.log(`🔄 Постоптимизация: итерация ${iterations}/${maxIterations}`);
    
    // Пытаемся переместить каждый предмет ближе к кабине
    for (const { item, index } of itemsByDistance) {
      const currentX = item.x;
      const currentY = item.y;
      let bestX = currentX;
      let bestY = item.y;
      let bestOrientation = item.orientation;
      let bestWidth = item.width;
      let bestHeight = item.height;
      let bestScore = Infinity;
      let foundBetter = false;
      
      const orientations = getOrientations(item.item);
      
      console.log(`  🔍 Проверяем ${item.item.name} (категория: ${item.item.category}), текущая позиция: (${currentX}, ${currentY})`);
      
      // Ищем лучшую позицию, сканируя от кабины
      const searchLimit = Math.min(currentX + 100, truck.length); // Увеличили до 100см
      
      for (let x = 0; x < searchLimit; x += 2) { // Шаг 2см вместо 5см
        for (let y = 0; y < truck.width; y += 2) { // Шаг 2см
          for (let oriIndex = 0; oriIndex < 2; oriIndex++) {
            const ori = orientations[oriIndex];
            
            // Проверяем, влезает ли
            if (canPlaceAt(x, y, ori.length, ori.width, optimized, item, truck.length, truck.width)) {
              // Базовая оценка: приоритет ближе к кабине
              let score = x * 100 + y * 0.1;
              
              // 🆕 УЛУЧШЕННАЯ ЛОГИКА ГРУППИРОВКИ
              
              // 1. Проверяем примыкание ВПЛОТНУЮ (максимальный приоритет)
              const touching = optimized.filter(p => 
                p !== item && 
                p.item.category === item.item.category &&
                (
                  // Примыкает справа (p слева от нас)
                  (Math.abs(p.x + p.height - x) < 3 && Math.abs(p.y - y) < ori.width + 5) ||
                  // Примыкает слева (p справа от нас)
                  (Math.abs(x + ori.length - p.x) < 3 && Math.abs(p.y - y) < ori.width + 5) ||
                  // Примыкает снизу (p сверху от нас)
                  (Math.abs(p.y + p.width - y) < 3 && Math.abs(p.x - x) < ori.length + 5) ||
                  // Примыкает сверху (p снизу от нас)
                  (Math.abs(y + ori.width - p.y) < 3 && Math.abs(p.x - x) < ori.length + 5)
                )
              );
              
              if (touching.length > 0) {
                score *= 0.01; // МАКСИМАЛЬНЫЙ бонус (было 0.05)
              } else {
                // 2. Проверяем нахождение в одной ЛИНИИ (горизонтальной или вертикальной)
                const inLine = optimized.filter(p => 
                  p !== item && 
                  p.item.category === item.item.category &&
                  (
                    // Горизонтальная линия (одинаковый Y ± 10см)
                    Math.abs(p.y - y) < 10 ||
                    // Вертикальная линия (одинаковый X ± 10см)
                    Math.abs(p.x - x) < 10
                  )
                );
                
                if (inLine.length > 0) {
                  score *= 0.1; // Сильный бонус за линию (было 0.2)
                }
              }
              
              // Улучшенное условие: перемещаем если ближе К КАБИНЕ ИЛИ лучший score
              if (score < bestScore) {
                bestScore = score;
                bestX = x;
                bestY = y;
                bestOrientation = oriIndex as 0 | 1;
                bestWidth = ori.width;
                bestHeight = ori.length;
                foundBetter = true;
              }
            }
          }
        }
      }
      
      // Если нашли лучшую позицию, перемещаем
      if (foundBetter && (bestX < currentX || bestY !== currentY || bestScore < currentX * 100)) {
        const distance = Math.sqrt(Math.pow(bestX - currentX, 2) + Math.pow(bestY - currentY, 2));
        if (distance > 5) { // Только если сдвиг больше 5см
          console.log(`  ✓ Переместили ${item.item.name}: (${currentX}, ${currentY}) → (${bestX}, ${bestY}), экономия по X: ${currentX - bestX}см, score: ${bestScore.toFixed(0)}`);
          item.x = bestX;
          item.y = bestY;
          item.orientation = bestOrientation;
          item.width = bestWidth;
          item.height = bestHeight;
          improved = true;
        } else {
          console.log(`  ⏭️ Пропускаем ${item.item.name}: сдвиг слишком маленький (${distance.toFixed(1)}см)`);
        }
      } else {
        console.log(`  ⏭️ Не нашли лучшей позиции для ${item.item.name} (bestScore: ${bestScore.toFixed(0)}, current: ${(currentX * 100).toFixed(0)})`);
      }
    }
  }
  
  const maxUsedLengthAfter = Math.max(...optimized.map(p => p.x + p.height));
  
  if (maxUsedLengthAfter < maxUsedLengthBefore) {
    console.log(`✅ Постоптимизация: ${maxUsedLengthBefore}см → ${maxUsedLengthAfter}см (сэкономлено ${Math.round(maxUsedLengthBefore - maxUsedLengthAfter)}см)`);
  }
  
  return optimized;
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ MAXRECTS ====================

/**
 * Проверка пересечения двух прямоугольников
 */
function isIntersecting(rect1: FreeRectangle, rect2: FreeRectangle): boolean {
  return !(
    rect1.x >= rect2.x + rect2.height ||
    rect1.x + rect1.height <= rect2.x ||
    rect1.y >= rect2.y + rect2.width ||
    rect1.y + rect1.width <= rect2.y
  );
}

/**
 * Разбиение свободного прямоугольника после размещения предмета
 */
function splitFreeRect(
  freeRects: FreeRectangle[],
  usedRect: FreeRectangle,
  itemWidth: number,
  itemHeight: number
): void {
  // Создаём новые свободные прямоугольники из оставшегося пространства
  
  // Справа от предмета (по длине кузова)
  if (usedRect.height > itemHeight) {
    freeRects.push({
      x: usedRect.x + itemHeight,
      y: usedRect.y,
      width: usedRect.width,
      height: usedRect.height - itemHeight
    });
  }
  
  // Сверху от предмета (по ширине кузова)
  if (usedRect.width > itemWidth) {
    freeRects.push({
      x: usedRect.x,
      y: usedRect.y + itemWidth,
      width: usedRect.width - itemWidth,
      height: usedRect.height
    });
  }
}

/**
 * Удаление прямоугольников, полностью перекрытых другими
 */
function pruneFreeRects(freeRects: FreeRectangle[]): void {
  for (let i = freeRects.length - 1; i >= 0; i--) {
    for (let j = freeRects.length - 1; j >= 0; j--) {
      if (i !== j) {
        const rect1 = freeRects[i];
        const rect2 = freeRects[j];
        
        // Проверяем, полностью ли rect1 содержится в rect2
        if (
          rect2.x <= rect1.x &&
          rect2.y <= rect1.y &&
          rect2.x + rect2.height >= rect1.x + rect1.height &&
          rect2.y + rect2.width >= rect1.y + rect1.width
        ) {
          freeRects.splice(i, 1);
          break;
        }
      }
    }
  }
}

// ==================== ОСНОВНОЙ АЛГОРИТМ ====================

/**
 * 2D Bin Packing (MaxRects Algorithm)
 * Использует алгоритм Maximum Rectangles для оптимальной упаковки
 */
export function packItems2D(
  items: MovingItem[],
  truckType: TruckType
): PackingResult {
  
  const truck = TRUCK_DIMENSIONS[truckType];
  
  // Разделяем на коробки и остальное
  const boxes: MovingItem[] = [];
  const regularItems: MovingItem[] = [];
  
  for (const item of items) {
    if (isStackable(item)) {
      boxes.push(item);
    } else {
      regularItems.push(item);
    }
  }
  
  // Сортируем мебель/технику: большие предметы сначала (по площади)
  const sortedItems = [...regularItems].sort((a, b) => {
    const areaA = a.length * a.width;
    const areaB = b.length * b.width;
    return areaB - areaA; // От большего к меньшему
  });
  
  const placedItems: PlacedItem[] = [];
  const unpackedItems: MovingItem[] = [];
  const warnings: PackingWarning[] = [];
  
  // 🆕 ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ТЕТРИС-АЛГОРИТМА
  
  // Проверка коллизии с уже размещёнными предметами
  const checkCollision = (x: number, y: number, width: number, height: number): boolean => {
    for (const placed of placedItems) {
      if (placed.z > 0) continue; // Пропускаем предметы не на полу
      
      const collides = !(
        x + height <= placed.x ||
        x >= placed.x + placed.height ||
        y + width <= placed.y ||
        y >= placed.y + placed.width
      );
      
      if (collides) return true;
    }
    return false;
  };
  
  // Поиск позиции методом "тетрис" с учётом приоритетов
  const findTetrisPosition = (
    itemWidth: number, 
    itemHeight: number,
    needsWall: boolean
  ): { x: number; y: number; score: number } | null => {
    const step = 10; // Шаг сетки в см
    let bestPosition: { x: number; y: number; score: number } | null = null;
    let bestScore = Infinity;
    
    // Пробуем позиции слева направо, снизу вверх
    for (let y = 0; y <= truck.width - itemWidth; y += step) {
      for (let x = 0; x <= truck.length - itemHeight; x += step) {
        // Проверяем, влезает ли по размерам кузова
        if (x + itemHeight > truck.length || y + itemWidth > truck.width) continue;
        
        // Проверяем коллизии
        if (checkCollision(x, y, itemWidth, itemHeight)) continue;
        
        // Вычисляем оценку позиции
        let score = x + y * 0.1; // Предпочитаем позиции ближе к началу кузова
        
        // Бонус/штраф за близость к стенкам
        const atLeftWall = y === 0;
        const atRightWall = y + itemWidth >= truck.width - step;
        const nearWall = atLeftWall || atRightWall;
        
        if (needsWall) {
            if (nearWall) {
            score *= 0.3; // Отличный бонус для высоких предметов у стенки
            } else {
            score *= 3.0; // Штраф за размещение высокого предмета не у стенки
            }
          } else {
            if (!nearWall) {
            score *= 0.8; // Небольшой бонус за освобождение стенок
          }
        }
        
        if (score < bestScore) {
          bestScore = score;
          bestPosition = { x, y, score };
        }
      }
    }
    
    return bestPosition;
  };
  
  // ========== УКЛАДКА ПРЕДМЕТОВ (ТЕТРИС-АЛГОРИТМ) ==========
  console.log(`🪑 Начинаем размещение ${sortedItems.length} предметов методом "тетрис"`);
  
  for (const item of sortedItems) {
    const orientations = getOrientations(item);
    const requiresWall = needsWallSupport(item);
    
    // Пробуем обе ориентации предмета
    let bestPosition: { x: number; y: number; score: number } | null = null;
    let bestOrientation = 0;
    let bestWidth = 0;
    let bestHeight = 0;
    
    for (let orientationIndex = 0; orientationIndex < 2; orientationIndex++) {
      const orientation = orientations[orientationIndex];
      
      const position = findTetrisPosition(
        orientation.width,
        orientation.length,
        requiresWall
      );
      
      if (position && (!bestPosition || position.score < bestPosition.score)) {
        bestPosition = position;
            bestOrientation = orientationIndex;
            bestWidth = orientation.width;
            bestHeight = orientation.length;
      }
    }
    
    // Если нашли подходящее место
    if (bestPosition) {
      // Размещаем предмет
      const placedItem: PlacedItem = {
        item,
        x: bestPosition.x,
        y: bestPosition.y,
        z: 0, // На полу кузова
        width: bestWidth,
        height: bestHeight,
        orientation: bestOrientation as 0 | 1,
        shelfIndex: 0
      };
      
      placedItems.push(placedItem);
    } else {
      // Не влезло
      unpackedItems.push(item);
      console.log(`❌ Предмет "${item.name}" НЕ ВЛЕЗ`);
      warnings.push({
        type: 'unpacked',
        severity: 'critical',
        message: `Предмет не влезает: ${item.name}`,
        item
      });
    }
  }
  
  console.log(`🪑 Размещено мебели/техники: ${placedItems.length} из ${sortedItems.length}`);
  
  // ========== ПОСТОПТИМИЗАЦИЯ РАЗМЕЩЕНИЯ (ДО укладки коробок) ==========
  // ОТКЛЮЧЕНО: При тетрис-алгоритме постоптимизация не требуется - 
  // предметы уже размещены компактно
  
  // ========== ВЕРТИКАЛЬНАЯ УКЛАДКА КОРОБОК ==========
  // 📦 ЛОГИКА "УМНЫЙ ТЕТРИС": 
  // - Сортируем коробки (большие сначала - проще разместить)
  // - Размещаем последовательно, заполняя пространство
  // - Коробки ТОЛЬКО на полу, максимум 3 яруса друг на друге
  
  // Сортируем коробки: большие сначала (по площади основания)
  const sortedBoxes = [...boxes].sort((a, b) => {
    const areaA = a.length * a.width;
    const areaB = b.length * b.width;
    return areaB - areaA; // От большего к меньшему
  });
  
  console.log(`📦 Начинаем размещение ${sortedBoxes.length} коробок методом "умный тетрис"`);
  let boxesPlacedOnFloor = 0;
  let boxesPlacedOnTop = 0;
  
  // Вспомогательная функция: проверка пересечения для коробок
  const checkBoxCollision = (x: number, y: number, width: number, height: number): boolean => {
    for (const placed of placedItems) {
      // Проверяем пересечение на уровне пола (z=0)
      if (placed.z > 0) continue; // Пропускаем предметы не на полу
      
      const collides = !(
        x + height <= placed.x ||
        x >= placed.x + placed.height ||
        y + width <= placed.y ||
        y >= placed.y + placed.width
      );
      
      if (collides) return true;
    }
    return false;
  };
  
  // Вспомогательная функция: поиск позиции для коробок (упрощённая версия)
  const findBoxTetrisPosition = (boxWidth: number, boxHeight: number): { x: number; y: number } | null => {
    const step = 10; // Шаг сетки в см (для оптимизации)
    
    // Пробуем позиции слева направо, снизу вверх
    for (let y = 0; y <= truck.width - boxWidth; y += step) {
      for (let x = 0; x <= truck.length - boxHeight; x += step) {
        // Проверяем, влезает ли коробка по размерам кузова
        if (x + boxHeight > truck.length || y + boxWidth > truck.width) continue;
        
        // Проверяем коллизии с уже размещёнными предметами
        if (!checkBoxCollision(x, y, boxWidth, boxHeight)) {
          return { x, y };
        }
      }
    }
    
    return null; // Не нашли подходящее место
  };
  
  for (const box of sortedBoxes) {
    let placed = false;
    const boxOrientations = getOrientations(box);
    
    // ШАГ 1: Пытаемся поставить коробку НА другую коробку (второй или третий ярус)
    for (const baseBox of placedItems) {
      // Размещаем только на коробках
      if (baseBox.item.category !== 'boxes') continue;
      
      // Считаем, сколько ярусов уже в этом стеке (макс 3)
      const getStackHeight = (item: PlacedItem): number => {
        let height = 1; // Сама коробка = 1 ярус
        
        // Ищем коробки, стоящие НА этой коробке
        for (const topItem of placedItems) {
          if (topItem.item.category !== 'boxes') continue;
          if (topItem.z <= item.z) continue; // Не выше текущей
          
          // Проверяем, что topItem стоит прямо НА item
          const isOnTop = !(
            topItem.x + topItem.height <= item.x ||
            topItem.x >= item.x + item.height ||
            topItem.y + topItem.width <= item.y ||
            topItem.y >= item.y + item.width
          );
          
          if (isOnTop) {
            const topHeight = getStackHeight(topItem);
            height = Math.max(height, 1 + topHeight);
          }
        }
        
        return height;
      };
      
      const currentStackHeight = getStackHeight(baseBox);
      
      // Максимум 3 яруса - если уже 3, не добавляем
      if (currentStackHeight >= 3) continue;
      
      // Проверяем: есть ли уже коробка НА этой коробке?
      const hasBoxOnTop = placedItems.some(p =>
        p.item.category === 'boxes' &&
        p.z > baseBox.z &&
        // Проверяем пересечение по X,Y
        !(p.x + p.height <= baseBox.x ||
          p.x >= baseBox.x + baseBox.height ||
          p.y + p.width <= baseBox.y ||
          p.y >= baseBox.y + baseBox.width)
      );
      
      if (hasBoxOnTop) continue; // Уже занято
      
      // Высота следующего яруса
      const topZ = baseBox.z + baseBox.item.height;
      
      // Проверяем, влезет ли по высоте кузова
      if (topZ + box.height > truck.height) continue;
      
      // Пробуем обе ориентации
      for (let oriIndex = 0; oriIndex < 2; oriIndex++) {
        const ori = boxOrientations[oriIndex];
        
        // Коробка должна влезать на основание
        if (ori.width <= baseBox.width && ori.length <= baseBox.height) {
      const placedBox: PlacedItem = {
        item: box,
            x: baseBox.x,
            y: baseBox.y,
            z: topZ,
            width: ori.width,
            height: ori.length,
            orientation: oriIndex as 0 | 1,
        shelfIndex: 0
      };
      
      placedItems.push(placedBox);
      placed = true;
          boxesPlacedOnTop++;
          break;
        }
      }
      
      if (placed) break;
    }
    
    // ШАГ 2: Если не разместили на втором ярусе, ставим на пол (метод "тетрис")
    if (!placed) {
      let bestPosition: { x: number; y: number } | null = null;
      let bestOrientation = 0;
      let bestWidth = 0;
      let bestHeight = 0;
      
      // Пробуем обе ориентации
      for (let orientationIndex = 0; orientationIndex < 2; orientationIndex++) {
        const orientation = boxOrientations[orientationIndex];
        
        const position = findBoxTetrisPosition(orientation.width, orientation.length);
        
        if (position) {
          // Нашли подходящую позицию!
          bestPosition = position;
              bestOrientation = orientationIndex;
              bestWidth = orientation.width;
              bestHeight = orientation.length;
          break; // Берём первую подходящую ориентацию
        }
      }
      
      if (bestPosition) {
        const placedBox: PlacedItem = {
          item: box,
          x: bestPosition.x,
          y: bestPosition.y,
          z: 0, // На полу
          width: bestWidth,
          height: bestHeight,
          orientation: bestOrientation as 0 | 1,
          shelfIndex: 0
        };
        
        placedItems.push(placedBox);
        placed = true;
        boxesPlacedOnFloor++;
      }
    }
    
    if (!placed) {
      unpackedItems.push(box);
      console.log(`❌ Коробка "${box.name}" НЕ ВЛЕЗЛА`);
      warnings.push({
        type: 'unpacked',
        severity: 'critical',
        message: `Коробка не влезает: ${box.name}`,
        item: box
      });
    }
  }
  
  console.log(`📦 Итого коробок: на полу ${boxesPlacedOnFloor}, на втором ярусе ${boxesPlacedOnTop}, не влезло ${sortedBoxes.length - boxesPlacedOnFloor - boxesPlacedOnTop}`);
  
  // Создаём фиктивные "полки" для совместимости с визуализацией
  const shelves: Shelf[] = [{
    index: 0,
    y: 0,
    width: truck.width,
    usedLength: truck.length,
    maxHeight: 0,
    items: placedItems
  }];
  
  // ========== ПРОВЕРКА ВЫСОТЫ И КРЕПЛЕНИЯ (для шкафов и холодильников) ==========
  for (const placedItem of placedItems) {
    const item = placedItem.item;
    
    // Проверка высоты
    if (isVerticalItem(item) && item.height > truck.height) {
      warnings.push({
        type: 'height',
        severity: 'critical',
        message: `${item.name} (высота ${item.height} см) не влезает в кузов ${truck.name} (высота ${truck.height} см)`,
        item
      });
    }
    
    // Проверка крепления к стенке
    if (needsWallSupport(item)) {
      const nearWall = isNearWall(
        placedItem.x,
        placedItem.y,
        placedItem.width,
        placedItem.height,
        truck.width,
        truck.length,
        10 // более мягкая проверка для предупреждения
      );
      
      if (!nearWall) {
        warnings.push({
          type: 'height',
          severity: 'warning',
          message: `${item.name} (${item.height} см) рекомендуется размещать у стенки для крепления ремнями`,
          item
        });
      }
    }
  }
  
  // ========== РАСЧЁТ МЕТРИК ==========
  
  // Площадь пола кузова
  const totalFloorArea = truck.length * truck.width;
  
  // Занятая площадь пола
  const usedFloorArea = placedItems.reduce((sum, placed) => {
    const orientation = getOrientations(placed.item)[placed.orientation];
    return sum + (orientation.length * orientation.width);
  }, 0);
  
  // Процент заполненности пола
  const floorUtilization = (usedFloorArea / totalFloorArea) * 100;
  
  // Объём кузова
  const totalVolume = (truck.length * truck.width * truck.height) / 1_000_000; // м³
  
  // Занятый объём (реальный)
  const usedVolume = placedItems.reduce((sum, placed) => {
    return sum + placed.item.volume;
  }, 0);
  
  // Процент заполненности объёма
  const volumeUtilization = (usedVolume / totalVolume) * 100;
  
  // ========== РЕКОМЕНДАЦИИ ==========
  let recommendation = '';
  
  if (unpackedItems.length > 0) {
    // Нужна машина побольше
    const currentIndex = TRUCK_ORDER.indexOf(truckType);
    const nextTruck = currentIndex < TRUCK_ORDER.length - 1 
      ? TRUCK_ORDER[currentIndex + 1] 
      : truckType;
    
    recommendation = `❌ Не влезло ${unpackedItems.length} предмет(а/ов). Нужна машина: ${TRUCK_DIMENSIONS[nextTruck].name}`;
  } else if (floorUtilization < 50) {
    // Слабая загрузка - можно взять меньше
    const currentIndex = TRUCK_ORDER.indexOf(truckType);
    if (currentIndex > 0) {
      const prevTruck = TRUCK_ORDER[currentIndex - 1];
      recommendation = `✅ Влезает. Заполненность ${floorUtilization.toFixed(0)}%. Возможно, подойдёт ${TRUCK_DIMENSIONS[prevTruck].name}`;
    } else {
      recommendation = `✅ Влезает отлично! Заполненность пола ${floorUtilization.toFixed(0)}%`;
    }
  } else {
    // Нормальная загрузка
    recommendation = `✅ Подходит ${truck.name}, заполненность пола ${floorUtilization.toFixed(0)}%`;
  }
  
  return {
    placed: placedItems,
    unpacked: unpackedItems,
    shelves,
    floorUtilization,
    volumeUtilization,
    warnings,
    truckType,
    truckDimensions: truck,
    recommendation
  };
}

/**
 * Определение типа машины по объёму (для начальной оценки)
 */
export function determineTruckTypeByVolume(volumeM3: number): TruckType {
  if (volumeM3 <= 2) return '500кг';
  if (volumeM3 <= 6) return '1.5т';
  if (volumeM3 <= 12) return '3т';
  if (volumeM3 <= 20) return '5т';
  if (volumeM3 <= 40) return '10т';
  return '20т';
}

/**
 * Гибридный расчёт: объём + 2D-упаковка
 */
export function calculatePackingHybrid(
  selectedItems: { item: MovingItem; quantity: number }[]
): PackingResult {
  
  console.log('🚀 === calculatePackingHybrid СТАРТ ===');
  
  // Шаг 1: Расчёт объёма (классический)
  const baseVolume = selectedItems.reduce((sum, { item, quantity }) => 
    sum + item.volume * quantity, 0
  );
  
  const PACKING_COEFFICIENT = 1.3;
  const packedVolume = baseVolume * PACKING_COEFFICIENT;
  
  // Определяем тип машины по объёму
  let truckType = determineTruckTypeByVolume(packedVolume);
  
  console.log(`📊 Базовый объём: ${baseVolume.toFixed(2)} м³, с коэффициентом: ${packedVolume.toFixed(2)} м³`);
  console.log(`🚚 Начальная машина по объёму: ${truckType}`);
  
  // Шаг 2: Раскладываем предметы в массив
  const items: MovingItem[] = selectedItems.flatMap(({ item, quantity }) =>
    Array(quantity).fill(item)
  );
  
  console.log(`📦 Всего предметов для упаковки: ${items.length}`);
  
  // Шаг 3: Пытаемся упаковать в выбранную машину
  let packingResult = packItems2D(items, truckType);
  console.log(`📐 Результат упаковки в ${truckType}: влезло ${packingResult.placed.length}, не влезло ${packingResult.unpacked.length}`);
  
  // Шаг 4: Если не влезло, пробуем машину побольше
  const maxAttempts = 3;
  let attempts = 0;
  
  while (packingResult.unpacked.length > 0 && attempts < maxAttempts) {
    const currentIndex = TRUCK_ORDER.indexOf(truckType);
    if (currentIndex >= TRUCK_ORDER.length - 1) break; // Уже максимальная машина
    
    truckType = TRUCK_ORDER[currentIndex + 1];
    console.log(`⬆️ Увеличиваем машину до ${truckType} (не влезло)`);
    packingResult = packItems2D(items, truckType);
    attempts++;
  }
  
  // Шаг 5: 🆕 ОБРАТНАЯ ОПТИМИЗАЦИЯ - проверяем, можно ли использовать меньшую машину
  if (packingResult.unpacked.length === 0 && packingResult.floorUtilization < 60) {
    const currentIndex = TRUCK_ORDER.indexOf(truckType);
    
    console.log(`🔍 Проверяем оптимизацию: заполненность ${packingResult.floorUtilization.toFixed(0)}%, текущая машина ${truckType}`);
    
    // Пробуем машины меньше текущей (от меньшей к большей)
    for (let i = currentIndex - 1; i >= 0; i--) {
      const smallerTruck = TRUCK_ORDER[i];
      console.log(`   Пробуем уменьшить до ${smallerTruck}...`);
      
      const testResult = packItems2D(items, smallerTruck);
      
      if (testResult.unpacked.length === 0) {
        // Влезает в меньшую машину!
        packingResult = testResult;
        truckType = smallerTruck;
        console.log(`   ✅ Успешно! Используем ${smallerTruck} (заполненность ${testResult.floorUtilization.toFixed(0)}%)`);
      } else {
        // Не влезает - останавливаемся, эта машина слишком маленькая
        console.log(`   ❌ Не влезает (${testResult.unpacked.length} предметов)`);
        break;
      }
    }
    
    console.log(`🎯 Итоговая машина: ${truckType}`);
  }
  
  return packingResult;
}

