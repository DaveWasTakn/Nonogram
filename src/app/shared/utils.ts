import {Pos} from './classes';

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
