// src/components/NewShippingCalculatorForm.tsx
// Новый модульный калькулятор перевозок (визуально идентичен старому)

import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Calculator, Phone, MessageCircle } from "lucide-react";

// Импорт модульных компонентов
import { CityInput } from "./calculator/inputs/CityInput";
import { VolumeSlider } from "./calculator/inputs/VolumeSlider";
import { WeightSlider } from "./calculator/inputs/WeightSlider";
import { TransportTypeSelector } from "./calculator/selectors/TransportTypeSelector";
import { PackagingSelector } from "./calculator/selectors/PackagingSelector";
import { TruckTypeSelector as FoodTruckTypeSelector } from "./calculator/selectors/TruckTypeSelector";
import { TruckVisualization } from "./TruckVisualization";
import { MovingConstructor, type SelectedItem } from "./MovingConstructor";
import { StepProgress, type StepConfig } from "./calculator/progress/StepProgress";

// Импорт утилит
import {
  VOLUME_STEPS_PRIVATE,
  VOLUME_STEPS_COMMERCIAL,
  WEIGHT_STEPS_PRIVATE,
  WEIGHT_STEPS_COMMERCIAL,
} from "@/utils/calculator/constants";
import { calculateRoute, loadYandexMapsScript } from "@/utils/calculator/yandexMaps";
import { 
  getTruckInfoByVolume, 
  calculateDeliveryDays, 
  formatDeliveryDays,
  formatVolume,
  formatWeight
} from "@/utils/calculator/calculatorHelpers";
import { validateRouteFields, validateTransportType } from "@/utils/calculator/validation";
import { calculateShippingCost, formatTruckCapacity } from "@/utils/shippingCalculator";
import { createBitrix24Lead } from "@/utils/bitrix24";

console.log('📦 [NewShippingCalculatorForm] Компонент загружен (визуально как старый)');

export function NewShippingCalculatorForm() {
  console.log('🚀 [NewShippingCalculatorForm] Инициализация компонента');

  // ============================================================================
  // КОНФИГУРАЦИЯ ШАГОВ
  // ============================================================================
  const STEPS: StepConfig[] = [
    {
      id: 1,
      defaultLabel: "Маршрут",
      activeLabel: "Маршрут",
    },
    {
      id: 2,
      defaultLabel: "Шаг 2",
      activeLabel: "Параметры груза",
    },
    {
      id: 3,
      defaultLabel: "Шаг 3",
      activeLabel: "Контакты",
    },
    {
      id: 4,
      defaultLabel: "Расчёт стоимости",
      activeLabel: "Расчёт стоимости",
    },
  ];

  // ============================================================================
  // REFS
  // ============================================================================
  const calculatorFormRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // STATE
  // ============================================================================
  const [calculatorStep, setCalculatorStep] = useState(1);
  const [hasStartedFilling, setHasStartedFilling] = useState(false); // Пользователь начал заполнять форму

  // Шаг 1: Маршрут и тип перевозки
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [fromCoordinates, setFromCoordinates] = useState<[number, number] | undefined>();
  const [toCoordinates, setToCoordinates] = useState<[number, number] | undefined>();
  const [transportType, setTransportType] = useState("");

  // Маршрут
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Шаг 2: Параметры груза
  const [volumeIndex, setVolumeIndex] = useState(0);
  const [weightIndex, setWeightIndex] = useState(0);

  // Упаковка груза
  const [cargoPackaging, setCargoPackaging] = useState("");
  const [palletCount, setPalletCount] = useState("");
  const [palletWeight, setPalletWeight] = useState("");

  // Тип фургона (для продуктов питания)
  const [truckType, setTruckType] = useState("");
  const [temperatureMode, setTemperatureMode] = useState("");

  // Конструктор переезда
  const [isConstructorOpen, setIsConstructorOpen] = useState(false);
  const [constructorItems, setConstructorItems] = useState<SelectedItem[] | undefined>(undefined);
  const [constructorFloorUtilization, setConstructorFloorUtilization] = useState<number | undefined>(undefined);
  const [constructorRecommendedTruck, setConstructorRecommendedTruck] = useState<string | undefined>(undefined);

  // Стоимость
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [showFinalPrice, setShowFinalPrice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Состояние отправки заявки

  // Контакты
  const [contactMethod, setContactMethod] = useState<"phone" | "whatsapp" | "">("");
  const [userContact, setUserContact] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);

  // Ошибки валидации
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================
  
  // Шаги объёма и веса зависят от типа перевозки
  const volumeSteps = useMemo(() => {
    const steps = transportType === "Домашний переезд"
      ? VOLUME_STEPS_PRIVATE
      : VOLUME_STEPS_COMMERCIAL;
    console.log('📊 [NewShippingCalculatorForm] Шаги объёма:', {
      transportType,
      stepsCount: steps.length,
    });
    return steps;
  }, [transportType]);

  const weightSteps = useMemo(() => {
    const steps = transportType === "Домашний переезд"
      ? WEIGHT_STEPS_PRIVATE
      : WEIGHT_STEPS_COMMERCIAL;
    console.log('⚖️ [NewShippingCalculatorForm] Шаги веса:', {
      transportType,
      stepsCount: steps.length,
    });
    return steps;
  }, [transportType]);

  const currentVolume = volumeSteps[volumeIndex];
  const currentWeight = weightSteps[weightIndex];

  // Информация о грузовике
  const truckInfo = useMemo(() => {
    if (currentVolume === 0) return null;
    const info = getTruckInfoByVolume(currentVolume);
    console.log('🚚 [NewShippingCalculatorForm] Информация о грузовике:', info);
    return info;
  }, [currentVolume]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Загрузка скрипта Яндекс.Карт при монтировании
  useEffect(() => {
    console.log('🗺️ [NewShippingCalculatorForm] Загрузка Яндекс.Карт...');
    loadYandexMapsScript().catch((error) => {
      console.error('❌ [NewShippingCalculatorForm] Ошибка загрузки Яндекс.Карт:', error);
    });
  }, []);

  // Расчёт маршрута при изменении координат
  useEffect(() => {
    if (fromCoordinates && toCoordinates) {
      console.log('🗺️ [NewShippingCalculatorForm] Расчёт маршрута...');
      setIsCalculatingRoute(true);
      
      calculateRoute(fromCoordinates, toCoordinates)
        .then((result) => {
          if (result) {
            console.log('✅ [NewShippingCalculatorForm] Маршрут рассчитан:', result);
            setDistance(result.distance);
            setDuration(result.duration);
          } else {
            console.warn('⚠️ [NewShippingCalculatorForm] Не удалось рассчитать маршрут');
            setDistance(null);
            setDuration(null);
          }
        })
        .finally(() => {
          setIsCalculatingRoute(false);
        });
    }
  }, [fromCoordinates, toCoordinates]);

  // Автоматический расчёт веса для домашнего переезда
  useEffect(() => {
    if (transportType === "Домашний переезд" && currentVolume > 0) {
      console.log('⚡ [NewShippingCalculatorForm] Автоматический расчёт веса для объёма:', currentVolume);
      
      let newWeightIndex = 0;
      if (currentVolume <= 3) newWeightIndex = 2; // 300 кг
      else if (currentVolume <= 9) newWeightIndex = 4; // 700 кг
      else if (currentVolume <= 15) newWeightIndex = 6; // 2 т
      else if (currentVolume <= 30) newWeightIndex = 8; // 4 т
      else if (currentVolume <= 45) newWeightIndex = 11; // 7 т
      else newWeightIndex = 16; // 12 т
      
      console.log('  Установлен индекс веса:', newWeightIndex, '(', weightSteps[newWeightIndex], 'кг)');
      setWeightIndex(newWeightIndex);
    }
  }, [volumeIndex, transportType, currentVolume, weightSteps]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  // Форматирование номера телефона
  const formatPhoneNumber = (value: string): string => {
    console.log('📞 [NewCalc] Форматирование телефона, входное значение:', value);
    
    let cleaned = value.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('8')) cleaned = '+7' + cleaned.slice(1);
    if (cleaned.startsWith('7') && !cleaned.startsWith('+7')) cleaned = '+' + cleaned;
    if (!cleaned.startsWith('+7') && cleaned.length > 0) cleaned = '+7' + cleaned;
    cleaned = cleaned.replace(/^\+7\+7/, '+7');
    if (cleaned.startsWith('+7')) {
      const digits = cleaned.slice(2).replace(/\D/g, '');
      cleaned = '+7' + digits;
    }
    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
    if (cleaned.length <= 2) return cleaned;
    const match = cleaned.match(/^\+7(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
    if (match) {
      let formatted = '+7';
      if (match[1]) formatted += ` (${match[1]}`;
      if (match[2]) formatted += `) ${match[2]}`;
      if (match[3]) formatted += `-${match[3]}`;
      if (match[4]) formatted += `-${match[4]}`;
      formatted = formatted.replace(/\(\s*$/, '').replace(/\)\s*$/, ')');
      
      console.log('📞 [NewCalc] Отформатированный телефон:', formatted);
      return formatted;
    }
    
    console.log('📞 [NewCalc] Возврат очищенного значения:', cleaned);
    return cleaned;
  };

  // Обработчик изменения телефона
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    console.log('📞 [NewCalc] Изменение телефона, input:', input);
    
    if (input === '') {
      setUserContact('');
      return;
    }
    if (input.length < 2 && !input.startsWith('+')) {
      setUserContact('+7');
      return;
    }
    const formatted = formatPhoneNumber(input);
    setUserContact(formatted);
  };

  // Обработчик применения конструктора
  const handleConstructorApply = (
    totalVolume: number,
    recommendedTruck?: string,
    floorUtilization?: number,
    selectedItems?: SelectedItem[]
  ) => {
    console.log("🏗️ [NewCalc] Применение конструктора:", {
      totalVolume,
      recommendedTruck,
      floorUtilization,
      selectedItems,
    });

    // Найти индекс объёма, соответствующий totalVolume
    const volumeIndex = volumeSteps.findIndex((v) => v >= totalVolume);
    const finalVolumeIndex = volumeIndex !== -1 ? volumeIndex : volumeSteps.length - 1;

    setConstructorItems(selectedItems);
    setConstructorFloorUtilization(floorUtilization);
    setConstructorRecommendedTruck(recommendedTruck);
    setVolumeIndex(finalVolumeIndex);
    setIsConstructorOpen(false);

    toast.success("Параметры переезда применены");
    console.log("✅ [NewCalc] Конструктор применён, volumeIndex установлен:", finalVolumeIndex, "для объёма:", totalVolume);
  };

  const handleNextStep = () => {
    console.log('➡️ [NewShippingCalculatorForm] Переход на следующий шаг. Текущий:', calculatorStep);

    // Валидация шага 1 (Маршрут)
    if (calculatorStep === 1) {
      const routeValidation = validateRouteFields(fromCity, toCity, fromCoordinates, toCoordinates);
      const transportValidation = validateTransportType(transportType);

      if (!routeValidation.isValid || !transportValidation.isValid) {
        console.log('❌ [NewShippingCalculatorForm] Валидация шага 1 не пройдена');
        setErrors({
          fromCity: !!routeValidation.errors.from,
          toCity: !!routeValidation.errors.to,
          transportType: !transportValidation.isValid,
        });
        toast.error("Заполните все обязательные поля");
        return;
      }

      if (!distance) {
        console.log('❌ [NewShippingCalculatorForm] Маршрут не рассчитан');
        toast.error("Дождитесь расчёта маршрута");
        return;
      }
      
      setErrors({});
      setCalculatorStep(2);
      console.log('✅ [NewShippingCalculatorForm] Переход на шаг 2 (Параметры груза)');
      return;
    }

    // Переход с шага 2 (Параметры груза) на шаг 3 (Контакты)
    if (calculatorStep === 2) {
      setCalculatorStep(3);
      console.log('✅ [NewShippingCalculatorForm] Переход на шаг 3 (Контакты)');
      return;
    }
  };

  const handlePrevStep = () => {
    console.log('⬅️ [NewShippingCalculatorForm] Возврат на предыдущий шаг. Текущий:', calculatorStep);
    
    // Шаг 2: Особая логика возврата между под-шагами
    if (calculatorStep === 2 && transportType !== "Домашний переезд") {
      // Для "Продукты питания"
      if (transportType === "Продукты питания") {
        // Если показаны ползунки → вернуться к фургону
        if (truckType && (truckType !== "refrigerator" || temperatureMode)) {
          console.log('⬅️ [NewCalc] Возврат с ползунков к фургону');
          setTruckType("");
          setTemperatureMode("");
          return;
        }
        // Если показан фургон → вернуться к упаковке
        if (cargoPackaging && (cargoPackaging !== "pallets" || (palletCount && palletWeight))) {
          console.log('⬅️ [NewCalc] Возврат с фургона к упаковке');
          setCargoPackaging("");
          setPalletCount("");
          setPalletWeight("");
          return;
        }
      }
      // Для других типов (Промышленные товары, Другое)
      else {
        // Если показаны ползунки → вернуться к упаковке
        if (cargoPackaging && (cargoPackaging !== "pallets" || (palletCount && palletWeight))) {
          console.log('⬅️ [NewCalc] Возврат с ползунков к упаковке');
          setCargoPackaging("");
          setPalletCount("");
          setPalletWeight("");
          return;
        }
      }
    }
    
    // Обычный возврат на предыдущий шаг
    if (calculatorStep > 1) {
      setCalculatorStep(calculatorStep - 1);
      setShowFinalPrice(false);
      setShowContactForm(false);
      setContactMethod("");
      setUserContact("");
      setErrors({});
      console.log('✅ [NewShippingCalculatorForm] Возврат на шаг:', calculatorStep - 1);
    }
  };

  const handleCalculate = async () => {
    console.log('💰 [NewShippingCalculatorForm] Расчёт стоимости...');

    // Валидация контактов на шаге 3
    if (!contactMethod) {
      console.log('❌ [NewShippingCalculatorForm] Способ связи не выбран');
      toast.error("Выберите способ связи");
      return;
    }

    if (!userContact || userContact.trim() === "" || userContact.trim() === "+7" || userContact.trim() === "+7 ") {
      console.log('❌ [NewShippingCalculatorForm] Контактные данные не заполнены');
      toast.error("Укажите контактные данные");
      return;
    }

    if (currentVolume === 0) {
      console.log('❌ [NewShippingCalculatorForm] Объём не указан');
      toast.error("Укажите объём груза");
      return;
    }

    // Расчёт стоимости
    const result = calculateShippingCost(
      fromCity,
      toCity,
      distance!,
      currentWeight,
      currentVolume,
      transportType,
      fromCoordinates,
      toCoordinates
    );

    if (result) {
      console.log('✅ [NewShippingCalculatorForm] Стоимость рассчитана:', result.cost, '₽');
      setEstimatedCost(result.cost);
      setCalculatorStep(4);
      setIsSubmitting(true);
      console.log('✅ [NewShippingCalculatorForm] Переход на шаг 4 (Расчёт стоимости)');
      
      // Реальная отправка заявки в Bitrix24
      console.log('📤 [NewShippingCalculatorForm] Отправка заявки в Bitrix24...');
      toast.loading("Отправка заявки для точного расчёта...");
      
      // Подготовка данных для Bitrix24
      const leadData = {
        fromCity,
        toCity,
        phone: userContact,
        distance: distance!,
        weight: currentWeight,
        volume: currentVolume,
        cost: result.cost,
        truckCapacity: formatTruckCapacity(result.truckCapacity),
        contactMethod: contactMethod as 'phone' | 'whatsapp',
        additionalInfo: {
          cargoType: transportType,
          direction: `${fromCity} → ${toCity}`,
          costPerKm: result.cost / distance!,
          minimumApplied: result.cost === 7500,
          // Если использовался конструктор переезда
          usedConstructor: constructorItems !== undefined && constructorItems.length > 0,
          constructorItems: constructorItems?.map(item => ({
            item: {
              name: item.item.name,
              length: item.item.length,
              width: item.item.width,
              height: item.item.height,
              volume: item.item.volume
            },
            quantity: item.quantity
          }))
        }
      };
      
      console.log('📋 [NewShippingCalculatorForm] Данные для Bitrix24:', leadData);
      
      // Отправка в Bitrix24
      const bitrixResult = await createBitrix24Lead(leadData);
      
      toast.dismiss();
      
      if (bitrixResult.success) {
        console.log('✅ [NewShippingCalculatorForm] Заявка отправлена в Bitrix24. ID:', bitrixResult.leadId);
        toast.success(`Заявка №${bitrixResult.leadId} отправлена!`);
        setIsSubmitting(false);
        setShowFinalPrice(true);
      } else {
        console.error('❌ [NewShippingCalculatorForm] Ошибка отправки в Bitrix24:', bitrixResult.error);
        toast.error("Ошибка отправки заявки. Попробуйте позже.");
        setIsSubmitting(false);
        // Возвращаем на шаг 3
        setCalculatorStep(3);
      }
    } else {
      console.error('❌ [NewShippingCalculatorForm] Не удалось рассчитать стоимость');
      toast.error("Не удалось рассчитать стоимость");
    }
  };

  const handleSubmit = () => {
    console.log('📤 [NewShippingCalculatorForm] Отправка заявки...');

    if (!userContact || userContact.trim() === "") {
      toast.error("Укажите контактные данные");
      return;
    }

    // TODO: Интеграция с Bitrix24
    toast.success("Заявка отправлена! Мы свяжемся с вами в течение 10 минут.");
    console.log('✅ [NewShippingCalculatorForm] Заявка отправлена (мок)');
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  console.log('🎨 [NewShippingCalculatorForm] Рендер. Шаг:', calculatorStep);

  return (
    <div className="space-y-4">
      <div 
        ref={calculatorFormRef}
        className="relative rounded-lg p-3 shadow-lg hover:shadow-xl transition-shadow"
        style={{
          backgroundColor: '#405b9a',
          borderRadius: '60px',
        }}
      >
        {/* Круглая маска для кнопки (ЛЕВЫЙ верхний угол) */}
        <div
          className="absolute rounded-full"
          style={{
            width: 94,
            height: 94,
            top: -16,
            left: -18,
            backgroundColor: '#fafafa',
          }}
        />

        {/* Правый прямоугольник с вогнутым углом */}
        <div
          className="absolute"
          style={{
            width: 47,
            height: 47,
            top: -16,
            left: 29,
            background: `radial-gradient(circle at bottom left, transparent 40px, #fafafa 40px)`,
          }}
        />

        {/* Нижний прямоугольник с вогнутым углом */}
        <div
          className="absolute"
          style={{
            width: 47,
            height: 47,
            top: 31,
            left: -18,
            background: `radial-gradient(circle at top right, transparent 40px, #fafafa 40px)`,
          }}
        />

        {/* Кнопка с иконкой калькулятора (ЛЕВЫЙ верхний угол) */}
        <button
          className="absolute rounded-full cursor-pointer hover:scale-110 transition-all"
          style={{
            width: 60,
            height: 60,
            top: 1,
            left: -1,
            backgroundColor: '#d1d5db',
            zIndex: 50,
          }}
        >
          <div className="flex items-center justify-center w-full h-full">
            <Calculator className="w-9 h-9" style={{color: '#405b9a'}} />
          </div>
        </button>

        {/* Estimated Cost Display - только текст */}
        <div className="relative z-10 text-center mb-3" style={{marginTop: '20px'}}>
          {calculatorStep === 1 && (
            <p className="text-white/90">
              <span className="text-sm">Предварительная стоимость: </span>
              <span className="text-lg font-bold text-white">0 ₽</span>
            </p>
          )}
          
          {calculatorStep >= 2 && estimatedCost === 0 && (
            <p className="text-white/90">
              <span className="text-sm">Предварительная стоимость: </span>
              <span className="text-lg font-bold text-white">рассчитывается...</span>
            </p>
          )}
        </div>
        
        {/* Step Progress - скрываем на шаге 4 */}
        {calculatorStep < 4 && (
          <div className="relative z-10" style={{marginTop: '40px', marginBottom: '20px'}}>
            <StepProgress 
              currentStep={calculatorStep} 
              steps={STEPS} 
              hasStartedFilling={hasStartedFilling}
            />
          </div>
        )}

        {/* ШАГ 2: Показываем финальную стоимость только после расчёта */}
        {calculatorStep === 2 && showFinalPrice && estimatedCost > 0 && (
          <div className="bg-white/15 border-2 border-white/30 rounded-lg p-3 mb-3 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500 backdrop-blur-sm relative z-10" style={{marginTop: '25px'}}>
            <div>
              <p className="text-xs text-center mb-1 text-white/90">
                ⚠️ Примерная стоимость вашей перевозки
              </p>
              
              <div className="flex items-center justify-between gap-3 mb-2">
                {distance && (
                  <div className="flex-1 text-center">
                    <p className="text-xs text-white/80">Расстояние</p>
                    <p className="text-sm font-bold text-white">{distance} км</p>
                  </div>
                )}
                
                <div className="flex-1 text-center">
                  <p className="text-xs text-white/80">Стоимость</p>
                  <p className="text-2xl font-bold text-white">{estimatedCost.toLocaleString('ru-RU')} ₽</p>
                </div>
                
                {distance && (
                  <div className="flex-1 text-center">
                    <p className="text-xs text-white/80">Срок доставки</p>
                    <p className="text-sm font-bold text-white">{formatDeliveryDays(calculateDeliveryDays(distance))}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Form */}
        <div className="space-y-3">
          {/* ШАГ 1: Маршрут и тип перевозки */}
          {calculatorStep === 1 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
                <CityInput
                  value={fromCity}
                  onChange={(city, coords) => {
                    console.log('🎯 [NewShippingCalculatorForm] Пользователь начал заполнять "Откуда"');
                    setHasStartedFilling(true); // Активируем шаг "Маршрут"
                    setFromCity(city);
                    setFromCoordinates(coords);
                  }}
                  placeholder="Город отправления"
                  label="Откуда"
                  error={errors.fromCity}
                />

                <CityInput
                  value={toCity}
                  onChange={(city, coords) => {
                    setToCity(city);
                    setToCoordinates(coords);
                  }}
                  placeholder="Город назначения"
                  label="Куда"
                  error={errors.toCity}
                />
              </div>

              {isCalculatingRoute && (
                <p className="text-sm text-white/70 italic text-center">⏳ Расчёт маршрута...</p>
              )}

              {distance && (
                <div className="bg-white/10 rounded-lg p-2 text-center">
                  <p className="text-xs text-white/80">
                    Расстояние: <span className="font-semibold">{distance} км</span> • 
                    Срок доставки: <span className="font-semibold">{formatDeliveryDays(calculateDeliveryDays(distance))}</span>
                  </p>
                </div>
              )}

              {/* Показываем тип перевозки только после заполнения обоих городов */}
              {fromCoordinates && toCoordinates && (
                <div className="relative z-10">
                  <TransportTypeSelector
                    value={transportType}
                    onChange={setTransportType}
                    error={errors.transportType}
                  />
                </div>
              )}

              <div className="flex justify-end relative z-10" style={{marginTop: '40px', marginBottom: '20px', paddingLeft: '40px', paddingRight: '40px'}}>
                <Button
                  onClick={handleNextStep}
                  className="bg-white text-[#405b9a] hover:bg-gray-100 font-semibold"
                >
                  Далее →
                </Button>
              </div>
            </>
          )}

          {/* ШАГ 2: Параметры груза */}
          {calculatorStep === 2 && (
            <>
              <div className="space-y-4 relative z-10">
                {/* ========== ДОМАШНИЙ ПЕРЕЕЗД ========== */}
                {transportType === "Домашний переезд" && (
                  <>
                    <VolumeSlider
                      value={volumeIndex}
                      onChange={setVolumeIndex}
                      steps={volumeSteps}
                      showTruckInfo={true}
                      truckName={truckInfo?.name}
                    />

                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-white/90 text-sm mb-3">
                        Не знаете точный объём? Воспользуйтесь конструктором переезда
                      </p>
                      <Button
                        onClick={() => {
                          console.log("🏗️ [NewCalc] Открытие конструктора переезда");
                          setIsConstructorOpen(true);
                        }}
                        variant="outline"
                        className="w-full bg-white/20 text-white border-white/30 hover:bg-white/30"
                      >
                        📦 Открыть конструктор переезда
                      </Button>
                      {constructorItems && constructorItems.length > 0 && (
                        <p className="text-xs text-white/70 mt-2">
                          ✅ Конструктор использован: {constructorItems.length} предметов
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* ========== ПРОДУКТЫ ПИТАНИЯ ========== */}
                {transportType === "Продукты питания" && (
                  <>
                    {/* Шаг 2.1: Упаковка груза (если ещё не выбрана ИЛИ выбраны палеты но не заполнены) */}
                    {(!cargoPackaging || (cargoPackaging === "pallets" && (!palletCount || !palletWeight))) && (
                      <PackagingSelector
                        value={cargoPackaging}
                        onChange={setCargoPackaging}
                        palletCount={palletCount}
                        onPalletCountChange={setPalletCount}
                        palletWeight={palletWeight}
                        onPalletWeightChange={setPalletWeight}
                      />
                    )}

                    {/* Шаг 2.2: Тип фургона (если упаковка выбрана И заполнена, но фургон ещё не выбран ИЛИ рефрижератор без температуры) */}
                    {cargoPackaging && 
                     (cargoPackaging !== "pallets" || (palletCount && palletWeight)) && 
                     (!truckType || (truckType === "refrigerator" && !temperatureMode)) && (
                      <FoodTruckTypeSelector
                        value={truckType}
                        onChange={setTruckType}
                        temperatureMode={temperatureMode}
                        onTemperatureModeChange={setTemperatureMode}
                      />
                    )}

                    {/* Шаг 2.3: Ползунки объём/вес (если фургон выбран И заполнен) */}
                    {truckType && 
                     (truckType !== "refrigerator" || temperatureMode) && (
                      <>
                        <VolumeSlider
                          value={volumeIndex}
                          onChange={setVolumeIndex}
                          steps={volumeSteps}
                          showTruckInfo={true}
                          truckName={truckInfo?.name}
                        />

                        <WeightSlider
                          value={weightIndex}
                          onChange={setWeightIndex}
                          steps={weightSteps}
                        />
                      </>
                    )}
                  </>
                )}

                {/* ========== ДРУГИЕ ТИПЫ ПЕРЕВОЗКИ ========== */}
                {transportType !== "Домашний переезд" && transportType !== "Продукты питания" && transportType && (
                  <>
                    {/* Шаг 2.1: Упаковка груза (если ещё не выбрана ИЛИ выбраны палеты но не заполнены) */}
                    {(!cargoPackaging || (cargoPackaging === "pallets" && (!palletCount || !palletWeight))) && (
                      <PackagingSelector
                        value={cargoPackaging}
                        onChange={setCargoPackaging}
                        palletCount={palletCount}
                        onPalletCountChange={setPalletCount}
                        palletWeight={palletWeight}
                        onPalletWeightChange={setPalletWeight}
                      />
                    )}

                    {/* Шаг 2.2: Ползунки объём/вес (если упаковка выбрана И заполнена) */}
                    {cargoPackaging && 
                     (cargoPackaging !== "pallets" || (palletCount && palletWeight)) && (
                      <>
                        <VolumeSlider
                          value={volumeIndex}
                          onChange={setVolumeIndex}
                          steps={volumeSteps}
                          showTruckInfo={true}
                          truckName={truckInfo?.name}
                        />

                        <WeightSlider
                          value={weightIndex}
                          onChange={setWeightIndex}
                          steps={weightSteps}
                        />
                      </>
                    )}
                  </>
                )}

                <div className="flex justify-between" style={{marginTop: '40px', marginBottom: '20px', paddingLeft: '40px', paddingRight: '40px'}}>
                  <Button
                    onClick={handlePrevStep}
                    variant="outline"
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  >
                    ← Назад
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    className="bg-white text-[#405b9a] hover:bg-gray-100 font-semibold"
                  >
                    Далее →
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* ШАГ 3: Контакты */}
          {calculatorStep === 3 && (
            <>
              <div className="space-y-4 relative z-10">
                <Label className="text-white font-semibold">Как с вами связаться?</Label>
                
                <div className="grid grid-cols-2 gap-2">
                  {/* Колонка для Звонка */}
                  {contactMethod === "phone" ? (
                    <div className="relative">
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
                        className="h-10 pl-10 bg-white"
                        autoComplete="tel"
                      />
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full h-10 bg-white/10 text-white border-white/20 hover:bg-white/20"
                      onClick={() => {
                        console.log('📞 [NewCalc] Выбран способ связи: phone');
                        setContactMethod("phone");
                        setUserContact("+7 ");
                      }}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Звонок
                    </Button>
                  )}

                  {/* Колонка для WhatsApp */}
                  {contactMethod === "whatsapp" ? (
                    <div className="relative">
                      <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
                      <Input
                        type="tel"
                        placeholder="Ваш WhatsApp"
                        value={userContact}
                        onChange={handlePhoneChange}
                        onFocus={(e) => {
                          if (!e.target.value) {
                            setUserContact('+7 ');
                          }
                        }}
                        className="h-10 pl-10"
                        style={{backgroundColor: '#E7F8F0'}}
                        autoComplete="tel"
                      />
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full h-10 bg-white/10 text-white border-white/20 hover:bg-white/20"
                      onClick={() => {
                        console.log('📞 [NewCalc] Выбран способ связи: whatsapp');
                        setContactMethod("whatsapp");
                        setUserContact("+7 ");
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      WhatsApp
                    </Button>
                  )}
                </div>

                <div className="flex justify-between" style={{marginTop: '40px', marginBottom: '20px', paddingLeft: '40px', paddingRight: '40px'}}>
                  <Button
                    onClick={handlePrevStep}
                    variant="outline"
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  >
                    ← Назад
                  </Button>
                  <Button
                    onClick={handleCalculate}
                    className="bg-white text-[#405b9a] hover:bg-gray-100 font-semibold"
                  >
                    Рассчитать стоимость
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* ШАГ 4: Расчёт стоимости */}
          {calculatorStep === 4 && (
            <>
              <div className="space-y-4 relative z-10">
                {/* Состояние загрузки - отправка заявки */}
                {isSubmitting && (
                  <div className="bg-white/10 rounded-lg p-6 text-center">
                    <div className="mb-4">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                    <p className="text-white text-lg font-semibold mb-2">
                      Отправка заявки для точного расчёта...
                    </p>
                    <p className="text-white/70 text-sm">
                      Пожалуйста, подождите
                    </p>
                    
                    {/* Имитация бегущих цифр */}
                    <div className="mt-4 text-white/50 text-2xl font-mono blur-sm">
                      {Math.floor(Math.random() * 90000 + 10000)} ₽
                    </div>
                  </div>
                )}

                {/* Финальная стоимость - после отправки */}
                {!isSubmitting && showFinalPrice && (
                  <>
                    <div className="bg-white/10 rounded-lg p-6 text-center">
                      <p className="text-white/80 text-sm mb-2">Предварительная стоимость вашей перевозки:</p>
                      <p className="text-white text-4xl font-bold mb-4">{estimatedCost.toLocaleString('ru-RU')} ₽</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-white/70">Расстояние</p>
                          <p className="text-white font-semibold">{distance} км</p>
                        </div>
                        <div>
                          <p className="text-white/70">Срок доставки</p>
                          <p className="text-white font-semibold">{formatDeliveryDays(calculateDeliveryDays(distance!))}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4" style={{paddingLeft: '15px', paddingRight: '15px', marginBottom: '25px'}}>
                      <p className="text-sm text-green-700 text-center">
                        ✅ Заявка отправлена!<br/>
                        <strong>Менеджер свяжется с вами в течение 10 минут</strong> для формирования конечной стоимости, которая может отличаться от предварительной.
                      </p>
                    </div>

                    {/* Кнопки на шаге 4 скрыты */}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Модальное окно конструктора переезда */}
      <MovingConstructor
        isOpen={isConstructorOpen}
        onClose={() => {
          console.log("❌ [NewCalc] Закрытие конструктора");
          setIsConstructorOpen(false);
        }}
        onApply={handleConstructorApply}
        initialVolume={currentVolume}
      />
    </div>
  );
}

console.log('✅ [NewShippingCalculatorForm] Компонент экспортирован');
