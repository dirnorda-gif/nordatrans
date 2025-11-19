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
import { Input } from "@/components/ui/input";
import { Phone } from "lucide-react";
import { MobileProgressIndicator } from "@/components/MobileProgressIndicator";
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
// ЗАЩИТА ОТ ДУБЛИРОВАНИЯ ЛИДОВ
// ============================================================================
// Глобальный Set для отслеживания отправленных заявок (не сбрасывается при размонтировании)
const submittedLeads = new Set<string>();

// ============================================================================
// A/B ТЕСТИРОВАНИЕ
// ============================================================================
// Функция для определения варианта A/B теста
function getABTestVariant(): 'A' | 'B' {
  const savedVariant = sessionStorage.getItem('ab_test_variant');
  if (savedVariant === 'A' || savedVariant === 'B') {
    console.log(`🧪 [A/B Test] Используется сохранённый вариант: ${savedVariant}`);
    return savedVariant;
  }
  
  const variant = Math.random() < 0.5 ? 'A' : 'B';
  sessionStorage.setItem('ab_test_variant', variant);
  sessionStorage.setItem('ab_test_start', Date.now().toString());
  
  console.log(`🧪 [A/B Test] Назначен новый вариант: ${variant}`);
  
  // Отправляем событие в Яндекс.Метрику
  if (typeof window !== 'undefined' && (window as any).ym) {
    (window as any).ym(98742465, 'params', {
      ab_test_variant: variant,
      ab_test_assigned: new Date().toISOString()
    });
  }
  
  return variant;
}

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
  showPrice: boolean; // Флаг показа цены (после анимации)
  constructorItems?: SelectedItem[];
  constructorUrl?: string;
  isConstructorUsed: boolean;
  // Упаковка для коммерческих грузов
  packaging: string; // "pallets" | "boxes" | "bulk" | ""
  palletCount: string;
  palletWeight: string;
  // A/B тестирование
  abTestVariant: 'A' | 'B';
  abTestAssigned: boolean;
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
  showPrice: false,
  constructorItems: undefined,
  constructorUrl: undefined,
  isConstructorUsed: false,
  packaging: "",
  palletCount: "",
  palletWeight: "",
  abTestVariant: 'A',
  abTestAssigned: false,
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
  const [showPrice, setShowPrice] = useState(false);
  const [constructorItems, setConstructorItems] = useState<SelectedItem[] | undefined>(undefined);
  const [constructorUrl, setConstructorUrl] = useState<string | undefined>(undefined);
  const [isConstructorUsed, setIsConstructorUsed] = useState(false);
  const [packaging, setPackaging] = useState("");
  const [palletCount, setPalletCount] = useState("");
  const [palletWeight, setPalletWeight] = useState("");
  
  // A/B тестирование
  const [abTestVariant, setAbTestVariant] = useState<'A' | 'B'>('A');
  const [abTestAssigned, setAbTestAssigned] = useState(false);
  const [hasStartedFilling, setHasStartedFilling] = useState(false);

  // Назначение варианта A/B теста при загрузке компонента
  React.useEffect(() => {
    if (!abTestAssigned) {
      const variant = getABTestVariant();
      setAbTestVariant(variant);
      setAbTestAssigned(true);
      console.log(`🧪 [NewStepCalculator] A/B вариант назначен при загрузке: ${variant}`);
    }
  }, [abTestAssigned]);

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
    setShowPrice: (show: boolean) => void;
    setPackaging: (p: string) => void;
    setPalletCount: (c: string) => void;
    setPalletWeight: (w: string) => void;
    hasStartedFilling: boolean;
    setHasStartedFilling: (v: boolean) => void;
  } = {
    from, to, fromCoords, toCoords, errors, activeStep, transportType,
    volumeIndex, weightIndex, contactMethod, userContact, cargoErrors,
    estimatedPrice, distance, deliveryDays, isSubmitting, showPrice,
    constructorItems, constructorUrl, isConstructorUsed,
    packaging, palletCount, palletWeight,
    abTestVariant, abTestAssigned, hasStartedFilling,
    setFrom, setFromCoords, setTo, setToCoords, setErrors, setActiveStep,
    setTransportType, setVolumeIndex, setWeightIndex, setContactMethod,
    setUserContact, setCargoErrors, setEstimatedPrice, setDistance,
    setDeliveryDays, setIsSubmitting, setShowPrice, setConstructorItems, setConstructorUrl,
    setIsConstructorUsed, setPackaging, setPalletCount, setPalletWeight,
    setHasStartedFilling,
  };

  // Определяем количество шагов и названия в зависимости от варианта A/B теста
  const totalSteps = abTestVariant === 'A' ? 3 : 4;
  const showPriceInParams = abTestVariant === 'A'; // Показывать ли цену в параметрах
  
  // Определяем название текущего шага для мобильного индикатора
  const getStepName = () => {
    if (activeStep === 0) return "Маршрут";
    if (activeStep === 1) return "Параметры груза";
    if (abTestVariant === 'A') {
      if (activeStep === 2) return "Цена";
    } else {
      if (activeStep === 2) return "Контакты";
      if (activeStep === 3) return "Цена";
    }
    return "";
  };

  // Расчёт объёма и веса для модального окна
  const isMoving = transportType === "Домашний переезд";
  const palletVolume = 0.144;
  const totalPalletVolume = packaging === "pallets" && palletCount && palletWeight 
    ? parseFloat(palletCount) * palletVolume 
    : 0;
  const totalPalletWeight = packaging === "pallets" && palletCount && palletWeight 
    ? parseFloat(palletCount) * parseFloat(palletWeight) / 1000 
    : 0;

  const displayVolume = isMoving 
    ? VOLUME_STEPS_MOVING[volumeIndex] 
    : packaging === "pallets" 
      ? totalPalletVolume 
      : VOLUME_STEPS_COMMERCIAL[volumeIndex];

  const displayWeight = isMoving 
    ? 0 
    : packaging === "pallets" 
      ? totalPalletWeight 
      : WEIGHT_STEPS_COMMERCIAL[weightIndex] / 1000;

  return (
    <FormContext.Provider value={contextValue as any}>
    <section 
      className="w-full py-16 relative border-b-2 border-[#083cb5] overflow-hidden" 
      style={{ background: 'linear-gradient(180deg, #E5F3FC 0%, #5599DF 100%)' }}
    >
        <div className="flex justify-center lg:px-[50px] relative z-10">
          <div className="w-full lg:w-4/5 mx-auto">
        {/* Desktop версия */}
        <div className="hidden lg:grid lg:grid-cols-[192px_5px_1fr] gap-0">
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

        {/* Mobile версия */}
        <div className="lg:hidden flex flex-col px-5">
          {/* Мобильный индикатор прогресса */}
          {(activeStep !== totalSteps - 1 || !showPrice) && (
            <MobileProgressIndicator 
              currentStep={activeStep + 1}
              totalSteps={totalSteps}
              stepName={getStepName()}
            />
          )}
          
          {/* Блок стоимости на финальном шаге (только для варианта A, когда цена готова) */}
          {abTestVariant === 'A' && activeStep === 2 && showPrice && estimatedPrice > 0 && (
            <div className="w-full flex justify-center mb-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 inline-block border-2 border-[#083cb5]/30">
                <div className="text-center space-y-2">
                  <div className="text-gray-600 text-xs">Предварительная стоимость</div>
                  <div className="text-[#083cb5] text-3xl font-bold">
                    {estimatedPrice.toLocaleString('ru-RU')} ₽
                  </div>
                  {distance && (
                    <div className="text-gray-700 text-xs">
                      Расстояние: {Math.round(distance / 1000)} км
                    </div>
                  )}
                  {deliveryDays && (
                    <div className="text-gray-700 text-xs">
                      Срок доставки: {deliveryDays}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Контент шага */}
          <StepContent />
        </div>
          </div>
        </div>
      </section>
    </FormContext.Provider>
  );
}

// ============================================================================
// ПАРАМЕТРЫ (левая колонка)
// ============================================================================
function ParametersPanel() {
  const ctx = useFormContext() as any;
  const { from, fromCoords, to, toCoords, errors, activeStep, transportType, volumeIndex, weightIndex, cargoErrors, estimatedPrice, distance, deliveryDays, isConstructorUsed, showPrice, packaging, palletCount, palletWeight, abTestVariant } = ctx;
  const hasRoute = from && to && fromCoords && toCoords && !errors.from && !errors.to;
  const hasCargoErrors = cargoErrors && (cargoErrors.volume || cargoErrors.weight);
  const isMoving = transportType === "Домашний переезд";
  const showPriceBlock = abTestVariant === 'A'; // Показывать блок цены только в варианте A
  
  // Расчёт объёма для палет (1.2м × 0.8м × 0.15м = 0.144 м³)
  const palletVolume = 0.144;
  const totalPalletVolume = palletCount && palletWeight ? parseFloat(palletCount) * palletVolume : 0;
  const totalPalletWeight = palletCount && palletWeight ? parseFloat(palletCount) * parseFloat(palletWeight) : 0;

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
        
        {activeStep >= 1 && !hasCargoErrors && (
          <>
            {isMoving ? (
              // Домашний переезд
              volumeIndex > 0 && (
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
              )
            ) : (
              // Коммерческие грузы
              <>
                {packaging && (
                  <div className="text-gray-800 text-xs">
                    Упаковка: {packaging === "pallets" ? "На палетах" : packaging === "boxes" ? "В коробках" : "Россыпью"}
                  </div>
                )}
                
                {packaging === "pallets" && palletCount && palletWeight ? (
                  // Палеты
                  <>
                    <div className="text-gray-800 text-xs">Кол-во палет: {palletCount}</div>
                    <div className="text-gray-800 text-xs">Вес палеты: {palletWeight} кг</div>
                    <div className="text-gray-800 text-xs">Объём: {totalPalletVolume.toFixed(2)} м³</div>
                    <div className="text-gray-800 text-xs">Общий вес: {(totalPalletWeight / 1000).toFixed(1)} т</div>
                  </>
                ) : (
                  // Коробки/россыпь
                  <>
                    {volumeIndex > 0 && (
                      <div className="text-gray-800 text-xs">Объём: {formatVolume(VOLUME_STEPS_COMMERCIAL[volumeIndex])}</div>
                    )}
                    {weightIndex > 0 && (
                      <div className="text-gray-800 text-xs">Вес: {formatWeight(WEIGHT_STEPS_COMMERCIAL[weightIndex])}</div>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
        
      </div>
    </div>
  );
}

// ============================================================================
// СТРЕЛКИ ШАГОВ
// ============================================================================
function StepsRow() {
  const ctx = useFormContext() as any;
  const { activeStep, abTestVariant, setActiveStep, setFrom, setFromCoords, setTo, setToCoords, setErrors, setTransportType, setVolumeIndex, setWeightIndex, setContactMethod, setUserContact, setEstimatedPrice, setDistance, setDeliveryDays } = ctx;

  const totalSteps = abTestVariant === 'A' ? 3 : 4;
  const finalStep = totalSteps - 1;

  const getStepLabel = (index: number) => {
    if (index === 0) return "Маршрут";
    if (index === 1) return activeStep >= 1 ? "Параметры груза" : "Шаг 2";
    if (abTestVariant === 'A') {
      if (index === 2) return "Цена";
    } else {
      if (index === 2) return activeStep >= 2 ? "Контакты" : "Шаг 3";
      if (index === 3) return "Цена";
    }
    return "";
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep === finalStep || targetStep >= activeStep) return;
    
    if (targetStep === 0) {
      setFrom(""); setFromCoords(undefined); setTo(""); setToCoords(undefined);
      setErrors({}); setTransportType(""); setVolumeIndex(0); setWeightIndex(0);
      setContactMethod(""); setUserContact(""); setEstimatedPrice(0);
      setDistance(null); setDeliveryDays("");
    } else if (targetStep === 1) {
      setVolumeIndex(0); setWeightIndex(0); setContactMethod("");
      setUserContact(""); setEstimatedPrice(0); setDistance(null); setDeliveryDays("");
    } else if (targetStep === 2 && abTestVariant === 'B') {
      setContactMethod(""); setUserContact(""); setEstimatedPrice(0);
      setDistance(null); setDeliveryDays("");
    }
    
    setActiveStep(targetStep);
  };

    return (
      <div className="flex" style={{ height: '35px', width: '100%' }}>
        {Array.from({ length: totalSteps }, (_, i) => i).map((i) => {
          const isClickable = i !== finalStep && i < activeStep;
          return (
            <div 
              key={i} 
              className={i ? "-ml-[10px]" : undefined}
              onClick={isClickable ? () => handleStepClick(i) : undefined}
              style={{ 
                cursor: isClickable ? 'pointer' : 'default',
                flex: 1,
                minWidth: 0,
                display: 'flex'
              }}
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
  const { activeStep, abTestVariant } = ctx;

  if (activeStep === 0) return <Step1Route />;
  if (activeStep === 1) return <Step2Cargo />;
  
  if (abTestVariant === 'A') {
    // Вариант A: 3 шага
    if (activeStep === 2) return <Step3CalculateVariantA />;
  } else {
    // Вариант B: 4 шага
    if (activeStep === 2) return <Step3ContactsVariantB />;
    if (activeStep === 3) return <Step4CalculateVariantB />;
  }

  return null;
}

// ШАГ 1: МАРШРУТ
function Step1Route() {
  const ctx = useFormContext() as any;
  const { from, to, fromCoords, toCoords, transportType, activeStep, abTestVariant, hasStartedFilling, setFrom, setFromCoords, setTo, setToCoords, setTransportType, setErrors, setActiveStep, setHasStartedFilling } = ctx;

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
    <div className="mt-4 lg:mt-[20px] lg:px-[40px] flex flex-col items-center gap-4 lg:gap-6">
      {/* Блок "0 ₽" - приманка для варианта A (только на шагах 0-1) */}
      {abTestVariant === 'A' && activeStep < 2 && (
        <div className="w-full text-center mb-2">
          <span className="text-gray-700 text-sm font-medium">Предварительная стоимость: </span>
          <span className="text-[#083cb5] text-xl font-bold">0 ₽</span>
        </div>
      )}
      
      <div className="w-full flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <CityInput
            value={from}
            onChange={(v, coords) => {
              // Отправляем событие "начало заполнения" только один раз
              if (!hasStartedFilling) {
                setHasStartedFilling(true);
                if (typeof window !== 'undefined' && (window as any).ym) {
                  // Отправляем событие с суффиксом варианта для A/B теста
                  const eventName = `form_start_filling_variant_${abTestVariant.toLowerCase()}`;
                  (window as any).ym(98742465, 'reachGoal', eventName, {
                    ab_test_variant: abTestVariant
                  });
                  console.log(`📊 [Яндекс.Метрика] Начало заполнения формы: ${eventName}`);
                }
              }
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
              // Отправляем событие "начало заполнения" только один раз
              if (!hasStartedFilling) {
                setHasStartedFilling(true);
                if (typeof window !== 'undefined' && (window as any).ym) {
                  // Отправляем событие с суффиксом варианта для A/B теста
                  const eventName = `form_start_filling_variant_${abTestVariant.toLowerCase()}`;
                  (window as any).ym(98742465, 'reachGoal', eventName, {
                    ab_test_variant: abTestVariant
                  });
                  console.log(`📊 [Яндекс.Метрика] Начало заполнения формы: ${eventName}`);
                }
              }
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
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-6 justify-center">
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

      <Button className="px-10 w-full lg:w-auto" onClick={handleNext}>
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
    packaging, palletCount, palletWeight, activeStep, abTestVariant,
    setVolumeIndex, setWeightIndex, setActiveStep, setCargoErrors,
    setConstructorItems, setConstructorUrl, setIsConstructorUsed,
    setPackaging, setPalletCount, setPalletWeight
  } = ctx;
  
  const [isConstructorOpen, setIsConstructorOpen] = useState(false);
  const isMoving = transportType === "Домашний переезд";

  const handleNext = () => {
    console.log('🔍 [Step2Cargo] Валидация:', {
      isMoving,
      packaging,
      palletCount,
      palletWeight,
      volumeIndex,
      weightIndex
    });

    const errors: { volume?: boolean; weight?: boolean } = {};
    
    if (isMoving) {
      // Домашний переезд: только объём
      if (volumeIndex === 0) errors.volume = true;
    } else {
      // Коммерческие грузы
      if (packaging === "pallets") {
        // Для палет: проверяем кол-во и вес
        if (!palletCount || parseInt(palletCount) === 0) {
          errors.volume = true;
          console.log('⚠️ [Step2Cargo] Не указано кол-во палет');
        }
        if (!palletWeight || parseInt(palletWeight) === 0) {
          errors.weight = true;
          console.log('⚠️ [Step2Cargo] Не указан вес палеты');
        }
      } else if (packaging === "boxes" || packaging === "bulk") {
        // Для коробок/россыпи: проверяем ползунки
        if (volumeIndex === 0) errors.volume = true;
        if (weightIndex === 0) errors.weight = true;
      } else {
        // Упаковка не выбрана
        errors.volume = true;
        console.log('⚠️ [Step2Cargo] Упаковка не выбрана');
      }
    }
    
    setCargoErrors(Object.keys(errors).length > 0 ? errors : undefined);
    
    if (Object.keys(errors).length === 0) {
      console.log('✅ [Step2Cargo] Валидация пройдена, переход на шаг 3');
      setActiveStep(2);
    } else {
      console.log('❌ [Step2Cargo] Валидация не пройдена:', errors);
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
      <div className="mt-4 lg:mt-[20px] lg:px-[40px] flex flex-col items-center gap-4 lg:gap-6">
        {/* Блок "0 ₽" - приманка для варианта A (только на шагах 0-1) */}
        {abTestVariant === 'A' && activeStep < 2 && (
          <div className="w-full text-center mb-2">
            <span className="text-gray-700 text-sm font-medium">Предварительная стоимость: </span>
            <span className="text-[#083cb5] text-xl font-bold">0 ₽</span>
          </div>
        )}
        
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
              className="px-6 w-full lg:w-auto"
              onClick={() => setIsConstructorOpen(true)}
            >
              🏠 Конструктор переезда
            </Button>
          </>
        ) : (
          // Коммерческие грузы: сначала упаковка, потом ползунки или поля палет
          <>
            {/* Выбор упаковки */}
            <div className="w-full">
              <label className="text-sm font-medium text-[#050b18] mb-3 block">
                Как упакован груз?
              </label>
              <div className="flex flex-col lg:flex-row gap-3 lg:gap-6 justify-center">
                {[
                  { id: "pallets", label: "На палетах" },
                  { id: "boxes", label: "В коробках" },
                  { id: "bulk", label: "Россыпью" },
                ].map((pack) => (
                  <label
                    key={pack.id}
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => {
                      console.log(`📦 [Step2Cargo] Выбрана упаковка: ${pack.label}`);
                      setPackaging(pack.id);
                    }}
                  >
                    <Checkbox
                      checked={packaging === pack.id}
                      onCheckedChange={() => setPackaging(pack.id)}
                      className="border-[#083cb5]"
                    />
                    <span className="text-[#050b18] text-sm font-medium">{pack.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Поля для палет (если выбрано "На палетах") */}
            {packaging === "pallets" && (
              <div className="w-full flex flex-col lg:flex-row gap-4 justify-center items-end">
                <div className="w-full lg:w-[168px]">
                  <label className="text-sm font-medium text-[#050b18] mb-2 block">
                    Кол-во палет
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="9999"
                    value={palletCount}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.length <= 4) {
                        console.log(`📦 [Step2Cargo] Кол-во палет: ${val}`);
                        setPalletCount(val);
                      }
                    }}
                    placeholder="0"
                    className="w-full h-10 px-3 rounded-md border border-gray-300 text-[#050b18] placeholder:text-white/60 bg-white"
                  />
                </div>
                <div className="w-full lg:w-[168px]">
                  <label className="text-sm font-medium text-[#050b18] mb-2 block">
                    Вес одной палеты (кг)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="9999"
                    value={palletWeight}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.length <= 4) {
                        console.log(`📦 [Step2Cargo] Вес палеты: ${val} кг`);
                        setPalletWeight(val);
                      }
                    }}
                    placeholder="0"
                    className="w-full h-10 px-3 rounded-md border border-gray-300 text-[#050b18] placeholder:text-white/60 bg-white"
                  />
                </div>
              </div>
            )}

            {/* Ползунки (если выбрано "В коробках" или "Россыпью") */}
            {(packaging === "boxes" || packaging === "bulk") && (
              <div className="w-full flex flex-col lg:flex-row gap-4">
                <div className={`flex-1 ${cargoErrors?.volume ? '[&_label]:!text-red-600' : '[&_label]:!text-gray-800'}`}>
                  <VolumeSlider
                    value={volumeIndex}
                    onChange={(val) => {
                      console.log(`📦 [Step2Cargo] Объём: ${VOLUME_STEPS_COMMERCIAL[val]} м³`);
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
                      console.log(`📦 [Step2Cargo] Вес: ${WEIGHT_STEPS_COMMERCIAL[val]} кг`);
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
          </>
        )}

        <Button className="px-10 w-full lg:w-auto" onClick={handleNext}>
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

// ============================================================================
// ВАРИАНТ A: 3 ШАГА С РАЗМЫТОЙ ЦЕНОЙ
// ============================================================================
// ШАГ 3 ВАРИАНТ A: СТОИМОСТЬ ПЕРЕВОЗКИ (с размытой ценой и выбором способа)
function Step3CalculateVariantA() {
  const ctx = useFormContext() as any;
  const { 
    from, to, fromCoords, toCoords, 
    transportType, volumeIndex, weightIndex, 
    contactMethod, userContact,
    isSubmitting, estimatedPrice, distance, deliveryDays, showPrice,
    constructorItems, constructorUrl, isConstructorUsed,
    packaging, palletCount, palletWeight,
    setContactMethod, setUserContact,
    setIsSubmitting, setEstimatedPrice, setDistance, setDeliveryDays, setShowPrice
  } = ctx;
  
  const isMoving = transportType === "Домашний переезд";
  
  // Расчёт объёма и веса для палет
  const palletVolume = 0.144; // 1.2м × 0.8м × 0.15м
  const totalPalletVolume = packaging === "pallets" && palletCount && palletWeight 
    ? parseFloat(palletCount) * palletVolume 
    : 0;
  const totalPalletWeight = packaging === "pallets" && palletCount && palletWeight 
    ? parseFloat(palletCount) * parseFloat(palletWeight) 
    : 0;
  
  // Флаг для предотвращения повторной отправки
  const hasSubmitted = React.useRef(false);
  
  // Состояние для предварительного расчёта (размытая цена)
  const [previewPrice, setPreviewPrice] = useState(0);
  const [previewDistance, setPreviewDistance] = useState<number | null>(null);
  const [previewDeliveryDays, setPreviewDeliveryDays] = useState("");
  const [showValidationError, setShowValidationError] = useState(false);

  // Предварительный расчёт стоимости при монтировании компонента
  React.useEffect(() => {
    const calculatePreview = async () => {
      try {
        if (!window.ymaps) {
          await loadYandexMapsScript();
        }
        
        const routeData = await calculateRoute(fromCoords!, toCoords!);
        const distanceMeters = routeData.distance;
        const distanceKm = distanceMeters / 1000;
        setPreviewDistance(distanceMeters);
        
        const days = calculateDeliveryDays(distanceKm);
        const formattedDays = formatDeliveryDays(days);
        setPreviewDeliveryDays(formattedDays);

        // Определяем объём и вес
        let volume: number;
        let weight: number;
        
        if (isMoving) {
          volume = VOLUME_STEPS_MOVING[volumeIndex];
          weight = 0;
        } else if (packaging === "pallets") {
          volume = totalPalletVolume;
          weight = totalPalletWeight;
        } else {
          volume = VOLUME_STEPS_COMMERCIAL[volumeIndex];
          weight = WEIGHT_STEPS_COMMERCIAL[weightIndex];
        }
        
        const calculationResult = calculateShippingCost(
          from, to, distanceKm, weight, volume, undefined, fromCoords, toCoords
        );
        
        if (calculationResult) {
          setPreviewPrice(calculationResult.cost);
          console.log('💰 [VariantA] Предварительная цена рассчитана:', calculationResult.cost);
        }
      } catch (error) {
        console.error('❌ [VariantA] Ошибка предварительного расчёта:', error);
      }
    };

    calculatePreview();
  }, []);

  // Функция отправки и расчёта
  const handleCalculate = async () => {
    // Валидация контактов
    if (!contactMethod || !userContact || userContact.trim() === "" || userContact.trim() === "+7" || userContact.trim() === "+7 ") {
      setShowValidationError(true);
      return;
    }
    
    setShowValidationError(false);

    // Если уже отправляли - выходим
    if (hasSubmitted.current) {
      console.log('⚠️ [VariantA] Заявка уже отправлена, пропускаем');
      return;
    }
    
    console.log('🚀 [VariantA] ========== НАЧАЛО РАСЧЁТА И ОТПРАВКИ ==========');
      
    // Устанавливаем флаг сразу
    hasSubmitted.current = true;
    setIsSubmitting(true);

    try {
      // Используем уже рассчитанные данные из preview
      setDistance(previewDistance);
      setDeliveryDays(previewDeliveryDays);
      setEstimatedPrice(previewPrice);

      // Определяем объём и вес в зависимости от типа перевозки и упаковки
      let volume: number;
      let weight: number;
      
      if (isMoving) {
        // Домашний переезд
        volume = VOLUME_STEPS_MOVING[volumeIndex];
        weight = 0;
      } else if (packaging === "pallets") {
        // Коммерческие грузы на палетах
        volume = totalPalletVolume;
        weight = totalPalletWeight;
      } else {
        // Коммерческие грузы в коробках/россыпью
        volume = VOLUME_STEPS_COMMERCIAL[volumeIndex];
        weight = WEIGHT_STEPS_COMMERCIAL[weightIndex];
      }
      
      const distanceKm = previewDistance ? previewDistance / 1000 : 0;
      
      const calculationResult = calculateShippingCost(
        from, to, distanceKm, weight, volume, undefined, fromCoords, toCoords
      );
      
      const truckCapacity = calculationResult?.truckCapacity || '';

      const leadData = {
        fromCity: from,
        toCity: to,
        phone: userContact,
        distance: distanceKm,
        weight: weight,
        volume: volume,
        cost: previewPrice,
        truckCapacity: truckCapacity,
        contactMethod: contactMethod as 'phone' | 'whatsapp',
        deliveryDays: previewDeliveryDays,
        additionalInfo: {
          transportType: transportType,
          isConstructorUsed: isConstructorUsed,
          constructorUrl: constructorUrl,
          constructorItems: constructorItems,
          packaging: !isMoving ? packaging : undefined,
          newPalletCount: packaging === "pallets" ? palletCount : undefined,
          newPalletWeight: packaging === "pallets" ? palletWeight : undefined,
          abTestVariant: 'A',
          abTestTimestamp: sessionStorage.getItem('ab_test_start'),
        }
      };

      const bitrixResult = await createBitrix24Lead(leadData);
      
      if (bitrixResult.success) {
        console.log(`✅ [VariantA] Заявка отправлена! Lead ID: ${bitrixResult.leadId}`);
        setShowPrice(true);
        
        // Отправляем событие конверсии в Яндекс.Метрику
        if (typeof window !== 'undefined' && (window as any).ym) {
          (window as any).ym(98742465, 'reachGoal', 'form_submit_variant_a', {
            ab_test_variant: 'A',
            contact_method: contactMethod
          });
        }
      } else {
        console.error(`❌ [VariantA] Ошибка Bitrix24: ${bitrixResult.error}`);
        toast.error(`Ошибка при отправке: ${bitrixResult.error}`);
      }

    } catch (error) {
      console.error('❌ [VariantA] Критическая ошибка:', error);
      toast.error(`Произошла ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      hasSubmitted.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 lg:mt-[20px] lg:px-[40px] flex flex-col items-center gap-4 lg:gap-6">
      {!showPrice ? (
        // Форма выбора способа получения расчёта
        <>
          {/* Блок с размытой стоимостью */}
          {previewPrice > 0 && (
            <div className="w-full mb-2">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border-2 border-[#083cb5]/30">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                  {/* Левая часть: Размытая цена */}
                  <div className="flex-shrink-0 text-center lg:text-left">
                    <div className="text-gray-600 text-xs mb-1">Предварительная стоимость</div>
                    <div 
                      className="text-[#083cb5] text-3xl font-bold"
                      style={{
                        filter: 'blur(15px)',
                        userSelect: 'none',
                        pointerEvents: 'none'
                      }}
                    >
                      {previewPrice.toLocaleString('ru-RU')} ₽
                    </div>
                    {previewDistance && previewDeliveryDays && (
                      <div 
                        className="text-gray-700 text-xs mt-1"
                        style={{
                          filter: 'blur(8px)',
                          userSelect: 'none',
                          pointerEvents: 'none'
                        }}
                      >
                        {Math.round(previewDistance / 1000)} км • {previewDeliveryDays}
                      </div>
                    )}
                  </div>
                  
                  {/* Правая часть: Объяснение */}
                  <div className="flex-1 bg-[#f0f3f5] rounded-lg p-3">
                    <p className="text-green-600 text-base lg:text-lg font-bold mb-2 text-center">
                      🔒 Стоимость рассчитана
                    </p>
                    <p className="text-gray-700 text-xs leading-relaxed text-center">
                      Для предотвращения массовых автоматических расчётов, мы отправляем стоимость только по <strong>WhatsApp</strong> или <strong>СМС</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="w-full">
            <div className="text-[#050b18] text-center mb-4 font-medium text-sm lg:text-base">
              Выберите, как получить расчёт
            </div>
            
            <ContactMethodInput
              contactMethod={contactMethod}
              userContact={userContact}
              onContactMethodChange={setContactMethod}
              onUserContactChange={setUserContact}
            />
          </div>

          <Button 
            className="px-10 w-full lg:w-auto" 
            onClick={handleCalculate}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Отправка...
              </>
            ) : (
              contactMethod === "whatsapp" 
                ? "Получить расчёт по WhatsApp" 
                : contactMethod === "phone"
                  ? "Получить расчёт по СМС"
                  : "Получить расчёт"
            )}
          </Button>
          
          {/* Сообщение об ошибке валидации */}
          {showValidationError && (
            <div className="text-red-600 text-sm text-center font-medium">
              ⚠️ Пожалуйста, выберите способ связи и введите номер телефона
            </div>
          )}
        </>
      ) : (
        // Результат после отправки
        <div className="bg-white/90 rounded-lg p-4 lg:p-6 text-center w-full space-y-4">
          <p className="text-[#050b18] text-base lg:text-lg font-semibold">
            ✅ Ваша заявка принята!
          </p>
          <p className="text-gray-600 text-xs lg:text-sm">
            Предварительный расчёт стоимости перевозки готов.
          </p>
          
          {/* ВРЕМЕННО ОТКЛЮЧЕНО: Блок с ценой и деталями - только для desktop */}
          {/* {estimatedPrice > 0 && (
            <div className="hidden lg:block bg-white rounded-lg p-4 border border-[#083cb5]/20">
              <div className="text-[#083cb5] text-2xl lg:text-3xl font-bold mb-3">
                {estimatedPrice.toLocaleString('ru-RU')} ₽
              </div>
              
              {distance && (
                <div className="text-gray-700 text-sm mb-1">
                  Расстояние: {Math.round(distance / 1000)} км
                </div>
              )}
              
              {deliveryDays && (
                <div className="text-gray-700 text-sm">
                  Срок доставки: {deliveryDays}
                </div>
              )}
            </div>
          )} */}
          
          <p className="text-gray-600 text-xs lg:text-sm">
            {contactMethod === "whatsapp" 
              ? "Расчёт отправлен в WhatsApp. Наш менеджер свяжется с вами в течение 10 минут для уточнения деталей."
              : "Расчёт отправлен по СМС. Наш менеджер свяжется с вами в течение 10 минут для уточнения деталей."
            }
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ВАРИАНТ B: 4 ШАГА БЕЗ ПОКАЗА ЦЕНЫ
// ============================================================================
// ШАГ 3 ВАРИАНТ B: КОНТАКТЫ (простой ввод телефона)
function Step3ContactsVariantB() {
  const ctx = useFormContext() as any;
  const { userContact, setUserContact, setActiveStep } = ctx;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^\d+]/g, '');
    
    if (!value || value === '+') {
      value = '+7 ';
      setUserContact(value);
      return;
    }
    
    if (!value.startsWith('+7')) {
      value = '+7 ' + value.replace(/^\+?7?/, '');
    }
    
    const digits = value.slice(2).replace(/\s/g, '');
    let formatted = '+7';
    if (digits.length > 0) formatted += ' ' + digits.substring(0, 3);
    if (digits.length > 3) formatted += ' ' + digits.substring(3, 6);
    if (digits.length > 6) formatted += ' ' + digits.substring(6, 8);
    if (digits.length > 8) formatted += ' ' + digits.substring(8, 10);
    
    if (digits.length > 10) {
      formatted = formatted.slice(0, 16);
    }
    
    setUserContact(formatted);
  };

  const handleNext = () => {
    if (!userContact || userContact.trim() === "" || userContact.trim() === "+7" || userContact.trim() === "+7 ") {
      return;
    }
    setActiveStep(3);
  };

  return (
    <div className="mt-4 lg:mt-[20px] lg:px-[40px] flex flex-col items-center gap-4 lg:gap-6">
      <div className="w-full">
        <div className="text-[#050b18] text-center mb-4 font-medium text-sm lg:text-base">
          Введите ваш номер телефона
        </div>
        
        <div className="flex justify-center">
          <div className="relative max-w-md w-full">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
            <Input
              type="tel"
              placeholder="Ваш телефон"
              value={userContact}
              onChange={handlePhoneChange}
              onFocus={(e) => {
                if (!e.target.value) {
                  setUserContact('+7 ');
                }
              }}
              className="h-10 pl-10 bg-white w-full"
              autoComplete="tel"
            />
          </div>
        </div>
      </div>

      <Button 
        className="px-10 w-full lg:w-auto" 
        onClick={handleNext}
        disabled={!userContact || userContact.trim() === "" || userContact.trim() === "+7" || userContact.trim() === "+7 "}
      >
        Рассчитать стоимость
      </Button>
    </div>
  );
}

// ШАГ 4 ВАРИАНТ B: РАСЧЁТ СТОИМОСТИ (подтверждение без показа цены)
function Step4CalculateVariantB() {
  const ctx = useFormContext() as any;
  const { 
    from, to, fromCoords, toCoords, 
    transportType, volumeIndex, weightIndex, 
    userContact, isSubmitting,
    constructorItems, constructorUrl, isConstructorUsed,
    packaging, palletCount, palletWeight,
    setIsSubmitting, setShowPrice
  } = ctx;
  
  const isMoving = transportType === "Домашний переезд";

  React.useEffect(() => {
    // Создаём уникальный ключ для этой заявки
    const leadKey = `${from}-${to}-${userContact}-${transportType}-${volumeIndex}`;
    
    // Проверяем, не отправляли ли мы уже эту заявку
    if (submittedLeads.has(leadKey)) {
      console.log('⚠️ [Step4VariantB] Заявка уже отправлена, пропускаем дубль');
      return;
    }
    
    const submitLead = async () => {
      // Добавляем в Set ДО отправки, чтобы предотвратить дубли
      submittedLeads.add(leadKey);
      console.log(`🔒 [Step4VariantB] Заявка заблокирована: ${leadKey}`);
      setIsSubmitting(true);

      try {
        if (!window.ymaps) {
          await loadYandexMapsScript();
        }
        
        const routeData = await calculateRoute(fromCoords!, toCoords!);
        const distanceKm = routeData.distance / 1000;
        const formattedDays = formatDeliveryDays(calculateDeliveryDays(distanceKm));

        // Определяем объём и вес
        let volume: number;
        let weight: number;
        
        const palletVolume = 0.144;
        const totalPalletVolume = packaging === "pallets" && palletCount && palletWeight 
          ? parseFloat(palletCount) * palletVolume : 0;
        const totalPalletWeight = packaging === "pallets" && palletCount && palletWeight 
          ? parseFloat(palletCount) * parseFloat(palletWeight) : 0;
        
        if (isMoving) {
          volume = VOLUME_STEPS_MOVING[volumeIndex];
          weight = 0;
        } else if (packaging === "pallets") {
          volume = totalPalletVolume;
          weight = totalPalletWeight;
        } else {
          volume = VOLUME_STEPS_COMMERCIAL[volumeIndex];
          weight = WEIGHT_STEPS_COMMERCIAL[weightIndex];
        }
        
        const calculationResult = calculateShippingCost(
          from, to, distanceKm, weight, volume, undefined, fromCoords, toCoords
        );
        
        const leadData = {
          fromCity: from,
          toCity: to,
          phone: userContact,
          distance: distanceKm,
          weight: weight,
          volume: volume,
          cost: calculationResult?.cost || 0,
          truckCapacity: calculationResult?.truckCapacity || '',
          contactMethod: 'phone' as const,
          deliveryDays: formattedDays,
          additionalInfo: {
            transportType: transportType,
            isConstructorUsed: isConstructorUsed,
            constructorUrl: constructorUrl,
            constructorItems: constructorItems,
            packaging: !isMoving ? packaging : undefined,
            newPalletCount: packaging === "pallets" ? palletCount : undefined,
            newPalletWeight: packaging === "pallets" ? palletWeight : undefined,
            abTestVariant: 'B',
            abTestTimestamp: sessionStorage.getItem('ab_test_start'),
          }
        };

        const bitrixResult = await createBitrix24Lead(leadData);
        
        if (bitrixResult.success) {
          console.log(`✅ [VariantB] Заявка отправлена! Lead ID: ${bitrixResult.leadId}`);
          setShowPrice(true);
          
          // Отправляем событие конверсии в Яндекс.Метрику
          if (typeof window !== 'undefined' && (window as any).ym) {
            (window as any).ym(98742465, 'reachGoal', 'form_submit_variant_b', {
              ab_test_variant: 'B'
            });
          }
        } else {
          toast.error(`Ошибка при отправке: ${bitrixResult.error}`);
        }

      } catch (error) {
        console.error('❌ [VariantB] Ошибка:', error);
        toast.error(`Произошла ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
        // При ошибке удаляем из Set, чтобы можно было повторить отправку
        submittedLeads.delete(leadKey);
        console.log(`🔓 [Step4VariantB] Заявка разблокирована для повтора: ${leadKey}`);
      } finally {
        setIsSubmitting(false);
      }
    };

    submitLead();
  }, []);

  return (
    <div className="mt-4 lg:mt-[20px] lg:px-[40px] flex flex-col items-center gap-4">
      {isSubmitting ? (
        <div className="bg-white/90 rounded-lg p-4 lg:p-6 text-center w-full">
          <div className="mb-4">
            <div className="inline-block animate-spin rounded-full h-10 w-10 lg:h-12 lg:w-12 border-b-2 border-[#083cb5]"></div>
          </div>
          <p className="text-[#050b18] text-base lg:text-lg font-semibold mb-2">
            Отправка заявки...
          </p>
          <p className="text-gray-600 text-xs lg:text-sm">
            Пожалуйста, подождите
          </p>
        </div>
      ) : (
        <div className="bg-white/90 rounded-lg p-4 lg:p-6 text-center w-full space-y-4">
          <p className="text-[#050b18] text-base lg:text-lg font-semibold">
            ✅ Ваша заявка принята!
          </p>
          <div className="text-[#083cb5] text-3xl lg:text-4xl font-bold my-4">
            📞
          </div>
          <p className="text-gray-700 text-sm lg:text-base leading-relaxed">
            Наш логист свяжется с вами в течение <strong>10 минут</strong> и озвучит точную стоимость перевозки с учётом всех деталей.
          </p>
          <p className="text-gray-600 text-xs lg:text-sm">
            Мы позвоним на номер: <strong>{userContact}</strong>
          </p>
        </div>
      )}
    </div>
  );
}

