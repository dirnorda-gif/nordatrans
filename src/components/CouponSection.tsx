import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

// Функция для форматирования номера телефона
const formatPhoneNumber = (value: string): string => {
  let cleaned = value.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('8')) cleaned = '+7' + cleaned.slice(1);
  if (!cleaned.startsWith('+7')) cleaned = '+7' + cleaned;
  
  const match = cleaned.match(/^(\+7)(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/);
  if (match) {
    let formatted = match[1];
    if (match[2]) formatted += ' (' + match[2];
    if (match[3]) formatted += ') ' + match[3];
    if (match[4]) formatted += ' ' + match[4];
    if (match[5]) formatted += ' ' + match[5];
    return formatted;
  }
  return cleaned;
};

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  couponAmount: number;
  minOrderAmount: number;
}

function CouponModal({ isOpen, onClose, couponAmount, minOrderAmount }: CouponModalProps) {
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!phone || phone.trim() === "" || phone.trim() === "+7") {
      toast.error("Введите номер телефона");
      return;
    }

    setIsSubmitting(true);

    try {
      // Отправляем заявку напрямую в Bitrix24
      const webhookUrl = 'https://nordatrans.bitrix24.ru/rest/1/la8f9cfu3icpekuz/';
      const comment = `
===========================================
ЗАЯВКА НА КУПОН
===========================================

КУПОН: ${couponAmount}₽
УСЛОВИЕ: При заказе от ${minOrderAmount.toLocaleString()}₽

КОНТАКТ КЛИЕНТА:
Телефон: ${phone}

===========================================
Заявка создана через форму купонов
Дата и время: ${new Date().toLocaleString('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
})}
===========================================
      `.trim();

      const response = await fetch(`${webhookUrl}crm.lead.add.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            TITLE: `Заявка на купон ${couponAmount}₽`,
            NAME: "Клиент",
            PHONE: [{ VALUE: phone, VALUE_TYPE: "WORK" }],
            COMMENTS: comment,
            SOURCE_ID: "WEB",
            STATUS_ID: "NEW"
          }
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка отправки в Bitrix24');
      }

      toast.success("Заявка отправлена! Мы свяжемся с вами в ближайшее время.");
      setPhone("");
      onClose();
    } catch (error) {
      console.error("Ошибка отправки заявки:", error);
      toast.error("Ошибка отправки заявки. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full border-2 border-gray-200 hover:border-gray-300 transition-colors"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-6 pr-12" style={{ color: '#050b18' }}>
          Ваша скидка {couponAmount} рублей при заказе от {minOrderAmount.toLocaleString()} рублей
        </h2>

        {/* Phone Input */}
        <div className="mb-6">
          <input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="Номер телефона *"
            className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:border-[#083cb5] transition-colors"
            disabled={isSubmitting}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 rounded-full text-white font-bold text-lg transition-all disabled:opacity-50"
          style={{ backgroundColor: '#083cb5' }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.backgroundColor = '#405b9a';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.backgroundColor = '#083cb5';
            }
          }}
        >
          {isSubmitting ? "Отправка..." : "Отправить"}
        </button>

        {/* Agreement Text */}
        <p className="mt-4 text-sm text-gray-600 text-center">
          Настоящим в целях подачи заявки на консультацию даю{" "}
          <span className="text-green-600 font-medium">согласие</span> на обработку своих персональных данных
        </p>
      </div>
    </div>
  );
}

export function CouponSection() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    couponAmount: number;
    minOrderAmount: number;
  }>({
    isOpen: false,
    couponAmount: 0,
    minOrderAmount: 0,
  });

  const openModal = (couponAmount: number, minOrderAmount: number) => {
    setModalState({ isOpen: true, couponAmount, minOrderAmount });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, couponAmount: 0, minOrderAmount: 0 });
  };

  return (
    <>
      <div className="relative min-h-[608px] lg:col-span-1 rounded-2xl overflow-hidden p-6">
        {/* Gradient Background Layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#f0f3f5] to-[#e8edf2]"></div>

        {/* Background Truck Image */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[350px] bg-no-repeat bg-contain bg-bottom opacity-65 pointer-events-none z-[1]"
          style={{
            backgroundImage: 'url(/moving-discount-clipart.webp)',
          }}
        ></div>

        {/* Decorative Background Elements */}
        <div className="absolute top-1/2 right-10 w-40 h-40 bg-[#083cb5] opacity-5 rounded-full blur-3xl z-[1]"></div>
        <div className="absolute bottom-10 right-20 w-32 h-32 bg-[#405b9a] opacity-5 rounded-full blur-2xl z-[1]"></div>

        {/* Title */}
        <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-center relative z-10" style={{ color: '#083cb5' }}>
          Купоны на скидку
        </h2>

        {/* Mobile: Vertical Stack */}
        <div className="lg:hidden relative z-10 flex flex-col gap-4">
          {/* Купон 3000₽ */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden flex h-32">
            <div className="w-16 bg-gradient-to-b from-[#5cb85c] to-[#4cae4c] flex items-center justify-center relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#f0f3f5] rounded-full -mt-2"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#f0f3f5] rounded-full -mb-2"></div>
              <div className="-rotate-90 whitespace-nowrap">
                <span className="text-white font-bold text-lg">3000 P</span>
              </div>
            </div>
            <div className="flex-1 p-4 flex flex-col justify-between relative">
              <div className="absolute top-2 right-2">
                <div className="w-10 h-10 border-2 border-[#f0f3f5] rounded-full flex items-center justify-center">
                  <span className="text-xl text-[#083cb5]">%</span>
                </div>
              </div>
              <div className="text-center mt-4">
                <p className="text-sm font-semibold" style={{ color: '#050b18' }}>при заказе</p>
                <p className="text-xl font-bold" style={{ color: '#050b18' }}>от 22 000 р.</p>
              </div>
              <button
                onClick={() => openModal(3000, 22000)}
                className="w-full py-2 rounded-full font-bold text-sm transition-all"
                style={{ backgroundColor: '#f9d71c', color: '#050b18' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9e858';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9d71c';
                }}
              >
                Получить купон
              </button>
            </div>
          </div>

          {/* Купон 4000₽ */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden flex h-32">
            <div className="w-16 bg-gradient-to-b from-[#5cb85c] to-[#4cae4c] flex items-center justify-center relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#f0f3f5] rounded-full -mt-2"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#f0f3f5] rounded-full -mb-2"></div>
              <div className="-rotate-90 whitespace-nowrap">
                <span className="text-white font-bold text-lg">4000 P</span>
              </div>
            </div>
            <div className="flex-1 p-4 flex flex-col justify-between relative">
              <div className="absolute top-2 right-2">
                <div className="w-10 h-10 border-2 border-[#f0f3f5] rounded-full flex items-center justify-center">
                  <span className="text-xl text-[#405b9a]">%</span>
                </div>
              </div>
              <div className="text-center mt-4">
                <p className="text-sm font-semibold" style={{ color: '#050b18' }}>при заказе</p>
                <p className="text-xl font-bold" style={{ color: '#050b18' }}>от 27 000 р.</p>
              </div>
              <button
                onClick={() => openModal(4000, 27000)}
                className="w-full py-2 rounded-full font-bold text-sm transition-all"
                style={{ backgroundColor: '#f9d71c', color: '#050b18' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9e858';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9d71c';
                }}
              >
                Получить купон
              </button>
            </div>
          </div>

          {/* Купон 2000₽ */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden flex h-32">
            <div className="w-16 bg-gradient-to-b from-[#5cb85c] to-[#4cae4c] flex items-center justify-center relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#f0f3f5] rounded-full -mt-2"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#f0f3f5] rounded-full -mb-2"></div>
              <div className="-rotate-90 whitespace-nowrap">
                <span className="text-white font-bold text-lg">2000 P</span>
              </div>
            </div>
            <div className="flex-1 p-4 flex flex-col justify-between relative">
              <div className="absolute top-2 right-2">
                <div className="w-10 h-10 border-2 border-[#f0f3f5] rounded-full flex items-center justify-center">
                  <span className="text-xl text-[#083cb5]">%</span>
                </div>
              </div>
              <div className="text-center mt-4">
                <p className="text-sm font-semibold" style={{ color: '#050b18' }}>при заказе</p>
                <p className="text-xl font-bold" style={{ color: '#050b18' }}>от 15 000 р.</p>
              </div>
              <button
                onClick={() => openModal(2000, 15000)}
                className="w-full py-2 rounded-full font-bold text-sm transition-all"
                style={{ backgroundColor: '#f9d71c', color: '#050b18' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9e858';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9d71c';
                }}
              >
                Получить купон
              </button>
            </div>
          </div>
        </div>

        {/* Desktop: Original Grid */}
        <div className="hidden lg:grid relative z-10 grid-cols-2 gap-4 h-full">
          {/* Left Column - Two Cards */}
          <div className="flex flex-col gap-4">
            {/* First Coupon - 3000₽ */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden flex h-32">
              {/* Left Part - Vertical Text with Green Background */}
              <div className="w-16 bg-gradient-to-b from-[#5cb85c] to-[#4cae4c] flex items-center justify-center relative">
                {/* Notches */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#f0f3f5] rounded-full -mt-2"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#f0f3f5] rounded-full -mb-2"></div>
                {/* Vertical Text */}
                <div className="-rotate-90 whitespace-nowrap">
                  <span className="text-white font-bold text-lg">3000 P</span>
                </div>
              </div>
              
              {/* Right Part - Content */}
              <div className="flex-1 p-4 flex flex-col justify-between relative">
                {/* Percent Icon */}
                <div className="absolute top-2 right-2">
                  <div className="w-10 h-10 border-2 border-[#f0f3f5] rounded-full flex items-center justify-center">
                    <span className="text-xl text-[#083cb5]">%</span>
                  </div>
                </div>
                
                {/* Condition */}
                <div className="text-center mt-4">
                  <p className="text-sm font-semibold" style={{ color: '#050b18' }}>
                    при заказе
                  </p>
                  <p className="text-xl font-bold" style={{ color: '#050b18' }}>
                    от 22 000 р.
                  </p>
                </div>
                
                {/* Button */}
                <button
                  onClick={() => openModal(3000, 22000)}
                  className="w-full py-2 rounded-full font-bold text-sm transition-all"
                  style={{ backgroundColor: '#f9d71c', color: '#050b18' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9e858';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9d71c';
                  }}
                >
                  Получить купон
                </button>
              </div>
            </div>

            {/* Second Coupon - 4000₽ */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden flex h-32">
              {/* Left Part - Vertical Text with Green Background */}
              <div className="w-16 bg-gradient-to-b from-[#5cb85c] to-[#4cae4c] flex items-center justify-center relative">
                {/* Notches */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#f0f3f5] rounded-full -mt-2"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#f0f3f5] rounded-full -mb-2"></div>
                {/* Vertical Text */}
                <div className="-rotate-90 whitespace-nowrap">
                  <span className="text-white font-bold text-lg">4000 P</span>
                </div>
              </div>
              
              {/* Right Part - Content */}
              <div className="flex-1 p-4 flex flex-col justify-between relative">
                {/* Percent Icon */}
                <div className="absolute top-2 right-2">
                  <div className="w-10 h-10 border-2 border-[#f0f3f5] rounded-full flex items-center justify-center">
                    <span className="text-xl text-[#405b9a]">%</span>
                  </div>
                </div>
                
                {/* Condition */}
                <div className="text-center mt-4">
                  <p className="text-sm font-semibold" style={{ color: '#050b18' }}>
                    при заказе
                  </p>
                  <p className="text-xl font-bold" style={{ color: '#050b18' }}>
                    от 27 000 р.
                  </p>
                </div>
                
                {/* Button */}
                <button
                  onClick={() => openModal(4000, 27000)}
                  className="w-full py-2 rounded-full font-bold text-sm transition-all"
                  style={{ backgroundColor: '#f9d71c', color: '#050b18' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9e858';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9d71c';
                  }}
                >
                  Получить купон
                </button>
              </div>
            </div>
          </div>

          {/* Right Column Top - Third Card - 2000₽ */}
          <div className="flex flex-col">
            <div className="bg-white rounded-xl shadow-md overflow-hidden flex h-32">
              {/* Left Part - Vertical Text with Green Background */}
              <div className="w-16 bg-gradient-to-b from-[#5cb85c] to-[#4cae4c] flex items-center justify-center relative">
                {/* Notches */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#f0f3f5] rounded-full -mt-2"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#f0f3f5] rounded-full -mb-2"></div>
                {/* Vertical Text */}
                <div className="-rotate-90 whitespace-nowrap">
                  <span className="text-white font-bold text-lg">2000 P</span>
                </div>
              </div>
              
              {/* Right Part - Content */}
              <div className="flex-1 p-4 flex flex-col justify-between relative">
                {/* Percent Icon */}
                <div className="absolute top-2 right-2">
                  <div className="w-10 h-10 border-2 border-[#f0f3f5] rounded-full flex items-center justify-center">
                    <span className="text-xl text-[#083cb5]">%</span>
                  </div>
                </div>
                
                {/* Condition */}
                <div className="text-center mt-4">
                  <p className="text-sm font-semibold" style={{ color: '#050b18' }}>
                    при заказе
                  </p>
                  <p className="text-xl font-bold" style={{ color: '#050b18' }}>
                    от 15 000 р.
                  </p>
                </div>
                
                {/* Button */}
                <button
                  onClick={() => openModal(2000, 15000)}
                  className="w-full py-2 rounded-full font-bold text-sm transition-all"
                  style={{ backgroundColor: '#f9d71c', color: '#050b18' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9e858';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9d71c';
                  }}
                >
                  Получить купон
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <CouponModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        couponAmount={modalState.couponAmount}
        minOrderAmount={modalState.minOrderAmount}
      />
    </>
  );
}

