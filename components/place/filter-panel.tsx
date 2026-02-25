"use client";

import { RotateCcw, Search, Star, StarHalf } from "lucide-react";

import {
  MAX_PRICE_IDR,
  MIN_PRICE_IDR,
  PLACE_STATUS_OPTIONS,
  PRICE_STEP_IDR,
  STATUS_STYLE,
} from "@/lib/constants/food-journal";
import { formatIdr } from "@/lib/format";
import type { JournalTag, PlaceFilters } from "@/lib/types/food-journal";

type FilterPanelProps = {
  tags: JournalTag[];
  filters: PlaceFilters;
  onSearchNameChange: (name: string) => void;
  onToggleStatus: (status: PlaceFilters["statuses"][number]) => void;
  onSetMinRating: (value: number) => void;
  onToggleTag: (tagId: string) => void;
  onSetPriceRange: (value: { min: number; max: number }) => void;
  onReset: () => void;
};

export function FilterPanel({
  tags,
  filters,
  onSearchNameChange,
  onToggleStatus,
  onSetMinRating,
  onToggleTag,
  onSetPriceRange,
  onReset,
}: FilterPanelProps) {
  const ratingStars = Array.from({ length: 5 }).map((_, index) => {
    const fullValue = index + 1;
    const halfValue = index + 0.5;
    const isFull = filters.minRating >= fullValue;
    const isHalf = !isFull && filters.minRating >= halfValue;

    return (
      <div key={`filter-rating-${index}`} className="relative">
        <button
          type="button"
          onClick={() => onSetMinRating(halfValue)}
          className="absolute left-0 top-0 h-full w-1/2"
          aria-label={`Set minimum rating ${halfValue}`}
        />
        <button
          type="button"
          onClick={() => onSetMinRating(fullValue)}
          className="absolute right-0 top-0 h-full w-1/2"
          aria-label={`Set minimum rating ${fullValue}`}
        />
        {isFull ? (
          <Star className="size-5 fill-current text-foreground" />
        ) : isHalf ? (
          <StarHalf className="size-5 fill-current text-foreground" />
        ) : (
          <Star className="size-5 text-muted-foreground" />
        )}
      </div>
    );
  });

  return (
    <section className="rounded-2xl border border-border bg-card/95 p-4 shadow-sm backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <RotateCcw className="size-3.5" />
          Reset
        </button>
      </div>

      <div className="space-y-4 text-xs">
        <div className="space-y-2">
          <p className="text-muted-foreground">Search Name</p>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by place name"
              value={filters.searchName}
              onChange={(event) => onSearchNameChange(event.target.value)}
              className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-xs outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground">Status</p>
          <div className="grid grid-cols-1 gap-2">
            {PLACE_STATUS_OPTIONS.map((status) => {
              const active = filters.statuses.includes(status.value);
              return (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => onToggleStatus(status.value)}
                  className={`flex items-center justify-between rounded-md border px-2 py-1.5 text-left transition ${
                    active
                      ? "border-primary bg-secondary text-foreground"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  <span>{status.label}</span>
                  <span
                    className={`inline-block size-2 rounded-full ${STATUS_STYLE[status.value].dotClassName}`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground">Minimum Rating (Visited)</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-foreground">{ratingStars}</div>
            <p className="text-muted-foreground">{filters.minRating.toFixed(1)}/5</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground">Price Range</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatIdr(filters.priceMin)}</span>
              <span>{formatIdr(filters.priceMax)}</span>
            </div>
            <input
              type="range"
              min={MIN_PRICE_IDR}
              max={MAX_PRICE_IDR}
              step={PRICE_STEP_IDR}
              value={filters.priceMin}
              onChange={(event) =>
                onSetPriceRange({
                  min: Math.min(Number(event.target.value), filters.priceMax),
                  max: filters.priceMax,
                })
              }
              className="w-full"
            />
            <input
              type="range"
              min={MIN_PRICE_IDR}
              max={MAX_PRICE_IDR}
              step={PRICE_STEP_IDR}
              value={filters.priceMax}
              onChange={(event) =>
                onSetPriceRange({
                  min: filters.priceMin,
                  max: Math.max(Number(event.target.value), filters.priceMin),
                })
              }
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground">Tags</p>
          <div className="flex max-h-40 flex-wrap gap-2 overflow-auto">
            {tags.map((tag) => {
              const active = filters.tagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => onToggleTag(tag.id)}
                  className={`rounded-full border px-2.5 py-1 text-xs transition ${
                    active
                      ? "border-primary text-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                  style={{ backgroundColor: active ? `${tag.color}33` : undefined }}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
