import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./marketing.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "MakanMap — a food journal, on a map",
  description:
    "Track the places you've eaten, want to try, or are avoiding — pinned on a map, with photos, ratings, and prices in rupiah.",
};

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className={`marketing ${fraunces.variable}`}>{children}</div>;
}
