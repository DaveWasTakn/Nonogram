import {Pos} from './classes';
import {StorageService} from '../services/storage-service';

export function diffDays(date1: Date, date2: Date) {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.abs(Math.floor((d2.getTime() - d1.getTime()) / msPerDay));
}

export function determineCellFromTouch(event: TouchEvent): Pos | undefined {
  const touch = event.touches[0];
  const target: Element | null = document.elementFromPoint(touch.clientX, touch.clientY);

  if (target && target.classList.contains('cell')) {
    const row: string | null = target.getAttribute('data-row');
    const col: string | null = target.getAttribute('data-col');
    return row !== null && col !== null ? new Pos(+row, +col) : undefined;
  }

  return undefined;
}

export function checkStreak() {
  let lastSolvedDate = StorageService.readLastSolvedDate()
  let dateNow = new Date();
  if (lastSolvedDate && diffDays(lastSolvedDate, dateNow) > 1) {
    StorageService.writeStreak(0);
  }
}

export function increaseStreak() {
  let streak: number = StorageService.readStreak();
  const lastSolvedDate = StorageService.readLastSolvedDate()
  const dateNow = new Date();
  if (!lastSolvedDate) {
    streak = 1;
  } else {
    const diff = diffDays(lastSolvedDate, dateNow);
    if (diff > 1) {
      streak = 1;
    } else if (diff === 1) {
      streak++;
    }
  }
  StorageService.writeStreak(streak);
  StorageService.writeLastSolvedDate(dateNow);
}
