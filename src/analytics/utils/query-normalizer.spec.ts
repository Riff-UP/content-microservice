import { normalizeQueryText } from './query-normalizer';

describe('normalizeQueryText', () => {
  it('normaliza espacios, comentarios y punto y coma final', () => {
    expect(
      normalizeQueryText(
        `SELECT  *   FROM analytics.benchmark_posts -- comment\nWHERE id = $1;`,
      ),
    ).toBe('select * from analytics.benchmark_posts where id = $1');
  });

  it('tolera valores vacíos', () => {
    expect(normalizeQueryText(undefined)).toBe('');
    expect(normalizeQueryText(null)).toBe('');
  });
});
