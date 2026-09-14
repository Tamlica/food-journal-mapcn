"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

type FaqEntry = {
  question: string;
  answer: React.ReactNode;
};

export function Faq({ items }: { items: FaqEntry[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="faq">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div className="faq-item" key={item.question}>
            <button
              type="button"
              className="faq-item__question"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              <span>{item.question}</span>
              <motion.span
                className="faq-item__marker"
                aria-hidden
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
              >
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  className="faq-item__answer-wrap"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE_OUT }}
                >
                  <p className="faq-item__answer">{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
