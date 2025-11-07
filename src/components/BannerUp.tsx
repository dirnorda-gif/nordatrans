import React from 'react';

interface BannerUpProps {
  /**
   * Дополнительные CSS классы для секции
   */
  className?: string;
  /**
   * Тип оверлея: 'white' | 'dark' | 'blue' | 'none'
   */
  overlayType?: 'white' | 'dark' | 'blue' | 'none';
  /**
   * Дочерние элементы (контент внутри баннера)
   */
  children?: React.ReactNode;
  /**
   * Кастомный путь к фоновому изображению (опционально)
   */
  backgroundImage?: string;
  /**
   * Позиция фонового изображения (опционально, по умолчанию 'center 60%')
   */
  backgroundPosition?: string;
  /**
   * Размер фонового изображения (опционально, по умолчанию 'cover')
   */
  backgroundSize?: string;
}

/**
 * Универсальный компонент баннера с зимним фоновым изображением
 * Используется на главной странице и всех landing pages
 */
export const BannerUp: React.FC<BannerUpProps> = ({ 
  className = '', 
  overlayType = 'white',
  children,
  backgroundImage,
  backgroundPosition = 'center 60%',
  backgroundSize = 'cover'
}) => {
  // Определяем градиент в зависимости от типа оверлея
  const getOverlayGradient = () => {
    switch (overlayType) {
      case 'white':
        return null; // Белый оверлей будет отдельным div
      case 'dark':
        return 'linear-gradient(rgba(5, 11, 24, 0.8), rgba(5, 11, 24, 0.8)), ';
      case 'blue':
        return 'linear-gradient(rgba(8, 60, 181, 0.9), rgba(64, 91, 154, 0.9)), ';
      case 'none':
        return null;
      default:
        return null;
    }
  };

  const gradient = getOverlayGradient();
  const defaultImage = backgroundImage || '/norda-trans-winter-landscape-1800px.webp';
  
  const bgImage = gradient 
    ? `${gradient}url('${defaultImage}')`
    : `url('${defaultImage}')`;

  return (
    <section className={`relative overflow-hidden ${className}`}>
      {/* Background Image with optional gradient */}
      <div 
        className="absolute inset-0 bg-no-repeat"
        style={{
          backgroundImage: bgImage,
          backgroundPosition: backgroundPosition,
          backgroundSize: backgroundSize
        }}
      ></div>
      
      {/* White Overlay (только для white типа) */}
      {overlayType === 'white' && (
        <div className="absolute inset-0 bg-white/25"></div>
      )}
      
      {/* Content */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </section>
  );
};

