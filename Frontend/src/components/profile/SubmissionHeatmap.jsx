import { useMemo } from "react";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKS = 53;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// The backend groups submissions by UTC date, so the grid is built in UTC too
const toKey = (date) => date.toISOString().slice(0, 10);

function cellColor(count) {
  if (!count) return "#202226";
  if (count === 1) return "#1d2a22";
  if (count <= 3) return "#2c4636";
  if (count <= 6) return "#3e6a4f";
  return "#5a9470";
}

function buildGrid(calendar) {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  // Start on the Sunday 52 weeks before this week's Sunday
  const start = new Date(today.getTime() - (today.getUTCDay() + (WEEKS - 1) * 7) * DAY_MS);

  const weeks = [];
  const monthLabels = [];
  let lastMonth = null;
  for (let w = 0; w < WEEKS; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start.getTime() + (w * 7 + d) * DAY_MS);
      if (date > today) {
        days.push(null);
        continue;
      }
      const key = toKey(date);
      days.push({ key, date, count: calendar[key] || 0 });
    }
    // Label the first column of each month (the week's Sunday decides the month)
    const month = days[0].date.getUTCMonth();
    if (month !== lastMonth) {
      monthLabels.push({ week: w, label: MONTHS[month] });
      lastMonth = month;
    }
    weeks.push(days);
  }
  // Drop the first label if the next one starts right after it (they would overlap)
  if (monthLabels.length > 1 && monthLabels[1].week - monthLabels[0].week < 3) {
    monthLabels.shift();
  }
  return { weeks, monthLabels };
}

function computeStats(calendar) {
  const activeKeys = Object.keys(calendar).filter((k) => calendar[k] > 0).sort();
  const total = activeKeys.reduce((sum, k) => sum + calendar[k], 0);

  let maxStreak = 0;
  let streak = 0;
  let previous = null;
  for (const key of activeKeys) {
    const time = Date.parse(`${key}T00:00:00Z`);
    streak = previous !== null && time - previous === DAY_MS ? streak + 1 : 1;
    maxStreak = Math.max(maxStreak, streak);
    previous = time;
  }
  return { total, activeDays: activeKeys.length, maxStreak };
}

export default function SubmissionHeatmap({ calendar = {} }) {
  const { weeks, monthLabels } = useMemo(() => buildGrid(calendar), [calendar]);
  const { total, activeDays, maxStreak } = useMemo(() => computeStats(calendar), [calendar]);

  return (
    <section className="bg-[#1a1b1f] border border-[#2a2c31] rounded-xl p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <h2 className="text-sm text-[#9a9ca3]">
          <span className="text-base font-semibold text-white tabular-nums">{total}</span> submissions in the past one year
        </h2>
        <div className="flex gap-4 text-xs text-[#9a9ca3]">
          <span>
            Total active days: <span className="font-semibold text-white tabular-nums">{activeDays}</span>
          </span>
          <span>
            Max streak: <span className="font-semibold text-white tabular-nums">{maxStreak}</span>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="inline-flex flex-col gap-1.5 min-w-max">
          <div className="relative h-4 text-[10px] text-[#9a9ca3]">
            {monthLabels.map(({ week, label }) => (
              <span key={`${week}-${label}`} className="absolute" style={{ left: week * 16 }}>
                {label}
              </span>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {weeks.map((days, w) => (
              <div key={w} className="flex flex-col gap-[3px]">
                {days.map((day, d) =>
                  day ? (
                    <div
                      key={day.key}
                      title={`${day.count} submission${day.count === 1 ? "" : "s"} on ${day.date.toLocaleDateString(undefined, { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" })}`}
                      className="w-[13px] h-[13px] rounded-[2px]"
                      style={{ backgroundColor: cellColor(day.count) }}
                    />
                  ) : (
                    <div key={`empty-${d}`} className="w-[13px] h-[13px]" />
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-[#9a9ca3]">
        <span className="mr-1">Less</span>
        {[0, 1, 2, 4, 7].map((n) => (
          <span key={n} className="w-[13px] h-[13px] rounded-[2px]" style={{ backgroundColor: cellColor(n) }} />
        ))}
        <span className="ml-1">More</span>
      </div>
    </section>
  );
}
