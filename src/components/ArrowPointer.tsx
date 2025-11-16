import React from "react";

/**
 * Стрелка-указатель (визуальный элемент без функционала).
 * Используется только на странице /test.
 */
interface ArrowPointerProps {
  leftCutColor?: string; // Цвет треугольника слева (по умолчанию белый)
}

export default function ArrowPointer({ leftCutColor = "#ffffff" }: ArrowPointerProps) {
  return (
    <>
      <div className="arrow-pointer" />
      {/* Локальные стили компонента */}
      <style>{`
        .arrow-pointer {
          width: 250px;
          height: 50px;
          background: #32557f;
          position: relative;
        }

        .arrow-pointer:after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0;
          width: 0;
          height: 0;
          border-left: 25px solid ${leftCutColor};
          border-top: 25px solid transparent;
          border-bottom: 25px solid transparent;
        }

        .arrow-pointer:before {
          content: '';
          position: absolute;
          right: -25px;
          bottom: 0;
          width: 0;
          height: 0;
          border-left: 25px solid #32557f;
          border-top: 25px solid transparent;
          border-bottom: 25px solid transparent;
        }
      `}</style>
    </>
  );
}
