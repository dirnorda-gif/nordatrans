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
  
  // Если не указано количество или оно больше/равно общему - показываем все
  const shouldLimitRoutes = initialVisibleCount && initialVisibleCount < routes.length && showMoreButton;
  const visibleRoutes = shouldLimitRoutes && !showAll 
    ? routes.slice(0, initialVisibleCount) 
    : routes;
  const hiddenCount = routes.length - (initialVisibleCount || 0);

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
      weight: selectedWeight,
      cost: parseInt(selectedPrice.replace(/[^\d]/g, '')),
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
            className="bg-blue-100 border-blue-300 border rounded-lg px-3 transition-all duration-200"
          >
            <AccordionTrigger className="hover:no-underline py-2">
              <div className="flex items-center justify-between w-full pr-3">
                <div className="text-left">
                  <p className="font-semibold text-base">{route.from} → {route.to}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4">
                {/* Weight categories with prices - кликабельные карточки */}
                <div className="grid grid-cols-2 gap-3">
                  {route.prices.map((priceItem, priceIndex) => (
                    <div 
                      key={priceIndex} 
                      className="bg-white/70 rounded-lg p-3 border border-border/50 shadow-sm cursor-pointer transition-all hover:bg-primary/10 hover:border-primary/50 hover:shadow-md active:scale-95"
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
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Получить точный расчёт</DialogTitle>
            <DialogDescription>
              Выберите удобный способ связи
            </DialogDescription>
          </DialogHeader>
          
          {selectedRoute && (
            <div className="space-y-4 py-4">
              {/* Информация о маршруте */}
              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Маршрут</p>
                  <p className="font-semibold text-lg">{selectedRoute.from} → {selectedRoute.to}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Расстояние</p>
                    <p className="font-semibold">{selectedRoute.distance} км</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Вес</p>
                    <p className="font-semibold">{selectedWeight}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Предварительная стоимость</p>
                  <p className="font-bold text-2xl text-primary">{selectedPrice}</p>
                </div>
              </div>

              {/* Способ связи */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Как с вами связаться?</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={contactMethod === "phone" ? "default" : "outline"}
                    className="h-10"
                    onClick={() => setContactMethod("phone")}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Звонок
                  </Button>
                  <Button
                    type="button"
                    variant={contactMethod === "whatsapp" ? "default" : "outline"}
                    className="h-10"
                    onClick={() => setContactMethod("whatsapp")}
                    style={contactMethod === "whatsapp" ? {backgroundColor: '#25D366'} : {}}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </div>

              {/* Поле ввода контакта */}
              <div className="space-y-2">
                <Label htmlFor="contact" className="text-sm font-semibold">
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
                  className="h-10"
                  autoComplete="tel"
                />
              </div>

              {/* Информационное сообщение */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  ⚠️ Указанная стоимость является предварительной. 
                  Точная цена будет рассчитана менеджером с учётом всех деталей перевозки.
                </p>
              </div>

              {/* Кнопки */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setUserContact("");
                  }}
                >
                  Отмена
                </Button>
                <Button
                  type="button"
                  className="flex-1"
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
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowAll(true)}
        >
          Еще маршруты ({hiddenCount})
        </Button>
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
      <div className="bg-blue-50/50 rounded-lg p-6 border border-blue-200 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Truck className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Популярные маршруты</h2>
        </div>
        
        {/* Direction Toggle */}
        <div className="flex gap-2 mb-6">
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
        <RoutesAccordionUI 
          routes={currentRoutes} 
          initialVisibleCount={initialVisibleCount}
          showMoreButton={showMoreButton}
        />
      </div>
    </div>
  );
};
