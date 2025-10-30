import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Компонент для автоматической прокрутки страницы вверх при навигации
 * Не скроллит вверх, если в location.state установлен флаг preserveScroll
 */
export const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Проверяем, не нужно ли сохранить позицию скролла
    const state = location.state as { preserveScroll?: boolean } | null;
    
    // Если флаг preserveScroll не установлен - скроллим вверх
    if (!state?.preserveScroll) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.state]);

  return null;
};

export default ScrollToTop;

