// src/hooks/useYandexMetrika.ts

import { useEffect } from 'react';

export const useYandexMetrika = (counterId: number = 57594511) => {
  useEffect(() => {
    // Этот хук не загружает метрику, только предоставляет утилиты
    // Загрузка происходит через компонент YandexMetrika
  }, [counterId]);

  // Утилита для отправки целей
  const reachGoal = (goalName: string, params?: any) => {
    if (window.ym && window.ym[counterId]) {
      window.ym(counterId, 'reachGoal', goalName, params);
      console.log(`📊 Цель достигнута: ${goalName}`, params);
    } else {
      console.warn(`⚠️ Яндекс Метрика не загружена. Цель "${goalName}" не отправлена.`);
    }
  };

  // Утилита для отправки хита (просмотра страницы)
  const hit = (url: string, options?: any) => {
    if (window.ym && window.ym[counterId]) {
      window.ym(counterId, 'hit', url, options);
      console.log(`📊 Хит отправлен: ${url}`);
    } else {
      console.warn(`⚠️ Яндекс Метрика не загружена. Хит для "${url}" не отправлен.`);
    }
  };

  // Утилита для получения Client ID
  const getClientID = (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (window.ym && window.ym[counterId]) {
        const clientId = window.ym[counterId].getClientID?.();
        resolve(clientId ? clientId.toString() : null);
      } else {
        // Ждём загрузки метрики (максимум 5 секунд)
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (window.ym && window.ym[counterId]) {
            clearInterval(interval);
            const clientId = window.ym[counterId].getClientID?.();
            resolve(clientId ? clientId.toString() : null);
          } else if (attempts > 50) { // 50 * 100ms = 5 секунд
            clearInterval(interval);
            resolve(null);
          }
        }, 100);
      }
    });
  };

  return { reachGoal, hit, getClientID };
};

