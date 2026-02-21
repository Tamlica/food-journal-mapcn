import type {
  CreatePlaceInput,
  JournalTag,
  Place,
  UpdatePlaceInput,
} from "@/lib/types/food-journal";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type PlaceRow = {
  id: string;
  name: string;
  notes: string | null;
  status: Place["status"];
  rating: number | null;
  price_range: number | null;
  visit_date: string | null;
  latitude: number;
  longitude: number;
  image_urls?: string[] | null;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
  place_tags?: Array<{ tag_id: string }>;
};

type TagRow = {
  id: string;
  name: string;
  color: string;
  created_at: string;
};

function mapPlaceRow(row: PlaceRow): Place {
  const imageUrls =
    row.image_urls && row.image_urls.length > 0
      ? row.image_urls
      : row.image_url
        ? [row.image_url]
        : [];

  return {
    id: row.id,
    name: row.name,
    notes: row.notes,
    status: row.status,
    rating: row.rating,
    priceRange: row.price_range as Place["priceRange"],
    visitDate: row.visit_date,
    latitude: row.latitude,
    longitude: row.longitude,
    imageUrls,
    imageUrl: imageUrls[0] ?? null,
    tagIds: row.place_tags?.map((tag) => tag.tag_id) ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const PLACE_IMAGE_BUCKET = "place-images";

async function uploadPlaceImage(placeId: string, file: File) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const extension = file.name.split(".").pop() || "jpg";
  const filePath = `places/${placeId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(PLACE_IMAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || "image/jpeg",
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from(PLACE_IMAGE_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

async function uploadPlaceImages(placeId: string, files: File[]) {
  const urls = await Promise.all(files.map((file) => uploadPlaceImage(placeId, file)));
  return urls.filter((url): url is string => Boolean(url));
}

function mapTagRow(row: TagRow): JournalTag {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    createdAt: row.created_at,
  };
}

export async function listPlaces(): Promise<Place[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("places")
    .select("*, place_tags(tag_id)")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as PlaceRow[]).map(mapPlaceRow);
}

export async function listTags(): Promise<JournalTag[]> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as TagRow[]).map(mapTagRow);
}

export async function createTag(input: {
  name: string;
  color: string;
}): Promise<JournalTag | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("tags")
    .insert({ name: input.name, color: input.color })
    .select("*")
    .single();

  if (error) throw error;
  return data ? mapTagRow(data as TagRow) : null;
}

export async function createPlace(input: CreatePlaceInput): Promise<Place | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const payload = {
    name: input.name,
    notes: input.notes ?? null,
    status: input.status,
    rating: input.status === "visited" ? input.rating ?? null : null,
    price_range: input.priceRange ?? null,
    visit_date: input.visitDate ?? null,
    latitude: input.latitude,
    longitude: input.longitude,
  };

  const { data, error } = await supabase
    .from("places")
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  const place = data ? mapPlaceRow(data as PlaceRow) : null;

  if (place && input.tagIds?.length) {
    const relationRows = input.tagIds.map((tagId) => ({
      place_id: place.id,
      tag_id: tagId,
    }));

    const { error: relationError } = await supabase
      .from("place_tags")
      .insert(relationRows);

    if (relationError) throw relationError;
    place.tagIds = input.tagIds;
  }

  if (place && input.imageFiles && input.imageFiles.length > 0) {
    const imageUrls = await uploadPlaceImages(place.id, input.imageFiles);
    if (imageUrls.length > 0) {
      const { data: updatedData, error: updateError } = await supabase
        .from("places")
        .update({ image_urls: imageUrls, image_url: imageUrls[0] })
        .eq("id", place.id)
        .select("*, place_tags(tag_id)")
        .single();

      if (updateError) throw updateError;
      return updatedData ? mapPlaceRow(updatedData as PlaceRow) : place;
    }
  }

  return place;
}

export async function updatePlace(
  placeId: string,
  input: UpdatePlaceInput
): Promise<Place | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name;
  if (input.notes !== undefined) payload.notes = input.notes || null;
  if (input.status !== undefined) payload.status = input.status;
  if (input.rating !== undefined) payload.rating = input.rating;
  if (input.priceRange !== undefined) payload.price_range = input.priceRange;
  if (input.visitDate !== undefined) payload.visit_date = input.visitDate || null;
  if (input.latitude !== undefined) payload.latitude = input.latitude;
  if (input.longitude !== undefined) payload.longitude = input.longitude;

  if (input.imageFiles !== undefined) {
    const imageUrls = input.imageFiles.length
      ? await uploadPlaceImages(placeId, input.imageFiles)
      : [];
    payload.image_urls = imageUrls;
    payload.image_url = imageUrls[0] ?? null;
  }

  if (Object.keys(payload).length > 0) {
    const { error } = await supabase
      .from("places")
      .update(payload)
      .eq("id", placeId);

    if (error) throw error;
  }

  if (input.tagIds) {
    const { error: deleteError } = await supabase
      .from("place_tags")
      .delete()
      .eq("place_id", placeId);

    if (deleteError) throw deleteError;

    if (input.tagIds.length > 0) {
      const relationRows = input.tagIds.map((tagId) => ({
        place_id: placeId,
        tag_id: tagId,
      }));

      const { error: insertError } = await supabase
        .from("place_tags")
        .insert(relationRows);

      if (insertError) throw insertError;
    }
  }

  const { data, error } = await supabase
    .from("places")
    .select("*, place_tags(tag_id)")
    .eq("id", placeId)
    .single();

  if (error) throw error;
  return data ? mapPlaceRow(data as PlaceRow) : null;
}

export async function deletePlace(placeId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const { error } = await supabase.from("places").delete().eq("id", placeId);
  if (error) throw error;
}
