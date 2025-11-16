// src/components/calculator/progress/StepProgress.tsx
// Компонент прогресса шагов калькулятора

import React from "react";

console.log('📊 [StepProgress] Компонент загружен');

export interface StepConfig {
  id: number;
  defaultLabel: string;  // "Маршрут", "Шаг 2", "Шаг 3", "Расчёт стоимости"
  activeLabel: string;   // "Маршрут", "Параметры груза", "Контакты", "Расчёт стоимости"
}

export interface StepProgressProps {
  currentStep: number;  // 1, 2, 3, 4
  steps: StepConfig[];
  hasStartedFilling?: boolean; // Пользователь начал заполнять форму
}

export function StepProgress({ currentStep, steps, hasStartedFilling = false }: StepProgressProps) {
  console.log('📊 [StepProgress] Рендер, текущий шаг:', currentStep, 'hasStartedFilling:', hasStartedFilling);

  // Определяем следующий шаг для мобильной версии
  const nextStep = currentStep < steps.length ? steps[currentStep] : null;

  return (
    <>
      {/* Десктопная версия - закруглённые кнопки */}
      <div className="hidden md:flex items-center justify-between gap-2 mb-4 px-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          // Определяем цвета
          let bgColor = "bg-[#d1d9e6]"; // Светлый серый (неактивный и завершённый)
          let textColor = "text-gray-600";
          
          // Шаг 1 активен только если пользователь начал заполнять ИЛИ уже на другом шаге
          if (isActive && (stepNumber > 1 || hasStartedFilling)) {
            bgColor = "bg-[#083cb5]"; // Primary (активный)
            textColor = "text-white";
          }
          // Завершённые шаги остаются светлыми (как неактивные)

          // Определяем отображаемый текст
          const displayLabel = isActive ? step.activeLabel : step.defaultLabel;

          return (
            <div key={step.id} className="flex-1">
              {/* Закруглённая кнопка шага */}
              <div
                className={`${bgColor} rounded-full h-10 flex items-center justify-center px-3 transition-all duration-300 shadow-sm`}
              >
                <span className={`text-xs font-semibold ${textColor} whitespace-nowrap truncate`}>
                  {displayLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Мобильная версия - текущий шаг + следующий */}
      <div className="md:hidden mb-4 px-2">
        <div className="bg-[#083cb5] rounded-full px-4 py-2 text-center">
          <p className="text-white text-xs font-semibold">
            Шаг {currentStep} из {steps.length}: {steps[currentStep - 1].activeLabel}
          </p>
          {nextStep && (
            <p className="text-white/70 text-[10px] mt-1">
              Следующий: {nextStep.activeLabel} →
            </p>
          )}
        </div>
      </div>
    </>
  );
}

console.log('✅ [StepProgress] Компонент экспортирован');

