/**
 * Badge
 * -----------------------------------------------------------------------------
 * Status pill. Bound to the semantic status tokens, so the same component
 * carries every vocabulary in the product - Active/Inactive on Clients,
 * In Printing/In Binding/Ready for Dispatch on Orders, Present/Late on Staff -
 * without a colour ever being named at the call site.
 *
 *   <Badge tone="success">Active</Badge>
 *   <Badge tone="alert">Inactive</Badge>
 *
 * Geometry from Figma: px-8 py-2, radius 16, 12/18 medium.
 * `size="md"` (px-10, 14/20) matches the count badge in the sidebar.
 */

const TONES = {
  success: "bg-status-success-bg text-status-success-fg",
  warning: "bg-status-warning-bg text-status-warning-fg",
  error: "bg-status-error-bg text-status-error-fg",
  info: "bg-status-info-bg text-status-info-fg",
  progress: "bg-status-progress-bg text-status-progress-fg",
  alert: "bg-status-alert-bg text-status-alert-fg",
  brand: "bg-status-brand-bg text-status-brand-fg",
  neutral: "bg-status-neutral-bg text-status-neutral-fg",
};

const SIZES = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-0.5 text-sm",
};

export default function Badge({
  tone = "neutral",
  size = "sm",
  children,
  className = "",
}) {
  return (
    <span
      className={[
        // gap-1 so a badge carrying a leading icon (the trend pills on the
        // dashboard) spaces correctly; it is inert on text-only badges.
        "inline-flex items-center justify-center gap-1 rounded-xl font-medium whitespace-nowrap",
        SIZES[size],
        TONES[tone],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
