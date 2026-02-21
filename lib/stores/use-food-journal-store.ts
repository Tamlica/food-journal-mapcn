import { create } from "zustand";

import { DEFAULT_FILTERS } from "@/lib/constants/food-journal";
import {
  createPlace,
  createTag,
  deletePlace,
  listPlaces,
  listTags,
  updatePlace,
} from "@/lib/supabase/queries";
import type {
  CreatePlaceInput,
  JournalTag,
  Place,
  PlaceFilters,
  UpdatePlaceInput,
} from "@/lib/types/food-journal";

type FoodJournalState = {
  places: Place[];
  tags: JournalTag[];
  filters: PlaceFilters;
  isLoading: boolean;
  errorMessage: string | null;
  hydrate: () => Promise<void>;
  addPlace: (input: CreatePlaceInput) => Promise<void>;
  editPlace: (placeId: string, input: UpdatePlaceInput) => Promise<void>;
  removePlace: (placeId: string) => Promise<void>;
  addTag: (input: { name: string; color: string }) => Promise<void>;
  setFilters: (patch: Partial<PlaceFilters>) => void;
  toggleStatus: (status: Place["status"]) => void;
  toggleTagFilter: (tagId: string) => void;
  resetFilters: () => void;
};

export const useFoodJournalStore = create<FoodJournalState>((set, get) => ({
  places: [],
  tags: [],
  filters: {
    statuses: [...DEFAULT_FILTERS.statuses],
    minRating: DEFAULT_FILTERS.minRating,
    priceMin: DEFAULT_FILTERS.priceMin,
    priceMax: DEFAULT_FILTERS.priceMax,
    tagIds: [],
  },
  isLoading: false,
  errorMessage: null,

  hydrate: async () => {
    set({ isLoading: true, errorMessage: null });
    try {
      const [remotePlaces, remoteTags] = await Promise.all([listPlaces(), listTags()]);
      set({ places: remotePlaces, tags: remoteTags });
    } catch {
      set({ errorMessage: "Supabase is unavailable right now." });
    } finally {
      set({ isLoading: false });
    }
  },

  addPlace: async (input) => {
    const optimistic: Place = {
      id: crypto.randomUUID(),
      name: input.name,
      notes: input.notes ?? null,
      status: input.status,
      rating: input.status === "visited" ? input.rating ?? null : null,
      priceRange: input.priceRange ?? null,
      visitDate: input.visitDate ?? null,
      latitude: input.latitude,
      longitude: input.longitude,
      imageUrls: [],
      imageUrl: null,
      tagIds: input.tagIds ?? [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({ places: [optimistic, ...state.places], errorMessage: null }));

    try {
      const created = await createPlace(input);
      if (!created) return;
      set((state) => ({
        places: state.places.map((place) =>
          place.id === optimistic.id ? created : place
        ),
      }));
    } catch {
      set({ errorMessage: "Could not save place to Supabase." });
    }
  },

  editPlace: async (placeId, input) => {
    const before = get().places;
    const nextPlaces = before.map((place) => {
      if (place.id !== placeId) return place;
      return {
        ...place,
        ...("name" in input ? { name: input.name ?? place.name } : {}),
        ...("notes" in input ? { notes: input.notes ?? null } : {}),
        ...("status" in input ? { status: input.status ?? place.status } : {}),
        ...("rating" in input
          ? { rating: (input.status ?? place.status) === "visited" ? input.rating ?? null : null }
          : {}),
        ...("priceRange" in input ? { priceRange: input.priceRange ?? null } : {}),
        ...("visitDate" in input ? { visitDate: input.visitDate ?? null } : {}),
        ...("latitude" in input ? { latitude: input.latitude ?? place.latitude } : {}),
        ...("longitude" in input ? { longitude: input.longitude ?? place.longitude } : {}),
        ...("tagIds" in input ? { tagIds: input.tagIds ?? [] } : {}),
        updatedAt: new Date().toISOString(),
      };
    });

    set({ places: nextPlaces, errorMessage: null });

    try {
      const updated = await updatePlace(placeId, input);
      if (!updated) return;
      set((state) => ({
        places: state.places.map((place) =>
          place.id === placeId ? updated : place
        ),
      }));
    } catch {
      set({ errorMessage: "Could not update place in Supabase." });
    }
  },

  removePlace: async (placeId) => {
    const before = get().places;
    set((state) => ({ places: state.places.filter((place) => place.id !== placeId) }));

    try {
      await deletePlace(placeId);
    } catch {
      set({ places: before, errorMessage: "Could not delete place from Supabase." });
    }
  },

  addTag: async ({ name, color }) => {
    const optimistic: JournalTag = {
      id: crypto.randomUUID(),
      name,
      color,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({ tags: [...state.tags, optimistic], errorMessage: null }));

    try {
      const created = await createTag({ name, color });
      if (!created) return;
      set((state) => ({
        tags: state.tags.map((tag) => (tag.id === optimistic.id ? created : tag)),
      }));
    } catch {
      set({ errorMessage: "Could not save tag to Supabase." });
    }
  },

  setFilters: (patch) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...patch,
      },
    })),

  toggleStatus: (status) =>
    set((state) => {
      const exists = state.filters.statuses.includes(status);
      return {
        filters: {
          ...state.filters,
          statuses: exists
            ? state.filters.statuses.filter((value) => value !== status)
            : [...state.filters.statuses, status],
        },
      };
    }),

  toggleTagFilter: (tagId) =>
    set((state) => {
      const exists = state.filters.tagIds.includes(tagId);
      return {
        filters: {
          ...state.filters,
          tagIds: exists
            ? state.filters.tagIds.filter((entry) => entry !== tagId)
            : [...state.filters.tagIds, tagId],
        },
      };
    }),

  resetFilters: () =>
    set({
      filters: {
        statuses: [...DEFAULT_FILTERS.statuses],
        minRating: DEFAULT_FILTERS.minRating,
        priceMin: DEFAULT_FILTERS.priceMin,
        priceMax: DEFAULT_FILTERS.priceMax,
        tagIds: [],
      },
    }),
}));
