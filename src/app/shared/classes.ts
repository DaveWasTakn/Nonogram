export enum DIFFICULTY {
  EASY = "Easy",
  MEDIUM = "Medium",
  HARD = "Hard"
}

export const DIFFICULTY_PERCENTAGE: Record<DIFFICULTY, number> = {
  [DIFFICULTY.EASY]: 65,
  [DIFFICULTY.MEDIUM]: 50,
  [DIFFICULTY.HARD]: 35
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

export class Pos {
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
    public difficulty: DIFFICULTY,
    public grid: Cell[][],
    public grid_columnView: Cell[][],
    public rowNums: number[][],
    public colNums: number[][],
    public totalFilledCells: number
  ) {
  }
}

export class STATE {
  constructor(
    public PUZZLE: Puzzle | undefined,
    public GRID: Cell[][]
  ) {
  }

  public static serialize(state: STATE): string {
    return JSON.stringify(state);
  }

  public static deserialize(stateStr: string): STATE {
    return JSON.parse(stateStr) as STATE;
  }
}
