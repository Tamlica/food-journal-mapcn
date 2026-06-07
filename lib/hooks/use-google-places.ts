let loaded: Promise<void> | null = null;

export async function loadGoogleMapsPlaces(): Promise<void> {
  if (loaded) return loaded;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    loaded = Promise.reject(new Error("Google Maps API key not configured"));
    return loaded;
  }

  const { setOptions, importLibrary } = await import("@googlemaps/js-api-loader");

  setOptions({
    key: apiKey,
    v: "weekly",
    libraries: ["places"],
  });

  loaded = importLibrary("places").then(() => {});
  return loaded;
}
