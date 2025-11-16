// src/components/calculator/selectors/TruckTypeSelector.tsx
// Компонент выбора типа фургона для продуктов питания

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

console.log('🚛 [TruckTypeSelector] Компонент загружен');

interface TruckTypeOption {
  id: string;
  label: string;
}

const TRUCK_TYPES: TruckTypeOption[] = [
  { id: "tented", label: "Тентованный" },
  { id: "isoterm", label: "Изотерм" },
  { id: "refrigerator", label: "Рефрижератор" },
];

interface TruckTypeSelectorProps {
  value: string;
  onChange: (type: string) => void;
  temperatureMode?: string;
  onTemperatureModeChange?: (temp: string) => void;
  error?: boolean;
}

export function TruckTypeSelector({
  value,
  onChange,
  temperatureMode = "",
  onTemperatureModeChange,
  error = false,
}: TruckTypeSelectorProps) {
  console.log('🚛 [TruckTypeSelector] Рендер:', { value, temperatureMode, error });

  const handleSelect = (typeId: string) => {
    console.log('✅ [TruckTypeSelector] Выбран тип фургона:', typeId);
    onChange(typeId);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-white">
        Тип фургона {error && <span className="text-red-400">*</span>}
      </label>

      <div className="space-y-2">
        {TRUCK_TYPES.map((type) => {
          const isSelected = value === type.id;
          
          return (
            <div key={type.id}>
              <div className="flex items-center gap-3">
                <label
                  className="flex items-center gap-3 cursor-pointer text-white"
                  onClick={() => handleSelect(type.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleSelect(type.id)}
                  />
                  <span className="font-semibold">{type.label}</span>
                </label>

                {/* Поле температуры для рефрижератора - inline в той же строке */}
                {isSelected && type.id === "refrigerator" && (
                  <Input
                    type="text"
                    value={temperatureMode}
                    onChange={(e) => onTemperatureModeChange?.(e.target.value)}
                    placeholder="Например: -18"
                    className="bg-white/10 text-white border-white/20 text-sm h-8 flex-1 placeholder:text-white/60"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

console.log('✅ [TruckTypeSelector] Компонент экспортирован');
