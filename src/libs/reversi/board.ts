export interface State {
  color: 'none' | 'black' | 'white';
  droppedTurnCount?: number;
  turned?: boolean;
}

export const none: State = {
  color: 'none',
};

export class Board {
  private _value: State[][];

  constructor(private side: number, private board?: State[][]) {
    if (board) {
      this._value = board;
    } else {
      this._value = this.initialBoard;
    }
  }

  private get initialBoard() {
    const board: Array<Array<State>> = Array.from(
      new Array(this.side),
      () => new Array(this.side).fill(none)
    );
    const center = Math.floor(this.side / 2);
    board[center - 1][center - 1] = { color: 'white' };
    board[center - 1][center] = { color: 'black' };
    board[center][center - 1] = { color: 'black' };
    board[center][center] = { color: 'white' };

    return board;
  }

  public copy() {
    const newBoard: Array<Array<State>> = Array.from(
      new Array(this.side),
      () => new Array(this.side).fill(none)
    );

    this._value.forEach((row, y) => {
      row.forEach((elm, x) => {
        newBoard[y][x] = Object.assign(elm);
      });
    });

    return new Board(this.side, newBoard);
  }

  public set(elem: State, x: number, y: number) {
    this._value[y][x] = elem;
  }

  public get value() {
    return this._value;
  }
}
