// src/components/calculator/inputs/VolumeSlider.tsx
// Компонент слайдера объёма груза

import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { formatVolume } from "@/utils/calculator/calculatorHelpers";

console.log('📦 [VolumeSlider] Компонент загружен');

interface VolumeSliderProps {
  value: number; // индекс в массиве steps
  onChange: (index: number) => void;
  steps: number[]; // массив значений объёма
  disabled?: boolean;
  label?: string;
  showTruckInfo?: boolean;
  truckName?: string;
}

export function VolumeSlider({
  value,
  onChange,
  steps,
  disabled = false,
  label = "Предположительный объём",
  showTruckInfo = false,
  truckName,
}: VolumeSliderProps) {
  const currentVolume = steps[value];
  
  console.log('📊 [VolumeSlider] Рендер:', {
    value,
    currentVolume,
    stepsLength: steps.length,
    disabled,
    truckName,
  });

  const handleChange = (newValue: number[]) => {
    const newIndex = newValue[0];
    console.log('🔄 [VolumeSlider] Изменение значения:', {
      oldIndex: value,
      newIndex,
      oldVolume: currentVolume,
      newVolume: steps[newIndex],
    });
    onChange(newIndex);
  };

  return (
    <div className="space-y-3" style={{paddingLeft: '20px', paddingRight: '20px'}}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-bold text-white">
          {label}: {formatVolume(currentVolume)}
        </Label>
        {showTruckInfo && truckName && (
          <span className="text-xs text-white/80 bg-white/10 px-2 py-1 rounded">
            🚚 {truckName}
          </span>
        )}
      </div>

      <div
        className={`rounded-lg p-2 -m-2 transition-all ${
          disabled ? "opacity-50" : "hover:bg-white/5"
        }`}
      >
        <Slider
          value={[value]}
          onValueChange={handleChange}
          min={0}
          max={steps.length - 1}
          step={1}
          disabled={disabled}
          className="w-full"
        />
      </div>

      {/* Подсказка о диапазоне */}
      <div className="flex justify-between text-xs text-white/60">
        <span>{formatVolume(steps[0])}</span>
        <span>{formatVolume(steps[steps.length - 1])}</span>
      </div>
    </div>
  );
}

console.log('✅ [VolumeSlider] Компонент экспортирован');

