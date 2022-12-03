import React, { useCallback, useEffect, useRef, useState } from "react";
import Beginner from "./libs/reversi/cpu";
import "./App.css";
import Reversi from "./libs/reversi/index";

const side = 8;

const getRowKey = (y: number) => `row${y}`;
const getCellKey = (x: number, y: number) => `cell${x}-${y}`;

const Cell: React.FC<{
  x: number;
  y: number;
  color: "black" | "white" | "none";
  onClick: (x: number, y: number) => void;
  settable: boolean;
  cellSize: number;
}> = React.memo(({ x, y, color, onClick, settable, cellSize }) => {
  return (
    <div
      className={["cell", settable && "settable-cell"].join(" ")}
      onClick={() => onClick(x, y)}
      style={{ fontSize: `${cellSize * 0.9}px` }}
    >
      {color === "black" ? "志" : color === "white" ? "布" : ""}
    </div>
  );
});

Cell.displayName = "Cell";

const hasSettableList = (
  reversi: Reversi,
  color: "black" | "white",
  x: number,
  y: number
) => {
  return reversi
    .settableList(color)
    .some((cell) => cell.x === x && cell.y === y);
};

const Information: React.FC<{ reversi: Reversi }> = ({ reversi }) => {
  return (
    <div id="information">
      <p>
        <span
          style={{ fontSize: "42px", fontWeight: "bold", marginRight: "0.2em" }}
        >
          {reversi.settableColor === "black" ? "志" : "布"}
        </span>
        のターン
      </p>
      <p>
        志の数:
        {reversi.board.reduce(
          (acc, row) =>
            row.reduce(
              (acc2, cell) => acc2 + (cell.color === "black" ? 1 : 0),
              acc
            ),
          0
        )}
      </p>
      <p>
        布の数:
        {reversi.board.reduce(
          (acc, row) =>
            row.reduce(
              (acc2, cell) => acc2 + (cell.color === "white" ? 1 : 0),
              acc
            ),
          0
        )}
      </p>
    </div>
  );
};

export const App: React.FC = () => {
  const [reversi, setReversi] = useState(new Reversi(side));
  const [cpu, setCpu] = useState(new Beginner("white"));
  const [boardSize, setBoardSize] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const setPeace = useCallback(
    (x: number, y: number) => {
      if (reversi.settableColor !== "black") {
        return;
      }
      reversi.setPeace("black", x, y);
      setReversi(reversi.copy());
    },
    [reversi]
  );

  useEffect(() => {
    (async () => {
      if (reversi.settableColor !== cpu.color) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const cell = cpu.setPeace(reversi);

      reversi.setPeace(cpu.color, cell.x, cell.y);
      setReversi(reversi.copy());
    })();
  }, [reversi]);

  useEffect(() => {
    const setBoardSizeFromElement = () => {
      console.log("resize");
      if (!ref.current) {
        return;
      }

      const width = ref.current.clientWidth;
      setBoardSize(width);
    };

    setBoardSizeFromElement();

    window.addEventListener("resize", setBoardSizeFromElement);

    return () => window.removeEventListener("resize", setBoardSizeFromElement);
  }, []);

  return (
    <div id="container">
      <div id="board" ref={ref}>
        {Array(side)
          .fill(undefined)
          .map((_, y) => {
            return (
              <div key={getRowKey(y)} className="row">
                {Array(side)
                  .fill(undefined)
                  .map((_, x) => (
                    <Cell
                      key={getCellKey(x, y)}
                      x={x}
                      y={y}
                      color={reversi.board[y][x].color}
                      onClick={setPeace}
                      settable={hasSettableList(
                        reversi,
                        reversi.settableColor,
                        x,
                        y
                      )}
                      cellSize={boardSize / 8}
                    />
                  ))}
              </div>
            );
          })}
      </div>
      <Information reversi={reversi} />
    </div>
  );
};
