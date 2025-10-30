import { useState, useEffect } from "react";
import { Star, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

const Reviews = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const yandexReviews = [
    {
      id: 1,
      author: "Алексей Морозов",
      rating: 5,
      date: "3 дня назад",
      text: "Отличная транспортная компания! Перевозили мебель из Москвы в Санкт-Петербург. Всё прошло идеально, груз доставили в срок и без повреждений. Водители очень вежливые и профессиональные.",
      avatar: "https://avatars.mds.yandex.net/get-yapic/0/0-0/islands-68"
    },
    {
      id: 2,
      author: "Ольга Соколова",
      rating: 5,
      date: "5 дней назад",
      text: "Пользуюсь услугами NORDA TRANS уже второй раз. Всегда качественный сервис, адекватные цены и никаких скрытых платежей. Рекомендую всем, кто ищет надежную компанию!",
      avatar: "https://avatars.mds.yandex.net/get-yapic/69015/0t-5/islands-68"
    },
    {
      id: 3,
      author: "Дмитрий Волков",
      rating: 5,
      date: "1 неделю назад",
      text: "Перевозили оборудование для производства. Очень ответственный подход к делу, всё было упаковано и закреплено как надо. Менеджеры всегда на связи. Спасибо за работу!",
      avatar: "https://avatars.mds.yandex.net/get-altay/15405132/2a00000196f26dce1a8b0683aef018fb725f/S"
    },
    {
      id: 4,
      author: "Марина Петрова",
      rating: 5,
      date: "2 недели назад",
      text: "Благодарю за качественную работу! Перевозка прошла гладко, без задержек. Цена соответствует качеству. Обязательно обращусь снова, если понадобится.",
      avatar: "https://avatars.mds.yandex.net/get-yapic/0/0-0/islands-68"
    },
    {
      id: 5,
      author: "Сергей Иванов",
      rating: 5,
      date: "3 недели назад",
      text: "Профессионалы своего дела! Быстро, аккуратно и недорого. Груз был застрахован, что очень важно. Спасибо большое!",
      avatar: "https://avatars.mds.yandex.net/get-yapic/0/0-0/islands-68"
    },
    {
      id: 6,
      author: "Елена Смирнова",
      rating: 5,
      date: "1 месяц назад",
      text: "Отличный сервис! Менеджер помог подобрать оптимальный вариант доставки. Водители приехали точно в срок, груз упаковали и довезли без повреждений.",
      avatar: "https://avatars.mds.yandex.net/get-yapic/69015/0t-5/islands-68"
    },
    {
      id: 7,
      author: "Андрей Кузнецов",
      rating: 5,
      date: "1 месяц назад",
      text: "Очень доволен! Быстро откликнулись на заявку, предложили лучшую цену. Груз доставлен в идеальном состоянии. Рекомендую!",
      avatar: "https://avatars.mds.yandex.net/get-altay/15405132/2a00000196f26dce1a8b0683aef018fb725f/S"
    },
    {
      id: 8,
      author: "Наталья Васильева",
      rating: 5,
      date: "2 месяца назад",
      text: "Спасибо за оперативность и профессионализм! Груз был хрупкий, но всё довезли целым. Водитель очень аккуратно вёл машину.",
      avatar: "https://avatars.mds.yandex.net/get-yapic/0/0-0/islands-68"
    }
  ];

  const maxSlide = yandexReviews.length - 4;

  // Auto-scroll carousel
  useEffect(() => {
    if (!isHovering) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % (maxSlide + 1));
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isHovering, maxSlide]);

  return (
    <section id="reviews" className="hidden md:block w-full py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50">
      <div className="container mx-auto px-6">
        {/* Section Header with Yandex Badge */}
        <div className="flex items-start justify-between mb-10">
          {/* Left: Yandex Maps Badge */}
          <div className="inline-flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-lg border border-border">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">Я</span>
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">Яндекс.Карты</p>
              <div className="flex items-center gap-2 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
                <span className="text-lg font-bold text-gray-900 ml-1">5.0</span>
                <span className="text-sm text-muted-foreground ml-1">· 117 отзывов</span>
              </div>
            </div>
          </div>

          {/* Center: Title */}
          <div className="flex-1 text-center">
            <h2 className="text-3xl font-bold">Отзывы наших клиентов</h2>
            <p className="text-sm text-muted-foreground mt-2">Реальные отзывы с Яндекс.Карт</p>
          </div>

          {/* Right: Link to Yandex Maps */}
          <a 
            href="https://yandex.ru/maps/org/norda_trans/1105803360/reviews/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white px-6 py-4 rounded-2xl shadow-lg border border-border hover:shadow-xl transition-all hover:scale-105"
          >
            <span className="text-base font-semibold text-primary">Посмотреть на Яндекс.Картах</span>
            <ExternalLink className="w-5 h-5 text-primary" />
          </a>
        </div>

        {/* Reviews Carousel */}
        <div 
          className="relative"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Left Arrow */}
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Предыдущий слайд"
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => setCurrentSlide((prev) => Math.min(maxSlide, prev + 1))}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Следующий слайд"
            disabled={currentSlide === maxSlide}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="overflow-hidden px-2">
            <div 
              className="flex transition-transform duration-700 ease-in-out gap-6"
              style={{ transform: `translateX(calc(-${currentSlide * 25}% - ${currentSlide * 1.5}rem))` }}
            >
              {yandexReviews.map((review) => (
                <div
                  key={review.id}
                  className="flex-shrink-0 w-[calc(25%-1.125rem)] bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-border group"
                >
                  <img
                    src={review.avatar}
                    alt={review.author}
                    className="w-14 h-14 rounded-full mb-4 group-hover:scale-110 transition-transform shadow-lg object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div 
                    className="w-14 h-14 rounded-full mb-4 group-hover:scale-110 transition-transform shadow-lg items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600"
                    style={{ display: 'none' }}
                  >
                    <span className="text-white text-xl font-bold drop-shadow-md">
                      {review.author.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-bold text-base text-gray-900">{review.author}</h3>
                    <span className="text-xs text-muted-foreground ml-auto">{review.date}</span>
                  </div>

                  <div className="flex items-center mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxSlide + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'w-8 bg-primary' 
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Перейти к слайду ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;

