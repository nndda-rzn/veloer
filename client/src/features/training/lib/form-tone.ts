export type FormTone = 'danger' | 'warning' | 'neutral' | 'success';

/**
 * TSB band -> tone. Tones are monotonic, so the label and the bar colour can
 * never disagree. The previous gauge had four bar colours but five labels, so a
 * TSB of 15 read "Fresh" against a yellow bar. Bands match the labels below.
 */
export function formTone(tsb: number): FormTone {
  if (tsb <= -30) return 'danger';
  if (tsb <= -10) return 'warning';
  if (tsb <= 5) return 'neutral';
  return 'success';
}

export function formLabel(tsb: number): string {
  if (tsb <= -30) return 'Very fatigued';
  if (tsb <= -10) return 'Fatigued';
  if (tsb <= 5) return 'Neutral';
  if (tsb <= 20) return 'Fresh';
  return 'Very fresh';
}
