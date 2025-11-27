import {ChangeDetectorRef, Component, effect} from '@angular/core';
import {MatFormField, MatLabel, MatOption, MatSelect} from '@angular/material/select';
import {MatToolbar} from '@angular/material/toolbar';
import {FormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {PuzzleService, PuzzleSettings} from '../../services/puzzle-service';
import {DIFFICULTY} from '../../shared/classes';
import {BreakpointObserver} from '@angular/cdk/layout';
import {StorageService} from '../../services/storage-service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    MatButton,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  SIZE = 15;
  SIZES: number[] = [5, 10, 15, 20, 25, 30, 40];

  DIFFICULTY: DIFFICULTY = DIFFICULTY.EASY;
  DIFFICULTIES = Object.values(DIFFICULTY);
  IS_MOBILE: boolean = false;

  constructor(private puzzleService: PuzzleService, private breakpointObserver: BreakpointObserver, private cdr: ChangeDetectorRef) {
    this.breakpointObserver.observe(['(max-width: 600px)']).subscribe(result => {
      this.IS_MOBILE = result.matches;
    });

    effect(() => {
      const settings: PuzzleSettings | undefined = this.puzzleService.puzzleSettingsSignal_reverse();
      if (settings) {
        this.DIFFICULTY = settings.difficulty;
        this.SIZE = settings.size;
        this.cdr.detectChanges();
      }
    });
  }

  start(): void {
    this.puzzleService.setPuzzleSettings({size: this.SIZE, difficulty: this.DIFFICULTY} as PuzzleSettings);
  }

  getCurrentStreak(): number {
    return StorageService.readStreak();
  }

  getTotalSolved(): number {
    return StorageService.readTotalSolved();
  }
}

