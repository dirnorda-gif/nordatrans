// src/components/calculator/display/PriceDisplay.tsx
// Компонент отображения итоговой стоимости

import { Calculator, Truck, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

console.log('📦 [PriceDisplay] Компонент загружен');

interface PriceDisplayProps {
  cost: number;
  truckCapacity?: string;
  distance?: number;
  costPerKm?: number;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  contactMethod?: "phone" | "whatsapp";
}

export function PriceDisplay({
  cost,
  truckCapacity,
  distance,
  costPerKm,
  onSubmit,
  isSubmitting = false,
  contactMethod = "phone",
}: PriceDisplayProps) {
  console.log('💰 [PriceDisplay] Рендер:', {
    cost,
    truckCapacity,
    distance,
    costPerKm,
    contactMethod,
  });

  return (
    <div className="space-y-6">
      {/* Основная карточка с ценой */}
      <div className="bg-gradient-to-br from-[#083cb5] to-[#405b9a] rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="h-8 w-8" />
          <h2 className="text-2xl font-bold">Расчёт стоимости</h2>
        </div>

        <div className="space-y-4">
          {/* Итоговая стоимость */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <p className="text-sm text-white/80 mb-2">Итоговая стоимость</p>
            <p className="text-5xl font-bold">
              {cost.toLocaleString('ru-RU')} ₽
            </p>
          </div>

          {/* Детали расчёта */}
          <div className="grid grid-cols-2 gap-4">
            {truckCapacity && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-white/70" />
                  <p className="text-xs text-white/70">Транспорт</p>
                </div>
                <p className="text-sm font-semibold">{truckCapacity}</p>
              </div>
            )}

            {distance && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-xs text-white/70 mb-2">Расстояние</p>
                <p className="text-sm font-semibold">{distance} км</p>
              </div>
            )}

            {costPerKm && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 col-span-2">
                <p className="text-xs text-white/70 mb-2">Стоимость за км</p>
                <p className="text-sm font-semibold">
                  {costPerKm.toFixed(2)} ₽/км
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Уведомление о заявке */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {contactMethod === "whatsapp" ? (
              <MessageCircle className="h-5 w-5 text-green-600" />
            ) : (
              <Phone className="h-5 w-5 text-green-600" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-green-900 mb-1">
              Отправка заявки
            </h4>
            <p className="text-sm text-green-700">
              После отправки заявки наш менеджер свяжется с вами в течение{" "}
              <strong>10 минут</strong> для уточнения деталей и подтверждения заказа.
            </p>
          </div>
        </div>
      </div>

      {/* Кнопка отправки */}
      {onSubmit && (
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full h-14 text-lg font-semibold bg-[#083cb5] hover:bg-[#083cb5]/90 text-white"
        >
          {isSubmitting ? (
            <>
              <span className="animate-pulse">Отправка...</span>
            </>
          ) : (
            <>
              <Phone className="h-5 w-5 mr-2" />
              Отправить заявку
            </>
          )}
        </Button>
      )}

      {/* Дисклеймер */}
      <p className="text-xs text-center text-gray-500">
        * Окончательная стоимость может отличаться в зависимости от дополнительных
        услуг (грузчики, упаковка, страховка и т.д.)
      </p>
    </div>
  );
}

console.log('✅ [PriceDisplay] Компонент экспортирован');

