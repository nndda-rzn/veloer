export interface Activity {
  id: string;
  user_id: string;
  strava_id: number | null;
  name: string;
  type: string;
  start_date: string;
  distance: number; // meters
  moving_time: number; // seconds
  elapsed_time: number; // seconds
  total_elevation_gain: number | null; // meters
  avg_speed: number | null; // m/s
  max_speed: number | null; // m/s
  avg_hr: number | null; // bpm
  max_hr: number | null; // bpm
  polyline: string | null;
  bike_id: string | null;
  avg_cadence: number | null; // RPM
  max_cadence: number | null; // RPM
  avg_watts: number | null; // watts
  max_watts: number | null; // watts
  weighted_avg_watts: number | null; // normalized power
  kilojoules: number | null; // energy
  device_watts: boolean; // true = power meter, false = estimated
  avg_temp: number | null; // celsius
  calories: number | null; // kcal
  elev_high: number | null; // meters
  elev_low: number | null; // meters
  tss: number | null; // Training Stress Score (computed from NP, moving_time, FTP)
  created_at: string;
  updated_at: string;
}
