import { inject, injectable } from 'tsyringe';
import type { ActivityRepository } from '../../../domain/repositories/activity/ActivityRepository.js';

export interface TrainingLoadDataPoint {
  date: string;
  tss: number;
  ctl: number;
  atl: number;
}

@injectable()
export class GetTrainingLoadHistory {
  constructor(@inject('ActivityRepository') private activityRepo: ActivityRepository) {}

  async execute(userId: string): Promise<TrainingLoadDataPoint[]> {
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - 55); // 55 days: 42 warm-up + 13 visible buffer

    const activities = await this.activityRepo.findByUserId(userId, {
      startDate: from.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    });

    // Build TSS-per-day map
    const tssMap: Record<string, number> = {};
    for (const act of activities) {
      const date = act.start_date.split('T')[0];
      tssMap[date] = (tssMap[date] ?? 0) + (act.tss ?? 0);
    }

    // Build 55-day array oldest → newest
    const days: { date: string; tss: number }[] = [];
    for (let i = 54; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      days.push({ date: ds, tss: tssMap[ds] ?? 0 });
    }

    // Rolling CTL (42-day EMA) and ATL (7-day EMA)
    const decayCTL = Math.exp(-1 / 42);
    const decayATL = Math.exp(-1 / 7);
    let ctl = 0;
    let atl = 0;

    const result: TrainingLoadDataPoint[] = [];

    for (const { date, tss } of days) {
      ctl = ctl * decayCTL + tss * (1 - decayCTL);
      atl = atl * decayATL + tss * (1 - decayATL);

      // Only return the last 42 days (skip the 13-day warm-up)
      const dayIndex = days.findIndex((d) => d.date === date);
      if (dayIndex >= 13) {
        result.push({
          date: date.slice(5), // MM-DD for compact x-axis labels
          tss: Math.round(tss),
          ctl: Math.round(ctl * 10) / 10,
          atl: Math.round(atl * 10) / 10,
        });
      }
    }

    return result;
  }
}
