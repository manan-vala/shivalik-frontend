/**
 * SegmentedToggle
 * -----------------------------------------------------------------------------
 * A row of mutually exclusive options where exactly one is active.
 *
 * The Analytics screens draw this three times with the same behaviour and two
 * different skins, so it is one component rather than three:
 *   7d / 30d / 90d / Custom       separate pills   (nodes 1180:52808 etc.)
 *   Revenue / Collected           joined pair      (node 1180:53377)
 *   0-30d / 31-60d / 61-90d / 90d+ joined group    (node 1180:53377)
 *
 * `joined` picks the skin: separate rounded buttons with gaps, or one grouped
 * control with a shared track. Behaviour and markup are identical either way.
 *
 * Implemented as a radio group rather than buttons so arrow keys move between
 * options and the active one is announced as selected.
 */
export default function SegmentedToggle({
  options,
  value,
  onChange,
  joined = false,
  label,
  className = "",
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={[
        joined
          ? "inline-flex overflow-hidden rounded-md bg-muted p-1"
          : "inline-flex gap-2",
        className,
      ].join(" ")}
    >
      {options.map((option) => {
        const id = typeof option === "string" ? option : option.id;
        const text = typeof option === "string" ? option : option.label;
        const active = id === value;

        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(id)}
            onKeyDown={(e) => onKeyDown(e, options, value, onChange)}
            className={[
              "cursor-pointer px-3.5 py-2 text-sm font-medium transition-colors",
              joined ? "rounded-sm" : "rounded-md border shadow-xs",
              active
                ? joined
                  ? "bg-brand text-inverse"
                  : "border-brand bg-brand text-inverse"
                : joined
                  ? "text-tertiary hover:text-secondary"
                  : "border-border-strong bg-surface text-secondary hover:bg-muted",
            ].join(" ")}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}

/** Arrow keys move the selection, which is what a radio group is expected to do. */
function onKeyDown(e, options, value, onChange) {
  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
  e.preventDefault();

  const ids = options.map((o) => (typeof o === "string" ? o : o.id));
  const i = ids.indexOf(value);
  const next =
    e.key === "ArrowRight"
      ? (i + 1) % ids.length
      : (i - 1 + ids.length) % ids.length;
  onChange(ids[next]);
}
