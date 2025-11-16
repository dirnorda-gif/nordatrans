import Header from "@/components/Header";
import { BannerUp } from "@/components/BannerUp";
import Footer from "@/components/Footer";
import { NewShippingCalculatorForm } from "@/components/NewShippingCalculatorForm";

console.log('📄 [Test Page] Загрузка тестовой страницы с новым калькулятором');

const Test = () => {
  console.log('🎨 [Test Page] Рендер страницы');
  
  return (
    <div className="min-h-screen bg-[#f0f3f5]">
      <Header />
      <BannerUp />
      
      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Тестовая страница
          </h1>
          <p className="text-gray-600">
            Новый модульный калькулятор перевозок (в разработке)
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Левая колонка - калькулятор */}
          <div>
            <NewShippingCalculatorForm />
          </div>
          
          {/* Правая колонка - пустая (для будущих элементов) */}
          <div className="hidden lg:block">
            {/* Здесь можно добавить популярные маршруты или другую информацию */}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Test;

