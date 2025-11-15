import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Truck, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { createBitrix24Lead } from "@/utils/bitrix24";
import { toast } from "sonner";
import { getRouteCache, loadRouteCacheDelayed } from "@/utils/routeCacheManager";
import { useIsMobile } from "@/hooks/use-mobile";

// ============================================================================
// ТИПЫ
// ============================================================================

interface PriceItem {
  weight: string;
  price: string;
}

interface Route {
  from: string;
  to: string;
  distance: string;
  prices: PriceItem[];
}

// ============================================================================
// ВНУТРЕННИЙ UI-КОМПОНЕНТ: Аккордеон с маршрутами
// ============================================================================

const RoutesAccordionUI = ({ 
  routes, 
  onOrderClick,
  initialVisibleCount,
  showMoreButton = true 
}: { 
  routes: Route[]; 
  onOrderClick?: (route: Route) => void;
  initialVisibleCount?: number;
  showMoreButton?: boolean;
}) => {
  const [showAll, setShowAll] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<string>("");
  const [selectedPrice, setSelectedPrice] = useState<string>("");
  const [contactMethod, setContactMethod] = useState<"phone" | "whatsapp">("phone");
  const [userContact, setUserContact] = useState<string>("");
  const isMobile = useIsMobile();
  
  // Сортируем маршруты по алфавиту на мобильных устройствах
  const sortedRoutes = isMobile 
    ? [...routes].sort((a, b) => {
        // Сортируем по городу отправления (from) для "В Москву" или по городу назначения (to) для "Из Москвы"
        const cityA = a.from === "Москва" ? a.to : a.from;
        const cityB = b.from === "Москва" ? b.to : b.from;
        return cityA.localeCompare(cityB, 'ru');
      })
    : routes;
  
  // На мобильных показываем все маршруты сразу, на десктопе - как указано
  const effectiveVisibleCount = isMobile ? sortedRoutes.length : (initialVisibleCount || routes.length);
  
  // Если не указано количество или оно больше/равно общему - показываем все
  // На мобильных кнопка "Ещё маршруты" не показывается
  const shouldLimitRoutes = !isMobile && effectiveVisibleCount < sortedRoutes.length && showMoreButton;
  const visibleRoutes = shouldLimitRoutes && !showAll 
    ? sortedRoutes.slice(0, effectiveVisibleCount) 
    : sortedRoutes;
  const hiddenCount = sortedRoutes.length - effectiveVisibleCount;

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

  // Обработчик клика на карточку цены
  const handlePriceClick = (route: Route, weight: string, price: string) => {
    setSelectedRoute(route);
    setSelectedWeight(weight);
    setSelectedPrice(price);
    setIsDialogOpen(true);
  };

  // Обработчик отправки формы
  const handleSubmit = async () => {
    if (!userContact || userContact.trim() === "") {
      toast.error("Пожалуйста, укажите номер телефона или WhatsApp");
      return;
    }
    if (!selectedRoute) {
      toast.error("Ошибка: маршрут не выбран");
      return;
    }

    const leadData = {
      fromCity: selectedRoute.from,
      toCity: selectedRoute.to,
      phone: userContact,
      distance: parseInt(selectedRoute.distance),
      weight: parseFloat(selectedWeight.replace(/[^\d.]/g, '')) || 0,
      volume: 0, // Значение по умолчанию для маршрутов
      cost: parseInt(selectedPrice.replace(/[^\d]/g, '')),
      truckCapacity: selectedWeight, // Используем текст веса как грузоподъемность
      contactMethod,
      additionalInfo: {
        source: "routes_accordion",
        direction: `${selectedRoute.from} → ${selectedRoute.to}`,
      }
    };

    const loadingToastId = toast.loading(
      <div className="flex flex-col gap-2 py-2">
        <p className="text-lg font-semibold">Отправляем вашу заявку...</p>
        <p className="text-sm text-gray-600">Пожалуйста, подождите</p>
      </div>, 
      { duration: Infinity }
    );

    try {
      const result = await createBitrix24Lead(leadData);
      if (result.success) {
        toast.success(
          <div className="flex flex-col gap-2 py-2">
            <p className="text-lg font-semibold">✅ Заявка успешно отправлена!</p>
            <p className="text-sm">Заявка №{result.leadId}</p>
            <p className="text-sm text-gray-600">Менеджер свяжется с вами в ближайшее время</p>
          </div>, 
          { id: loadingToastId, duration: 5000 }
        );
        setUserContact("");
        setIsDialogOpen(false);
      } else {
        toast.error(
          <div className="flex flex-col gap-2 py-2">
            <p className="text-lg font-semibold">❌ Ошибка при отправке</p>
            <p className="text-sm">{result.error}</p>
          </div>, 
          { id: loadingToastId, duration: 5000 }
        );
      }
    } catch (error) {
      toast.error("Произошла ошибка при отправке заявки", { id: loadingToastId });
      console.error("Ошибка:", error);
    }
  };

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full space-y-2">
        {visibleRoutes.map((route, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index}`} 
            className="bg-white border-blue-300 border rounded-lg px-3 transition-all duration-200"
          >
            <AccordionTrigger className="hover:no-underline py-2">
              <div className="flex items-center justify-between w-full pr-3">
                <div className="text-left w-full">
                  <p className="font-semibold md:text-base text-sm">{route.from} → {route.to}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4">
                {/* Weight categories with prices - кликабельные карточки */}
                <div className="grid md:grid-cols-2 grid-cols-1 gap-3">
                  {route.prices.map((priceItem, priceIndex) => (
                    <div 
                      key={priceIndex} 
                      className="bg-blue-100 border-blue-300 border rounded-lg p-3 shadow-sm cursor-pointer transition-all hover:bg-blue-200 hover:border-blue-400 hover:shadow-md active:scale-95"
                      onClick={() => handlePriceClick(route, priceItem.weight, priceItem.price)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{priceItem.weight}</span>
                        <span className="font-bold text-primary">{priceItem.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Time in transit */}
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Время в пути:</span>
                    <span className="font-semibold">1-2 дня</span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      {/* Dialog для оформления заказа */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className={isMobile ? "space-y-1" : ""}>
            <DialogTitle className={isMobile ? "text-lg font-bold text-center" : "text-xl font-bold text-center"}>
              Предварительная стоимость
            </DialogTitle>
          </DialogHeader>
          
          {selectedRoute && (
            <div className={isMobile ? "space-y-2 py-2" : "space-y-4 py-4"}>
              {/* Информация о маршруте */}
              <div className={isMobile ? "bg-blue-50 rounded-lg p-2 space-y-2" : "bg-blue-50 rounded-lg p-4 space-y-3"}>
                {/* Стоимость - первой и по центру для всех */}
                <div className={isMobile ? "text-center pb-2 border-b border-blue-200" : "text-center pb-3 border-b border-blue-200"}>
                  <p className={isMobile ? "font-bold text-3xl text-primary" : "font-bold text-4xl text-primary"}>{selectedPrice}</p>
                </div>
                
                <div>
                  <p className={isMobile ? "text-xs text-muted-foreground" : "text-sm text-muted-foreground"}>Маршрут</p>
                  <p className={isMobile ? "font-semibold text-sm" : "font-semibold text-lg"}>{selectedRoute.from} → {selectedRoute.to}</p>
                </div>
                
                <div className={isMobile ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 gap-4"}>
                  <div>
                    <p className={isMobile ? "text-xs text-muted-foreground" : "text-sm text-muted-foreground"}>Расстояние</p>
                    <p className={isMobile ? "font-semibold text-sm" : "font-semibold"}>{selectedRoute.distance}</p>
                  </div>
                  <div>
                    <p className={isMobile ? "text-xs text-muted-foreground" : "text-sm text-muted-foreground"}>Вес</p>
                    <p className={isMobile ? "font-semibold text-sm" : "font-semibold"}>{selectedWeight}</p>
                  </div>
                </div>
              </div>

              {/* Информационное сообщение */}
              <div className={isMobile ? "bg-yellow-50 border border-yellow-200 rounded-lg p-2" : "bg-yellow-50 border border-yellow-200 rounded-lg p-3"}>
                <p className="text-xs text-yellow-800">
                  ⚠️ Указанная стоимость является предварительной. 
                  Точная цена будет рассчитана менеджером с учётом всех деталей перевозки.
                </p>
              </div>

              {/* Заголовок "Получите точный расчёт" для всех */}
              <div className="text-center">
                <h3 className={isMobile ? "text-xl font-bold text-primary" : "text-2xl font-bold text-primary"}>Получите точный расчёт</h3>
              </div>

              {/* Способ связи */}
              <div className={isMobile ? "space-y-1" : "space-y-2"}>
                <Label className={isMobile ? "text-xs font-semibold" : "text-sm font-semibold"}>
                  Как вы хотите получить расчёт?
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={contactMethod === "phone" ? "default" : "outline"}
                    className={isMobile ? "h-9 text-sm" : "h-10"}
                    onClick={() => setContactMethod("phone")}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Звонок
                  </Button>
                  <Button
                    type="button"
                    variant={contactMethod === "whatsapp" ? "default" : "outline"}
                    className={isMobile ? "h-9 text-sm" : "h-10"}
                    onClick={() => setContactMethod("whatsapp")}
                    style={contactMethod === "whatsapp" ? {backgroundColor: '#25D366'} : {}}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </div>

              {/* Поле ввода контакта */}
              <div className={isMobile ? "space-y-1" : "space-y-2"}>
                <Label htmlFor="contact" className={isMobile ? "text-xs font-semibold" : "text-sm font-semibold"}>
                  {contactMethod === "phone" ? "Ваш номер телефона" : "Ваш номер WhatsApp"}
                </Label>
                <Input
                  id="contact"
                  type="tel"
                  placeholder="+7 (999) 999-99-99"
                  value={userContact}
                  onChange={handlePhoneChange}
                  onFocus={(e) => {
                    if (!e.target.value) {
                      setUserContact('+7 ');
                    }
                  }}
                  className={isMobile ? "h-9" : "h-10"}
                  autoComplete="tel"
                />
              </div>

              {/* Кнопки */}
              <div className={isMobile ? "flex gap-2 pt-1" : "flex gap-3 pt-2"}>
                <Button
                  type="button"
                  variant="outline"
                  className={isMobile ? "flex-1 h-9 text-sm" : "flex-1"}
                  onClick={() => {
                    setIsDialogOpen(false);
                    setUserContact("");
                  }}
                >
                  Отмена
                </Button>
                <Button
                  type="button"
                  className={isMobile ? "flex-1 h-9 text-sm" : "flex-1"}
                  style={{backgroundColor: '#083cb5'}}
                  disabled={!userContact || userContact.length < 10}
                  onClick={handleSubmit}
                >
                  Получить расчёт
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Кнопка "Еще маршруты" */}
      {shouldLimitRoutes && !showAll && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            className="w-full max-w-md mb-[12px]"
            onClick={() => setShowAll(true)}
          >
            Еще маршруты ({hiddenCount})
          </Button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// ГЛАВНЫЙ КОМПОНЕНТ: Аккордеон популярных маршрутов
// ============================================================================
// Этот компонент содержит всю логику работы с популярными маршрутами:
// - Загрузка данных маршрутов из JSON
// - Переключение направления (В Москву / Из Москвы)
// - Отображение аккордеона с маршрутами
// - Управление количеством видимых маршрутов
// 
// ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ:
// <RoutesAccordion /> - показать 7 маршрутов "В Москву" (по умолчанию)
// <RoutesAccordion initialVisibleCount={3} /> - показать 3 маршрута
// <RoutesAccordion initialDirection="from-moscow" /> - показать маршруты "Из Москвы"
// <RoutesAccordion showMoreButton={false} /> - показать все маршруты без кнопки
// 
// Подробная документация: НАСТРОЙКА-АККОРДЕОНА-МАРШРУТОВ.md
// ============================================================================

/**
 * Параметры компонента RoutesAccordion
 */
interface RoutesAccordionProps {
  /** 
   * Количество маршрутов, видимых изначально.
   * Остальные маршруты будут скрыты до нажатия кнопки "Еще маршруты"
   * @default 7
   */
  initialVisibleCount?: number;
  
  /** 
   * Показывать ли кнопку "Еще маршруты".
   * Если false, все маршруты отображаются сразу
   * @default true
   */
  showMoreButton?: boolean;
  
  /** 
   * Начальное направление маршрутов.
   * "to-moscow" - В Москву, "from-moscow" - Из Москвы
   * @default "to-moscow"
   */
  initialDirection?: "to-moscow" | "from-moscow";
}

/**
 * Компонент аккордеона популярных маршрутов с управлением количеством видимых элементов
 * 
 * @param initialVisibleCount - количество маршрутов, видимых изначально (по умолчанию 7)
 * @param showMoreButton - показывать ли кнопку "Еще маршруты" (по умолчанию true)
 * @param initialDirection - начальное направление маршрутов (по умолчанию "to-moscow")
 */
export const RoutesAccordion = ({ 
  initialVisibleCount = 7,
  showMoreButton = true,
  initialDirection = "to-moscow"
}: RoutesAccordionProps = {}) => {
  // ============================================================================
  // STATE
  // ============================================================================
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const [routeCache, setRouteCache] = useState<any>(getRouteCache());
  const [routeDirection, setRouteDirection] = useState<"to-moscow" | "from-moscow">(initialDirection);

  // ============================================================================
  // ВЫЧИСЛЯЕМЫЕ ЗНАЧЕНИЯ
  // ============================================================================
  
  const routesToMoscow = routeCache?.routes?.toMoscow || [];
  const routesFromMoscow = routeCache?.routes?.fromMoscow || [];
  const currentRoutes = routeDirection === "to-moscow" ? routesToMoscow : routesFromMoscow;

  // ============================================================================
  // ФУНКЦИИ НАВИГАЦИИ
  // ============================================================================
  
  /**
   * Обработчик переключения направления маршрутов
   * Определяет текущую страницу и выполняет навигацию на соответствующий URL
   * Сохраняет позицию скролла, чтобы аккордеон оставался на месте
   */
  const handleDirectionChange = (newDirection: "to-moscow" | "from-moscow") => {
    const currentPath = location.pathname;
    
    // Определяем маппинг URL для разных страниц
    const routeMapping: Record<string, { toMoscow: string; fromMoscow: string }> = {
      '/tarify': { toMoscow: '/tarify', fromMoscow: '/tarify-iz-moskvy' },
      '/tarify-iz-moskvy': { toMoscow: '/tarify', fromMoscow: '/tarify-iz-moskvy' },
      '/pereezd': { toMoscow: '/pereezd', fromMoscow: '/pereezd-iz' },
      '/pereezd-iz': { toMoscow: '/pereezd', fromMoscow: '/pereezd-iz' },
    };
    
    // Проверяем, есть ли маппинг для текущей страницы
    const mapping = routeMapping[currentPath];
    
    if (mapping) {
      // Если есть маппинг - выполняем навигацию
      const targetUrl = newDirection === "to-moscow" ? mapping.toMoscow : mapping.fromMoscow;
      
      // Переходим только если URL отличается от текущего
      if (targetUrl !== currentPath) {
        // Сохраняем текущую позицию скролла
        const scrollPosition = window.scrollY;
        
        // Выполняем навигацию с передачей информации о позиции скролла
        navigate(targetUrl, { 
          state: { 
            preserveScroll: true,
            scrollPosition: scrollPosition
          }
        });
      }
    } else {
      // Если маппинга нет (например, главная страница) - просто меняем состояние
      setRouteDirection(newDirection);
    }
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  // Восстановление позиции скролла после навигации (только для переключения направлений)
  useEffect(() => {
    const state = location.state as { preserveScroll?: boolean; scrollPosition?: number } | null;
    
    if (state?.preserveScroll && typeof state.scrollPosition === 'number') {
      // Восстанавливаем сохраненную позицию скролла
      // Используем requestAnimationFrame для синхронизации с отрисовкой браузера
      requestAnimationFrame(() => {
        window.scrollTo({
          top: state.scrollPosition,
          behavior: 'instant' // Мгновенный скролл без анимации
        });
      });
    }
  }, [location.state]);
  
  // Синхронизация состояния направления с текущим URL
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Определяем направление на основе URL
    if (currentPath === '/tarify-iz-moskvy' || currentPath === '/pereezd-iz') {
      setRouteDirection('from-moscow');
    } else if (currentPath === '/tarify' || currentPath === '/pereezd') {
      setRouteDirection('to-moscow');
    }
    // Для остальных страниц (например, главная) оставляем initialDirection
  }, [location.pathname]);
  
  // Загрузка данных маршрутов с задержкой (оптимизация производительности)
  // Использует глобальный кэш - данные загружаются только один раз для всего приложения
  useEffect(() => {
    // Если данные уже есть в глобальном кэше - используем их сразу
    const cachedData = getRouteCache();
    if (cachedData) {
      setRouteCache(cachedData);
      return;
    }

    // Если данных нет - загружаем с задержкой (только при первом монтировании на любой странице)
    loadRouteCacheDelayed(1000).then((data) => {
      setRouteCache(data);
    }).catch((error) => {
      console.error('❌ Ошибка загрузки данных маршрутов:', error);
    });
  }, []); // Пустой массив зависимостей - выполняется только при монтировании

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="space-y-6">
      <div 
        className="relative bg-blue-100 rounded-lg p-3 border border-blue-300 shadow-sm"
        style={{
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

        {/* Кнопка с иконкой грузовика (ЛЕВЫЙ верхний угол) */}
        <div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            width: 60,
            height: 60,
            top: 1,
            left: -1,
            backgroundColor: '#d1d5db',
            zIndex: 50,
          }}
        >
          <Truck className="w-7 h-7" style={{color: '#405b9a'}} />
        </div>

        {/* Header */}
        <div className="flex items-center md:justify-center justify-end mb-3 relative z-10 md:pr-0 pr-5" style={{marginTop: '20px'}}>
          <h2 className="md:text-2xl text-lg font-bold md:text-center text-right">Популярные маршруты</h2>
        </div>
        
        {/* Direction Toggle */}
        <div className="flex gap-2 mb-6 relative z-10" style={{marginTop: '55px', marginBottom: '27px'}}>
          <Button
            variant={routeDirection === "to-moscow" ? "default" : "outline"}
            onClick={() => handleDirectionChange("to-moscow")}
            className="flex-1"
          >
            В Москву
          </Button>
          <Button
            variant={routeDirection === "from-moscow" ? "default" : "outline"}
            onClick={() => handleDirectionChange("from-moscow")}
            className="flex-1"
          >
            Из Москвы
          </Button>
        </div>
        
        {/* Routes Accordion */}
        <div className="relative z-10">
          <RoutesAccordionUI 
            routes={currentRoutes} 
            initialVisibleCount={initialVisibleCount}
            showMoreButton={showMoreButton}
          />
        </div>
      </div>
    </div>
  );
};
