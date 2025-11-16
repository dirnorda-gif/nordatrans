import React from "react";

/**
 * Параметры выбранного маршрута и груза (визуальный блок 25% ширины).
 * Пока данные статичны – позже будут заполняться динамически из формы.
 */
export function ParametersBlock() {
  return (
    <div className="left w-1/4 min-w-[200px] border-r border-[#ccc] bg-transparent">
      {/* Заголовок */}
      <div className="head bg-[#7a9ec4] text-white text-center font-semibold py-4">
        Параметры
      </div>

      {/* Контент – статичный для демонстрации */}
      <div className="p-4 text-sm space-y-2">
        <div className="item fix active ccm0 text-gray-600">
          Вы не указали ни одного параметра!
        </div>
        <div className="item param ccm1 text-gray-800 hidden">
          Откуда: <span className="font-semibold" />
        </div>
        <div className="item param ccm2 text-gray-800 hidden">
          Куда: <span className="font-semibold" />
        </div>
        <div className="item param ccm4 text-gray-800 hidden">
          Объем: <span className="font-semibold" />
        </div>
        <div className="item param ccm3 text-gray-800 hidden">
          Вес: <span className="font-semibold" />
        </div>
      </div>
    </div>
  );
}
