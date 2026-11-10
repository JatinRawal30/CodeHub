import { useId } from "react";
import { motion, AnimatePresence, MotionConfig } from "motion/react";

// Always 7 slots once there are more than 7 pages, so the row never changes width:
// [1 2 3 4 5 … 20]  [1 … 9 10 11 … 20]  [1 … 16 17 18 19 20]
export function pageItems(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "end-gap", total];
  if (current >= total - 3) return [1, "start-gap", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "start-gap", current - 1, current, current + 1, "end-gap", total];
}

const tile =
  "h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center border border-line bg-surface shadow-card text-fg-muted";
const lift = { y: -3, boxShadow: "var(--shadow-raised)" };
const spring = { type: "spring", stiffness: 400, damping: 22 };

function Arrow({ direction }) {
  return (
    <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === "prev" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
    </svg>
  );
}

function StepButton({ direction, disabled, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous page" : "Next page"}
      className={`${tile} enabled:hover:text-fg enabled:cursor-pointer disabled:opacity-40`}
      whileHover={disabled ? undefined : lift}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      transition={spring}
    >
      <Arrow direction={direction} />
    </motion.button>
  );
}

// Controlled: the parent owns the page (it also drives the API request)
export default function ContinuousPagination({ currentPage, totalPages, onPageChange, disabled = false }) {
  const layoutId = useId(); // unique per instance so two paginations don't share one active tile

  const go = (page) => {
    if (disabled || page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  return (
    // reducedMotion="user": no lifts, slides or shimmer for people who turned motion off
    <MotionConfig reducedMotion="user">
      <nav aria-label="Pagination" className="flex items-center gap-1.5 sm:gap-2">
        <StepButton direction="prev" disabled={disabled || currentPage <= 1} onClick={() => go(currentPage - 1)} />

        {pageItems(currentPage, totalPages).map((item) => {
          if (typeof item === "string") {
            return (
              <span key={item} className="w-6 sm:w-8 text-center text-code-sm text-fg-subtle select-none" aria-hidden="true">
                …
              </span>
            );
          }

          const isActive = item === currentPage;
          return (
            <motion.button
              key={item}
              type="button"
              onClick={() => go(item)}
              disabled={disabled && !isActive}
              aria-label={`Page ${item}`}
              aria-current={isActive ? "page" : undefined}
              className={`relative ${tile} text-code-md transition-colors duration-200 ${
                isActive ? "text-primary-fg border-transparent" : "enabled:hover:text-fg enabled:cursor-pointer disabled:opacity-60"
              }`}
              whileHover={isActive || disabled ? undefined : lift}
              whileTap={isActive || disabled ? undefined : { scale: 0.92 }}
              transition={spring}
            >
              <AnimatePresence>
                {isActive && (
                  // slides from the old page to the new one (shared layoutId)
                  <motion.span
                    layoutId={layoutId}
                    className="absolute -inset-px rounded-lg overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, var(--ring) 0%, var(--primary) 55%, var(--primary-hover) 100%)",
                      boxShadow: "0 6px 14px -4px rgba(79, 70, 229, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25), inset 0 -3px 6px 0 rgba(0, 0, 0, 0.18)",
                    }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 26, mass: 0.8 }}
                  >
                    {/* occasional light sweep across the active tile */}
                    <motion.span
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255, 255, 255, 0.28) 50%, transparent 70%)" }}
                      initial={{ x: "-100%" }}
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
                    />
                  </motion.span>
                )}
              </AnimatePresence>
              <span className="relative z-10 font-semibold">{item}</span>
            </motion.button>
          );
        })}

        <StepButton direction="next" disabled={disabled || currentPage >= totalPages} onClick={() => go(currentPage + 1)} />
      </nav>
    </MotionConfig>
  );
}
