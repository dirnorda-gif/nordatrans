import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: LucideIcon;
  gradient?: {
    from: string;
    to: string;
  };
  buttonColor?: string;
  maskColor?: string;
}

export function StatCard({
  title,
  value,
  suffix = "",
  trend,
  icon: Icon,
  gradient = {
    from: "#083cb5",
    to: "#405b9a",
  },
  buttonColor = "#f0f3f5",
  maskColor = "#ffffff",
}: StatCardProps) {
  // Константы для размеров и позиционирования
  const BUTTON_SIZE = 60;
  const MASK_RADIUS = 47;
  const CORNER_RADIUS = 40;
  const CARD_RADIUS = 60;
  const BUTTON_OFFSET = 1;
  
  // Вычисляемые позиции
  const buttonPos = { top: BUTTON_OFFSET, right: -BUTTON_OFFSET };
  const maskPos = {
    top: buttonPos.top + BUTTON_SIZE / 2 - MASK_RADIUS,
    right: buttonPos.right + BUTTON_SIZE / 2 - MASK_RADIUS,
  };

  return (
    <div className="flex items-center gap-4">
      {/* Основная карточка */}
      <div
        className="relative p-8 text-white w-full max-w-sm shadow-lg hover:shadow-xl transition-shadow"
        style={{
          background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
          borderRadius: `${CARD_RADIUS}px`,
        }}
      >
        {/* Круглая маска для кнопки */}
        <div
          className="absolute rounded-full"
          style={{
            width: MASK_RADIUS * 2,
            height: MASK_RADIUS * 2,
            top: maskPos.top,
            right: maskPos.right,
            backgroundColor: maskColor,
          }}
        />

        {/* Верхний прямоугольник с вогнутым углом */}
        <div
          className="absolute"
          style={{
            width: MASK_RADIUS,
            height: MASK_RADIUS,
            top: maskPos.top,
            right: buttonPos.right + BUTTON_SIZE / 2,
            background: `radial-gradient(circle at bottom left, transparent ${CORNER_RADIUS}px, ${maskColor} ${CORNER_RADIUS}px)`,
          }}
        />

        {/* Правый прямоугольник с вогнутым углом */}
        <div
          className="absolute"
          style={{
            width: MASK_RADIUS,
            height: MASK_RADIUS,
            top: buttonPos.top + BUTTON_SIZE / 2,
            right: maskPos.right,
            background: `radial-gradient(circle at bottom right, transparent ${CORNER_RADIUS}px, ${maskColor} ${CORNER_RADIUS}px)`,
          }}
        />

        {/* Кнопка со стрелкой */}
        <button
          className="absolute rounded-full cursor-pointer hover:scale-110 transition-all"
          style={{
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            top: buttonPos.top,
            right: buttonPos.right,
            backgroundColor: buttonColor,
            zIndex: 50,
          }}
        >
          <div className="flex items-center justify-center w-full h-full">
            <ArrowUpRight className="w-5 h-5" style={{ color: gradient.from }} />
          </div>
        </button>

        {/* Контент карточки */}
        <div className="space-y-4 relative z-10">
          {/* Заголовок с иконкой */}
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
            )}
            <h3 className="text-lg font-semibold text-white/90">{title}</h3>
          </div>

          {/* Индикатор изменения (если есть) */}
          {trend && (
            <div className="flex items-center gap-2">
              <span className={trend.isPositive ? "text-green-300" : "text-red-300"}>
                {trend.isPositive ? (
                  <ArrowUpRight className="w-4 h-4 inline" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 inline" />
                )}
              </span>
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? "text-green-300" : "text-red-300"
                }`}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
            </div>
          )}

          {/* Основное число */}
          <div className="pt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-white tracking-tight">
                {value}
              </span>
              {suffix && (
                <span className="text-3xl font-light text-white/90">{suffix}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Правый теневой элемент */}
      <div
        className="w-2 h-24 rounded-full opacity-40"
        style={{
          background: `linear-gradient(180deg, ${gradient.from}80 0%, ${gradient.to}80 100%)`,
        }}
      ></div>
    </div>
  );
}

