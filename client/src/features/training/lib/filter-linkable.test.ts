import { describe, expect, it } from 'vitest';
import { filterLinkable } from './filter-linkable';

const rows = [
  { id: 'r1', discipline: 'cycling' },
  { id: 's1', discipline: 'strength' },
  { id: 'legacy' }, // pre-PR row, no discipline
];

describe('filterLinkable', () => {
  it('offers only strength activities to a strength workout', () => {
    expect(filterLinkable(rows, true).map((r) => r.id)).toEqual(['s1']);
  });

  it('offers rides (and pre-PR rows) to a cycling workout', () => {
    expect(filterLinkable(rows, false).map((r) => r.id)).toEqual(['r1', 'legacy']);
  });
});
