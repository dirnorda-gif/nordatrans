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
      <BannerUp className="hidden md:block w-full h-[280px]" overlayType="white" />

      {/* New Step Calculator */}
      <section className="w-full py-16 relative overflow-hidden" style={{
        background: 'linear-gradient(75deg, #ffffff 0%, #ffffff 40%, #f5f8fc 48%, #e8f0fa 52%, #d4e4f7 58%, #c0d8f3 64%, #aacbef 70%, #94beeb 76%, #7eb1e7 82%, #68a4e3 88%, #5297df 94%, #083cb5 100%)'
      }}>
        <div className="flex justify-center lg:px-[50px] relative z-10">
          <NewStepCalculator />
        </div>
      </section>

      {/* Mobile: Routes and Custom Route Request - показываем сразу после калькулятора */}
      <section className="lg:hidden w-full py-8 bg-background">
        <div className="container mx-auto px-6">
          {/* Популярные маршруты */}
          <RoutesAccordion initialDirection="from-moscow" />
          
          {/* Не нашли нужного маршрута? */}
          <div className="mt-8">
            <CustomRouteRequest />
          </div>
        </div>
      </section>

      {/* Desktop: Coupon Section and Routes */}
      <section id="calculator" className="hidden lg:block w-full py-12 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Coupon Section */}
            <CouponSection />
            
            {/* Right Column - Routes Accordion */}
            <RoutesAccordion initialDirection="from-moscow" />
          </div>
        </div>
      </section>

      {/* Desktop: Custom Route Request */}
      <div className="hidden lg:block">
        <CustomRouteRequest />
      </div>

      {/* Mobile: Coupon Section */}
      <section className="lg:hidden w-full py-8 bg-background">
        <div className="container mx-auto px-6">
          <CouponSection />
        </div>
      </section>

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
