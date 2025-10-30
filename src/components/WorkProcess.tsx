import { Keyboard, Phone, ThumbsUp, Truck } from "lucide-react";

const WorkProcess = () => {
  return (
    <section className="w-full py-16 relative overflow-hidden" style={{
      backgroundImage: 'url(/Snow.webp)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#f0f3f5'
    }}>
      <div className="container mx-auto px-6 relative z-10">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white">
            Работаем быстро!
          </h2>
        </div>

        {/* Process Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Step 1 - Отправляете запрос */}
          <div className="relative group">
            {/* Иконка в кружочке - 48px - размещена ВНЕ карточки */}
            <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-20" style={{ backgroundColor: '#083cb5' }}>
              <Keyboard className="w-6 h-6 text-white" />
            </div>
            
            <div className="relative rounded-lg p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              WebkitMaskImage: 'radial-gradient(circle 32px at calc(100% + 8px) -8px, transparent 0, transparent 32px, black 32px)',
              maskImage: 'radial-gradient(circle 32px at calc(100% + 8px) -8px, transparent 0, transparent 32px, black 32px)'
            }}>
              <h3 className="text-xl font-bold text-center mb-3 relative z-10" style={{ color: '#050b18' }}>
                Отправляете запрос
              </h3>
              <p className="text-center text-sm text-muted-foreground leading-relaxed relative z-10">
                Заполните форму на сайте или свяжитесь с нами по телефону
              </p>
            </div>
          </div>

          {/* Step 2 - Уточняем детали */}
          <div className="relative group">
            {/* Иконка в кружочке - 48px - размещена ВНЕ карточки */}
            <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-20" style={{ backgroundColor: '#405b9a' }}>
              <Phone className="w-6 h-6 text-white" />
            </div>
            
            <div className="relative rounded-lg p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              WebkitMaskImage: 'radial-gradient(circle 32px at calc(100% + 8px) -8px, transparent 0, transparent 32px, black 32px)',
              maskImage: 'radial-gradient(circle 32px at calc(100% + 8px) -8px, transparent 0, transparent 32px, black 32px)'
            }}>
              <h3 className="text-xl font-bold text-center mb-3 relative z-10" style={{ color: '#050b18' }}>
                Уточняем детали
              </h3>
              <p className="text-center text-sm text-muted-foreground leading-relaxed relative z-10">
                Наш менеджер свяжется с вами для уточнения всех деталей
              </p>
            </div>
          </div>

          {/* Step 3 - Заключаем договор */}
          <div className="relative group">
            {/* Иконка в кружочке - 48px - размещена ВНЕ карточки */}
            <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-20" style={{ backgroundColor: '#083cb5' }}>
              <ThumbsUp className="w-6 h-6 text-white" />
            </div>
            
            <div className="relative rounded-lg p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              WebkitMaskImage: 'radial-gradient(circle 32px at calc(100% + 8px) -8px, transparent 0, transparent 32px, black 32px)',
              maskImage: 'radial-gradient(circle 32px at calc(100% + 8px) -8px, transparent 0, transparent 32px, black 32px)'
            }}>
              <h3 className="text-xl font-bold text-center mb-3 relative z-10" style={{ color: '#050b18' }}>
                Заключаем договор
              </h3>
              <p className="text-center text-sm text-muted-foreground leading-relaxed relative z-10">
                Оформляем все документы и согласовываем условия доставки
              </p>
            </div>
          </div>

          {/* Step 4 - Доставляем груз */}
          <div className="relative group">
            {/* Иконка в кружочке - 48px - размещена ВНЕ карточки */}
            <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-20" style={{ backgroundColor: '#405b9a' }}>
              <Truck className="w-6 h-6 text-white" />
            </div>
            
            <div className="relative rounded-lg p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              WebkitMaskImage: 'radial-gradient(circle 32px at calc(100% + 8px) -8px, transparent 0, transparent 32px, black 32px)',
              maskImage: 'radial-gradient(circle 32px at calc(100% + 8px) -8px, transparent 0, transparent 32px, black 32px)'
            }}>
              <h3 className="text-xl font-bold text-center mb-3 relative z-10" style={{ color: '#050b18' }}>
                Доставляем груз
              </h3>
              <p className="text-center text-sm text-muted-foreground leading-relaxed relative z-10">
                Ваш груз доставлен точно в срок и в целости и сохранности
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkProcess;

