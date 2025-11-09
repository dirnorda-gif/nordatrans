import { useMemo } from 'react';

interface TruckVisualizationProps {
  currentVolume: number;
  maxVolume: number;
  truckName: string;
  truckCapacity: string;
  truckDescription: string;
  floorUtilization?: number; // Реальная заполненность пола из 2D-упаковки (в %)
}

// Маппинг типов грузовиков на изображения из автопарка (с прозрачным фоном)
const getTruckImage = (truckName: string): string => {
  const imageMap: Record<string, string> = {
    'Портер': '/1-removebg-preview (1).webp',                    // 6м³, 800кг
    'Газель': '/3-removebg-preview (1).webp',                    // 9м³
    '3 тонны': '/5-removebg-preview (1).webp',                   // 15м³
    '5 тонн': '/7-removebg-preview (1).webp',                    // 30м³
    '10 тонн': '/2-removebg-preview (1).webp',                   // 45м³
    '20 тонн': '/4-removebg-preview (1).webp',                   // 82м³
  };
  
  return imageMap[truckName] || '/1-removebg-preview (1).webp';
};

// Размеры кузова для каждого типа (из данных автопарка)
const getTruckDimensions = (truckName: string) => {
  const dimensions: Record<string, { length: string; width: string; height: string; pallets: number }> = {
    'Портер': { length: '2,65м', width: '1,5м', height: '1,6м', pallets: 2 },
    'Газель': { length: '3м', width: '1,95м', height: '1,6м', pallets: 4 },
    '3 тонны': { length: '3,80м', width: '2,1м', height: '2м', pallets: 6 },
    '5 тонн': { length: '4-6м', width: '2,3м', height: '2,2м', pallets: 10 },
    '10 тонн': { length: '6-9м', width: '2,4м', height: '2,35м', pallets: 17 },
    '20 тонн': { length: '13,6м', width: '2,45м', height: '2,65м', pallets: 33 },
  };
  
  return dimensions[truckName] || { length: '3м', width: '2м', height: '2м', pallets: 4 };
};

export const TruckVisualization = ({ 
  currentVolume, 
  maxVolume, 
  truckName,
  truckCapacity,
  truckDescription,
  floorUtilization
}: TruckVisualizationProps) => {
  // Процент заполнения
  const fillPercentage = useMemo(() => {
    // 🆕 Если передана реальная заполненность пола из 2D-упаковки - используем её!
    if (floorUtilization !== undefined && floorUtilization > 0) {
      console.log('🟡 TruckVisualization: используем реальную заполненность пола из конструктора:', floorUtilization);
      return Math.min(floorUtilization, 100);
    }
    
    // Иначе рассчитываем по объёму (классический способ)
    if (currentVolume === 0 || maxVolume === 0) return 0;
    const percentage = Math.min((currentVolume / maxVolume) * 100, 100);
    console.log('🟡 TruckVisualization: расчёт по объёму:', {
      currentVolume,
      maxVolume,
      truckName,
      truckCapacity,
      fillPercentage: percentage
    });
    return percentage;
  }, [currentVolume, maxVolume, truckName, truckCapacity, floorUtilization]);

  // Цвет в зависимости от заполненности
  const getFillColor = () => {
    if (fillPercentage < 30) return { main: '#10b981', light: 'rgba(16, 185, 129, 0.2)' }; // green
    if (fillPercentage < 60) return { main: '#3b82f6', light: 'rgba(59, 130, 246, 0.2)' }; // blue
    if (fillPercentage < 90) return { main: '#f59e0b', light: 'rgba(245, 158, 11, 0.2)' }; // orange
    return { main: '#ef4444', light: 'rgba(239, 68, 68, 0.2)' }; // red
  };

  const fillColor = getFillColor();
  const truckImage = getTruckImage(truckName);
  const dimensions = getTruckDimensions(truckName);

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 space-y-3">
      {/* Заголовок с названием транспорта, грузоподъемностью и объемом */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <span>🚚</span>
            <span>{truckName}</span>
          </h4>
          <span className="text-xs font-bold px-2 py-1 rounded bg-white text-[#405b9a]">
            {currentVolume} / {maxVolume} м³
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/90 font-medium">{truckDescription}</p>
          <p className="text-sm text-white/90 font-semibold">
            Грузоподъемность: {truckCapacity}
          </p>
        </div>
      </div>

      {/* Основная визуализация: фото слева + кузов сверху справа */}
      <div className="grid grid-cols-2 gap-2">
        {/* ЛЕВАЯ ЧАСТЬ: Фото грузовика из автопарка - крупное на весь блок */}
        <div className="flex items-center justify-center min-h-[180px]">
          <img 
            src={truckImage}
            alt={truckName}
            className="w-full h-full object-contain"
            style={{ 
              filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3))',
            }}
          />
        </div>

        {/* ПРАВАЯ ЧАСТЬ: Кузов вид сверху */}
        <div className="flex flex-col min-h-[180px]">
          <div className="mb-2">
            <p className="text-xs text-white/80 text-center font-medium">
              {dimensions.length} × {dimensions.width} × {dimensions.height}
            </p>
          </div>
          
          {/* SVG визуализация кузова сверху */}
          <div className="relative flex-1 min-h-[140px]">
            <svg 
              viewBox="0 0 200 100" 
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Контур кузова (вид сверху) */}
              <rect 
                x="10" 
                y="10" 
                width="180" 
                height="80" 
                fill="rgba(255, 255, 255, 0.08)"
                stroke="white"
                strokeWidth="2"
                rx="3"
              />

              {/* Заполненная часть кузова */}
              <rect 
                x="10" 
                y="10" 
                width={180 * (fillPercentage / 100)} 
                height="80" 
                fill={fillColor.main}
                fillOpacity="0.6"
                rx="3"
                style={{
                  transition: 'width 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />

              {/* Сетка палет */}
              {fillPercentage > 0 && (
                <g opacity="0.4">
                  {Array.from({ length: Math.min(dimensions.pallets, Math.ceil(fillPercentage / 10)) }).map((_, i) => {
                    const cols = Math.ceil(Math.sqrt(dimensions.pallets));
                    const row = Math.floor(i / cols);
                    const col = i % cols;
                    const cellWidth = 180 / cols;
                    const cellHeight = 80 / Math.ceil(dimensions.pallets / cols);
                    
                    return (
                      <rect
                        key={i}
                        x={10 + col * cellWidth + 2}
                        y={10 + row * cellHeight + 2}
                        width={cellWidth - 4}
                        height={cellHeight - 4}
                        fill="none"
                        stroke="white"
                        strokeWidth="1"
                        rx="1"
                      />
                    );
                  })}
                </g>
              )}

              {/* Процент в центре */}
              {fillPercentage > 0 && (
                <>
                  <text
                    x="100"
                    y="55"
                    textAnchor="middle"
                    fill="white"
                    fontSize="20"
                    fontWeight="bold"
                    style={{ textShadow: '0 0 6px rgba(0,0,0,0.8)' }}
                  >
                    {fillPercentage.toFixed(0)}%
                  </text>
                  {/* Индикатор, что данные из конструктора */}
                  {floorUtilization !== undefined && floorUtilization > 0 && (
                    <text
                      x="100"
                      y="70"
                      textAnchor="middle"
                      fill="#10b981"
                      fontSize="8"
                      fontWeight="600"
                      style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
                    >
                      🎯 из конструктора
                    </text>
                  )}
                </>
              )}
            </svg>
          </div>

          {/* Подпись */}
          <div className="mt-2 text-center">
            <p className="text-xs text-white/70 font-medium">
              {fillPercentage > 0 ? `~${Math.ceil(dimensions.pallets * fillPercentage / 100)} палет` : 'Вид сверху'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

