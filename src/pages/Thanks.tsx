import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, Phone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reviews from "@/components/Reviews";
import WorkProcess from "@/components/WorkProcess";

const Thanks = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Получаем путь, откуда пришел пользователь (если есть)
  const fromPath = (location.state as { from?: string })?.from || '/';

  useEffect(() => {
    // Прокручиваем страницу вверх при загрузке
    window.scrollTo(0, 0);
    
    // Отправляем цель в Яндекс Метрику
    if (window.ym) {
      window.ym(57594511, 'reachGoal', 'THANK_YOU_PAGE_VIEW');
    }
  }, []);

  return (
    <div className="min-h-screen bg-quaternary flex flex-col">
      {/* Header */}
      <Header />

      {/* Thank You Section - две колонки */}
      <section className="w-full pt-[15px] pb-12 bg-gradient-to-br from-quaternary via-white to-quaternary">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            {/* Двухколоночная карточка */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-primary/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                
                {/* Левая колонка - Благодарность */}
                <div className="py-8 px-6 flex flex-col justify-center items-center text-center bg-gradient-to-br from-primary/5 to-primary/10">
                  {/* Иконка успеха */}
                  <div className="flex justify-center mb-4">
                    <div className="bg-green-100 rounded-full p-4 animate-bounce">
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                  </div>

                  {/* Заголовок */}
                  <h1 className="text-2xl md:text-3xl font-bold text-primary mb-3">
                    Спасибо за вашу заявку!
                  </h1>

                  {/* Описание */}
                  <p className="text-base text-gray-700 mb-2">
                    Ваша заявка успешно отправлена нашим специалистам.
                  </p>
                  <p className="text-lg font-semibold text-secondary mb-6">
                    Мы свяжемся с вами в течение <span className="text-primary">10 минут</span>
                  </p>

                  {/* Кнопки действий */}
                  <div className="flex flex-col w-full max-w-sm gap-3">
                    <Button
                      onClick={() => navigate('/')}
                      variant="outline"
                      className="flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Вернуться к тарифам
                    </Button>
                    <Button
                      onClick={() => navigate(fromPath)}
                      style={{ backgroundColor: '#083cb5' }}
                      className="flex items-center justify-center gap-2"
                    >
                      Рассчитать другую перевозку
                    </Button>
                  </div>
                </div>

                {/* Правая колонка - Информация о менеджере */}
                <div className="py-8 px-6 flex flex-col justify-center bg-white border-l border-primary/10">
                  {/* Информация о менеджере */}
                  <div className="mb-6">
                    <div className="bg-quaternary/50 rounded-xl p-5 border border-primary/10">
                      <p className="text-sm text-gray-600 mb-3">
                        Ваш персональный менеджер:
                      </p>
                      <p className="text-2xl font-bold text-primary mb-3">
                        Дарья
                      </p>
                      <a 
                        href="tel:+74994440651" 
                        className="flex items-center justify-center gap-2 text-lg font-semibold text-gray-800 hover:text-primary transition-colors"
                      >
                        <Phone className="w-5 h-5 text-primary" />
                        +7 (499) 444-06-51
                      </a>
                    </div>
                  </div>

                  {/* Дополнительная информация */}
                  <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                    <p className="text-sm text-gray-700 text-center leading-relaxed">
                      Если у вас остались вопросы, позвоните нам прямо сейчас по указанному номеру телефона
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Yandex Reviews Section */}
      <Reviews />

      {/* Work Process Section - Работаем быстро! */}
      <WorkProcess />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Thanks;
