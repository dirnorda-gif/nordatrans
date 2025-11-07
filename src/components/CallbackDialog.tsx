import { useState } from "react";
import { Phone, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createCallbackLead } from "@/utils/bitrix24";
import { useYandexMetrika } from "@/hooks/useYandexMetrika";

interface CallbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CallbackDialog = ({ open, onOpenChange }: CallbackDialogProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const { reachGoal } = useYandexMetrika(57594511);

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
      setPhone('');
      return;
    }
    if (input.length < 2 && !input.startsWith('+')) {
      setPhone('+7');
      return;
    }
    const formatted = formatPhoneNumber(input);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Валидация телефона - должен быть полный номер +7 (XXX) XXX-XX-XX
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 11) {
      setError("Пожалуйста, введите полный номер телефона");
      setIsSubmitting(false);
      return;
    }

    try {
      // Отправляем лид в Bitrix24
      const result = await createCallbackLead(phone, name);

      if (result.success) {
        setIsSuccess(true);
        
        // Отправляем цель в Яндекс Метрику
        reachGoal("callback_10percent");
        
        // Закрываем диалог через 3 секунды
        setTimeout(() => {
          onOpenChange(false);
          // Сбрасываем форму
          setTimeout(() => {
            setName("");
            setPhone("");
            setIsSuccess(false);
          }, 300);
        }, 3000);
      } else {
        setError(result.error || "Произошла ошибка при отправке заявки");
      }
    } catch (err) {
      setError("Произошла ошибка. Попробуйте позвонить нам напрямую");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      // Сбрасываем состояние при закрытии
      setTimeout(() => {
        setName("");
        setPhone("");
        setError("");
        setIsSuccess(false);
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <div className="rounded-full p-2" style={{ backgroundColor: '#083cb5' }}>
              <Phone className="h-5 w-5 text-white" />
            </div>
            Заказать обратный звонок
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Оставьте свой номер телефона, и мы перезвоним вам в течение 5 минут. 
            <span className="font-semibold text-foreground"> Скидка 10% гарантирована!</span>
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-solution/10">
              <svg
                className="h-8 w-8 text-solution"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-foreground">Заявка принята!</h3>
            <p className="text-muted-foreground">
              Мы свяжемся с вами в течение 5 минут
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Ваше имя (необязательно)
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Иван"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                Номер телефона <span className="text-destructive">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={handlePhoneChange}
                required
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="rounded-lg p-4 text-center" style={{ 
              background: 'linear-gradient(135deg, rgba(8, 60, 181, 0.1) 0%, rgba(64, 91, 154, 0.1) 100%)',
              border: '2px solid #083cb5'
            }}>
              <p className="text-sm font-semibold" style={{ color: '#083cb5' }}>
                🎁 Скидка 10% на первую перевозку
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: 'linear-gradient(135deg, #083cb5 0%, #405b9a 100%)' }}
            >
              {isSubmitting ? "Отправка..." : "Заказать звонок"}
            </button>

            <p className="text-xs text-center text-muted-foreground">
              Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

