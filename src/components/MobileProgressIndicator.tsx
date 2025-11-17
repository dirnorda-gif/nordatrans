import React from 'react';

interface MobileProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepName: string;
}

export function MobileProgressIndicator({ currentStep, totalSteps, stepName }: MobileProgressIndicatorProps) {
  return (
    <div className="w-full flex justify-center mb-6">
      <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 inline-block">
        {/* Точки прогресса */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                i < currentStep
                  ? 'bg-[#083cb5]'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        {/* Текст шага */}
        <div className="text-center">
          <p className="text-sm text-[#050b18] font-medium whitespace-nowrap">
            Шаг {currentStep} из {totalSteps}: {stepName}
          </p>
        </div>
      </div>
    </div>
  );
}

