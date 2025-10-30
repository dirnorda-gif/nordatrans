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
}

/**
 * Универсальный компонент баннера с зимним фоновым изображением
 * Используется на главной странице и всех landing pages
 */
export const BannerUp: React.FC<BannerUpProps> = ({ 
  className = '', 
  overlayType = 'white',
  children 
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
  const bgImage = gradient 
    ? `${gradient}url('/norda-trans-winter-landscape-1800px.webp')`
    : "url('/norda-trans-winter-landscape-1800px.webp')";

  return (
    <section className={`relative overflow-hidden ${className}`}>
      {/* Background Image with optional gradient */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: bgImage,
          backgroundPosition: 'center 60%'
        }}
      ></div>
      
      {/* White Overlay (только для white типа) */}
      {overlayType === 'white' && (
        <div className="absolute inset-0 bg-white/40"></div>
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

