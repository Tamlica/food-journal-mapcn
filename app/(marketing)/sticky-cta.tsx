"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function TourEndMarker() {
  const [past, setPast] = useState(false);

  return (
    <>
      <motion.div
        aria-hidden
        style={{ height: 1 }}
        whileInView={{ opacity: 1 }}
        onViewportEnter={() => setPast(true)}
        onViewportLeave={() => setPast(false)}
        viewport={{ margin: "0px 0px 200px 0px" }}
      />
      <motion.div
        className="sticky-cta"
        initial={false}
        animate={
          past ? { y: 0, opacity: 1 } : { y: 24, opacity: 0 }
        }
        transition={{ duration: 0.35, ease: EASE_OUT }}
        style={{ pointerEvents: past ? "auto" : "none" }}
      >
        <span className="wordmark" style={{ fontSize: "var(--text-sm)" }}>
          MakanMap
        </span>
        <Link href="/app" className="cta-link">
          Open the map →
        </Link>
      </motion.div>
    </>
  );
}
