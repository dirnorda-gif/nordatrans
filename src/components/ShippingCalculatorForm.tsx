import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calculator, Phone, MessageCircle, Truck, Download, Package, Home, ShoppingCart, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { calculateShippingCost, formatTruckCapacity } from "@/utils/shippingCalculator";
import { createBitrix24Lead } from "@/utils/bitrix24";
import { toast } from "sonner";

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
  
  // Ref для сохранения позиции скролла перед изменением шага
  const scrollPositionRef = useRef<number>(0);
  
  // 🎯 State для валидации полей адреса
  const [fromFieldError, setFromFieldError] = useState(false);
  const [toFieldError, setToFieldError] = useState(false);
  const [transportTypeError, setTransportTypeError] = useState(false);
  
  // 🎯 State для валидации полей второго шага - Домашний переезд
  const [movingItemsError, setMovingItemsError] = useState(false);
  const [volumeError, setVolumeError] = useState(false);
  
  // 🎯 State для валидации полей второго шага - Промышленные товары
  const [cargoPackagingError, setCargoPackagingError] = useState(false);
  const [cargoNatureError, setCargoNatureError] = useState(false);
  const [palletCountError, setPalletCountError] = useState(false);
  const [cannotSpecifyVolume, setCannotSpecifyVolume] = useState(false);
  
  // 🎯 State для валидации полей второго шага - Продукты питания
  const [truckTypeError, setTruckTypeError] = useState(false);
  const [foodPackagingError, setFoodPackagingError] = useState(false);
  const [foodPalletCountError, setFoodPalletCountError] = useState(false);
  const [cannotSpecifyVolumeFood, setCannotSpecifyVolumeFood] = useState(false);
  
  // 🎯 State для валидации полей второго шага - Другое
  const [otherPackagingError, setOtherPackagingError] = useState(false);
  const [otherPalletCountError, setOtherPalletCountError] = useState(false);
  const [otherNatureError, setOtherNatureError] = useState(false);
  const [cannotSpecifyVolumeOther, setCannotSpecifyVolumeOther] = useState(false);
  
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
      return [200, 300, 500, 700, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000]; // в кг
    } else {
      // Для КОМПАНИЙ (все остальные типы перевозки)
      return [200, 300, 500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000]; // в кг
    }
  }, [transportType]);

  const volumeSteps = useMemo(() => {
    if (transportType === "Домашний переезд") {
      // Для ЧАСТНЫХ ЛИЦ (Домашний переезд) - от 0 до 82 м³ с шагом 1
      return Array.from({length: 83}, (_, i) => i); // [0, 1, 2, 3, ... 82] в м³
    } else {
      // Для КОМПАНИЙ (все остальные типы перевозки) - от 1 до 82 м³ с шагом 1
      return Array.from({length: 82}, (_, i) => i + 1); // [1, 2, 3, ... 82] в м³
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

      // Фильтруем только объекты из России
      const filteredObjects = geoObjects.filter((item: any) => {
        const address = item.GeoObject.metaDataProperty.GeocoderMetaData.Address;
        const countryCode = address?.country_code;
        return countryCode === "RU";
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

  // Информация о типах машин по объёму
  const getTruckInfoByVolume = (volume: number) => {
    if (volume <= 3) return { name: "Газель", capacity: "до 1,5 т", volumeCapacity: "до 9 м³", dimensions: "Д: 3м × Ш: 2м × В: 1,8м", description: "Идеально для небольших переездов" };
    if (volume <= 9) return { name: "Газель (удлинённая)", capacity: "до 1,5 т", volumeCapacity: "до 9 м³", dimensions: "Д: 4,2м × Ш: 2м × В: 2,2м", description: "Для переезда 1-2 комнатной квартиры" };
    if (volume <= 15) return { name: "Бортовая 3 т", capacity: "до 3 т", volumeCapacity: "до 15 м³", dimensions: "Д: 4,2м × Ш: 2,1м × В: 2,2м", description: "Для переезда 2-3 комнатной квартиры" };
    if (volume <= 30) return { name: "Фура 5 т", capacity: "до 5 т", volumeCapacity: "до 30 м³", dimensions: "Д: 6м × Ш: 2,4м × В: 2,4м", description: "Для большого переезда или офиса" };
    if (volume <= 45) return { name: "Фура 10 т", capacity: "до 10 т", volumeCapacity: "до 45 м³", dimensions: "Д: 8м × Ш: 2,4м × В: 2,5м", description: "Для крупногабаритных грузов" };
    return { name: "Фура 20 т", capacity: "до 20 т", volumeCapacity: "до 82 м³", dimensions: "Д: 13,6м × Ш: 2,45м × В: 2,7м", description: "Для больших объёмов груза" };
  };

  // Функция скачивания расчёта
  const downloadCalculation = () => {
    // Определяем, активен ли чекбокс "Не могу указать объем" для текущего типа груза
    const volumeNotSpecified = cannotSpecifyVolume || cannotSpecifyVolumeFood || cannotSpecifyVolumeOther;
    const volumeText = volumeNotSpecified ? "Не смог указать" : `${volumeSteps[volumeIndex]} м³`;
    
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
   ${volumeNotSpecified ? 'Будет определён менеджером' : getTruckInfoByVolume(volumeSteps[volumeIndex]).name}
   Грузоподъёмность: ${volumeNotSpecified ? 'Уточняется' : getTruckInfoByVolume(volumeSteps[volumeIndex]).capacity}
   Объём кузова: ${volumeNotSpecified ? 'Уточняется' : getTruckInfoByVolume(volumeSteps[volumeIndex]).volumeCapacity}
   Размеры: ${volumeNotSpecified ? 'Уточняются' : getTruckInfoByVolume(volumeSteps[volumeIndex]).dimensions}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 ПРИМЕРНАЯ СТОИМОСТЬ: ${estimatedCost.toLocaleString()} ₽

⚠️  ВАЖНО: Это предварительный расчёт на основе указанных данных.
    Для получения точной стоимости с учётом всех деталей
    свяжитесь с нашим менеджером.

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
      toast.error("Пожалуйста, укажите номер телефона или WhatsApp");
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
    // Определяем, активен ли чекбокс "Не могу указать объем"
    const volumeNotSpecified = cannotSpecifyVolume || cannotSpecifyVolumeFood || cannotSpecifyVolumeOther;
    const volumeForCalculation = volumeNotSpecified ? 0 : volumeSteps[volumeIndex];
    const volumeForDisplay = volumeNotSpecified ? "Не смог указать" : volumeSteps[volumeIndex];
    
    // 🆕 Передаем категорию груза для новой коммерческой логики
    const calculationResult = calculateShippingCost(fromCity, toCity, routeDistance, weightSteps[weightIndex], volumeForCalculation, transportType);
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
        movingItems: transportType === "Домашний переезд" ? movingItems : undefined,
        boxesCount: transportType === "Домашний переезд" && boxesCount ? boxesCount : undefined,
        furnitureDetails: transportType === "Домашний переезд" && furnitureDetails ? furnitureDetails : undefined,
        appliancesDetails: transportType === "Домашний переезд" && appliancesDetails ? appliancesDetails : undefined,
        cargoPackaging: transportType === "Промышленные товары" && cargoPackaging ? cargoPackaging : undefined,
        palletCount: transportType === "Промышленные товары" && palletCount ? palletCount : undefined,
        cargoNature: transportType === "Промышленные товары" && cargoNature ? cargoNature : undefined,
        truckType: transportType === "Продукты питания" && truckType ? truckType : undefined,
        temperatureMode: transportType === "Продукты питания" && temperatureMode ? temperatureMode : undefined,
        foodPackaging: transportType === "Продукты питания" && foodPackaging ? foodPackaging : undefined,
        foodPalletCount: transportType === "Продукты питания" && foodPalletCount ? foodPalletCount : undefined,
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
        setTimeout(() => navigate('/thanks'), 2000);
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
      setVolumeIndex(0);
    }
  }, [transportType]);

  // Автоматическое определение веса для домашнего переезда
  useEffect(() => {
    if (transportType === "Домашний переезд") {
      const volume = volumeSteps[volumeIndex];
      // Для частных лиц используем более точные шаги веса
      if (volume <= 3) setWeightIndex(1); // 300 кг
      else if (volume <= 9) setWeightIndex(3); // 700 кг
      else if (volume <= 15) setWeightIndex(5); // 2 т
      else if (volume <= 30) setWeightIndex(7); // 4 т
      else if (volume <= 45) setWeightIndex(10); // 7 т
      else setWeightIndex(15); // 12 т
    }
  }, [volumeIndex, transportType]);

  // Автоматическое определение объёма для палет (промышленные товары)
  useEffect(() => {
    if (transportType === "Промышленные товары" && cargoPackaging === "pallets" && palletCount) {
      const pallets = parseInt(palletCount);
      if (isNaN(pallets) || pallets <= 0) return;
      if (pallets <= 2) { setVolumeIndex(2); setWeightIndex(2); }
      else if (pallets <= 4) { setVolumeIndex(3); setWeightIndex(3); }
      else if (pallets <= 6) { setVolumeIndex(4); setWeightIndex(4); }
      else if (pallets <= 10) { setVolumeIndex(5); setWeightIndex(5); }
      else if (pallets <= 17) { setVolumeIndex(6); setWeightIndex(6); }
      else { setVolumeIndex(7); setWeightIndex(7); }
    }
  }, [palletCount, transportType, cargoPackaging]);

  // Автоматическое определение объёма для палет (продукты питания)
  useEffect(() => {
    if (transportType === "Продукты питания" && foodPackaging === "pallets" && foodPalletCount) {
      const pallets = parseInt(foodPalletCount);
      if (isNaN(pallets) || pallets <= 0) return;
      if (pallets <= 2) { setVolumeIndex(2); setWeightIndex(2); }
      else if (pallets <= 4) { setVolumeIndex(3); setWeightIndex(3); }
      else if (pallets <= 6) { setVolumeIndex(4); setWeightIndex(4); }
      else if (pallets <= 10) { setVolumeIndex(5); setWeightIndex(5); }
      else if (pallets <= 17) { setVolumeIndex(6); setWeightIndex(6); }
      else { setVolumeIndex(7); setWeightIndex(7); }
    }
  }, [foodPalletCount, transportType, foodPackaging]);

  // Автоматическое определение объёма для палет (другое)
  useEffect(() => {
    if (transportType === "Другое" && otherPackaging === "pallets" && otherPalletCount) {
      const pallets = parseInt(otherPalletCount);
      if (isNaN(pallets) || pallets <= 0) return;
      if (pallets <= 2) { setVolumeIndex(2); setWeightIndex(2); }
      else if (pallets <= 4) { setVolumeIndex(3); setWeightIndex(3); }
      else if (pallets <= 6) { setVolumeIndex(4); setWeightIndex(4); }
      else if (pallets <= 10) { setVolumeIndex(5); setWeightIndex(5); }
      else if (pallets <= 17) { setVolumeIndex(6); setWeightIndex(6); }
      else { setVolumeIndex(7); setWeightIndex(7); }
    }
  }, [otherPalletCount, transportType, otherPackaging]);

  // Предотвращаем автоматический скролл при изменении шага калькулятора
  useEffect(() => {
    // Сохраняем текущую позицию перед любым изменением
    scrollPositionRef.current = window.pageYOffset;
    
    // Используем requestAnimationFrame чтобы дождаться обновления DOM, затем восстанавливаем позицию
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollPositionRef.current, behavior: 'auto' });
      });
    });
  }, [calculatorStep, showFinalPrice]);

  return (
    <div className="space-y-4">
      <div className="bg-[#f0f3f5] rounded-lg p-3 border border-border shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">Расчет стоимости перевозки</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${calculatorStep === 1 ? 'bg-primary text-white' : 'bg-primary/20 text-primary'}`}>
              1
            </div>
            <div className={`w-10 h-0.5 ${calculatorStep === 2 ? 'bg-primary' : 'bg-primary/20'}`}></div>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${calculatorStep === 2 ? 'bg-primary text-white' : 'bg-primary/20 text-primary'}`}>
              2
            </div>
          </div>
        </div>
        
        {/* Estimated Cost Display */}
        {/* ШАГ 1: Показываем заглушку с 0 рублей */}
        {calculatorStep === 1 && (
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-3 mb-3">
            <div>
              <p className="text-xs font-medium text-center mb-2" style={{color: '#405b9a'}}>
                Предварительная стоимость перевозки
              </p>
              
              <div className="flex items-center justify-center">
                <div className="flex-1 text-center">
                  <p className="text-3xl font-bold text-primary">0 ₽</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ШАГ 2: Показываем финальную стоимость только после нажатия кнопки */}
        {calculatorStep === 2 && showFinalPrice && estimatedCost > 0 && (
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-lg p-3 mb-3 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
            <div>
              {/* Верхняя часть - скрывается на мобильных при открытии формы */}
              <div className={`${showContactForm ? 'hidden md:block' : 'block'}`}>
                <p className="text-xs text-center mb-1 text-muted-foreground">
                  ⚠️ Примерная стоимость вашей перевозки
                </p>
                
                {/* Расстояние, цена и срок в одну строку */}
                <div className="flex items-center justify-between gap-3 mb-2">
                  {/* Расстояние слева */}
                  <div className="flex items-center gap-1.5 min-w-[70px]">
                    {routeDistance && routeDistance > 0 && (
                      <>
                        <Truck className="w-3.5 h-3.5 text-primary" />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-foreground leading-tight">
                            {routeDistance.toLocaleString()} км
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Цена по центру */}
                  <div className="flex-1 text-center">
                    <p className="text-2xl font-bold text-primary">{estimatedCost.toLocaleString()} ₽</p>
                  </div>
                  
                  {/* Срок доставки справа */}
                  <div className="flex items-center gap-1.5 min-w-[70px] justify-end">
                    {routeDuration && routeDuration > 0 && (
                      <>
                        <div className="flex flex-col text-right">
                          <span className="text-xs font-semibold text-foreground leading-tight">
                            {routeDuration} {routeDuration === 1 ? 'день' : routeDuration < 5 ? 'дня' : 'дней'}
                          </span>
                          <span className="text-[9px] text-muted-foreground">доставка</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Кнопка скачать расчёт */}
                <Button 
                  variant="outline"
                  className="w-full h-8 gap-2 mb-2 text-sm" 
                  onClick={downloadCalculation}
                >
                  <Download className="w-3.5 h-3.5" />
                  Скачать расчёт
                </Button>

                {/* Разделитель */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-primary/20"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gradient-to-br from-primary/10 to-primary/5 px-2 text-muted-foreground">
                      Получить точный расчёт
                    </span>
                  </div>
                </div>

                {/* Блок для получения точного фиксированного расчёта */}
                <div className="text-center mb-3">
                  <h3 className="text-base font-semibold mb-2" style={{color: '#083cb5'}}>
                    🎯 Получить точный фиксированный расчёт от логиста
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Данный расчёт является примерным и не может служить основанием для заключения договора. 
                    Для получения точной стоимости с учётом всех деталей перевозки свяжитесь с нашим менеджером.
                  </p>
                </div>
              </div>

              {/* Нижняя часть - всегда видна */}
              <div className="space-y-3">
                {!showContactForm ? (
                  <Button 
                    className="w-full h-10" 
                    style={{backgroundColor: '#083cb5'}}
                    onClick={() => setShowContactForm(true)}
                  >
                    Связаться с менеджером
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-center text-muted-foreground">
                      ⏱️ Менеджер свяжется с вами в течение 10 минут
                    </p>

                    {/* Выбор способа связи */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={contactMethod === "phone" ? "default" : "outline"}
                        className="h-9"
                        onClick={() => setContactMethod("phone")}
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Звонок
                      </Button>
                      <Button
                        variant={contactMethod === "whatsapp" ? "default" : "outline"}
                        className="h-9"
                        onClick={() => setContactMethod("whatsapp")}
                        style={contactMethod === "whatsapp" ? {backgroundColor: '#25D366'} : {}}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        WhatsApp
                      </Button>
                    </div>

                    {/* Поле ввода контакта */}
                    <div className="space-y-2">
                      <Label htmlFor="userContact" className="text-sm">
                        {contactMethod === "phone" ? "Ваш номер телефона" : "Ваш номер WhatsApp"}
                      </Label>
                      <Input
                        id="userContact"
                        type="tel"
                        placeholder="+7 (999) 999-99-99"
                        value={userContact}
                        onChange={handlePhoneChange}
                        onFocus={(e) => {
                          // При фокусе, если поле пустое, ставим +7
                          if (!e.target.value) {
                            setUserContact('+7 ');
                          }
                        }}
                        className="h-9"
                        autoComplete="tel"
                      />
                    </div>

                    {/* Информация о менеджере - кликабельный блок для звонка */}
                    <a 
                      href={`tel:${managerPhone.replace(/\s/g, '')}`}
                      className="block bg-white/70 rounded-lg p-3 text-xs border border-primary/20 hover:bg-white hover:border-primary/40 transition-all active:scale-98 cursor-pointer"
                    >
                      <p className="font-semibold mb-1">👤 Ваш персональный менеджер:</p>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {managerName} • {managerPhone}
                      </p>
                      <p className="text-[10px] text-primary mt-1">Нажмите, чтобы позвонить</p>
                    </a>

                    {/* Кнопки */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 h-9"
                        onClick={() => {
                          setShowContactForm(false);
                          setUserContact("");
                        }}
                      >
                        Отмена
                      </Button>
                      <Button
                        className="flex-1 h-9"
                        style={{backgroundColor: '#083cb5'}}
                        disabled={!userContact}
                        onClick={handleSubmitCalculation}
                      >
                        Отправить
                      </Button>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="from">Откуда</Label>
                  <div className="relative">
                    <div 
                      className={`rounded-lg transition-all ${
                        fromFieldError 
                          ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20' 
                          : ''
                      }`}
                    >
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground z-10" />
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
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
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
                    <p className="text-sm text-orange-600 font-medium flex items-center gap-1 mt-1">
                      <span className="inline-block w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                      Выберите адрес из выпадающего списка
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="to">Куда</Label>
                  <div className="relative">
                    <div 
                      className={`rounded-lg transition-all ${
                        toFieldError 
                          ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20' 
                          : ''
                      }`}
                    >
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground z-10" />
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
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
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
                    <p className="text-sm text-orange-600 font-medium flex items-center gap-1 mt-1">
                      <span className="inline-block w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                      Выберите адрес из выпадающего списка
                    </p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-bold text-[#083cb5]">Тип перевозки</Label>
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
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/50 hover:bg-primary/5'
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
                        className="w-5 h-5 text-primary focus:ring-primary focus:ring-2"
                      />
                      <span className={`ml-3 text-base ${transportType === type ? 'font-semibold text-primary' : 'font-medium'}`}>
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
                {transportTypeError && (
                  <p className="text-sm text-orange-600 font-medium flex items-center gap-1 mt-1">
                    <span className="inline-block w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                    Выберите тип перевозки
                  </p>
                )}
              </div>
              
              <Button 
                className="w-full" 
                size="lg"
                variant={(!fromCity || !toCity || !transportType) ? "outline" : "default"}
                type="button"
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
                  } else if (!routeData.fromCoordinates) {
                    missingFields.push("• Выберите город отправления из выпадающего списка подсказок");
                    setFromFieldError(true);
                    hasValidationErrors = true;
                  }
                  
                  if (!toCity) {
                    missingFields.push("• Укажите город назначения (Куда)");
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
                    alert("⏳ Расстояние между городами ещё рассчитывается.\n\nПожалуйста, подождите несколько секунд и попробуйте снова.");
                    return;
                  }
                  
                  console.log("✅ Все проверки пройдены, переход на шаг 2");
                  
                  // Сохраняем текущую позицию скролла перед изменением состояния
                  scrollPositionRef.current = window.pageYOffset;
                  
                  setCalculatorStep(2);
                  setShowFinalPrice(false); // Сбрасываем флаг показа цены
                }}
              >
                Продолжить расчёт
              </Button>
            </>
          )}

          {calculatorStep === 2 && transportType === "Домашний переезд" && (
            <>
              {/* ШАГ 2: Домашний переезд */}
              <div className="space-y-2">
                {/* Показываем чекбоксы только если цена ещё не рассчитана */}
                {!showFinalPrice && (
                  <div>
                    <Label className="text-sm font-bold text-[#083cb5] mb-1.5 block">Что планируете перевозить? (опционально)</Label>
                    <div className="space-y-1.5 rounded-lg p-2 -m-2 transition-all">
                      {/* Коробки */}
                      <div className="border-2 border-border rounded-lg py-2 px-2.5 hover:border-primary/50 hover:bg-primary/5 transition-all">
                        <div className="flex items-center gap-2 flex-wrap">
                          <label 
                            htmlFor="boxes"
                            className="flex items-center space-x-2 cursor-pointer flex-shrink-0"
                          >
                            <Checkbox 
                              id="boxes"
                              checked={movingItems.boxes}
                              onCheckedChange={(checked) => {
                                setMovingItems({ ...movingItems, boxes: checked as boolean });
                                if (!checked) setBoxesCount("");
                              }}
                              className="h-4 w-4"
                            />
                            <Package className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">Коробки</span>
                          </label>
                          {movingItems.boxes && (
                            <div className="flex-1 min-w-[200px]">
                              <Input
                                type="number"
                                placeholder="Примерное количество коробок"
                                value={boxesCount}
                                onChange={(e) => setBoxesCount(e.target.value)}
                                className="h-8 text-sm"
                                min="1"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Мебель */}
                      <div className="border-2 border-border rounded-lg py-2 px-2.5 hover:border-primary/50 hover:bg-primary/5 transition-all">
                        <div className="flex items-center gap-2 flex-wrap">
                          <label 
                            htmlFor="furniture"
                            className="flex items-center space-x-2 cursor-pointer flex-shrink-0"
                          >
                            <Checkbox 
                              id="furniture"
                              checked={movingItems.furniture}
                              onCheckedChange={(checked) => {
                                setMovingItems({ ...movingItems, furniture: checked as boolean });
                                if (!checked) setFurnitureDetails("");
                              }}
                              className="h-4 w-4"
                            />
                            <Home className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">Мебель</span>
                          </label>
                          {movingItems.furniture && (
                            <div className="flex-1 min-w-[200px]">
                              <Input
                                type="text"
                                placeholder="Укажите только крупногабаритное: диван, шкаф, кровать..."
                                value={furnitureDetails}
                                onChange={(e) => setFurnitureDetails(e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Бытовая техника */}
                      <div className="border-2 border-border rounded-lg py-2 px-2.5 hover:border-primary/50 hover:bg-primary/5 transition-all">
                        <div className="flex items-center gap-2 flex-wrap">
                          <label 
                            htmlFor="appliances"
                            className="flex items-center space-x-2 cursor-pointer flex-shrink-0"
                          >
                            <Checkbox 
                              id="appliances"
                              checked={movingItems.appliances}
                              onCheckedChange={(checked) => {
                                setMovingItems({ ...movingItems, appliances: checked as boolean });
                                if (!checked) setAppliancesDetails("");
                              }}
                              className="h-4 w-4"
                            />
                            <ShoppingCart className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium">Бытовая техника</span>
                          </label>
                          {movingItems.appliances && (
                            <div className="flex-1 min-w-[200px]">
                              <Input
                                type="text"
                                placeholder="Укажите только крупногабаритное: холодильник, стиральная машина..."
                                value={appliancesDetails}
                                onChange={(e) => setAppliancesDetails(e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Показываем только если цена ещё не рассчитана */}
                {!showFinalPrice && (
                  <>
                    <div className="space-y-2 pt-2">
                      <Label className="text-sm font-bold text-[#083cb5]">Предположительный объём: {volumeSteps[volumeIndex]} м³</Label>
                      <div 
                        className={`rounded-lg p-2 -m-2 transition-all ${
                          volumeError 
                            ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20' 
                            : ''
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
                        <div className="relative text-[10px] text-muted-foreground h-4 mt-2">
                          <span className="absolute left-0 -translate-x-0 whitespace-nowrap">0 м³</span>
                          <span className="absolute left-[12.20%] -translate-x-1/2 whitespace-nowrap">10</span>
                          <span className="absolute left-[24.39%] -translate-x-1/2 whitespace-nowrap">20</span>
                          <span className="absolute left-[36.59%] -translate-x-1/2 whitespace-nowrap">30</span>
                          <span className="absolute left-[48.78%] -translate-x-1/2 whitespace-nowrap">40</span>
                          <span className="absolute left-[60.98%] -translate-x-1/2 whitespace-nowrap">50</span>
                          <span className="absolute left-[73.17%] -translate-x-1/2 whitespace-nowrap">60</span>
                          <span className="absolute left-[85.37%] -translate-x-1/2 whitespace-nowrap">70</span>
                          <span className="absolute left-[97.56%] -translate-x-1/2 whitespace-nowrap">80</span>
                          <span className="absolute left-[100%] -translate-x-full whitespace-nowrap">82 м³</span>
                        </div>
                      </div>
                      {volumeError && (
                        <p className="text-sm text-orange-600 font-medium flex items-center gap-1 mt-1">
                          <span className="inline-block w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                          Укажите примерный объем груза
                        </p>
                      )}
                    </div>

                    {/* ВРЕМЕННО ОТКЛЮЧЕНО - Информация о машине - компактный вариант */}
                    {/* <div className="bg-primary/5 border border-primary/20 rounded-lg p-2">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Truck className="w-4 h-4 text-primary flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-primary">
                            {getTruckInfoByVolume(volumeSteps[volumeIndex]).name}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {getTruckInfoByVolume(volumeSteps[volumeIndex]).description}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-xs">
                        <div className="bg-white/70 rounded px-2 py-1 text-center">
                          <div className="font-medium text-muted-foreground">Вес</div>
                          <div className="text-primary font-semibold">
                            {getTruckInfoByVolume(volumeSteps[volumeIndex]).capacity}
                          </div>
                        </div>
                        <div className="bg-white/70 rounded px-2 py-1 text-center">
                          <div className="font-medium text-muted-foreground">Объём</div>
                          <div className="text-primary font-semibold">
                            {getTruckInfoByVolume(volumeSteps[volumeIndex]).volumeCapacity}
                          </div>
                        </div>
                        <div className="bg-white/70 rounded px-2 py-1 text-center">
                          <div className="font-medium text-muted-foreground">Размеры</div>
                          <div className="text-primary font-semibold text-[10px]">
                            {getTruckInfoByVolume(volumeSteps[volumeIndex]).dimensions}
                          </div>
                        </div>
                      </div>
                    </div> */}
                  </>
                )}
              </div>

              {!showFinalPrice ? (
                <div className="flex gap-2 pt-3">
                  <Button 
                    variant="outline"
                    className="w-1/3 h-10" 
                    onClick={() => {
                      setCalculatorStep(1);
                      setShowFinalPrice(false);
                    }}
                  >
                    Назад
                  </Button>
                  <Button 
                    className="w-2/3 h-10" 
                    variant={(volumeIndex === 0 && !cannotSpecifyVolume) ? "outline" : "default"}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Проверяем объем груза (если пользователь не отметил "Не могу указать объем")
                      if (volumeIndex === 0 && !cannotSpecifyVolume) {
                        setVolumeError(true);
                        return;
                      }

                      // Выполняем расчет стоимости
                      const weight = weightSteps[weightIndex];
                      // Используем 0 для объема, если активен чекбокс "Не могу указать объем"
                      const volume = cannotSpecifyVolume ? 0 : volumeSteps[volumeIndex];
                      
                      const result = calculateShippingCost(
                        fromCity,
                        toCity,
                        routeDistance!,
                        weight,
                        volume,
                        transportType  // 🆕 Передаем категорию груза
                      );
                      
                      if (result && result.cost) {
                        // Сохраняем позицию скролла перед изменением состояния
                        scrollPositionRef.current = window.pageYOffset;
                        
                        setEstimatedCost(result.cost);
                        setShowFinalPrice(true);
                      }
                    }}
                  >
                    Получить расчёт
                  </Button>
                </div>
              ) : (
                !showContactForm && (
                  <div className="flex gap-2 pt-3">
                    <Button 
                      variant="outline"
                      className="w-1/2 h-10" 
                      onClick={() => {
                        setShowFinalPrice(false);
                        setShowContactForm(false);
                        setUserContact("");
                      }}
                    >
                      Изменить параметры
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-1/2 h-10"
                      style={{
                        borderColor: '#405b9a',
                        color: '#405b9a'
                      }}
                      onClick={() => {
                        setCalculatorStep(1);
                        setShowFinalPrice(false);
                        setShowContactForm(false);
                        setUserContact("");
                        setTransportType("");
                        setMovingItems({
                          boxes: false,
                          furniture: false,
                          appliances: false,
                        });
                        setVolumeIndex(0);
                        setBoxesCount("");
                        setFurnitureDetails("");
                        setAppliancesDetails("");
                      }}
                    >
                      Новый расчёт
                    </Button>
                  </div>
                )
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
                      <Label htmlFor="cargoNature" className="text-sm font-bold text-[#083cb5]">Характер груза</Label>
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
                        <p className="text-sm text-orange-600 font-medium flex items-center gap-1 mt-1">
                          <span className="inline-block w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                          Укажите характер груза
                        </p>
                      )}
                    </div>

                    {/* Как упакован груз */}
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-[#083cb5]">Как упакован груз?</Label>
                      <div 
                        className={`grid grid-cols-1 gap-1.5 rounded-lg p-2 -m-2 transition-all ${
                          cargoPackagingError 
                            ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20' 
                            : ''
                        }`}
                      >
                        {/* На палетах - с inline полем */}
                        <div
                          className={`flex items-center gap-2 flex-wrap py-2 px-2.5 rounded-lg border-2 transition-all ${
                            cargoPackaging === 'pallets'
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border hover:border-primary/50 hover:bg-primary/5'
                          }`}
                        >
                          <label className="flex items-center cursor-pointer flex-shrink-0">
                            <input
                              type="radio"
                              name="cargo-packaging"
                              value="pallets"
                              checked={cargoPackaging === 'pallets'}
                              onChange={(e) => {
                                setCargoPackaging(e.target.value);
                                if (cargoPackagingError) setCargoPackagingError(false);
                              }}
                              className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                            />
                            <span className={`ml-3 text-sm ${cargoPackaging === 'pallets' ? 'font-semibold text-primary' : 'font-medium'}`}>
                              На палетах
                            </span>
                          </label>
                          {cargoPackaging === 'pallets' && (
                            <div className="flex-1 min-w-[200px]">
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
                                  placeholder="Укажите количество палет"
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
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-border hover:border-primary/50 hover:bg-primary/5'
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
                              className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                            />
                            <span className={`ml-3 text-sm ${cargoPackaging === option.value ? 'font-semibold text-primary' : 'font-medium'}`}>
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                      {cargoPackagingError && (
                        <p className="text-sm text-orange-600 font-medium flex items-center gap-1 mt-1">
                          <span className="inline-block w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                          Выберите тип упаковки груза
                        </p>
                      )}
                    </div>

                    {/* ВРЕМЕННО ОТКЛЮЧЕНО - Информация о машине для палет */}
                    {/* {cargoPackaging === "pallets" && (
                      <>
                        {palletCount && parseInt(palletCount) > 0 && (
                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Truck className="w-5 h-5 text-primary flex-shrink-0" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm text-primary">
                                  {getTruckInfoByVolume(volumeSteps[volumeIndex]).name}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  Для {palletCount} {parseInt(palletCount) === 1 ? 'палеты' : parseInt(palletCount) < 5 ? 'палет' : 'палет'} • {volumeSteps[volumeIndex]} м³
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 text-xs">
                              <div className="bg-white/70 rounded px-2 py-1 text-center">
                                <div className="font-medium text-muted-foreground">Вес</div>
                                <div className="text-primary font-semibold">
                                  {getTruckInfoByVolume(volumeSteps[volumeIndex]).capacity}
                                </div>
                              </div>
                              <div className="bg-white/70 rounded px-2 py-1 text-center">
                                <div className="font-medium text-muted-foreground">Объём</div>
                                <div className="text-primary font-semibold">
                                  {getTruckInfoByVolume(volumeSteps[volumeIndex]).volumeCapacity}
                                </div>
                              </div>
                              <div className="bg-white/70 rounded px-2 py-1 text-center">
                                <div className="font-medium text-muted-foreground">Размеры</div>
                                <div className="text-primary font-semibold text-[10px]">
                                  {getTruckInfoByVolume(volumeSteps[volumeIndex]).dimensions}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )} */}

                    {/* Вес и объем - показываем для всех кроме "На палетах" */}
                    {cargoPackaging && cargoPackaging !== "pallets" && (
                      <>
                        {/* Вес груза */}
                        <div className="space-y-2 pt-2">
                          <Label className="text-sm font-bold text-[#083cb5]">
                            Вес груза: {weightSteps[weightIndex] >= 1000 
                              ? `${(weightSteps[weightIndex] / 1000).toFixed(1)} т` 
                              : `${weightSteps[weightIndex]} кг`}
                          </Label>
                          <Slider
                            value={[weightIndex]}
                            onValueChange={(value) => setWeightIndex(value[0])}
                            min={0}
                            max={weightSteps.length - 1}
                            step={1}
                            className="w-full"
                          />
                          <div className="relative text-[10px] text-muted-foreground h-4">
                            <span className="absolute left-0 -translate-x-0 whitespace-nowrap">200 кг</span>
                            <span className="absolute left-[9.09%] -translate-x-1/2 whitespace-nowrap">500</span>
                            <span className="absolute left-[13.64%] -translate-x-1/2 whitespace-nowrap">1т</span>
                            <span className="absolute left-[36.36%] -translate-x-1/2 whitespace-nowrap">5т</span>
                            <span className="absolute left-[59.09%] -translate-x-1/2 whitespace-nowrap">10т</span>
                            <span className="absolute left-[81.82%] -translate-x-1/2 whitespace-nowrap">15т</span>
                            <span className="absolute left-[100%] -translate-x-full whitespace-nowrap">20т</span>
                          </div>
                        </div>

                        {/* Объем груза */}
                        <div className="space-y-2 pt-2">
                          {/* Заголовок и чекбокс в одной строке */}
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-bold text-[#083cb5]">Объём груза: {volumeSteps[volumeIndex]} м³</Label>
                            
                            {/* Чекбокс "Не могу указать объем" */}
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="cannotSpecifyVolume"
                                checked={cannotSpecifyVolume}
                                onCheckedChange={(checked) => {
                                  setCannotSpecifyVolume(checked as boolean);
                                  if (checked) {
                                    setVolumeIndex(0); // Сбрасываем ползунок в 0 при включении
                                  }
                                }}
                                className="h-4 w-4"
                              />
                              <label
                                htmlFor="cannotSpecifyVolume"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                Не могу указать объем
                              </label>
                            </div>
                          </div>
                          
                          <div className={`transition-opacity duration-200 ${cannotSpecifyVolume ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                            <Slider
                              value={[volumeIndex]}
                              onValueChange={(value) => setVolumeIndex(value[0])}
                              min={0}
                              max={volumeSteps.length - 1}
                              step={1}
                              className="w-full"
                              disabled={cannotSpecifyVolume}
                            />
                          </div>
                          <div className={`relative text-[10px] text-muted-foreground h-4 transition-opacity duration-200 ${cannotSpecifyVolume ? 'opacity-40' : 'opacity-100'}`}>
                            <span className="absolute left-0 -translate-x-0 whitespace-nowrap">1 м³</span>
                            <span className="absolute left-[11.11%] -translate-x-1/2 whitespace-nowrap">10</span>
                            <span className="absolute left-[23.46%] -translate-x-1/2 whitespace-nowrap">20</span>
                            <span className="absolute left-[35.80%] -translate-x-1/2 whitespace-nowrap">30</span>
                            <span className="absolute left-[48.15%] -translate-x-1/2 whitespace-nowrap">40</span>
                            <span className="absolute left-[60.49%] -translate-x-1/2 whitespace-nowrap">50</span>
                            <span className="absolute left-[72.84%] -translate-x-1/2 whitespace-nowrap">60</span>
                            <span className="absolute left-[85.19%] -translate-x-1/2 whitespace-nowrap">70</span>
                            <span className="absolute left-[97.53%] -translate-x-1/2 whitespace-nowrap">80</span>
                            <span className="absolute left-[100%] -translate-x-full whitespace-nowrap">82 м³</span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* ВРЕМЕННО ОТКЛЮЧЕНО - Информация о машине - показываем если выбран тип упаковки кроме палет */}
                    {/* {cargoPackaging && cargoPackaging !== "pallets" && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Truck className="w-5 h-5 text-primary flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-xs text-primary">
                              {getTruckInfoByVolume(volumeSteps[volumeIndex]).name}
                            </h4>
                            <p className="text-[10px] text-muted-foreground">
                              {getTruckInfoByVolume(volumeSteps[volumeIndex]).description}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[10px]">
                          <div className="bg-white/70 rounded px-1.5 py-0.5 text-center">
                            <div className="font-medium text-muted-foreground">Вес</div>
                            <div className="text-primary font-semibold">
                              {getTruckInfoByVolume(volumeSteps[volumeIndex]).capacity}
                            </div>
                          </div>
                          <div className="bg-white/70 rounded px-2 py-1 text-center">
                            <div className="font-medium text-muted-foreground">Объём</div>
                            <div className="text-primary font-semibold">
                              {getTruckInfoByVolume(volumeSteps[volumeIndex]).volumeCapacity}
                            </div>
                          </div>
                          <div className="bg-white/70 rounded px-2 py-1 text-center">
                            <div className="font-medium text-muted-foreground">Размеры</div>
                            <div className="text-primary font-semibold text-[10px]">
                              {getTruckInfoByVolume(volumeSteps[volumeIndex]).dimensions}
                            </div>
                          </div>
                        </div>
                      </div>
                    )} */}
                  </>
                )}
              </div>

              {!showFinalPrice ? (
                <div className="flex gap-2 pt-3">
                  <Button 
                    variant="outline"
                    className="w-1/3 h-10" 
                    onClick={() => {
                      setCalculatorStep(1);
                      setShowFinalPrice(false);
                    }}
                  >
                    Назад
                  </Button>
                  <Button 
                    className="w-2/3 h-10"
                    variant={(!cargoPackaging || !cargoNature || (cargoPackaging === "pallets" && !palletCount)) ? "outline" : "default"}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Проверяем заполненность полей
                      let hasErrors = false;
                      
                      if (!cargoPackaging) {
                        setCargoPackagingError(true);
                        hasErrors = true;
                      }
                      if (!cargoNature) {
                        setCargoNatureError(true);
                        hasErrors = true;
                      }
                      if (cargoPackaging === "pallets" && !palletCount) {
                        setPalletCountError(true);
                        hasErrors = true;
                      }
                      
                      if (hasErrors) {
                        return;
                      }

                      // Выполняем расчет стоимости
                      const weight = weightSteps[weightIndex];
                      // Используем 0 для объема, если активен чекбокс "Не могу указать объем"
                      const volume = cannotSpecifyVolume ? 0 : volumeSteps[volumeIndex];
                      
                      const result = calculateShippingCost(
                        fromCity,
                        toCity,
                        routeDistance!,
                        weight,
                        volume,
                        transportType  // 🆕 Передаем категорию груза
                      );
                      
                      if (result && result.cost) {
                        // Сохраняем позицию скролла перед изменением состояния
                        scrollPositionRef.current = window.pageYOffset;
                        
                        setEstimatedCost(result.cost);
                        setShowFinalPrice(true);
                      }
                    }}
                  >
                    Получить расчёт
                  </Button>
                </div>
              ) : (
                !showContactForm && (
                  <div className="flex gap-2 pt-3">
                    <Button 
                      variant="outline"
                      className="w-1/2 h-10" 
                      onClick={() => {
                        setShowFinalPrice(false);
                        setShowContactForm(false);
                        setUserContact("");
                      }}
                    >
                      Изменить параметры
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-1/2 h-10"
                      style={{
                        borderColor: '#405b9a',
                        color: '#405b9a'
                      }}
                      onClick={() => {
                        setCalculatorStep(1);
                        setShowFinalPrice(false);
                        setShowContactForm(false);
                        setUserContact("");
                        setTransportType("");
                        setCargoPackaging("");
                        setPalletCount("");
                        setCargoNature("");
                        setWeightIndex(0);
                        setVolumeIndex(0);
                      }}
                    >
                      Новый расчёт
                    </Button>
                  </div>
                )
              )}
            </>
          )}

          {calculatorStep === 2 && transportType === "Продукты питания" && (
            <>
              {/* ШАГ 2: Продукты питания */}
              <div className="space-y-2">
                {/* Показываем форму только если цена ещё не рассчитана */}
                {!showFinalPrice && (
                  <>
                    {/* Как упакован груз */}
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-[#083cb5]">Как упакован груз?</Label>
                      <div 
                        className={`grid grid-cols-1 gap-1.5 rounded-lg p-2 -m-2 transition-all ${
                          foodPackagingError 
                            ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20' 
                            : ''
                        }`}
                      >
                        {/* На палетах - с inline полем */}
                        <div
                          className={`flex items-center gap-2 flex-wrap py-2 px-2.5 rounded-lg border-2 transition-all ${
                            foodPackaging === 'pallets'
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border hover:border-primary/50 hover:bg-primary/5'
                          }`}
                        >
                          <label className="flex items-center cursor-pointer flex-shrink-0">
                            <input
                              type="radio"
                              name="food-packaging"
                              value="pallets"
                              checked={foodPackaging === 'pallets'}
                              onChange={(e) => {
                                setFoodPackaging(e.target.value);
                                if (foodPackagingError) setFoodPackagingError(false);
                              }}
                              className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                            />
                            <span className={`ml-3 text-sm ${foodPackaging === 'pallets' ? 'font-semibold text-primary' : 'font-medium'}`}>
                              На палетах
                            </span>
                          </label>
                          {foodPackaging === 'pallets' && (
                            <div className="flex-1 min-w-[200px]">
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
                                  placeholder="Укажите количество палет"
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
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-border hover:border-primary/50 hover:bg-primary/5'
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
                              className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                            />
                            <span className={`ml-3 text-sm ${foodPackaging === option.value ? 'font-semibold text-primary' : 'font-medium'}`}>
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                      {foodPackagingError && (
                        <p className="text-sm text-orange-600 font-medium flex items-center gap-1 mt-1">
                          <span className="inline-block w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                          Выберите тип упаковки груза
                        </p>
                      )}
                    </div>

                    {/* Информация о машине для палет */}
                    {/* ВРЕМЕННО ОТКЛЮЧЕНО - Информация о машине для палет (продукты) */}
                    {/* {foodPackaging === "pallets" && (
                      <>
                        {foodPalletCount && parseInt(foodPalletCount) > 0 && (
                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Truck className="w-5 h-5 text-primary flex-shrink-0" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm text-primary">
                                  {getTruckInfoByVolume(volumeSteps[volumeIndex]).name}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  Для {foodPalletCount} {parseInt(foodPalletCount) === 1 ? 'палеты' : parseInt(foodPalletCount) < 5 ? 'палет' : 'палет'} • {volumeSteps[volumeIndex]} м³
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 text-xs">
                              <div className="bg-white/70 rounded px-2 py-1 text-center">
                                <div className="font-medium text-muted-foreground">Вес</div>
                                <div className="text-primary font-semibold">
                                  {getTruckInfoByVolume(volumeSteps[volumeIndex]).capacity}
                                </div>
                              </div>
                              <div className="bg-white/70 rounded px-2 py-1 text-center">
                                <div className="font-medium text-muted-foreground">Объём</div>
                                <div className="text-primary font-semibold">
                                  {getTruckInfoByVolume(volumeSteps[volumeIndex]).volumeCapacity}
                                </div>
                              </div>
                              <div className="bg-white/70 rounded px-2 py-1 text-center">
                                <div className="font-medium text-muted-foreground">Размеры</div>
                                <div className="text-primary font-semibold text-[10px]">
                                  {getTruckInfoByVolume(volumeSteps[volumeIndex]).dimensions}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )} */}

                    {/* Вес и объем - показываем для всех кроме "На палетах" */}
                    {foodPackaging && foodPackaging !== "pallets" && (
                      <>
                        {/* Вес груза */}
                        <div className="space-y-2 pt-2">
                          <Label className="text-sm font-bold text-[#083cb5]">
                            Вес груза: {weightSteps[weightIndex] >= 1000 
                              ? `${(weightSteps[weightIndex] / 1000).toFixed(1)} т` 
                              : `${weightSteps[weightIndex]} кг`}
                          </Label>
                          <Slider
                            value={[weightIndex]}
                            onValueChange={(value) => setWeightIndex(value[0])}
                            min={0}
                            max={weightSteps.length - 1}
                            step={1}
                            className="w-full"
                          />
                          <div className="relative text-[10px] text-muted-foreground h-4">
                            <span className="absolute left-0 -translate-x-0 whitespace-nowrap">200 кг</span>
                            <span className="absolute left-[9.09%] -translate-x-1/2 whitespace-nowrap">500</span>
                            <span className="absolute left-[13.64%] -translate-x-1/2 whitespace-nowrap">1т</span>
                            <span className="absolute left-[36.36%] -translate-x-1/2 whitespace-nowrap">5т</span>
                            <span className="absolute left-[59.09%] -translate-x-1/2 whitespace-nowrap">10т</span>
                            <span className="absolute left-[81.82%] -translate-x-1/2 whitespace-nowrap">15т</span>
                            <span className="absolute left-[100%] -translate-x-full whitespace-nowrap">20т</span>
                          </div>
                        </div>

                        {/* Объем груза */}
                        <div className="space-y-2 pt-2">
                          {/* Заголовок и чекбокс в одной строке */}
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-bold text-[#083cb5]">Объём груза: {volumeSteps[volumeIndex]} м³</Label>
                            
                            {/* Чекбокс "Не могу указать объем" */}
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="cannotSpecifyVolumeFood"
                                checked={cannotSpecifyVolumeFood}
                                onCheckedChange={(checked) => {
                                  setCannotSpecifyVolumeFood(checked as boolean);
                                  if (checked) {
                                    setVolumeIndex(0); // Сбрасываем ползунок в 0 при включении
                                  }
                                }}
                                className="h-4 w-4"
                              />
                              <label
                                htmlFor="cannotSpecifyVolumeFood"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                Не могу указать объем
                              </label>
                            </div>
                          </div>
                          
                          <div className={`transition-opacity duration-200 ${cannotSpecifyVolumeFood ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                            <Slider
                              value={[volumeIndex]}
                              onValueChange={(value) => setVolumeIndex(value[0])}
                              min={0}
                              max={volumeSteps.length - 1}
                              step={1}
                              className="w-full"
                              disabled={cannotSpecifyVolumeFood}
                            />
                          </div>
                          <div className={`relative text-[10px] text-muted-foreground h-4 transition-opacity duration-200 ${cannotSpecifyVolumeFood ? 'opacity-40' : 'opacity-100'}`}>
                            <span className="absolute left-0 -translate-x-0 whitespace-nowrap">1 м³</span>
                            <span className="absolute left-[11.11%] -translate-x-1/2 whitespace-nowrap">10</span>
                            <span className="absolute left-[23.46%] -translate-x-1/2 whitespace-nowrap">20</span>
                            <span className="absolute left-[35.80%] -translate-x-1/2 whitespace-nowrap">30</span>
                            <span className="absolute left-[48.15%] -translate-x-1/2 whitespace-nowrap">40</span>
                            <span className="absolute left-[60.49%] -translate-x-1/2 whitespace-nowrap">50</span>
                            <span className="absolute left-[72.84%] -translate-x-1/2 whitespace-nowrap">60</span>
                            <span className="absolute left-[85.19%] -translate-x-1/2 whitespace-nowrap">70</span>
                            <span className="absolute left-[97.53%] -translate-x-1/2 whitespace-nowrap">80</span>
                            <span className="absolute left-[100%] -translate-x-full whitespace-nowrap">82 м³</span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* ВРЕМЕННО ОТКЛЮЧЕНО - Информация о машине - показываем если выбран тип упаковки кроме палет */}
                    {/* {foodPackaging && foodPackaging !== "pallets" && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Truck className="w-5 h-5 text-primary flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-xs text-primary">
                              {getTruckInfoByVolume(volumeSteps[volumeIndex]).name}
                            </h4>
                            <p className="text-[10px] text-muted-foreground">
                              {getTruckInfoByVolume(volumeSteps[volumeIndex]).description}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[10px]">
                          <div className="bg-white/70 rounded px-1.5 py-0.5 text-center">
                            <div className="font-medium text-muted-foreground">Вес</div>
                            <div className="text-primary font-semibold">
                              {getTruckInfoByVolume(volumeSteps[volumeIndex]).capacity}
                            </div>
                          </div>
                          <div className="bg-white/70 rounded px-2 py-1 text-center">
                            <div className="font-medium text-muted-foreground">Объём</div>
                            <div className="text-primary font-semibold">
                              {getTruckInfoByVolume(volumeSteps[volumeIndex]).volumeCapacity}
                            </div>
                          </div>
                          <div className="bg-white/70 rounded px-2 py-1 text-center">
                            <div className="font-medium text-muted-foreground">Размеры</div>
                            <div className="text-primary font-semibold text-[10px]">
                              {getTruckInfoByVolume(volumeSteps[volumeIndex]).dimensions}
                            </div>
                          </div>
                        </div>
                      </div>
                    )} */}
                  </>
                )}
              </div>

              {!showFinalPrice ? (
                <div className="flex gap-2 pt-3">
                  <Button 
                    variant="outline"
                    className="w-1/3 h-10" 
                    onClick={() => {
                      setCalculatorStep(1);
                      setShowFinalPrice(false);
                    }}
                  >
                    Назад
                  </Button>
                  <Button 
                    className="w-2/3 h-10"
                    variant={(!foodPackaging || (foodPackaging === "pallets" && !foodPalletCount)) ? "outline" : "default"}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Проверяем заполненность полей
                      let hasErrors = false;
                      
                      if (!foodPackaging) {
                        setFoodPackagingError(true);
                        hasErrors = true;
                      }
                      if (foodPackaging === "pallets" && !foodPalletCount) {
                        setFoodPalletCountError(true);
                        hasErrors = true;
                      }
                      
                      if (hasErrors) {
                        return;
                      }

                      // Выполняем расчет стоимости
                      const weight = weightSteps[weightIndex];
                      // Используем 0 для объема, если активен чекбокс "Не могу указать объем"
                      const volume = cannotSpecifyVolumeFood ? 0 : volumeSteps[volumeIndex];
                      
                      const result = calculateShippingCost(
                        fromCity,
                        toCity,
                        routeDistance!,
                        weight,
                        volume,
                        transportType  // 🆕 Передаем категорию груза
                      );
                      
                      if (result && result.cost) {
                        // Применяем коэффициент для рефрижератора
                        const finalCost = truckType === "refrigerator" 
                          ? Math.round(result.cost * REFRIGERATOR_COEFFICIENT)
                          : result.cost;
                        
                        // Информация для администратора в консоли
                        if (truckType === "refrigerator") {
                          console.log("🔧 ADMIN: Применён коэффициент рефрижератора");
                          console.log(`   Базовая стоимость: ${result.cost.toLocaleString()} ₽`);
                          console.log(`   Коэффициент: ${REFRIGERATOR_COEFFICIENT}`);
                          console.log(`   Финальная стоимость: ${finalCost.toLocaleString()} ₽`);
                        }
                        
                        // Сохраняем позицию скролла перед изменением состояния
                        scrollPositionRef.current = window.pageYOffset;
                        
                        setEstimatedCost(finalCost);
                        setShowFinalPrice(true);
                      }
                    }}
                  >
                    Получить расчёт
                  </Button>
                </div>
              ) : (
                !showContactForm && (
                  <div className="flex gap-2 pt-3">
                    <Button 
                      variant="outline"
                      className="w-1/2 h-10" 
                      onClick={() => {
                        setShowFinalPrice(false);
                        setShowContactForm(false);
                        setUserContact("");
                      }}
                    >
                      Изменить параметры
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-1/2 h-10"
                      style={{
                        borderColor: '#405b9a',
                        color: '#405b9a'
                      }}
                      onClick={() => {
                        setCalculatorStep(1);
                        setShowFinalPrice(false);
                        setShowContactForm(false);
                        setUserContact("");
                        setTransportType("");
                        setTruckType("");
                        setTemperatureMode("");
                        setFoodPackaging("");
                        setFoodPalletCount("");
                        setWeightIndex(0);
                        setVolumeIndex(0);
                      }}
                    >
                      Новый расчёт
                    </Button>
                  </div>
                )
              )}
            </>
          )}

          {calculatorStep === 2 && transportType === "Другое" && (
            <>
              {/* ШАГ 2: Другое (аналогично промышленным товарам) */}
              <div className="space-y-2">
                {/* Показываем форму только если цена ещё не рассчитана */}
                {!showFinalPrice && (
                  <>
                    {/* Характер груза */}
                    <div className="space-y-2">
                      <Label htmlFor="otherNature" className="text-sm font-bold text-[#083cb5]">Характер груза</Label>
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
                          placeholder="Оборудование, мебель и тп"
                          value={otherNature}
                          onChange={(e) => {
                            setOtherNature(e.target.value);
                            if (otherNatureError) setOtherNatureError(false);
                          }}
                          className="h-9"
                        />
                      </div>
                      {otherNatureError && (
                        <p className="text-sm text-orange-600 font-medium flex items-center gap-1 mt-1">
                          <span className="inline-block w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                          Укажите характер груза
                        </p>
                      )}
                    </div>

                    {/* Как упакован груз */}
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-[#083cb5]">Как упакован груз?</Label>
                      <div 
                        className={`grid grid-cols-1 gap-1.5 rounded-lg p-2 -m-2 transition-all ${
                          otherPackagingError 
                            ? 'ring-2 ring-orange-500 ring-offset-2 shadow-lg shadow-orange-500/20' 
                            : ''
                        }`}
                      >
                        {/* На палетах - с inline полем */}
                        <div
                          className={`flex items-center gap-2 flex-wrap py-2 px-2.5 rounded-lg border-2 transition-all ${
                            otherPackaging === 'pallets'
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border hover:border-primary/50 hover:bg-primary/5'
                          }`}
                        >
                          <label className="flex items-center cursor-pointer flex-shrink-0">
                            <input
                              type="radio"
                              name="other-packaging"
                              value="pallets"
                              checked={otherPackaging === 'pallets'}
                              onChange={(e) => {
                                setOtherPackaging(e.target.value);
                                if (otherPackagingError) setOtherPackagingError(false);
                              }}
                              className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                            />
                            <span className={`ml-3 text-sm ${otherPackaging === 'pallets' ? 'font-semibold text-primary' : 'font-medium'}`}>
                              На палетах
                            </span>
                          </label>
                          {otherPackaging === 'pallets' && (
                            <div className="flex-1 min-w-[200px]">
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
                                  placeholder="Укажите количество палет"
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
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-border hover:border-primary/50 hover:bg-primary/5'
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
                              className="w-4 h-4 text-primary focus:ring-primary focus:ring-2"
                            />
                            <span className={`ml-3 text-sm ${otherPackaging === option.value ? 'font-semibold text-primary' : 'font-medium'}`}>
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                      {otherPackagingError && (
                        <p className="text-sm text-orange-600 font-medium flex items-center gap-1 mt-1">
                          <span className="inline-block w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                          Выберите тип упаковки груза
                        </p>
                      )}
                    </div>

                    {/* ВРЕМЕННО ОТКЛЮЧЕНО - Информация о машине для палет (другое) */}
                    {/* {otherPackaging === "pallets" && (
                      <>
                        {otherPalletCount && parseInt(otherPalletCount) > 0 && (
                          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Truck className="w-5 h-5 text-primary flex-shrink-0" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm text-primary">
                                  {getTruckInfoByVolume(volumeSteps[volumeIndex]).name}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  Для {otherPalletCount} {parseInt(otherPalletCount) === 1 ? 'палеты' : parseInt(otherPalletCount) < 5 ? 'палет' : 'палет'} • {volumeSteps[volumeIndex]} м³
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 text-xs">
                              <div className="bg-white/70 rounded px-2 py-1 text-center">
                                <div className="font-medium text-muted-foreground">Вес</div>
                                <div className="text-primary font-semibold">
                                  {getTruckInfoByVolume(volumeSteps[volumeIndex]).capacity}
                                </div>
                              </div>
              <div className="bg-white/70 rounded px-2 py-1 text-center">
                                <div className="font-medium text-muted-foreground">Объём</div>
                                <div className="text-primary font-semibold">
                                  {getTruckInfoByVolume(volumeSteps[volumeIndex]).volumeCapacity}
                                </div>
                              </div>
                              <div className="bg-white/70 rounded px-2 py-1 text-center">
                                <div className="font-medium text-muted-foreground">Размеры</div>
                                <div className="text-primary font-semibold text-[10px]">
                                  {getTruckInfoByVolume(volumeSteps[volumeIndex]).dimensions}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )} */}

                    {/* Вес и объем - показываем для всех кроме "На палетах" */}
                    {otherPackaging && otherPackaging !== "pallets" && (
                      <>
                        {/* Вес груза */}
                        <div className="space-y-2 pt-2">
                          <Label className="text-sm font-bold text-[#083cb5]">
                            Вес груза: {weightSteps[weightIndex] >= 1000 
                              ? `${(weightSteps[weightIndex] / 1000).toFixed(1)} т` 
                              : `${weightSteps[weightIndex]} кг`}
                          </Label>
                          <Slider
                            value={[weightIndex]}
                            onValueChange={(value) => setWeightIndex(value[0])}
                            min={0}
                            max={weightSteps.length - 1}
                            step={1}
                            className="w-full"
                          />
                          <div className="relative text-[10px] text-muted-foreground h-4">
                            <span className="absolute left-0 -translate-x-0 whitespace-nowrap">200 кг</span>
                            <span className="absolute left-[9.09%] -translate-x-1/2 whitespace-nowrap">500</span>
                            <span className="absolute left-[13.64%] -translate-x-1/2 whitespace-nowrap">1т</span>
                            <span className="absolute left-[36.36%] -translate-x-1/2 whitespace-nowrap">5т</span>
                            <span className="absolute left-[59.09%] -translate-x-1/2 whitespace-nowrap">10т</span>
                            <span className="absolute left-[81.82%] -translate-x-1/2 whitespace-nowrap">15т</span>
                            <span className="absolute left-[100%] -translate-x-full whitespace-nowrap">20т</span>
                          </div>
                        </div>

                        {/* Объем груза */}
                        <div className="space-y-2 pt-2">
                          {/* Заголовок и чекбокс в одной строке */}
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-bold text-[#083cb5]">Объём груза: {volumeSteps[volumeIndex]} м³</Label>
                            
                            {/* Чекбокс "Не могу указать объем" */}
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="cannotSpecifyVolumeOther"
                                checked={cannotSpecifyVolumeOther}
                                onCheckedChange={(checked) => {
                                  setCannotSpecifyVolumeOther(checked as boolean);
                                  if (checked) {
                                    setVolumeIndex(0); // Сбрасываем ползунок в 0 при включении
                                  }
                                }}
                                className="h-4 w-4"
                              />
                              <label
                                htmlFor="cannotSpecifyVolumeOther"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                Не могу указать объем
                              </label>
                            </div>
                          </div>
                          
                          <div className={`transition-opacity duration-200 ${cannotSpecifyVolumeOther ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                            <Slider
                              value={[volumeIndex]}
                              onValueChange={(value) => setVolumeIndex(value[0])}
                              min={0}
                              max={volumeSteps.length - 1}
                              step={1}
                              className="w-full"
                              disabled={cannotSpecifyVolumeOther}
                            />
                          </div>
                          <div className={`relative text-[10px] text-muted-foreground h-4 transition-opacity duration-200 ${cannotSpecifyVolumeOther ? 'opacity-40' : 'opacity-100'}`}>
                            <span className="absolute left-0 -translate-x-0 whitespace-nowrap">1 м³</span>
                            <span className="absolute left-[11.11%] -translate-x-1/2 whitespace-nowrap">10</span>
                            <span className="absolute left-[23.46%] -translate-x-1/2 whitespace-nowrap">20</span>
                            <span className="absolute left-[35.80%] -translate-x-1/2 whitespace-nowrap">30</span>
                            <span className="absolute left-[48.15%] -translate-x-1/2 whitespace-nowrap">40</span>
                            <span className="absolute left-[60.49%] -translate-x-1/2 whitespace-nowrap">50</span>
                            <span className="absolute left-[72.84%] -translate-x-1/2 whitespace-nowrap">60</span>
                            <span className="absolute left-[85.19%] -translate-x-1/2 whitespace-nowrap">70</span>
                            <span className="absolute left-[97.53%] -translate-x-1/2 whitespace-nowrap">80</span>
                            <span className="absolute left-[100%] -translate-x-full whitespace-nowrap">82 м³</span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* ВРЕМЕННО ОТКЛЮЧЕНО - Информация о машине - показываем если выбран тип упаковки кроме палет */}
                    {/* {otherPackaging && otherPackaging !== "pallets" && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Truck className="w-5 h-5 text-primary flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-xs text-primary">
                              {getTruckInfoByVolume(volumeSteps[volumeIndex]).name}
                            </h4>
                            <p className="text-[10px] text-muted-foreground">
                              {getTruckInfoByVolume(volumeSteps[volumeIndex]).description}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[10px]">
                          <div className="bg-white/70 rounded px-1.5 py-0.5 text-center">
                            <div className="font-medium text-muted-foreground">Вес</div>
                            <div className="text-primary font-semibold">
                              {getTruckInfoByVolume(volumeSteps[volumeIndex]).capacity}
                            </div>
                          </div>
                          <div className="bg-white/70 rounded px-2 py-1 text-center">
                            <div className="font-medium text-muted-foreground">Объём</div>
                            <div className="text-primary font-semibold">
                              {getTruckInfoByVolume(volumeSteps[volumeIndex]).volumeCapacity}
                            </div>
                          </div>
                          <div className="bg-white/70 rounded px-2 py-1 text-center">
                            <div className="font-medium text-muted-foreground">Размеры</div>
                            <div className="text-primary font-semibold text-[10px]">
                              {getTruckInfoByVolume(volumeSteps[volumeIndex]).dimensions}
                            </div>
                          </div>
                        </div>
                      </div>
                    )} */}
                  </>
                )}
              </div>

              {!showFinalPrice ? (
                <div className="flex gap-2 pt-3">
                  <Button 
                    variant="outline"
                    className="w-1/3 h-10" 
                    onClick={() => {
                      setCalculatorStep(1);
                      setShowFinalPrice(false);
                    }}
                  >
                    Назад
                  </Button>
                  <Button 
                    className="w-2/3 h-10"
                    variant={(!otherPackaging || !otherNature || (otherPackaging === "pallets" && !otherPalletCount)) ? "outline" : "default"}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Проверяем заполненность полей
                      let hasErrors = false;
                      
                      if (!otherPackaging) {
                        setOtherPackagingError(true);
                        hasErrors = true;
                      }
                      if (!otherNature) {
                        setOtherNatureError(true);
                        hasErrors = true;
                      }
                      if (otherPackaging === "pallets" && !otherPalletCount) {
                        setOtherPalletCountError(true);
                        hasErrors = true;
                      }
                      
                      if (hasErrors) {
                        return;
                      }

                      // Выполняем расчет стоимости
                      const weight = weightSteps[weightIndex];
                      // Используем 0 для объема, если активен чекбокс "Не могу указать объем"
                      const volume = cannotSpecifyVolumeOther ? 0 : volumeSteps[volumeIndex];
                      
                      const result = calculateShippingCost(
                        fromCity,
                        toCity,
                        routeDistance!,
                        weight,
                        volume,
                        transportType  // 🆕 Передаем категорию груза
                      );
                      
                      if (result && result.cost) {
                        // Сохраняем позицию скролла перед изменением состояния
                        scrollPositionRef.current = window.pageYOffset;
                        
                        setEstimatedCost(result.cost);
                        setShowFinalPrice(true);
                      }
                    }}
                  >
                    Получить расчёт
                  </Button>
                </div>
              ) : (
                !showContactForm && (
                  <div className="flex gap-2 pt-3">
                    <Button 
                      variant="outline"
                      className="w-1/2 h-10" 
                      onClick={() => {
                        setShowFinalPrice(false);
                        setShowContactForm(false);
                        setUserContact("");
                      }}
                    >
                      Изменить параметры
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-1/2 h-10"
                      style={{
                        borderColor: '#405b9a',
                        color: '#405b9a'
                      }}
                      onClick={() => {
                        setCalculatorStep(1);
                        setShowFinalPrice(false);
                        setShowContactForm(false);
                        setUserContact("");
                        setTransportType("");
                        setOtherPackaging("");
                        setOtherPalletCount("");
                        setOtherNature("");
                        setWeightIndex(0);
                        setVolumeIndex(0);
                      }}
                    >
                      Новый расчёт
                    </Button>
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShippingCalculatorForm;

