import React from 'react';
import { BannerUp } from './BannerUp';

/**
 * Компонент баннера "Норда транс – правильные переезды"
 * Специально для страниц переезда (/pereezd и /pereezd-iz)
 */
export const BannerUpPereezd: React.FC = () => {
  return (
    <BannerUp 
      className="hidden md:block w-full h-[400px]" 
      overlayType="white"
      backgroundImage="/diploma.webp"
      backgroundPosition="center center"
      backgroundSize="cover"
    >
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
      
      {/* Content - Empty, only background image */}
    </BannerUp>
  );
};

