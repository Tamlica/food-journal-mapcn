"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";

import { PlaceMap } from "@/components/map/place-map";
import { PlaceDetailPanel } from "@/components/place/place-detail-panel";
import { STATUS_STYLE } from "@/lib/constants/food-journal";
import {
  fetchPublicJournal,
  type PublicJournal,
} from "@/lib/supabase/profile-queries";
import type { MapRef } from "@/components/ui/map";

type LoadState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error" }
  | { status: "ready"; journal: PublicJournal };

export default function PublicJournalPage() {
  const params = useParams<{ username: string }>();
  const username = params.username;
  const mapRef = useRef<MapRef | null>(null);

  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [isListOpen, setIsListOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const journal = await fetchPublicJournal(username);
        if (cancelled) return;
        setState(journal ? { status: "ready", journal } : { status: "not-found" });
      } catch {
        if (!cancelled) setState({ status: "error" });
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [username]);

  if (state.status === "loading") {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  if (state.status !== "ready") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-lg font-semibold text-foreground">
          {state.status === "not-found" ? "Page not found" : "Something went wrong"}
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {state.status === "not-found"
            ? "This journal doesn't exist or isn't public."
            : "We couldn't load this journal. Please try again."}
        </p>
        <Link href="/" className="text-sm text-primary underline-offset-2 hover:underline">
          Go to MakanMap
        </Link>
      </div>
    );
  }

  const { journal } = state;
  const { places, tags, profile } = journal;
  const selectedPlace = places.find((place) => place.id === selectedPlaceId) ?? null;

  const handleSelect = (placeId: string) => {
    setSelectedPlaceId(placeId);
    const place = places.find((entry) => entry.id === placeId);
    if (place) {
      mapRef.current?.easeTo({
        center: [place.longitude, place.latitude],
        zoom: 15,
        duration: 600,
      });
    }
  };

  const handleGetDirections = (coords: { longitude: number; latitude: number }) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${coords.latitude},${coords.longitude}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="relative h-full w-full">
      <PlaceMap
        places={places}
        selectedPlaceId={selectedPlaceId}
        mapRef={mapRef}
        onPlaceSelect={handleSelect}
        onMapPick={() => setSelectedPlaceId(null)}
      />

      <div className="pointer-events-none absolute inset-0">
        <div className="pointer-events-auto absolute left-3 top-3 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-border bg-card/95 p-4 shadow-sm backdrop-blur">
          <h1 className="text-base font-semibold text-foreground">
            {profile.displayName || `@${profile.username}`}
          </h1>
          {profile.displayName && (
            <p className="text-xs text-muted-foreground">@{profile.username}</p>
          )}
          {profile.bio && (
            <p className="mt-2 break-words text-sm text-muted-foreground">{profile.bio}</p>
          )}

          <button
            type="button"
            onClick={() => setIsListOpen((open) => !open)}
            className="mt-3 inline-flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground transition hover:bg-accent cursor-pointer"
          >
            {places.length} {places.length === 1 ? "place" : "places"}
            {isListOpen ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
          </button>

          {isListOpen && (
            <ul className="mt-2 max-h-55 space-y-1 overflow-y-auto">
              {places.map((place) => (
                <li key={place.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(place.id)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-accent cursor-pointer ${
                      place.id === selectedPlaceId ? "bg-accent" : ""
                    }`}
                  >
                    <span
                      className={`inline-block size-2 shrink-0 rounded-full ${STATUS_STYLE[place.status].dotClassName}`}
                    />
                    <span className="min-w-0 flex-1 truncate text-foreground">
                      {place.name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedPlace && (
          <div className="pointer-events-auto absolute inset-x-3 bottom-3 flex max-h-[55dvh] flex-col md:inset-x-auto md:bottom-auto md:right-3 md:top-3 md:max-h-[calc(100dvh-1.5rem)] md:w-80">
            <PlaceDetailPanel
              place={selectedPlace}
              tags={tags}
              onClose={() => setSelectedPlaceId(null)}
              onGetDirections={handleGetDirections}
              isRouteLoading={false}
              routeError={null}
            />
          </div>
        )}

        {!selectedPlace && (
          <Link
            href="/"
            className="pointer-events-auto absolute bottom-3 left-1/2 hidden -translate-x-1/2 rounded-full border border-border bg-card/90 px-3 py-1 text-[11px] text-muted-foreground shadow-sm backdrop-blur transition hover:text-foreground md:inline-block"
          >
            Made with MakanMap
          </Link>
        )}
      </div>
    </div>
  );
}
