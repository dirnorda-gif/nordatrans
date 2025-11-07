// Визуализация 2D-упаковки предметов в кузове (вид сверху)

import { useMemo } from "react";
import type { PackingResult, PlacedItem } from "@/utils/binPacking2D";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { CATEGORIES } from "@/data/movingItemsDatabase";

interface PackingVisualizationProps {
  packingResult: PackingResult;
}

export const PackingVisualization = ({ packingResult }: PackingVisualizationProps) => {
  const { placed, shelves, truckDimensions, floorUtilization, warnings, recommendation } = packingResult;

  // Масштаб для визуализации (чтобы влезло в контейнер)
  const CONTAINER_WIDTH = 600; // px
  const scale = useMemo(() => {
    return CONTAINER_WIDTH / truckDimensions.length;
  }, [truckDimensions.length]);

  const containerHeight = truckDimensions.width * scale;
  
  // 🆕 Сравнение с классическим расчётом по объёму
  const classicCalculation = useMemo(() => {
    const baseVolume = placed.reduce((sum, p) => sum + p.item.volume, 0);
    const PACKING_COEFFICIENT = 1.3;
    const packedVolume = baseVolume * PACKING_COEFFICIENT;
    
    // Классический выбор машины по объёму
    let classicTruck = '500кг';
    if (packedVolume > 2) classicTruck = '1.5т';
    if (packedVolume > 6) classicTruck = '3т';
    if (packedVolume > 12) classicTruck = '5т';
    if (packedVolume > 20) classicTruck = '10т';
    if (packedVolume > 40) classicTruck = '20т';
    
    return {
      baseVolume,
      packedVolume,
      classicTruck
    };
  }, [placed]);

  // Цвета для категорий
  const categoryColors: Record<string, string> = {
    furniture: '#3b82f6',     // синий
    appliances: '#10b981',    // зелёный
    boxes: '#f59e0b',         // оранжевый
    other: '#8b5cf6'          // фиолетовый
  };

  // Генерация уникального цвета для каждого предмета (с учётом категории)
  const getItemColor = (item: PlacedItem, index: number): string => {
    const baseColor = categoryColors[item.item.category] || '#6b7280';
    
    // Варьируем яркость для разных экземпляров
    const opacity = 0.7 + (index % 3) * 0.1;
    return baseColor + Math.round(opacity * 255).toString(16).padStart(2, '0');
  };

  return (
    <div className="space-y-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Визуализация упаковки (вид сверху)</h3>
        <div className="text-sm text-gray-600">
          Заполненность пола: <span className="font-bold" style={{ color: '#083cb5' }}>
            {floorUtilization.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Рекомендация */}
      <div className={`p-3 rounded-lg border ${
        warnings.some(w => w.severity === 'critical') 
          ? 'bg-red-50 border-red-200' 
          : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-start gap-2">
          {warnings.some(w => w.severity === 'critical') ? (
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm font-medium ${
            warnings.some(w => w.severity === 'critical') ? 'text-red-800' : 'text-green-800'
          }`}>
            {recommendation}
          </p>
        </div>
      </div>

      {/* Предупреждения */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((warning, index) => (
            <div key={index} className={`p-2 rounded border text-xs ${
              warning.severity === 'critical' 
                ? 'bg-red-50 border-red-200 text-red-800'
                : warning.severity === 'warning'
                ? 'bg-orange-50 border-orange-200 text-orange-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
            }`}>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{warning.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Легенда */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(CATEGORIES).map(([key, { name, icon }]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div 
              className="w-3 h-3 rounded border border-gray-300" 
              style={{ backgroundColor: categoryColors[key] }}
            />
            <span className="text-gray-700">{icon} {name}</span>
          </div>
        ))}
      </div>

      {/* Кузов (вид сверху) */}
      <div className="relative border-2 border-gray-800 rounded-lg overflow-hidden bg-gray-100" 
           style={{ width: CONTAINER_WIDTH, height: containerHeight }}>
        
        {/* Надписи осей */}
        <div className="absolute top-0 left-0 bottom-0 w-6 bg-gray-800 text-white text-xs flex items-center justify-center font-bold"
             style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          ⬆ КАБИНА ⬆
        </div>
        <div className="absolute top-0 left-6 right-0 h-6 bg-gray-800 text-white text-xs flex items-center justify-center font-bold">
          ← Длина: {truckDimensions.length} см →
        </div>
        <div className="absolute top-6 right-0 bottom-0 w-6 bg-gray-800 text-white text-xs flex items-center justify-center font-bold"
             style={{ writingMode: 'vertical-lr' }}>
          Ширина: {truckDimensions.width} см
        </div>

        {/* Сетка (опционально) */}
        <svg className="absolute top-6 left-6 pointer-events-none" 
             width={CONTAINER_WIDTH - 6} 
             height={containerHeight - 6}
             style={{ opacity: 0.1 }}>
          {/* Вертикальные линии (каждые 50 см) */}
          {Array.from({ length: Math.floor(truckDimensions.length / 50) }, (_, i) => (
            <line
              key={`v-${i}`}
              x1={(i + 1) * 50 * scale}
              y1={0}
              x2={(i + 1) * 50 * scale}
              y2={containerHeight - 6}
              stroke="#000"
              strokeWidth="1"
            />
          ))}
          {/* Горизонтальные линии (каждые 50 см) */}
          {Array.from({ length: Math.floor(truckDimensions.width / 50) }, (_, i) => (
            <line
              key={`h-${i}`}
              x1={0}
              y1={(i + 1) * 50 * scale}
              x2={CONTAINER_WIDTH - 6}
              y2={(i + 1) * 50 * scale}
              stroke="#000"
              strokeWidth="1"
            />
          ))}
        </svg>

        {/* Полки (для отладки - можно закомментировать) */}
        {shelves.map((shelf) => (
          <div
            key={shelf.index}
            className="absolute border-t border-dashed border-gray-400"
            style={{
              top: 24 + shelf.y * scale,
              left: 24,
              right: 0,
              height: 0,
              opacity: 0.3
            }}
          />
        ))}

        {/* Размещённые предметы */}
        <div className="absolute top-6 left-6 right-6 bottom-0">
          {placed.map((placedItem, index) => {
            const category = CATEGORIES[placedItem.item.category];
            
            const x = placedItem.x * scale;
            const y = placedItem.y * scale;
            const width = placedItem.height * scale;  // height = длина в кузове
            const height = placedItem.width * scale;   // width = ширина в кузове
            
            // 🆕 Для коробок: считаем количество коробок в стопке
            const getBoxStackCount = (): number => {
              if (placedItem.item.category !== 'boxes') return 0;
              
              // Находим все коробки в этом стеке (с одинаковыми X,Y координатами)
              const stackBoxes = placed.filter(p => {
                if (p.item.category !== 'boxes') return false;
                
                // Проверяем, что коробки стоят одна на одной (совпадают по X,Y)
                const samePosition = (
                  Math.abs(p.x - placedItem.x) < 5 &&
                  Math.abs(p.y - placedItem.y) < 5
                );
                
                return samePosition;
              });
              
              return stackBoxes.length;
            };
            
            const boxStackCount = getBoxStackCount();
            
            // Правильное склонение для русского языка
            const getBoxLabel = (count: number): string => {
              if (count === 1) return 'коробка';
              if (count >= 2 && count <= 4) return 'коробки';
              return 'коробок';
            };

            return (
              <div
                key={`${placedItem.item.id}-${index}`}
                className="absolute border-2 border-white rounded shadow-sm cursor-pointer hover:shadow-lg transition-shadow group"
                style={{
                  left: x,
                  top: y,
                  width: width,
                  height: height,
                  backgroundColor: getItemColor(placedItem, index),
                }}
                title={`${placedItem.item.name} (${placedItem.height}×${placedItem.width} см)`}
              >
                {/* Текст на предмете (только если достаточно места) */}
                {width > 40 && height > 30 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-xs font-bold p-1 text-center leading-tight overflow-hidden">
                    <span className="text-lg">{category.icon}</span>
                    {width > 80 && height > 50 && (
                      <span className="text-[10px] mt-0.5 drop-shadow">
                        {placedItem.item.name}
                      </span>
                    )}
                  </div>
                )}

                {/* Tooltip при наведении */}
                <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded shadow-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {placedItem.item.category === 'boxes' && boxStackCount > 1 ? (
                    // Для коробок в стопке - показываем количество
                    <>
                      <div className="font-bold">📦 {boxStackCount} {getBoxLabel(boxStackCount)}</div>
                      <div className="text-gray-300 mt-0.5">
                        {placedItem.item.name}
                      </div>
                    </>
                  ) : (
                    // Для остальных предметов - название и габариты
                    <>
                      <div className="font-bold">{placedItem.item.name}</div>
                      <div className="text-gray-300 mt-0.5">
                        Габариты: {placedItem.item.length}×{placedItem.item.width}×{placedItem.item.height} см
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="p-3 bg-gray-50 rounded-lg border">
          <div className="text-gray-600 text-xs mb-1">Размещено предметов</div>
          <div className="text-xl font-bold" style={{ color: '#083cb5' }}>
            {placed.length}
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg border">
          <div className="text-gray-600 text-xs mb-1">Заполненность пола</div>
          <div className="text-xl font-bold" style={{ color: '#083cb5' }}>
            {floorUtilization.toFixed(0)}%
          </div>
        </div>
      </div>
      
      {/* 🆕 Сравнение с классическим расчётом */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          Сравнение алгоритмов
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* Классический расчёт */}
          <div className="space-y-2">
            <div className="font-semibold text-gray-600">📦 Классический (объём)</div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Базовый объём:</span>
                <span className="font-mono">{classicCalculation.baseVolume.toFixed(2)} м³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">× коэффициент 1.3:</span>
                <span className="font-mono">{classicCalculation.packedVolume.toFixed(2)} м³</span>
              </div>
              <div className="flex justify-between pt-1 border-t">
                <span className="text-gray-600 font-semibold">Машина:</span>
                <span className="font-bold text-blue-600">{classicCalculation.classicTruck}</span>
              </div>
            </div>
          </div>
          
          {/* 2D упаковка */}
          <div className="space-y-2">
            <div className="font-semibold text-gray-600">🎯 2D упаковка (новый)</div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Размещено:</span>
                <span className="font-mono">{placed.length} предм.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Заполнено пола:</span>
                <span className="font-mono">{floorUtilization.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between pt-1 border-t">
                <span className="text-gray-600 font-semibold">Машина:</span>
                <span className="font-bold text-green-600">{truckDimensions.name}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Результат сравнения */}
        <div className="mt-3 pt-3 border-t border-blue-300">
          {classicCalculation.classicTruck === truckDimensions.name ? (
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span>Оба алгоритма рекомендуют одинаковую машину</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Info className="w-4 h-4" />
              <span>
                2D алгоритм: <strong>{truckDimensions.name}</strong> vs Классический: <strong>{classicCalculation.classicTruck}</strong>
                {' '}(учёт реальных габаритов)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Информация о кузове */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800">
            <div className="font-bold mb-1">{truckDimensions.name}</div>
            <div>Габариты кузова: {truckDimensions.length}×{truckDimensions.width}×{truckDimensions.height} см</div>
            <div className="mt-1">
              Объём кузова: {((truckDimensions.length * truckDimensions.width * truckDimensions.height) / 1_000_000).toFixed(2)} м³
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

