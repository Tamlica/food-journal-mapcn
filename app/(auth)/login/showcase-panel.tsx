import Image from "next/image";
import { Star } from "lucide-react";

export function ShowcasePanel() {
  return (
    <aside className="relative hidden overflow-hidden rounded-3xl border border-border lg:block">
      <Image
        src="/screenshot-map.png"
        alt="The MakanMap dashboard over South Jakarta, with color-coded pins for places visited, wanted, and avoided."
        fill
        priority
        sizes="(min-width: 64rem) 40rem, 0px"
        className="object-cover object-left-top"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

      <div className="absolute inset-x-0 bottom-0 p-8 text-white">
        <div className="flex gap-1 text-amber-400" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="size-4 fill-current" />
          ))}
        </div>
        <p className="mt-3 text-lg font-medium leading-snug">
          Remember where you ate — not just what. Every warung, pinned exactly
          where it is.
        </p>
        <p className="mt-3 text-sm font-semibold">MakanMap</p>
        <p className="text-xs text-white/70">A food journal, on a map</p>

        <div className="mt-4 flex justify-end gap-1.5" aria-hidden="true">
          <span className="h-1.5 w-6 rounded-full bg-primary" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
        </div>
      </div>
    </aside>
  );
}
