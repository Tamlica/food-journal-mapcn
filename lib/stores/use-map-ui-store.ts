import { create } from "zustand";

type Coordinates = {
  longitude: number;
  latitude: number;
};

type RouteInfo = {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
};

type MapUiState = {
  selectedPlaceId: string | null;
  isAddOpen: boolean;
  isDetailOpen: boolean;
  isFilterOpen: boolean;
  draftCoordinates: Coordinates | null;
  routes: RouteInfo[];
  selectedRouteIndex: number;
  isRouteLoading: boolean;
  routeError: string | null;
  setSelectedPlaceId: (placeId: string | null) => void;
  openAdd: (coordinates?: Coordinates | null) => void;
  closeAdd: () => void;
  openDetail: (placeId: string) => void;
  closeDetail: () => void;
  toggleFilter: () => void;
  closeFilter: () => void;
  setRoutes: (routes: RouteInfo[]) => void;
  selectRoute: (index: number) => void;
  clearRoutes: () => void;
  setRouteLoading: (loading: boolean) => void;
  setRouteError: (error: string | null) => void;
  updateDraftCoordinates: (coordinates: Coordinates | null) => void;
};

export const useMapUiStore = create<MapUiState>((set) => ({
  selectedPlaceId: null,
  isAddOpen: false,
  isDetailOpen: false,
  isFilterOpen: false,
  draftCoordinates: null,
  routes: [],
  selectedRouteIndex: 0,
  isRouteLoading: false,
  routeError: null,
  setSelectedPlaceId: (placeId) => set({ selectedPlaceId: placeId }),
  openAdd: (coordinates) =>
    set({
      isAddOpen: true,
      draftCoordinates: coordinates ?? null,
      routes: [],
      selectedRouteIndex: 0,
    }),
  closeAdd: () => set({ isAddOpen: false, draftCoordinates: null }),
  openDetail: (placeId) =>
    set({
      selectedPlaceId: placeId,
      isDetailOpen: true,
      isAddOpen: false,
      draftCoordinates: null,
      routes: [],
      selectedRouteIndex: 0,
    }),
  closeDetail: () => set({ isDetailOpen: false }),
  toggleFilter: () => set((state) => ({ isFilterOpen: !state.isFilterOpen })),
  closeFilter: () => set({ isFilterOpen: false }),
  setRoutes: (routes) => set({ routes, selectedRouteIndex: 0, isRouteLoading: false, routeError: null }),
  selectRoute: (index) => set({ selectedRouteIndex: index }),
  clearRoutes: () => set({ routes: [], selectedRouteIndex: 0, routeError: null }),
  setRouteLoading: (loading) => set({ isRouteLoading: loading }),
  setRouteError: (error) => set({ routeError: error }),
  updateDraftCoordinates: (coordinates) => set({ draftCoordinates: coordinates }),
}));
