import {Injectable, signal} from '@angular/core';
import {DIFFICULTIES} from '../../components/header/header';

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

}
