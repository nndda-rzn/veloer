export interface StrengthTssInput {
  moving_time: number;
  avg_hr: number | null;
  max_hr: number | null;
  lthr: number | null;
}

/**
 * hrTSS for a strength session. Strength has no power, so load can only come
 * from heart rate; when there is none we return null rather than guessing.
 *
 * Formula matches the cycling hrTSS fallback: tss = hours * hrIF^2 * 100,
 * with effectiveLthr = stored LTHR, else 88% of max HR.
 */
export function computeStrengthTss(input: StrengthTssInput): number | null {
  const { moving_time, avg_hr, max_hr, lthr } = input;
  if (!avg_hr || moving_time <= 0) return null;
  const effectiveLthr = lthr ?? (max_hr ? Math.round(max_hr * 0.88) : null);
  if (!effectiveLthr || effectiveLthr <= 0) return null;
  const hrIf = avg_hr / effectiveLthr;
  return (moving_time / 3600) * hrIf * hrIf * 100;
}
