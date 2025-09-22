export enum DIFFICULTIES {
  EASY = "Easy",
  MEDIUM = "Medium",
  HARD = "Hard"
}

export const DIFFICULTY_PERCENTAGE: Record<DIFFICULTIES, number> = {
  [DIFFICULTIES.EASY]: 65,
  [DIFFICULTIES.MEDIUM]: 50,
  [DIFFICULTIES.HARD]: 35
};

export enum CELL_STATE {
  UNKNOWN = 0,
  EMPTY = 1,
  FILLED = 2,
}

export enum DIRECTION {
  HORIZONTAL = 0,
  VERTICAL = 1,
}

export class Pos{
  constructor(public row: number, public col: number) {
  }
}

export class Cell {  // box CellState into an object to have row- and column- view in sync
  constructor(public state: CELL_STATE) {
  }
}

export class Puzzle {
  constructor(
    public sizeRows: number,
    public sizeCols: number,
    public difficulty: DIFFICULTIES,
    public grid: Cell[][],
    public grid_columnView: Cell[][],
    public rowNums: number[][],
    public colNums: number[][],
    public totalFilledCells: number
  ) {
  }
}
