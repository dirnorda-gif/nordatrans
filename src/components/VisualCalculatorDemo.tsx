// src/components/VisualCalculatorDemo.tsx
// Визуальная демонстрация нового калькулятора (без функционала)

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export function VisualCalculatorDemo() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    weight: "",
    volume: "",
    name: "",
    phone: "",
  });

  const steps = [
    { id: 1, label: "Маршрут", active: currentStep >= 1 },
    { id: 2, label: "Параметры груза", active: currentStep >= 2 },
    { id: 3, label: "Контактные данные", active: currentStep >= 3 },
    { id: 4, label: "Расчет стоимости", active: false },
  ];

  return (
    <div className="w-full">
      {/* Верхняя панель навигации со стрелками */}
      <div className="flex items-stretch">
        {/* Блок "Параметры" - прямоугольный, без стрелки */}
        <div className="w-80 bg-[#7a9ec4] text-white flex items-center justify-center font-semibold text-lg py-6">
          Параметры
        </div>

        {/* Остальные шаги со стрелками */}
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div
              className={`flex-1 py-6 px-4 text-center font-semibold text-base ${
                step.id === currentStep
                  ? "bg-[#5a7fa3] text-white"
                  : step.id === currentStep + 1
                  ? "bg-[#8ca8c4] text-white"
                  : step.id === currentStep + 2
                  ? "bg-[#b8c9d9] text-gray-700"
                  : "bg-[#c8d4e0] text-gray-600"
              }`}
            >
              {step.label}
            </div>
            {index < steps.length - 1 && (
              <div
                className="w-0 h-0 border-t-[48px] border-b-[48px] border-l-[30px] border-transparent"
                style={{
                  borderLeftColor:
                    step.id === currentStep
                      ? "#5a7fa3"
                      : step.id === currentStep + 1
                      ? "#8ca8c4"
                      : step.id === currentStep + 2
                      ? "#b8c9d9"
                      : "#c8d4e0",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Основной контент */}
      <div className="flex">
        {/* Левая колонка - Параметры (ширина 25%) */}
        <div className="w-1/4 min-w-[200px] border-r border-[#ccc] bg-transparent">
          {/* Заголовок */}
          <div className="head bg-[#7a9ec4] text-white text-center font-semibold py-4">
            Параметры
          </div>

          {/* Список параметров */}
          <div className="p-4 space-y-2 text-sm">
            {/* Если ничего не заполнено */}
            {!formData.from &&
            !formData.to &&
            !formData.volume &&
            !formData.weight ? (
              <div className="item fix active ccm0 text-gray-600">
                Вы не указали ни одного параметра!
              </div>
            ) : (
              <>
                {formData.from && (
                  <div className="item param ccm1 text-gray-800">
                    Откуда: <span className="font-semibold">{formData.from}</span>
                  </div>
                )}

                {formData.to && (
                  <div className="item param ccm2 text-gray-800">
                    Куда: <span className="font-semibold">{formData.to}</span>
                  </div>
                )}

                {formData.volume && (
                  <div className="item param ccm4 text-gray-800">
                    Объем: <span className="font-semibold">{formData.volume}</span>
                  </div>
                )}

                {formData.weight && (
                  <div className="item param ccm3 text-gray-800">
                    Вес: <span className="font-semibold">{formData.weight}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Правая колонка - Форма */}
        <div className="flex-1 p-8 bg-white">
          {/* ШАГ 1: Маршрут */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    placeholder="Откуда"
                    value={formData.from}
                    onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                    className="h-12 text-base border border-gray-300"
                  />
                </div>
                <div>
                  <Input
                    placeholder="Куда"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    className="h-12 text-base border border-gray-300"
                  />
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <Button
                  onClick={() => setCurrentStep(2)}
                  className="bg-[#c94444] hover:bg-[#b03838] text-white px-12 py-3 text-base font-semibold"
                >
                  Далее &gt;
                </Button>
              </div>
            </div>
          )}

          {/* ШАГ 2: Параметры груза */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a2 2 0 00-2 2v6a2 2 0 104 0V4a2 2 0 00-2-2z" />
                      <path d="M4 8a2 2 0 100 4h12a2 2 0 100-4H4z" />
                    </svg>
                  </span>
                  <Input
                    placeholder="Вес"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="h-12 text-base border border-gray-300 pl-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 italic">
                    кг.
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                    </svg>
                  </span>
                  <Input
                    placeholder="Объем"
                    value={formData.volume}
                    onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                    className="h-12 text-base border border-gray-300 pl-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 italic">
                    м³
                  </span>
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <Button
                  onClick={() => setCurrentStep(3)}
                  className="bg-[#c94444] hover:bg-[#b03838] text-white px-12 py-3 text-base font-semibold"
                >
                  Далее &gt;
                </Button>
              </div>
            </div>
          )}

          {/* ШАГ 3: Контактные данные */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
                  </span>
                  <Input
                    placeholder="Имя"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 text-base border border-gray-300 pl-10"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    <img
                      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 2'%3E%3Crect fill='%23fff' width='3' height='2'/%3E%3Crect fill='%230039a6' y='0.67' width='3' height='0.67'/%3E%3Crect fill='%23d52b1e' y='1.33' width='3' height='0.67'/%3E%3C/svg%3E"
                      alt="RU"
                      className="w-6 h-4"
                    />
                  </span>
                  <Input
                    placeholder="Телефон"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-12 text-base border border-gray-300 pl-12"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Checkbox id="privacy" />
                <label htmlFor="privacy" className="text-sm text-gray-700">
                  Я согласен с{" "}
                  <a href="#" className="text-blue-600 underline">
                    политикой конфиденциальности и условиями обработки персональных данных
                  </a>
                </label>
              </div>

              <div className="flex justify-center mt-8">
                <Button
                  onClick={() => alert("Форма отправлена!")}
                  className="bg-[#c94444] hover:bg-[#b03838] text-white px-12 py-3 text-base font-semibold"
                >
                  Рассчитать стоимость &gt;
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

