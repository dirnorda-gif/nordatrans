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
import { FlipProblemsSection } from "@/components/FlipProblemsSection";
import CustomRouteRequest from "@/components/CustomRouteRequest";
import { NewStepCalculator } from "@/components/NewStepCalculator";
import { CouponSection } from "@/components/CouponSection";

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
              <div className="relative p-6 rounded-lg shadow-sm hover:shadow-md transition-all overflow-visible" style={{backgroundColor: '#073CB5'}}>
                {/* Пульсирующие окружности - первый вариант (приглушённый) */}
                <div className="absolute -top-3 -right-3 w-16 h-16">
                  {/* Первая пульсирующая окружность */}
                  <div 
                    className="absolute inset-0 rounded-full border-[3px] border-white"
                    style={{
                      animation: 'pulse-ring 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }}
                  ></div>
                  {/* Вторая пульсирующая окружность с задержкой */}
                  <div 
                    className="absolute inset-0 rounded-full border-[3px] border-white"
                    style={{
                      animation: 'pulse-ring 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      animationDelay: '0.75s',
                    }}
                  ></div>
                  {/* Третья пульсирующая окружность с задержкой */}
                  <div 
                    className="absolute inset-0 rounded-full border-[3px] border-white"
                    style={{
                      animation: 'pulse-ring 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      animationDelay: '1.5s',
                    }}
                  ></div>
                </div>
                
                {/* Логотип компании (увеличенный) */}
                <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10 bg-white p-2">
                  <picture>
                    <source srcSet="/logo_norda.webp" type="image/webp" />
                    <img 
                      src="/logo_norda.png" 
                      alt="NORDA TRANS Logo"
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

      {/* New Step Calculator */}
      <section className="w-full py-16 relative overflow-hidden" style={{
        background: 'linear-gradient(75deg, #ffffff 0%, #ffffff 40%, #f5f8fc 48%, #e8f0fa 52%, #d4e4f7 58%, #c0d8f3 64%, #aacbef 70%, #94beeb 76%, #7eb1e7 82%, #68a4e3 88%, #5297df 94%, #083cb5 100%)'
      }}>
        <div className="flex justify-center px-[50px] relative z-10">
          <NewStepCalculator />
        </div>
      </section>

      {/* Coupon Section and Routes */}
      <section id="calculator" className="w-full py-12 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Coupon Section */}
            <CouponSection />
            
            {/* Right Column - Routes Accordion */}
            <RoutesAccordion initialDirection="from-moscow" />
          </div>
        </div>
      </section>

      {/* Custom Route Request - Индивидуальный маршрут (только мобильные) */}
      <CustomRouteRequest />

      {/* Yandex Reviews Section - Desktop */}
      <Reviews />
      
      {/* Yandex Reviews Section - Mobile */}
      <div className="md:hidden">
        <ReviewsMobile />
      </div>

      {/* Work Process Section - Работаем быстро! */}
      <WorkProcess />

      {/* Flip Problems Section - Интерактивное сравнение проблем и решений */}
      <FlipProblemsSection />

      {/* Яндекс Метрика - загружается с отложенной загрузкой */}
      <YandexMetrika />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
