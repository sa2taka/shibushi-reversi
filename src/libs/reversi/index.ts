import { Board, State } from "./board";

export interface Cell {
  x: number;
  y: number;
}

export default class Reversi {
  private finishedCallbacks: (() => any)[] = [];
  private side: number;
  private _board: Board;
  private history: Board[];
  private _turn = 0;
  private _settableColor: "black" | "white" = "black";

  constructor(private firstArg: number | Reversi) {
    if (typeof firstArg === "number") {
      this.side = firstArg;
      this._board = new Board(firstArg);
      this.history = [];
    } else {
      this.side = firstArg.side;
      this._board = firstArg._board;
      this.history = firstArg.history;
      this._settableColor = firstArg._settableColor;
      this._turn = firstArg._turn;
      this.finishedCallbacks = firstArg.finishedCallbacks;
    }
  }

  public get turn() {
    return this._turn;
  }

  public get board() {
    return this._board.value;
  }

  public get settableColor() {
    return this._settableColor;
  }

  public copy() {
    return new Reversi(this);
  }

  public settableList(color: "white" | "black") {
    const list: Cell[] = [];
    for (let y = 0; y < this.side; y++) {
      for (let x = 0; x < this.side; x++) {
        if (this.canSetPeace(color, x, y)) {
          list.push({
            x,
            y,
          });
        }
      }
    }
    return list;
  }

  public setPeace(color: "white" | "black", x: number, y: number) {
    if (color !== this.settableColor) {
      return true;
    }

    if (this.canSetPeace(color, x, y)) {
      this.history.push(this._board.copy());

      const continued = this.setPeaceAndTurn(color, x, y);
      const nextColor = this.settableColor === "black" ? "white" : "black";
      if (this.settableList(nextColor).length !== 0) {
        console.log("setColor", nextColor);
        this._settableColor = nextColor;
      }

      return continued;
    }
    return false;
  }

  public registerFinishedCallback(callback: () => any) {
    this.finishedCallbacks.push(callback);
  }

  private setPeaceAndTurn(color: "white" | "black", x: number, y: number) {
    const direction: Array<-1 | 0 | 1> = [-1, 0, 1];
    let isSetted = false;

    direction.forEach((dy) => {
      direction.forEach((dx) => {
        const direction = {
          x: dx,
          y: dy,
        };
        if (this.canSetPeaceToOneDirection(color, x, y, direction)) {
          this.setLinePeace(color, x, y, direction);
          isSetted = true;
        }
      });
    });
    this.setOnePeace(color, x, y);

    if (isSetted) {
      if (
        this.settableList("black").length === 0 &&
        this.settableList("white").length === 0
      ) {
        this.onFinish();
      }
    }
    return isSetted;
  }

  private setOnePeace(
    color: "white" | "black",
    x: number,
    y: number,
    turned?: boolean
  ) {
    const state: State = {
      color: color,
      droppedTurnCount: this._turn,
      turned,
    };

    this._board.value[y][x] = state;
  }

  private setLinePeace(
    color: "white" | "black",
    x: number,
    y: number,
    direction: {
      x: -1 | 0 | 1;
      y: -1 | 0 | 1;
    }
  ) {
    let nextX = x;
    let nextY = y;
    let i = 0;

    while (true) {
      nextX += direction.x;
      nextY += direction.y;
      i += 1;

      const next = this._board.value[nextY][nextX].color;
      if (next === color) {
        return;
      } else {
        this.setOnePeace(color, nextX, nextY, true);
      }
    }
  }

  private canSetPeace(color: "white" | "black", x: number, y: number) {
    const direction: Array<-1 | 0 | 1> = [-1, 0, 1];

    let canSet = false;

    direction.forEach((dy) => {
      direction.forEach((dx) => {
        const direction = {
          x: dx,
          y: dy,
        };
        if (this.canSetPeaceToOneDirection(color, x, y, direction)) {
          canSet = true;
        }
      });
    });

    return canSet;
  }

  private canSetPeaceToOneDirection(
    color: "white" | "black",
    x: number,
    y: number,
    direction: {
      x: -1 | 0 | 1;
      y: -1 | 0 | 1;
    }
  ) {
    if (direction.x === 0 && direction.y === 0) {
      return false;
    }

    const current = this._board.value[y][x].color;
    if (current !== "none") {
      return false;
    }

    let nextX = x;
    let nextY = y;
    let i = 0;

    while (true) {
      nextX += direction.x;
      nextY += direction.y;
      i += 1;

      if (nextX < 0 || nextX >= this.side || nextY < 0 || nextY >= this.side) {
        return false;
      }

      const next = this._board.value[nextY][nextX].color;
      if (next === color) {
        if (i <= 1) {
          return false;
        }

        if (i > 1) {
          return true;
        }
      }

      if (next === "none") {
        return false;
      }
    }
  }

  private onFinish() {
    this.finishedCallbacks.forEach((callback) => {
      callback();
    });
  }
}
