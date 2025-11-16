import Header from "@/components/Header";
import { BannerUp } from "@/components/BannerUp";
import Footer from "@/components/Footer";
import Signpost from "@/components/Signpost";

console.log('📄 [Test Page] Загрузка тестовой страницы');

const Test = () => {
  console.log('🎨 [Test Page] Рендер страницы');
  
  return (
    <div className="min-h-screen bg-[#f0f3f5]">
      <Header />
      <BannerUp />

      {/* Центрированный ансамбль 25% / 75% */}
      <div className="flex justify-center mt-12">
        <div className="inline-flex items-center px-[50px] py-[100px]">
          {/* Левая и правая колонки ниже */}
          {/* Левая колонка 25% (статичная, без вертикального центрирования) */}
          <div className="w-1/4 flex items-center flex-shrink-0">
            <div
              className="bg-[#7a9ec4] text-white font-semibold text-xs py-[6px] flex items-center justify-center"
              style={{ width: "192px" }}
            >
              Параметры
            </div>
          </div>

          {/* Правая колонка 75% */}
          <div className="w-3/4 flex flex-col items-center">
            {/* Стрелки */}
            <div className="flex">
              {["Шаг 1", "Шаг 2", "Шаг 3", "Расчёт стоимости"].map((t, i) => (
                <div key={t} className={i === 0 ? undefined : "-ml-[10px]"}>
                  <Signpost text={t} active={i === 0} />
                </div>
              ))}
            </div>

            
          </div>
        </div>
      </div>
      
      {/* Основного текстового заголовка больше нет – структура страницы теперь строго двухколоночная. */}
      
      <Footer />
    </div>
  );
};

export default Test;

