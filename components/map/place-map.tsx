"use client";

import { useEffect, useMemo, useRef } from "react";
import MapLibreGL from "maplibre-gl";

import {
  Map,
  MapClusterLayer,
  MapControls,
  useMap,
  type MapRef,
} from "@/components/ui/map";
import { STATUS_STYLE } from "@/lib/constants/food-journal";
import { buildStatusGeoJson } from "@/lib/food-journal-utils";
import type { Place } from "@/lib/types/food-journal";

type PlaceMapProps = {
  places: Place[];
  selectedPlaceId: string | null;
  mapRef: React.RefObject<MapRef | null>;
  onPlaceSelect: (placeId: string) => void;
  onMapPick: (coords: { longitude: number; latitude: number }) => void;
};

const INDONESIA_CENTER: [number, number] = [113.9213, -0.7893];

const VISITED_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.08"/>
  <path 
    d="M7 12.5L10.2 15.7L17.5 8.5" 
    stroke="currentColor" 
    stroke-width="2.5" 
    stroke-linecap="round" 
    stroke-linejoin="round"
  />
</svg>
`;

const WANT_TO_GO_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <path 
    d="M12 21C12 21 5 15.25 5 10.5C5 6.36 8.13 3.5 12 3.5C15.87 3.5 19 6.36 19 10.5C19 15.25 12 21 12 21Z" 
    fill="currentColor" 
    opacity="0.08"
  />
  <path 
    d="M12 21C12 21 5 15.25 5 10.5C5 6.36 8.13 3.5 12 3.5C15.87 3.5 19 6.36 19 10.5C19 15.25 12 21 12 21Z" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linejoin="round"
  />
  <circle 
    cx="12" 
    cy="10.5" 
    r="2.5" 
    fill="currentColor"
  />
</svg>
`;

const AVOID_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
  <circle 
    cx="12" 
    cy="12" 
    r="9" 
    fill="currentColor" 
    opacity="0.08"
  />
  <circle 
    cx="12" 
    cy="12" 
    r="9" 
    stroke="currentColor" 
    stroke-width="2"
  />
  <path 
    d="M8 8L16 16" 
    stroke="currentColor" 
    stroke-width="2.5" 
    stroke-linecap="round"
  />
</svg>
`;

function MapClickCapture({
  onMapPick,
}: {
  onMapPick: (coords: { longitude: number; latitude: number }) => void;
}) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded) return;

    const handleClick = (event: MapLibreGL.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(event.point);
      const clickedDataPoint = features.some(
        (feature) =>
          feature.layer.id.includes("clusters-") ||
          feature.layer.id.includes("unclustered-point-") ||
          feature.layer.id.includes("unclustered-icon-")
      );

      if (clickedDataPoint) return;

      onMapPick({
        longitude: event.lngLat.lng,
        latitude: event.lngLat.lat,
      });
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
    };
  }, [map, isLoaded, onMapPick]);

  return null;
}

function AutoFitBounds({ places }: { places: Place[] }) {
  const { map, isLoaded } = useMap();

  useEffect(() => {
    if (!map || !isLoaded || places.length === 0) return;

    if (places.length === 1) {
      const place = places[0];
      map.easeTo({
        center: [place.longitude, place.latitude],
        zoom: Math.max(map.getZoom(), 12),
        duration: 650,
      });
      return;
    }

    const bounds = new MapLibreGL.LngLatBounds();
    for (const place of places) {
      bounds.extend([place.longitude, place.latitude]);
    }

    map.fitBounds(bounds, {
      padding: { top: 120, right: 340, bottom: 120, left: 120 },
      duration: 700,
      maxZoom: 14,
    });
  }, [map, isLoaded, places]);

  return null;
}

function UseInitialCenter({ places }: { places: Place[] }) {
  const { map, isLoaded } = useMap();
  const hasCenteredRef = useRef(false);

  useEffect(() => {
    if (!map || !isLoaded || hasCenteredRef.current) return;
    if (places.length > 0) return;

    hasCenteredRef.current = true;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.easeTo({
            center: [position.coords.longitude, position.coords.latitude],
            zoom: 12,
            duration: 800,
          });
        },
        () => {
          map.easeTo({
            center: INDONESIA_CENTER,
            zoom: 4,
            duration: 800,
          });
        },
        { timeout: 6000 }
      );
    } else {
      map.easeTo({
        center: INDONESIA_CENTER,
        zoom: 4,
        duration: 800,
      });
    }
  }, [map, isLoaded, places]);

  return null;
}

function UserLocationLayer() {
  const { map, isLoaded } = useMap();
  const watchIdRef = useRef<number | null>(null);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!map || !isLoaded) return;

    // Initial position
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [position.coords.longitude, position.coords.latitude],
                },
                properties: {
                  isUserLocation: true,
                },
              },
            ],
          };

          // Add source if it doesn't exist
          if (!map.getSource("user-location")) {
            map.addSource("user-location", {
              type: "geojson",
              data: geojson,
            });

            // Add pulsing circle layer
            map.addLayer({
              id: "user-location-pulse",
              type: "circle",
              source: "user-location",
              paint: {
                "circle-radius": 12,
                "circle-color": "#3b82f6",
                "circle-opacity": 0.2,
              },
            });

            // Add main dot
            map.addLayer({
              id: "user-location-dot",
              type: "circle",
              source: "user-location",
              paint: {
                "circle-radius": 7,
                "circle-color": "#3b82f6",
                "circle-stroke-width": 2,
                "circle-stroke-color": "white",
              },
            });

            // Start pulsing animation
            let pulsePhase = 0;
            animationIntervalRef.current = setInterval(() => {
              pulsePhase = (pulsePhase + 1) % 16;
              const progress = pulsePhase / 16;
              const easeProgress = Math.sin(progress * Math.PI);

              map.setPaintProperty(
                "user-location-pulse",
                "circle-radius",
                12 + easeProgress * 8
              );
              map.setPaintProperty(
                "user-location-pulse",
                "circle-opacity",
                0.2 * (1 - easeProgress * 0.5)
              );
            }, 60);
          } else {
            // Update existing source
            (map.getSource("user-location") as MapLibreGL.GeoJSONSource).setData(geojson);
          }
        }
      );

      // Watch for position changes (optional, can be disabled for performance)
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const source = map.getSource("user-location");
          if (source && source instanceof MapLibreGL.GeoJSONSource) {
            const geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [position.coords.longitude, position.coords.latitude],
                  },
                  properties: {
                    isUserLocation: true,
                  },
                },
              ],
            };
            source.setData(geojson);
          }
        },
        undefined,
        { maximumAge: 5000, timeout: 10000 }
      );
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (animationIntervalRef.current !== null) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, [map, isLoaded]);

  return null;
}

export function PlaceMap({
  places,
  selectedPlaceId,
  mapRef,
  onPlaceSelect,
  onMapPick,
}: PlaceMapProps) {
  const visitedData = useMemo(() => buildStatusGeoJson(places, "visited"), [places]);
  const wantToGoData = useMemo(() => buildStatusGeoJson(places, "want_to_go"), [places]);
  const avoidData = useMemo(() => buildStatusGeoJson(places, "avoid"), [places]);

  const selectedPlace =
    selectedPlaceId ? places.find((place) => place.id === selectedPlaceId) : null;

  return (
    <Map
      ref={mapRef}
      className="h-full w-full"
      center={INDONESIA_CENTER}
      zoom={4}
      maxZoom={18}
      minZoom={3}
      dragRotate={false}
      pitchWithRotate={false}
      touchPitch={false}
      doubleClickZoom
    >
      <AutoFitBounds places={places} />
      <UseInitialCenter places={places} />
      <UserLocationLayer />
      <MapClickCapture onMapPick={onMapPick} />

      <MapClusterLayer
        data={visitedData}
        pointColor={STATUS_STYLE.visited.pointColor}
        pointRadius={12}
        pointIconSvg={VISITED_ICON}
        pointIconSize={0.8}
        clusterColors={STATUS_STYLE.visited.clusterColors}
        onPointClick={(feature) => {
          if (feature.properties?.placeId) {
            onPlaceSelect(feature.properties.placeId);
          }
        }}
      />
      <MapClusterLayer
        data={wantToGoData}
        pointColor={STATUS_STYLE.want_to_go.pointColor}
        pointRadius={12}
        pointIconSvg={WANT_TO_GO_ICON}
        pointIconSize={0.8}
        clusterColors={STATUS_STYLE.want_to_go.clusterColors}
        onPointClick={(feature) => {
          if (feature.properties?.placeId) {
            onPlaceSelect(feature.properties.placeId);
          }
        }}
      />
      <MapClusterLayer
        data={avoidData}
        pointColor={STATUS_STYLE.avoid.pointColor}
        pointRadius={12}
        pointIconSvg={AVOID_ICON}
        pointIconSize={1}
        clusterColors={STATUS_STYLE.avoid.clusterColors}
        onPointClick={(feature) => {
          if (feature.properties?.placeId) {
            onPlaceSelect(feature.properties.placeId);
          }
        }}
      />

      <MapControls
        position="bottom-left"
        showLocate
        showZoom
        showCompass
      />

      {selectedPlace && (
        <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-border bg-card/90 px-4 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur">
          {selectedPlace.name}
        </div>
      )}
    </Map>
  );
}
