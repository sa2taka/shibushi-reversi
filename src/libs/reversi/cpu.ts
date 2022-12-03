import Reversi, { Cell } from '.';

export abstract class Cpu {
  constructor(protected _color: 'white' | 'black') {
  }

  abstract setPeace(reversi: Reversi): Cell;


  public get color( ) {
    return this._color;
  }
}

export default class Beginner extends Cpu {
  public setPeace(reversi: Reversi) {
    const settable = reversi.settableList(this.color);

    return  settable[Math.floor(Math.random()* settable.length)];
  }
}
