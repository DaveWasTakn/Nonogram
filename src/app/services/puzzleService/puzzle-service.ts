import {Injectable, signal} from '@angular/core';

import {Cell, CELL_STATE, DIFFICULTY, DIFFICULTY_PERCENTAGE, Puzzle} from '../../shared/shared';

export interface PuzzleSettings {
  size: number;
  difficulty: DIFFICULTY;
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
    const cols = grid[0].map((_, i) => grid.map(row => row[i]));

    grid.forEach(this.ensureAtLeastOneFilled);
    cols.forEach(this.ensureAtLeastOneFilled);

    grid.forEach(x => this.enforceMaxContiguousBlocks(x, settings.difficulty));
    cols.forEach(x => this.enforceMaxContiguousBlocks(x, settings.difficulty));

    // TODO check solvability ...

    const rowNums = grid.map(this.countBlocks);
    const colNums = cols.map(this.countBlocks);

    return new Puzzle(settings.size, settings.size, settings.difficulty, grid, cols, rowNums, colNums, PuzzleService.countFilledFields(grid));
  }

  static countFilledFields(grid: Cell[][]): number {
    return grid.flat().filter(cell => cell.state === CELL_STATE.FILLED).length;
  }

  ensureAtLeastOneFilled(arr: Cell[]): void {
    if (!arr.some(cell => cell.state === CELL_STATE.FILLED)) {
      const randomIndex = Math.floor(Math.random() * arr.length);
      arr[randomIndex] = new Cell(CELL_STATE.FILLED);
    }
  }

  enforceMaxContiguousBlocks(arr: Cell[], difficulty: DIFFICULTY): void {  // TODO filling needs to be called in a loop ig; bcs eg. filling blanks for one row can introduce another block for a column
    const difficultyBlocksLength = difficulty === DIFFICULTY.EASY ? 0 : difficulty === DIFFICULTY.MEDIUM ? 1 : 2;
    let blocks = this.countBlocks(arr);
    let diff = blocks.length - (Math.floor(arr.length / 5) + difficultyBlocksLength);
    let skip = true;
    let emptyIndices = arr.map((cell, i) => {
      if (skip) {
        if (cell.state === CELL_STATE.FILLED) {
          skip = false;
        }
        return undefined;
      }
      return cell.state === CELL_STATE.EMPTY ? i : undefined
    }).filter(x => x !== undefined);

    while (diff > 0) {
      arr[emptyIndices[0]].state = CELL_STATE.FILLED;

      blocks = this.countBlocks(arr);
      diff = blocks.length - (Math.floor(arr.length / 5) + difficultyBlocksLength);
      emptyIndices = emptyIndices.slice(1);
    }
  }

  countBlocks(arr: Cell[]): number[] {
    const nums: number[] = [];
    let count = 0;
    for (let elem of arr) {
      if (elem.state === CELL_STATE.FILLED) {
        count++;
      } else if (count > 0) {
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
