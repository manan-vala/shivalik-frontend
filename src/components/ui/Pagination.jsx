import Icon from "./Icon.jsx";

/**
 * Pagination
 * -----------------------------------------------------------------------------
 * Segmented previous / add / next control that sits under the data tables.
 *
 * Figma (node 790:56280) shows three joined square buttons: back arrow, plus,
 * forward arrow. The arrows reuse the `arrow-up` glyph rotated, rather than
 * shipping three near-identical assets.
 */
export default function Pagination({
  onPrevious,
  onNext,
  onAdd,
  hasPrevious = true,
  hasNext = true,
}) {
  return (
    // w-fit + self-start so the group hugs its buttons rather than stretching
    // to fill a flex-col parent, which is how every page lays out its sections.
    <div className="inline-flex w-fit self-start overflow-hidden rounded-md border border-border-strong shadow-xs">
      <PageButton
        onClick={onPrevious}
        disabled={!hasPrevious}
        label="Previous page"
        rotate="-rotate-90"
      />
      <button
        type="button"
        onClick={onAdd}
        aria-label="Add row"
        className="border-l border-border-strong bg-surface p-2.5 text-tertiary transition-colors hover:bg-muted hover:text-primary disabled:opacity-50"
      >
        <Icon name="plus" size="md" />
      </button>
      <PageButton
        onClick={onNext}
        disabled={!hasNext}
        label="Next page"
        rotate="rotate-90"
        bordered
      />
    </div>
  );
}

function PageButton({ onClick, disabled, label, rotate, bordered }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={[
        "bg-surface p-2.5 text-tertiary transition-colors",
        "hover:bg-muted hover:text-primary",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface",
        bordered ? "border-l border-border-strong" : "",
      ].join(" ")}
    >
      <Icon name="arrow-up" size="md" className={rotate} />
    </button>
  );
}
