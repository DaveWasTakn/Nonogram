import {Component, effect} from '@angular/core';
import {PuzzleService, PuzzleSettings} from '../../services/puzzleService/puzzle-service';

@Component({
  selector: 'app-puzzle',
  imports: [],
  templateUrl: './puzzle.html',
  styleUrl: './puzzle.scss'
})
export class Puzzle {

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
  }

}
