import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { activityApi } from '../api/activity.api';
import type { ActivityZone } from '../types/activity';
import { formatDuration } from '@/shared/lib/utils';

interface ZoneChartProps {
  activityId: string;
}

const zoneColors = ['#3b82f6', '#10b981', '#eab308', '#f97316', '#dc2626', '#8b5cf6', '#ec4899'];

const hrZoneNames = ['Z1 Recovery', 'Z2 Endurance', 'Z3 Tempo', 'Z4 Threshold', 'Z5 VO2 Max'];
const powerZoneNames = [
  'Z1 Active Recovery',
  'Z2 Endurance',
  'Z3 Tempo',
  'Z4 Lactate',
  'Z5 VO2 Max',
  'Z6 Anaerobic',
  'Z7 Sprint',
];

export function ZoneChart({ activityId }: ZoneChartProps) {
  const [zones, setZones] = useState<ActivityZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    activityApi
      .getZones(activityId)
      .then(setZones)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [activityId]);

  if (loading) {
    return <div className="h-48 animate-pulse rounded-xl bg-secondary" />;
  }

  if (error || zones.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-center">
        <p className="text-sm text-muted-foreground">Zone data not available.</p>
      </div>
    );
  }

  const renderChart = (zone: ActivityZone, index: number) => {
    const names = zone.sensor_type === 'heartrate' ? hrZoneNames : powerZoneNames;
    const data = zone.distribution_buckets.map((b, i) => ({
      name: names[i] || `Z${i + 1}`,
      time: b.time,
    }));

    return (
      <div key={index} className="rounded-xl border border-border bg-card p-4">
        <h4 className="mb-2 text-base font-semibold capitalize text-foreground">
          {zone.sensor_type === 'heartrate' ? 'Heart Rate Zones' : 'Power Zones'}
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#78716c' }}
              angle={-20}
              textAnchor="end"
              height={50}
            />
            <YAxis
              tickFormatter={(v) => formatDuration(v)}
              tick={{ fontSize: 10, fill: '#78716c' }}
            />
            <Tooltip formatter={(v) => formatDuration(Number(v))} />
            <Bar dataKey="time" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={zoneColors[i % zoneColors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return <div className="space-y-3">{zones.map(renderChart)}</div>;
}
