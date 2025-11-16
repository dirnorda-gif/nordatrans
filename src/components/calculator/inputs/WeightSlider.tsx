// src/components/calculator/inputs/WeightSlider.tsx
// Компонент слайдера веса груза

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { formatWeight } from "@/utils/calculator/calculatorHelpers";

console.log('📦 [WeightSlider] Компонент загружен');

interface WeightSliderProps {
  value: number; // индекс в массиве steps
  onChange: (index: number) => void;
  steps: number[]; // массив значений веса
  disabled?: boolean;
  label?: string;
  autoCalculated?: boolean; // флаг автоматического расчёта (для домашнего переезда)
}

export function WeightSlider({
  value,
  onChange,
  steps,
  disabled = false,
  label = "Предположительный вес",
  autoCalculated = false,
}: WeightSliderProps) {
  const currentWeight = steps[value];
  
  console.log('⚖️ [WeightSlider] Рендер:', {
    value,
    currentWeight,
    stepsLength: steps.length,
    disabled,
    autoCalculated,
  });

  const handleChange = (newValue: number[]) => {
    const newIndex = newValue[0];
    console.log('🔄 [WeightSlider] Изменение значения:', {
      oldIndex: value,
      newIndex,
      oldWeight: currentWeight,
      newWeight: steps[newIndex],
    });
    onChange(newIndex);
  };

  return (
    <div className="space-y-3" style={{paddingLeft: '20px', paddingRight: '20px'}}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-bold text-white">
          {label}: {formatWeight(currentWeight)}
        </Label>
        {autoCalculated && (
          <span className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded">
            ⚡ Авто
          </span>
        )}
      </div>

      <div
        className={`rounded-lg p-2 -m-2 transition-all ${
          disabled || autoCalculated ? "opacity-50" : "hover:bg-white/5"
        }`}
      >
        <Slider
          value={[value]}
          onValueChange={handleChange}
          min={0}
          max={steps.length - 1}
          step={1}
          disabled={disabled || autoCalculated}
          className="w-full"
        />
      </div>

      {/* Подсказка о диапазоне */}
      <div className="flex justify-between text-xs text-white/60">
        <span>{formatWeight(steps[0])}</span>
        <span>{formatWeight(steps[steps.length - 1])}</span>
      </div>

      {autoCalculated && (
        <p className="text-xs text-white/70 italic">
          💡 Вес рассчитывается автоматически на основе объёма
        </p>
      )}
    </div>
  );
}

console.log('✅ [WeightSlider] Компонент экспортирован');

