export type PlaceStatus = "visited" | "want_to_go" | "avoid";

export type PriceRange = number;

export type JournalTag = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
};

export type Place = {
  id: string;
  name: string;
  notes: string | null;
  status: PlaceStatus;
  rating: number | null;
  priceRange: PriceRange | null;
  visitDate: string | null;
  latitude: number;
  longitude: number;
  imageUrls: string[];
  imageUrl?: string | null;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type PlaceFilters = {
  statuses: PlaceStatus[];
  minRating: number;
  priceMin: number;
  priceMax: number;
  tagIds: string[];
};

export type CreatePlaceInput = {
  name: string;
  notes?: string;
  status: PlaceStatus;
  rating?: number;
  priceRange?: PriceRange;
  visitDate?: string;
  latitude: number;
  longitude: number;
  tagIds?: string[];
  imageFiles?: File[];
};

export type UpdatePlaceInput = Partial<CreatePlaceInput>;
