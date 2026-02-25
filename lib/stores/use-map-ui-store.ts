import { create } from "zustand";

type Coordinates = {
  longitude: number;
  latitude: number;
};

type MapUiState = {
  selectedPlaceId: string | null;
  isAddOpen: boolean;
  isDetailOpen: boolean;
  isFilterOpen: boolean;
  draftCoordinates: Coordinates | null;
  setSelectedPlaceId: (placeId: string | null) => void;
  openAdd: (coordinates?: Coordinates | null) => void;
  closeAdd: () => void;
  openDetail: (placeId: string) => void;
  closeDetail: () => void;
  toggleFilter: () => void;
  closeFilter: () => void;
};

export const useMapUiStore = create<MapUiState>((set) => ({
  selectedPlaceId: null,
  isAddOpen: false,
  isDetailOpen: false,
  isFilterOpen: false,
  draftCoordinates: null,
  setSelectedPlaceId: (placeId) => set({ selectedPlaceId: placeId }),
  openAdd: (coordinates) =>
    set({
      isAddOpen: true,
      draftCoordinates: coordinates ?? null,
    }),
  closeAdd: () => set({ isAddOpen: false, draftCoordinates: null }),
  openDetail: (placeId) =>
    set({
      selectedPlaceId: placeId,
      isDetailOpen: true,
      isAddOpen: false,
      draftCoordinates: null,
    }),
  closeDetail: () => set({ isDetailOpen: false }),
  toggleFilter: () => set((state) => ({ isFilterOpen: !state.isFilterOpen })),
  closeFilter: () => set({ isFilterOpen: false }),
}));
