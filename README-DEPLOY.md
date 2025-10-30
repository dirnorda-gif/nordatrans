# 🚀 Деплой проекта Нордатранс на NIC.RU

Этот проект готов к деплою на хостинг NIC.RU (домен: https://nordatrans.ru/)

---

## 📚 Навигация по документации

### Для быстрого старта:
1. **[ПОДГОТОВКА-К-ДЕПЛОЮ.md](./ПОДГОТОВКА-К-ДЕПЛОЮ.md)** ⭐ - **НАЧНИТЕ ОТСЮДА**
   - Краткая сводка о проделанной работе
   - Следующие шаги
   - Ключевая информация

### Для пошагового деплоя:
2. **[DEPLOY-INSTRUKCIYA.md](./DEPLOY-INSTRUKCIYA.md)** 📖 - **ПОЛНАЯ ИНСТРУКЦИЯ**
   - Проверка конфигурации
   - Процесс сборки
   - Загрузка на хостинг NIC.RU (FTP, Файловый менеджер)
   - Решение типовых проблем
   - Как узнать тип веб-сервера

### Для опытных пользователей:
3. **[DEPLOY-QUICK.md](./DEPLOY-QUICK.md)** ⚡ - **БЫСТРАЯ ШПАРГАЛКА**
   - Основные команды
   - Структура файлов
   - Данные для FTP

### Для проверки перед деплоем:
4. **[DEPLOY-CHECKLIST.md](./DEPLOY-CHECKLIST.md)** ✅ - **ЧЕК-ЛИСТ**
   - Что проверить перед сборкой
   - Что проверить после загрузки
   - Список всех страниц для тестирования

---

## ⚡ Быстрый старт

### 1. Соберите проект

```bash
npm run deploy:prepare
```

Эта команда:
- ✅ Соберет production билд
- ✅ Скопирует `.htaccess` в `dist/`
- ✅ Удалит временные файлы
- ✅ Покажет инструкции

### 2. Загрузите на хостинг

**Загрузите ВСЕ содержимое папки `dist/` в КОРЕНЬ сайта на хостинге**

Структура должна быть:
```
/ (корень сайта)
├── index.html
├── .htaccess          ← важно!
├── robots.txt
├── assets/
└── ... (остальные файлы)
```

### 3. Проверьте работу

Откройте: https://nordatrans.ru/

Проверьте все страницы (см. `DEPLOY-CHECKLIST.md`)

---

## 📦 Что находится в папке `dist/`

После выполнения `npm run deploy:prepare` в папке `dist/` будет:

- `index.html` - главная страница
- `.htaccess` - правила для Apache (роутинг React Router)
- `robots.txt` - для поисковых систем
- `assets/` - минифицированные JS и CSS
- Изображения и иконки
- **Размер:** ~1.2 MB

---

## 🔑 API ключи (проверены и актуальны)

### Яндекс.Метрика
- **Счетчик:** `57594511`
- **Файл:** `src/components/YandexMetrika.tsx`
- **Загрузка:** Отложенная (через 3 секунды)

### Bitrix24
- **Webhook:** `https://nordatrans.bitrix24.ru/rest/1/la8f9cfu3icpekuz/`
- **Файл:** `src/utils/bitrix24.ts`
- **Поля:** Города (без страны), UTM метки, Yandex Client ID

### Яндекс.Карты API
- **Встроен** в компоненты автозаполнения адресов
- **Файлы:** 
  - `src/components/YandexAddressInput.tsx`
  - `src/components/ShippingCalculatorForm.tsx`

---

## 🌐 Страницы сайта

Все страницы работают через React Router:

| URL | Описание | Файл |
|-----|----------|------|
| `/` | Главная | `src/pages/Index.tsx` |
| `/tarify` | Тарифы | `src/pages/Tariffs.tsx` |
| `/tarify-iz-moskvy` | Тарифы из Москвы | `src/pages/TariffyIzMoskvy.tsx` |
| `/pereezd` | Переезд | `src/pages/Moving.tsx` |
| `/pereezd-iz` | Переезд из | `src/pages/PereezdIz.tsx` |
| `/fleet` | Автопарк | `src/pages/Fleet.tsx` |
| `/contacts` | Контакты | `src/pages/Contacts.tsx` |
| `/thanks` | Благодарности | `src/pages/Thanks.tsx` |

---

## 🛠️ Технический стек

- **Frontend:** React 18 + TypeScript
- **Build:** Vite 5
- **Routing:** React Router 6
- **UI:** Radix UI + Tailwind CSS
- **Forms:** React Hook Form + Zod
- **Analytics:** Яндекс.Метрика
- **CRM:** Bitrix24 API

---

## 📊 Особенности реализации

### Аккордеон маршрутов
- ✅ Автоматическая загрузка данных через 1 секунду после загрузки страницы
- ✅ Кэширование данных в state
- ✅ Переиспользование для калькулятора
- **Файл:** `src/components/RoutesAccordion.tsx`
- **Кэш:** `src/data/routeCache.json`

### Калькулятор доставки
- ✅ Интеграция с Яндекс.Картами (автозаполнение)
- ✅ Расчет стоимости по формуле
- ✅ Отправка в Bitrix24 с UTM метками
- ✅ Разные типы груза (домашний переезд, промышленные товары, продукты питания)
- **Файл:** `src/components/ShippingCalculatorForm.tsx`
- **Логика:** `src/utils/shippingCalculator.ts`

### Аналитика
- ✅ Яндекс.Метрика (отложенная загрузка)
- ✅ UTM метки (сохранение в localStorage)
- ✅ Yandex Client ID (передача в Bitrix24)
- **Файлы:** 
  - `src/utils/analytics.ts`
  - `src/components/YandexMetrika.tsx`

---

## 🔧 Команды разработки

```bash
# Локальный dev сервер
npm run dev

# Сборка для разработки (с sourcemaps)
npm run build:dev

# Production сборка
npm run build

# Подготовка к деплою (сборка + копирование .htaccess)
npm run deploy:prepare

# Предварительный просмотр production билда
npm run preview

# Линтинг
npm run lint
```

---

## ⚠️ Важные замечания

### 1. `.htaccess` критически важен
Без него React Router не будет работать на Apache.  
Страницы типа `/tarify` будут показывать 404.

### 2. Файлы должны быть в корне
Содержимое `dist/` загружается в **корень** сайта, а НЕ в подпапку `/dist/`

### 3. Права доступа
- **Файлы:** `644` (`-rw-r--r--`)
- **Папки:** `755` (`drwxr-xr-x`)

### 4. Кэш браузера
После деплоя очистите кэш: `Ctrl+Shift+R` (Windows/Linux) или `Cmd+Shift+R` (Mac)

---

## 📞 Поддержка

### NIC.RU
- **Сайт:** https://www.nic.ru/help/
- **Телефон:** +7 (495) 737-9222
- **Email:** support@nic.ru

### Документация проекта
См. файлы в корне проекта:
- `СТРУКТУРА-ПРОЕКТА.md`
- `КАЛЬКУЛЯТОР.md`
- `НАСТРОЙКА-АККОРДЕОНА-МАРШРУТОВ.md`
- `РЕАЛИЗАЦИЯ.md`

---

## ✅ Проект готов к деплою

Все необходимые файлы созданы:
- ✅ `.htaccess` для Apache
- ✅ Оптимизированная конфигурация Vite
- ✅ Скрипт быстрой подготовки
- ✅ Подробная документация
- ✅ Чек-лист проверки

**Следуйте инструкциям в [DEPLOY-INSTRUKCIYA.md](./DEPLOY-INSTRUKCIYA.md)**

Удачи! 🚀

---

**Последнее обновление:** 28 октября 2025  
**Домен:** https://nordatrans.ru/  
**Хостинг:** NIC.RU (Apache)

