// Страница для отображения расчёта из конструктора переезда
// Принимает данные через URL параметр ?data=base64

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { BannerUp } from "@/components/BannerUp";
import Footer from "@/components/Footer";
import { MovingConstructor, type SelectedItem } from "@/components/MovingConstructor";
import { MOVING_ITEMS_DATABASE } from "@/data/movingItemsDatabase";

console.log('📄 [Constructor Page] Загрузка страницы конструктора');

interface DecodedItem {
  id: string;
  q: number;
}

const Constructor = () => {
  const [searchParams] = useSearchParams();
  const [isConstructorOpen, setIsConstructorOpen] = useState(false);
  const [initialItems, setInitialItems] = useState<SelectedItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 [Constructor Page] Декодирование данных из URL...');
    
    const dataParam = searchParams.get('data');
    
    if (!dataParam) {
      console.warn('⚠️ [Constructor Page] Параметр data отсутствует в URL');
      setError('Ссылка не содержит данных расчёта');
      return;
    }

    try {
      // Декодируем base64 -> JSON
      const jsonString = decodeURIComponent(atob(dataParam));
      const decodedData: DecodedItem[] = JSON.parse(jsonString);
      
      console.log('✅ [Constructor Page] Данные декодированы:', decodedData);
      
      // Восстанавливаем полные объекты SelectedItem из базы данных
      const restoredItems: SelectedItem[] = [];
      
      for (const decoded of decodedData) {
        const item = MOVING_ITEMS_DATABASE.find(i => i.id === decoded.id);
        if (item) {
          restoredItems.push({
            item: item,
            quantity: decoded.q
          });
          console.log(`✅ [Constructor Page] Восстановлен предмет: ${item.name} × ${decoded.q}`);
        } else {
          console.warn(`⚠️ [Constructor Page] Предмет с ID ${decoded.id} не найден в базе`);
        }
      }
      
      if (restoredItems.length > 0) {
        setInitialItems(restoredItems);
        setIsConstructorOpen(true);
        setError(null);
        console.log(`✅ [Constructor Page] Восстановлено ${restoredItems.length} предметов, открываем конструктор`);
      } else {
        setError('Не удалось восстановить предметы из расчёта');
      }
      
    } catch (err) {
      console.error('❌ [Constructor Page] Ошибка декодирования:', err);
      setError('Не удалось декодировать данные расчёта');
    }
  }, [searchParams]);

  const handleConstructorClose = () => {
    setIsConstructorOpen(false);
  };

  const handleConstructorApply = () => {
    // Ничего не делаем, это просто просмотр
    setIsConstructorOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f0f3f5]">
      <Header />
      <BannerUp />

      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#050b18] mb-6">
            Расчёт конструктора переезда
          </h1>

          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 font-semibold mb-2">⚠️ Ошибка</p>
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <p className="text-gray-600 mb-4">
                Конструктор переезда открыт с сохранёнными данными.
              </p>
              <p className="text-gray-500 text-sm">
                Вы можете просмотреть выбранные предметы и расчёт объёма.
              </p>
            </div>
          )}
        </div>
      </section>
      
      {/* Модальное окно конструктора с восстановленными данными */}
      <MovingConstructorWithInitialData
        isOpen={isConstructorOpen}
        onClose={handleConstructorClose}
        onApply={handleConstructorApply}
        initialItems={initialItems}
      />
      
      <Footer />
    </div>
  );
};

// Обёртка для MovingConstructor с поддержкой начальных данных
interface MovingConstructorWithInitialDataProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  initialItems: SelectedItem[];
}

function MovingConstructorWithInitialData({
  isOpen,
  onClose,
  onApply,
  initialItems
}: MovingConstructorWithInitialDataProps) {
  const handleApply = (totalVolume: number, recommendedTruck?: string, floorUtilization?: number, selectedItems?: SelectedItem[]) => {
    console.log('📦 [Constructor Page] Применение данных конструктора:', {
      totalVolume,
      recommendedTruck,
      floorUtilization,
      itemsCount: selectedItems?.length
    });
    onApply();
  };
  
  return (
    <MovingConstructor
      isOpen={isOpen}
      onClose={onClose}
      onApply={handleApply}
      initialSelectedItems={initialItems}
    />
  );
}

export default Constructor;

