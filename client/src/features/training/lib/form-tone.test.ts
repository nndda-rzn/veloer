import { describe, expect, it } from 'vitest';
import { formLabel, formTone } from './form-tone';

describe('formTone / formLabel', () => {
  it('marks a very negative TSB as danger', () => {
    expect(formTone(-31)).toBe('danger');
    expect(formLabel(-31)).toBe('Very fatigued');
  });

  it('marks -30 as danger (boundary is inclusive)', () => {
    expect(formTone(-30)).toBe('danger');
  });

  it('marks just above -10 up to 5 as neutral', () => {
    expect(formTone(-9)).toBe('neutral');
    expect(formTone(0)).toBe('neutral');
    expect(formTone(5)).toBe('neutral');
  });

  it('marks a positive TSB as success', () => {
    expect(formTone(21)).toBe('success');
    expect(formLabel(21)).toBe('Very fresh');
  });

  it('uses a monotonic tone so label and colour never disagree', () => {
    expect(formLabel(-20)).toBe('Fatigued');
    expect(formTone(-20)).toBe('warning');
    expect(formLabel(10)).toBe('Fresh');
    expect(formTone(10)).toBe('success');
    // The old bug: TSB 15 read "Fresh" against a yellow bar.
    expect(formLabel(15)).toBe('Fresh');
    expect(formTone(15)).toBe('success');
  });
});
