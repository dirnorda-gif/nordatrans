import { useState, useEffect } from "react";
import { Phone, Mail, MapPin, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import YandexMetrika from "@/components/YandexMetrika";
import { toast } from "sonner";
import { BannerUp } from "@/components/BannerUp";

const Contacts = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Прокручиваем страницу вверх при загрузке
    window.scrollTo(0, 0);
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^\d+]/g, '');
    if (!value.startsWith('+7')) {
      value = '+7 ' + value.replace(/^\+?7?\s*/, '');
    }
    setPhone(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone || !comment) {
      toast.error("Пожалуйста, заполните все обязательные поля");
      return;
    }

    setIsSubmitting(true);

    try {
      // Отправка в Bitrix24 (упрощенная версия для формы обратной связи)
      const webhookUrl = 'https://nordatrans.bitrix24.ru/rest/1/la8f9cfu3icpekuz/';
      
      const leadFields: any = {
        TITLE: `Обратная связь от ${name}`,
        NAME: name,
        PHONE: [{ VALUE: phone, VALUE_TYPE: 'MOBILE' }],
        COMMENTS: `ФОРМА ОБРАТНОЙ СВЯЗИ\n\n${comment}${email ? `\n\nEmail: ${email}` : ''}`,
        SOURCE_ID: 'WEB',
      };

      if (email) {
        leadFields.EMAIL = [{ VALUE: email, VALUE_TYPE: 'WORK' }];
      }

      const response = await fetch(`${webhookUrl}crm.lead.add.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: leadFields })
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error_description || result.error);
      }

      toast.success("Сообщение отправлено! Мы свяжемся с вами в ближайшее время.");
      
      // Очищаем форму
      setName("");
      setPhone("");
      setEmail("");
      setComment("");

      // Отправляем цель в Яндекс Метрику
      if (window.ym) {
        window.ym(57594511, 'reachGoal', 'CONTACT_FORM_SUBMIT');
      }

    } catch (error) {
      console.error("Ошибка при отправке:", error);
      toast.error("Ошибка при отправке сообщения. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <YandexMetrika />
      <Header />
      
      {/* Hero Section */}
      <BannerUp className="w-full py-16" overlayType="dark">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-5xl font-bold mb-4">
              Контакты
            </h1>
            <p className="text-xl text-gray-200">
              Свяжитесь с нами удобным для вас способом
            </p>
          </div>
        </div>
      </BannerUp>

      {/* Contact Information Section - Двухколоночная структура */}
      <section className="w-full py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Левая колонка - Контактная информация */}
            <div className="space-y-8">
              
              {/* Перевозки по России */}
              <div className="bg-[#f0f3f5] rounded-lg p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-2xl font-bold mb-6" style={{color: '#083cb5'}}>
                  Перевозки по России
                </h2>
                <div className="space-y-4">
                  <a 
                    href="tel:+74994440651" 
                    className="flex items-center gap-3 text-lg hover:text-primary transition-colors group"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-semibold">+7 (499) 444 06 51</span>
                  </a>
                  <a 
                    href="mailto:logist@nordatrans.ru" 
                    className="flex items-center gap-3 text-lg hover:text-primary transition-colors group"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <span>logist@nordatrans.ru</span>
                  </a>
                </div>
              </div>

              {/* Перевозки по Москве */}
              <div className="bg-[#f0f3f5] rounded-lg p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-2xl font-bold mb-6" style={{color: '#083cb5'}}>
                  Перевозки по Москве
                </h2>
                <div className="space-y-4">
                  <a 
                    href="tel:+74952155430" 
                    className="flex items-center gap-3 text-lg hover:text-primary transition-colors group"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-semibold">+7 (495) 215 54 30</span>
                  </a>
                  <a 
                    href="mailto:logist2@nordatrans.ru" 
                    className="flex items-center gap-3 text-lg hover:text-primary transition-colors group"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <span>logist2@nordatrans.ru</span>
                  </a>
                </div>
              </div>

              {/* Наши адреса */}
              <div className="bg-[#f0f3f5] rounded-lg p-8 border border-border shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-2xl font-bold mb-6" style={{color: '#083cb5'}}>
                  Наши адреса
                </h2>
                <div className="space-y-6">
                  
                  {/* Москва */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2" style={{color: '#405b9a'}}>
                        Москва
                      </h3>
                      <p className="text-muted-foreground">
                        Волгоградский проспект 46Б к1
                      </p>
                    </div>
                  </div>

                  {/* Казань */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2" style={{color: '#405b9a'}}>
                        Казань
                      </h3>
                      <p className="text-muted-foreground">
                        ул. Чистопольская, 19а
                      </p>
                    </div>
                  </div>

                  {/* Воронеж */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2" style={{color: '#405b9a'}}>
                        Воронеж
                      </h3>
                      <p className="text-muted-foreground">
                        ул. Плехановская, 53<br />
                        бизнес центр «Застава»<br />
                        офис 6010
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Правая колонка - Форма обратной связи */}
            <div>
              <div className="bg-[#f0f3f5] rounded-lg p-8 border border-border shadow-sm sticky top-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Обратная связь</h2>
                </div>
                
                <p className="text-muted-foreground mb-6">
                  Поделитесь мнением о нашей работе или задайте нам любой интересующий вас вопрос в поле комментарий!
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ваше имя *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Иван Иванов"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+7 (999) 999-99-99"
                      value={phone}
                      onChange={handlePhoneChange}
                      onFocus={(e) => {
                        if (!e.target.value) {
                          setPhone('+7 ');
                        }
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (необязательно)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@mail.ru"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comment">Комментарий *</Label>
                    <Textarea
                      id="comment"
                      placeholder="Расскажите нам о вашем вопросе или оставьте отзыв..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={6}
                      required
                    />
                  </div>

                  <Button 
                    type="submit"
                    className="w-full"
                    style={{backgroundColor: '#083cb5'}}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Отправка..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Отправить сообщение
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    * Обязательные поля для заполнения
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contacts;

