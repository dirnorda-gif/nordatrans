import { LucideIcon } from "lucide-react";

interface BrandCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient?: {
    from: string;
    to: string;
  };
  buttonColor?: string;
  maskColor?: string;
  textColor?: string;
}

export function BrandCard({
  title,
  description,
  icon: Icon,
  gradient = {
    from: "#083cb5",
    to: "#405b9a",
  },
  buttonColor = "#d1d5db",
  maskColor = "#f0f3f5",
  textColor = "#050b18",
}: BrandCardProps) {
  // Константы для размеров и позиционирования
  const BUTTON_SIZE = 50;
  const MASK_RADIUS = 40;
  const CORNER_RADIUS = 30;
  const CARD_RADIUS = 40;
  const BUTTON_OFFSET = 1;
  
  // Вычисляемые позиции
  const buttonPos = { top: BUTTON_OFFSET, right: -BUTTON_OFFSET };
  const maskPos = {
    top: buttonPos.top + BUTTON_SIZE / 2 - MASK_RADIUS,
    right: buttonPos.right + BUTTON_SIZE / 2 - MASK_RADIUS,
  };

  return (
    <div className="flex items-center gap-3">
      {/* Основная карточка */}
      <div
        className="relative p-6 w-full shadow-lg hover:shadow-xl transition-shadow"
        style={{
          background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
          borderRadius: `${CARD_RADIUS}px`,
          color: "#ffffff",
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

        {/* Кнопка с тематической иконкой */}
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
            <Icon className="w-8 h-8" style={{ color: gradient.from }} />
          </div>
        </button>

        {/* Контент карточки */}
        <div className="space-y-4 relative z-10">
          {/* Заголовок */}
          <h3 className="text-xl font-semibold text-white">
            {title}
          </h3>

          {/* Описание */}
          <p className="text-white/90 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Правый теневой элемент */}
      <div
        className="w-1.5 h-16 rounded-full opacity-30"
        style={{
          background: `linear-gradient(180deg, ${gradient.from}80 0%, ${gradient.to}80 100%)`,
        }}
      />
    </div>
  );
}

