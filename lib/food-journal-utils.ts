import type { JournalTag, Place, PlaceFilters, PlaceStatus } from "@/lib/types/food-journal";

export function filterPlaces(places: Place[], filters: PlaceFilters): Place[] {
  return places.filter((place) => {
    if (!filters.statuses.includes(place.status)) return false;

    if (place.status === "visited") {
      const rating = place.rating ?? 0;
      if (rating < filters.minRating) return false;
    }

    if (
      place.priceRange !== null &&
      (place.priceRange < filters.priceMin || place.priceRange > filters.priceMax)
    ) {
      return false;
    }

    if (filters.tagIds.length > 0) {
      const hasTag = filters.tagIds.every((tagId) => place.tagIds.includes(tagId));
      if (!hasTag) return false;
    }

    if (filters.searchName.trim()) {
      const searchLower = filters.searchName.toLowerCase();
      if (!place.name.toLowerCase().includes(searchLower)) return false;
    }

    return true;
  });
}

export function buildStatusGeoJson(
  places: Place[],
  status: PlaceStatus
): GeoJSON.FeatureCollection<GeoJSON.Point, { placeId: string; status: PlaceStatus }> {
  return {
    type: "FeatureCollection",
    features: places
      .filter((place) => place.status === status)
      .map((place) => ({
        type: "Feature",
        properties: { placeId: place.id, status: place.status },
        geometry: {
          type: "Point",
          coordinates: [place.longitude, place.latitude],
        },
      })),
  };
}

export function getTagMap(tags: JournalTag[]) {
  return Object.fromEntries(tags.map((tag) => [tag.id, tag])) as Record<string, JournalTag>;
}
