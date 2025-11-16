// src/components/calculator/progress/ProgressBar.tsx
// Компонент прогресс-бара с шагами

import { Check } from "lucide-react";

console.log('📦 [ProgressBar] Компонент загружен');

export interface Step {
  id: number;
  title: string;
  description?: string;
}

interface ProgressBarProps {
  steps: Step[];
  currentStep: number;
}

export function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  console.log('📊 [ProgressBar] Рендер:', {
    stepsCount: steps.length,
    currentStep,
  });

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isPending = currentStep < step.id;

          console.log(`  Шаг ${step.id}: ${isCompleted ? '✅ Завершён' : isCurrent ? '🔵 Текущий' : '⚪ Ожидает'}`);

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Круг с номером шага */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                    ${isCompleted ? 'bg-[#083cb5] text-white' : ''}
                    ${isCurrent ? 'bg-[#405b9a] text-white ring-4 ring-[#405b9a]/30' : ''}
                    ${isPending ? 'bg-gray-300 text-gray-600' : ''}
                  `}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : step.id}
                </div>
                
                {/* Название шага */}
                <div className="mt-2 text-center">
                  <p
                    className={`text-xs font-medium ${
                      isCurrent ? 'text-[#405b9a]' : isPending ? 'text-gray-400' : 'text-[#083cb5]'
                    }`}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                  )}
                </div>
              </div>

              {/* Линия между шагами */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-1 mx-2 rounded transition-all
                    ${isCompleted ? 'bg-[#083cb5]' : 'bg-gray-300'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

console.log('✅ [ProgressBar] Компонент экспортирован');

