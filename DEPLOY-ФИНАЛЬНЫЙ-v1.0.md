# 🚀 ФИНАЛЬНЫЙ ДЕПЛОЙ - Версия 1.0

**Дата:** 06 ноября 2024  
**Статус:** ✅ Готово к загрузке

---

## 📦 Что включено в этот деплой

### ✅ Функционал:
1. **Цели Яндекс.Метрики** (4 цели):
   - `new_lead` - создание лида
   - `phone_call` - звонок после расчета
   - `success_deal` - выигранная сделка + сумма
   - `lost_deal` - проигранная сделка

2. **Коллтрекинг звонков**:
   - Сохранение расчетов с сайта
   - Сопоставление звонков с визитами
   - Точность: 70-95%

---

## 📂 Файлы для загрузки на хостинг

### 🔵 Папка 1: Основной сайт (из dist/)

**Путь на локальном:** `/Users/andrey/Cursor проэкты/Norda_cursor/dist/`  
**Путь на сервере:** `/home/h808041983/nordatrans.ru/docs/`

**Загрузить ВСЕ файлы:**
```
dist/
├── index.html                    ← Загрузить
├── .htaccess                     ← Загрузить
├── assets/
│   ├── index-BYBoAkz6.js        ← Загрузить
│   ├── index-E4adAvKT.css       ← Загрузить
│   ├── routeCache-CseIcwhY.js   ← Загрузить
│   ├── ui-ChrRdAzB.js           ← Загрузить
│   └── vendor-BiWxylDI.js       ← Загрузить
└── (все остальные файлы)
```

**⚠️ ВАЖНО:** Загрузите **ВСЕ** файлы из папки `dist/` на сервер, заменив старые!

---

### 🟢 Папка 2: API для коллтрекинга (новые PHP файлы)

**Путь на локальном:** `/Users/andrey/Cursor проэкты/Norda_cursor/public/api/`  
**Путь на сервере:** `/home/h808041983/nordatrans.ru/docs/api/`

**Создать папку на сервере:**
```bash
mkdir -p /home/h808041983/nordatrans.ru/docs/api
```

**Загрузить файлы:**
```
public/api/
├── save-calculation.php          ← Загрузить (новый)
├── match-call-lead.php           ← Загрузить (новый)
└── .htaccess                     ← Загрузить (новый)
```

**Права доступа (SSH):**
```bash
chmod 755 /home/h808041983/nordatrans.ru/docs/api
chmod 644 /home/h808041983/nordatrans.ru/docs/api/*.php
chmod 644 /home/h808041983/nordatrans.ru/docs/api/.htaccess
```

---

### 🟣 Папка 3: Хранилище данных (новая папка)

**Путь на локальном:** `/Users/andrey/Cursor проэкты/Norda_cursor/public/data/`  
**Путь на сервере:** `/home/h808041983/nordatrans.ru/docs/data/`

**Создать папку на сервере:**
```bash
mkdir -p /home/h808041983/nordatrans.ru/docs/data
```

**Загрузить файлы:**
```
public/data/
└── .htaccess                     ← Загрузить (новый)
```

**Права доступа (SSH):**
```bash
chmod 755 /home/h808041983/nordatrans.ru/docs/data
chmod 644 /home/h808041983/nordatrans.ru/docs/data/.htaccess
```

**Примечание:** Файл `calculator-sessions.json` создастся автоматически при первом расчете.

---

### 🟡 Папка 4: Вебхук для сделок (проверить/обновить)

**Путь на локальном:** `/Users/andrey/Cursor проэкты/Norda_cursor/public/bitrix-webhook/`  
**Путь на сервере:** `/home/h808041983/nordatrans.ru/docs/bitrix-webhook/`

**Проверить наличие файлов:**
```
bitrix-webhook/
├── index.php                     ← Должен быть на сервере
└── .htaccess                     ← Должен быть на сервере
```

**Если НЕТ - загрузить из локального проекта!**

---

## 📋 Пошаговая инструкция деплоя

### Шаг 1: Подключение к FTP

**Используйте ваши FTP данные:**
- **Хост:** ftp.nordatrans.ru (или IP сервера)
- **Логин:** ваш логин
- **Пароль:** ваш пароль
- **Порт:** 21 (или 22 для SFTP)

**Рекомендуемые FTP клиенты:**
- FileZilla (бесплатный)
- Cyberduck (Mac)
- WinSCP (Windows)

---

### Шаг 2: Резервная копия (на всякий случай)

**Перед загрузкой скачайте с сервера:**
```
/home/h808041983/nordatrans.ru/docs/index.html
/home/h808041983/nordatrans.ru/docs/assets/
```

Сохраните в папку `backup_20241106/` на вашем компьютере.

---

### Шаг 3: Загрузка основного сайта

1. Откройте FTP клиент
2. Перейдите в папку: `/home/h808041983/nordatrans.ru/docs/`
3. **Удалите** старые файлы:
   - `index.html`
   - Папку `assets/` (старые JS/CSS)
4. **Загрузите** все файлы из локальной папки:
   ```
   /Users/andrey/Cursor проэкты/Norda_cursor/dist/
   ```
5. Убедитесь что `.htaccess` тоже загружен

**⏱️ Время загрузки:** ~2-3 минуты

---

### Шаг 4: Загрузка PHP API

1. Перейдите в папку: `/home/h808041983/nordatrans.ru/docs/`
2. **Создайте папку** `api` (если нет)
3. Перейдите в `/home/h808041983/nordatrans.ru/docs/api/`
4. **Загрузите файлы** из локальной папки:
   ```
   /Users/andrey/Cursor проэкты/Norda_cursor/public/api/save-calculation.php
   /Users/andrey/Cursor проэкты/Norda_cursor/public/api/match-call-lead.php
   /Users/andrey/Cursor проэкты/Norda_cursor/public/api/.htaccess
   ```

**⏱️ Время загрузки:** ~30 секунд

---

### Шаг 5: Создание папки data

1. Перейдите в папку: `/home/h808041983/nordatrans.ru/docs/`
2. **Создайте папку** `data`
3. Перейдите в `/home/h808041983/nordatrans.ru/docs/data/`
4. **Загрузите файл:**
   ```
   /Users/andrey/Cursor проэкты/Norda_cursor/public/data/.htaccess
   ```

**⏱️ Время загрузки:** ~10 секунд

---

### Шаг 6: Проверка вебхука для сделок

1. Перейдите в папку: `/home/h808041983/nordatrans.ru/docs/bitrix-webhook/`
2. **Проверьте наличие файлов:**
   - `index.php` ✅
   - `.htaccess` ✅

Если файлов НЕТ - загрузите из:
```
/Users/andrey/Cursor проэкты/Norda_cursor/public/bitrix-webhook/
```

---

### Шаг 7: Установка прав доступа (SSH)

**Подключитесь по SSH:**
```bash
ssh ваш_логин@сервер
```

**Выполните команды:**
```bash
cd /home/h808041983/nordatrans.ru/docs

# Права на папки
chmod 755 api
chmod 755 data
chmod 755 bitrix-webhook

# Права на PHP файлы
chmod 644 api/*.php
chmod 644 bitrix-webhook/*.php

# Права на .htaccess
chmod 644 api/.htaccess
chmod 644 data/.htaccess
chmod 644 bitrix-webhook/.htaccess
chmod 644 .htaccess
```

---

## ✅ Проверка после деплоя

### Тест 1: Сайт работает

Откройте в браузере: https://nordatrans.ru

**Ожидаемый результат:**
- ✅ Сайт загружается
- ✅ Калькулятор работает
- ✅ Формы отправляются

---

### Тест 2: API сохранения расчетов

Откройте в браузере:
```
https://nordatrans.ru/api/save-calculation.php
```

**Ожидаемый результат:**
```json
{"status":"error","message":"Invalid data: client_id and route are required"}
```

Это нормально! Значит файл работает.

---

### Тест 3: API сопоставления звонков

Откройте в браузере:
```
https://nordatrans.ru/api/match-call-lead.php?token=cd7p8htqy86kby1wu8ajqa7bpr2kbmfl
```

**Ожидаемый результат:**
```json
{"status":"skipped","reason":"Wrong event type"}
```

Это нормально! Значит файл работает.

---

### Тест 4: Вебхук для сделок

Откройте в браузере:
```
https://nordatrans.ru/bitrix-webhook/index.php?token=cd7p8htqy86kby1wu8ajqa7bpr2kbmfl
```

**Ожидаемый результат:**
```json
{"status":"error","message":"Invalid webhook data"}
```

Это нормально! Значит файл работает.

---

### Тест 5: Функциональный тест

#### 5.1 Сделайте расчет на сайте:
1. Откройте https://nordatrans.ru
2. Заполните калькулятор (Москва → СПб, 20м³)
3. Нажмите "Получить расчёт"
4. **Консоль браузера (F12):**
   ```
   💾 Расчет сохранен для сопоставления звонков
   ```

#### 5.2 Проверьте файл данных (SSH):
```bash
cat /home/h808041983/nordatrans.ru/docs/data/calculator-sessions.json
```

Должен быть JSON с вашим расчетом.

#### 5.3 Отправьте форму:
1. Укажите телефон
2. Отправьте заявку
3. **Должно появиться:**
   - ✅ Сообщение "Заявка успешно отправлена"
   - ✅ Перенаправление на страницу Thanks

#### 5.4 Проверьте Bitrix24:
1. Откройте https://nordatrans.bitrix24.ru
2. **CRM → Лиды**
3. Проверьте что создался новый лид
4. В поле "Яндекс Client ID" должен быть ID

---

## 🎯 Настройка после деплоя

### После успешной загрузки настройте:

#### 1. Вебхук в Bitrix24 (если еще не настроен)

**CRM → Автоматизация → Лиды → Стадия "Квалифицирован"**

**Хендлер:**
```
https://nordatrans.ru/api/match-call-lead.php?token=cd7p8htqy86kby1wu8ajqa7bpr2kbmfl
```

**Условия:**
- Источник = Звонок
- Телефон содержит `4994440651`
- Откуда ≠ пусто
- Куда ≠ пусто

#### 2. Цели в Яндекс.Метрике

**Метрика → Настройки → Цели → Добавить:**

1. **new_lead** - JavaScript событие
2. **phone_call** - JavaScript событие
3. **success_deal** - JavaScript событие (+ ценность)
4. **lost_deal** - JavaScript событие

---

## 🔍 Диагностика проблем

### Проблема: Сайт не загружается

**Проверьте:**
```bash
# SSH на сервер
ls -la /home/h808041983/nordatrans.ru/docs/index.html
```

Файл должен существовать и иметь права 644.

**Решение:**
- Перезагрузите index.html
- Проверьте .htaccess

---

### Проблема: API не работает

**Проверьте:**
```bash
ls -la /home/h808041983/nordatrans.ru/docs/api/
```

Должны быть файлы с правами 644.

**Решение:**
- Перезагрузите PHP файлы
- Проверьте права: `chmod 644 api/*.php`

---

### Проблема: Расчеты не сохраняются

**Проверьте логи:**
```bash
tail -f /home/h808041983/nordatrans.ru/docs/api/save-calculation.log
```

**Проверьте папку data:**
```bash
ls -la /home/h808041983/nordatrans.ru/docs/data/
chmod 755 /home/h808041983/nordatrans.ru/docs/data/
```

---

## 📊 Мониторинг после деплоя

### В течение первых 24 часов проверяйте:

**Логи на сервере:**
```bash
# Сохранение расчетов
tail -f /home/h808041983/nordatrans.ru/docs/api/save-calculation.log

# Сопоставление звонков
tail -f /home/h808041983/nordatrans.ru/docs/api/match-call-lead.log

# Цели в Метрике
tail -f /home/h808041983/nordatrans.ru/docs/api/metrika-goals.log

# Вебхук сделок
tail -f /home/h808041983/nordatrans.ru/docs/bitrix-webhook/webhook.log
```

**В Яндекс.Метрике:**
- Отчёты → Конверсии
- Проверьте наличие целей (через 30 минут после первых событий)

---

## ✅ Финальный чеклист

- [ ] Создана резервная копия старых файлов
- [ ] Загружены все файлы из `dist/`
- [ ] Загружены PHP файлы в `/api/`
- [ ] Создана папка `/data/` с .htaccess
- [ ] Проверена папка `/bitrix-webhook/`
- [ ] Установлены права доступа (SSH)
- [ ] Сайт открывается и работает
- [ ] API save-calculation отвечает
- [ ] API match-call-lead отвечает
- [ ] Вебхук bitrix-webhook отвечает
- [ ] Проведен функциональный тест расчета
- [ ] Проведен функциональный тест отправки формы
- [ ] Настроен вебхук в Bitrix24
- [ ] Созданы цели в Яндекс.Метрике

---

## 📞 Поддержка

**Документация:**
- `НАСТРОЙКА-ЯНДЕКС-МЕТРИКА-ЦЕЛИ.md`
- `НАСТРОЙКА-КОЛЛТРЕКИНГ-ЗВОНКОВ.md`
- `DEPLOY-КОЛЛТРЕКИНГ-ЗВОНКОВ.md`

**Важные URL:**
- Сайт: https://nordatrans.ru
- API сохранения: https://nordatrans.ru/api/save-calculation.php
- API коллтрекинга: https://nordatrans.ru/api/match-call-lead.php
- Вебхук сделок: https://nordatrans.ru/bitrix-webhook/index.php

---

**Готово к загрузке!** 🚀

**Время деплоя:** ~5-10 минут  
**Версия:** 1.0  
**Дата:** 06 ноября 2024

