import {Component, effect, HostListener, OnInit} from '@angular/core';
import {PuzzleService, PuzzleSettings} from '../../services/puzzleService/puzzle-service';
import {Cell, CELL_STATE, DIRECTION, Pos, Puzzle, STATE} from '../../shared/shared';
import {NgClass} from '@angular/common';
import {ConfettiService} from '../../services/confettiService/confetti-service';
import {MatProgressBar} from '@angular/material/progress-bar';
import {BreakpointObserver} from '@angular/cdk/layout';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {FormsModule} from '@angular/forms';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';

@Component({
  selector: 'app-puzzle',
  imports: [
    NgClass,
    MatProgressBar,
    MatButtonToggleModule,
    FormsModule,
    MatIcon,
    MatIconButton
  ],
  templateUrl: './puzzle.component.html',
  styleUrl: './puzzle.component.scss'
})
export class PuzzleComponent implements OnInit {
  protected readonly CELL_STATE = CELL_STATE;

  GRID: Cell[][] = [];
  GRID_COLUMNS: Cell[][] = [];
  SOLVED: boolean = false;
  PROGRESS: number = 0;
  PUZZLE: Puzzle | undefined;
  COMPLETED_ROWS: boolean[] = [];
  COMPLETED_COLS: boolean[] = [];

  HISTORY: STATE[] = [];
  FUTURE: STATE[] = [];

  TOUCH_MODE: CELL_STATE = CELL_STATE.FILLED;
  IS_MOBILE: boolean = false;

  private currentMouseDownCell: Pos | undefined;
  private currentMouseOverCells: Pos[] = [];
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

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  MB_left: boolean = false;
  MB_middle: boolean = false;
  MB_right: boolean = false;

  @HostListener('document:mousedown', ['$event'])
  onMouseDownListener(event: MouseEvent): void {
    if (event.button === 0) this.MB_left = true;
    if (event.button === 1) this.MB_middle = true;
    if (event.button === 2) this.MB_right = true;
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUpListener(event: MouseEvent): void {
    if (event.button === 0) this.MB_left = false;
    if (event.button === 1) this.MB_middle = false;
    if (event.button === 2) this.MB_right = false;
    this.currentMouseDownCell = undefined;
    this.currentMouseOverCells = [];
  }

  @HostListener('document:contextmenu', ['$event'])
  onRightClickListener(event: MouseEvent): void {
    event.preventDefault();
  }

  @HostListener('window:resize')
  onResizeListener(): void {
    if (this.PUZZLE) {
      this.updateCellSize();
    }
  }

  @HostListener('window:orientationchange')
  onOrientationChangeListener(): void {
    this.onResizeListener()
  }

  @HostListener('window:keydown.control.z', ['$event'])
  onKeyDownCtrlZListener(event: Event): void {
    this.onUndo();
  }

  @HostListener('window:keydown.control.y', ['$event'])
  onKeyDownCtrlYListener(event: Event): void {
    this.onRedo();
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ngOnInit(): void {
    const state = this.getLocalStorageState();
    if (state) {
      this.loadState(state);
    }
  }

  start(settings: PuzzleSettings): void {
    this.PUZZLE = this.puzzleService.createPuzzle(settings);
    this.updateCellSize()
    this.GRID = new Array(this.PUZZLE.sizeRows).fill(0).map(() => new Array(this.PUZZLE!.sizeCols).fill(0).map(() => new Cell(CELL_STATE.UNKNOWN)));
    this.GRID_COLUMNS = this.GRID[0].map((_, i) => this.GRID.map(row => row[i]));
    this.COMPLETED_ROWS = new Array(this.PUZZLE.sizeRows).fill(false);
    this.COMPLETED_COLS = new Array(this.PUZZLE.sizeCols).fill(false);
    this.PROGRESS = 0;
    this.HISTORY = [];
    this.FUTURE = [];
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  updateCompletedRows(row: number): void {
    const currBlocks_rows: number[] = this.puzzleService.countBlocks(this.GRID[row]);
    this.COMPLETED_ROWS[row] = this.PUZZLE!.rowNums[row].toString() === currBlocks_rows.toString();
  }

  updateCompletedCols(col: number): void {
    const currBlocks_cols: number[] = this.puzzleService.countBlocks(this.GRID_COLUMNS[col]);
    this.COMPLETED_COLS[col] = this.PUZZLE!.colNums[col].toString() === currBlocks_cols.toString();
  }

  updateSolvedStatus(): void {
    const currentSolvedStatus = this.COMPLETED_ROWS.every(x => x) && this.COMPLETED_COLS.every(x => x)
    if (currentSolvedStatus) {
      this.confettiService.celebrate();
      this.SOLVED = currentSolvedStatus;
      this.increaseStreak();
    }
  }

  increaseStreak() {
    let streak: number = this.readStreak();
    let lastSolvedDate = this.readLastSolvedDate()
    let dateNow = new Date();
    if (!lastSolvedDate || (lastSolvedDate.getDate() + 1) === dateNow.getDate()) {
      streak++;
    }
    this.writeStreak(streak);
    this.writeLastSolvedDate(dateNow);
  }

  readLastSolvedDate() {
    const s = localStorage.getItem('lastSolvedDate');
    if (!s) return null;
    return new Date(s);
  }

  writeLastSolvedDate(date: Date) {
    localStorage.setItem('lastSolvedDate', date.toString());
  }

  readStreak(): number {
    const s = localStorage.getItem('streak');
    if (!s) return 0;
    return Number(s);
  }

  writeStreak(streak: number): void {
    localStorage.setItem('streak', String(streak));
  }

  updateProgress(): void {
    this.PROGRESS = Math.round((PuzzleService.countFilledFields(this.GRID) / this.PUZZLE!.totalFilledCells) * 100);
  }

  onMouseDown(row: number, col: number, event: MouseEvent): void {
    this.currentMouseDownCell = new Pos(row, col);
  }

  onMouseUp(row: number, col: number, event: MouseEvent): void {
    if (
      event.button === 0
      && this.currentMouseDownCell && this.currentMouseDownCell.row === row && this.currentMouseDownCell.col === col
      && (this.currentMouseOverCells.length === 0 || !(this.currentMouseOverCells[0].row === row && this.currentMouseOverCells[0].col === col))
    ) {
      this.cg(row, col, (this.GRID[row][col].state + 2) % (Object.keys(CELL_STATE).length / 2));
    }

    if (this.currentMouseDownCell && this.currentMouseDownCell.row === row && this.currentMouseDownCell.col === col && this.currentMouseOverCells.length <= 1) {
      if (event.button === 2) {
        this.cg(row, col, CELL_STATE.EMPTY);
      } else if (event.button === 1) {
        this.cg(row, col, CELL_STATE.UNKNOWN);
      }
    }
  }

  onMouseOver(row: number, col: number, event: MouseEvent): void {
    if (this.MB_left) {
      this.currentMouseOverCells.push(new Pos(row, col));
      this.cg(row, col, CELL_STATE.FILLED);
    } else if (this.MB_right) {
      this.currentMouseOverCells.push(new Pos(row, col));
      this.cg(row, col, CELL_STATE.EMPTY);
    } else if (this.MB_middle) {
      this.cg(row, col, CELL_STATE.UNKNOWN);
      this.currentMouseOverCells.push(new Pos(row, col));
    }
  }

  onTouchStart(event: TouchEvent): void {
    const pos: Pos | undefined = this.determineCellFromTouch(event);
    if (pos) {
      this.TOUCH_initial_cell = pos;
      this.TOUCH_initial_cell_state = this.GRID[pos.row][pos.col].state;
      this.onTouchMove(event);
    }
  }

  onTouchMove(event: TouchEvent): void {
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
        this.cg(pos.row, pos.col, cell.state !== this.TOUCH_MODE ? this.TOUCH_MODE : CELL_STATE.UNKNOWN);
        this.TOUCH_changed_cells.push(pos);
      }
    }
  }

  onTouchEnd(event: TouchEvent): void {
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

  private updateCellSize(): void {
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

  onTouchModeToggle(): void {
    this.TOUCH_MODE = this.TOUCH_MODE === CELL_STATE.FILLED ? CELL_STATE.EMPTY : CELL_STATE.FILLED;
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // wrapper for changing grid cells
  private cg(row: number, col: number, state: CELL_STATE): void {
    if (state !== this.GRID[row][col].state) {
      this.GRID[row][col].state = state;
      this.onCellUpdate(row, col);
    }
  }

  onCellUpdate(row: number, col: number): void {
    this.FUTURE = [];
    this.updateCompletedRows(row);
    this.updateCompletedCols(col);
    this.updateSolvedStatus();
    this.updateProgress();
    this.saveState();
  }

  saveState(): void {
    const state = new STATE(structuredClone(this.PUZZLE), structuredClone(this.GRID));
    this.HISTORY.push(state);
    localStorage.setItem('state', STATE.serialize(state));
  }

  getLocalStorageState(): STATE | undefined {
    const state = localStorage.getItem('state');
    return state !== null ? STATE.deserialize(state) : undefined;
  }

  loadState(state: STATE, keepHistory: boolean = false): void {
    this.PUZZLE = state.PUZZLE;
    this.GRID = state.GRID;
    this.GRID_COLUMNS = this.GRID[0].map((_, i) => this.GRID.map(row => row[i]));
    this.COMPLETED_ROWS = new Array(this.PUZZLE!.sizeRows).fill(false);
    this.COMPLETED_COLS = new Array(this.PUZZLE!.sizeCols).fill(false);
    [...Array(this.PUZZLE!.sizeRows).keys()].forEach(row => this.updateCompletedRows(row));
    [...Array(this.PUZZLE!.sizeCols).keys()].forEach(col => this.updateCompletedCols(col));
    if (!keepHistory) {
      this.HISTORY = [];
      this.FUTURE = [];
    }
    this.saveState();
    this.updateProgress();
    this.updateCellSize()
  }

  onUndo(): void {
    if (this.HISTORY.length > 1) {
      const currState = this.HISTORY.pop();
      const prevState = this.HISTORY.pop();
      if (currState !== undefined && prevState !== undefined) {
        this.loadState(prevState, true);
        this.FUTURE.push(currState);
      }
    }
  }

  onRedo(): void {
    if (this.FUTURE.length > 0) {
      const nextState = this.FUTURE.pop();
      if (nextState !== undefined) {
        this.loadState(nextState, true);
      }
    }
  }
}
