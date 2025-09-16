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
  UNKONWN = -1,
  EMPTY = 0,
  FILLED = 1,
}

export class Puzzle {
  constructor(
    public sizeRows: number,
    public sizeCols: number,
    public difficulty: DIFFICULTIES,
    public grid: CELL_STATE[][],
    public grid_columnView: CELL_STATE[][],
    public rowNums: number[][],
    public colNums: number[][]
  ) {}
}
