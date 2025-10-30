import { Star, ExternalLink } from "lucide-react";

const ReviewsMobile = () => {
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

  return (
    <section id="reviews" className="w-full py-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold mb-2">Отзывы наших клиентов</h2>
          <p className="text-sm text-muted-foreground">Реальные отзывы с Яндекс.Карт</p>
        </div>

        {/* Rating Summary - Prominent Display */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-primary/20 mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <div className="mb-2">
            <span className="text-5xl font-bold text-gray-900">5.0</span>
          </div>
          <p className="text-lg font-semibold text-gray-700 mb-1">117 отзывов</p>
          <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-gray-200">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">Я</span>
            </div>
            <span className="text-sm font-medium text-muted-foreground">Яндекс.Карты</span>
          </div>
        </div>

        {/* Vertical Reviews List */}
        <div className="space-y-4 mb-6">
          {yandexReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg p-4 shadow-md border border-border"
            >
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={review.avatar}
                  alt={review.author}
                  className="w-12 h-12 rounded-full flex-shrink-0 shadow-lg object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div 
                  className="w-12 h-12 rounded-full flex-shrink-0 shadow-lg items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600"
                  style={{ display: 'none' }}
                >
                  <span className="text-white text-lg font-bold drop-shadow-md">
                    {review.author.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-bold text-sm text-gray-900 truncate">{review.author}</h3>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{review.date}</span>
                  </div>

                  <div className="flex items-center mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                {review.text}
              </p>
            </div>
          ))}
        </div>

        {/* Link to Yandex Maps */}
        <a 
          href="https://yandex.ru/maps/org/norda_trans/1105803360/reviews/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-white px-6 py-4 rounded-xl shadow-lg border border-border hover:shadow-xl transition-all active:scale-95 mx-auto"
        >
          <span className="text-base font-semibold text-primary">Все отзывы на Яндекс.Картах</span>
          <ExternalLink className="w-5 h-5 text-primary" />
        </a>
      </div>
    </section>
  );
};

export default ReviewsMobile;

