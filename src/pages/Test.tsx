import Header from "@/components/Header";
import { BannerUp } from "@/components/BannerUp";
import Footer from "@/components/Footer";
import Signpost from "@/components/Signpost";
import { useState, createContext, useContext, useRef, useEffect } from "react";
import * as React from "react";
import { CityInput } from "@/components/calculator/inputs/CityInput";
import { VolumeSlider } from "@/components/calculator/inputs/VolumeSlider";
import { WeightSlider } from "@/components/calculator/inputs/WeightSlider";
import { ContactMethodInput } from "@/components/calculator/inputs/ContactMethodInput";
import { Button } from "@/components/ui/button";
import { validateRouteFields } from "@/utils/calculator/validation";
import { VOLUME_STEPS_COMMERCIAL, WEIGHT_STEPS_COMMERCIAL } from "@/utils/calculator/constants";
import { formatVolume, formatWeight, calculateDeliveryDays, formatDeliveryDays } from "@/utils/calculator/calculatorHelpers";
import { calculateShippingCost } from "@/utils/shippingCalculator";
import { calculateRoute, loadYandexMapsScript } from "@/utils/calculator/yandexMaps";
import { createBitrix24Lead } from "@/utils/bitrix24";
import { toast } from "sonner";

console.log('📄 [Test Page] Загрузка тестовой страницы');

// ============================================================================
// ТИПЫ
// ============================================================================
declare global {
  interface Window {
    ymaps?: any;
  }
}

// ============================================================================
// КОНТЕКСТ ФОРМЫ
// ============================================================================
interface FormContextType {
  from: string;
  to: string;
  fromCoords?: [number, number];
  toCoords?: [number, number];
  errors: { from?: string; to?: string };
  activeStep: number;
  volumeIndex: number;
  weightIndex: number;
  contactMethod: "phone" | "whatsapp" | "";
  userContact: string;
  cargoErrors?: { volume?: boolean; weight?: boolean };
  estimatedPrice: number;
  distance: number | null;
  deliveryDays: string;
  isSubmitting: boolean;
}

const FormContext = createContext<FormContextType>({
  from: "",
  to: "",
  errors: {},
  activeStep: 0,
  volumeIndex: 0,
  weightIndex: 0,
  contactMethod: "",
  userContact: "",
  cargoErrors: undefined,
  estimatedPrice: 0,
  distance: null,
  deliveryDays: "",
  isSubmitting: false,
});

function useFormContext() {
  return useContext(FormContext);
}

// ============================================================================
// ГЛАВНЫЙ КОМПОНЕНТ
// ============================================================================
const Test = () => {
  console.log('🎨 [Test Page] Рендер страницы');
  
  return (
    <div className="min-h-screen bg-[#f0f3f5]">
      <Header />
      <BannerUp />

      {/* Основной контейнер с отступами и центрированием */}
      <section className="flex justify-center px-[50px] py-[100px] mt-12">
        <FormProvider>
          {/* Основная колонка 80% ширины страницы */}
          <div className="w-4/5">
            {/* Двухколоночная система: 25% (192px) + 5px разделитель + 75% (auto) */}
            <div className="grid grid-cols-[192px_5px_1fr] gap-0">
              {/* Левая колонка 25% - Параметры */}
              <div className="flex flex-col">
                <ParametersPanel />
              </div>

              {/* Вертикальная разделительная линия */}
              <div className="bg-[#c8d4e0] h-full" />

              {/* Правая колонка 75% - Шаги и контент */}
              <div className="flex flex-col">
                <StepsRow />
                <StepContent />
              </div>
            </div>
          </div>
        </FormProvider>
      </section>
      
      <Footer />
    </div>
  );
};

export default Test;

// ============================================================================
// ПРОВАЙДЕР ФОРМЫ
// ============================================================================
function FormProvider({ children }: { children: React.ReactNode }) {
  const [from, setFrom] = useState("");
  const [fromCoords, setFromCoords] = useState<[number, number] | undefined>();
  const [to, setTo] = useState("");
  const [toCoords, setToCoords] = useState<[number, number] | undefined>();
  const [errors, setErrors] = useState<{ from?: string; to?: string }>({});
  const [activeStep, setActiveStep] = useState(0);
  const [volumeIndex, setVolumeIndex] = useState(0);
  const [weightIndex, setWeightIndex] = useState(0);
  const [contactMethod, setContactMethod] = useState<"phone" | "whatsapp" | "">("");
  const [userContact, setUserContact] = useState("");
  const [cargoErrors, setCargoErrors] = useState<{ volume?: boolean; weight?: boolean } | undefined>(undefined);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [distance, setDistance] = useState<number | null>(null);
  const [deliveryDays, setDeliveryDays] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Загрузка Яндекс.Карт при монтировании компонента
  React.useEffect(() => {
    console.log('🗺️ [FormProvider] Инициализация: загрузка Яндекс.Карт...');
    loadYandexMapsScript()
      .then(() => {
        console.log('✅ [FormProvider] Яндекс.Карты успешно загружены');
      })
      .catch((error) => {
        console.error('❌ [FormProvider] Ошибка загрузки Яндекс.Карт:', error);
      });
  }, []);

  // Расчёт маршрута при изменении координат
  React.useEffect(() => {
    if (fromCoords && toCoords) {
      console.log('🗺️ [FormProvider] Расчёт маршрута при изменении координат...');
      console.log('📍 [FormProvider] Откуда:', from, fromCoords);
      console.log('📍 [FormProvider] Куда:', to, toCoords);
      
      calculateRoute(fromCoords, toCoords)
        .then((result) => {
          if (result) {
            const distanceMeters = result.distance;
            const distanceKm = distanceMeters / 1000;
            console.log(`✅ [FormProvider] Маршрут рассчитан: ${distanceMeters} м (${distanceKm.toFixed(2)} км)`);
            setDistance(distanceMeters);
            
            // Расчёт срока доставки
            const days = calculateDeliveryDays(distanceKm);
            const formattedDays = formatDeliveryDays(days);
            console.log(`📅 [FormProvider] Срок доставки: ${formattedDays}`);
            setDeliveryDays(formattedDays);
          } else {
            console.warn('⚠️ [FormProvider] Не удалось рассчитать маршрут');
            setDistance(null);
            setDeliveryDays("");
          }
        })
        .catch((error) => {
          console.error('❌ [FormProvider] Ошибка расчёта маршрута:', error);
          setDistance(null);
          setDeliveryDays("");
        });
    }
  }, [fromCoords, toCoords, from, to]);

  const contextValue: FormContextType & {
    setFrom: (v: string) => void;
    setFromCoords: (v?: [number, number]) => void;
    setTo: (v: string) => void;
    setToCoords: (v?: [number, number]) => void;
    setErrors: (e: { from?: string; to?: string }) => void;
    setActiveStep: (s: number) => void;
    setVolumeIndex: (i: number) => void;
    setWeightIndex: (i: number) => void;
    setContactMethod: (m: "phone" | "whatsapp") => void;
    setUserContact: (c: string) => void;
    setCargoErrors: (e?: { volume?: boolean; weight?: boolean }) => void;
    setEstimatedPrice: (p: number) => void;
    setDistance: (d: number | null) => void;
    setDeliveryDays: (d: string) => void;
    setIsSubmitting: (s: boolean) => void;
  } = {
    from,
    to,
    fromCoords,
    toCoords,
    errors,
    activeStep,
    volumeIndex,
    weightIndex,
    contactMethod,
    userContact,
    cargoErrors,
    estimatedPrice,
    distance,
    deliveryDays,
    isSubmitting,
    setFrom,
    setFromCoords,
    setTo,
    setToCoords,
    setErrors,
    setActiveStep,
    setVolumeIndex,
    setWeightIndex,
    setContactMethod,
    setUserContact,
    setCargoErrors,
    setEstimatedPrice,
    setDistance,
    setDeliveryDays,
    setIsSubmitting,
  };

  return (
    <FormContext.Provider value={contextValue as any}>
      {children}
    </FormContext.Provider>
  );
}

// ============================================================================
// ПАРАМЕТРЫ (левая колонка)
// ============================================================================
function ParametersPanel() {
  const ctx = useFormContext() as any;
  const { from, fromCoords, to, toCoords, errors, activeStep, volumeIndex, weightIndex, cargoErrors, estimatedPrice, distance, deliveryDays } = ctx;
  const hasRoute = from && to && fromCoords && toCoords && !errors.from && !errors.to;
  
  // Проверка валидности параметров груза на шаге 2 (только если есть ошибки валидации)
  const hasCargoErrors = cargoErrors && (cargoErrors.volume || cargoErrors.weight);

  return (
    <div className="w-[192px] flex flex-col">
      {/* Заголовок - всегда статичный */}
      <div className="bg-[#7a9ec4] text-white font-semibold text-xs py-[6px] flex items-center justify-center">
        Параметры
      </div>

      {/* Информация ниже - без фона */}
      <div className="px-2 py-2 space-y-1">
        {/* Ошибки маршрута */}
        {errors.from && <div className="text-red-600 text-xs">⚠️ {errors.from}</div>}
        {errors.to && <div className="text-red-600 text-xs">⚠️ {errors.to}</div>}
        {!errors.from && !errors.to && !from && !to && activeStep === 0 && (
          <div className="text-gray-600 text-xs">Заполните маршрут</div>
        )}
        
        {/* Данные маршрута */}
        {hasRoute && (
          <>
            <div className="text-gray-800 text-xs">Откуда: {from}</div>
            <div className="text-gray-800 text-xs">Куда: {to}</div>
          </>
        )}
        
        {/* Ошибки параметров груза */}
        {hasCargoErrors && (
          <div className="text-red-600 text-xs">⚠️ Выберите значения объёма и веса</div>
        )}
        
        {/* Данные параметров груза */}
        {activeStep >= 1 && !hasCargoErrors && volumeIndex > 0 && weightIndex > 0 && (
          <>
            <div className="text-gray-800 text-xs">Объём: {formatVolume(VOLUME_STEPS_COMMERCIAL[volumeIndex])}</div>
            <div className="text-gray-800 text-xs">Вес: {formatWeight(WEIGHT_STEPS_COMMERCIAL[weightIndex])}</div>
          </>
        )}
        
        {/* Предварительная стоимость (всегда показывается) */}
        <div className="mt-3 pt-3 border-t border-gray-300">
          <div className="text-gray-700 text-xs font-medium mb-2 text-center">
            Предварительная стоимость:
          </div>
          <div className="text-[#083cb5] text-2xl font-bold text-center mb-3">
            {estimatedPrice ? `${estimatedPrice.toLocaleString('ru-RU')} ₽` : '0 ₽'}
          </div>
          
          {/* Расстояние и срок доставки (показываются после расчёта) */}
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
  const { activeStep, setActiveStep, setFrom, setFromCoords, setTo, setToCoords, setErrors, setVolumeIndex, setWeightIndex, setContactMethod, setUserContact, setEstimatedPrice, setDistance, setDeliveryDays } = ctx;
  const rowRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (rowRef.current) {
      const height = rowRef.current.offsetHeight;
      console.log(`🎯 [StepsRow] activeStep=${activeStep}, высота блока стрелок: ${height}px`);
    }
  }, [activeStep]);

  const getStepLabel = (index: number) => {
    if (index === 0) return "Маршрут";
    if (index === 1) return activeStep >= 1 ? "Параметры груза" : "Шаг 2";
    if (index === 2) return activeStep >= 2 ? "Контакты" : "Шаг 3";
    if (index === 3) return "Расчет стоимости";
    return "";
  };

  const handleStepClick = (targetStep: number) => {
    console.log(`🖱️ [StepsRow] Клик по шагу ${targetStep}, текущий шаг: ${activeStep}`);
    
    // Шаг 3 (Расчёт стоимости) не кликабелен - это самый верхний регистр
    if (targetStep === 3) {
      console.log(`🚫 [StepsRow] Шаг "Расчёт стоимости" не кликабелен (самый верхний регистр)`);
      return;
    }
    
    // Можно кликать только на предыдущие шаги (переход назад)
    if (targetStep >= activeStep) {
      console.log(`🚫 [StepsRow] Нельзя перейти вперёд через клик. Используйте кнопку "Далее"`);
      return;
    }
    
    console.log(`⬅️ [StepsRow] Переход назад с шага ${activeStep} на шаг ${targetStep}, сброс данных`);
    
    // Сброс данных в зависимости от того, на какой шаг возвращаемся
    if (targetStep === 0) {
      // Возврат на шаг 1 - сбрасываем всё
      setFrom("");
      setFromCoords(undefined);
      setTo("");
      setToCoords(undefined);
      setErrors({});
      setVolumeIndex(0);
      setWeightIndex(0);
      setContactMethod("");
      setUserContact("");
      setEstimatedPrice(0);
      setDistance(null);
      setDeliveryDays("");
    } else if (targetStep === 1) {
      // Возврат на шаг 2 - сбрасываем объём, вес и контакты
      setVolumeIndex(0);
      setWeightIndex(0);
      setContactMethod("");
      setUserContact("");
      setEstimatedPrice(0);
      setDistance(null);
      setDeliveryDays("");
    } else if (targetStep === 2) {
      // Возврат на шаг 3 - сбрасываем только контакты
      setContactMethod("");
      setUserContact("");
      setEstimatedPrice(0);
      setDistance(null);
      setDeliveryDays("");
    }
    
    setActiveStep(targetStep);
  };

  return (
    <div ref={rowRef} className="flex" style={{ height: '24px' }}>
      {[0, 1, 2, 3].map((i) => {
        // Все шаги кликабельны, кроме шага 3 (Расчёт стоимости) и только если они ниже текущего шага
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
  const { from, to, fromCoords, toCoords, setFrom, setFromCoords, setTo, setToCoords, setErrors, setActiveStep } = ctx;

  const handleNext = () => {
    const validation = validateRouteFields(from, to, fromCoords, toCoords);
    setErrors(validation.errors);

    if (validation.isValid) {
      setActiveStep(1);
    }
  };

  return (
    <div className="mt-[55px] px-[40px] flex flex-col items-center gap-4">
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

      <Button className="px-10" onClick={handleNext}>
        Далее
      </Button>
    </div>
  );
}

// ШАГ 2: ПАРАМЕТРЫ ГРУЗА
function Step2Cargo() {
  const ctx = useFormContext() as any;
  const { volumeIndex, weightIndex, cargoErrors, setVolumeIndex, setWeightIndex, setActiveStep, setCargoErrors } = ctx;

  const handleNext = () => {
    console.log('🔍 [Step2Cargo] Валидация параметров груза:', { volumeIndex, weightIndex });
    
    const errors: { volume?: boolean; weight?: boolean } = {};
    
    if (volumeIndex === 0) {
      errors.volume = true;
      console.log('❌ [Step2Cargo] Объём не выбран (индекс = 0)');
    }
    
    if (weightIndex === 0) {
      errors.weight = true;
      console.log('❌ [Step2Cargo] Вес не выбран (индекс = 0)');
    }
    
    setCargoErrors(Object.keys(errors).length > 0 ? errors : undefined);
    
    if (Object.keys(errors).length === 0) {
      console.log('✅ [Step2Cargo] Валидация пройдена, переход на шаг 3');
      setActiveStep(2);
    } else {
      console.log('⚠️ [Step2Cargo] Валидация не пройдена');
    }
  };

  return (
    <div className="mt-[55px] px-[40px] flex flex-col items-center gap-4">
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

      <Button className="px-10" onClick={handleNext}>
        Далее
      </Button>
    </div>
  );
}

// ШАГ 3: КОНТАКТЫ
function Step3Contacts() {
  const ctx = useFormContext() as any;
  const { contactMethod, userContact, setContactMethod, setUserContact, setActiveStep } = ctx;

  const handleCalculate = () => {
    console.log('🔍 [Step3Contacts] Валидация контактов:', { contactMethod, userContact });
    
    if (!contactMethod) {
      console.log('❌ [Step3Contacts] Способ связи не выбран');
      // TODO: Показать ошибку в ParametersPanel
      return;
    }
    
    if (!userContact || userContact.trim() === "" || userContact.trim() === "+7" || userContact.trim() === "+7 ") {
      console.log('❌ [Step3Contacts] Контакт не заполнен');
      // TODO: Показать ошибку в ParametersPanel
      return;
    }
    
    console.log('✅ [Step3Contacts] Валидация пройдена, переход на шаг 4');
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
    volumeIndex, weightIndex, 
    contactMethod, userContact,
    isSubmitting, estimatedPrice,
    setIsSubmitting, setEstimatedPrice, setDistance, setDeliveryDays
  } = ctx;

  React.useEffect(() => {
    const submitAndCalculate = async () => {
      console.log('🚀 [Step4Calculate] ========== НАЧАЛО РАСЧЁТА И ОТПРАВКИ ==========');
      console.log('📊 [Step4Calculate] Исходные данные:', {
        from,
        to,
        fromCoords,
        toCoords,
        volumeIndex,
        weightIndex,
        contactMethod,
        userContact
      });
      
      setIsSubmitting(true);

      try {
        // 0. Проверка и загрузка Яндекс.Карт
        console.log('🗺️ [Step4Calculate] ===== ШАГ 0: ПРОВЕРКА ЯНДЕКС.КАРТ =====');
        if (!window.ymaps) {
          console.log('⏳ [Step4Calculate] Яндекс.Карты не загружены, загружаем...');
          await loadYandexMapsScript();
          console.log('✅ [Step4Calculate] Яндекс.Карты загружены');
        } else {
          console.log('✅ [Step4Calculate] Яндекс.Карты уже загружены');
        }
        
        // 1. Расчёт маршрута
        console.log('📍 [Step4Calculate] ===== ШАГ 1: РАСЧЁТ МАРШРУТА =====');
        console.log('📍 [Step4Calculate] Координаты отправления:', fromCoords);
        console.log('📍 [Step4Calculate] Координаты назначения:', toCoords);
        
        const routeData = await calculateRoute(fromCoords!, toCoords!);
        console.log('📍 [Step4Calculate] Результат расчёта маршрута:', routeData);
        
        const distanceMeters = routeData.distance;
        const distanceKm = distanceMeters / 1000;
        console.log(`📍 [Step4Calculate] Расстояние: ${distanceMeters} м (${distanceKm.toFixed(2)} км)`);
        setDistance(distanceMeters); // Сохраняем в метрах, как в новом калькуляторе
        
        // 2. Расчёт срока доставки
        console.log('📅 [Step4Calculate] ===== ШАГ 2: РАСЧЁТ СРОКА ДОСТАВКИ =====');
        const days = calculateDeliveryDays(distanceKm);
        console.log(`📅 [Step4Calculate] Количество дней: ${days}`);
        
        const formattedDays = formatDeliveryDays(days);
        console.log(`📅 [Step4Calculate] Форматированный срок: ${formattedDays}`);
        setDeliveryDays(formattedDays);

        // 3. Расчёт стоимости
        console.log('💰 [Step4Calculate] ===== ШАГ 3: РАСЧЁТ СТОИМОСТИ =====');
        const volume = VOLUME_STEPS_COMMERCIAL[volumeIndex];
        const weight = WEIGHT_STEPS_COMMERCIAL[weightIndex];
        console.log('💰 [Step4Calculate] Параметры груза:', {
          volumeIndex,
          volume: `${volume} м³`,
          weightIndex,
          weight: `${weight} кг`
        });
        
        console.log('💰 [Step4Calculate] Вызов calculateShippingCost с параметрами:', {
          fromCity: from,
          toCity: to,
          distanceKm: distanceKm,
          weightKg: weight,
          volumeM3: volume,
          transportType: undefined,
          fromCoords: fromCoords,
          toCoords: toCoords
        });
        
        const calculationResult = calculateShippingCost(
          from,
          to,
          distanceKm,
          weight,
          volume,
          undefined, // transportType
          fromCoords,
          toCoords
        );
        
        console.log('💰 [Step4Calculate] Результат расчёта стоимости:', calculationResult);
        
        if (!calculationResult) {
          console.error('❌ [Step4Calculate] calculateShippingCost вернул null!');
          throw new Error('Не удалось рассчитать стоимость перевозки');
        }
        
        const price = calculationResult.cost;
        const truckCapacity = calculationResult.truckCapacity;
        console.log(`💰 [Step4Calculate] Итоговая стоимость: ${price} ₽`);
        console.log(`🚛 [Step4Calculate] Рекомендуемый транспорт: ${truckCapacity}`);
        
        setEstimatedPrice(price);
        console.log('💰 [Step4Calculate] Стоимость установлена в state');

        // 4. Отправка в Bitrix24
        console.log('📤 [Step4Calculate] ===== ШАГ 4: ОТПРАВКА В BITRIX24 =====');
        
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
        };
        console.log('📤 [Step4Calculate] Данные для отправки в Bitrix24:', leadData);

        const bitrixResult = await createBitrix24Lead(leadData);
        console.log('📤 [Step4Calculate] Результат отправки в Bitrix24:', bitrixResult);
        
        if (bitrixResult.success) {
          console.log(`✅ [Step4Calculate] Заявка успешно отправлена! Lead ID: ${bitrixResult.leadId}`);
          toast.success("Заявка успешно отправлена!");
        } else {
          console.error(`❌ [Step4Calculate] Ошибка при отправке в Bitrix24: ${bitrixResult.error}`);
          toast.error(`Ошибка при отправке: ${bitrixResult.error}`);
        }

        console.log('✅ [Step4Calculate] ========== РАСЧЁТ И ОТПРАВКА ЗАВЕРШЕНЫ ==========');

      } catch (error) {
        console.error('❌ [Step4Calculate] ========== КРИТИЧЕСКАЯ ОШИБКА ==========');
        console.error('❌ [Step4Calculate] Тип ошибки:', error instanceof Error ? error.constructor.name : typeof error);
        console.error('❌ [Step4Calculate] Сообщение ошибки:', error instanceof Error ? error.message : String(error));
        console.error('❌ [Step4Calculate] Stack trace:', error instanceof Error ? error.stack : 'N/A');
        console.error('❌ [Step4Calculate] Полный объект ошибки:', error);
        
        toast.error(`Произошла ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      } finally {
        setIsSubmitting(false);
        console.log('🏁 [Step4Calculate] setIsSubmitting(false) - загрузка завершена');
      }
    };

    submitAndCalculate();
  }, []); // Выполняется один раз при монтировании

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
