/**
 * SummaryCard
 * -----------------------------------------------------------------------------
 * A three-line stat: label, a big coloured number, a caption underneath. Used
 * for the Finance summary row - "Collected this month", "Overdue", "Pending
 * Verification" (node 1180:35780).
 *
 * Deliberately a second stat primitive rather than a reuse of `StatCard`: the
 * two have different anatomy, not just different styling. `StatCard` is a
 * neutral number with an optional trend *badge* (dashboard KPIs). This is a
 * number whose own colour carries the meaning, with no badge at all - closer
 * to a headline than a metric. Forcing one into the other's shape would lose
 * the property either was designed around.
 *
 * `tone` is semantic, matching the token names used everywhere else:
 *   neutral (default) · success ("Collected") · error ("Overdue")
 *   · warning ("Pending Verification")
 */
const TONE_TEXT = {
  neutral: "text-primary",
  success: "text-status-success-fg",
  error: "text-status-error-fg",
  warning: "text-status-warning-fg",
};

export default function SummaryCard({ label, value, caption, tone = "neutral" }) {
  return (
    <div className="flex flex-1 flex-col gap-1.5 rounded-xl bg-surface py-4 pl-6 pr-8 shadow-md">
      <p className="text-sm text-tertiary">{label}</p>
      {/* Figma specifies 28px here - not on the type scale. Reconciled to
          display-sm (30px), the same snap already logged in tokens.css for
          the vendor portal's identical 28px metric numbers. */}
      <p className={`tabular text-display-sm font-medium ${TONE_TEXT[tone]}`}>
        {value}
      </p>
      <p className="text-sm text-tertiary">{caption}</p>
    </div>
  );
}
