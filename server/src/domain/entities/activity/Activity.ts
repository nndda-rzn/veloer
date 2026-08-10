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
  created_at: string;
  updated_at: string;
}
