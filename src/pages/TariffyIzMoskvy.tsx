import { useState, useEffect } from "react";
import { Phone } from "lucide-react";
import YandexMetrika from "@/components/YandexMetrika";
import { initAnalytics } from "@/utils/analytics";
import { useYandexMetrika } from "@/hooks/useYandexMetrika";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reviews from "@/components/Reviews";
import ReviewsMobile from "@/components/ReviewsMobile";
import WorkProcess from "@/components/WorkProcess";
import { ShippingCalculatorForm } from "@/components/ShippingCalculatorForm";
import { RoutesAccordion } from "@/components/RoutesAccordion";
import { BannerUp } from "@/components/BannerUp";

const Index = () => {
  // Form states
  const [calculatorStep, setCalculatorStep] = useState(1); // Шаг калькулятора (1 или 2)
  const [showFinalPrice, setShowFinalPrice] = useState(false); // Показывать ли финальную цену
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [fromCoordinates, setFromCoordinates] = useState<[number, number] | undefined>();
  const [toCoordinates, setToCoordinates] = useState<[number, number] | undefined>();
  const [transportType, setTransportType] = useState("");
  const [weightIndex, setWeightIndex] = useState(0); // индекс в массиве weightSteps
  const [volumeIndex, setVolumeIndex] = useState(0); // индекс в массиве volumeSteps
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeDuration, setRouteDuration] = useState<number | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Домашний переезд - дополнительные поля
  const [movingItems, setMovingItems] = useState({
    boxes: false,
    furniture: false,
    appliances: false,
  });
  const [boxesCount, setBoxesCount] = useState("");
  const [furnitureDetails, setFurnitureDetails] = useState("");
  const [appliancesDetails, setAppliancesDetails] = useState("");

  // Промышленные товары - дополнительные поля
  const [cargoPackaging, setCargoPackaging] = useState(""); // Тип упаковки
  const [palletCount, setPalletCount] = useState(""); // Количество палет
  const [cargoNature, setCargoNature] = useState(""); // Характер груза

  // Продукты питания - дополнительные поля
  const [truckType, setTruckType] = useState(""); // Тип фургона
  const [temperatureMode, setTemperatureMode] = useState(""); // Температурный режим для рефрижератора
  const [foodPackaging, setFoodPackaging] = useState(""); // Тип упаковки для продуктов
  const [foodPalletCount, setFoodPalletCount] = useState(""); // Количество палет для продуктов

  // Другое - дополнительные поля (аналогично промышленным товарам)
  const [otherPackaging, setOtherPackaging] = useState(""); // Тип упаковки
  const [otherPalletCount, setOtherPalletCount] = useState(""); // Количество палет
  const [otherNature, setOtherNature] = useState(""); // Характер груза

  // Контактная информация менеджера (можно изменять)
  const [managerName, setManagerName] = useState("Дарья");
  const [managerPhone, setManagerPhone] = useState("+7 (499) 444 06 51");

  // Форма для получения точного расчёта
  const [contactMethod, setContactMethod] = useState<"phone" | "whatsapp">("phone");
  const [userContact, setUserContact] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);

  // Яндекс Метрика хук для отправки целей
  const { reachGoal } = useYandexMetrika(57594511);

  const [isAnalyticsInit, setIsAnalyticsInit] = useState(false);

  // ОПТИМИЗАЦИЯ: Инициализация аналитики через 2 секунды после загрузки страницы
  useEffect(() => {
    const initAnalyticsDelayed = () => {
      if (!isAnalyticsInit) {
        setIsAnalyticsInit(true);
        initAnalytics();
        console.log('✅ Аналитика инициализирована через 2 секунды');
      }
    };

    // Загружаем строго через 2 секунды после монтирования компонента
    const timeout = setTimeout(initAnalyticsDelayed, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, [isAnalyticsInit]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Advantages Section */}
      <BannerUp className="hidden md:block w-full py-8" overlayType="white">
        {/* Background pattern with CSS */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-16 h-16 border-2 border-blue-200 rounded-lg rotate-12"></div>
          <div className="absolute top-20 right-20 w-12 h-12 bg-blue-100 rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-20 h-8 bg-indigo-100 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-14 h-14 border-2 border-indigo-200 rounded-lg -rotate-12"></div>
          <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-slate-200 rounded-full"></div>
          <div className="absolute top-1/3 right-1/3 w-10 h-6 bg-blue-200 rounded-full"></div>
          <div className="absolute bottom-1/3 left-1/3 w-6 h-10 bg-indigo-200 rounded-full"></div>
          
          {/* Route lines */}
          <div className="absolute top-16 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
          <div className="absolute top-32 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent"></div>
          <div className="absolute bottom-16 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-6">
          <div className="hidden md:flex items-start justify-between gap-8">
            {/* Left side - Title block */}
            <div className="w-[450px]">
              <div className="relative p-6 rounded-lg shadow-sm hover:shadow-md transition-all overflow-visible" style={{borderTopRightRadius: '0', backgroundColor: 'rgba(8, 60, 181, 0.85)'}}>
                {/* Вырез в правом верхнем углу с плавным закруглением */}
                <div className="absolute top-0 right-0 w-14 h-14 bg-background" style={{borderBottomLeftRadius: '100%', borderTopRightRadius: '8px'}}></div>
                {/* Логотип компании вместо кружочка со стрелкой */}
                <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10 bg-white p-1">
                  <picture>
                    <source srcSet="/logo_norda.webp" type="image/webp" />
                    <img 
                      src="/logo_norda.png" 
                      alt="NORDA TRANS Logo" 
                      width="48"
                      height="48"
                      className="w-full h-full object-contain"
                    />
                  </picture>
                </div>
                
                <h2 className="text-4xl font-bold leading-tight text-white">
                  Норда транс –<br />правильная логистика
                </h2>
              </div>
            </div>
            
            {/* Right side - Advantages cards stacked vertically in cascade */}
            <div className="flex flex-col gap-4 w-[280px]">
              {/* First card - shifted left by 50% */}
              <div className="relative text-center p-4 rounded-lg shadow-sm hover:shadow-md transition-all h-[80px] flex flex-col justify-center" style={{backgroundColor: 'rgba(64, 91, 154, 0.85)', marginLeft: '-140px'}}>
                <h3 className="text-base font-semibold mb-1 text-white">Надежность</h3>
                <p className="text-white/90 text-sm">Гарантируем безопасную доставку ваших грузов</p>
              </div>
              
              {/* Second card - shifted left by 25% (middle position) */}
              <div className="relative text-center p-4 rounded-lg shadow-sm hover:shadow-md transition-all h-[80px] flex flex-col justify-center" style={{backgroundColor: 'rgba(64, 91, 154, 0.85)', marginLeft: '-70px'}}>
                <h3 className="text-base font-semibold mb-1 text-white">Скорость</h3>
                <p className="text-white/90 text-sm">Быстрая доставка по оптимальным маршрутам</p>
              </div>
              
              {/* Third card - stays in place (no shift) */}
              <div className="relative text-center p-4 rounded-lg shadow-sm hover:shadow-md transition-all h-[80px] flex flex-col justify-center" style={{backgroundColor: 'rgba(64, 91, 154, 0.85)'}}>
                <h3 className="text-base font-semibold mb-1 text-white">Качество</h3>
                <p className="text-white/90 text-sm">Профессиональный подход к каждому клиенту</p>
              </div>
            </div>
          </div>
        </div>
      </BannerUp>

      {/* Mobile Call Button - только для мобильных */}
      <div className="md:hidden w-full px-4 py-4 bg-background">
        <a 
          href="tel:+74994440651"
          className="mobile-call-button flex items-center justify-center gap-3 w-full py-5 rounded-2xl text-white font-bold text-lg shadow-2xl hover:shadow-[0_0_30px_rgba(8,60,181,0.6)] transition-all active:scale-95 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #083cb5 0%, #0a4dd6 100%)',
            boxShadow: '0 8px 32px rgba(8,60,181,0.4), 0 0 20px rgba(8,60,181,0.3)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          <Phone className="w-7 h-7 relative z-10 animate-bounce" style={{animationDuration: '2s'}} />
          <span className="relative z-10">Позвонить +7 (499) 444-06-51</span>
        </a>
      </div>

      {/* Calculator and Routes Section */}
      <section id="calculator" className="w-full py-12 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column - Calculator Form (Hidden on mobile) */}
            <div className="hidden md:block">
              <ShippingCalculatorForm
              routeData={{
                fromCity,
                toCity,
                fromCoordinates,
                toCoordinates,
                routeDistance,
                routeDuration,
                isCalculatingRoute,
              }}
              calculatorState={{
                calculatorStep,
                showFinalPrice,
                transportType,
                weightIndex,
                volumeIndex,
                estimatedCost,
              }}
              movingData={{
                movingItems,
                boxesCount,
                furnitureDetails,
                appliancesDetails,
              }}
              cargoData={{
                cargoPackaging,
                palletCount,
                cargoNature,
              }}
              foodData={{
                truckType,
                temperatureMode,
                foodPackaging,
                foodPalletCount,
              }}
              otherData={{
                otherPackaging,
                otherPalletCount,
                otherNature,
              }}
              contactData={{
                contactMethod,
                userContact,
                showContactForm,
                managerName,
                managerPhone,
              }}
              actions={{
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
              }}
              />
            </div>
            
            {/* Right Column - Routes Accordion (Full width on mobile) */}
            <RoutesAccordion />
          </div>
        </div>
      </section>

      {/* Work Process Section - Работаем быстро! */}
      <WorkProcess />

      {/* Yandex Reviews Section - Desktop */}
      <Reviews />
      
      {/* Yandex Reviews Section - Mobile */}
      <div className="md:hidden">
        <ReviewsMobile />
      </div>

      {/* Яндекс Метрика - загружается с отложенной загрузкой */}
      <YandexMetrika />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
