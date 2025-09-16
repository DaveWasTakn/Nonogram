import {Component} from '@angular/core';
import {MatFormField, MatLabel, MatOption, MatSelect} from '@angular/material/select';
import {MatToolbar} from '@angular/material/toolbar';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {PuzzleService, PuzzleSettings} from '../../services/puzzleService/puzzle-service';
import {DIFFICULTIES} from '../../shared/shared';

@Component({
  selector: 'app-header',
  imports: [
    MatToolbar,
    MatSelect,
    MatOption,
    MatSelect,
    MatOption,
    MatToolbar,
    FormsModule,
    MatFormField,
    MatLabel,
    MatButton
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  SIZE = 20;
  SIZES: number[] = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  DIFFICULTY: DIFFICULTIES = DIFFICULTIES.EASY;
  DIFFICULTIES = Object.values(DIFFICULTIES);

  constructor(private puzzleService: PuzzleService) {
  }

  start(): void {
    this.puzzleService.setPuzzleSettings({size: this.SIZE, difficulty: this.DIFFICULTY} as PuzzleSettings);
  }

}

