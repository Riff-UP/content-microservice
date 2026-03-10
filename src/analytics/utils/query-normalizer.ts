export function normalizeQueryText(value: string | null | undefined): string {
  return (value ?? '')
    .replace(/--.*$/gm, ' ')
    .replace(/\s+/g, ' ')
    .replace(/;+$/g, '')
    .trim()
    .toLowerCase();
}
