// src/components/calculator/selectors/TransportTypeSelector.tsx
// Компонент выбора типа перевозки

import { Checkbox } from "@/components/ui/checkbox";
import { Home, Package, ShoppingCart, Truck } from "lucide-react";

console.log('📦 [TransportTypeSelector] Компонент загружен');

interface TransportType {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const TRANSPORT_TYPES: TransportType[] = [
  {
    id: "Домашний переезд",
    label: "Домашний переезд",
    icon: <Home className="h-6 w-6" />,
    description: "Мебель, коробки, бытовая техника",
  },
  {
    id: "Промышленные товары",
    label: "Промышленные товары",
    icon: <Package className="h-6 w-6" />,
    description: "Палеты, оборудование, стройматериалы",
  },
  {
    id: "Продукты питания",
    label: "Продукты питания",
    icon: <ShoppingCart className="h-6 w-6" />,
    description: "Рефрижератор, температурный режим",
  },
  {
    id: "Другое",
    label: "Другое",
    icon: <Truck className="h-6 w-6" />,
    description: "Прочие грузы",
  },
];

interface TransportTypeSelectorProps {
  value: string;
  onChange: (type: string) => void;
  error?: boolean;
}

export function TransportTypeSelector({
  value,
  onChange,
  error = false,
}: TransportTypeSelectorProps) {
  console.log('🚚 [TransportTypeSelector] Рендер:', { value, error });

  const handleSelect = (typeId: string) => {
    console.log('✅ [TransportTypeSelector] Выбран тип:', typeId);
    onChange(typeId);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-white">
        Тип перевозки {error && <span className="text-red-400">*</span>}
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TRANSPORT_TYPES.map((type) => {
          const isSelected = value === type.id;
          
          return (
            <label
              key={type.id}
              className="flex items-center gap-3 cursor-pointer text-white"
              onClick={() => handleSelect(type.id)}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => handleSelect(type.id)}
              />
              {type.icon}
              <span className="font-semibold">{type.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

console.log('✅ [TransportTypeSelector] Компонент экспортирован');

