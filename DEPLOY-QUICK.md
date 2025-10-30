# 🚀 Быстрая шпаргалка по деплою

## Команды

```bash
# Сборка проекта
npm run deploy:prepare
```

## Что загружать на хостинг

**Загрузите ВСЕ содержимое папки `dist/` в КОРЕНЬ сайта**

Структура на хостинге:
```
/ (корень)
├── index.html          ← главная страница
├── .htaccess           ← важно для роутинга!
├── robots.txt
├── assets/             ← JS и CSS
│   ├── index-*.js
│   └── index-*.css
├── logo_norda.webp
└── ... (другие файлы)
```

## Подключение по FTP

**Хост**: уточните в панели NIC.RU (обычно `ftp.nordatrans.ru`)  
**Логин**: ваш логин от хостинга  
**Пароль**: ваш пароль от хостинга  
**Порт**: 21 (FTP) или 22 (SFTP)

## Права доступа

- Файлы: `644`
- Папки: `755`

## Проверка после деплоя

1. https://nordatrans.ru/ - главная
2. https://nordatrans.ru/tarify - тарифы
3. https://nordatrans.ru/pereezd - переезд
4. https://nordatrans.ru/contacts - контакты

---

**Полная инструкция**: `DEPLOY-INSTRUKCIYA.md`

