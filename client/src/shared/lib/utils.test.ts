import { afterEach, describe, expect, it } from 'vitest';
import { formatDistance } from './utils';
import { configureFormatting, resetFormatting } from './format-prefs';

describe('formatDistance', () => {
  afterEach(() => resetFormatting());

  it('returns an en dash when the distance is null (a strength session)', () => {
    // A strength session has no distance. Rendering "0.0 km" would state a
    // fact that is not true, so the formatter must show "no value" instead.
    expect(formatDistance(null)).toBe('–');
  });

  it('returns an en dash when the distance is undefined', () => {
    expect(formatDistance(undefined)).toBe('–');
  });

  it('formats a real distance in km', () => {
    expect(formatDistance(10000)).toBe('10.0 km');
  });

  it('formats a real distance in miles when imperial is selected', () => {
    configureFormatting({ units: 'imperial' });
    expect(formatDistance(1609.344)).toBe('1.0 mi');
  });

  it('formats a zero distance as 0.0 km (zero is a real value, not missing)', () => {
    expect(formatDistance(0)).toBe('0.0 km');
  });
});
