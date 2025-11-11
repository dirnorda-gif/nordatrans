import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calculator, Phone, MessageCircle, Truck, Download, Package, Home, ShoppingCart, MapPin, X, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { calculateShippingCost, formatTruckCapacity } from "@/utils/shippingCalculator";
import { createBitrix24Lead } from "@/utils/bitrix24";
import { toast } from "sonner";
import { TruckVisualization } from "@/components/TruckVisualization";
import { MovingConstructor, type SelectedItem } from "@/components/MovingConstructor";

// ============================================================================
// ТИПЫ ПРОПСОВ (Группировка для удобства)
// ============================================================================

interface Suggestion {
  displayName: string;
  value: string;
  coordinates?: [number, number];
}

export interface RouteData {
  fromCity: string;
  toCity: string;
  fromCoordinates: [number, number] | undefined;
  toCoordinates: [number, number] | undefined;
  routeDistance: number | null;
  routeDuration: number | null;
  isCalculatingRoute: boolean;
}

export interface CalculatorState {
  calculatorStep: number;
  showFinalPrice: boolean;
  transportType: string;
  weightIndex: number;
  volumeIndex: number;
  estimatedCost: number;
}

export interface MovingData {
  movingItems: {
    boxes: boolean;
    furniture: boolean;
    appliances: boolean;
  };
  boxesCount: string;
  furnitureDetails: string;
  appliancesDetails: string;
}

export interface CargoData {
  cargoPackaging: string;
  palletCount: string;
  cargoNature: string;
}

export interface FoodData {
  truckType: string;
  temperatureMode: string;
  foodPackaging: string;
  foodPalletCount: string;
}

export interface OtherData {
  otherPackaging: string;
  otherPalletCount: string;
  otherNature: string;
}

export interface ContactData {
  contactMethod: "phone" | "whatsapp";
  userContact: string;
  showContactForm: boolean;
  managerName: string;
  managerPhone: string;
}

export interface CalculatorActions {
  setFromCity: (value: string) => void;
  setToCity: (value: string) => void;
  setFromCoordinates: (coords: [number, number] | undefined) => void;
  setToCoordinates: (coords: [number, number] | undefined) => void;
  setCalculatorStep: (step: number) => void;
  setShowFinalPrice: (show: boolean) => void;
  setTransportType: (type: string) => void;
  setWeightIndex: (index: number) => void;
  setVolumeIndex: (index: number) => void;
  setEstimatedCost: (cost: number) => void;
  setMovingItems: (items: { boxes: boolean; furniture: boolean; appliances: boolean }) => void;
  setBoxesCount: (count: string) => void;
  setFurnitureDetails: (details: string) => void;
  setAppliancesDetails: (details: string) => void;
  setCargoPackaging: (packaging: string) => void;
  setPalletCount: (count: string) => void;
  setCargoNature: (nature: string) => void;
  setTruckType: (type: string) => void;
  setTemperatureMode: (mode: string) => void;
  setFoodPackaging: (packaging: string) => void;
  setFoodPalletCount: (count: string) => void;
  setOtherPackaging: (packaging: string) => void;
  setOtherPalletCount: (count: string) => void;
  setOtherNature: (nature: string) => void;
  setContactMethod: (method: "phone" | "whatsapp") => void;
  setUserContact: (contact: string) => void;
  setShowContactForm: (show: boolean) => void;
  setRouteDistance: (distance: number | null) => void;
  setRouteDuration: (duration: number | null) => void;
  setIsCalculatingRoute: (isCalculating: boolean) => void;
  reachGoal: (goal: string, params?: any) => void;
}

export interface ShippingCalculatorFormProps {
  routeData: RouteData;
  calculatorState: CalculatorState;
  movingData: MovingData;
  cargoData: CargoData;
  foodData: FoodData;
  otherData: OtherData;
  contactData: ContactData;
  actions: CalculatorActions;
}

// ============================================================================
// КОМПОНЕНТ
// ============================================================================

export const ShippingCalculatorForm = ({
  routeData,
  calculatorState,
  movingData,
  cargoData,
  foodData,
  otherData,
  contactData,
  actions,
}: ShippingCalculatorFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ref для сохранения позиции скролла перед изменением шага
  const scrollPositionRef = useRef<number>(0);
  
  // Ref для формы калькулятора для автоскролла
  const calculatorFormRef = useRef<HTMLDivElement>(null);
  
  // 🎯 State для валидации полей адреса
  const [fromFieldError, setFromFieldError] = useState(false);
  const [toFieldError, setToFieldError] = useState(false);
  const [transportTypeError, setTransportTypeError] = useState(false);
  
  // 🎯 State для валидации полей второго шага - Домашний переезд
  const [movingItemsError, setMovingItemsError] = useState(false);
  const [volumeError, setVolumeError] = useState(false);
  const [weightError, setWeightError] = useState(false);
  const [isConstructorOpen, setIsConstructorOpen] = useState(false);
  const [constructorItems, setConstructorItems] = useState<SelectedItem[] | undefined>(undefined);
  const [constructorFloorUtilization, setConstructorFloorUtilization] = useState<number | undefined>(undefined);
  const [constructorRecommendedTruck, setConstructorRecommendedTruck] = useState<string | undefined>(undefined);
  
  // 🎯 State для валидации полей второго шага - Промышленные товары
  const [cargoPackagingError, setCargoPackagingError] = useState(false);
  const [cargoNatureError, setCargoNatureError] = useState(false);
  const [palletCountError, setPalletCountError] = useState(false);
  const [palletWeightPerKg, setPalletWeightPerKg] = useState<string>("");
  const [palletWeightPerKgError, setPalletWeightPerKgError] = useState(false);
  // 🎯 State для валидации полей второго шага - Продукты питания
  const [truckTypeError, setTruckTypeError] = useState(false);
  const [temperatureModeError, setTemperatureModeError] = useState(false);
  const [foodPackagingError, setFoodPackagingError] = useState(false);
  const [foodPalletCountError, setFoodPalletCountError] = useState(false);
  const [foodPalletWeightPerKg, setFoodPalletWeightPerKg] = useState<string>("");
  const [foodPalletWeightPerKgError, setFoodPalletWeightPerKgError] = useState(false);
  // 🎯 State для подшагов "Продукты питания"
  const [foodDeliverySubStep, setFoodDeliverySubStep] = useState<1 | 2>(1);
  // 🎯 State для валидации полей второго шага - Другое
  const [otherPackagingError, setOtherPackagingError] = useState(false);
  const [otherPalletCountError, setOtherPalletCountError] = useState(false);
  const [otherPalletWeightPerKg, setOtherPalletWeightPerKg] = useState<string>("");
  const [otherPalletWeightPerKgError, setOtherPalletWeightPerKgError] = useState(false);
  const [otherNatureError, setOtherNatureError] = useState(false);
  // 🎯 State для валидации третьего шага
  const [userContactError, setUserContactError] = useState(false);
  // 🗺️ State для подсказок поля "Откуда"
  const [fromSuggestions, setFromSuggestions] = useState<Suggestion[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [isLoadingFrom, setIsLoadingFrom] = useState(false);
  const fromInputRef = useRef<HTMLInputElement>(null);
  const fromSuggestionsRef = useRef<HTMLDivElement>(null);
  const fromDebounceTimer = useRef<NodeJS.Timeout | null>(null);
  
  // 🗺️ State для подсказок поля "Куда"
  const [toSuggestions, setToSuggestions] = useState<Suggestion[]>([]);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [isLoadingTo, setIsLoadingTo] = useState(false);
  const toInputRef = useRef<HTMLInputElement>(null);
  const toSuggestionsRef = useRef<HTMLDivElement>(null);
  const toDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // КОНСТАНТЫ (хранятся внутри компонента)
  // ============================================================================
  
  const transportTypes = [
    "Домашний переезд",
    "Промышленные товары", 
    "Продукты питания",
    "Другое"
  ];
  const YANDEX_API_KEY = "a4100971-3502-473d-ac00-0c63115f8fa2";
  
  // 🔧 ADMIN: Коэффициент для рефрижератора
  const REFRIGERATOR_COEFFICIENT = 1.2; // 1.2 = +20% к стоимости

  // ============================================================================
  // ДЕСТРУКТУРИЗАЦИЯ ПРОПСОВ
  // ============================================================================

  const {
    fromCity,
    toCity,
    routeDistance,
    routeDuration,
  } = routeData;

  const {
    calculatorStep,
    showFinalPrice,
    transportType,
    weightIndex,
    volumeIndex,
    estimatedCost,
  } = calculatorState;

  const {
    movingItems,
    boxesCount,
    furnitureDetails,
    appliancesDetails,
  } = movingData;

  const {
    cargoPackaging,
    palletCount,
    cargoNature,
  } = cargoData;

  const {
    truckType,
    temperatureMode,
    foodPackaging,
    foodPalletCount,
  } = foodData;

  const {
    otherPackaging,
    otherPalletCount,
    otherNature,
  } = otherData;

  const {
    contactMethod,
    userContact,
    showContactForm,
    managerName,
    managerPhone,
  } = contactData;

  const {
    setFromCity,
    setToCity,
    setFromCoordinates,
    setToCoordinates,
    setCalculatorStep,
    setShowFinalPrice,
    setTransportType,
    setWeightIndex,
    setVolumeIndex,
    setEstimatedCost,
    setMovingItems,
    setBoxesCount,
    setFurnitureDetails,
    setAppliancesDetails,
    setCargoPackaging,
    setPalletCount,
    setCargoNature,
    setTruckType,
    setTemperatureMode,
    setFoodPackaging,
    setFoodPalletCount,
    setOtherPackaging,
    setOtherPalletCount,
    setOtherNature,
    setContactMethod,
    setUserContact,
    setShowContactForm,
    setRouteDistance,
    setRouteDuration,
    setIsCalculatingRoute,
    reachGoal,
  } = actions;

  // ============================================================================
  // ВЫЧИСЛЯЕМЫЕ ЗНАЧЕНИЯ (useMemo для оптимизации)
  // ============================================================================
  
  // Шаги веса и объема зависят от типа перевозки
  const weightSteps = useMemo(() => {
    if (transportType === "Домашний переезд") {
      // Для ЧАСТНЫХ ЛИЦ (Домашний переезд)
      return [0, 200, 300, 500, 700, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000]; // в кг
    } else {
      // Для КОМПАНИЙ (все остальные типы перевозки)
      return [0, 200, 300, 500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000]; // в кг
    }
  }, [transportType]);

  const volumeSteps = useMemo(() => {
    if (transportType === "Домашний переезд") {
      // Для ЧАСТНЫХ ЛИЦ (Домашний переезд) - от 0 до 82 м³ с шагом 1
      return Array.from({length: 83}, (_, i) => i); // [0, 1, 2, 3, ... 82] в м³
    } else {
      // Для КОМПАНИЙ (все остальные типы перевозки) - от 0 до 82 м³ с шагом 1
      return Array.from({length: 83}, (_, i) => i); // [0, 1, 2, 3, ... 82] в м³
    }
  }, [transportType]);

  // ============================================================================
  // ЭФФЕКТЫ - Сброс ошибок валидации при установке координат
  // ============================================================================
  
  useEffect(() => {
    // Сбрасываем ошибку поля "откуда" когда координаты установлены
    if (routeData.fromCoordinates && fromFieldError) {
      setFromFieldError(false);
    }
  }, [routeData.fromCoordinates, fromFieldError]);
  
  useEffect(() => {
    // Сбрасываем ошибку поля "куда" когда координаты установлены
    if (routeData.toCoordinates && toFieldError) {
      setToFieldError(false);
    }
  }, [routeData.toCoordinates, toFieldError]);
  
  useEffect(() => {
    // Сбрасываем ошибку поля "тип перевозки" когда он выбран
    if (transportType && transportTypeError) {
      setTransportTypeError(false);
    }
  }, [transportType, transportTypeError]);

  useEffect(() => {
    if (transportType !== "Домашний переезд") {
      setConstructorItems(undefined);
      setConstructorFloorUtilization(undefined);
      setConstructorRecommendedTruck(undefined);
    }
    // Сбрасываем подшаг для "Продукты питания" при смене типа перевозки
    if (transportType !== "Продукты питания") {
      setFoodDeliverySubStep(1);
    }
  }, [transportType]);
  
  // ============================================================================
  // ЭФФЕКТЫ - Закрытие подсказок при клике вне компонента
  // ============================================================================
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Закрываем подсказки "Откуда"
      if (
        fromInputRef.current &&
        !fromInputRef.current.contains(event.target as Node) &&
        fromSuggestionsRef.current &&
        !fromSuggestionsRef.current.contains(event.target as Node)
      ) {
        setShowFromSuggestions(false);
      }
      
      // Закрываем подсказки "Куда"
      if (
        toInputRef.current &&
        !toInputRef.current.contains(event.target as Node) &&
        toSuggestionsRef.current &&
        !toSuggestionsRef.current.contains(event.target as Node)
      ) {
        setShowToSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============================================================================
  // ФУНКЦИИ КОМПОНЕНТА
  // ============================================================================
  
  // 🗺️ Функция для получения подсказок от Яндекс.Карт
  const fetchSuggestions = async (
    query: string,
    setSuggestions: React.Dispatch<React.SetStateAction<Suggestion[]>>,
    setShowSuggestions: React.Dispatch<React.SetStateAction<boolean>>,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Добавляем "Россия" к запросу для ограничения поиска
      const searchQuery = `Россия, ${query}`;
      
      // Используем Geocoder API Яндекс.Карт с фокусом на Россию
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&geocode=${encodeURIComponent(
          searchQuery
        )}&format=json&results=10&lang=ru_RU`
      );

      if (!response.ok) {
        throw new Error("Ошибка при получении данных");
      }

      const data = await response.json();
      const geoObjects =
        data.response.GeoObjectCollection.featureMember || [];

      // Фильтруем только объекты из России, исключаем регионы и Калининград
      const filteredObjects = geoObjects.filter((item: any) => {
        const address = item.GeoObject.metaDataProperty.GeocoderMetaData.Address;
        const countryCode = address?.country_code;
        
        // Проверяем, что это Россия
        if (countryCode !== "RU") return false;
        
        // Получаем текст адреса для проверки
        const displayText = item.GeoObject.metaDataProperty.GeocoderMetaData.text.toLowerCase();
        
        // Исключаем Калининград и Калининградскую область
        if (displayText.includes("калининград")) {
          return false;
        }
        
        // Исключаем регионы (области, края, республики)
        const regionKeywords = ["область", "край", "республика"];
        const isRegion = regionKeywords.some(keyword => displayText.includes(keyword));
        
        if (isRegion) {
          // Дополнительная проверка: если это не город внутри региона
          // Проверяем компоненты адреса
          const components = address?.Components || [];
          const hasLocality = components.some((comp: any) => 
            comp.kind === "locality" || comp.kind === "district"
          );
          
          // Если нет компонента "locality" или "district", это регион, а не город
          if (!hasLocality) {
            return false;
          }
        }
        
        return true;
      });

      const newSuggestions: Suggestion[] = filteredObjects
        .slice(0, 5)
        .map((item: any) => {
          const geoObject = item.GeoObject;
          const pos = geoObject.Point.pos.split(" ");
          return {
            displayName: geoObject.metaDataProperty.GeocoderMetaData.text,
            value: geoObject.metaDataProperty.GeocoderMetaData.text,
            coordinates: [parseFloat(pos[0]), parseFloat(pos[1])] as [
              number,
              number
            ],
          };
        });

      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Ошибка при получении подсказок:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для форматирования номера телефона
  const formatPhoneNumber = (value: string): string => {
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
      return formatted;
    }
    return cleaned;
  };

  // Обработчик изменения телефона
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
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

const findClosestVolumeIndex = (targetVolume: number, steps: number[]) => {
  if (steps.length === 0) return 0;
  let closestIndex = 0;
  let smallestDiff = Math.abs(steps[0] - targetVolume);
  for (let i = 1; i < steps.length; i++) {
    const diff = Math.abs(steps[i] - targetVolume);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestIndex = i;
    }
  }
  return closestIndex;
};

  // Информация о типах машин по объёму (данные из автопарка)
  const getTruckInfoByVolume = (volume: number) => {
    if (volume <= 6) return { 
      name: "Портер", 
      capacity: "800кг", 
      volumeCapacity: "6 м³", 
      dimensions: "Д: 2,65м × Ш: 1,5м × В: 1,6м", 
      description: "Компактный транспорт для небольших грузов",
      image: "/1.webp"
    };
    if (volume <= 9) return { 
      name: "Газель", 
      capacity: "1,5т", 
      volumeCapacity: "9 м³", 
      dimensions: "Д: 3м × Ш: 1,95м × В: 1,6м", 
      description: "Газель для городских и междугородних перевозок",
      image: "/3.webp"
    };
    if (volume <= 15) return { 
      name: "3 тонны", 
      capacity: "3т", 
      volumeCapacity: "15 м³", 
      dimensions: "Д: 3,80м × Ш: 2,1м × В: 2м", 
      description: "Оптимальный выбор для переезда или перевозки товаров",
      image: "/5.webp"
    };
    if (volume <= 30) return { 
      name: "5 тонн", 
      capacity: "5т", 
      volumeCapacity: "30 м³", 
      dimensions: "Д: 4-6м × Ш: 2,3м × В: 2,2м", 
      description: "Вместительный транспорт для крупных партий груза",
      image: "/7.webp"
    };
    if (volume <= 45) return { 
      name: "10 тонн", 
      capacity: "10т", 
      volumeCapacity: "45 м³", 
      dimensions: "Д: 6-9м × Ш: 2,4м × В: 2,35м", 
      description: "Фура для междугородних и межрегиональных перевозок",
      image: "/2.webp"
    };
    return { 
      name: "20 тонн", 
      capacity: "20т", 
      volumeCapacity: "82 м³", 
      dimensions: "Д: 13,6м × Ш: 2,45м × В: 2,65м", 
      description: "Максимальный объем для крупногабаритных грузов",
      image: "/4.webp"
    };
  };

  // Функция скачивания расчёта
  const downloadCalculation = () => {
    const volumeText = `${volumeSteps[volumeIndex]} м³`;
    
    const calculationData = `
╔════════════════════════════════════════════════════════════╗
║          РАСЧЁТ СТОИМОСТИ ПЕРЕВОЗКИ ГРУЗА                 ║
║                  NORDA TRANS                              ║
╚════════════════════════════════════════════════════════════╝

📅 Дата расчёта: ${new Date().toLocaleDateString('ru-RU')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 МАРШРУТ:
   Откуда: ${fromCity}
   Куда: ${toCity}
   Расстояние: ${routeDistance} км
   Срок доставки: ${routeDuration} ${routeDuration === 1 ? 'день' : routeDuration && routeDuration < 5 ? 'дня' : 'дней'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 ПАРАМЕТРЫ ГРУЗА:
   Тип перевозки: ${transportType}${cargoPackaging === 'pallets' && palletCount ? `\n   Количество палет: ${palletCount}` : ''}
   Объём: ${volumeText}
   Вес: ${weightSteps[weightIndex] >= 1000 ? `${(weightSteps[weightIndex] / 1000).toFixed(1)} т` : `${weightSteps[weightIndex]} кг`}

${transportType === "Домашний переезд" ? `📋 ЧТО ПЕРЕВОЗИМ:\n${movingItems.boxes ? `   ✓ Коробки${boxesCount ? ` (${boxesCount} шт.)` : ''}\n` : ''}${movingItems.furniture ? `   ✓ Мебель${furnitureDetails ? `: ${furnitureDetails}` : ''}\n` : ''}${movingItems.appliances ? `   ✓ Бытовая техника${appliancesDetails ? `: ${appliancesDetails}` : ''}\n` : ''}` : ''}
${transportType === "Промышленные товары" ? `📦 ДЕТАЛИ ГРУЗА:\n   Упаковка: ${cargoPackaging === 'pallets' ? 'На палетах' : cargoPackaging === 'individual' ? 'Индивидуальная упаковка' : cargoPackaging === 'bulk' ? 'Навалом (без упаковки)' : 'Россыпью'}${cargoPackaging === 'pallets' && palletCount ? ` (${palletCount} шт.)` : ''}\n   Характер груза: ${cargoNature}\n` : ''}
${transportType === "Продукты питания" ? `🍎 ДЕТАЛИ ГРУЗА:\n   Тип фургона: ${truckType === 'tented' ? 'Тентованный' : truckType === 'isoterm' ? 'Изотерм' : truckType === 'refrigerator' ? 'Рефрижератор' : 'Не важно'}${truckType === 'refrigerator' && temperatureMode ? ` (${temperatureMode}°C)` : ''}\n   Упаковка: ${foodPackaging === 'pallets' ? 'На палетах' : foodPackaging === 'boxes' ? 'В коробках' : foodPackaging === 'individual' ? 'Индивидуальная упаковка' : foodPackaging === 'bulk' ? 'Навалом (без упаковки)' : 'Россыпью'}${foodPackaging === 'pallets' && foodPalletCount ? ` (${foodPalletCount} шт.)` : ''}\n` : ''}
${transportType === "Другое" ? `📦 ДЕТАЛИ ГРУЗА:\n   Упаковка: ${otherPackaging === 'pallets' ? 'На палетах' : otherPackaging === 'individual' ? 'Индивидуальная упаковка' : otherPackaging === 'bulk' ? 'Навалом (без упаковки)' : 'Россыпью'}${otherPackaging === 'pallets' && otherPalletCount ? ` (${otherPalletCount} шт.)` : ''}\n   Характер груза: ${otherNature}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚛 РЕКОМЕНДУЕМЫЙ ТРАНСПОРТ:
   ${getTruckInfoByVolume(volumeSteps[volumeIndex]).name}
   Грузоподъёмность: ${getTruckInfoByVolume(volumeSteps[volumeIndex]).capacity}
   Объём кузова: ${getTruckInfoByVolume(volumeSteps[volumeIndex]).volumeCapacity}
   Размеры: ${getTruckInfoByVolume(volumeSteps[volumeIndex]).dimensions}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 ПРИМЕРНАЯ СТОИМОСТЬ: ${estimatedCost.toLocaleString()} ₽

⚠️  ВАЖНО: Это предварительный расчёт на основе указанных данных.<br />
  Отправьте эту форму, указав как вы хотите получить точный расчёт.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 КОНТАКТЫ:

👤 Ваш персональный менеджер:
   ${managerName}
   Телефон: ${managerPhone}

🏢 Офис NORDA TRANS:
   📱 +7 (929) 988 22 01
   📧 logist@nordatrans.ru
   🌐 https://nordatrans.ru
   🏛️  ИНН: 9723060209

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Расчёт сформирован автоматически на сайте nordatrans.ru
`;
    const blob = new Blob([calculationData], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Расчёт_перевозки_${fromCity}-${toCity}_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

const handleConstructorApplyFactory = (
  setIsConstructorOpen: (value: boolean) => void,
  setVolumeIndex: (value: number) => void,
  setConstructorItems: (items: SelectedItem[] | undefined) => void,
  setConstructorFloorUtilization: (value: number | undefined) => void,
  setConstructorRecommendedTruck: (value: string | undefined) => void,
  setShowFinalPrice: (value: boolean) => void,
  volumeSteps: number[]
) => (
  totalVolume: number,
  recommendedTruck?: string,
  floorUtilization?: number,
  selectedItems?: SelectedItem[]
) => {
  setIsConstructorOpen(false);
  const sanitizedVolume = Math.max(0, Math.round(totalVolume));
  const targetIndex = findClosestVolumeIndex(sanitizedVolume, volumeSteps);
  setVolumeIndex(targetIndex);
  setConstructorItems(selectedItems && selectedItems.length ? selectedItems : undefined);
  setConstructorFloorUtilization(floorUtilization);
  setConstructorRecommendedTruck(recommendedTruck);
  setShowFinalPrice(false);
  toast.success(`Объём из конструктора: ${volumeSteps[targetIndex]} м³${recommendedTruck ? ` • ${recommendedTruck}` : ''}`);
};

  // Функция расчета расстояния по формуле Haversine
  const calculateHaversineDistance = (lon1: number, lat1: number, lon2: number, lat2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Загрузка Яндекс.Карт API
  const loadYandexMaps = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).ymaps) {
        (window as any).ymaps.ready(() => resolve((window as any).ymaps));
        return;
      }
      const existingScript = document.querySelector('script[src*="api-maps.yandex.ru"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          (window as any).ymaps.ready(() => resolve((window as any).ymaps));
        });
        return;
      }
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_API_KEY}&lang=ru_RU`;
      script.async = true;
      script.onload = () => {
        (window as any).ymaps.ready(() => resolve((window as any).ymaps));
      };
      script.onerror = () => reject(new Error('Не удалось загрузить Яндекс.Карты'));
      document.head.appendChild(script);
    });
  };

  // Функция расчета маршрута через Яндекс.Карты
  const calculateRoute = async () => {
    if (!routeData.fromCoordinates || !routeData.toCoordinates) {
      setRouteDistance(null);
      setRouteDuration(null);
      return;
    }
    setIsCalculatingRoute(true);
    try {
      const ymaps = await loadYandexMaps();
      const route = await ymaps.route(
        [[routeData.fromCoordinates[1], routeData.fromCoordinates[0]], [routeData.toCoordinates[1], routeData.toCoordinates[0]]],
        { mapStateAutoApply: false }
      );
      const distanceMeters = route.getLength();
      if (distanceMeters && typeof distanceMeters === 'number') {
        const distanceKm = Math.round(distanceMeters / 1000);
        const estimatedDays = Math.max(1, Math.ceil(distanceKm / 800));
        await new Promise(resolve => setTimeout(resolve, 1200));
        setRouteDistance(distanceKm);
        setRouteDuration(estimatedDays);
      } else {
        throw new Error('Не удалось получить расстояние');
      }
    } catch (error) {
      console.error("❌ Ошибка при расчете маршрута:", error);
      try {
        const straightDistance = calculateHaversineDistance(
          routeData.fromCoordinates![0], routeData.fromCoordinates![1],
          routeData.toCoordinates![0], routeData.toCoordinates![1]
        );
        const roadDistance = Math.round(straightDistance * 1.12);
        const estimatedDays = Math.max(1, Math.ceil(roadDistance / 800));
        await new Promise(resolve => setTimeout(resolve, 1200));
        setRouteDistance(roadDistance);
        setRouteDuration(estimatedDays);
      } catch (fallbackError) {
        console.error("❌ Критическая ошибка:", fallbackError);
        setRouteDistance(null);
        setRouteDuration(null);
      }
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // Отправка заявки в Bitrix24
  const handleSubmitCalculation = async () => {
    if (!userContact || userContact.trim() === "") {
      setUserContactError(true);
      return;
    }
    if (!fromCity || !toCity) {
      toast.error("Пожалуйста, укажите города отправления и назначения");
      return;
    }
    if (!routeDistance || routeDistance === 0) {
      toast.error("Не удалось рассчитать расстояние. Проверьте адреса.");
      return;
    }
    const volumeForCalculation = volumeSteps[volumeIndex];
    const volumeForDisplay = volumeSteps[volumeIndex];
    
    const calculationResult = calculateShippingCost(
      fromCity, 
      toCity, 
      routeDistance, 
      weightSteps[weightIndex], 
      volumeForCalculation, 
      transportType,
      routeData.fromCoordinates,
      routeData.toCoordinates
    );
    if (!calculationResult) {
      toast.error("Ошибка расчёта. Проверьте введенные данные.");
      return;
    }
    const leadData = {
      fromCity, toCity, phone: userContact, distance: routeDistance,
      weight: weightSteps[weightIndex], volume: volumeForDisplay,
      cost: calculationResult.cost, truckCapacity: formatTruckCapacity(calculationResult.truckCapacity),
      contactMethod,
      additionalInfo: {
        direction: calculationResult.details.direction, costPerKm: calculationResult.costPerKm,
        minimumApplied: calculationResult.details.minimumApplied, cargoType: transportType || undefined,
        // Домашний переезд: только флаг использования конструктора и список предметов
        usedConstructor: transportType === "Домашний переезд" && constructorItems !== undefined && constructorItems.length > 0,
        constructorItems: transportType === "Домашний переезд" ? constructorItems : undefined,
        // Промышленные товары
        cargoPackaging: transportType === "Промышленные товары" && cargoPackaging ? cargoPackaging : undefined,
        palletCount: transportType === "Промышленные товары" && palletCount ? palletCount : undefined,
        palletWeightPerKg: (transportType === "Промышленные товары" && cargoPackaging === 'pallets' && palletWeightPerKg) ? palletWeightPerKg :
          (transportType === "Продукты питания" && foodPackaging === 'pallets' && foodPalletWeightPerKg) ? foodPalletWeightPerKg :
          (transportType === "Другое" && otherPackaging === 'pallets' && otherPalletWeightPerKg) ? otherPalletWeightPerKg : undefined,
        cargoNature: transportType === "Промышленные товары" && cargoNature ? cargoNature : undefined,
        // Продукты питания
        truckType: transportType === "Продукты питания" && truckType ? truckType : undefined,
        temperatureMode: transportType === "Продукты питания" && temperatureMode ? temperatureMode : undefined,
        foodPackaging: transportType === "Продукты питания" && foodPackaging ? foodPackaging : undefined,
        foodPalletCount: transportType === "Продукты питания" && foodPalletCount ? foodPalletCount : undefined,
        // Другое
        otherPackaging: transportType === "Другое" && otherPackaging ? otherPackaging : undefined,
        otherPalletCount: transportType === "Другое" && otherPalletCount ? otherPalletCount : undefined,
        otherNature: transportType === "Другое" && otherNature ? otherNature : undefined,
      }
    };
    const loadingToastId = toast.loading(<div className="flex flex-col gap-2 py-2"><p className="text-lg font-semibold">Отправляем вашу заявку...</p><p className="text-sm text-gray-600">Пожалуйста, подождите</p></div>, { duration: Infinity });
    try {
      const result = await createBitrix24Lead(leadData);
      if (result.success) {
        reachGoal('CALCULATOR_SUBMIT', { fromCity, toCity, cost: calculationResult.cost });
        toast.success(<div className="flex flex-col gap-2 py-2"><p className="text-lg font-semibold">✅ Заявка успешно отправлена!</p><p className="text-sm">Заявка №{result.leadId}</p><p className="text-sm text-gray-600">Перенаправляем вас...</p></div>, { id: loadingToastId, duration: 2000 });
        setUserContact("");
        setShowContactForm(false);
        setTimeout(() => navigate('/thanks', { state: { from: location.pathname } }), 2000);
      } else {
        toast.error(<div className="flex flex-col gap-2 py-2"><p className="text-lg font-semibold">❌ Ошибка при отправке</p><p className="text-sm">{result.error}</p></div>, { id: loadingToastId, duration: 5000 });
      }
    } catch (error) {
      toast.error("Произошла ошибка при отправке заявки", { id: loadingToastId });
      console.error("Ошибка:", error);
    }
  };

  // ============================================================================
  // USE EFFECTS
  // ============================================================================

  // Автоматическое открытие формы контактов ОТКЛЮЧЕНО - пользователь должен нажать кнопку
  // useEffect(() => {
  //   if (showFinalPrice && estimatedCost > 0) {
  //     setShowContactForm(true);
  //   }
  // }, [showFinalPrice, estimatedCost]);

  // Автоматический расчет маршрута при изменении координат
  useEffect(() => {
    calculateRoute();
  }, [routeData.fromCoordinates, routeData.toCoordinates]);

  // Автоматическое форматирование телефона при автозаполнении
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userContact && !userContact.startsWith('+7')) {
        const formatted = formatPhoneNumber(userContact);
        setUserContact(formatted);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Сброс индексов при смене типа перевозки (для избежания ошибок с разными массивами)
  useEffect(() => {
    // Сбрасываем индексы только если они выходят за пределы текущих массивов
    if (weightIndex >= weightSteps.length) {
      setWeightIndex(0);
    }
    if (volumeIndex >= volumeSteps.length) {
      // Если индекс вышел за пределы массива, сбрасываем его в 0
      setVolumeIndex(0);
    }
  }, [transportType]);

  // Сброс volumeIndex в 0 при переходе на шаг 2 для домашнего переезда (если конструктор не использован)
  // Используем useRef для отслеживания, был ли уже выполнен сброс при переходе на шаг 2
  const resetVolumeOnStep2Ref = useRef(false);
  
  useEffect(() => {
    if (calculatorStep === 2 && transportType === "Домашний переезд") {
      // Если конструктор не был использован и сброс еще не выполнялся, сбрасываем volumeIndex в 0
      if ((!constructorItems || constructorItems.length === 0) && !resetVolumeOnStep2Ref.current) {
        setVolumeIndex(0);
        resetVolumeOnStep2Ref.current = true;
      }
    } else if (calculatorStep !== 2) {
      // Сбрасываем флаг при уходе со шага 2
      resetVolumeOnStep2Ref.current = false;
    }
  }, [calculatorStep, transportType, constructorItems]);

  // Автоматическое определение веса для домашнего переезда
  useEffect(() => {
    if (transportType === "Домашний переезд") {
      const volume = volumeSteps[volumeIndex];
      // Для частных лиц используем более точные шаги веса
      if (volume === 0) setWeightIndex(0); // 0 кг
      else if (volume <= 3) setWeightIndex(2); // 300 кг
      else if (volume <= 9) setWeightIndex(4); // 700 кг
      else if (volume <= 15) setWeightIndex(6); // 2 т
      else if (volume <= 30) setWeightIndex(8); // 4 т
      else if (volume <= 45) setWeightIndex(11); // 7 т
      else setWeightIndex(16); // 12 т
    }
  }, [volumeIndex, transportType]);

  // Автоматическое определение объёма для палет (промышленные товары)
  useEffect(() => {
    if (transportType === "Промышленные товары" && cargoPackaging === "pallets" && palletCount) {
      const pallets = parseInt(palletCount);
      if (isNaN(pallets) || pallets <= 0) return;
      if (pallets <= 2) { setVolumeIndex(3); setWeightIndex(3); }
      else if (pallets <= 4) { setVolumeIndex(4); setWeightIndex(4); }
      else if (pallets <= 6) { setVolumeIndex(5); setWeightIndex(5); }
      else if (pallets <= 10) { setVolumeIndex(6); setWeightIndex(6); }
      else if (pallets <= 17) { setVolumeIndex(7); setWeightIndex(7); }
      else { setVolumeIndex(8); setWeightIndex(8); }
    }
  }, [palletCount, transportType, cargoPackaging]);

  // Автоматическое определение объёма для палет (продукты питания)
  useEffect(() => {
    if (transportType === "Продукты питания" && foodPackaging === "pallets" && foodPalletCount) {
      const pallets = parseInt(foodPalletCount);
      if (isNaN(pallets) || pallets <= 0) return;
      if (pallets <= 2) { setVolumeIndex(3); setWeightIndex(3); }
      else if (pallets <= 4) { setVolumeIndex(4); setWeightIndex(4); }
      else if (pallets <= 6) { setVolumeIndex(5); setWeightIndex(5); }
      else if (pallets <= 10) { setVolumeIndex(6); setWeightIndex(6); }
      else if (pallets <= 17) { setVolumeIndex(7); setWeightIndex(7); }
      else { setVolumeIndex(8); setWeightIndex(8); }
    }
  }, [foodPalletCount, transportType, foodPackaging]);

  // Автоматическое определение объёма для палет (другое)
  useEffect(() => {
    if (transportType === "Другое" && otherPackaging === "pallets" && otherPalletCount) {
      const pallets = parseInt(otherPalletCount);
      if (isNaN(pallets) || pallets <= 0) return;
      if (pallets <= 2) { setVolumeIndex(3); setWeightIndex(3); }
      else if (pallets <= 4) { setVolumeIndex(4); setWeightIndex(4); }
      else if (pallets <= 6) { setVolumeIndex(5); setWeightIndex(5); }
      else if (pallets <= 10) { setVolumeIndex(6); setWeightIndex(6); }
      else if (pallets <= 17) { setVolumeIndex(7); setWeightIndex(7); }
      else { setVolumeIndex(8); setWeightIndex(8); }
    }
  }, [otherPalletCount, transportType, otherPackaging]);

  // Функция для скролла к началу формы с отступом 15px сверху
  const scrollToForm = () => {
    setTimeout(() => {
      if (calculatorFormRef.current) {
        const elementPosition = calculatorFormRef.current.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - 15;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

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

        {/* Header */}
        <div className="flex flex-col items-center mb-3 relative z-10" style={{marginTop: '20px'}}>
          <h2 className="text-xl font-bold text-white text-center">Расчет стоимости перевозки</h2>
        </div>
        
        {/* Estimated Cost Display */}
        {/* ШАГ 1: Показываем заглушку с 0 рублей */}
        {calculatorStep === 1 && (
          <div className="bg-white/10 border border-white/20 rounded-lg p-3 mb-3 backdrop-blur-sm relative z-10" style={{marginTop: '30px'}}>
            <div>
              <p className="text-xs font-medium text-center mb-2 text-white/90">
                Предварительная стоимость перевозки
              </p>
              
              <div className="flex items-center justify-center">
                <div className="flex-1 text-center">
                  <p className="text-3xl font-bold text-white">0 ₽</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ШАГ 2: Показываем финальную стоимость только после нажатия кнопки */}
        {calculatorStep === 2 && showFinalPrice && estimatedCost > 0 && (
          <div className="bg-white/15 border-2 border-white/30 rounded-lg p-3 mb-3 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500 backdrop-blur-sm relative z-10" style={{marginTop: '25px'}}>
            <div>
              {/* Верхняя часть - скрывается на мобильных при открытии формы */}
              <div className={`${showContactForm ? 'hidden md:block' : 'block'}`}>
                <p className="text-xs text-center mb-1 text-white/90">
                  ⚠️ Примерная стоимость вашей перевозки
                </p>
                
                {/* Расстояние, цена и срок в одну строку */}
                <div className="flex items-center justify-between gap-3 mb-2">
                  {/* Расстояние слева */}
                  <div className="flex items-center gap-1.5 min-w-[70px]">
                    {routeDistance && routeDistance > 0 && (
                      <>
                        <Truck className="w-3.5 h-3.5 text-white" />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-white leading-tight">
                            {routeDistance.toLocaleString()} км
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Цена по центру */}
                  <div className="flex-1 text-center">
                    <p className="text-2xl font-bold text-white">{estimatedCost.toLocaleString()} ₽</p>
                  </div>
                  
                  {/* Срок доставки справа */}
                  <div className="flex items-center gap-1.5 min-w-[70px] justify-end">
                    {routeDuration && routeDuration > 0 && (
                      <>
                        <div className="flex flex-col text-right">
                          <span className="text-xs font-semibold text-white leading-tight">
                            {routeDuration} {routeDuration === 1 ? 'день' : routeDuration < 5 ? 'дня' : 'дней'}
                          </span>
                          <span className="text-[9px] text-white/70">доставка</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Призыв к действию со скидкой */}
                <div className="relative bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400 rounded-lg p-3 mb-2" style={{marginTop: '15px'}}>
                  <p className="text-sm text-white font-bold text-center leading-relaxed">
                    🎉 Получите точный расчёт со скидкой <span className="text-green-400">10%</span> от финальной стоимости!
                  </p>
                  <p className="text-xs text-white/80 text-center mt-1">
                    Укажите способ связи и мы свяжемся с вами в течение 5 минут
                  </p>
                </div>

              </div>

              {/* Кнопка или форма контактов */}
              <div className="space-y-3" style={{ marginTop: '20px' }}>
                {!showContactForm ? (
                  <div className="flex justify-center">
                    <Button 
                      className="relative text-white font-bold text-base hover:scale-[1.02] transition-all shadow-lg px-[30px] py-3" 
                      style={{ 
                        backgroundColor: '#10b981',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      }}
                      onClick={() => {
                        setShowContactForm(true);
                        setContactMethod("" as any); // Сбрасываем выбор способа связи - обе кнопки неактивны
                        setUserContact(""); // Очищаем номер
                      }}
                    >
                      <div className="absolute -top-3 -right-3 bg-gradient-to-br from-red-500 to-red-600 text-white px-2.5 py-1 rounded-full shadow-lg transform rotate-[22deg] z-10">
                        <span className="text-xs font-bold">-10%</span>
                      </div>
                      🎯 Получить точный расчёт со скидкой
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-center text-white/90" style={{ marginBottom: '10px' }}>
                      Как вы хотите получить расчёт?
                    </p>

                    {/* Выбор способа связи - кнопка превращается в поле ввода */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Колонка для Звонка */}
                      {contactMethod === "phone" ? (
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
                          <Input
                            type="tel"
                            placeholder="Ваш телефон"
                            value={userContact}
                            onChange={(e) => {
                              handlePhoneChange(e);
                              if (userContactError) setUserContactError(false);
                            }}
                            onFocus={(e) => {
                              if (!e.target.value) {
                                setUserContact('+7 ');
                              }
                            }}
                            className={`h-10 pl-10 ${userContactError ? 'border-orange-500 ring-2 ring-orange-500' : ''}`}
                            autoComplete="tel"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full h-10"
                          onClick={() => {
                            setContactMethod("phone");
                            setUserContact("");
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
                            onChange={(e) => {
                              handlePhoneChange(e);
                              if (userContactError) setUserContactError(false);
                            }}
                            onFocus={(e) => {
                              if (!e.target.value) {
                                setUserContact('+7 ');
                              }
                            }}
                            className={`h-10 pl-10 ${userContactError ? 'border-orange-500 ring-2 ring-orange-500' : ''}`}
                            style={{backgroundColor: '#E7F8F0'}}
                            autoComplete="tel"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full h-10"
                          onClick={() => {
                            setContactMethod("whatsapp");
                            setUserContact("");
                          }}
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          WhatsApp
                        </Button>
                      )}
                    </div>

                    {/* Кнопка отправки - показывается только при выборе способа связи */}
                    {contactMethod && contactMethod !== "" && (
                      <div className="pt-2">
                        <button
                          className="w-full h-[50px] rounded-md text-base font-bold transition-all bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105 shadow-lg cursor-pointer"
                          onClick={handleSubmitCalculation}
                        >
                          🎉 Отправить заявку со скидкой -10%
                        </button>
                        {userContactError && (
                          <p className="text-sm text-white font-medium flex items-center gap-1 mt-2">
                            <span className="inline-block w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                            Укажите номер телефона или WhatsApp
                          </p>
                        )}
                      </div>
                    )}

                    {/* Кнопка скачать расчёт */}
                    <div className="pt-2">
                      <button
                        className="flex items-center justify-center gap-1 text-xs text-white hover:text-white/80 transition-colors w-full"
                        onClick={downloadCalculation}
                      >
                        <Download className="w-3.5 h-3.5" />
                        Скачать расчёт
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Form */}
        <div className="space-y-3">
          {calculatorStep === 1 && (
            <>
              {/* ШАГ 1: Основная информация */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
                <div className="space-y-1.5">
                  <Label htmlFor="from" className="text-white">Откуда</Label>
                  <div className="relative">
                    <div 
                      className={`rounded-lg transition-all ${
                        fromFieldError 
                          ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20' 
                          : ''
                      }`}
                    >
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-white/60 z-10" />
                        <Input
                          ref={fromInputRef}
                          id="from"
                          placeholder="Город отправления"
                          value={fromCity}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setFromCity(newValue);
                            setFromCoordinates(undefined);
                            
                            // Сбрасываем ошибку при вводе
                            if (fromFieldError) setFromFieldError(false);

                            // Очистка предыдущего таймера
                            if (fromDebounceTimer.current) {
                              clearTimeout(fromDebounceTimer.current);
                            }

                            // Установка нового таймера для debounce
                            fromDebounceTimer.current = setTimeout(() => {
                              fetchSuggestions(newValue, setFromSuggestions, setShowFromSuggestions, setIsLoadingFrom);
                            }, 500);
                          }}
                          onFocus={() => {
                            // 🎯 КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Показываем подсказки при фокусе, если есть текст но нет координат
                            if (fromCity && !routeData.fromCoordinates) {
                              setFromFieldError(true);
                              // Сразу показываем подсказки
                              fetchSuggestions(fromCity, setFromSuggestions, setShowFromSuggestions, setIsLoadingFrom);
                            }
                          }}
                          onBlur={() => {
                            // Проверяем валидность поля при потере фокуса (только визуальная подсветка)
                            if (fromCity && !routeData.fromCoordinates) {
                              setFromFieldError(true);
                            }
                          }}
                          className="pl-10 pr-10"
                          autoComplete="off"
                        />
                        {fromCity && (
                          <button
                            type="button"
                            onClick={() => {
                              setFromCity("");
                              setFromCoordinates(undefined);
                              setFromSuggestions([]);
                              setShowFromSuggestions(false);
                              fromInputRef.current?.focus();
                            }}
                            className="absolute right-3 top-3 text-white/60 hover:text-white transition-colors"
                            aria-label="Очистить"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Индикатор загрузки */}
                      {isLoadingFrom && (
                        <div className="absolute right-10 top-3 z-10">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    {/* Список подсказок */}
                    {showFromSuggestions && fromSuggestions.length > 0 && (
                      <div
                        ref={fromSuggestionsRef}
                        className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      >
                        {fromSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setFromCity(suggestion.value);
                              setFromCoordinates(suggestion.coordinates);
                              setShowFromSuggestions(false);
                              setFromSuggestions([]);
                              setFromFieldError(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors border-b border-border last:border-b-0 flex items-start gap-3"
                          >
                            <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                            <span className="text-sm">{suggestion.displayName}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Сообщение об отсутствии результатов */}
                    {showFromSuggestions &&
                      fromSuggestions.length === 0 &&
                      !isLoadingFrom &&
                      fromCity.length >= 3 && (
                        <div
                          ref={fromSuggestionsRef}
                          className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-lg p-4"
                        >
                          <p className="text-sm text-muted-foreground text-center">
                            Адреса не найдены
                          </p>
                        </div>
                      )}
                  </div>
                  {fromFieldError && (
                    <p className="text-sm text-white font-medium flex items-center gap-1 mt-1">
                      <span className="inline-block w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                      Выберите адрес из выпадающего списка
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="to" className="text-white">Куда</Label>
                  <div className="relative">
                    <div 
                      className={`rounded-lg transition-all ${
                        toFieldError 
                          ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20' 
                          : ''
                      }`}
                    >
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-white/60 z-10" />
                        <Input
                          ref={toInputRef}
                          id="to"
                          placeholder="Город назначения"
                          value={toCity}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setToCity(newValue);
                            setToCoordinates(undefined);
                            
                            // Сбрасываем ошибку при вводе
                            if (toFieldError) setToFieldError(false);

                            // Очистка предыдущего таймера
                            if (toDebounceTimer.current) {
                              clearTimeout(toDebounceTimer.current);
                            }

                            // Установка нового таймера для debounce
                            toDebounceTimer.current = setTimeout(() => {
                              fetchSuggestions(newValue, setToSuggestions, setShowToSuggestions, setIsLoadingTo);
                            }, 500);
                          }}
                          onFocus={() => {
                            // 🎯 КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: Показываем подсказки при фокусе, если есть текст но нет координат
                            if (toCity && !routeData.toCoordinates) {
                              setToFieldError(true);
                              // Сразу показываем подсказки
                              fetchSuggestions(toCity, setToSuggestions, setShowToSuggestions, setIsLoadingTo);
                            }
                          }}
                          onBlur={() => {
                            // Проверяем валидность поля при потере фокуса (только визуальная подсветка)
                            if (toCity && !routeData.toCoordinates) {
                              setToFieldError(true);
                            }
                          }}
                          className="pl-10 pr-10"
                          autoComplete="off"
                        />
                        {toCity && (
                          <button
                            type="button"
                            onClick={() => {
                              setToCity("");
                              setToCoordinates(undefined);
                              setToSuggestions([]);
                              setShowToSuggestions(false);
                              toInputRef.current?.focus();
                            }}
                            className="absolute right-3 top-3 text-white/60 hover:text-white transition-colors"
                            aria-label="Очистить"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Индикатор загрузки */}
                      {isLoadingTo && (
                        <div className="absolute right-10 top-3 z-10">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>

                    {/* Список подсказок */}
                    {showToSuggestions && toSuggestions.length > 0 && (
                      <div
                        ref={toSuggestionsRef}
                        className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      >
                        {toSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setToCity(suggestion.value);
                              setToCoordinates(suggestion.coordinates);
                              setShowToSuggestions(false);
                              setToSuggestions([]);
                              setToFieldError(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors border-b border-border last:border-b-0 flex items-start gap-3"
                          >
                            <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                            <span className="text-sm">{suggestion.displayName}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Сообщение об отсутствии результатов */}
                    {showToSuggestions &&
                      toSuggestions.length === 0 &&
                      !isLoadingTo &&
                      toCity.length >= 3 && (
                        <div
                          ref={toSuggestionsRef}
                          className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-lg p-4"
                        >
                          <p className="text-sm text-muted-foreground text-center">
                            Адреса не найдены
                          </p>
                        </div>
                      )}
                  </div>
                  {toFieldError && (
                    <p className="text-sm text-white font-medium flex items-center gap-1 mt-1">
                      <span className="inline-block w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                      Выберите адрес из выпадающего списка
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 relative z-0">
                <Label className="text-sm font-bold text-white">Тип перевозки</Label>
                <div 
                  className={`grid grid-cols-1 gap-1.5 rounded-lg p-2 -m-2 transition-all ${
                    transportTypeError 
                      ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20' 
                      : ''
                  }`}
                >
                  {transportTypes.map((type) => (
                    <label
                      key={type}
                      className={`flex items-center py-2.5 px-3 rounded-lg border-2 cursor-pointer transition-all ${
                        transportType === type
                          ? 'border-white bg-white/20 shadow-sm'
                          : 'border-white/30 hover:border-white/60 hover:bg-white/10'
                      }`}
                    >
                      <input
                        type="radio"
                        name="transport-type"
                        value={type}
                        checked={transportType === type}
                        onChange={(e) => {
                          setTransportType(e.target.value);
                          // Сбрасываем ошибку при выборе
                          if (transportTypeError) setTransportTypeError(false);
                        }}
                        className="w-5 h-5 accent-white focus:ring-white focus:ring-2"
                      />
                      <span className={`ml-3 text-base text-white ${transportType === type ? 'font-semibold' : 'font-medium'}`}>
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
                {transportTypeError && (
                    <p className="text-sm text-white font-medium flex items-center gap-1 mt-1">
                      <span className="inline-block w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                      Выберите тип перевозки
                    </p>
                )}
              </div>
              
              <div className="flex justify-center">
                <Button 
                  className="w-full max-w-md" 
                  size="lg"
                  variant={(!fromCity || !toCity || !transportType) ? "outline" : "default"}
                  type="button"
                  style={(!fromCity || !toCity || !transportType) ? {backgroundColor: '#8599AE', borderColor: '#8599AE'} : {backgroundColor: '#FFFFFF', color: '#405b9a'}}
                  onClick={(e) => {
                  e.preventDefault(); // Предотвращаем любое поведение по умолчанию
                  e.stopPropagation(); // Останавливаем всплытие события
                  
                  console.log("🔄 Попытка перехода на шаг 2");
                  console.log("📍 Данные городов:", { fromCity, toCity, routeDistance });
                  
                  // Проверяем заполненность полей
                  const missingFields = [];
                  let hasValidationErrors = false;
                  
                  if (!fromCity) {
                    missingFields.push("• Укажите город отправления (Откуда)");
                    setFromFieldError(true);
                    hasValidationErrors = true;
                  } else if (!routeData.fromCoordinates) {
                    missingFields.push("• Выберите город отправления из выпадающего списка подсказок");
                    setFromFieldError(true);
                    hasValidationErrors = true;
                  }
                  
                  if (!toCity) {
                    missingFields.push("• Укажите город назначения (Куда)");
                    setToFieldError(true);
                    hasValidationErrors = true;
                  } else if (!routeData.toCoordinates) {
                    missingFields.push("• Выберите город назначения из выпадающего списка подсказок");
                    setToFieldError(true);
                    hasValidationErrors = true;
                  }
                  
                  if (!transportType) {
                    missingFields.push("• Выберите тип перевозки из предложенных вариантов");
                    setTransportTypeError(true);
                    hasValidationErrors = true;
                  }
                  
                  if (missingFields.length > 0) {
                    // Показываем toast только для полей адреса с координатами
                    const hasAddressError = (fromCity && !routeData.fromCoordinates) || (toCity && !routeData.toCoordinates);
                    
                    if (hasAddressError) {
                      toast.error("Необходимо выбрать адрес из списка", {
                        description: "Пожалуйста, выберите адрес из выпадающего списка подсказок Яндекс.Карт"
                      });
                    }
                    // Для всех остальных полей - только визуальная подсветка, без всплывающих окон
                    return;
                  }
                  
                  if (!routeDistance || routeDistance <= 0) {
                    // Проверяем, идет ли расчет маршрута
                    if (routeData.isCalculatingRoute) {
                      toast.info("⏳ Расстояние между городами ещё рассчитывается", {
                        description: "Пожалуйста, подождите несколько секунд и попробуйте снова"
                      });
                    } else {
                      // Если расчет завершился, но расстояние не получено - показываем предупреждение
                      toast.error("Невозможно рассчитать маршрут автоматически", {
                        description: (
                          <div className="flex flex-col gap-2 py-1">
                            <p className="text-sm">Для данного маршрута невозможно автоматически рассчитать стоимость.</p>
                            <p className="text-sm font-semibold">Позвоните нашим логистам:</p>
                            <a 
                              href="tel:+79299882201" 
                              className="text-sm text-blue-600 hover:text-blue-800 underline font-semibold"
                            >
                              📞 +7 (929) 988 22 01
                            </a>
                            <p className="text-xs text-gray-600">Вам рассчитают стоимость перевозки вручную</p>
                          </div>
                        ),
                        duration: 10000
                      });
                    }
                    return;
                  }
                  
                  console.log("✅ Все проверки пройдены, переход на шаг 2");
                  
                  setCalculatorStep(2);
                  setShowFinalPrice(false); // Сбрасываем флаг показа цены
                  
                  // Скроллим к началу формы
                  scrollToForm();
                }}
                >
                  Продолжить расчёт
                </Button>
              </div>
            </>
          )}

          {calculatorStep === 2 && transportType === "Домашний переезд" && (
            <>
              {/* ШАГ 2: Домашний переезд */}
              <div className="space-y-2">
                {/* Показываем только если цена ещё не рассчитана */}
                {!showFinalPrice && (
                  <>
                    <div className="space-y-2 pt-2">
                      <Label className="text-sm font-bold text-white">Предположительный объём: {volumeSteps[volumeIndex]} м³</Label>
                      <div
                        className={`rounded-lg p-2 -m-2 transition-all ${
                          volumeError ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20' : ''
                        }`}
                      >
                        <Slider
                          value={[volumeIndex]}
                          onValueChange={(value) => {
                            setVolumeIndex(value[0]);
                            if (volumeError) setVolumeError(false);
                          }}
                          min={0}
                          max={45}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      {volumeError && (
                        <p className="text-sm text-white font-medium flex items-center gap-1 mt-1">
                          <span className="inline-block w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                          Укажите примерный объем груза
                        </p>
                      )}
                    </div>

                    {constructorItems && constructorItems.length > 0 && (
                      <div className="rounded-lg border border-white/20 bg-white/10 p-3 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-white">
                              Объём по конструктору: {volumeSteps[volumeIndex]} м³
                            </p>
                            {constructorRecommendedTruck && (
                              <p className="text-xs text-white/80">
                                Рекомендованная машина: {constructorRecommendedTruck}
                              </p>
                            )}
                            {typeof constructorFloorUtilization === 'number' && (
                              <p className="text-xs text-white/70">
                                Заполнение пола: {Math.round(constructorFloorUtilization * 100)}%
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-8 text-xs text-white border-white/40 hover:text-[#083cb5] hover:border-white bg-transparent"
                            onClick={() => setIsConstructorOpen(true)}
                          >
                            Изменить в конструкторе
                          </Button>
                        </div>
                        <p className="text-xs text-white/60">
                          Предметов выбрано: {constructorItems.length}
                        </p>
                      </div>
                    )}

                    <div className="mt-3" data-truck-visualization>
                      <TruckVisualization
                        currentVolume={volumeSteps[volumeIndex]}
                        maxVolume={parseInt(getTruckInfoByVolume(volumeSteps[volumeIndex]).volumeCapacity.match(/\d+/)?.[0] || '82')}
                        truckName={getTruckInfoByVolume(volumeSteps[volumeIndex]).name}
                        truckCapacity={getTruckInfoByVolume(volumeSteps[volumeIndex]).capacity}
                        truckDescription={getTruckInfoByVolume(volumeSteps[volumeIndex]).description}
                        floorUtilization={constructorFloorUtilization}
                      />
                    </div>

                    {/* Показываем блок "Открыть конструктор" только если конструктор ещё не использован */}
                    {(!constructorItems || constructorItems.length === 0) && (
                      <div className="border-2 border-white/40 rounded-lg p-4 bg-white/5 hover:bg-white/10 transition-all">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Wrench className="w-5 h-5 text-white" />
                              <h3 className="text-sm font-bold text-white">Затрудняетесь с объёмом перевозки?</h3>
                            </div>
                            <p className="text-xs text-white/80">
                              Воспользуйтесь нашим конструктором — выберите предметы, и мы автоматически рассчитаем объём и предложим подходящую машину.
                            </p>
                          </div>
                          <Button
                            type="button"
                            onClick={() => setIsConstructorOpen(true)}
                            className="bg-white hover:bg-white/90 text-[#083cb5] font-semibold whitespace-nowrap"
                            size="sm"
                          >
                            <Package className="w-4 h-4 mr-2" />
                            Открыть конструктор
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {!showFinalPrice && (
                <div className="flex gap-2 pt-3" style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                  <Button 
                    variant="outline"
                    className="w-1/3 h-9" 
                    onClick={() => {
                      setCalculatorStep(1);
                      setShowFinalPrice(false);
                      setConstructorItems(undefined);
                      setConstructorFloorUtilization(undefined);
                      setConstructorRecommendedTruck(undefined);
                    }}
                  >
                    Назад
                  </Button>
                  <Button 
                    className="w-2/3 h-9" 
                    variant={(volumeIndex === 0 && (!constructorItems || constructorItems.length === 0)) ? "outline" : "default"}
                    type="button"
                    disabled={(volumeIndex === 0 && (!constructorItems || constructorItems.length === 0))}
                    style={(volumeIndex === 0 && (!constructorItems || constructorItems.length === 0)) ? {backgroundColor: '#8599AE', borderColor: '#8599AE'} : {backgroundColor: '#FFFFFF', color: '#405b9a'}}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Проверяем объем груза (но разрешаем расчет, если конструктор был использован)
                      if (volumeIndex === 0 && (!constructorItems || constructorItems.length === 0)) {
                        setVolumeError(true);
                        return;
                      }

                      // Выполняем расчет стоимости
                      const weight = weightSteps[weightIndex];
                      const volume = volumeSteps[volumeIndex];
                      
                      const result = calculateShippingCost(
                        fromCity,
                        toCity,
                        routeDistance!,
                        weight,
                        volume,
                        transportType,
                        routeData.fromCoordinates,
                        routeData.toCoordinates
                      );
                      
                      if (result && result.cost) {
                        // Применяем минимум 7500 рублей для всех типов перевозок
                        const finalCost = Math.max(result.cost, 7500);
                        
                        setEstimatedCost(finalCost);
                        setShowFinalPrice(true);
                        setShowContactForm(false); // Закрываем форму, чтобы показать кнопку
                        
                        // Скроллим к началу формы
                        scrollToForm();
                      }
                    }}
                  >
                    Получить расчёт
                  </Button>
                </div>
              )}
            </>
          )}

          {calculatorStep === 2 && transportType === "Промышленные товары" && (
            <>
              {/* ШАГ 2: Промышленные товары */}
              <div className="space-y-2">
                {/* Показываем форму только если цена ещё не рассчитана */}
                {!showFinalPrice && (
                  <>
                    {/* Характер груза */}
                    <div className="space-y-2">
                      <Label htmlFor="cargoNature" className="text-sm font-bold text-white">Характер груза</Label>
                      <div 
                        className={`rounded-lg transition-all ${
                          cargoNatureError 
                            ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20' 
                            : ''
                        }`}
                      >
                        <Input
                          id="cargoNature"
                          type="text"
                          placeholder="Оборудование, мебель и тп"
                          value={cargoNature}
                          onChange={(e) => {
                            setCargoNature(e.target.value);
                            if (cargoNatureError) setCargoNatureError(false);
                          }}
                          className="h-9"
                        />
                      </div>
                      {cargoNatureError && (
                        <p className="text-sm text-white font-medium flex items-center gap-1 mt-1">
                          <span className="inline-block w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                          Укажите характер груза
                        </p>
                      )}
                    </div>

                    {/* Как упакован груз */}
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-white">Как упакован груз?</Label>
                      <div 
                        className={`grid grid-cols-1 gap-1.5 rounded-lg p-2 -m-2 transition-all ${
                          cargoPackagingError 
                            ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20' 
                            : ''
                        }`}
                      >
                        {/* На палетах - с inline полем */}
                        <div
                          className={`py-2 px-2.5 rounded-lg border-2 transition-all ${
                            cargoPackaging === 'pallets'
                              ? 'border-white bg-white/10 shadow-sm'
                              : 'border-white/30 hover:border-white/60 hover:bg-white/10'
                          }`}
                        >
                          <label className="flex items-center cursor-pointer flex-shrink-0 mb-2">
                            <input
                              type="radio"
                              name="cargo-packaging"
                              value="pallets"
                              checked={cargoPackaging === 'pallets'}
                              onChange={(e) => {
                                setCargoPackaging(e.target.value);
                                if (cargoPackagingError) setCargoPackagingError(false);
                              }}
                              className="w-4 h-4 text-white focus:ring-white focus:ring-2"
                            />
                            <span className={`ml-3 text-sm ${cargoPackaging === 'pallets' ? 'font-semibold text-white' : 'font-medium text-white'}`}>
                              На палетах
                            </span>
                          </label>
                          {cargoPackaging === 'pallets' && (
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <div 
                                  className={`rounded-lg transition-all ${
                                    palletCountError 
                                      ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20' 
                                      : ''
                                  }`}
                                >
                                  <Input
                                    id="palletCount"
                                    type="number"
                                    placeholder="Количество палет"
                                    value={palletCount}
                                    onChange={(e) => {
                                      setPalletCount(e.target.value);
                                      if (palletCountError) setPalletCountError(false);
                                    }}
                                    className="h-8 text-sm"
                                    min="1"
                                  />
                                </div>
                              </div>
                              <div className="flex-1">
                                <div 
                                  className={`rounded-lg transition-all ${
                                    palletWeightPerKgError 
                                      ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20' 
                                      : ''
                                  }`}
                                >
                                  <Input
                                    type="number"
                                    placeholder="Вес палеты (кг)"
                                    value={palletWeightPerKg}
                                    onChange={(e) => {
                                      setPalletWeightPerKg(e.target.value);
                                      if (palletWeightPerKgError) setPalletWeightPerKgError(false);
                                    }}
                                    className="h-8 text-sm"
                                    min="1"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Остальные варианты */}
                        {[
                          { value: 'individual', label: 'Индивидуальная упаковка' },
                          { value: 'bulk', label: 'Навалом (без упаковки)' },
                          { value: 'loose', label: 'Россыпью' }
                        ].map((option) => (
                          <label
                            key={option.value}
                            className={`flex items-center py-2 px-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                              cargoPackaging === option.value
                                ? 'border-white bg-white/10 shadow-sm'
                                : 'border-white/30 hover:border-white/60 hover:bg-white/10'
                            }`}
                          >
                            <input
                              type="radio"
                              name="cargo-packaging"
                              value={option.value}
                              checked={cargoPackaging === option.value}
                              onChange={(e) => {
                                setCargoPackaging(e.target.value);
                                if (cargoPackagingError) setCargoPackagingError(false);
                              }}
                              className="w-4 h-4 text-white focus:ring-white focus:ring-2"
                            />
                            <span className={`ml-3 text-sm ${cargoPackaging === option.value ? 'font-semibold text-white' : 'font-medium text-white'}`}>
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                      {cargoPackagingError && (
                        <p className="text-sm text-white font-medium flex items-center gap-1 mt-1">
                          <span className="inline-block w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                          Выберите тип упаковки груза
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {calculatorStep === 2 && transportType === "Продукты питания" && (
            <>
              {/* ШАГ 2: Продукты питания */}
              <div className="space-y-2">
                {!showFinalPrice && (
                  <>
                    {/* ПОДШАГ 1: Тип фургона */}
                    {foodDeliverySubStep === 1 && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-white">Тип фургона</Label>
                          <div 
                            className={`grid grid-cols-1 gap-1.5 rounded-lg p-2 -m-2 transition-all ${
                              truckTypeError 
                                ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20' 
                                : ''
                            }`}
                          >
                            {[
                              { value: 'tented', label: 'Тентованный' },
                              { value: 'isoterm', label: 'Изотерм' },
                              { value: 'refrigerator', label: 'Рефрижератор' }
                            ].map((option) => (
                              <div
                                key={option.value}
                                className={`py-2 px-2.5 rounded-lg border-2 transition-all ${
                                  truckType === option.value
                                    ? 'border-white bg-white/10 shadow-sm'
                                    : 'border-white/30 hover:border-white/60 hover:bg-white/10'
                                }`}
                              >
                                <label className="flex items-center cursor-pointer flex-shrink-0">
                                  <input
                                    type="radio"
                                    name="truck-type"
                                    value={option.value}
                                    checked={truckType === option.value}
                                    onChange={(e) => {
                                      setTruckType(e.target.value);
                                      if (truckTypeError) setTruckTypeError(false);
                                      // Автоматический переход отменен - пользователь переходит сам
                                    }}
                                    className="w-4 h-4 text-white focus:ring-white focus:ring-2"
                                  />
                                  <span className={`ml-3 text-sm ${truckType === option.value ? 'font-semibold text-white' : 'font-medium text-white'}`}>
                                    {option.label}
                                  </span>
                                </label>
                                {/* Температурный режим для рефрижератора - inline */}
                                {truckType === 'refrigerator' && option.value === 'refrigerator' && (
                                  <div className="mt-2">
                                    <div 
                                      className={`rounded-lg transition-all ${
                                        temperatureModeError 
                                          ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20' 
                                          : ''
                                      }`}
                                    >
                                      <Input
                                        id="temperatureMode"
                                        type="text"
                                        placeholder="Температурный режим, например: -18 или +2...+6"
                                        value={temperatureMode}
                                        onChange={(e) => {
                                          setTemperatureMode(e.target.value);
                                          if (temperatureModeError) setTemperatureModeError(false);
                                        }}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                    {temperatureModeError && (
                                      <p className="text-sm text-white font-medium flex items-center gap-1 mt-1">
                                        <span className="inline-block w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                                        Укажите температурный режим для рефрижератора
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          {truckTypeError && (
                            <p className="text-sm text-white font-medium flex items-center gap-1 mt-1">
                              <span className="inline-block w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                              Выберите тип фургона
                            </p>
                          )}
                        </div>

                        {/* Кнопки подшага 1 */}
                        <div className="flex gap-2 pt-3" style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                          <Button 
                            variant="outline"
                            className="w-1/3 h-9" 
                            onClick={() => {
                              setCalculatorStep(1);
                              setShowFinalPrice(false);
                              setFoodDeliverySubStep(1);
                            }}
                          >
                            Назад
                          </Button>
                          <Button 
                            className="w-2/3 h-9" 
                            variant={!truckType ? "outline" : "default"}
                            type="button"
                            style={!truckType ? {backgroundColor: '#8599AE', borderColor: '#8599AE'} : {backgroundColor: '#FFFFFF', color: '#405b9a'}}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              
                              if (!truckType || truckType === "") {
                                setTruckTypeError(true);
                                return;
                              }
                              
                              // Проверяем температурный режим для рефрижератора
                              if (truckType === "refrigerator" && (!temperatureMode || temperatureMode.trim() === "")) {
                                setTemperatureModeError(true);
                                return;
                              }
                              
                              setFoodDeliverySubStep(2);
                              scrollToForm();
                            }}
                          >
                            Продолжить расчёт
                          </Button>
                        </div>
                      </>
                    )}

                    {/* ПОДШАГ 2: Как упакован груз */}
                    {foodDeliverySubStep === 2 && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-white">Как упакован груз?</Label>
                          <div 
                            className={`grid grid-cols-1 gap-1.5 rounded-lg p-2 -m-2 transition-all ${
                              foodPackagingError 
                                ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20' 
                                : ''
                            }`}
                          >
                            {/* На палетах - с inline полем */}
                            <div
                              className={`py-2 px-2.5 rounded-lg border-2 transition-all ${
                                foodPackaging === 'pallets'
                                  ? 'border-white bg-white/10 shadow-sm'
                                  : 'border-white/30 hover:border-white/60 hover:bg-white/10'
                              }`}
                            >
                              <label className="flex items-center cursor-pointer flex-shrink-0 mb-2">
                                <input
                                  type="radio"
                                  name="food-packaging"
                                  value="pallets"
                                  checked={foodPackaging === 'pallets'}
                                  onChange={(e) => {
                                    setFoodPackaging(e.target.value);
                                    if (foodPackagingError) setFoodPackagingError(false);
                                  }}
                                  className="w-4 h-4 text-white focus:ring-white focus:ring-2"
                                />
                                <span className={`ml-3 text-sm ${foodPackaging === 'pallets' ? 'font-semibold text-white' : 'font-medium text-white'}`}>
                                  На палетах
                                </span>
                              </label>
                              {foodPackaging === 'pallets' && (
                                <div className="flex gap-2">
                                  <div className="flex-1">
                                    <div 
                                      className={`rounded-lg transition-all ${
                                        foodPalletCountError 
                                          ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20' 
                                          : ''
                                      }`}
                                    >
                                      <Input
                                        id="foodPalletCount"
                                        type="number"
                                        placeholder="Количество палет"
                                        value={foodPalletCount}
                                        onChange={(e) => {
                                          setFoodPalletCount(e.target.value);
                                          if (foodPalletCountError) setFoodPalletCountError(false);
                                        }}
                                        className="h-8 text-sm"
                                        min="1"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div 
                                      className={`rounded-lg transition-all ${
                                        foodPalletWeightPerKgError 
                                          ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20' 
                                          : ''
                                      }`}
                                    >
                                      <Input
                                        type="number"
                                        placeholder="Вес палеты (кг)"
                                        value={foodPalletWeightPerKg}
                                        onChange={(e) => {
                                          setFoodPalletWeightPerKg(e.target.value);
                                          if (foodPalletWeightPerKgError) setFoodPalletWeightPerKgError(false);
                                        }}
                                        className="h-8 text-sm"
                                        min="1"
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Остальные варианты */}
                            {[
                              { value: 'boxes', label: 'В коробках' },
                              { value: 'individual', label: 'Индивидуальная упаковка' },
                              { value: 'bulk', label: 'Навалом (без упаковки)' },
                              { value: 'loose', label: 'Россыпью' }
                            ].map((option) => (
                              <label
                                key={option.value}
                                className={`flex items-center py-2 px-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                                  foodPackaging === option.value
                                    ? 'border-white bg-white/10 shadow-sm'
                                    : 'border-white/30 hover:border-white/60 hover:bg-white/10'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="food-packaging"
                                  value={option.value}
                                  checked={foodPackaging === option.value}
                                  onChange={(e) => {
                                    setFoodPackaging(e.target.value);
                                    if (foodPackagingError) setFoodPackagingError(false);
                                  }}
                                  className="w-4 h-4 text-white focus:ring-white focus:ring-2"
                                />
                                <span className={`ml-3 text-sm ${foodPackaging === option.value ? 'font-semibold text-white' : 'font-medium text-white'}`}>
                                  {option.label}
                                </span>
                              </label>
                            ))}
                          </div>
                          {foodPackagingError && (
                            <p className="text-sm text-white font-medium flex items-center gap-1 mt-1">
                              <span className="inline-block w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                              Выберите тип упаковки груза
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {calculatorStep === 2 && transportType === "Другое" && (
            <>
              {/* ШАГ 2: Другое */}
              <div className="space-y-2">
                {!showFinalPrice && (
                  <>
                    {/* Характер груза */}
                    <div className="space-y-2">
                      <Label htmlFor="otherNature" className="text-sm font-bold text-white">Характер груза</Label>
                      <div 
                        className={`rounded-lg transition-all ${
                          otherNatureError 
                            ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20' 
                            : ''
                        }`}
                      >
                        <Input
                          id="otherNature"
                          type="text"
                          placeholder="Опишите ваш груз"
                          value={otherNature}
                          onChange={(e) => {
                            setOtherNature(e.target.value);
                            if (otherNatureError) setOtherNatureError(false);
                          }}
                          className="h-9"
                        />
                      </div>
                      {otherNatureError && (
                        <p className="text-sm text-white font-medium flex items-center gap-1 mt-1">
                          <span className="inline-block w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                          Укажите характер груза
                        </p>
                      )}
                    </div>

                    {/* Как упакован груз */}
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-white">Как упакован груз?</Label>
                      <div 
                        className={`grid grid-cols-1 gap-1.5 rounded-lg p-2 -m-2 transition-all ${
                          otherPackagingError 
                            ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20' 
                            : ''
                        }`}
                      >
                        {/* На палетах - с inline полем */}
                        <div
                          className={`py-2 px-2.5 rounded-lg border-2 transition-all ${
                            otherPackaging === 'pallets'
                              ? 'border-white bg-white/10 shadow-sm'
                              : 'border-white/30 hover:border-white/60 hover:bg-white/10'
                          }`}
                        >
                          <label className="flex items-center cursor-pointer flex-shrink-0 mb-2">
                            <input
                              type="radio"
                              name="other-packaging"
                              value="pallets"
                              checked={otherPackaging === 'pallets'}
                              onChange={(e) => {
                                setOtherPackaging(e.target.value);
                                if (otherPackagingError) setOtherPackagingError(false);
                              }}
                              className="w-4 h-4 text-white focus:ring-white focus:ring-2"
                            />
                            <span className={`ml-3 text-sm ${otherPackaging === 'pallets' ? 'font-semibold text-white' : 'font-medium text-white'}`}>
                              На палетах
                            </span>
                          </label>
                          {otherPackaging === 'pallets' && (
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <div 
                                  className={`rounded-lg transition-all ${
                                    otherPalletCountError 
                                      ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20' 
                                      : ''
                                  }`}
                                >
                                  <Input
                                    id="otherPalletCount"
                                    type="number"
                                    placeholder="Количество палет"
                                    value={otherPalletCount}
                                    onChange={(e) => {
                                      setOtherPalletCount(e.target.value);
                                      if (otherPalletCountError) setOtherPalletCountError(false);
                                    }}
                                    className="h-8 text-sm"
                                    min="1"
                                  />
                                </div>
                              </div>
                              <div className="flex-1">
                                <div 
                                  className={`rounded-lg transition-all ${
                                    otherPalletWeightPerKgError 
                                      ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20' 
                                      : ''
                                  }`}
                                >
                                  <Input
                                    type="number"
                                    placeholder="Вес палеты (кг)"
                                    value={otherPalletWeightPerKg}
                                    onChange={(e) => {
                                      setOtherPalletWeightPerKg(e.target.value);
                                      if (otherPalletWeightPerKgError) setOtherPalletWeightPerKgError(false);
                                    }}
                                    className="h-8 text-sm"
                                    min="1"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Остальные варианты */}
                        {[
                          { value: 'individual', label: 'Индивидуальная упаковка' },
                          { value: 'bulk', label: 'Навалом (без упаковки)' },
                          { value: 'loose', label: 'Россыпью' }
                        ].map((option) => (
                          <label
                            key={option.value}
                            className={`flex items-center py-2 px-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                              otherPackaging === option.value
                                ? 'border-white bg-white/10 shadow-sm'
                                : 'border-white/30 hover:border-white/60 hover:bg-white/10'
                            }`}
                          >
                            <input
                              type="radio"
                              name="other-packaging"
                              value={option.value}
                              checked={otherPackaging === option.value}
                              onChange={(e) => {
                                setOtherPackaging(e.target.value);
                                if (otherPackagingError) setOtherPackagingError(false);
                              }}
                              className="w-4 h-4 text-white focus:ring-white focus:ring-2"
                            />
                            <span className={`ml-3 text-sm ${otherPackaging === option.value ? 'font-semibold text-white' : 'font-medium text-white'}`}>
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                      {otherPackagingError && (
                        <p className="text-sm text-white font-medium flex items-center gap-1 mt-1">
                          <span className="inline-block w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                          Выберите тип упаковки груза
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}


          {/* БЛОК: Кнопки для случая "На палетах" с заполненными полями */}
          {calculatorStep === 2 &&
            transportType !== "Домашний переезд" &&
            !showFinalPrice &&
            (
              (transportType === "Промышленные товары" && cargoPackaging === "pallets" && palletCount && palletWeightPerKg) ||
              (transportType === "Продукты питания" && foodDeliverySubStep === 2 && foodPackaging === "pallets" && foodPalletCount && foodPalletWeightPerKg) ||
              (transportType === "Другое" && otherPackaging === "pallets" && otherPalletCount && otherPalletWeightPerKg)
            ) && (
            <>
              {/* Кнопки: Назад и Получить расчёт */}
              <div className="flex gap-2 pt-3" style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                <Button 
                  variant="outline"
                  className="w-1/3 h-9" 
                  onClick={() => {
                    if (transportType === "Продукты питания") {
                      setFoodDeliverySubStep(1);
                    } else {
                      setCalculatorStep(1);
                      setShowFinalPrice(false);
                    }
                  }}
                >
                  Назад
                </Button>
                <Button 
                  className="w-2/3 h-9" 
                  type="button"
                  style={{backgroundColor: '#FFFFFF', color: '#405b9a'}}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Валидация для разных типов перевозки
                    let hasErrors = false;
                    
                    // Проверяем обязательные поля в зависимости от типа перевозки
                    if (transportType === "Промышленные товары") {
                      if (!cargoNature || cargoNature.trim() === "") {
                        setCargoNatureError(true);
                        hasErrors = true;
                      }
                      if (!cargoPackaging || cargoPackaging === "") {
                        setCargoPackagingError(true);
                        hasErrors = true;
                      }
                      if (!palletCount || palletCount.trim() === "") {
                        setPalletCountError(true);
                        hasErrors = true;
                      }
                      if (!palletWeightPerKg || palletWeightPerKg.trim() === "") {
                        setPalletWeightPerKgError(true);
                        hasErrors = true;
                      }
                    } else if (transportType === "Продукты питания") {
                      if (!truckType || truckType === "") {
                        setTruckTypeError(true);
                        hasErrors = true;
                      }
                      if (!foodPackaging || foodPackaging === "") {
                        setFoodPackagingError(true);
                        hasErrors = true;
                      }
                      if (!foodPalletCount || foodPalletCount.trim() === "") {
                        setFoodPalletCountError(true);
                        hasErrors = true;
                      }
                      if (!foodPalletWeightPerKg || foodPalletWeightPerKg.trim() === "") {
                        setFoodPalletWeightPerKgError(true);
                        hasErrors = true;
                      }
                    } else if (transportType === "Другое") {
                      if (!otherNature || otherNature.trim() === "") {
                        setOtherNatureError(true);
                        hasErrors = true;
                      }
                      if (!otherPackaging || otherPackaging === "") {
                        setOtherPackagingError(true);
                        hasErrors = true;
                      }
                      if (!otherPalletCount || otherPalletCount.trim() === "") {
                        setOtherPalletCountError(true);
                        hasErrors = true;
                      }
                      if (!otherPalletWeightPerKg || otherPalletWeightPerKg.trim() === "") {
                        setOtherPalletWeightPerKgError(true);
                        hasErrors = true;
                      }
                    }
                    
                    if (hasErrors) {
                      return;
                    }

                    // Выполняем расчет стоимости
                    const weight = weightSteps[weightIndex];
                    const volume = volumeSteps[volumeIndex];
                    
                    const result = calculateShippingCost(
                      fromCity,
                      toCity,
                      routeDistance!,
                      weight,
                      volume,
                      transportType,
                      routeData.fromCoordinates,
                      routeData.toCoordinates
                    );
                    
                    if (result && result.cost) {
                      // Применяем коэффициент для рефрижератора
                      let finalCost = result.cost;
                      if (transportType === "Продукты питания" && truckType === "refrigerator") {
                        finalCost = Math.round(finalCost * REFRIGERATOR_COEFFICIENT);
                      }
                      
                      // Применяем минимум 7500 рублей для всех типов перевозок
                      finalCost = Math.max(finalCost, 7500);
                      
                      setEstimatedCost(finalCost);
                      setShowFinalPrice(true);
                      setShowContactForm(false); // Закрываем форму, чтобы показать кнопку
                      
                      // Скроллим к началу формы
                      scrollToForm();
                    }
                  }}
                >
                  Получить расчёт
                </Button>
              </div>
            </>
          )}

          {/* ОБЩИЙ БЛОК: Слайдеры веса и объема для не-домашних перевозок (когда НЕ палеты) */}
          {calculatorStep === 2 &&
            transportType !== "Домашний переезд" &&
            !showFinalPrice &&
            (
              (transportType === "Промышленные товары" && cargoPackaging !== "" && cargoPackaging !== "pallets") ||
              (transportType === "Продукты питания" && foodDeliverySubStep === 2 && foodPackaging !== "" && foodPackaging !== "pallets") ||
              (transportType === "Другое" && otherPackaging !== "" && otherPackaging !== "pallets")
            ) && (
            <>
              <div className="space-y-2 pt-2">
                {/* Слайдер объёма */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-white">Предположительный объём: {volumeSteps[volumeIndex]} м³</Label>
                  <div
                    className={`rounded-lg p-2 -m-2 transition-all ${
                      volumeError ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20' : ''
                    }`}
                  >
                    <Slider
                      value={[volumeIndex]}
                      onValueChange={(value) => {
                        setVolumeIndex(value[0]);
                        if (volumeError) setVolumeError(false);
                      }}
                      min={0}
                      max={volumeSteps.length - 1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  {volumeError && (
                    <p className="text-sm text-white font-medium flex items-center gap-1 mt-1">
                      <span className="inline-block w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                      Укажите примерный объем груза
                    </p>
                  )}
                </div>

                {/* Слайдер веса */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-white">
                    Предположительный вес: {weightSteps[weightIndex] >= 1000 ? `${(weightSteps[weightIndex] / 1000).toFixed(1)} т` : `${weightSteps[weightIndex]} кг`}
                  </Label>
                  <div
                    className={`rounded-lg p-2 -m-2 transition-all ${
                      weightError ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20' : ''
                    }`}
                  >
                    <Slider
                      value={[weightIndex]}
                      onValueChange={(value) => {
                        setWeightIndex(value[0]);
                        if (weightError) setWeightError(false);
                      }}
                      min={0}
                      max={weightSteps.length - 1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  {weightError && (
                    <p className="text-sm text-white font-medium flex items-center gap-1 mt-1">
                      <span className="inline-block w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                      Укажите примерный вес груза
                    </p>
                  )}
                </div>
              </div>

              {/* Кнопки: Назад и Получить расчёт */}
              <div className="flex gap-2 pt-3" style={{ paddingLeft: '15px', paddingRight: '15px' }}>
                <Button 
                  variant="outline"
                  className="w-1/3 h-9" 
                  onClick={() => {
                    if (transportType === "Продукты питания") {
                      setFoodDeliverySubStep(1);
                    } else {
                      setCalculatorStep(1);
                      setShowFinalPrice(false);
                    }
                  }}
                >
                  Назад
                </Button>
                <Button 
                  className="w-2/3 h-9" 
                  variant={volumeIndex === 0 ? "outline" : "default"}
                  type="button"
                  style={volumeIndex === 0 ? {backgroundColor: '#8599AE', borderColor: '#8599AE'} : {backgroundColor: '#FFFFFF', color: '#405b9a'}}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Валидация для разных типов перевозки
                    let hasErrors = false;
                    
                    // Проверяем обязательные поля в зависимости от типа перевозки
                    if (transportType === "Промышленные товары") {
                      if (!cargoNature || cargoNature.trim() === "") {
                        setCargoNatureError(true);
                        hasErrors = true;
                      }
                      if (!cargoPackaging || cargoPackaging === "") {
                        setCargoPackagingError(true);
                        hasErrors = true;
                      }
                    } else if (transportType === "Продукты питания") {
                      if (!truckType || truckType === "") {
                        setTruckTypeError(true);
                        hasErrors = true;
                      }
                      if (!foodPackaging || foodPackaging === "") {
                        setFoodPackagingError(true);
                        hasErrors = true;
                      }
                    } else if (transportType === "Другое") {
                      if (!otherNature || otherNature.trim() === "") {
                        setOtherNatureError(true);
                        hasErrors = true;
                      }
                      if (!otherPackaging || otherPackaging === "") {
                        setOtherPackagingError(true);
                        hasErrors = true;
                      }
                    }
                    
                    // Проверяем объем груза
                    if (volumeIndex === 0) {
                      setVolumeError(true);
                      hasErrors = true;
                    }
                    
                    if (hasErrors) {
                      return;
                    }

                    // Выполняем расчет стоимости
                    const weight = weightSteps[weightIndex];
                    const volume = volumeSteps[volumeIndex];
                    
                    const result = calculateShippingCost(
                      fromCity,
                      toCity,
                      routeDistance!,
                      weight,
                      volume,
                      transportType,
                      routeData.fromCoordinates,
                      routeData.toCoordinates
                    );
                    
                    if (result && result.cost) {
                      let finalCost = result.cost;
                      
                      // Применяем коэффициент для рефрижератора
                      if (transportType === "Продукты питания" && truckType === "refrigerator") {
                        finalCost = Math.round(finalCost * REFRIGERATOR_COEFFICIENT);
                      }
                      
                      // Применяем минимум 7500 рублей для всех типов перевозок
                      finalCost = Math.max(finalCost, 7500);
                      
                      setEstimatedCost(finalCost);
                      setShowFinalPrice(true);
                      setShowContactForm(false); // Закрываем форму, чтобы показать кнопку
                      
                      // Скроллим к началу формы
                      scrollToForm();
                    }
                  }}
                >
                  Получить расчёт
                </Button>
              </div>
            </>
          )}

          <MovingConstructor
            isOpen={isConstructorOpen}
            onClose={() => setIsConstructorOpen(false)}
            onApply={handleConstructorApplyFactory(
              setIsConstructorOpen,
              setVolumeIndex,
              setConstructorItems,
              setConstructorFloorUtilization,
              setConstructorRecommendedTruck,
              setShowFinalPrice,
              volumeSteps
            )}
            initialVolume={volumeSteps[volumeIndex]}
          />
        </div>
      </div>

      {/* Кнопки управления вне основного блока формы */}
      {calculatorStep === 2 && showFinalPrice && (
        <div className="flex gap-2" style={{ marginTop: '30px' }}>
          <Button 
            className="w-1/2 h-10 bg-blue-100 border border-blue-300 hover:bg-blue-200 text-blue-900 font-semibold shadow-sm" 
            onClick={() => {
              setShowFinalPrice(false);
              setShowContactForm(false);
              setUserContact("");
              if (transportType === "Домашний переезд") {
                setConstructorItems(undefined);
                setConstructorFloorUtilization(undefined);
                setConstructorRecommendedTruck(undefined);
              }
            }}
          >
            Изменить параметры
          </Button>
          <Button 
            className="w-1/2 h-10 bg-blue-100 border border-blue-300 hover:bg-blue-200 text-blue-900 font-semibold shadow-sm"
            onClick={() => {
              setCalculatorStep(1);
              setShowFinalPrice(false);
              setShowContactForm(false);
              setUserContact("");
              setTransportType("");
              
              // Сбрасываем для Домашнего переезда
              setMovingItems({
                boxes: false,
                furniture: false,
                appliances: false,
              });
              setVolumeIndex(0);
              setBoxesCount("");
              setFurnitureDetails("");
              setAppliancesDetails("");
              setConstructorItems(undefined);
              setConstructorFloorUtilization(undefined);
              setConstructorRecommendedTruck(undefined);
              
              // Сбрасываем состояния для всех остальных типов перевозки
              setCargoPackaging("");
              setCargoNature("");
              setPalletCount("");
              setPalletWeightPerKg("");
              setFoodPackaging("");
              setFoodPalletCount("");
              setFoodPalletWeightPerKg("");
              setTruckType("");
              setTemperatureMode("");
              setFoodDeliverySubStep(1);
              setOtherPackaging("");
              setOtherPalletCount("");
              setOtherPalletWeightPerKg("");
              setOtherNature("");
              setWeightIndex(0);
            }}
          >
            Новый расчёт
          </Button>
        </div>
      )}
    </div>
  );
};

export default ShippingCalculatorForm;

