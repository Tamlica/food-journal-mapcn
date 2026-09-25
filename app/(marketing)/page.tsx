"use client";

import Image from "next/image";
import Link from "next/link";
import { MotionConfig, motion } from "motion/react";

import { TourFigure } from "./tour-figure";
import { TourEndMarker } from "./sticky-cta";
import { Faq } from "./faq";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

function RevealSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, ease: EASE_OUT }}
    >
      {children}
    </motion.section>
  );
}

const faqItems = [
  {
    question: "Do I need to sign up?",
    answer:
      "Yes — a free account keeps your pins yours, private from everyone else's map.",
  },
  {
    question: "Does it only work in Jakarta?",
    answer:
      "It opens centred on Indonesia, but you can drop a pin and log a place anywhere. Prices are just set up for rupiah.",
  },
  {
    question: "Where do my photos go?",
    answer:
      "Straight into storage alongside everything else you log — no separate photo app to juggle.",
  },
  {
    question: "Can I get directions from here?",
    answer:
      "Yes — every place keeps turn-by-turn directions on hand, with alternate routes if the first one's blocked.",
  },
];

export default function MarketingHome() {
  return (
    <MotionConfig reducedMotion="user">
      <header className="page nav-edge">
        <Link href="/" className="wordmark">
          MakanMap
        </Link>
        <Link href="/app" className="cta-link">
          Open the map →
        </Link>
      </header>

      <main className="page">
        <motion.div
          className="hero"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
        >
          <motion.div
            className="hero__copy"
            variants={{
              hidden: { opacity: 0, y: 18 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
            }}
          >
            <h1 className="hero__headline">
              You are standing outside a warung you will not remember
              the name of by Thursday.
            </h1>
            <p className="hero__lede">
              MakanMap is a food journal built around a map, because
              that&rsquo;s actually how you remember where you ate —
              not the name, but the corner, the two doors down from
              the parking lot.
            </p>
            <Link href="/app" className="cta-button">
              Open the map →
            </Link>
          </motion.div>

          <motion.figure
            className="hero__shot"
            variants={{
              hidden: { opacity: 0, y: 18 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
            }}
          >
            <Image
              src="/screenshot-map.png"
              alt="The MakanMap dashboard over South Jakarta, with color-coded pins for places visited, wanted, and avoided."
              width={1400}
              height={900}
              priority
              sizes="(min-width: 60rem) 40rem, 100vw"
            />
            <figcaption>
              Every place you&rsquo;ve logged, pinned where it actually
              is — <strong>visited</strong>, <strong>want to go</strong>,
              or <strong>avoid</strong>. Colour-coded, always.
            </figcaption>
          </motion.figure>
        </motion.div>

        <RevealSection className="facts">
          <span>
            <strong>3</strong> statuses — visited, want to go, avoid
          </span>
          <span>One map, not a feed</span>
          <span>Prices in rupiah</span>
        </RevealSection>

        <div className="tour">
          <TourFigure
            src="/screenshot-form-1.png"
            alt="The MakanMap add-place form, showing status, a half-star rating, an IDR price slider, and an open date picker."
            heading="Add a place before the bill comes."
            description={
              <>
                Drop a pin on the map, or search for it by name. Rate
                it if you&rsquo;re rating it, set the price in rupiah,
                snap a photo — the whole thing takes less time than
                waiting for the check.
              </>
            }
          />

          <TourFigure
            src="/screenshot-filters.png"
            alt="The MakanMap filter panel, showing status, minimum rating, price range, and tag filters over the map."
            align="end"
            heading="Find it again, on purpose."
            description={
              <>
                Narrow by status, rating, price, or tag, and watch the
                map redraw itself instantly — no scrolling a list that
                only gets longer.
              </>
            }
          />
        </div>

        <RevealSection>
          <h2 className="section-head">What else it does.</h2>
          <div className="info-rows">
            <div className="info-row">
              <p className="info-row__label">Directions</p>
              <p className="info-row__desc">
                Every saved place keeps turn-by-turn directions on
                hand, with alternate routes if the first one&rsquo;s
                blocked.
              </p>
            </div>
            <div className="info-row">
              <p className="info-row__label">Tags</p>
              <p className="info-row__desc">
                Colour-coded tags you make up yourself, so &ldquo;date
                spot&rdquo; and &ldquo;cheap eats&rdquo; mean something
                when you filter later.
              </p>
            </div>
            <div className="info-row">
              <p className="info-row__label">Photos</p>
              <p className="info-row__desc">
                A few photos per place, saved right alongside the
                notes — not scattered across your camera roll.
              </p>
            </div>
            <div className="info-row">
              <p className="info-row__label">Price range</p>
              <p className="info-row__desc">
                Not stars or dollar signs — an actual IDR range you set
                yourself, per place.
              </p>
            </div>
          </div>
        </RevealSection>

        <RevealSection>
          <h2 className="section-head">Why a map, not a list.</h2>
          <div className="founder-note">
            <p>
              I kept losing track of places I&rsquo;d actually liked.
              Bookmarks scattered across apps, screenshots I&rsquo;d
              never reopen, a note titled &ldquo;food??&rdquo; with nine
              names in no order and no context.
            </p>
            <p>
              None of that answered the one question that actually
              mattered: what&rsquo;s near me right now? So MakanMap only
              does one thing — it remembers where you ate, exactly
              where that was, and makes it easy to go back.
            </p>
            <span className="founder-note__sign">— MakanMap</span>
          </div>
        </RevealSection>

        <RevealSection>
          <h2 className="section-head">Questions.</h2>
          <Faq items={faqItems} />
        </RevealSection>

        <TourEndMarker />
      </main>

      <footer className="foot-letter page">
        <div className="foot-letter__inner">
          <p className="foot-letter__close">
            Yours, in queues outside warungs and reservations you almost
            missed.
            <br />
            <span className="foot-letter__sign">— MakanMap</span>
          </p>
          <p className="foot-letter__ps">
            P.S. — the map is right here.{" "}
            <Link href="/app" className="cta-link">
              Open the map →
            </Link>
          </p>
          <p className="foot-letter__ps">
            <Link href="/privacy" className="cta-link">
              Privacy
            </Link>{" "}
            ·{" "}
            <Link href="/terms" className="cta-link">
              Terms
            </Link>
          </p>
        </div>
      </footer>
    </MotionConfig>
  );
}
