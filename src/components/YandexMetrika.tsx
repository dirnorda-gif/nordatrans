import { useEffect } from 'react';

declare global {
  interface Window {
    ym?: {
      (counterId: number, method: string, ...args: any[]): void;
      [counterId: number]: {
        getClientID?: () => string | number;
        reachGoal?: (goalName: string, params?: any) => void;
        hit?: (url: string, options?: any) => void;
      };
      a?: any[];
      l?: number;
    };
    yandex_metrika_callbacks2?: any[];
  }
}

const YandexMetrika = () => {
  useEffect(() => {
    // ОПТИМИЗАЦИЯ: Жесткая отложенная загрузка через 3 секунды после загрузки страницы
    const loadYandexMetrika = () => {
      // Предотвращаем повторную загрузку
      if (window.ym && window.ym[57594511]) {
        console.log('✅ Яндекс Метрика уже загружена');
        return;
      }

      // Инициализация Яндекс Метрики
      (function(m: any, e: any, t: any, r: any, i: any, k: any, a: any) {
        m[i] = m[i] || function() {
          (m[i].a = m[i].a || []).push(arguments);
        };
        m[i].l = 1 * new Date();
        
        // Проверяем, не загружен ли уже скрипт
        for (var j = 0; j < document.scripts.length; j++) {
          if (document.scripts[j].src === r) {
            return;
          }
        }
        
        k = e.createElement(t);
        a = e.getElementsByTagName(t)[0];
        k.async = 1;
        k.src = r;
        a.parentNode.insertBefore(k, a);
      })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');

      // Инициализация счётчика
      window.ym(57594511, 'init', {
        clickmap: true,              // Карта кликов
        trackLinks: true,            // Отслеживание внешних ссылок
        accurateTrackBounce: true,   // Точный показатель отказов
        webvisor: true,              // Вебвизор
        trackHash: true,             // Отслеживание хеша в URL
        ecommerce: 'dataLayer'       // Электронная коммерция
      });

      console.log('✅ Яндекс Метрика загружена через 3 секунды (счётчик: 57594511)');
    };

    // Загружаем строго через 3 секунды после монтирования компонента
    const timeout = setTimeout(loadYandexMetrika, 3000);

    // Cleanup
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      {/* Noscript fallback для пользователей без JavaScript */}
      <noscript>
        <div>
          <img 
            src="https://mc.yandex.ru/watch/57594511" 
            style={{ position: 'absolute', left: '-9999px' }} 
            alt="" 
          />
        </div>
      </noscript>
    </>
  );
};

export default YandexMetrika;

