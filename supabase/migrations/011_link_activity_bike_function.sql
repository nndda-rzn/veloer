-- Migration: 011_link_activity_bike_function
-- Description: Function to link activity to bike and auto-update km on bike & active components
-- Called when user assigns a bike to an existing activity (UPDATE, not INSERT)

CREATE OR REPLACE FUNCTION link_activity_bike(activity_uuid UUID, bike_uuid UUID)
RETURNS VOID AS $$
DECLARE
  activity_distance_meters FLOAT;
  distance_km FLOAT;
BEGIN
  -- Get the activity's distance
  SELECT distance INTO activity_distance_meters
  FROM activities
  WHERE id = activity_uuid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Activity not found: %', activity_uuid;
  END IF;

  distance_km := activity_distance_meters / 1000;

  -- Update the activity's bike_id
  UPDATE activities
  SET bike_id = bike_uuid
  WHERE id = activity_uuid;

  -- Update bike current_km
  UPDATE bikes
  SET current_km = current_km + distance_km
  WHERE id = bike_uuid;

  -- Update all active components on this bike
  UPDATE components
  SET current_km = components.current_km + distance_km
  WHERE bike_id = bike_uuid AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
