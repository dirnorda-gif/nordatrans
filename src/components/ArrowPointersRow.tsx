import React from "react";
import ArrowPointer from "./ArrowPointer";

/**
 * Ряд из четырёх стрелок-указателей, которые «втыкаются» друг в друга с зазором 10 px.
 * Реализация: для стрелок, начиная со второй, используется отрицательный
 * margin-left –15 px (ширина «головы» 25 px, зазор 10 px).
 */
export default function ArrowPointersRow() {
  const bgColor = "#f0f3f5"; // фон страницы /test
  return (
    <div className="flex items-center">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={i < 3 ? "mr-[10px]" : undefined}>
          <ArrowPointer leftCutColor={bgColor} />
        </div>
      ))}
    </div>
  );
}
