// src/components/calculator/inputs/ContactMethodInput.tsx
// Переиспользуемый компонент для выбора способа связи (WhatsApp или Телефон)

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, MessageCircle } from "lucide-react";

interface ContactMethodInputProps {
  contactMethod: "phone" | "whatsapp" | "";
  userContact: string;
  onContactMethodChange: (method: "phone" | "whatsapp") => void;
  onUserContactChange: (contact: string) => void;
}

export function ContactMethodInput({
  contactMethod,
  userContact,
  onContactMethodChange,
  onUserContactChange,
}: ContactMethodInputProps) {
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Удаляем все символы кроме цифр и +
    value = value.replace(/[^\d+]/g, '');
    
    // Если пользователь удалил всё, возвращаем +7
    if (!value || value === '+') {
      value = '+7 ';
      onUserContactChange(value);
      return;
    }
    
    // Если начинается не с +7, добавляем
    if (!value.startsWith('+7')) {
      value = '+7 ' + value.replace(/^\+?7?/, '');
    }
    
    // Форматируем номер: +7 XXX XXX XX XX
    const digits = value.slice(2).replace(/\s/g, ''); // Убираем пробелы и берём только цифры после +7
    
    let formatted = '+7';
    if (digits.length > 0) {
      formatted += ' ' + digits.substring(0, 3); // Первые 3 цифры
    }
    if (digits.length > 3) {
      formatted += ' ' + digits.substring(3, 6); // Следующие 3 цифры
    }
    if (digits.length > 6) {
      formatted += ' ' + digits.substring(6, 8); // Следующие 2 цифры
    }
    if (digits.length > 8) {
      formatted += ' ' + digits.substring(8, 10); // Последние 2 цифры
    }
    
    // Ограничиваем длину (макс 10 цифр после +7)
    if (digits.length > 10) {
      formatted = formatted.slice(0, 16); // +7 XXX XXX XX XX = 16 символов
    }
    
    console.log('📱 [ContactMethodInput] Изменение номера:', formatted);
    onUserContactChange(formatted);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4">
        {/* Колонка для Звонка */}
        {contactMethod === "phone" ? (
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
            <Input
              type="tel"
              placeholder="Ваш телефон"
              value={userContact}
              onChange={handlePhoneChange}
              onFocus={(e) => {
                if (!e.target.value) {
                  onUserContactChange('+7 ');
                }
              }}
              className="h-10 pl-10 bg-white"
              autoComplete="tel"
            />
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full h-10 bg-[#d6e4f5] text-[#050b18] border-[#083cb5]/20 hover:bg-[#c8daf0]"
            onClick={() => {
              console.log('📞 [ContactMethodInput] Выбран способ связи: phone');
              onContactMethodChange("phone");
              onUserContactChange("+7 ");
            }}
          >
            <Phone className="w-4 h-4 mr-1" />
            Телефон
          </Button>
        )}

        {/* Колонка для WhatsApp */}
        {contactMethod === "whatsapp" ? (
          <div className="relative">
            <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
            <Input
              type="tel"
              placeholder="Ваш WhatsApp"
              value={userContact}
              onChange={handlePhoneChange}
              onFocus={(e) => {
                if (!e.target.value) {
                  onUserContactChange('+7 ');
                }
              }}
              className="h-10 pl-10"
              style={{backgroundColor: '#E7F8F0'}}
              autoComplete="tel"
            />
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full h-10 bg-[#d6e4f5] text-[#050b18] border-[#083cb5]/20 hover:bg-[#c8daf0]"
            onClick={() => {
              console.log('📞 [ContactMethodInput] Выбран способ связи: whatsapp');
              onContactMethodChange("whatsapp");
              onUserContactChange("+7 ");
            }}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            WhatsApp
          </Button>
        )}
      </div>
    </div>
  );
}

