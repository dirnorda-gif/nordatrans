/// <reference types="vite/client" />

// Типы для Яндекс Метрики
interface Window {
  ym?: {
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
