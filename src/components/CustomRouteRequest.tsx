import { useState } from "react";
import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBitrix24Lead } from "@/utils/bitrix24";
import { toast } from "sonner";

const CustomRouteRequest = () => {
  const [contactMethod, setContactMethod] = useState<"phone" | "whatsapp">("phone");
  const [userContact, setUserContact] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Функция для форматирования номера телефона
  const formatPhoneNumber = (value: string): string => {
    let cleaned = value.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('8')) cleaned = '+7' + cleaned.slice(1);
    if (cleaned.startsWith('7') && !cleaned.startsWith('+7')) cleaned = '+' + cleaned;
    if (!cleaned.startsWith('+7') && cleaned.length > 0) cleaned = '+7' + cleaned;
    cleaned = cleaned.replace(/^\+7\+7/, '+7');
    if (cleaned.startsWith('+7')) {
      const digits = cleaned.slice(2).replace(/\D/g, '');
      cleaned = '+7' + digits;
    }
    if (cleaned.length > 12) cleaned = cleaned.slice(0, 12);
    if (cleaned.length <= 2) return cleaned;
    const match = cleaned.match(/^\+7(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/);
    if (match) {
      let formatted = '+7';
      if (match[1]) formatted += ` (${match[1]}`;
      if (match[2]) formatted += `) ${match[2]}`;
      if (match[3]) formatted += `-${match[3]}`;
      if (match[4]) formatted += `-${match[4]}`;
      formatted = formatted.replace(/\(\s*$/, '').replace(/\)\s*$/, ')');
      return formatted;
    }
    return cleaned;
  };

  // Обработчик изменения телефона
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (input === '') {
      setUserContact('');
      return;
    }
    if (input.length < 2 && !input.startsWith('+')) {
      setUserContact('+7');
      return;
    }
    const formatted = formatPhoneNumber(input);
    setUserContact(formatted);
  };

  // Обработчик отправки формы
  const handleSubmit = async () => {
    if (!userContact || userContact.trim() === "" || userContact.length < 10) {
      toast.error("Пожалуйста, укажите корректный номер телефона");
      return;
    }

    setIsSubmitting(true);

    const leadData = {
      fromCity: "Не указан",
      toCity: "Не указан",
      phone: userContact,
      distance: 0,
      weight: 0,
      volume: 0,
      cost: 0,
      truckCapacity: "Индивидуальный расчет",
      contactMethod,
      additionalInfo: {
        source: "custom_route_request",
        requestType: "Индивидуальный маршрут",
        message: "Клиент не нашел нужный маршрут, запросил индивидуальный расчет"
      }
    };

    const loadingToastId = toast.loading(
      <div className="flex flex-col gap-2 py-2">
        <p className="text-lg font-semibold">Отправляем вашу заявку...</p>
        <p className="text-sm text-gray-600">Пожалуйста, подождите</p>
      </div>, 
      { duration: Infinity }
    );

    try {
      const result = await createBitrix24Lead(leadData);
      if (result.success) {
        toast.success(
          <div className="flex flex-col gap-2 py-2">
            <p className="text-lg font-semibold">✅ Заявка успешно отправлена!</p>
            <p className="text-sm">Заявка №{result.leadId}</p>
            <p className="text-sm text-gray-600">Логист свяжется с вами в течение 10 минут</p>
          </div>, 
          { id: loadingToastId, duration: 5000 }
        );
        setUserContact("");
      } else {
        toast.error(
          <div className="flex flex-col gap-2 py-2">
            <p className="text-lg font-semibold">❌ Ошибка при отправке</p>
            <p className="text-sm">{result.error}</p>
          </div>, 
          { id: loadingToastId, duration: 5000 }
        );
      }
    } catch (error) {
      toast.error("Произошла ошибка при отправке заявки", { id: loadingToastId });
      console.error("Ошибка:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="md:hidden w-full px-4 py-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50">
      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-primary/20">
        {/* Заголовок */}
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Не нашли нужного маршрута?
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Мы работаем по всей России. Позвоните нам и мы рассчитаем вам перевозку.
          </p>
        </div>

        {/* Кнопка звонка */}
        <a 
          href="tel:+74994440651"
          className="flex items-center justify-center gap-3 w-full py-4 rounded-xl text-white font-bold text-base shadow-lg hover:shadow-xl transition-all active:scale-95 mb-6"
          style={{
            background: 'linear-gradient(135deg, #083cb5 0%, #0a4dd6 100%)',
            boxShadow: '0 4px 16px rgba(8,60,181,0.3)'
          }}
        >
          <Phone className="w-5 h-5" />
          <span>Позвонить +7 (499) 444-06-51</span>
        </a>

        {/* Разделитель */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">или</span>
          </div>
        </div>

        {/* Форма обратной связи */}
        <div className="space-y-4">
          <p className="text-sm text-gray-600 text-center leading-relaxed">
            Заполните номер телефона и логист свяжется с вами в течение <span className="font-bold text-primary">10 минут</span>
          </p>

          {/* Способ связи */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={contactMethod === "phone" ? "default" : "outline"}
              className="h-11"
              onClick={() => setContactMethod("phone")}
              style={contactMethod === "phone" ? {backgroundColor: '#083cb5'} : {}}
            >
              <Phone className="w-4 h-4 mr-2" />
              Звонок
            </Button>
            <Button
              type="button"
              variant={contactMethod === "whatsapp" ? "default" : "outline"}
              className="h-11"
              onClick={() => setContactMethod("whatsapp")}
              style={contactMethod === "whatsapp" ? {backgroundColor: '#25D366'} : {}}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          </div>

          {/* Поле ввода телефона */}
          <Input
            type="tel"
            placeholder="+7 (999) 999-99-99"
            value={userContact}
            onChange={handlePhoneChange}
            onFocus={(e) => {
              if (!e.target.value) {
                setUserContact('+7 ');
              }
            }}
            className="h-12 text-base"
            autoComplete="tel"
          />

          {/* Кнопка отправки */}
          <Button
            type="button"
            className="w-full h-12 text-base font-semibold"
            style={{backgroundColor: '#083cb5'}}
            disabled={!userContact || userContact.length < 10 || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Отправка..." : "Получить расчет"}
          </Button>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800 text-center">
            ⚡ Быстрый расчет стоимости для любого маршрута по России
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomRouteRequest;

