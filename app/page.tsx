"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Filter, Plus, Search, X } from "lucide-react";

import { PlaceMap } from "@/components/map/place-map";
import { FilterPanel } from "@/components/place/filter-panel";
import { PlaceDetailPanel } from "@/components/place/place-detail-panel";
import { PlaceForm } from "@/components/place/place-form";
import { filterPlaces } from "@/lib/food-journal-utils";
import { useFoodJournalStore } from "@/lib/stores/use-food-journal-store";
import { useMapUiStore } from "@/lib/stores/use-map-ui-store";
import type { MapRef } from "@/components/ui/map";
import type { Place } from "@/lib/types/food-journal";

type SearchResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

export default function Home() {
  const mapRef = useRef<MapRef | null>(null);

  const {
    places,
    tags,
    filters,
    connectionStatus,
    errorMessage,
    hydrate,
    addPlace,
    editPlace,
    removePlace,
    addTag,
    setFilters,
    toggleStatus,
    toggleTagFilter,
    resetFilters,
  } = useFoodJournalStore();

  const {
    selectedPlaceId,
    isAddOpen,
    isDetailOpen,
    isFilterOpen,
    draftCoordinates,
    openAdd,
    closeAdd,
    openDetail,
    closeDetail,
    toggleFilter,
    closeFilter,
  } = useMapUiStore();

  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const placeFormKey = useMemo(
    () => `${editingPlace?.id ?? 'new'}-${draftCoordinates?.latitude}-${draftCoordinates?.longitude}`,
    [editingPlace, draftCoordinates]
  );

  const filteredPlaces = useMemo(
    () => filterPlaces(places, filters),
    [places, filters]
  );

  const selectedPlace = useMemo(
    () => places.find((place) => place.id === selectedPlaceId) ?? null,
    [places, selectedPlaceId]
  );

  useEffect(() => {
    if (!selectedPlace && isDetailOpen) {
      closeDetail();
    }
  }, [selectedPlace, isDetailOpen, closeDetail]);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!searchValue.trim()) return;

    setIsSearching(true);

    try {
      const query = encodeURIComponent(searchValue.trim());
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${query}`
      );

      if (!response.ok) {
        setSearchResults([]);
        return;
      }

      const data = (await response.json()) as SearchResult[];
      setSearchResults(data);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSelect = (result: SearchResult) => {
    const longitude = Number(result.lon);
    const latitude = Number(result.lat);

    mapRef.current?.easeTo({
      center: [longitude, latitude],
      zoom: 14,
      duration: 700,
    });

    openAdd({ latitude, longitude });
    setSearchResults([]);
  };

  const handleMapPick = (coords: { longitude: number; latitude: number }) => {
    closeDetail();
    openAdd({ latitude: coords.latitude, longitude: coords.longitude });
    setEditingPlace(null);
  };

  const handleOpenAdd = () => {
    closeDetail();
    setEditingPlace(null);
    openAdd(null);
  };

  const handleSubmitPlace = async (payload: {
    name: string;
    notes?: string;
    status: Place["status"];
    rating?: number;
    priceRange?: number;
    visitDate?: string;
    latitude: number;
    longitude: number;
    tagIds?: string[];
    imageFiles?: File[];
  }) => {
    const typedPayload = {
      ...payload,
      priceRange: payload.priceRange,
    };

    if (editingPlace) {
      await editPlace(editingPlace.id, typedPayload);
      setEditingPlace(null);
      closeAdd();
      return;
    }

    await addPlace(typedPayload);
    closeAdd();
  };

  const showDesktopPanel = "hidden md:block";
  const showMobilePanel = "md:hidden";

  return (
    <main className="relative w-screen overflow-hidden bg-background text-foreground" style={{ height: '100dvh' }}>
      <div className="absolute inset-0">
        <PlaceMap
          places={filteredPlaces}
          selectedPlaceId={selectedPlaceId}
          mapRef={mapRef}
          onPlaceSelect={(placeId) => openDetail(placeId)}
          onMapPick={handleMapPick}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-30">
        <div className="pointer-events-auto absolute left-1/2 top-3 w-[min(92vw,760px)] -translate-x-1/2 rounded-2xl border border-border bg-card/90 p-2 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search location"
                className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              />
            </form>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="hidden items-center gap-1 rounded-md border border-border bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition hover:opacity-90 md:inline-flex"
            >
              <Plus className="size-3.5" />
              Add Place
            </button>
          </div>

          {(isSearching || searchResults.length > 0) && (
            <div className="mt-2 rounded-md border border-border bg-background">
              {isSearching ? (
                <p className="px-3 py-2 text-xs text-muted-foreground">Searching...</p>
              ) : (
                <ul className="max-h-56 overflow-auto py-1">
                  {searchResults.map((result) => (
                    <li key={result.place_id}>
                      <button
                        type="button"
                        onClick={() => handleSearchSelect(result)}
                        className="w-full px-3 py-2 text-left text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
                      >
                        {result.display_name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="pointer-events-auto absolute right-3 top-3 hidden items-center gap-1 rounded-md border border-border bg-background/90 px-2 py-1 text-[11px] text-muted-foreground shadow-sm backdrop-blur md:inline-flex">
          <span
            className={`inline-block size-2 rounded-full ${
              connectionStatus === "connected"
                ? "bg-emerald-500"
                : connectionStatus === "checking"
                  ? "bg-amber-500"
                  : "bg-red-500"
            }`}
          />
          {connectionStatus === "connected"
            ? "Supabase connected"
            : connectionStatus === "checking"
              ? "Checking Supabase"
              : "Supabase disconnected"}
        </div>

        <div className="pointer-events-auto absolute right-3 top-18 flex items-center gap-1 rounded-md border border-border bg-background/90 px-2 py-1 text-[11px] text-muted-foreground shadow-sm backdrop-blur md:hidden">
          <span
            className={`inline-block size-2 rounded-full ${
              connectionStatus === "connected"
                ? "bg-emerald-500"
                : connectionStatus === "checking"
                  ? "bg-amber-500"
                  : "bg-red-500"
            }`}
          />
          {connectionStatus === "connected"
            ? "Supabase connected"
            : connectionStatus === "checking"
              ? "Checking Supabase"
              : "Supabase disconnected"}
        </div>

        <div className="pointer-events-auto absolute left-3 top-18">
          <button
            type="button"
            onClick={toggleFilter}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-card/90 px-3 py-2 text-xs text-foreground shadow-sm backdrop-blur transition hover:bg-accent"
          >
            <Filter className="size-3.5" />
            Filters
          </button>
        </div>

        {isFilterOpen && (
          <div className="pointer-events-auto absolute left-3 top-28 w-75 max-w-[92vw]">
            <FilterPanel
              tags={tags}
              filters={filters}
              onSearchNameChange={(name) => setFilters({ searchName: name })}
              onToggleStatus={toggleStatus}
              onSetMinRating={(value) => setFilters({ minRating: value })}
              onToggleTag={toggleTagFilter}
              onSetPriceRange={({ min, max }) =>
                setFilters({ priceMin: min, priceMax: max })
              }
              onReset={() => {
                resetFilters();
                closeFilter();
              }}
            />
          </div>
        )}

        <div className={`pointer-events-auto absolute right-3 top-24 h-[calc(100vh-8rem)] w-85 ${showDesktopPanel}`}>
          {selectedPlace && isDetailOpen ? (
            <PlaceDetailPanel
              place={selectedPlace}
              tags={tags}
              onClose={closeDetail}
              onDelete={(placeId) => {
                void removePlace(placeId);
                closeDetail();
              }}
              onEdit={(place) => {
                closeDetail();
                setEditingPlace(place);
                openAdd({ latitude: place.latitude, longitude: place.longitude });
              }}
            />
          ) : null}
        </div>

        {errorMessage ? (
          <div className="pointer-events-auto absolute bottom-4 left-3 rounded-md border border-border bg-card/90 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur">
            {errorMessage}
          </div>
        ) : null}

        {isAddOpen && (
          <div className={`pointer-events-auto fixed inset-x-3 bottom-3 z-40 max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-sm ${showMobilePanel}`}>
            <PlaceForm
              key={placeFormKey}
              title={editingPlace ? "Edit Place" : "Add Place"}
              tags={tags}
              initialPlace={editingPlace}
              initialCoordinates={draftCoordinates}
              onSubmit={handleSubmitPlace}
              onCreateTag={addTag}
              onCancel={() => {
                closeAdd();
                setEditingPlace(null);
              }}
            />
          </div>
        )}

        {isAddOpen && (
          <div className={`pointer-events-auto absolute right-3 top-24 z-40 h-[calc(100dvh-8rem)] w-95 ${showDesktopPanel}`}>
            <section className="flex h-full min-h-0 flex-col rounded-2xl border border-border bg-card/95 p-4 shadow-sm backdrop-blur">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  {editingPlace ? "Edit Place" : "Add Place"}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    closeAdd();
                    setEditingPlace(null);
                  }}
                  className="rounded-md border border-border p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <PlaceForm
                  key={placeFormKey}
                  title={editingPlace ? "Edit Place" : "Add Place"}
                  tags={tags}
                  initialPlace={editingPlace}
                  initialCoordinates={draftCoordinates}
                  onSubmit={handleSubmitPlace}
                  onCreateTag={addTag}
                  onCancel={() => {
                    closeAdd();
                    setEditingPlace(null);
                  }}
                />
              </div>
            </section>
          </div>
        )}

        {selectedPlace && isDetailOpen && (
          <div className={`pointer-events-auto fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-border bg-card p-4 shadow-sm ${showMobilePanel}`}>
            <PlaceDetailPanel
              place={selectedPlace}
              tags={tags}
              onClose={closeDetail}
              onDelete={(placeId) => {
                void removePlace(placeId);
                closeDetail();
              }}
              onEdit={(place) => {
                closeDetail();
                setEditingPlace(place);
                openAdd({ latitude: place.latitude, longitude: place.longitude });
              }}
            />
          </div>
        )}

        {!isAddOpen && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className={`pointer-events-auto fixed bottom-5 right-5 z-40 inline-flex size-12 items-center justify-center rounded-full border border-border bg-primary text-primary-foreground shadow-sm transition hover:opacity-90 ${showMobilePanel}`}
            aria-label="Add place"
          >
            <Plus className="size-5" />
          </button>
        )}
      </div>
    </main>
  );
}
