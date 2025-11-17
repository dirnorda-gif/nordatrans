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
 * Автономный компонент баннера с логотипом и заголовком
 * Используется на главной странице и всех landing pages
 */
export const BannerUp: React.FC<BannerUpProps> = ({ 
  className = '', 
  overlayType = 'white',
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

      {/* Background pattern with CSS */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-16 h-16 border-2 border-blue-200 rounded-lg rotate-12"></div>
        <div className="absolute top-20 right-20 w-12 h-12 bg-blue-100 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-20 h-8 bg-indigo-100 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-14 h-14 border-2 border-indigo-200 rounded-lg -rotate-12"></div>
        <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-slate-200 rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-10 h-6 bg-blue-200 rounded-full"></div>
        <div className="absolute bottom-1/3 left-1/3 w-6 h-10 bg-indigo-200 rounded-full"></div>
        
        {/* Route lines */}
        <div className="absolute top-16 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
        <div className="absolute top-32 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent"></div>
        <div className="absolute bottom-16 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-6 h-full flex items-center">
          <div className="w-[315px] mt-[25px]">
            <div className="relative p-4 rounded-lg shadow-sm hover:shadow-md transition-all overflow-visible" style={{backgroundColor: '#405b9a'}}>
              {/* Пульсирующие окружности */}
              <div className="absolute -top-2 -right-2 w-11 h-11">
                <div 
                  className="absolute inset-0 rounded-full border-[2px] border-white"
                  style={{
                    animation: 'pulse-ring 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  }}
                ></div>
                <div 
                  className="absolute inset-0 rounded-full border-[2px] border-white"
                  style={{
                    animation: 'pulse-ring 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    animationDelay: '0.75s',
                  }}
                ></div>
                <div 
                  className="absolute inset-0 rounded-full border-[2px] border-white"
                  style={{
                    animation: 'pulse-ring 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    animationDelay: '1.5s',
                  }}
                ></div>
              </div>
              
              {/* Логотип компании */}
              <div className="absolute -top-2 -right-2 w-11 h-11 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-10 bg-white p-1.5">
                <picture>
                  <source srcSet="/logo_norda.webp" type="image/webp" />
                  <img 
                    src="/logo_norda.png" 
                    alt="NORDA TRANS Logo"
                    className="w-full h-full object-contain"
                  />
                </picture>
              </div>
              
              <h2 className="text-xl leading-tight text-white">
                <span className="font-bold">Норда транс –</span> <span className="font-normal whitespace-nowrap">правильная логистика</span>
              </h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

