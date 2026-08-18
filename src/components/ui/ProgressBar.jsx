/**
 * ProgressBar
 * -----------------------------------------------------------------------------
 * The Knowledge Base table's "Helpful" column (node 1180:37492): an 8px track
 * with a filled segment and a trailing percentage label.
 *
 * Figma: track brand-subtle (primary-50), fill brand (primary-600), label
 * 14/20 medium secondary.
 */
export default function ProgressBar({ value }) {
  return (
    <div className="flex w-full items-center gap-3">
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 flex-1 overflow-hidden rounded-full bg-brand-subtle"
      >
        <div
          className="h-full rounded-full bg-brand"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="tabular shrink-0 text-sm font-medium text-secondary">
        {value}%
      </span>
    </div>
  );
}
