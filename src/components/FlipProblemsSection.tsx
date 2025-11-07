import { useState } from "react";
import { Clock, Package, DollarSign, Shield } from "lucide-react";
import { FlipCard } from "./FlipCard";
import { CallbackDialog } from "./CallbackDialog";

const problemsData = [
  {
    problem: {
      title: "Задержки доставки",
      description: "Груз приходит позже обещанного срока или машина опаздывает на загрузку, срывая планы и нарушая бизнес-процессы клиента.",
      icon: Clock,
    },
    solution: {
      title: "Точность до минуты",
      description: "В нашем договоре чётко прописано дата и время подачи автомобиля на загрузку и прибытие на выгрузку. Работаем без опозданий!",
      icon: Clock,
    },
  },
  {
    problem: {
      title: "Повреждения груза",
      description: "Многие компании не несут ответственности за сохранность груза. В договоре отсутствует пункт об ответственности компании.",
      icon: Package,
    },
    solution: {
      title: "Сохранность 100%",
      description: "В договоре есть отдельный пункт об ответственности нашей компании за сохранность груза. Все наши грузы мы страхуем в обязательном порядке.",
      icon: Shield,
    },
  },
  {
    problem: {
      title: "Скрытые платежи",
      description: "Итоговая цена оказывается выше из-за непредвиденных доплат и скрытых комиссий.",
      icon: DollarSign,
    },
    solution: {
      title: "Прозрачное ценообразование",
      description: "Фиксированная стоимость без скрытых платежей. Все расходы известны до начала перевозки.",
      icon: DollarSign,
    },
  },
];

export const FlipProblemsSection = () => {
  const [isCallbackOpen, setIsCallbackOpen] = useState(false);

  return (
    <section className="min-h-screen bg-background py-20 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="mb-6 text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
            Честно о том, <span className="bg-gradient-to-r from-[#083cb5] to-[#405b9a] bg-clip-text text-transparent">чего вы боитесь…</span>
          </h1>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {problemsData.map((item, index) => (
            <div
              key={index}
              className="animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: "backwards" }}
            >
              <FlipCard problem={item.problem} solution={item.solution} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col gap-4 rounded-2xl bg-card p-8 shadow-[var(--shadow-card)] md:flex-row md:items-center md:gap-8">
            <div className="flex-1 text-left">
              <h3 className="mb-2 text-2xl font-bold text-foreground">
                Решить все проблемы сразу
              </h3>
              <p className="text-muted-foreground">
                Закажите первую перевозку и получите скидку 10%
              </p>
            </div>
            <button
              onClick={() => setIsCallbackOpen(true)}
              className="rounded-xl px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              style={{ background: 'linear-gradient(135deg, #083cb5 0%, #405b9a 100%)' }}
            >
              Получить скидку
            </button>
          </div>
        </div>

        {/* Callback Dialog */}
        <CallbackDialog open={isCallbackOpen} onOpenChange={setIsCallbackOpen} />
      </div>
    </section>
  );
};

