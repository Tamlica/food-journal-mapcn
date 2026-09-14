"use client";

import Image from "next/image";
import { motion } from "motion/react";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function TourFigure({
  src,
  alt,
  heading,
  description,
  align = "start",
}: {
  src: string;
  alt: string;
  heading: string;
  description: React.ReactNode;
  align?: "start" | "end";
}) {
  return (
    <motion.div
      className={`tour-section${align === "end" ? " tour-section--end" : ""}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.12 } },
      }}
    >
      <motion.figure
        className="screenshot-frame"
        whileHover={{ y: -3 }}
        transition={{ duration: 0.25, ease: EASE_OUT }}
        variants={{
          hidden: { opacity: 0, y: 28 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={1400}
          height={900}
          sizes="(min-width: 60rem) 40rem, 100vw"
          className="screenshot-frame__img"
        />
      </motion.figure>
      <motion.div
        className="tour-section__copy"
        variants={{
          hidden: { opacity: 0, y: 18 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
        }}
      >
        <h2 className="tour-section__heading">{heading}</h2>
        <p className="tour-caption">{description}</p>
      </motion.div>
    </motion.div>
  );
}
