import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, Clock, Shield, TrendingUp, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import YandexMetrika from "@/components/YandexMetrika";
import { NewStepCalculator } from "@/components/NewStepCalculator";
import { useYandexMetrika } from "@/hooks/useYandexMetrika";
import { BannerUp } from "@/components/BannerUp";
import { BrandCard } from "@/components/BrandCard";
import { RoutesAccordion } from "@/components/RoutesAccordion";
import { CouponSection } from "@/components/CouponSection";
import Reviews from "@/components/Reviews";
import ReviewsMobile from "@/components/ReviewsMobile";
import { FlipProblemsSection } from "@/components/FlipProblemsSection";
import { FloatingWhatsAppButton } from "@/components/FloatingWhatsAppButton";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <YandexMetrika />
      <Header />
      
      {/* Hero Section - Desktop Only */}
      <BannerUp 
        className="hidden lg:block w-full h-[280px]" 
        overlayType="white"
        backgroundImage="/Lucid_Origin_Photorealistic_169_wallpaper_a_white_cab_Scania_s_3.webp"
        backgroundPosition="center 50%"
      />

      {/* Mobile: 1. О компании НОРДА ТРАНС */}
      <section className="lg:hidden w-full py-8 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl font-bold mb-4" style={{color: '#083cb5'}}>
            О компании НОРДА ТРАНС
          </h2>
          
          <div className="space-y-3 text-base leading-relaxed text-muted-foreground">
            <p>
              Автомобильные грузоперевозки — основная специализация нашей компании. 
              Мы осуществляем доставку любого груза в любую точку быстро, недорого и оперативно!
            </p>
            
            <p>
              Благодаря оптимизации внутренних процессов мы достигли золотой середины, смогли сделать так, 
              чтобы наши цены были значительно ниже, чем у конкурентов, 
              а качество услуг на самом высшем уровне!
            </p>
            
            <p>
              Подтверждением этого служит хороший рейтинг и множество положительных отзывов 
              Яндекс и самой главной бирже перевозчиков России и СНГ 
              Авто Транс Инфо.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button 
              size="lg"
              className="w-full"
              style={{backgroundColor: '#083cb5'}}
              onClick={() => navigate('/tarify')}
            >
              Смотреть тарифы
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => {
                window.location.href = 'tel:+74994440651';
              }}
            >
              <Phone className="w-5 h-5 mr-2" />
              Позвонить
            </Button>
          </div>
        </div>
      </section>

      {/* Mobile: 2. Популярные маршруты */}
      <section className="lg:hidden w-full py-8 bg-[#f0f3f5]">
        <div className="container mx-auto px-6">
          <RoutesAccordion />
        </div>
      </section>

      {/* Mobile: 3. Купоны на скидку */}
      <section className="lg:hidden w-full py-8 bg-background">
        <div className="container mx-auto px-6">
          <CouponSection />
        </div>
      </section>

      {/* Mobile: 4. Отзывы */}
      <div className="lg:hidden">
        <ReviewsMobile />
      </div>

      {/* Mobile: 5. Честно о том, чего вы боитесь */}
      <div className="lg:hidden">
        <FlipProblemsSection />
      </div>

      {/* Desktop: Work Fast Section */}
      <section className="hidden lg:block w-full pb-16 bg-[#f0f3f5]" style={{ paddingTop: 'calc(4rem - 15px)' }}>
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12" style={{color: '#083cb5'}}>
            Работаем быстро
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <BrandCard
              title="Быстрая подача"
              description="Автомобиль подается в течение 2-3 часов после заявки"
              icon={Clock}
              maskColor="#f0f3f5"
            />

            <BrandCard
              title="Широкий автопарк"
              description="Более 100 единиц техники различной грузоподъёмности"
              icon={Truck}
              maskColor="#f0f3f5"
            />

            <BrandCard
              title="Надёжность"
              description="Страхование груза и полная ответственность за сохранность"
              icon={Shield}
              maskColor="#f0f3f5"
            />

            <BrandCard
              title="Выгодные цены"
              description="Цены ниже, чем у конкурентов, без потери качества"
              icon={TrendingUp}
              maskColor="#f0f3f5"
            />
          </div>
        </div>
      </section>

      {/* Desktop: Calculator Section */}
      <NewStepCalculator />

      {/* Desktop: Calculator and Company Info Section */}
      <section id="calculator" className="hidden lg:block w-full py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Left Column - Popular Routes */}
            <div>
              <RoutesAccordion />
            </div>

            {/* Right Column - Company Info */}
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-6" style={{color: '#083cb5'}}>
                О компании НОРДА ТРАНС
              </h2>
              
              <div className="space-y-4 text-lg leading-relaxed text-muted-foreground">
                <p>
                  Автомобильные грузоперевозки — основная специализация нашей компании. 
                  Мы осуществляем доставку любого груза в любую точку быстро, недорого и оперативно!
                </p>
                
                <p>
                  Благодаря оптимизации внутренних процессов мы достигли золотой середины, смогли сделать так, 
                  чтобы наши цены были значительно ниже, чем у конкурентов, 
                  а качество услуг на самом высшем уровне!
                </p>
                
                <p>
                  Подтверждением этого служит хороший рейтинг и множество положительных отзывов 
                  Яндекс и самой главной бирже перевозчиков России и СНГ 
                  Авто Транс Инфо.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <Button 
                  size="lg"
                  style={{backgroundColor: '#083cb5'}}
                  onClick={() => navigate('/tarify')}
                >
                  Смотреть тарифы
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    window.location.href = 'tel:+74994440651';
                  }}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Позвонить
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Desktop: Reviews */}
      <div className="hidden lg:block">
        <Reviews />
      </div>

      {/* Floating WhatsApp Button - Mobile Only */}
      <FloatingWhatsAppButton />

      <Footer />
    </div>
  );
};

export default Index;
