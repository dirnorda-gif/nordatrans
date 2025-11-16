// src/components/calculator/display/ParametersSidebar.tsx
// Боковая панель с отображением введённых параметров

import { MapPin, Truck, Package, Weight, Ruler } from "lucide-react";
import { formatVolume, formatWeight } from "@/utils/calculator/calculatorHelpers";

console.log('📦 [ParametersSidebar] Компонент загружен');

interface ParametersSidebarProps {
  fromCity?: string;
  toCity?: string;
  distance?: number;
  duration?: number;
  transportType?: string;
  volume?: number;
  weight?: number;
  truckName?: string;
  estimatedCost?: number;
  additionalInfo?: Record<string, any>;
}

export function ParametersSidebar({
  fromCity,
  toCity,
  distance,
  duration,
  transportType,
  volume,
  weight,
  truckName,
  estimatedCost,
  additionalInfo,
}: ParametersSidebarProps) {
  console.log('📋 [ParametersSidebar] Рендер:', {
    hasRoute: !!(fromCity && toCity),
    hasTransportType: !!transportType,
    hasParams: !!(volume || weight),
    hasCost: !!estimatedCost,
  });

  const hasAnyData = fromCity || toCity || transportType || volume || weight;

  if (!hasAnyData) {
    console.log('ℹ️ [ParametersSidebar] Нет данных для отображения');
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h3 className="text-lg font-bold text-white mb-4">📋 Параметры</h3>
        <p className="text-sm text-white/70 italic">
          Заполните форму, чтобы увидеть параметры перевозки
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 space-y-6">
      <h3 className="text-lg font-bold text-white">📋 Параметры</h3>

      {/* Маршрут */}
      {(fromCity || toCity) && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Маршрут
          </h4>
          <div className="pl-6 space-y-1">
            {fromCity && (
              <p className="text-sm text-white/90">
                <span className="text-white/70">Откуда:</span> {fromCity}
              </p>
            )}
            {toCity && (
              <p className="text-sm text-white/90">
                <span className="text-white/70">Куда:</span> {toCity}
              </p>
            )}
            {distance && (
              <p className="text-sm text-white/90">
                <span className="text-white/70">Расстояние:</span> {distance} км
              </p>
            )}
            {duration && (
              <p className="text-sm text-white/90">
                <span className="text-white/70">Время в пути:</span> ~{duration} ч
              </p>
            )}
          </div>
        </div>
      )}

      {/* Тип перевозки */}
      {transportType && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Package className="h-4 w-4" />
            Тип перевозки
          </h4>
          <div className="pl-6">
            <p className="text-sm text-white/90">{transportType}</p>
          </div>
        </div>
      )}

      {/* Параметры груза */}
      {(volume !== undefined || weight !== undefined) && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Параметры груза
          </h4>
          <div className="pl-6 space-y-1">
            {volume !== undefined && (
              <p className="text-sm text-white/90">
                <span className="text-white/70">Объём:</span> {formatVolume(volume)}
              </p>
            )}
            {weight !== undefined && (
              <p className="text-sm text-white/90">
                <span className="text-white/70">Вес:</span> {formatWeight(weight)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Рекомендуемый транспорт */}
      {truckName && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Рекомендуемый транспорт
          </h4>
          <div className="pl-6">
            <p className="text-sm text-white/90">{truckName}</p>
          </div>
        </div>
      )}

      {/* Дополнительная информация */}
      {additionalInfo && Object.keys(additionalInfo).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white">ℹ️ Дополнительно</h4>
          <div className="pl-6 space-y-1">
            {Object.entries(additionalInfo).map(([key, value]) => (
              <p key={key} className="text-sm text-white/90">
                <span className="text-white/70">{key}:</span> {String(value)}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Предварительная стоимость */}
      {estimatedCost && estimatedCost > 0 && (
        <div className="mt-6 pt-6 border-t border-white/20">
          <div className="bg-[#083cb5] rounded-lg p-4">
            <p className="text-sm text-white/80 mb-1">Предварительная стоимость</p>
            <p className="text-2xl font-bold text-white">
              {estimatedCost.toLocaleString('ru-RU')} ₽
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

console.log('✅ [ParametersSidebar] Компонент экспортирован');

