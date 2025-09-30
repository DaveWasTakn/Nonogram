import {Injectable} from '@angular/core';
import {STATE} from '../shared/classes';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  getLocalStorageState(): STATE | undefined {
    const state = localStorage.getItem('state');
    return state !== null ? STATE.deserialize(state) : undefined;
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

  saveState(state: STATE): void {
    localStorage.setItem('state', STATE.serialize(state));
  }

}
