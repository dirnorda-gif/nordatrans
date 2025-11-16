# 📦 Модульный калькулятор перевозок

## 🎯 Описание

Новый модульный калькулятор перевозок (`NewShippingCalculatorForm`) - это переработанная версия существующего калькулятора, разбитая на независимые, переиспользуемые компоненты.

**Статус:** 🧪 В разработке (экспериментальная версия)

**Тестовая страница:** `/test`

---

## 📁 Структура проекта

```
src/
├── components/
│   ├── NewShippingCalculatorForm.tsx    # Главный компонент
│   └── calculator/
│       ├── inputs/                       # Компоненты ввода
│       │   ├── CityInput.tsx            # Поле города с Яндекс.Картами
│       │   ├── VolumeSlider.tsx         # Слайдер объёма
│       │   └── WeightSlider.tsx         # Слайдер веса
│       ├── selectors/                    # Компоненты выбора
│       │   ├── TransportTypeSelector.tsx # Выбор типа перевозки
│       │   ├── PackagingSelector.tsx     # Выбор упаковки
│       │   └── TruckTypeSelector.tsx     # Выбор типа машины
│       ├── progress/                     # Прогресс-бар
│       │   └── ProgressBar.tsx
│       └── display/                      # Компоненты отображения
│           ├── ParametersSidebar.tsx     # Боковая панель параметров
│           └── PriceDisplay.tsx          # Отображение стоимости
├── utils/
│   └── calculator/
│       ├── constants.ts                  # Константы (API ключи, шаги, типы)
│       ├── yandexMaps.ts                 # Работа с Яндекс.Картами
│       ├── calculatorHelpers.ts          # Вспомогательные функции
│       └── validation.ts                 # Валидация полей
└── pages/
    └── Test.tsx                          # Тестовая страница
```

---

## 🔧 Компоненты

### 1. **CityInput** - Поле ввода города

**Путь:** `src/components/calculator/inputs/CityInput.tsx`

**Функционал:**
- Автодополнение через Яндекс.Карты Geocoder API
- Debounce для оптимизации запросов (300ms)
- Иконка MapPin, кнопка очистки (X), спиннер загрузки
- Отключение автозаполнения браузера
- Обработка кликов вне списка подсказок
- Фильтрация только городов России

**Props:**
```typescript
interface CityInputProps {
  value: string;
  onChange: (city: string, coordinates?: [number, number]) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  label?: string;
}
```

**Пример использования:**
```tsx
<CityInput
  value={fromCity}
  onChange={(city, coords) => {
    setFromCity(city);
    setFromCoordinates(coords);
  }}
  placeholder="Город отправления"
  label="Откуда"
  error={errors.fromCity}
/>
```

**Логирование:**
- `🏙️ [CityInput] Рендер компонента`
- `✏️ [CityInput] Изменение значения`
- `⏰ [CityInput] Debounce истёк, запрос подсказок`
- `✅ [CityInput] Выбран город из подсказок`
- `🗑️ [CityInput] Очистка поля`

---

### 2. **VolumeSlider** - Слайдер объёма

**Путь:** `src/components/calculator/inputs/VolumeSlider.tsx`

**Функционал:**
- Слайдер с динамическими шагами
- Отображение текущего значения в м³
- Опциональное отображение рекомендуемого грузовика
- Подсказка о диапазоне значений

**Props:**
```typescript
interface VolumeSliderProps {
  value: number;              // индекс в массиве steps
  onChange: (index: number) => void;
  steps: number[];            // массив значений объёма
  disabled?: boolean;
  label?: string;
  showTruckInfo?: boolean;
  truckName?: string;
}
```

**Логирование:**
- `📊 [VolumeSlider] Рендер`
- `🔄 [VolumeSlider] Изменение значения`

---

### 3. **WeightSlider** - Слайдер веса

**Путь:** `src/components/calculator/inputs/WeightSlider.tsx`

**Функционал:**
- Слайдер с динамическими шагами
- Автоматическое форматирование (кг/тонны)
- Индикатор автоматического расчёта
- Блокировка при автоматическом режиме (для домашнего переезда)

**Props:**
```typescript
interface WeightSliderProps {
  value: number;
  onChange: (index: number) => void;
  steps: number[];
  disabled?: boolean;
  label?: string;
  autoCalculated?: boolean;   // флаг автоматического расчёта
}
```

**Логирование:**
- `⚖️ [WeightSlider] Рендер`
- `🔄 [WeightSlider] Изменение значения`

---

### 4. **TransportTypeSelector** - Выбор типа перевозки

**Путь:** `src/components/calculator/selectors/TransportTypeSelector.tsx`

**Функционал:**
- 4 типа перевозок: Домашний переезд, Промышленные товары, Продукты питания, Другое
- Визуальная индикация выбранного типа
- Адаптивная сетка (1 колонка на мобильных, 2 на десктопе)

**Props:**
```typescript
interface TransportTypeSelectorProps {
  value: string;
  onChange: (type: string) => void;
  error?: boolean;
}
```

**Логирование:**
- `🚚 [TransportTypeSelector] Рендер`
- `✅ [TransportTypeSelector] Выбран тип`

---

### 5. **ProgressBar** - Прогресс-бар

**Путь:** `src/components/calculator/progress/ProgressBar.tsx`

**Функционал:**
- Визуализация текущего шага
- 3 состояния: завершён (✅), текущий (🔵), ожидает (⚪)
- Линии между шагами с анимацией

**Props:**
```typescript
interface ProgressBarProps {
  steps: Step[];
  currentStep: number;
}

interface Step {
  id: number;
  title: string;
  description?: string;
}
```

**Логирование:**
- `📊 [ProgressBar] Рендер`
- `Шаг N: ✅ Завершён / 🔵 Текущий / ⚪ Ожидает`

---

### 6. **ParametersSidebar** - Боковая панель параметров

**Путь:** `src/components/calculator/display/ParametersSidebar.tsx`

**Функционал:**
- Отображение введённых данных
- Секции: Маршрут, Тип перевозки, Параметры груза, Рекомендуемый транспорт
- Предварительная стоимость (если рассчитана)

**Props:**
```typescript
interface ParametersSidebarProps {
  fromCity?: string;
  toCity?: string;
  distance?: number;
  duration?: number;
  transportType?: string;
  volume?: number;
  weight?: number;
  truckName?: string;
  estimatedCost?: number;
  additionalInfo?: Record<string, any>;
}
```

**Логирование:**
- `📋 [ParametersSidebar] Рендер`
- `ℹ️ [ParametersSidebar] Нет данных для отображения`

---

### 7. **PriceDisplay** - Отображение стоимости

**Путь:** `src/components/calculator/display/PriceDisplay.tsx`

**Функционал:**
- Крупное отображение итоговой стоимости
- Детали расчёта (транспорт, расстояние, стоимость за км)
- Уведомление о времени обратной связи (10 минут)
- Кнопка отправки заявки

**Props:**
```typescript
interface PriceDisplayProps {
  cost: number;
  truckCapacity?: string;
  distance?: number;
  costPerKm?: number;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  contactMethod?: "phone" | "whatsapp";
}
```

**Логирование:**
- `💰 [PriceDisplay] Рендер`

---

## 🛠️ Утилиты

### 1. **constants.ts** - Константы

**Содержит:**
- `YANDEX_API_KEY` - API ключ Яндекс.Карт
- `REFRIGERATOR_COEFFICIENT` - коэффициент для рефрижератора
- `TRANSPORT_TYPES` - типы перевозок
- `VOLUME_STEPS_PRIVATE` - шаги объёма для частных лиц (0-82 м³)
- `VOLUME_STEPS_COMMERCIAL` - шаги объёма для коммерческих грузов
- `WEIGHT_STEPS_PRIVATE` - шаги веса для частных лиц
- `WEIGHT_STEPS_COMMERCIAL` - шаги веса для коммерческих грузов
- `PACKAGING_OPTIONS` - опции упаковки
- `TRUCK_TYPES_FOOD` - типы машин для продуктов питания
- `TEMPERATURE_MODES` - температурные режимы
- `TRUCK_INFO` - информация о грузовиках

---

### 2. **yandexMaps.ts** - Работа с Яндекс.Картами

**Функции:**
- `fetchSuggestions()` - получение подсказок городов
- `calculateRoute()` - расчёт маршрута между двумя точками
- `loadYandexMapsScript()` - загрузка скрипта Яндекс.Карт

**Логирование:**
- `🔍 [fetchSuggestions] Запрос подсказок`
- `🌐 [fetchSuggestions] URL запроса`
- `📥 [fetchSuggestions] Получен ответ от API`
- `📍 [fetchSuggestions] Количество найденных объектов`
- `✅ [fetchSuggestions] Отфильтровано подсказок`
- `🗺️ [calculateRoute] Расчёт маршрута`
- `📊 [calculateRoute] Результаты`

---

### 3. **calculatorHelpers.ts** - Вспомогательные функции

**Функции:**
- `getTruckInfoByVolume(volume)` - подбор грузовика по объёму
- `findClosestVolumeIndex(target, steps)` - поиск ближайшего индекса
- `formatVolume(volume)` - форматирование объёма
- `formatWeight(weight)` - форматирование веса
- `normalizeCityName(city)` - нормализация названия города

**Логирование:**
- `🚚 [getTruckInfoByVolume] Подбор грузовика`
- `🔍 [findClosestVolumeIndex] Поиск ближайшего индекса`
- `🏙️ [normalizeCityName] Нормализация города`

---

### 4. **validation.ts** - Валидация

**Функции:**
- `validateRouteFields()` - валидация маршрута
- `validateTransportType()` - валидация типа перевозки
- `validateMovingParams()` - валидация параметров домашнего переезда
- `validateCargoParams()` - валидация параметров промышленных товаров
- `validateFoodParams()` - валидация параметров продуктов питания
- `validateOtherParams()` - валидация параметров "Другое"
- `validateContact()` - валидация контактных данных

**Логирование:**
- `🔍 [validateXXX] Валидация`
- `❌ [validateXXX] Валидация не пройдена`
- `✅ [validateXXX] Валидация пройдена`

---

## 🚀 Использование

### Базовый пример

```tsx
import { NewShippingCalculatorForm } from "@/components/NewShippingCalculatorForm";

function MyPage() {
  return (
    <div>
      <NewShippingCalculatorForm />
    </div>
  );
}
```

### Тестовая страница

Новый калькулятор доступен на странице `/test`:

```
http://localhost:5173/test
```

---

## 📊 Логирование

Все компоненты и утилиты содержат детальное логирование для отладки:

### Уровни логирования:
- `📦` - Загрузка модуля/компонента
- `🎨` - Рендер компонента
- `✅` - Успешная операция
- `❌` - Ошибка
- `⚠️` - Предупреждение
- `ℹ️` - Информация
- `🔍` - Поиск/валидация
- `⏳` - Загрузка/ожидание
- `🔄` - Изменение значения
- `➡️` - Переход вперёд
- `⬅️` - Переход назад
- `📤` - Отправка данных
- `💰` - Расчёт стоимости

### Примеры логов:

```
📦 [CityInput] Компонент загружен
🏙️ [CityInput] Рендер компонента: {value: "Москва", placeholder: "Город отправления", error: false}
✏️ [CityInput] Изменение значения: Санкт
⏰ [CityInput] Debounce истёк, запрос подсказок
🔍 [fetchSuggestions] Запрос подсказок для: Санкт
📥 [fetchSuggestions] Получен ответ от API
📍 [fetchSuggestions] Количество найденных объектов: 10
✅ [fetchSuggestions] Отфильтровано подсказок: 8
✅ [CityInput] Выбран город из подсказок: {value: "Санкт-Петербург", coordinates: [59.9343, 30.3351]}
```

---

## 🎯 Текущий функционал (MVP)

### ✅ Реализовано:
1. **Шаг 1: Маршрут и тип перевозки**
   - Поля "Откуда" и "Куда" с автодополнением Яндекс.Карт
   - Расчёт маршрута (расстояние и время)
   - Выбор типа перевозки (4 варианта)

2. **Шаг 2: Параметры груза**
   - Слайдер объёма (динамические шаги)
   - Слайдер веса (динамические шаги)
   - Автоматический расчёт веса для домашнего переезда
   - Отображение рекомендуемого грузовика

3. **Шаг 3: Итоговая стоимость**
   - Расчёт стоимости через `calculateShippingCost`
   - Отображение деталей (транспорт, расстояние, стоимость за км)
   - Кнопка отправки заявки (мок)

4. **Общее:**
   - Прогресс-бар с 3 шагами
   - Боковая панель с параметрами
   - Валидация всех полей
   - Адаптивный дизайн

### 🚧 В разработке:
1. Детальные формы параметров для каждого типа перевозки:
   - `MovingParamsForm` - домашний переезд (чекбоксы, конструктор)
   - `CargoParamsForm` - промышленные товары (упаковка, палеты)
   - `FoodParamsForm` - продукты питания (тип машины, температура)
   - `OtherParamsForm` - другое

2. Интеграция с Bitrix24 (отправка заявки)

3. Интеграция конструктора домашнего переезда

4. Форма контактных данных (телефон/WhatsApp)

5. Хуки для переиспользования логики:
   - `useCityAutocomplete` - логика автодополнения
   - `useCalculatorState` - управление состоянием калькулятора
   - `useRouteCalculation` - расчёт маршрута

---

## 🔄 Отличия от старого калькулятора

| Аспект | Старый калькулятор | Новый модульный калькулятор |
|--------|-------------------|----------------------------|
| **Размер файла** | ~2843 строки | ~400 строк (главный компонент) |
| **Структура** | Монолитный компонент | Модульная архитектура |
| **Переиспользование** | Невозможно | Все компоненты независимы |
| **Тестирование** | Сложно | Каждый модуль тестируется отдельно |
| **Поддержка** | Сложная навигация | Чёткая структура папок |
| **Логирование** | Минимальное | Детальное на каждом этапе |
| **Расширение** | Требует изменения всего файла | Добавление новых модулей |

---

## 📝 TODO

- [ ] Создать формы параметров для каждого типа перевозки
- [ ] Интегрировать конструктор домашнего переезда
- [ ] Добавить форму контактных данных
- [ ] Интегрировать Bitrix24 для отправки заявок
- [ ] Создать хуки для переиспользования логики
- [ ] Добавить unit-тесты для всех модулей
- [ ] Провести A/B тестирование со старым калькулятором
- [ ] Оптимизировать производительность (React.memo, useMemo)
- [ ] Добавить анимации переходов между шагами
- [ ] Создать мобильную версию прогресс-бара

---

## 🐛 Известные проблемы

Нет критических проблем. Калькулятор находится в стадии разработки.

---

## 📞 Контакты

При возникновении вопросов или предложений по улучшению модульного калькулятора, обращайтесь к разработчику проекта.

---

**Версия:** 1.0.0-beta  
**Дата создания:** 16 ноября 2025  
**Последнее обновление:** 16 ноября 2025

