import Header from "@/components/Header";
import { BannerUp } from "@/components/BannerUp";
import Footer from "@/components/Footer";
import { NewStepCalculator } from "@/components/NewStepCalculator";

console.log('📄 [Test Page] Загрузка тестовой страницы');

const Test = () => {
  console.log('🎨 [Test Page] Рендер страницы');
  
  return (
    <div className="min-h-screen bg-[#f0f3f5]">
      <Header />
      <BannerUp />

      <section className="flex justify-center px-[50px] pb-[100px] mt-12">
        <NewStepCalculator />
      </section>
      
      <Footer />
    </div>
  );
};

export default Test;
