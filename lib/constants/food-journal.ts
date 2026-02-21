import type { PlaceStatus } from "@/lib/types/food-journal";

export const PLACE_STATUS_OPTIONS: Array<{ value: PlaceStatus; label: string }> = [
  { value: "visited", label: "Visited" },
  { value: "want_to_go", label: "Want to Go" },
  { value: "avoid", label: "Avoid" },
];

export const MIN_PRICE_IDR = 20000;
export const MAX_PRICE_IDR = 200000;
export const PRICE_STEP_IDR = 5000;

export const DEFAULT_FILTERS = {
  statuses: ["visited", "want_to_go", "avoid"] as PlaceStatus[],
  minRating: 1,
  priceMin: MIN_PRICE_IDR,
  priceMax: MAX_PRICE_IDR,
  tagIds: [] as string[],
};

export const STATUS_STYLE: Record<
  PlaceStatus,
  {
    label: string;
    dotClassName: string;
    pointColor: string;
    pointSizeClassName: string;
    clusterColors: [string, string, string];
    iconLabel: string;
  }
> = {
  visited: {
    label: "Visited",
    dotClassName: "bg-emerald-400",
    pointColor: "#34d399",
    pointSizeClassName: "size-3.5",
    clusterColors: ["#34d399", "#059669", "#047857"],
    iconLabel: "Check",
  },
  want_to_go: {
    label: "Want to Go",
    dotClassName: "bg-sky-400",
    pointColor: "#38bdf8",
    pointSizeClassName: "size-3",
    clusterColors: ["#38bdf8", "#0ea5e9", "#0369a1"],
    iconLabel: "Pin",
  },
  avoid: {
    label: "Avoid",
    dotClassName: "bg-rose-400",
    pointColor: "#fb7185",
    pointSizeClassName: "size-2.5",
    clusterColors: ["#fb7185", "#f43f5e", "#be123c"],
    iconLabel: "Ban",
  },
};
