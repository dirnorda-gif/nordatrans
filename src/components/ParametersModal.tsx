import React from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';

interface ParametersModalProps {
  isOpen: boolean;
  onClose: () => void;
  origin: string;
  destination: string;
  volume: number;
  weight: number;
  price: number;
  distance: number;
  deliveryTime: number;
  transportType?: string;
  packagingType?: string;
  palletCount?: number;
  palletWeight?: number;
}

export function ParametersModal({
  isOpen,
  onClose,
  origin,
  destination,
  volume,
  weight,
  price,
  distance,
  deliveryTime,
  transportType,
  packagingType,
  palletCount,
  palletWeight,
}: ParametersModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-4 bg-white/95 backdrop-blur-sm rounded-2xl p-6">
        {/* Заголовок с кнопкой закрытия */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#050b18]">📊 Ваши параметры</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Параметры */}
        <div className="space-y-3 text-sm">
          {origin && (
            <div>
              <span className="text-gray-600">Откуда:</span>{' '}
              <span className="font-medium text-[#050b18]">{origin}</span>
            </div>
          )}
          
          {destination && (
            <div>
              <span className="text-gray-600">Куда:</span>{' '}
              <span className="font-medium text-[#050b18]">{destination}</span>
            </div>
          )}

          {transportType && (
            <div>
              <span className="text-gray-600">Тип перевозки:</span>{' '}
              <span className="font-medium text-[#050b18]">{transportType}</span>
            </div>
          )}

          {packagingType && (
            <div>
              <span className="text-gray-600">Упаковка:</span>{' '}
              <span className="font-medium text-[#050b18]">{packagingType}</span>
            </div>
          )}

          {palletCount !== undefined && palletCount > 0 && (
            <div>
              <span className="text-gray-600">Количество палет:</span>{' '}
              <span className="font-medium text-[#050b18]">{palletCount}</span>
            </div>
          )}

          {palletWeight !== undefined && palletWeight > 0 && (
            <div>
              <span className="text-gray-600">Вес одной палеты:</span>{' '}
              <span className="font-medium text-[#050b18]">{palletWeight} кг</span>
            </div>
          )}

          {volume > 0 && (
            <div>
              <span className="text-gray-600">Объём:</span>{' '}
              <span className="font-medium text-[#050b18]">{volume} м³</span>
            </div>
          )}
          
          {weight > 0 && (
            <div>
              <span className="text-gray-600">Вес:</span>{' '}
              <span className="font-medium text-[#050b18]">{weight} т</span>
            </div>
          )}

          {/* Разделитель */}
          {(origin || destination || volume > 0 || weight > 0) && (
            <div className="border-t border-gray-300 my-3"></div>
          )}

          {/* Расчётные данные */}
          <div>
            <span className="text-gray-600">Предварительная стоимость:</span>
            <div className="text-xl font-bold text-[#083cb5] mt-1">
              {price.toLocaleString('ru-RU')} ₽
            </div>
          </div>

          {distance > 0 && (
            <div>
              <span className="text-gray-600">Расстояние:</span>{' '}
              <span className="font-medium text-[#050b18]">{distance} км</span>
            </div>
          )}

          {deliveryTime > 0 && (
            <div>
              <span className="text-gray-600">Срок доставки:</span>{' '}
              <span className="font-medium text-[#050b18]">
                {deliveryTime} {deliveryTime === 1 ? 'день' : deliveryTime < 5 ? 'дня' : 'дней'}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

