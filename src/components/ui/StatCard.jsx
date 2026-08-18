import Icon from "./Icon.jsx";
import Badge from "./Badge.jsx";

/**
 * StatCard
 * -----------------------------------------------------------------------------
 * The "Metric item" from Figma - a label, a large number, and an optional
 * trend pill. One component covers all three metric rows on the dashboard
 * (KPIs, Staff Overview, Monthly Attendance); they are the same Figma instance
 * with different text, so they are the same component here.
 *
 * Figma (nodes 790:22349, 790:22392): white, 1px gray-200, radius 8, p-24,
 * gap-8; label 14/20 medium gray-500; number 30/38 semibold gray-900.
 *
 * `direction` is semantic, not decorative: "up" is success, "down" is error,
 * and the arrow rotates so the trend is never carried by colour alone.
 */
export default function StatCard({ label, value, delta, direction }) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border-default bg-surface p-6 shadow-sm">
      <p className="text-sm font-medium text-tertiary">{label}</p>

      <div className="flex items-end gap-4">
        <p className="tabular flex-1 text-display-sm font-semibold text-primary">
          {value}
        </p>

        {delta && (
          <Badge tone={direction === "down" ? "error" : "success"} size="md">
            <Icon
              name="arrow-up"
              size="sm"
              className={direction === "down" ? "rotate-180" : ""}
            />
            {delta}
          </Badge>
        )}
      </div>
    </div>
  );
}

/**
 * The 4-up responsive grid every StatCard row uses - Dashboard's KPIs, Staff
 * Overview and Monthly Attendance, and the Staff Attendance page's own two
 * rows. Extracted once it was about to repeat a fifth time.
 */
export function StatGrid({ items }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <StatCard key={item.label} {...item} />
      ))}
    </div>
  );
}
