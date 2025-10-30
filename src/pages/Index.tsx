import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, Clock, Shield, TrendingUp, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import YandexMetrika from "@/components/YandexMetrika";
import { ShippingCalculatorForm } from "@/components/ShippingCalculatorForm";
import { useYandexMetrika } from "@/hooks/useYandexMetrika";
import { BannerUp } from "@/components/BannerUp";

const Index = () => {
  const navigate = useNavigate();
  
  // Form states
  const [calculatorStep, setCalculatorStep] = useState(1);
  const [showFinalPrice, setShowFinalPrice] = useState(false);
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [fromCoordinates, setFromCoordinates] = useState<[number, number] | undefined>();
  const [toCoordinates, setToCoordinates] = useState<[number, number] | undefined>();
  const [transportType, setTransportType] = useState("");
  const [weightIndex, setWeightIndex] = useState(0);
  const [volumeIndex, setVolumeIndex] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeDuration, setRouteDuration] = useState<number | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Домашний переезд
  const [movingItems, setMovingItems] = useState({
    boxes: false,
    furniture: false,
    appliances: false,
  });
  const [boxesCount, setBoxesCount] = useState("");
  const [furnitureDetails, setFurnitureDetails] = useState("");
  const [appliancesDetails, setAppliancesDetails] = useState("");

  // Промышленные товары
  const [cargoPackaging, setCargoPackaging] = useState("");
  const [palletCount, setPalletCount] = useState("");
  const [cargoNature, setCargoNature] = useState("");

  // Продукты питания
  const [truckType, setTruckType] = useState("");
  const [temperatureMode, setTemperatureMode] = useState("");
  const [foodPackaging, setFoodPackaging] = useState("");
  const [foodPalletCount, setFoodPalletCount] = useState("");

  // Другое
  const [otherPackaging, setOtherPackaging] = useState("");
  const [otherPalletCount, setOtherPalletCount] = useState("");
  const [otherNature, setOtherNature] = useState("");

  // Контактная информация менеджера
  const [managerName] = useState("Дарья");
  const [managerPhone] = useState("+7 (499) 444 06 51");

  // Форма для получения точного расчёта
  const [contactMethod, setContactMethod] = useState<"phone" | "whatsapp">("phone");
  const [userContact, setUserContact] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);

  // Яндекс Метрика
  const { reachGoal } = useYandexMetrika(57594511);

  return (
    <div className="min-h-screen flex flex-col">
      <YandexMetrika />
      <Header />
      
      {/* Hero Section */}
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

      {/* Work Fast Section */}
      <section className="w-full py-16 bg-[#f0f3f5]">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12" style={{color: '#083cb5'}}>
            Работаем быстро
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Быстрая подача</h3>
              <p className="text-muted-foreground">
                Автомобиль подается в течение 2-3 часов после заявки
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Широкий автопарк</h3>
              <p className="text-muted-foreground">
                Более 100 единиц техники различной грузоподъёмности
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Надёжность</h3>
              <p className="text-muted-foreground">
                Страхование груза и полная ответственность за сохранность
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Выгодные цены</h3>
              <p className="text-muted-foreground">
                Цены ниже, чем у конкурентов, без потери качества
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator and Company Info Section */}
      <section id="calculator" className="w-full py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left Column - Calculator */}
            <div>
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

            {/* Right Column - Company Info */}
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-6" style={{color: '#083cb5'}}>
                О компании НОРДА ТРАНС
              </h2>
              
              <div className="space-y-4 text-lg leading-relaxed text-muted-foreground">
                <p>
                  Автомобильные грузоперевозки — основная специализация нашей компании. 
                  Мы осуществляем доставку любого груза в любую точку быстро, недорого и оперативно!
                </p>
                
                <p>
                  Благодаря оптимизации внутренних процессов мы достигли золотой середины, смогли сделать так, 
                  чтобы наши цены были значительно ниже, чем у конкурентов, 
                  а качество услуг на самом высшем уровне!
                </p>
                
                <p>
                  Подтверждением этого служит хороший рейтинг и множество положительных отзывов 
                  Яндекс и самой главной бирже перевозчиков России и СНГ 
                  Авто Транс Инфо.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Button 
                  size="lg"
                  style={{backgroundColor: '#083cb5'}}
                  onClick={() => navigate('/tarify')}
                >
                  Смотреть тарифы
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    window.location.href = 'tel:+74994440651';
                  }}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Позвонить
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
