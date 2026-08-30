export function localDateKey(date: Date): string {
  const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
export function monthRange(month: Date): { from: string; to: string } {
  return { from: localDateKey(new Date(month.getFullYear(), month.getMonth(), 1)), to: localDateKey(new Date(month.getFullYear(), month.getMonth() + 1, 0)) };
}
export function addMonths(date: Date, amount: number): Date { return new Date(date.getFullYear(), date.getMonth() + amount, 1); }
export function calendarDays(month: Date): Array<{ date: Date; currentMonth: boolean }> {
  const first = new Date(month.getFullYear(), month.getMonth(), 1); const start = new Date(first); start.setDate(1 - first.getDay());
  return Array.from({ length: 42 }, (_, index) => { const date = new Date(start); date.setDate(start.getDate() + index); return { date, currentMonth: date.getMonth() === month.getMonth() }; });
}
export function displayWorkDate(value: string): string { const [y, m, d] = value.split('-').map(Number); return new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium' }).format(new Date(y!, m! - 1, d)); }
