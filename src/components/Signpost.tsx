import React from "react";

interface SignpostProps {
  text: string;
  active?: boolean;
}

export default function Signpost({ text, active = false }: SignpostProps) {
  return (
    <div
      className={"signpost2-right" + (active ? " active" : " inactive")}
    >
      <p>{text}</p>
      <style>{`
            .signpost2-right {
              background-color: #c8d4e0; /* default grey */
              --n: 25px;
              clip-path: polygon(0 0, calc(100% - var(--n)) 0, 100% 50%, calc(100% - var(--n)) 100%, 0 100%, var(--n) 50%);
              shape-outside: polygon(0 0, calc(100% - var(--n)) 0, 100% 50%, calc(100% - var(--n)) 100%, 0 100%, var(--n) 50%);
              padding: 6px 0;
              flex: 1;
              min-width: 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
        .signpost2-right p {
          font-family: 'Oswald', sans-serif;
          font-size: 14px;
          margin: 0;
          text-transform: uppercase;
        }
        .signpost2-right.active {
          background-color: #1565c1; /* blue */
        }
        .signpost2-right.active p {
          color: #ffffff;
        }
        .signpost2-right.inactive p {
          color: #050b18;
        }
      `}</style>
    </div>
  );
}
