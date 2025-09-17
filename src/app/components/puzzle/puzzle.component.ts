import {Component, effect} from '@angular/core';
import {PuzzleService, PuzzleSettings} from '../../services/puzzleService/puzzle-service';
import {Cell, CELL_STATE, Puzzle} from '../../shared/shared';
import {NgClass} from '@angular/common';
import {ConfettiService} from '../../services/confettiService/confetti-service';

@Component({
  selector: 'app-puzzle',
  imports: [
    NgClass
  ],
  templateUrl: './puzzle.component.html',
  styleUrl: './puzzle.component.scss'
})
export class PuzzleComponent {
  GRID: Cell[][] = [];
  GRID_COLUMNS: Cell[][] = [];
  SOLVED: boolean = false;
  PUZZLE: Puzzle | undefined;
  rowIsCompleted: boolean[] = [];
  colIsCompleted: boolean[] = [];

  constructor(private puzzleService: PuzzleService, private confettiService: ConfettiService) {
    effect(() => {
      const settings: PuzzleSettings | undefined = this.puzzleService.puzzleSettingsSignal();
      if (settings) {
        this.start(settings);
      }
    });
  }

  start(settings: PuzzleSettings): void {
    console.log(settings);
    this.PUZZLE = this.puzzleService.createPuzzle(settings);
    this.GRID = new Array(this.PUZZLE.sizeRows).fill(0).map(() => new Array(this.PUZZLE!.sizeCols).fill(0).map(() => new Cell(CELL_STATE.UNKNOWN)));
    this.GRID_COLUMNS = this.GRID[0].map((_, i) => this.GRID.map(row => row[i]));
    this.rowIsCompleted = new Array(this.PUZZLE.sizeRows).fill(false);
    this.colIsCompleted = new Array(this.PUZZLE.sizeCols).fill(false);
  }

  onCellUpdate(row: number, col: number): void {
    const currBlocks_rows: number[] = this.puzzleService.countBlocks(this.GRID[row]);
    const currBlocks_cols: number[] = this.puzzleService.countBlocks(this.GRID_COLUMNS[col]);

    this.rowIsCompleted[row] = this.PUZZLE!.rowNums[row].toString() === currBlocks_rows.toString();
    this.colIsCompleted[col] = this.PUZZLE!.colNums[col].toString() == currBlocks_cols.toString();

    this.updateSolvedStatus();
  }

  updateSolvedStatus(): void {
    this.SOLVED = this.rowIsCompleted.every(x => x) && this.colIsCompleted.every(x => x)
    if (this.SOLVED) {
      this.confettiService.celebrate();
    }
  }

  protected readonly CELL_STATE = CELL_STATE;

  onClick(row: number, col: number) {
    this.GRID[row][col].state = (this.GRID[row][col].state + 2) % (Object.keys(CELL_STATE).length / 2);

    this.onCellUpdate(row, col);
  }

  onAuxClick(row: number, col: number) {

  }
}
