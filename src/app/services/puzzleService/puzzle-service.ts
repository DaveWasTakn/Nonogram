import {Injectable, signal} from '@angular/core';

import {Cell, CELL_STATE, DIFFICULTIES, DIFFICULTY_PERCENTAGE, Puzzle} from '../../shared/shared';

export interface PuzzleSettings {
  size: number;
  difficulty: DIFFICULTIES;
}

@Injectable({
  providedIn: 'root'
})
export class PuzzleService {

  puzzleSettingsSignal = signal<PuzzleSettings | undefined>(undefined);

  setPuzzleSettings(settings: PuzzleSettings) {
    this.puzzleSettingsSignal.set(settings);
  }

  createPuzzle(settings: PuzzleSettings): Puzzle {
    const fillChance = DIFFICULTY_PERCENTAGE[settings.difficulty]

    const grid: Cell[][] = new Array(settings.size).fill(0).map(
      () => new Array(settings.size).fill(0).map(
        () => this.getCellType(fillChance)
      )
    );

    const rowNums = grid.map(this.countBlocks);
    let cols = grid[0].map((_, i) => grid.map(row => row[i]));
    const colNums = cols.map(this.countBlocks);

    console.log(rowNums);
    console.log(colNums);
    console.log(grid);
    return new Puzzle(settings.size, settings.size, settings.difficulty, grid, cols, rowNums, colNums);
  }

  countBlocks(arr: Cell[]): number[] {
    const nums: number[] = [];
    let count = 0;
    for (let elem of arr) {
      if (elem.state === CELL_STATE.FILLED) {
        count++;
      } else if (count > 0) { // TODO decide here if user needs to fill all blank boxes with an X
        nums.push(count);
        count = 0;
      }
    }

    if (count > 0) {
      nums.push(count);
    }

    return nums;
  }

  private getCellType(fillChance: number): Cell {
    return Math.random() * 100 < fillChance ? new Cell(CELL_STATE.FILLED) : new Cell(CELL_STATE.EMPTY);
  }
}
