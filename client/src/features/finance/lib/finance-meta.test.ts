import { describe, expect, it } from 'vitest';
import { CATEGORY_LABELS, CATEGORY_TOKEN } from './finance-meta';
import type { Transaction } from '../types/finance';

const CATEGORIES: Transaction['category'][] = [
  'gear',
  'maintenance',
  'event',
  'nutrition',
  'other',
];

const VALID_TOKENS = ['primary', 'danger', 'atl', 'success', 'warning'];

describe('finance-meta', () => {
  it('labels every transaction category', () => {
    for (const category of CATEGORIES) {
      expect(CATEGORY_LABELS[category]).toBeTruthy();
    }
    expect(Object.keys(CATEGORY_LABELS)).toHaveLength(CATEGORIES.length);
  });

  it('maps every category to a colour token that useChartColors exposes', () => {
    for (const category of CATEGORIES) {
      expect(VALID_TOKENS).toContain(CATEGORY_TOKEN[category]);
    }
  });
});
