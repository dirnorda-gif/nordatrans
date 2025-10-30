# 🚚 NORDA TRANS - Калькулятор стоимости перевозки

Веб-приложение для расчета стоимости грузоперевозок с учетом веса, объема и направления маршрута.

## 📚 Документация проекта

- **[КАЛЬКУЛЯТОР.md](./КАЛЬКУЛЯТОР.md)** — Полное описание калькулятора, API, примеры
- **[ТЕСТИРОВАНИЕ.md](./ТЕСТИРОВАНИЕ.md)** — Инструкции по тестированию
- **[РЕАЛИЗАЦИЯ.md](./РЕАЛИЗАЦИЯ.md)** — Техническая документация и статус
- **[КАК-ОБНОВИТЬ-КЭШ.md](./КАК-ОБНОВИТЬ-КЭШ.md)** — 🔥 Быстрая инструкция по обновлению кэша

## ✨ Основные возможности

- ✅ **Умный калькулятор** — учитывает вес и объем груза
- ✅ **37 городов** с реальными тарифами из ATI.SU
- ✅ **3 направления** — в Москву, из Москвы, город-город
- ✅ **Минимальная цена** — 7 500 ₽
- ✅ **15 популярных маршрутов** — предрассчитанные данные в кэше
- ✅ **Яндекс.Карты API** — точный расчет расстояния

## 🔧 Структура проекта

```
src/
├── utils/
│   └── shippingCalculator.ts    # Логика калькулятора
├── data/
│   └── routeCache.json          # Кэш маршрутов (15 городов)
├── pages/
│   └── Index.tsx                # Главная страница
└── components/                  # React компоненты
```

---

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/56f1a3b9-2258-48ee-8e4d-ab7deed50409

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/56f1a3b9-2258-48ee-8e4d-ab7deed50409) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/56f1a3b9-2258-48ee-8e4d-ab7deed50409) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

