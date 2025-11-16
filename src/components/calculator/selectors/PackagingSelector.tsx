// src/components/calculator/selectors/PackagingSelector.tsx
// Компонент выбора упаковки груза

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

console.log('📦 [PackagingSelector] Компонент загружен');

interface PackagingOption {
  id: string;
  label: string;
}

const PACKAGING_OPTIONS: PackagingOption[] = [
  { id: "pallets", label: "На палетах" },
  { id: "individual", label: "Индивидуальная упаковка" },
  { id: "bulk", label: "Навалом (без упаковки)" },
  { id: "loose", label: "Россыпью" },
];

interface PackagingSelectorProps {
  value: string;
  onChange: (packaging: string) => void;
  palletCount?: string;
  onPalletCountChange?: (count: string) => void;
  palletWeight?: string;
  onPalletWeightChange?: (weight: string) => void;
  error?: boolean;
}

export function PackagingSelector({
  value,
  onChange,
  palletCount = "",
  onPalletCountChange,
  palletWeight = "",
  onPalletWeightChange,
  error = false,
}: PackagingSelectorProps) {
  console.log('📦 [PackagingSelector] Рендер:', { value, palletCount, palletWeight, error });

  const handleSelect = (packagingId: string) => {
    console.log('✅ [PackagingSelector] Выбрана упаковка:', packagingId);
    onChange(packagingId);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-white">
        Упаковка груза {error && <span className="text-red-400">*</span>}
      </label>

      <div className="space-y-2">
        {PACKAGING_OPTIONS.map((option) => {
          const isSelected = value === option.id;
          
          return (
            <div key={option.id}>
              <div className="flex items-center gap-3">
                <label
                  className="flex items-center gap-3 cursor-pointer text-white"
                  onClick={() => handleSelect(option.id)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleSelect(option.id)}
                  />
                  <span className="font-semibold">{option.label}</span>
                </label>

                {/* Поля для палет - inline в той же строке */}
                {isSelected && option.id === "pallets" && (
                  <div className="flex gap-2 flex-1">
                    <Input
                      type="number"
                      value={palletCount}
                      onChange={(e) => onPalletCountChange?.(e.target.value)}
                      placeholder="Кол-во"
                      className="bg-white/10 text-white border-white/20 text-sm h-8 w-20 placeholder:text-white/60"
                    />
                    <Input
                      type="number"
                      value={palletWeight}
                      onChange={(e) => onPalletWeightChange?.(e.target.value)}
                      placeholder="Вес (кг)"
                      className="bg-white/10 text-white border-white/20 text-sm h-8 w-24 placeholder:text-white/60"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

console.log('✅ [PackagingSelector] Компонент экспортирован');
