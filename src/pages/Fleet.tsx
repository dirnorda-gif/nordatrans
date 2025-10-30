import { Truck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import YandexMetrika from "@/components/YandexMetrika";
import { BannerUp } from "@/components/BannerUp";

const Fleet = () => {
  // Данные автопарка
  const trucks = [
    {
      id: 1,
      volume: "6м³",
      capacity: "800кг",
      length: "2.65м",
      width: "1,5м",
      height: "1,6м",
      pallets: 2,
      description: "Компактный транспорт для небольших грузов",
      color: "#083cb5",
      image: "/1.webp"
    },
    {
      id: 2,
      volume: "9м³",
      capacity: "1,5т",
      length: "3м",
      width: "1,95м",
      height: "1,6м",
      pallets: 4,
      description: "Газель для городских и междугородних перевозок",
      color: "#405b9a",
      image: "/3.webp"
    },
    {
      id: 3,
      volume: "15м³",
      capacity: "3т",
      length: "3,80м",
      width: "2,1м",
      height: "2м",
      pallets: 6,
      description: "Оптимальный выбор для переезда или перевозки товаров",
      color: "#083cb5",
      image: "/5.webp"
    },
    {
      id: 4,
      volume: "30м³",
      capacity: "5т",
      length: "4-6м",
      width: "2,3м",
      height: "2,2м",
      pallets: 10,
      description: "Вместительный транспорт для крупных партий груза",
      color: "#405b9a",
      image: "/7.webp"
    },
    {
      id: 5,
      volume: "45м³",
      capacity: "10т",
      length: "6-9м",
      width: "2,4м",
      height: "2,35м",
      pallets: 17,
      description: "Фура для междугородних и межрегиональных перевозок",
      color: "#083cb5",
      image: "/2.webp"
    },
    {
      id: 6,
      volume: "82м³",
      capacity: "20т",
      length: "13,6м",
      width: "2,45м",
      height: "2,65м",
      pallets: 33,
      description: "Максимальный объем для крупногабаритных грузов",
      color: "#405b9a",
      image: "/4.webp"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <BannerUp className="w-full py-20" overlayType="dark">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Truck className="w-5 h-5" />
              <span className="text-sm font-medium">Наш автопарк</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Современный автопарк для любых задач
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              От компактных Газелей до 20-тонных фур. Подберем оптимальный транспорт для вашего груза
            </p>
          </div>
        </div>
      </BannerUp>

      {/* Fleet Cards Section */}
      <section className="py-16 bg-gradient-to-b from-background to-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trucks.map((truck) => (
              <div
                key={truck.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
              >
                {/* Truck Image */}
                <div className="relative h-[210px] overflow-hidden bg-white flex items-center justify-center">
                  <img
                    src={truck.image}
                    alt={`${truck.volume} - ${truck.capacity}`}
                    className="w-auto h-[210px] object-contain group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Overlay Badge */}
                  <div 
                    className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-white text-xs font-bold shadow-lg"
                    style={{ backgroundColor: truck.color }}
                  >
                    {truck.volume}
                  </div>
                </div>

                {/* Card Header */}
                <div 
                  className="p-6 text-white relative overflow-hidden bg-opacity-70"
                  style={{ backgroundColor: truck.color }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <Truck className="w-10 h-10" />
                      <div className="text-right">
                        <div className="text-2xl font-bold">{truck.capacity}</div>
                        <div className="text-xs opacity-90">Грузоподъемность</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">Параметры фургона</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Внутренняя длина:</span>
                      <span className="font-semibold text-gray-800">{truck.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Внутренняя ширина:</span>
                      <span className="font-semibold text-gray-800">{truck.width}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Внутренняя высота:</span>
                      <span className="font-semibold text-gray-800">{truck.height}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Грузоподъемность:</span>
                      <span className="font-semibold text-gray-800">{truck.capacity}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Полезный объем:</span>
                      <span className="font-semibold text-gray-800">{truck.volume}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Паллето-мест:</span>
                      <span className="font-semibold" style={{ color: truck.color }}>
                        {truck.pallets} шт
                      </span>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <button
                    className="w-full mt-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    style={{ backgroundColor: truck.color }}
                  >
                    Заказать транспорт
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Почему выбирают нас</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Мы предлагаем качественные услуги грузоперевозок с современным автопарком
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Новый автопарк</h3>
              <p className="text-gray-600 text-sm">
                Весь транспорт не старше 3 лет
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Надежность</h3>
              <p className="text-gray-600 text-sm">
                Страхование и гарантии сохранности
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Пунктуальность</h3>
              <p className="text-gray-600 text-sm">
                Доставка строго в согласованные сроки
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Выгодные цены</h3>
              <p className="text-gray-600 text-sm">
                Конкурентные тарифы без переплат
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <BannerUp className="py-20" overlayType="blue">
        <div className="container mx-auto px-6 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Нужна консультация по выбору транспорта?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Наши специалисты помогут подобрать оптимальный вариант для вашего груза
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="tel:+74994440651"
              className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              +7 (499) 444-06-51
            </a>
            <a 
              href="https://wa.me/79299882201"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-8 py-4 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Написать в WhatsApp
            </a>
          </div>
        </div>
      </BannerUp>

      {/* Яндекс Метрика */}
      <YandexMetrika />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Fleet;

