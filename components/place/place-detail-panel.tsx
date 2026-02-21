"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Pencil,
  Star,
  StarHalf,
  Trash2,
  X,
} from "lucide-react";

import { STATUS_STYLE } from "@/lib/constants/food-journal";
import { formatIdr } from "@/lib/format";
import { getTagMap } from "@/lib/food-journal-utils";
import type { JournalTag, Place } from "@/lib/types/food-journal";

type PlaceDetailPanelProps = {
  place: Place | null;
  tags: JournalTag[];
  onEdit: (place: Place) => void;
  onDelete: (placeId: string) => void;
  onClose: () => void;
};

export function PlaceDetailPanel({
  place,
  tags,
  onEdit,
  onDelete,
  onClose,
}: PlaceDetailPanelProps) {
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState<number | null>(null);

  if (!place) return null;

  const status = STATUS_STYLE[place.status];
  const tagMap = getTagMap(tags);
  const ratingValue = place.rating ?? 0;
  const imageUrls =
    place.imageUrls && place.imageUrls.length > 0
      ? place.imageUrls
      : place.imageUrl
        ? [place.imageUrl]
        : [];
  const fullscreenImageUrl =
    fullscreenImageIndex !== null ? imageUrls[fullscreenImageIndex] ?? null : null;

  const ratingStars = Array.from({ length: 5 }).map((_, index) => {
    const fullValue = index + 1;
    const halfValue = index + 0.5;
    if (ratingValue >= fullValue) {
      return <Star key={`rating-${index}`} className="size-5 fill-current text-foreground" />;
    }
    if (ratingValue >= halfValue) {
      return <StarHalf key={`rating-${index}`} className="size-5 fill-current text-foreground" />;
    }
    return <Star key={`rating-${index}`} className="size-5 text-muted-foreground" />;
  });

  return (
    <section className="flex h-full flex-col rounded-2xl border border-border bg-card/95 p-4 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">{place.name}</h3>
          <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground">
            <span className={`inline-block size-2 rounded-full ${status.dotClassName}`} />
            {status.label}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          Close
        </button>
      </div>

      <div className="mt-4 space-y-3 text-sm">
        {imageUrls.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {imageUrls.map((imageUrl, index) => (
              <button
                key={`${imageUrl}-${index}`}
                type="button"
                onClick={() => setFullscreenImageIndex(index)}
                className="overflow-hidden rounded-md border border-border"
              >
                <img
                  src={imageUrl}
                  alt={`${place.name} ${index + 1}`}
                  className="h-32 w-full cursor-zoom-in object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}

        {place.rating ? (
          <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-muted-foreground">
            <span className="text-xs">Rating</span>
            <div className="flex items-center gap-1 text-foreground">{ratingStars}</div>
            <span className="text-xs text-muted-foreground">{place.rating.toFixed(1)}</span>
          </div>
        ) : null}

        {place.notes ? (
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Notes</p>
            <p className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
              {place.notes}
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {place.tagIds.map((tagId) => {
            const tag = tagMap[tagId];
            if (!tag) return null;

            return (
              <span
                key={tag.id}
                className="rounded-full border border-border px-2.5 py-1 text-xs"
                style={{ backgroundColor: `${tag.color}33` }}
              >
                {tag.name}
              </span>
            );
          })}
        </div>

        <div className="grid gap-2 text-xs text-muted-foreground">
          <p className="inline-flex items-center gap-1.5">
            <DollarSign className="size-3.5" />
            Price: {formatIdr(place.priceRange)}
          </p>
          <p className="inline-flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            Visit Date: {place.visitDate ?? "-"}
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2 pt-4">
        <button
          type="button"
          onClick={() => onEdit(place)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs text-foreground transition hover:bg-accent"
        >
          <Pencil className="size-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(place.id)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive transition hover:bg-destructive/20"
        >
          <Trash2 className="size-3.5" />
          Delete
        </button>
      </div>

      {fullscreenImageUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setFullscreenImageIndex(null)}
        >
          <button
            type="button"
            onClick={() => setFullscreenImageIndex(null)}
            className="absolute right-4 top-4 rounded-md border border-white/20 bg-black/40 p-2 text-white transition hover:bg-black/60"
          >
            <X className="size-4" />
          </button>

          {imageUrls.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setFullscreenImageIndex((current) => {
                    if (current === null) return 0;
                    return (current - 1 + imageUrls.length) % imageUrls.length;
                  });
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-2 text-white transition hover:bg-black/60"
              >
                <ChevronLeft className="size-5" />
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setFullscreenImageIndex((current) => {
                    if (current === null) return 0;
                    return (current + 1) % imageUrls.length;
                  });
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-2 text-white transition hover:bg-black/60"
              >
                <ChevronRight className="size-5" />
              </button>

              <div className="absolute bottom-4 rounded-md border border-white/20 bg-black/40 px-2 py-1 text-xs text-white">
                {fullscreenImageIndex !== null ? fullscreenImageIndex + 1 : 1} / {imageUrls.length}
              </div>
            </>
          ) : null}

          <img
            src={fullscreenImageUrl}
            alt={place.name}
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </section>
  );
}
