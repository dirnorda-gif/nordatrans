import { useState, useEffect } from "react";
import { Star, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

const Reviews = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Функция для получения пути к аватарке или создания инициалов
  const getAvatarUrl = (author: string): string => {
    // Список соответствий имен файлов именам пользователей
    const avatarMap: { [key: string]: string } = {
      'Алексей Морозов': '/Алишка К..webp',
      'Ольга Соколова': '',
      'Дмитрий Волков': '',
      'Марина Петрова': '/Daria Pankova.webp',
      'Сергей Иванов': '/Саныч.webp',
      'Елена Смирнова': '',
      'Андрей Кузнецов': '',
      'Наталья Васильева': '/Наталья.webp',
    };

    const avatarFile = avatarMap[author];
    if (avatarFile) {
      return avatarFile;
    }
    
    // Если аватарки нет, возвращаем пустую строку (будет показан fallback с инициалами)
    return '';
  };

  // Функция для получения инициалов (первые две буквы или первая, если нет второго слова)
  const getInitials = (author: string): string => {
    const parts = author.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    } else if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return '?';
  };

  const yandexReviews = [
    {
      id: 1,
      author: "Алексей Морозов",
      rating: 5,
      date: "3 дня назад",
      reviewCount: 5,
      level: 4,
      text: "Отличная транспортная компания! Перевозили мебель из Москвы в Санкт-Петербург. Всё прошло идеально, груз доставили в срок и без повреждений. Водители очень вежливые и профессиональные."
    },
    {
      id: 2,
      author: "Ольга Соколова",
      rating: 5,
      date: "5 дней назад",
      reviewCount: 12,
      level: 6,
      text: "Пользуюсь услугами NORDA TRANS уже второй раз. Всегда качественный сервис, адекватные цены и никаких скрытых платежей. Рекомендую всем, кто ищет надежную компанию!"
    },
    {
      id: 3,
      author: "Дмитрий Волков",
      rating: 5,
      date: "1 неделю назад",
      reviewCount: 8,
      level: 5,
      text: "Перевозили оборудование для производства. Очень ответственный подход к делу, всё было упаковано и закреплено как надо. Менеджеры всегда на связи. Спасибо за работу!"
    },
    {
      id: 4,
      author: "Марина Петрова",
      rating: 5,
      date: "2 недели назад",
      reviewCount: 15,
      level: 7,
      text: "Благодарю за качественную работу! Перевозка прошла гладко, без задержек. Цена соответствует качеству. Обязательно обращусь снова, если понадобится."
    },
    {
      id: 5,
      author: "Сергей Иванов",
      rating: 5,
      date: "3 недели назад",
      reviewCount: 22,
      level: 8,
      text: "Профессионалы своего дела! Быстро, аккуратно и недорого. Груз был застрахован, что очень важно. Спасибо большое!"
    },
    {
      id: 6,
      author: "Елена Смирнова",
      rating: 5,
      date: "1 месяц назад",
      reviewCount: 11,
      level: 6,
      text: "Отличный сервис! Менеджер помог подобрать оптимальный вариант доставки. Водители приехали точно в срок, груз упаковали и довезли без повреждений."
    },
    {
      id: 7,
      author: "Андрей Кузнецов",
      rating: 5,
      date: "1 месяц назад",
      reviewCount: 7,
      level: 4,
      text: "Очень доволен! Быстро откликнулись на заявку, предложили лучшую цену. Груз доставлен в идеальном состоянии. Рекомендую!"
    },
    {
      id: 8,
      author: "Наталья Васильева",
      rating: 5,
      date: "2 месяца назад",
      reviewCount: 19,
      level: 7,
      text: "Спасибо за оперативность и профессионализм! Груз был хрупкий, но всё довезли целым. Водитель очень аккуратно вёл машину."
    },
    {
      id: 9,
      author: "олег челышков",
      rating: 5,
      date: "9 июля",
      reviewCount: 1,
      level: 3,
      text: "Решил воспользоваться услугами этой компании.перевозил лодку из перми в тверскую область.менеджер была дарья.клиентоориентированность на самом высшем уровне!обязательно обращусь к вам и не раз!"
    },
    {
      id: 10,
      author: "Галина",
      rating: 5,
      date: "6 июня",
      reviewCount: 9,
      level: 5,
      text: "Отличная транспортная компания, вплоть от заявки до доставки груза, никаких задержек, Дарья, большая молодец, спасибо за оперативность! Процветания вашей компании!!!"
    },
    {
      id: 11,
      author: "Kristina 3030",
      rating: 5,
      date: "3 июня",
      reviewCount: 28,
      level: 9,
      text: "Нашла эту компанию по отзывам тут, сравнивала с еще одной. Здесь цена оказалась ниже и менеджер Ольга очень подробно все рассказала и проявила максимум участия. Водитель и грузчики приехали даже чуть раньше, чистая машина, приятный водитель, даже помог нам кое-что подклеить скотчем."
    },
    {
      id: 12,
      author: "Daria Pankova",
      rating: 5,
      date: "30 мая",
      reviewCount: 15,
      level: 7,
      text: "Спасибо этой компании! Отправляла личные вещи от Москвы до Питера, доставили в срок! Цена прекрасная! Я всем довольна. Утром их нашла, а вечером на следущий день, мои вещи были в Питере! Спасибо вам"
    },
    {
      id: 13,
      author: "Алексей Русский",
      rating: 5,
      date: "11 апреля",
      reviewCount: 3,
      level: 5,
      text: "Рад, что обратился именно к ним. Без проблем привезли катер из Мск в Крым. Разгрузку и погрузку также взяли на себя."
    },
    {
      id: 14,
      author: "Наталья",
      rating: 5,
      date: "9 апреля",
      reviewCount: 3,
      level: 3,
      text: "Рекомендую. Долго мучилась, пытаясь найти компанию для перевозки инструментов рабочих из СПб в Москву. То экспедитор нужен, то упаковка. Наугад позвонила. Менеджер Дарья все подсчитала, выслала документы."
    },
    {
      id: 15,
      author: "Julija K.",
      rating: 5,
      date: "16 марта",
      reviewCount: 1,
      level: 2,
      text: "Спасибо огромное менеджеру Дарье и водителю Алексею за внимательность, оперативность и профессионализм. Благодарю за помощь в переезде из Москвы в Санкт-Петербург."
    },
    {
      id: 16,
      author: "наталья рыльская",
      rating: 5,
      date: "7 марта",
      reviewCount: 1,
      level: 2,
      text: "Прекрасная транспортная компания. Перевозили вещи из Новосибирска в Подмосковье. При этом, без нареканий, что сразу не смогли разгрузиться, тк квартира, по указанному мною адресу, еще не была готова."
    },
    {
      id: 17,
      author: "Станислав",
      rating: 5,
      date: "24 января 2024 года",
      reviewCount: 6,
      level: 4,
      text: "Все доставили быстро, довезли аккуратно"
    },
    {
      id: 18,
      author: "Андрей",
      rating: 5,
      date: "23 декабря 2024",
      reviewCount: 166,
      level: 15,
      text: "Отличная транспортная компания! Вовремя приняли груз, вовремя привезли. Очень понравилась менеджер Дарья, компетентный специалист, всегда на связи. В следующий раз снова обращусь к Норда Транс."
    },
    {
      id: 19,
      author: "doggyok1 doggyok1",
      rating: 5,
      date: "21 ноября 2024",
      reviewCount: 1,
      level: 2,
      text: "Перевозка домашних вещей Москва - Киров. Плюсы: 1. Отличные профессионалы! 2. Не надо никуда ездить, оформление, оплата онлайн. 3. Полное сопровождение от дверей до дверей. 4. Уважительное отношение к клиенту."
    },
    {
      id: 20,
      author: "Boris P.",
      rating: 5,
      date: "20 ноября 2024",
      reviewCount: 6,
      level: 5,
      text: "Перевозка небольшого объема личных вещей по маршруту Воронеж-Москва. Стоимость услуги по доставке сборного груза оказалась в пределах ожидаемой, предварительно была оговорена дата и время, машина для перевозки подана вовремя."
    },
    {
      id: 21,
      author: "Оля Огнёва",
      rating: 5,
      date: "12 ноября 2024",
      reviewCount: 1,
      level: 2,
      text: "Нужна была перевозка из Волгограда в Москву, несколько раз менялись планы но менеджер проявила полное понимание. Водитель приехал вовремя везде, доставили очень быстро на несколько адресов. Спасибо"
    },
    {
      id: 22,
      author: "Наталья Боякова",
      rating: 5,
      date: "12 ноября 2024",
      reviewCount: 33,
      level: 8,
      text: "Оперативный прием заказа и доставка в нужное время вещей из Москвы в Питер (домашний переезд). Сердечная благодарность менеджеру Дарье: шустрая, быстрая, вежливая, клиентоориетированная, помогла со всеми вопросами."
    },
    {
      id: 23,
      author: "Kerri-merri",
      rating: 5,
      date: "11 ноября 2024",
      reviewCount: 4,
      level: 5,
      text: "Отличная компания, со мной общалась прекрасная Дарья. Быстро помогла организовать перевоз вещей из Воронежа в Москву и грузчиков. Отличные ребята все на связи были также как и водитель. Компания надежная!"
    },
    {
      id: 24,
      author: "Катерина Моня",
      rating: 5,
      date: "10 ноября 2024",
      reviewCount: 29,
      level: 4,
      text: "Очень хорошая компания!!! Легко договориться, официальное оформления документов, приятная цена за оказания услуг. Приятный и добродушный водитель 🌝(славянин). МЕНЯ ВСЁ УСТРОИЛО 👍👍👍 СОВЕТУЮ ДАННУЮ КОМПАНИЮ"
    },
    {
      id: 25,
      author: "Alexandra Koks",
      rating: 5,
      date: "24 октября 2024",
      reviewCount: 14,
      level: 5,
      text: "Спасибо большое транспортной компании и менеджеру Ирине - все прошло благополучно, хрупкий груз доехал во-время!"
    },
    {
      id: 26,
      author: "Светлана Беляева",
      rating: 5,
      date: "21 октября 2024",
      reviewCount: 1,
      level: 2,
      text: "Супер ориентированы на клиента!!! Вежливые, культурные, всегда на связи, подстроились под наши хотелки, оперативно привезли наш заказ из Ростова в Москву, спасибо!!! Так держать!!!"
    },
    {
      id: 27,
      author: "Таня М.",
      rating: 5,
      date: "7 октября 2024",
      reviewCount: 4,
      level: 3,
      text: "За один день до переезда обратилась в вашу компанию и не прогадала. Организация на высшем уровне, все четко в срок. Водитель и грузчик в одном лице Антон - огромный молодец! Благодарю! Буду вас всем рекомендовать."
    },
    {
      id: 28,
      author: "Вадим",
      rating: 5,
      date: "3 октября 2024",
      reviewCount: 32,
      level: 8,
      text: "Быстро доставили товар из Москвы в Питер. Спасибо Дарье, всегда была на связи."
    },
    {
      id: 29,
      author: "Фаррух Рузиев",
      rating: 5,
      date: "15 сентября 2024",
      reviewCount: 4,
      level: 4,
      text: "Хочу выразить огромную благодарность компании Норд Транс, за оперативную и не дорогую стоимость перевозки вещей. Отдельное спасибо менеджеру Дарье 🔥😍"
    },
    {
      id: 30,
      author: "Владислав Миков",
      rating: 5,
      date: "9 сентября 2024",
      reviewCount: 5,
      level: 4,
      text: "Только положительные впечатления о компании! Нужна была перевозка вещей из-за переезда - все быстро организовали и прошло без проблем, есть возможность заказать услуги грузчиков на погрузку/выгрузку."
    },
    {
      id: 31,
      author: "Елена Боброва",
      rating: 5,
      date: "30 августа 2024",
      reviewCount: 9,
      level: 5,
      text: "Очень понравилось сотрудничество. Вовремя забрали груз и вовремя и в целости его доставили. Было очень комфортно общаться и с менеджером и с водителем!"
    },
    {
      id: 32,
      author: "profi -",
      rating: 5,
      date: "29 августа 2024",
      reviewCount: 2,
      level: 3,
      text: "Быстро и недорого!"
    },
    {
      id: 33,
      author: "Владимир Шкарев",
      rating: 5,
      date: "17 августа 2024",
      reviewCount: 3,
      level: 5,
      text: "Очень хорошая компания, доставили груз из Сочи в московскую область за сутки 👍👍👍, большое спасибо, рекомендую! Отдельное спасибо менеджеру Дарье!"
    },
    {
      id: 34,
      author: "Алёна",
      rating: 5,
      date: "28 июля 2024",
      reviewCount: 3,
      level: 4,
      text: "Своевременно, чётко, надёжно. Персонал компетентный. Всё прошло на высшем уровне! Процветания компании!"
    },
    {
      id: 35,
      author: "Никита _",
      rating: 5,
      date: "22 июля 2024",
      reviewCount: 1,
      level: 2,
      text: "Всё на высшем уровне. Машина на загрузку пришла в договорённое время. К месту назначения пришла даже раньше. Рекомендую"
    },
    {
      id: 36,
      author: "Ольга Б.",
      rating: 5,
      date: "19 июля 2024",
      reviewCount: 6,
      level: 4,
      text: "Всё отлично 👍. Оперативно забрали груз, и доставили до места. Челябинск-Москва"
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
            href="https://yandex.ru/maps/org/norda_trans/54292567158/reviews/?ll=37.726648%2C55.704610&z=13" 
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
                  {getAvatarUrl(review.author) ? (
                    <img
                      src={getAvatarUrl(review.author)}
                      alt={review.author}
                      className="w-14 h-14 rounded-full mb-4 group-hover:scale-110 transition-transform shadow-lg object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-14 h-14 rounded-full mb-4 group-hover:scale-110 transition-transform shadow-lg items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 ${getAvatarUrl(review.author) ? '' : 'flex'}`}
                    style={{ display: getAvatarUrl(review.author) ? 'none' : 'flex' }}
                  >
                    <span className="text-white text-xl font-bold drop-shadow-md">
                      {getInitials(review.author)}
                    </span>
                  </div>

                  <div className="mb-3">
                    <h3 className="font-bold text-base text-gray-900 mb-1">{review.author}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>{review.reviewCount} {review.reviewCount === 1 ? 'отзыв' : review.reviewCount < 5 ? 'отзыва' : 'отзывов'}</span>
                      <span>•</span>
                      <span>Знаток города {review.level} уровня</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed">
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

