type RouteOption = {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
};

export async function getRoutes(
  from: [number, number],
  to: [number, number]
): Promise<RouteOption[]> {
  const [fromLng, fromLat] = from;
  const [toLng, toLat] = to;

  const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson&alternatives=true`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Route request failed: ${response.status}`);
  }

  const data = await response.json();

  if (data.code !== "Ok" || !data.routes?.length) {
    throw new Error("No route found between these points");
  }

  return data.routes.map((route: { geometry: { coordinates: [number, number][] }; distance: number; duration: number }) => ({
    coordinates: route.geometry.coordinates,
    distanceMeters: route.distance,
    durationSeconds: route.duration,
  }));
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}
