import { useState, useMemo, useEffect } from "react";
import * as React from "react";
import { Search, X, Plus, Minus, Package, Trash2, AlertTriangle, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  MOVING_ITEMS_DATABASE,
  CATEGORIES,
  PACKING_COEFFICIENT,
  TRUCK_HEIGHTS,
  searchItems,
  type MovingItem,
} from "@/data/movingItemsDatabase";
import { calculatePackingHybrid } from "@/utils/binPacking2D";
import { PackingVisualization } from "@/components/PackingVisualization";

interface SelectedItem {
  item: MovingItem;
  quantity: number;
}

interface MovingConstructorProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (totalVolume: number, recommendedTruck?: string, floorUtilization?: number, selectedItems?: SelectedItem[]) => void;
  initialVolume?: number;
  initialSelectedItems?: SelectedItem[]; // Начальные выбранные предметы
}

// Экспортируем интерфейс для использования в других компонентах
export type { SelectedItem };

export const MovingConstructor = ({
  isOpen,
  onClose,
  onApply,
  initialVolume = 0,
  initialSelectedItems = [],
}: MovingConstructorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof CATEGORIES | "all">("all");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>(initialSelectedItems);
  const [showVisualizationModal, setShowVisualizationModal] = useState(false);
  
  // 📱 State для переключения между вкладками на мобильных
  const [mobileTab, setMobileTab] = useState<'items' | 'cart'>('items');
  
  // Устанавливаем начальные предметы при открытии модального окна
  React.useEffect(() => {
    if (isOpen && initialSelectedItems.length > 0) {
      console.log('🔄 [MovingConstructor] Загрузка начальных предметов:', initialSelectedItems.length);
      setSelectedItems(initialSelectedItems);
      // Переключаемся на вкладку корзины, чтобы показать загруженные предметы
      setMobileTab('cart');
    }
  }, [isOpen, initialSelectedItems]);

  // Поиск и фильтрация предметов
  const filteredItems = useMemo(() => {
    let items = searchQuery ? searchItems(searchQuery) : MOVING_ITEMS_DATABASE;
    
    if (selectedCategory !== "all") {
      items = items.filter(item => item.category === selectedCategory);
    }
    
    return items;
  }, [searchQuery, selectedCategory]);

  // ========== ГИБРИДНЫЙ РАСЧЁТ: Объём + 2D-упаковка ==========
  const packingResult = useMemo(() => {
    if (selectedItems.length === 0) return null;
    return calculatePackingHybrid(selectedItems);
  }, [selectedItems]);

  // Расчёт объёмов (классический)
  const totalVolume = useMemo(() => {
    return selectedItems.reduce((sum, { item, quantity }) => {
      return sum + item.volume * quantity;
    }, 0);
  }, [selectedItems]);

  const packedVolume = useMemo(() => {
    return totalVolume * PACKING_COEFFICIENT;
  }, [totalVolume]);

  // Максимальная высота предметов
  const maxHeight = useMemo(() => {
    if (selectedItems.length === 0) return 0;
    return Math.max(...selectedItems.map(si => si.item.height));
  }, [selectedItems]);

  // Проверка наличия холодильника
  const hasFridge = useMemo(() => {
    return selectedItems.some(si => si.item.id.startsWith('fridge_'));
  }, [selectedItems]);

  // Рекомендация по машине с учётом объёма
  const recommendedTruckByVolume = useMemo(() => {
    if (packedVolume <= 2) return '500кг';
    if (packedVolume <= 6) return '1.5т';
    if (packedVolume <= 12) return '3т';
    if (packedVolume <= 20) return '5т';
    if (packedVolume <= 40) return '10т';
    return '20т';
  }, [packedVolume]);

  // Рекомендация по машине с учётом высоты
  const recommendedTruckByHeight = useMemo(() => {
    if (maxHeight === 0) return '500кг';
    if (maxHeight <= TRUCK_HEIGHTS["500кг"]) return '500кг';
    if (maxHeight <= TRUCK_HEIGHTS["1.5т"]) return '1.5т';
    if (maxHeight <= TRUCK_HEIGHTS["3т"]) return '3т';
    if (maxHeight <= TRUCK_HEIGHTS["5т"]) return '5т';
    if (maxHeight <= TRUCK_HEIGHTS["10т"]) return '10т';
    return '20т';
  }, [maxHeight]);

  // Итоговая рекомендация: гибридная (объём + высота + 2D-проверка)
  const recommendedTruck = useMemo(() => {
    const truckOrder = ['500кг', '1.5т', '3т', '5т', '10т', '20т'];
    
    // Индекс по объёму
    const byVolumeIndex = truckOrder.indexOf(recommendedTruckByVolume);
    
    // Индекс по высоте
    const byHeightIndex = truckOrder.indexOf(recommendedTruckByHeight);
    
    // Индекс по 2D-упаковке (ПОСЛЕ обратной оптимизации)
    const by2DIndex = packingResult ? truckOrder.indexOf(packingResult.truckType) : 0;
    
    console.log('🔧 MovingConstructor recommendedTruck расчёт:', {
      recommendedTruckByVolume,
      byVolumeIndex,
      recommendedTruckByHeight,
      byHeightIndex,
      packingResultTruckType: packingResult?.truckType,
      by2DIndex,
    });
    
    // Берём максимум из всех трёх факторов
    const finalIndex = Math.max(byVolumeIndex, byHeightIndex, by2DIndex);
    const truck = truckOrder[finalIndex];
    
    console.log('🔧 Итоговая машина в конструкторе:', truck, 'finalIndex:', finalIndex);
    
    // Добавляем название
    const names: Record<string, string> = {
      '500кг': '500кг (малый фургон)',
      '1.5т': '1.5т (Газель)',
      '3т': '3т',
      '5т': '5т',
      '10т': '10т',
      '20т': '20т (фура)'
    };
    
    return names[truck];
  }, [recommendedTruckByVolume, recommendedTruckByHeight, packingResult]);

  // Предупреждение о высоте
  const heightWarning = useMemo(() => {
    if (selectedItems.length === 0) return null;
    
    const volumeTruckIndex = ['500кг', '1.5т', '3т', '5т', '10т', '20т'].indexOf(recommendedTruckByVolume);
    const heightTruckIndex = ['500кг', '1.5т', '3т', '5т', '10т', '20т'].indexOf(recommendedTruckByHeight);
    
    // Если высота требует больший фургон
    if (heightTruckIndex > volumeTruckIndex) {
      const heightInMeters = (maxHeight / 100).toFixed(2);
      if (hasFridge) {
        return `⚠️ Холодильник (${heightInMeters}м) требует фургон ${recommendedTruckByHeight} с высотой кузова`;
      }
      return `⚠️ Высокие предметы (${heightInMeters}м) требуют фургон ${recommendedTruckByHeight}`;
    }
    
    return null;
  }, [selectedItems, maxHeight, hasFridge, recommendedTruckByVolume, recommendedTruckByHeight]);

  // Предупреждение от 2D-упаковки
  const packingWarning = useMemo(() => {
    if (!packingResult || packingResult.unpacked.length === 0) return null;
    
    return `⚠️ Не все предметы влезают по габаритам! Рекомендуем ${packingResult.truckDimensions.name}`;
  }, [packingResult]);

  // Добавить предмет
  const addItem = (item: MovingItem) => {
    const existingIndex = selectedItems.findIndex(si => si.item.id === item.id);
    
    if (existingIndex >= 0) {
      const updated = [...selectedItems];
      updated[existingIndex].quantity += 1;
      setSelectedItems(updated);
    } else {
      setSelectedItems([...selectedItems, { item, quantity: 1 }]);
    }
  };

  // Изменить количество
  const updateQuantity = (itemId: string, delta: number) => {
    setSelectedItems(prev => {
      return prev
        .map(si => {
          if (si.item.id === itemId) {
            const newQuantity = si.quantity + delta;
            return { ...si, quantity: newQuantity };
          }
          return si;
        })
        .filter(si => si.quantity > 0);
    });
  };

  // Удалить предмет
  const removeItem = (itemId: string) => {
    setSelectedItems(prev => prev.filter(si => si.item.id !== itemId));
  };

  // Применить и закрыть
  const handleApply = () => {
    const floorUtilization = packingResult ? packingResult.floorUtilization : undefined;
    
    console.log('🟢 MovingConstructor.handleApply:', {
      packedVolume,
      totalVolume,
      PACKING_COEFFICIENT,
      recommendedTruck,
      floorUtilization,
      packingResult: packingResult ? {
        truckType: packingResult.truckType,
        truckName: packingResult.truckDimensions.name,
        floorUtilization: packingResult.floorUtilization,
        volumeUtilization: packingResult.volumeUtilization
      } : null
    });
    // Передаём объём, рекомендуемую машину, заполненность пола И список предметов
    onApply(packedVolume, recommendedTruck, floorUtilization, selectedItems);
    onClose();
  };

  // Очистить всё
  const handleClear = () => {
    setSelectedItems([]);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl md:h-[95vh] h-screen md:max-h-[95vh] max-h-screen p-0 gap-0 md:rounded-[20px] rounded-none overflow-hidden flex flex-col">
          <DialogHeader className="p-3 md:p-4 pb-2 md:pb-3 border-b flex-shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-xl md:text-2xl font-bold flex items-center gap-2" style={{ color: '#083cb5' }}>
                  <Package className="w-6 h-6 md:w-7 md:h-7" />
                  Конструктор переезда
                </DialogTitle>
                <p className="text-xs md:text-sm text-gray-600 mt-1 md:mt-2 hidden md:block">
                  Выберите предметы, которые планируете перевозить, и мы автоматически рассчитаем необходимый объём
                </p>
              </div>
              
              {/* 🧪 Кнопка визуализации - перенесена в шапку */}
              {selectedItems.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setShowVisualizationModal(true)}
                  className="flex-shrink-0 border-dashed border-2 border-gray-300 hover:border-[#083cb5] hover:bg-blue-50 mr-[30px]"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">🧪 Визуализация</span>
                  <span className="md:hidden">🧪</span>
                </Button>
              )}
            </div>
          </DialogHeader>

          {/* 📱 Мобильные табы (показываем только на мобильных, до md) */}
          <div className="md:hidden flex border-b bg-gray-100">
            <button
              onClick={() => setMobileTab('items')}
              className={`flex-1 py-3 px-4 text-sm font-semibold transition-all relative ${
                mobileTab === 'items'
                  ? 'text-white bg-[#083cb5] shadow-md'
                  : 'text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Package className="w-4 h-4" />
                Выбор предметов
              </div>
            </button>
            <button
              onClick={() => setMobileTab('cart')}
              className={`flex-1 py-3 px-4 text-sm font-semibold transition-all relative ${
                mobileTab === 'cart'
                  ? 'text-white bg-[#083cb5] shadow-md'
                  : 'text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                Корзина
                {selectedItems.length > 0 && (
                  <span className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full ${
                    mobileTab === 'cart'
                      ? 'text-[#083cb5] bg-white'
                      : 'text-white bg-[#083cb5]'
                  }`}>
                    {selectedItems.length}
                  </span>
                )}
              </div>
            </button>
          </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-0 overflow-hidden">
          {/* ЛЕВАЯ ЧАСТЬ: Выбор предметов */}
          <div className={`md:col-span-2 flex flex-col md:border-r ${mobileTab === 'items' ? 'block' : 'hidden md:flex'}`}>
            {/* Поиск */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Поиск предметов: диван, холодильник, коробки..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Категории */}
            <div className="p-2 md:p-3 border-b bg-gray-50">
              <div className="flex md:flex-wrap gap-2 overflow-x-auto pb-1 -mx-3 px-3 md:mx-0 md:px-0 scrollbar-hide">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                  className={`flex-shrink-0 h-9 md:h-8 ${selectedCategory === "all" ? "bg-[#083cb5] hover:bg-[#083cb5]/90" : ""}`}
                >
                  Все ({MOVING_ITEMS_DATABASE.length})
                </Button>
                {Object.entries(CATEGORIES).map(([key, { name, icon }]) => {
                  const count = MOVING_ITEMS_DATABASE.filter(item => item.category === key).length;
                  return (
                    <Button
                      key={key}
                      variant={selectedCategory === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(key as keyof typeof CATEGORIES)}
                      className={`flex-shrink-0 h-9 md:h-8 ${selectedCategory === key ? "bg-[#083cb5] hover:bg-[#083cb5]/90" : ""}`}
                    >
                      {icon} {name} ({count})
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Список предметов */}
            <ScrollArea className="flex-1 overflow-auto" style={{ maxHeight: 'calc(100vh - 260px)' }}>
              <div className="p-2 md:p-3">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">Ничего не найдено</p>
                  <p className="text-sm mt-1">Попробуйте изменить поисковый запрос</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  {filteredItems.map((item) => {
                    const selected = selectedItems.find(si => si.item.id === item.id);
                    const category = CATEGORIES[item.category];
                    
                    return (
                      <div
                        key={item.id}
                        className={`
                          relative p-3 md:p-4 rounded-lg border-2 transition-all cursor-pointer active:scale-[0.98]
                          ${selected 
                            ? 'border-[#083cb5] bg-blue-50' 
                            : 'border-gray-200 hover:border-[#083cb5]/50 hover:bg-gray-50'
                          }
                        `}
                        onClick={() => addItem(item)}
                      >
                        {/* Кнопка добавления в виде кружка с плюсиком в правом верхнем углу (показывается только если предмет не выбран) */}
                        {!selected && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addItem(item);
                            }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#083cb5] hover:bg-[#083cb5]/90 text-white flex items-center justify-center shadow-sm transition-all hover:scale-110 active:scale-95 z-10"
                            aria-label="Добавить"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* Индикатор количества (показывается только если предмет выбран) */}
                        {selected && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-[#083cb5] rounded-full flex items-center justify-center text-white text-xs font-bold z-10">
                            {selected.quantity}
                          </div>
                        )}
                        
                        <div className="flex items-start gap-3 pr-8">
                          <div className="text-2xl flex-shrink-0">{category.icon}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm leading-tight">
                              {item.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {item.length}×{item.width}×{item.height} см
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              </div>
            </ScrollArea>
          </div>

          {/* ПРАВАЯ ЧАСТЬ: Выбранные предметы и итоги */}
          <div className={`flex flex-col bg-gray-50 cart-container ${mobileTab === 'cart' ? 'block' : 'hidden md:flex'}`}>
            <div className="p-2 border-b bg-white">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-sm">Ваш груз</h3>
                {selectedItems.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Очистить
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-1.5">
                {selectedItems.length === 0 
                  ? 'Выберите предметы слева' 
                  : `Выбрано: ${selectedItems.length} ${selectedItems.length === 1 ? 'предмет' : selectedItems.length < 5 ? 'предмета' : 'предметов'}`
                }
              </p>
              
              {/* Кнопка применить в верхней части */}
              {selectedItems.length > 0 && (
                <div className="pt-2 border-t">
                  <Button
                    onClick={handleApply}
                    className="w-full bg-[#083cb5] hover:bg-[#083cb5]/90"
                    size="sm"
                  >
                    Рассчитать стоимость ({packedVolume.toFixed(2)} м³)
                  </Button>
                </div>
              )}
            </div>

            <ScrollArea className="flex-1 cart-scrollbar" style={{ maxHeight: 'calc(100vh - 320px)' }}>
              <div className="p-2 md:p-3">
              {selectedItems.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Список пуст</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedItems.map(({ item, quantity }) => {
                    const category = CATEGORIES[item.category];
                    const itemVolume = item.volume * quantity;
                    
                    return (
                      <div
                        key={item.id}
                        className="relative p-2 bg-white rounded-lg border border-gray-200"
                      >
                        {/* Элементы управления в правом верхнем углу */}
                        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                          {/* Кнопки плюс/минус и количество */}
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="h-6 w-6 p-0 hover:bg-gray-100"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-xs font-bold w-6 text-center">{quantity}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="h-6 w-6 p-0 hover:bg-gray-100"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          {/* Иконка удаления */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(item.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        {/* Основной контент */}
                        <div className="flex items-start gap-2 pr-20">
                          <div className="text-lg flex-shrink-0">{category.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 leading-tight">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {item.volume.toFixed(3)} м³ × {quantity} = {itemVolume.toFixed(3)} м³
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              </div>
            </ScrollArea>
            
            <style>{`
              .cart-scrollbar [data-radix-scroll-area-viewport] {
                overflow-y: auto !important;
                overflow-x: hidden !important;
                height: 100% !important;
                width: 100% !important;
              }
              .cart-scrollbar [data-radix-scroll-area-scrollbar][data-orientation="vertical"] {
                width: 17px !important;
                background-color: #e5e7eb !important;
                opacity: 0.6;
                transition: opacity 0.2s ease, background-color 0.2s ease;
              }
              .cart-container:hover .cart-scrollbar [data-radix-scroll-area-scrollbar][data-orientation="vertical"] {
                opacity: 1 !important;
                background-color: #d1d5db !important;
              }
              .cart-scrollbar [data-radix-scroll-area-thumb] {
                background-color: #405B9A !important;
                border-radius: 9999px !important;
                min-height: 40px !important;
                opacity: 0.8;
                transition: opacity 0.2s ease, background-color 0.2s ease;
              }
              .cart-container:hover .cart-scrollbar [data-radix-scroll-area-thumb] {
                opacity: 1 !important;
              }
              .cart-scrollbar [data-radix-scroll-area-thumb]:hover {
                opacity: 1 !important;
              }
            `}</style>

            {/* Итоги */}
            <div className="p-3 pb-24 md:pb-3 border-t bg-white space-y-2">
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-gray-900">Итого объём:</span>
                  <span className="text-2xl font-bold" style={{ color: '#083cb5' }}>
                    {packedVolume.toFixed(2)} м³
                  </span>
                </div>
                
                <div className="pt-2 border-t">
                  {/* Предупреждение о высоте */}
                  {heightWarning && (
                    <div className="mt-2 p-2 rounded-lg bg-orange-50 border border-orange-200">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-orange-800 leading-tight">
                          {heightWarning}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Предупреждение от 2D-упаковки */}
                  {packingWarning && (
                    <div className="mt-2 p-2 rounded-lg bg-red-50 border border-red-200">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-800 leading-tight">
                          {packingWarning}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 📱 Фиксированная кнопка "Рассчитать стоимость" на мобильных */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg z-50">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12"
            >
              Отмена
            </Button>
            <Button
              onClick={handleApply}
              disabled={selectedItems.length === 0}
              className="flex-1 h-12 bg-[#083cb5] hover:bg-[#083cb5]/90 text-base font-semibold"
            >
              Рассчитать стоимость {selectedItems.length > 0 && `(${packedVolume.toFixed(2)} м³)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Модальное окно с визуализацией (для тестирования) */}
    <Dialog open={showVisualizationModal} onOpenChange={setShowVisualizationModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2" style={{ color: '#083cb5' }}>
            <Eye className="w-6 h-6" />
            🧪 Тестовая визуализация упаковки
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            Это временное окно для тестирования алгоритма упаковки. Показывает вид сверху на кузов.
          </p>
        </DialogHeader>
        
        <div className="mt-4">
          {packingResult ? (
            <PackingVisualization packingResult={packingResult} />
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Нет данных для визуализации</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t flex justify-end">
          <Button
            onClick={() => setShowVisualizationModal(false)}
            variant="outline"
          >
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

