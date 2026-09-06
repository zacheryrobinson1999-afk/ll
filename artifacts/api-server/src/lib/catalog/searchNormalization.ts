export function normalizeSearch(value: string): string {
  return value.toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}
export function compactSearch(value: string): string {
  return normalizeSearch(value).replace(/\s+/g, '');
}
