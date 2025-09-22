import {Component, effect, HostListener} from '@angular/core';
import {PuzzleService, PuzzleSettings} from '../../services/puzzleService/puzzle-service';
import {Cell, CELL_STATE, DIRECTION, Pos, Puzzle} from '../../shared/shared';
import {NgClass} from '@angular/common';
import {ConfettiService} from '../../services/confettiService/confetti-service';
import {MatProgressBar} from '@angular/material/progress-bar';
import {BreakpointObserver} from '@angular/cdk/layout';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {FormsModule} from '@angular/forms';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-puzzle',
  imports: [
    NgClass,
    MatProgressBar,
    MatButtonToggleModule,
    FormsModule,
    MatIcon
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
  TOUCH_MODE: CELL_STATE = CELL_STATE.FILLED;

  protected readonly CELL_STATE = CELL_STATE;
  private currentMouseDownCell: Pos | undefined;
  private currentMouseOverCells: Pos[] = [];
  private IS_MOBILE: boolean = false;
  private TOUCH_initial_cell: Pos | undefined;
  private TOUCH_changed_cells: Pos[] = [];
  private TOUCH_initial_cell_state: CELL_STATE | undefined;
  private TOUCH_DIRECTION: DIRECTION | undefined;

  constructor(private puzzleService: PuzzleService, private confettiService: ConfettiService, private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver.observe(['(max-width: 600px)']).subscribe(result => {
      this.IS_MOBILE = result.matches;
    });

    effect(() => {
      const settings: PuzzleSettings | undefined = this.puzzleService.puzzleSettingsSignal();
      if (settings) {
        this.start(settings);
      }
    });
  }

  MB_left: boolean = false;
  MB_middle: boolean = false;
  MB_right: boolean = false;

  @HostListener('document:mousedown', ['$event'])
  onMouseDownGlobal(event: MouseEvent) {
    if (event.button === 0) this.MB_left = true;
    if (event.button === 1) this.MB_middle = true;
    if (event.button === 2) this.MB_right = true;
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUpGlobal(event: MouseEvent) {
    if (event.button === 0) this.MB_left = false;
    if (event.button === 1) this.MB_middle = false;
    if (event.button === 2) this.MB_right = false;
    this.currentMouseDownCell = undefined;
    this.currentMouseOverCells = [];
  }

  @HostListener('document:contextmenu', ['$event'])
  onRightClickGlobal(event: MouseEvent) {
    event.preventDefault();
  }

  @HostListener('window:resize')
  onResizeGlobal() {
    if (this.PUZZLE) {
      this.updateCellSize();
    }
  }

  start(settings: PuzzleSettings): void {
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

  onMouseDown(row: number, col: number, event: MouseEvent) {
    this.currentMouseDownCell = new Pos(row, col);
  }

  onMouseUp(row: number, col: number, event: MouseEvent) {
    if (
      event.button === 0
      && this.currentMouseDownCell && this.currentMouseDownCell.row === row && this.currentMouseDownCell.col === col
      && (this.currentMouseOverCells.length === 0 || !(this.currentMouseOverCells[0].row === row && this.currentMouseOverCells[0].col === col))
    ) {
      this.GRID[row][col].state = (this.GRID[row][col].state + 2) % (Object.keys(CELL_STATE).length / 2);
      this.onCellUpdate(row, col);
    }

    if (this.currentMouseDownCell && this.currentMouseDownCell.row === row && this.currentMouseDownCell.col === col && this.currentMouseOverCells.length <= 1) {
      if (event.button === 2) {
        this.GRID[row][col].state = CELL_STATE.EMPTY;
        this.onCellUpdate(row, col);
      } else if (event.button === 1) {
        this.GRID[row][col].state = CELL_STATE.UNKNOWN;
        this.onCellUpdate(row, col);
      }
    }
  }

  onMouseOver(row: number, col: number, event: MouseEvent) {
    if (this.MB_left) {
      this.currentMouseOverCells.push(new Pos(row, col));
      this.GRID[row][col].state = CELL_STATE.FILLED;
      this.onCellUpdate(row, col);
    } else if (this.MB_right) {
      this.currentMouseOverCells.push(new Pos(row, col));
      this.GRID[row][col].state = CELL_STATE.EMPTY;
      this.onCellUpdate(row, col);
    } else if (this.MB_middle) {
      this.GRID[row][col].state = CELL_STATE.UNKNOWN;
      this.onCellUpdate(row, col);
      this.currentMouseOverCells.push(new Pos(row, col));
    }
  }

  onTouchStart(event: TouchEvent) {
    const pos: Pos | undefined = this.determineCellFromTouch(event);
    if (pos) {
      this.TOUCH_initial_cell = pos;
      this.TOUCH_initial_cell_state = this.GRID[pos.row][pos.col].state;
      this.onTouchMove(event);
    }
  }

  onTouchMove(event: TouchEvent) {
    event.preventDefault(); // stop scrolling
    const pos: Pos | undefined = this.determineCellFromTouch(event);
    if (pos && !this.TOUCH_changed_cells.some(p => p.row === pos.row && p.col === pos.col)) {
      if (this.TOUCH_changed_cells.length >= 1 && this.TOUCH_DIRECTION === undefined) {
        const rowDiff = Math.abs(this.TOUCH_initial_cell!.row - pos.row);
        const colDiff = Math.abs(this.TOUCH_initial_cell!.col - pos.col);
        this.TOUCH_DIRECTION = rowDiff > colDiff ? DIRECTION.HORIZONTAL : DIRECTION.VERTICAL;
      }
      if (this.TOUCH_DIRECTION === DIRECTION.HORIZONTAL) {
        pos.col = this.TOUCH_initial_cell!.col;
      } else if (this.TOUCH_DIRECTION === DIRECTION.VERTICAL) {
        pos.row = this.TOUCH_initial_cell!.row;
      }
      const cell = this.GRID[pos.row][pos.col];
      if (cell.state === this.TOUCH_initial_cell_state) {
        cell.state = cell.state !== this.TOUCH_MODE ? this.TOUCH_MODE : CELL_STATE.UNKNOWN;
        this.TOUCH_changed_cells.push(pos);
        this.onCellUpdate(pos.row, pos.col);
      }
    }
  }

  onTouchEnd(event: TouchEvent) {
    this.TOUCH_changed_cells = [];
    this.TOUCH_initial_cell = undefined;
    this.TOUCH_initial_cell_state = undefined;
    this.TOUCH_DIRECTION = undefined;
  }

  private determineCellFromTouch(event: TouchEvent): Pos | undefined {
    const touch = event.touches[0];
    const target: Element | null = document.elementFromPoint(touch.clientX, touch.clientY);

    if (target && target.classList.contains('cell')) {
      const row: string | null = target.getAttribute('data-row');
      const col: string | null = target.getAttribute('data-col');
      return row !== null && col !== null ? new Pos(+row, +col) : undefined;
    }

    return undefined;
  }

  private updateCellSize() {
    let verticalItems = this.PUZZLE!.sizeRows + Math.max(...this.PUZZLE!.colNums.map(x => x.length));
    const horizontalItems = this.PUZZLE!.sizeCols + Math.max(...this.PUZZLE!.rowNums.map(x => x.length));

    let cellGap = 2;

    if (this.IS_MOBILE) {
      cellGap = 0;
    }

    const verticalCellSize = (window.innerHeight - 120 - cellGap * verticalItems) / verticalItems;
    const horizontalCellSize = (window.innerWidth - 10 - cellGap * horizontalItems) / horizontalItems;

    const cellSize = Math.min(verticalCellSize, horizontalCellSize, 30);
    document.documentElement.style.setProperty('--cell-size', `${cellSize}px`);
  }
}
