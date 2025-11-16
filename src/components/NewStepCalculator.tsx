// Автономный компонент калькулятора со стрелочными шагами
// Полностью переиспользуемый, можно вставлять в любое место сайта

import { useState, createContext, useContext } from "react";
import * as React from "react";
import Signpost from "@/components/Signpost";
import { CityInput } from "@/components/calculator/inputs/CityInput";
import { VolumeSlider } from "@/components/calculator/inputs/VolumeSlider";
import { WeightSlider } from "@/components/calculator/inputs/WeightSlider";
import { ContactMethodInput } from "@/components/calculator/inputs/ContactMethodInput";
import { MovingConstructor, type SelectedItem } from "@/components/MovingConstructor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { validateRouteFields } from "@/utils/calculator/validation";
import { VOLUME_STEPS_COMMERCIAL, WEIGHT_STEPS_COMMERCIAL, VOLUME_STEPS_PRIVATE } from "@/utils/calculator/constants";
import { formatVolume, formatWeight, calculateDeliveryDays, formatDeliveryDays } from "@/utils/calculator/calculatorHelpers";
import { calculateShippingCost } from "@/utils/shippingCalculator";
import { calculateRoute, loadYandexMapsScript } from "@/utils/calculator/yandexMaps";
import { createBitrix24Lead } from "@/utils/bitrix24";
import { generateConstructorUrl } from "@/utils/constructorUrl";
import { toast } from "sonner";

console.log('📦 [NewStepCalculator] Компонент загружен');

// Шаги объема для домашнего переезда (до 45 м³)
const VOLUME_STEPS_MOVING = VOLUME_STEPS_PRIVATE.filter(v => v <= 45);

// ============================================================================
// ТИПЫ
// ============================================================================
declare global {
  interface Window {
    ymaps?: any;
  }
}

interface FormContextType {
  from: string;
  to: string;
  fromCoords?: [number, number];
  toCoords?: [number, number];
  errors: { from?: string; to?: string; transportType?: string };
  activeStep: number;
  transportType: string;
  volumeIndex: number;
  weightIndex: number;
  contactMethod: "phone" | "whatsapp" | "";
  userContact: string;
  cargoErrors?: { volume?: boolean; weight?: boolean };
  estimatedPrice: number;
  distance: number | null;
  deliveryDays: string;
  isSubmitting: boolean;
  constructorItems?: SelectedItem[];
  constructorUrl?: string;
  isConstructorUsed: boolean;
}

const FormContext = createContext<FormContextType>({
  from: "",
  to: "",
  errors: {},
  activeStep: 0,
  transportType: "",
  volumeIndex: 0,
  weightIndex: 0,
  contactMethod: "",
  userContact: "",
  cargoErrors: undefined,
  estimatedPrice: 0,
  distance: null,
  deliveryDays: "",
  isSubmitting: false,
  constructorItems: undefined,
  constructorUrl: undefined,
  isConstructorUsed: false,
});

function useFormContext() {
  return useContext(FormContext);
}

// ============================================================================
// ГЛАВНЫЙ КОМПОНЕНТ
// ============================================================================
export function NewStepCalculator() {
  const [from, setFrom] = useState("");
  const [fromCoords, setFromCoords] = useState<[number, number] | undefined>();
  const [to, setTo] = useState("");
  const [toCoords, setToCoords] = useState<[number, number] | undefined>();
  const [errors, setErrors] = useState<{ from?: string; to?: string; transportType?: string }>({});
  const [activeStep, setActiveStep] = useState(0);
  const [transportType, setTransportType] = useState("");
  const [volumeIndex, setVolumeIndex] = useState(0);
  const [weightIndex, setWeightIndex] = useState(0);
  const [contactMethod, setContactMethod] = useState<"phone" | "whatsapp" | "">("");
  const [userContact, setUserContact] = useState("");
  const [cargoErrors, setCargoErrors] = useState<{ volume?: boolean; weight?: boolean } | undefined>(undefined);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [distance, setDistance] = useState<number | null>(null);
  const [deliveryDays, setDeliveryDays] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [constructorItems, setConstructorItems] = useState<SelectedItem[] | undefined>(undefined);
  const [constructorUrl, setConstructorUrl] = useState<string | undefined>(undefined);
  const [isConstructorUsed, setIsConstructorUsed] = useState(false);

  // Загрузка Яндекс.Карт
  React.useEffect(() => {
    console.log('🗺️ [NewStepCalculator] Загрузка Яндекс.Карт...');
    loadYandexMapsScript()
      .then(() => console.log('✅ [NewStepCalculator] Яндекс.Карты загружены'))
      .catch((error) => console.error('❌ [NewStepCalculator] Ошибка загрузки Яндекс.Карт:', error));
  }, []);

  // Автоматический расчёт маршрута
  React.useEffect(() => {
    if (fromCoords && toCoords) {
      console.log('🗺️ [NewStepCalculator] Расчёт маршрута...');
      calculateRoute(fromCoords, toCoords)
        .then((result) => {
          if (result) {
            const distanceMeters = result.distance;
            const distanceKm = distanceMeters / 1000;
            console.log(`✅ [NewStepCalculator] Маршрут: ${Math.round(distanceKm)} км`);
            setDistance(distanceMeters);
            const days = calculateDeliveryDays(distanceKm);
            setDeliveryDays(formatDeliveryDays(days));
          }
        })
        .catch((error) => console.error('❌ [NewStepCalculator] Ошибка расчёта:', error));
    }
  }, [fromCoords, toCoords]);

  const contextValue: FormContextType & {
    setFrom: (v: string) => void;
    setFromCoords: (v?: [number, number]) => void;
    setTo: (v: string) => void;
    setToCoords: (v?: [number, number]) => void;
    setErrors: (e: { from?: string; to?: string; transportType?: string }) => void;
    setActiveStep: (s: number) => void;
    setTransportType: (t: string) => void;
    setVolumeIndex: (i: number) => void;
    setWeightIndex: (i: number) => void;
    setContactMethod: (m: "phone" | "whatsapp") => void;
    setUserContact: (c: string) => void;
    setCargoErrors: (e?: { volume?: boolean; weight?: boolean }) => void;
    setEstimatedPrice: (p: number) => void;
    setDistance: (d: number | null) => void;
    setDeliveryDays: (d: string) => void;
    setIsSubmitting: (s: boolean) => void;
    setConstructorItems: (items?: SelectedItem[]) => void;
    setConstructorUrl: (url?: string) => void;
    setIsConstructorUsed: (used: boolean) => void;
  } = {
    from, to, fromCoords, toCoords, errors, activeStep, transportType,
    volumeIndex, weightIndex, contactMethod, userContact, cargoErrors,
    estimatedPrice, distance, deliveryDays, isSubmitting,
    constructorItems, constructorUrl, isConstructorUsed,
    setFrom, setFromCoords, setTo, setToCoords, setErrors, setActiveStep,
    setTransportType, setVolumeIndex, setWeightIndex, setContactMethod,
    setUserContact, setCargoErrors, setEstimatedPrice, setDistance,
    setDeliveryDays, setIsSubmitting, setConstructorItems, setConstructorUrl,
    setIsConstructorUsed,
  };

  return (
    <FormContext.Provider value={contextValue as any}>
      <div className="w-4/5 mx-auto">
        <div className="grid grid-cols-[192px_5px_1fr] gap-0">
          {/* Левая колонка - Параметры */}
          <div className="flex flex-col">
            <ParametersPanel />
          </div>
          
          {/* Вертикальный разделитель */}
          <div className="bg-[#c8d4e0] h-full" />
          
          {/* Правая колонка - Шаги и контент */}
          <div className="flex flex-col">
            <StepsRow />
            <StepContent />
          </div>
        </div>
      </div>
    </FormContext.Provider>
  );
}

// ============================================================================
// ПАРАМЕТРЫ (левая колонка)
// ============================================================================
function ParametersPanel() {
  const ctx = useFormContext() as any;
  const { from, fromCoords, to, toCoords, errors, activeStep, transportType, volumeIndex, weightIndex, cargoErrors, estimatedPrice, distance, deliveryDays, isConstructorUsed } = ctx;
  const hasRoute = from && to && fromCoords && toCoords && !errors.from && !errors.to;
  const hasCargoErrors = cargoErrors && (cargoErrors.volume || cargoErrors.weight);
  const isMoving = transportType === "Домашний переезд";

  return (
    <div className="w-[192px] flex flex-col">
      <div className="bg-[#7a9ec4] text-white font-semibold text-xs py-[6px] flex items-center justify-center">
        Параметры
      </div>

      <div className="px-2 py-2 space-y-1">
        {errors.from && <div className="text-red-600 text-xs">⚠️ {errors.from}</div>}
        {errors.to && <div className="text-red-600 text-xs">⚠️ {errors.to}</div>}
        {errors.transportType && <div className="text-red-600 text-xs">⚠️ {errors.transportType}</div>}
        {!errors.from && !errors.to && !errors.transportType && !from && !to && activeStep === 0 && (
          <div className="text-gray-600 text-xs">Заполните маршрут</div>
        )}
        
        {hasRoute && (
          <>
            <div className="text-gray-800 text-xs">Откуда: {from}</div>
            <div className="text-gray-800 text-xs">Куда: {to}</div>
          </>
        )}
        
        {transportType && (
          <div className="text-gray-800 text-xs">Тип: {transportType}</div>
        )}
        
        {hasCargoErrors && (
          <div className="text-red-600 text-xs">⚠️ Выберите значения объёма и веса</div>
        )}
        
        {activeStep >= 1 && !hasCargoErrors && volumeIndex > 0 && (
          <>
            {isMoving ? (
              <>
                <div className="text-gray-800 text-xs">
                  Объём: {formatVolume(VOLUME_STEPS_MOVING[volumeIndex])}
                </div>
                {isConstructorUsed && (
                  <div className="text-blue-600 text-xs font-medium">
                    🏗️ Через конструктор
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-gray-800 text-xs">Объём: {formatVolume(VOLUME_STEPS_COMMERCIAL[volumeIndex])}</div>
                {weightIndex > 0 && (
                  <div className="text-gray-800 text-xs">Вес: {formatWeight(WEIGHT_STEPS_COMMERCIAL[weightIndex])}</div>
                )}
              </>
            )}
          </>
        )}
        
        <div className="mt-3 pt-3 border-t border-gray-300">
          <div className="text-gray-700 text-xs font-medium mb-2 text-center">
            Предварительная стоимость:
          </div>
          <div className="text-[#083cb5] text-2xl font-bold text-center mb-3">
            {estimatedPrice ? `${estimatedPrice.toLocaleString('ru-RU')} ₽` : '0 ₽'}
          </div>
          
          {distance && (
            <div className="text-gray-700 text-xs mt-2 text-center">
              Расстояние: {Math.round(distance / 1000)} км
            </div>
          )}
          {deliveryDays && (
            <div className="text-gray-700 text-xs text-center">
              Срок доставки: {deliveryDays}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// СТРЕЛКИ ШАГОВ
// ============================================================================
function StepsRow() {
  const ctx = useFormContext() as any;
  const { activeStep, setActiveStep, setFrom, setFromCoords, setTo, setToCoords, setErrors, setTransportType, setVolumeIndex, setWeightIndex, setContactMethod, setUserContact, setEstimatedPrice, setDistance, setDeliveryDays } = ctx;

  const getStepLabel = (index: number) => {
    if (index === 0) return "Маршрут";
    if (index === 1) return activeStep >= 1 ? "Параметры груза" : "Шаг 2";
    if (index === 2) return activeStep >= 2 ? "Контакты" : "Шаг 3";
    if (index === 3) return "Расчет стоимости";
    return "";
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep === 3 || targetStep >= activeStep) return;
    
    if (targetStep === 0) {
      setFrom(""); setFromCoords(undefined); setTo(""); setToCoords(undefined);
      setErrors({}); setTransportType(""); setVolumeIndex(0); setWeightIndex(0);
      setContactMethod(""); setUserContact(""); setEstimatedPrice(0);
      setDistance(null); setDeliveryDays("");
    } else if (targetStep === 1) {
      setVolumeIndex(0); setWeightIndex(0); setContactMethod("");
      setUserContact(""); setEstimatedPrice(0); setDistance(null); setDeliveryDays("");
    } else if (targetStep === 2) {
      setContactMethod(""); setUserContact(""); setEstimatedPrice(0);
      setDistance(null); setDeliveryDays("");
    }
    
    setActiveStep(targetStep);
  };

  return (
    <div className="flex" style={{ height: '24px' }}>
      {[0, 1, 2, 3].map((i) => {
        const isClickable = i !== 3 && i < activeStep;
        return (
          <div 
            key={i} 
            className={i ? "-ml-[10px]" : undefined}
            onClick={isClickable ? () => handleStepClick(i) : undefined}
            style={{ cursor: isClickable ? 'pointer' : 'default' }}
          >
            <Signpost text={getStepLabel(i)} active={i === activeStep} />
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// КОНТЕНТ ШАГОВ
// ============================================================================
function StepContent() {
  const ctx = useFormContext() as any;
  const { activeStep } = ctx;

  if (activeStep === 0) return <Step1Route />;
  if (activeStep === 1) return <Step2Cargo />;
  if (activeStep === 2) return <Step3Contacts />;
  if (activeStep === 3) return <Step4Calculate />;

  return null;
}

// ШАГ 1: МАРШРУТ
function Step1Route() {
  const ctx = useFormContext() as any;
  const { from, to, fromCoords, toCoords, transportType, setFrom, setFromCoords, setTo, setToCoords, setTransportType, setErrors, setActiveStep } = ctx;

  const handleNext = () => {
    const validation = validateRouteFields(from, to, fromCoords, toCoords);
    const newErrors: any = { ...validation.errors };
    
    if (!transportType) {
      newErrors.transportType = "Выберите тип перевозки";
    }
    
    setErrors(newErrors);

    if (validation.isValid && transportType) {
      setActiveStep(1);
    }
  };

  const transportTypes = [
    { id: "Домашний переезд", label: "Домашний переезд" },
    { id: "Промышленные товары", label: "Промышленные товары" },
    { id: "Продукты питания", label: "Продукты питания" },
  ];

  return (
    <div className="mt-[55px] px-[40px] flex flex-col items-center gap-6">
      <div className="w-full flex gap-4">
        <div className="flex-1">
          <CityInput
            value={from}
            onChange={(v, coords) => {
              setFrom(v);
              setFromCoords(coords);
            }}
            placeholder="Откуда"
            error={!!ctx.errors.from}
          />
        </div>
        <div className="flex-1">
          <CityInput
            value={to}
            onChange={(v, coords) => {
              setTo(v);
              setToCoords(coords);
            }}
            placeholder="Куда"
            error={!!ctx.errors.to}
          />
        </div>
      </div>

      {from && to && fromCoords && toCoords && (
        <div className="w-full">
          <label className="text-sm font-medium text-[#050b18] mb-3 block">
            Тип перевозки
          </label>
          <div className="flex gap-6 justify-center">
            {transportTypes.map((type) => (
              <label
                key={type.id}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  setTransportType(type.id);
                  if (ctx.errors.transportType) {
                    setErrors({ ...ctx.errors, transportType: undefined });
                  }
                }}
              >
                <Checkbox
                  checked={transportType === type.id}
                  onCheckedChange={() => {
                    setTransportType(type.id);
                    if (ctx.errors.transportType) {
                      setErrors({ ...ctx.errors, transportType: undefined });
                    }
                  }}
                  className="border-[#083cb5]"
                />
                <span className="text-[#050b18] text-sm font-medium">{type.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <Button className="px-10" onClick={handleNext}>
        Далее
      </Button>
    </div>
  );
}

// ШАГ 2: ПАРАМЕТРЫ ГРУЗА
function Step2Cargo() {
  const ctx = useFormContext() as any;
  const { 
    transportType, volumeIndex, weightIndex, cargoErrors, isConstructorUsed,
    setVolumeIndex, setWeightIndex, setActiveStep, setCargoErrors,
    setConstructorItems, setConstructorUrl, setIsConstructorUsed
  } = ctx;
  
  const [isConstructorOpen, setIsConstructorOpen] = useState(false);
  const isMoving = transportType === "Домашний переезд";

  const handleNext = () => {
    const errors: { volume?: boolean; weight?: boolean } = {};
    
    if (volumeIndex === 0) errors.volume = true;
    if (!isMoving && weightIndex === 0) errors.weight = true;
    
    setCargoErrors(Object.keys(errors).length > 0 ? errors : undefined);
    
    if (Object.keys(errors).length === 0) {
      setActiveStep(2);
    }
  };
  
  const handleConstructorApply = (
    totalVolume: number, 
    recommendedTruck?: string, 
    floorUtilization?: number, 
    selectedItems?: SelectedItem[]
  ) => {
    console.log('🏗️ [Step2Cargo] Применение конструктора:', {
      totalVolume,
      itemsCount: selectedItems?.length
    });
    
    const closestIndex = VOLUME_STEPS_MOVING.findIndex(v => v >= totalVolume);
    const volumeIdx = closestIndex >= 0 ? closestIndex : VOLUME_STEPS_MOVING.length - 1;
    
    setVolumeIndex(volumeIdx);
    setConstructorItems(selectedItems);
    setIsConstructorUsed(true);
    
    if (selectedItems && selectedItems.length > 0) {
      const url = generateConstructorUrl(selectedItems);
      setConstructorUrl(url);
      console.log('🔗 [Step2Cargo] Ссылка на конструктор:', url);
    }
    
    if (cargoErrors?.volume) {
      setCargoErrors({ ...cargoErrors, volume: false });
    }
  };

  return (
    <>
      <div className="mt-[55px] px-[40px] flex flex-col items-center gap-4">
        {isMoving ? (
          <>
            <div className="w-full">
              <div className={`${cargoErrors?.volume ? '[&_label]:!text-red-600' : '[&_label]:!text-gray-800'}`}>
                <VolumeSlider
                  value={volumeIndex}
                  onChange={(val) => {
                    setVolumeIndex(val);
                    setIsConstructorUsed(false);
                    if (val > 0 && cargoErrors?.volume) {
                      setCargoErrors({ ...cargoErrors, volume: false });
                    }
                  }}
                  steps={VOLUME_STEPS_MOVING}
                />
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="px-6"
              onClick={() => setIsConstructorOpen(true)}
            >
              🏠 Конструктор переезда
            </Button>
          </>
        ) : (
          <div className="w-full flex gap-4">
            <div className={`flex-1 ${cargoErrors?.volume ? '[&_label]:!text-red-600' : '[&_label]:!text-gray-800'}`}>
              <VolumeSlider
                value={volumeIndex}
                onChange={(val) => {
                  setVolumeIndex(val);
                  if (val > 0 && cargoErrors?.volume) {
                    setCargoErrors({ ...cargoErrors, volume: false });
                  }
                }}
                steps={VOLUME_STEPS_COMMERCIAL}
              />
            </div>
            <div className={`flex-1 ${cargoErrors?.weight ? '[&_label]:!text-red-600' : '[&_label]:!text-gray-800'}`}>
              <WeightSlider
                value={weightIndex}
                onChange={(val) => {
                  setWeightIndex(val);
                  if (val > 0 && cargoErrors?.weight) {
                    setCargoErrors({ ...cargoErrors, weight: false });
                  }
                }}
                steps={WEIGHT_STEPS_COMMERCIAL}
              />
            </div>
          </div>
        )}

        <Button className="px-10" onClick={handleNext}>
          Далее
        </Button>
      </div>
      
      <MovingConstructor
        isOpen={isConstructorOpen}
        onClose={() => setIsConstructorOpen(false)}
        onApply={handleConstructorApply}
        initialVolume={volumeIndex > 0 ? VOLUME_STEPS_MOVING[volumeIndex] : 0}
      />
    </>
  );
}

// ШАГ 3: КОНТАКТЫ
function Step3Contacts() {
  const ctx = useFormContext() as any;
  const { contactMethod, userContact, setContactMethod, setUserContact, setActiveStep } = ctx;

  const handleCalculate = () => {
    if (!contactMethod || !userContact || userContact.trim() === "" || userContact.trim() === "+7" || userContact.trim() === "+7 ") {
      return;
    }
    setActiveStep(3);
  };

  return (
    <div className="mt-[55px] px-[40px] flex flex-col items-center gap-6">
      <div className="w-full">
        <div className="text-[#050b18] text-center mb-4 font-medium">
          Выберите удобный способ получения стоимости перевозки
        </div>
        
        <ContactMethodInput
          contactMethod={contactMethod}
          userContact={userContact}
          onContactMethodChange={setContactMethod}
          onUserContactChange={setUserContact}
        />
      </div>

      <Button className="px-10" onClick={handleCalculate}>
        Рассчитать стоимость
      </Button>
    </div>
  );
}

// ШАГ 4: РАСЧЁТ СТОИМОСТИ
function Step4Calculate() {
  const ctx = useFormContext() as any;
  const { 
    from, to, fromCoords, toCoords, 
    transportType, volumeIndex, weightIndex, 
    contactMethod, userContact,
    isSubmitting, estimatedPrice,
    constructorItems, constructorUrl, isConstructorUsed,
    setIsSubmitting, setEstimatedPrice, setDistance, setDeliveryDays
  } = ctx;
  
  const isMoving = transportType === "Домашний переезд";
  
  // Флаг для предотвращения повторной отправки
  const hasSubmitted = React.useRef(false);

  React.useEffect(() => {
    // Если уже отправляли - выходим
    if (hasSubmitted.current) {
      console.log('⚠️ [Step4Calculate] Заявка уже отправлена, пропускаем');
      return;
    }
    
    const submitAndCalculate = async () => {
      console.log('🚀 [Step4Calculate] ========== НАЧАЛО РАСЧЁТА И ОТПРАВКИ ==========');
      console.log('🚀 [Step4Calculate] hasSubmitted.current:', hasSubmitted.current);
      
      // Устанавливаем флаг сразу
      hasSubmitted.current = true;
      setIsSubmitting(true);

      try {
        if (!window.ymaps) {
          await loadYandexMapsScript();
        }
        
        const routeData = await calculateRoute(fromCoords!, toCoords!);
        const distanceMeters = routeData.distance;
        const distanceKm = distanceMeters / 1000;
        setDistance(distanceMeters);
        
        const days = calculateDeliveryDays(distanceKm);
        const formattedDays = formatDeliveryDays(days);
        setDeliveryDays(formattedDays);

        const volume = isMoving ? VOLUME_STEPS_MOVING[volumeIndex] : VOLUME_STEPS_COMMERCIAL[volumeIndex];
        const weight = isMoving ? 0 : WEIGHT_STEPS_COMMERCIAL[weightIndex];
        
        console.log('💰 [Step4Calculate] Параметры груза:', {
          transportType, volume, weight, isConstructorUsed,
          constructorItemsCount: constructorItems?.length || 0,
          constructorUrl
        });
        
        const calculationResult = calculateShippingCost(
          from, to, distanceKm, weight, volume, undefined, fromCoords, toCoords
        );
        
        if (!calculationResult) {
          throw new Error('Не удалось рассчитать стоимость перевозки');
        }
        
        const price = calculationResult.cost;
        const truckCapacity = calculationResult.truckCapacity;
        setEstimatedPrice(price);

        // Подготовка данных конструктора
        console.log('🔍 [Step4Calculate] ===== ПРОВЕРКА ДАННЫХ КОНСТРУКТОРА =====');
        console.log('🔍 [Step4Calculate] isConstructorUsed:', isConstructorUsed);
        console.log('🔍 [Step4Calculate] constructorItems:', constructorItems);
        console.log('🔍 [Step4Calculate] constructorItems?.length:', constructorItems?.length);
        console.log('🔍 [Step4Calculate] constructorUrl:', constructorUrl);
        console.log('🔍 [Step4Calculate] typeof constructorUrl:', typeof constructorUrl);
        console.log('🔍 [Step4Calculate] constructorUrl === undefined:', constructorUrl === undefined);
        
        const leadData = {
          fromCity: from,
          toCity: to,
          phone: userContact,
          distance: distanceKm,
          weight: weight,
          volume: volume,
          cost: price,
          truckCapacity: truckCapacity,
          contactMethod: contactMethod as 'phone' | 'whatsapp',
          deliveryDays: formattedDays,
          additionalInfo: {
            transportType: transportType,
            isConstructorUsed: isConstructorUsed,
            constructorUrl: constructorUrl,
            constructorItems: constructorItems
          }
        };
        
        console.log('📤 [Step4Calculate] ===== ДАННЫЕ ДЛЯ BITRIX24 =====');
        console.log('📤 [Step4Calculate] Полный объект leadData:', JSON.stringify(leadData, null, 2));
        console.log('📤 [Step4Calculate] additionalInfo.constructorUrl:', leadData.additionalInfo.constructorUrl);
        console.log('📤 [Step4Calculate] additionalInfo.constructorItems (количество):', leadData.additionalInfo.constructorItems?.length || 0);

        const bitrixResult = await createBitrix24Lead(leadData);
        
        if (bitrixResult.success) {
          console.log(`✅ [Step4Calculate] Заявка отправлена! Lead ID: ${bitrixResult.leadId}`);
          toast.success("Заявка успешно отправлена!");
        } else {
          console.error(`❌ [Step4Calculate] Ошибка Bitrix24: ${bitrixResult.error}`);
          toast.error(`Ошибка при отправке: ${bitrixResult.error}`);
        }

      } catch (error) {
        console.error('❌ [Step4Calculate] Критическая ошибка:', error);
        toast.error(`Произошла ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
        // При ошибке сбрасываем флаг, чтобы можно было повторить
        hasSubmitted.current = false;
      } finally {
        setIsSubmitting(false);
      }
    };

    submitAndCalculate();
  }, []); // Пустой массив зависимостей - выполняется один раз при монтировании

  return (
    <div className="mt-[55px] px-[40px] flex flex-col items-center gap-4">
      {isSubmitting ? (
        <div className="bg-white/90 rounded-lg p-6 text-center w-full">
          <div className="mb-4">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#083cb5]"></div>
          </div>
          <p className="text-[#050b18] text-lg font-semibold mb-2">
            Отправка заявки для точного расчёта...
          </p>
          <p className="text-gray-600 text-sm">
            Пожалуйста, подождите
          </p>
        </div>
      ) : (
        <div className="bg-white/90 rounded-lg p-6 text-center w-full">
          <p className="text-[#050b18] text-lg font-semibold mb-4">
            ✅ Ваша заявка принята!
          </p>
          <p className="text-gray-600 text-sm mb-2">
            Предварительный расчёт стоимости перевозки готов.
          </p>
          <p className="text-gray-600 text-sm">
            Наш менеджер свяжется с вами в течение 10 минут для уточнения деталей и подтверждения финальной стоимости.
          </p>
        </div>
      )}
    </div>
  );
}

