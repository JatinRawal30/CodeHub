import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { TOPICS } from "../constants/topics";

const arrowClass =
  "flex size-10 items-center justify-center rounded-full bg-surface text-fg-muted transition-colors enabled:cursor-pointer enabled:hover:bg-surface-hover enabled:hover:text-fg disabled:opacity-30";

function Chevron({ direction }) {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === "prev" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
    </svg>
  );
}

// Topic cards in a scroll-snap row; the arrows move it one screenful at a time.
// `counts` is { tag: number of problems }, or null until it loads.
export default function TopicSlider({ counts }) {
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateArrows = () => {
    const track = trackRef.current;
    if (!track) return;
    setCanPrev(track.scrollLeft > 1);
    setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 1);
  };

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, []);

  const page = (direction) => {
    const track = trackRef.current;
    track?.scrollBy({ left: direction * track.clientWidth });
  };

  return (
    <section aria-label="Explore by topic" className="mt-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-fg-subtle">Explore by topic</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">Pick a path, start practising</h2>
        </div>
        <div className="flex gap-2">
          <button type="button" className={arrowClass} onClick={() => page(-1)} disabled={!canPrev} aria-label="Previous topics">
            <Chevron direction="prev" />
          </button>
          <button type="button" className={arrowClass} onClick={() => page(1)} disabled={!canNext} aria-label="Next topics">
            <Chevron direction="next" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={updateArrows}
        className="-ml-4 flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] motion-reduce:scroll-auto sm:-ml-6"
      >
        {TOPICS.map((topic) => (
          <div key={topic.slug} className="shrink-0 basis-1/2 snap-start pl-4 sm:basis-1/3 sm:pl-6 md:basis-1/4 lg:basis-1/5">
            <Link
              to={{ search: `?topic=${topic.slug}` }}
              preventScrollReset
              className="group block rounded-2xl -outline-offset-2"
            >
              <div className="overflow-hidden rounded-2xl bg-surface">
                <img
                  src={topic.image}
                  alt={topic.alt}
                  width={816}
                  height={816}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                />
              </div>
              <div className="mt-3 px-1">
                <p className={`font-display text-base font-medium ${topic.color}`}>{topic.title}</p>
                <p className="mt-0.5 text-sm text-fg-muted transition-colors group-hover:text-fg">
                  {counts ? `${counts[topic.tag] ?? 0} problems →` : "Browse →"}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
