import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import polyline from '@mapbox/polyline';

interface ActivityMapProps {
  encodedPolyline: string | null;
}

export function ActivityMap({ encodedPolyline }: ActivityMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        scrollWheelZoom: false,
      }).setView([-6.2, 106.8], 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Clear previous layers (except tile layer)
    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    if (encodedPolyline) {
      const latlngs = polyline.decode(encodedPolyline);

      if (latlngs.length > 0) {
        const route = L.polyline(latlngs, {
          color: '#dc2626',
          weight: 4,
          opacity: 0.8,
        }).addTo(map);

        map.fitBounds(route.getBounds(), { padding: [30, 30] });
      }
    }

    // Force redraw in case container was hidden
    setTimeout(() => map.invalidateSize(), 100);
  }, [encodedPolyline]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  if (!encodedPolyline) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-secondary">
        <p className="text-sm text-muted-foreground">No map data for this activity</p>
      </div>
    );
  }

  return <div ref={containerRef} className="h-64 w-full rounded-lg border border-border" />;
}
