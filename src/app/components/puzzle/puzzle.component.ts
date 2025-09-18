import {Component, effect, HostListener} from '@angular/core';
import {PuzzleService, PuzzleSettings} from '../../services/puzzleService/puzzle-service';
import {Cell, CELL_STATE, Puzzle} from '../../shared/shared';
import {NgClass} from '@angular/common';
import {ConfettiService} from '../../services/confettiService/confetti-service';
import {MatProgressBar} from '@angular/material/progress-bar';

@Component({
  selector: 'app-puzzle',
  imports: [
    NgClass,
    MatProgressBar
  ],
  templateUrl: './puzzle.component.html',
  styleUrl: './puzzle.component.scss'
})
export class PuzzleComponent {
  GRID: Cell[][] = [];
  GRID_COLUMNS: Cell[][] = [];
  SOLVED: boolean = false;
  PROGRESS: number = 0;
  PUZZLE: Puzzle | undefined;
  rowIsCompleted: boolean[] = [];
  colIsCompleted: boolean[] = [];
  protected readonly CELL_STATE = CELL_STATE;

  constructor(private puzzleService: PuzzleService, private confettiService: ConfettiService) {
    effect(() => {
      const settings: PuzzleSettings | undefined = this.puzzleService.puzzleSettingsSignal();
      if (settings) {
        this.start(settings);
      }
    });
  }

  MB_left = false;
  MB_middle = false;
  MB_right = false;

  @HostListener('document:mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (event.button === 0) this.MB_left = true;
    if (event.button === 1) this.MB_middle = true;
    if (event.button === 2) this.MB_right = true;
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if (event.button === 0) this.MB_left = false;
    if (event.button === 1) this.MB_middle = false;
    if (event.button === 2) this.MB_right = false;
  }

  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateCellSize();
  }

  start(settings: PuzzleSettings): void {
    console.log(settings);
    this.PUZZLE = this.puzzleService.createPuzzle(settings);
    this.updateCellSize()
    this.GRID = new Array(this.PUZZLE.sizeRows).fill(0).map(() => new Array(this.PUZZLE!.sizeCols).fill(0).map(() => new Cell(CELL_STATE.UNKNOWN)));
    this.GRID_COLUMNS = this.GRID[0].map((_, i) => this.GRID.map(row => row[i]));
    this.rowIsCompleted = new Array(this.PUZZLE.sizeRows).fill(false);
    this.colIsCompleted = new Array(this.PUZZLE.sizeCols).fill(false);
    this.PROGRESS = 0;
  }

  onCellUpdate(row: number, col: number): void {
    const currBlocks_rows: number[] = this.puzzleService.countBlocks(this.GRID[row]);
    const currBlocks_cols: number[] = this.puzzleService.countBlocks(this.GRID_COLUMNS[col]);

    this.rowIsCompleted[row] = this.PUZZLE!.rowNums[row].toString() === currBlocks_rows.toString();
    this.colIsCompleted[col] = this.PUZZLE!.colNums[col].toString() === currBlocks_cols.toString();

    this.updateSolvedStatus();
    this.updateProgress();
  }

  updateSolvedStatus(): void {
    const newSolvedStatus = this.rowIsCompleted.every(x => x) && this.colIsCompleted.every(x => x)
    if (newSolvedStatus && !this.SOLVED) {
      this.confettiService.celebrate();
    }
    this.SOLVED = newSolvedStatus;
  }

  updateProgress(): void {
    this.PROGRESS = Math.round((PuzzleService.countFilledFields(this.GRID) / this.PUZZLE!.totalFilledCells) * 100);
  }

  onClick(row: number, col: number, event: MouseEvent) {
    this.GRID[row][col].state = CELL_STATE.FILLED;
    this.onCellUpdate(row, col);
  }

  onAuxClick(row: number, col: number, event: MouseEvent) {
    if (event.button === 2) {
      this.GRID[row][col].state = CELL_STATE.EMPTY;
    } else {
      this.GRID[row][col].state = CELL_STATE.UNKNOWN;
    }
    this.onCellUpdate(row, col);
  }

  onMouseOver(row: number, col: number, event: MouseEvent) {
    if (this.MB_left) {
      this.GRID[row][col].state = CELL_STATE.FILLED;
    } else if (this.MB_right && this.GRID[row][col].state !== CELL_STATE.FILLED) {
      this.GRID[row][col].state = CELL_STATE.EMPTY;
    } else if (this.MB_middle) {
      this.GRID[row][col].state = CELL_STATE.UNKNOWN;
    }
    this.onCellUpdate(row, col);
  }

  private updateCellSize() {
    let verticalItems = this.PUZZLE!.sizeRows + Math.max(...this.PUZZLE!.colNums.map(x => x.length));
    const verticalCellSize = (window.innerHeight - 120 - 2 * verticalItems) / verticalItems;

    const horizontalItems = this.PUZZLE!.sizeCols + Math.max(...this.PUZZLE!.rowNums.map(x => x.length));
    const horizontalCellSize = (window.innerWidth - 100 - 2 * horizontalItems) / horizontalItems;

    const cellSize = Math.min(verticalCellSize, horizontalCellSize, 50);
    document.documentElement.style.setProperty('--cell-size', `${cellSize}px`);
  }
}
