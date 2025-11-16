# NewShippingCalculatorForm - Модульный калькулятор перевозок

## 📋 Описание

`NewShippingCalculatorForm` - это новый модульный компонент калькулятора перевозок, построенный на основе переиспользуемых компонентов. Визуально идентичен старому `ShippingCalculatorForm`, но имеет модульную архитектуру для лёгкого переиспользования и расширения.

## 🏗️ Архитектура

### Главный компонент
- **`NewShippingCalculatorForm.tsx`** - основной компонент калькулятора, управляет состоянием и логикой

### Структура компонентов

```
NewShippingCalculatorForm/
├── calculator/
│   ├── inputs/
│   │   ├── CityInput.tsx          # Поле ввода города с Yandex Maps
│   │   ├── VolumeSlider.tsx       # Ползунок объёма груза
│   │   └── WeightSlider.tsx       # Ползунок веса груза
│   ├── selectors/
│   │   ├── TransportTypeSelector.tsx    # Выбор типа перевозки
│   │   ├── PackagingSelector.tsx        # Выбор упаковки груза
│   │   └── TruckTypeSelector.tsx        # Выбор типа фургона
│   └── progress/
│       └── StepProgress.tsx       # Индикатор прогресса (4 шага)
└── utils/
    ├── calculator/
    │   ├── constants.ts           # Константы (API ключи, шаги объёма/веса)
    │   ├── yandexMaps.ts          # Интеграция с Yandex Maps
    │   ├── calculatorHelpers.ts   # Вспомогательные функции
    │   └── validation.ts          # Валидация полей
    └── bitrix24.ts                # Интеграция с Bitrix24
```

## 🔄 Логика работы

### Шаг 1: Маршрут и тип перевозки

**Компоненты:**
- `CityInput` (Откуда)
- `CityInput` (Куда)
- `TransportTypeSelector`

**Логика:**
1. Пользователь вводит города → `CityInput` использует Yandex Maps API для подсказок
2. После выбора обоих городов → автоматически рассчитывается маршрут (расстояние, время)
3. Появляется `TransportTypeSelector` (только после заполнения городов)
4. Пользователь выбирает тип перевозки → переход на шаг 2

**State:**
```typescript
fromCity: string
toCity: string
fromCoordinates: [number, number] | undefined
toCoordinates: [number, number] | undefined
transportType: string
distance: number | null
duration: number | null
```

---

### Шаг 2: Параметры груза

#### 2.1 Домашний переезд
**Компоненты:**
- `VolumeSlider`
- `MovingConstructor` (модальное окно)

**Логика:**
- Показывается только ползунок объёма
- Кнопка "Открыть конструктор переезда" → модальное окно с выбором предметов
- После применения конструктора → автоматически устанавливается объём

---

#### 2.2 Продукты питания

**Под-шаг 2.2.1: Упаковка груза**
- `PackagingSelector` (4 варианта: палеты, индивидуальная, навалом, россыпью)
- Если "На палетах" → inline поля: количество палет + вес одной палеты

**Под-шаг 2.2.2: Тип фургона**
- `TruckTypeSelector` (тентованный, изотерм, рефрижератор)
- Если "Рефрижератор" → inline поле: температурный режим

**Под-шаг 2.2.3: Объём и вес**
- `VolumeSlider`
- `WeightSlider`

**Логика "один блок в момент времени":**
```
Упаковка → (заполнено) → Фургон → (заполнено) → Ползунки
```

**Кнопка "Назад":**
```
Ползунки → (сброс фургона) → Фургон → (сброс упаковки) → Упаковка → Шаг 1
```

---

#### 2.3 Промышленные товары / Другое

**Под-шаг 2.3.1: Упаковка груза**
- `PackagingSelector`
- Если "На палетах" → inline поля

**Под-шаг 2.3.2: Объём и вес**
- `VolumeSlider`
- `WeightSlider`

**Логика:**
```
Упаковка → (заполнено) → Ползунки
```

**Кнопка "Назад":**
```
Ползунки → (сброс упаковки) → Упаковка → Шаг 1
```

---

### Шаг 3: Контакты

**Компоненты:**
- Кнопки выбора способа связи (Звонок / WhatsApp)
- `Input` для телефона (с форматированием)

**Логика:**
1. Пользователь выбирает способ связи → появляется поле ввода
2. Форматирование телефона: `+7 (XXX) XXX-XX-XX`
3. Кнопка "Рассчитать стоимость" → переход на шаг 4

**State:**
```typescript
contactMethod: "phone" | "whatsapp" | ""
userContact: string
```

---

### Шаг 4: Расчёт стоимости

**Фаза 1: Отправка заявки (2 секунды)**
- Спиннер загрузки
- Бегущие цифры с blur
- Toast: "Отправка заявки для точного расчёта..."

**Фаза 2: Финальная цена**
- Блок с ценой (крупно)
- Расстояние + Срок доставки
- Сообщение: "✅ Заявка отправлена! Менеджер свяжется в течение 10 минут"

**Логика:**
1. Автоматическая отправка в Bitrix24 при переходе на шаг 4
2. `createBitrix24Lead()` → отправка данных
3. После успеха → показ финальной цены
4. StepProgress скрыт на этом шаге

---

## 🎨 UI компоненты

### CityInput
**Функционал:**
- Поле ввода с debounce (300ms)
- Интеграция с Yandex Maps API (geocode)
- Подсказки в Portal (position: fixed, z-index: 9999)
- Защита от browser autofill (readOnly trick)

**Props:**
```typescript
value: string
onChange: (city: string, coords?: [number, number]) => void
placeholder: string
label: string
error?: boolean
```

---

### VolumeSlider / WeightSlider
**Функционал:**
- Слайдер с шагами (разные для частных/коммерческих перевозок)
- Отображение текущего значения
- Подсказка диапазона (мин/макс)
- Отступы: 20px слева/справа

**Props:**
```typescript
value: number              // индекс в массиве steps
onChange: (index: number) => void
steps: number[]            // массив значений
showTruckInfo?: boolean    // показать рекомендуемый транспорт
truckName?: string
```

---

### TransportTypeSelector
**Функционал:**
- 4 варианта: Домашний переезд, Промышленные товары, Продукты питания, Другое
- Чекбоксы (белые, без оболочек)
- Иконки для каждого типа

**Props:**
```typescript
value: string
onChange: (type: string) => void
error?: boolean
```

---

### PackagingSelector
**Функционал:**
- 4 варианта: На палетах, Индивидуальная, Навалом, Россыпью
- Чекбоксы (белые)
- Inline поля для палет (количество + вес)

**Props:**
```typescript
value: string
onChange: (packaging: string) => void
palletCount?: string
onPalletCountChange?: (count: string) => void
palletWeight?: string
onPalletWeightChange?: (weight: string) => void
error?: boolean
```

---

### TruckTypeSelector
**Функционал:**
- 3 варианта: Тентованный, Изотерм, Рефрижератор
- Чекбоксы (белые)
- Inline поле температуры для рефрижератора

**Props:**
```typescript
value: string
onChange: (type: string) => void
temperatureMode?: string
onTemperatureModeChange?: (temp: string) => void
error?: boolean
```

---

### StepProgress
**Функционал:**
- 4 шага: Маршрут, Параметры груза, Контакты, Расчёт стоимости
- Динамические названия (Шаг 2 → Параметры груза при активации)
- Скрыт на шаге 4
- Мобильная версия: "Шаг X из 4: Название" + "Следующий: Название →"

**Props:**
```typescript
currentStep: number        // 1, 2, 3, 4
steps: StepConfig[]
hasStartedFilling?: boolean // активация шага 1
```

---

## 🔧 Утилиты

### yandexMaps.ts
**Функции:**
- `fetchSuggestions(query: string)` - получение подсказок городов
- `calculateRoute(from, to)` - расчёт маршрута (расстояние, время)
- `loadYandexMapsScript()` - загрузка Yandex Maps API

---

### calculatorHelpers.ts
**Функции:**
- `getTruckInfoByVolume(volume)` - рекомендуемый транспорт
- `calculateDeliveryDays(distance)` - срок доставки в днях
- `formatDeliveryDays(days)` - форматирование (1 день, 2 дня, 5 дней)
- `formatVolume(volume)` - форматирование объёма
- `formatWeight(weight)` - форматирование веса

---

### bitrix24.ts
**Функции:**
- `createBitrix24Lead(data)` - создание лида в Bitrix24
- Автоматическое добавление UTM меток
- Автоматическое добавление Yandex Client ID
- Форматирование комментария с деталями заявки

---

## 📊 State Management

### Основной state
```typescript
// Шаги
calculatorStep: number (1-4)
hasStartedFilling: boolean

// Маршрут
fromCity: string
toCity: string
fromCoordinates: [number, number] | undefined
toCoordinates: [number, number] | undefined
distance: number | null
duration: number | null

// Тип перевозки
transportType: string

// Параметры груза
volumeIndex: number
weightIndex: number
cargoPackaging: string
palletCount: string
palletWeight: string
truckType: string
temperatureMode: string

// Конструктор переезда
constructorItems: SelectedItem[] | undefined

// Контакты
contactMethod: "phone" | "whatsapp" | ""
userContact: string

// Стоимость
estimatedCost: number
showFinalPrice: boolean
isSubmitting: boolean

// Ошибки
errors: Record<string, boolean>
```

---

## 🎯 Как использовать компоненты отдельно

### Пример 1: Использовать только CityInput

```tsx
import { CityInput } from "@/components/calculator/inputs/CityInput";

function MyComponent() {
  const [city, setCity] = useState("");
  const [coords, setCoords] = useState<[number, number] | undefined>();

  return (
    <CityInput
      value={city}
      onChange={(newCity, newCoords) => {
        setCity(newCity);
        setCoords(newCoords);
      }}
      placeholder="Введите город"
      label="Город отправления"
    />
  );
}
```

---

### Пример 2: Использовать только TransportTypeSelector

```tsx
import { TransportTypeSelector } from "@/components/calculator/selectors/TransportTypeSelector";

function MyComponent() {
  const [transportType, setTransportType] = useState("");

  return (
    <TransportTypeSelector
      value={transportType}
      onChange={setTransportType}
    />
  );
}
```

---

### Пример 3: Собрать упрощённый калькулятор

```tsx
import { CityInput } from "@/components/calculator/inputs/CityInput";
import { VolumeSlider } from "@/components/calculator/inputs/VolumeSlider";
import { VOLUME_STEPS_PRIVATE } from "@/utils/calculator/constants";

function SimpleCalculator() {
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [volumeIndex, setVolumeIndex] = useState(0);

  return (
    <div className="space-y-4">
      <CityInput
        value={fromCity}
        onChange={(city) => setFromCity(city)}
        placeholder="Откуда"
        label="Город отправления"
      />
      <CityInput
        value={toCity}
        onChange={(city) => setToCity(city)}
        placeholder="Куда"
        label="Город назначения"
      />
      <VolumeSlider
        value={volumeIndex}
        onChange={setVolumeIndex}
        steps={VOLUME_STEPS_PRIVATE}
      />
    </div>
  );
}
```

---

## 🚀 Интеграции

### Yandex Maps API
- **Ключ:** `a4100971-3502-473d-ac00-0c63115f8fa2`
- **Endpoint:** `https://geocode-maps.yandex.ru/1.x/`
- **Использование:** Подсказки городов, расчёт маршрута

### Bitrix24
- **Webhook:** `https://nordatrans.bitrix24.ru/rest/1/la8f9cfu3icpekuz/`
- **Метод:** `crm.lead.add.json`
- **Поля:**
  - `UF_CRM_1605030443` - Откуда
  - `UF_CRM_1605030456` - Куда
  - `UF_CRM_1759567366` - Yandex Client ID

### Yandex Metrika
- **ID:** `57594511`
- **Цели:**
  - `CALCULATOR_SUBMIT` - отправка заявки
  - `new_lead` - создание лида в Bitrix24

---

## 🎨 Стилизация

### Цветовая палитра
- **Primary:** `#083cb5` (синий акцент)
- **Secondary:** `#405b9a` (серо-фиолетовый)
- **Tertiary:** `#050b18` (тёмный)
- **Quaternary:** `#f0f3f5` (светло-серый фон)
- **Quinary:** `#FFFFFF` (чистый белый)

### Чекбоксы
- Белая рамка (`border-white`)
- Белый фон при checked (`bg-white`)
- Синяя галочка (`text-[#083cb5]`)

### Ползунки
- Отступы: 20px слева/справа
- Подсказки диапазона: белый/60% прозрачности

---

## 📝 Примечания

1. **Логика "один блок в момент времени"** применяется только для типов перевозки КРОМЕ "Домашний переезд"
2. **Кнопка "Назад" на шаге 2** сначала переключает между под-шагами, затем возвращает на шаг 1
3. **StepProgress скрыт на шаге 4** для чистого финального экрана
4. **Автоматическая отправка в Bitrix24** происходит при переходе на шаг 4
5. **Все компоненты логируют свои действия** в консоль для отладки

---

## 🔄 Версионирование

**Версия:** 1.0  
**Дата создания:** 16 ноября 2025  
**Статус:** Экспериментальный (используется на `/test` странице)

---

## 📞 Контакты

При возникновении вопросов или необходимости расширения функционала обращайтесь к документации или исходному коду компонентов.

