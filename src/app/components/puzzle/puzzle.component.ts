import {Component, effect} from '@angular/core';
import {PuzzleService, PuzzleSettings} from '../../services/puzzleService/puzzle-service';
import {CELL_STATE, Puzzle} from '../../shared/shared';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-puzzle',
  imports: [
    NgClass
  ],
  templateUrl: './puzzle.component.html',
  styleUrl: './puzzle.component.scss'
})
export class PuzzleComponent {
  // GRID: CELL_STATE[][] = [];
  PUZZLE: Puzzle | undefined;

  constructor(private puzzleService: PuzzleService) {
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

    // this.GRID = puzzle.rows;
  }

}
