// src/components/calculator/inputs/CityInput.tsx
// Компонент ввода города с подсказками Яндекс.Карт

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MapPin, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { fetchSuggestions, type Suggestion } from "@/utils/calculator/yandexMaps";

console.log('📦 [CityInput] Компонент загружен');

interface CityInputProps {
  value: string;
  onChange: (city: string, coordinates?: [number, number]) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  label?: string;
}

export function CityInput({
  value,
  onChange,
  placeholder = "Введите город",
  error = false,
  disabled = false,
  label,
}: CityInputProps) {
  console.log('🏙️ [CityInput] Рендер компонента:', { value, placeholder, error, disabled });

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | undefined>();
  const [suggestionsPosition, setSuggestionsPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isReadOnly, setIsReadOnly] = useState(true); // Трюк для отключения автозаполнения

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Убираем readonly после монтирования (трюк против автозаполнения)
  useEffect(() => {
    console.log('🔒 [CityInput] Отключение readonly через 100ms');
    const timer = setTimeout(() => {
      setIsReadOnly(false);
      console.log('🔓 [CityInput] Readonly отключен');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Функция обновления позиции подсказок
  const updateSuggestionsPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      console.log('📍 [CityInput] Обновление позиции подсказок:', {
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
        scrollY: window.scrollY,
        scrollX: window.scrollX,
      });
      setSuggestionsPosition({
        top: rect.bottom + 4, // +4px отступ, БЕЗ scrollY (используем fixed positioning)
        left: rect.left,
        width: rect.width,
      });
    }
  };

  // Обработка изменения значения с debounce
  const handleInputChange = (newValue: string) => {
    console.log('✏️ [CityInput] Изменение значения:', newValue);
    
    onChange(newValue, undefined);
    setSelectedCoordinates(undefined);

    // Обновляем позицию подсказок
    updateSuggestionsPosition();

    // Debounce для запроса подсказок
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      console.log('⏰ [CityInput] Debounce истёк, запрос подсказок');
      updateSuggestionsPosition(); // Обновляем позицию перед показом
      fetchSuggestions(newValue, setSuggestions, setShowSuggestions, setIsLoading);
    }, 300);
  };

  // Выбор города из подсказок
  const handleSelectSuggestion = (suggestion: Suggestion) => {
    console.log('✅ [CityInput] Выбран город из подсказок:', suggestion);
    
    onChange(suggestion.value, suggestion.coordinates);
    setSelectedCoordinates(suggestion.coordinates);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Очистка поля
  const handleClear = () => {
    console.log('🗑️ [CityInput] Очистка поля');
    
    onChange("", undefined);
    setSelectedCoordinates(undefined);
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Обработка фокуса (показываем подсказки, если есть текст но нет координат)
  const handleFocus = () => {
    console.log('🔍 [CityInput] Фокус на поле');
    
    // Обновляем позицию подсказок
    updateSuggestionsPosition();
    
    if (value && !selectedCoordinates) {
      console.log('⏳ [CityInput] Есть текст без координат, запрос подсказок');
      fetchSuggestions(value, setSuggestions, setShowSuggestions, setIsLoading);
    }
  };

  // Закрытие подсказок при клике вне компонента и обновление позиции при скролле
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        console.log('👆 [CityInput] Клик вне компонента, закрытие подсказок');
        setShowSuggestions(false);
      }
    };

    const handleScroll = () => {
      if (showSuggestions) {
        console.log('📜 [CityInput] Скролл страницы, обновление позиции подсказок');
        updateSuggestionsPosition();
      }
    };

    const handleResize = () => {
      if (showSuggestions) {
        console.log('📐 [CityInput] Изменение размера окна, обновление позиции подсказок');
        updateSuggestionsPosition();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [showSuggestions]);

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-white">
          {label}
        </label>
      )}
      
      <div className="relative">
        {/* Иконка MapPin слева */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <MapPin className="h-5 w-5" />
        </div>

        {/* Поле ввода */}
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={(e) => {
            // Убираем readonly при фокусе (на случай если браузер всё равно показал автозаполнение)
            if (isReadOnly) {
              console.log('🔓 [CityInput] Убираем readonly при фокусе');
              setIsReadOnly(false);
            }
            handleFocus();
          }}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={isReadOnly}
          autoComplete="chrome-off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-form-type="other"
          data-lpignore="true"
          role="presentation"
          aria-autocomplete="none"
          name={`city-${Date.now()}`}
          className={`pl-10 pr-10 ${
            error ? "border-red-500 focus-visible:ring-red-500" : ""
          }`}
        />

        {/* Кнопка очистки или спиннер загрузки */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          ) : value ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>

      </div>

      {/* Список подсказок через портал */}
      {showSuggestions && suggestions.length > 0 && createPortal(
        <div
          ref={suggestionsRef}
          className="fixed bg-white border border-gray-300 rounded-lg shadow-2xl max-h-60 overflow-y-auto"
          style={{
            top: `${suggestionsPosition.top}px`,
            left: `${suggestionsPosition.left}px`,
            width: `${suggestionsPosition.width}px`,
            zIndex: 9999,
          }}
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                console.log('🖱️ [CityInput] Клик по подсказке:', suggestion.value);
                handleSelectSuggestion(suggestion);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-900">
                  {suggestion.displayName}
                </span>
              </div>
            </button>
          ))}
        </div>,
        document.body
      )}

      {/* Сообщение "Ничего не найдено" через портал */}
      {showSuggestions && !isLoading && suggestions.length === 0 && value.length >= 2 && createPortal(
        <div
          ref={suggestionsRef}
          className="fixed bg-white border border-gray-300 rounded-lg shadow-2xl px-4 py-3"
          style={{
            top: `${suggestionsPosition.top}px`,
            left: `${suggestionsPosition.left}px`,
            width: `${suggestionsPosition.width}px`,
            zIndex: 9999,
          }}
        >
          <p className="text-sm text-gray-500">Ничего не найдено</p>
        </div>,
        document.body
      )}
    </div>
  );
}

console.log('✅ [CityInput] Компонент экспортирован');

