import React from "react";

interface BreadcrumbArrowsProps {
  items: string[];
}

/**
 * Хлебные крошки в виде стрелок, как на предоставленном скриншоте.
 */
export default function BreadcrumbArrows({ items }: BreadcrumbArrowsProps) {
  const bg = "#e5e5e5"; // светло-серый фон
  const textColor = "#083cb5"; // синий из палитры

  return (
    <div className="flex">
      {items.map((label, idx) => (
        <div
          key={label}
          className="crumb relative font-semibold whitespace-nowrap"
          style={{
            background: bg,
            color: textColor,
            padding: "14px 32px",
            fontSize: "20px",
            lineHeight: 1,
            marginRight: idx < items.length - 1 ? "20px" : 0,
          }}
        >
          {label}
          {/* local styles via pseudo-elements */}
          <style>{`
            .crumb {
              position: relative;
            }
            .crumb::after {
              content: '';
              position: absolute;
              right: -25px;
              top: 0;
              width: 0;
              height: 0;
              border-top: 24px solid transparent;
              border-bottom: 24px solid transparent;
              border-left: 25px solid ${bg};
            }
            .crumb::before {
              content: '';
              position: absolute;
              left: -25px;
              top: 0;
              width: 0;
              height: 0;
              border-top: 24px solid transparent;
              border-bottom: 24px solid transparent;
              border-left: 25px solid transparent;
              /* заливка "хвоста" будет цветом фона страницы, перекрывая предыдущую стрелку */
              pointer-events: none;
            }
            .crumb:first-child::before {
              display: none;
            }
          `}</style>
        </div>
      ))}
    </div>
  );
}
