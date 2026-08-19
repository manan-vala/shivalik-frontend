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

/**
 * Numbered pagination - "Previous 1 2 3 … 8 9 10 Next".
 *
 * The Vendor detail dialog's Order and Payment tabs (nodes 1180:48212,
 * 1180:48262) use this rather than the three-button group above; it is a
 * different control, not a variant, because it exposes page numbers and sits
 * inside a dialog rather than under a full-page table.
 *
 * `total` is the page count. Ellipsis is inserted rather than rendering every
 * number when the range is wide, matching the Figma frames' "1 2 3 … 8 9 10".
 */
export function NumberedPagination({
  page = 1,
  total = 10,
  onChange,
  siblings = 1,
}) {
  const pages = pageRange(page, total, siblings);

  return (
    <nav
      aria-label="Pagination"
      className="inline-flex w-fit self-start overflow-hidden rounded-md border border-border-strong shadow-xs"
    >
      <EdgeButton
        onClick={() => onChange?.(page - 1)}
        disabled={page <= 1}
        rotate="-rotate-90"
        side="leading"
      >
        Previous
      </EdgeButton>

      {pages.map((p, i) =>
        p === ELLIPSIS ? (
          <span
            key={`gap-${i}`}
            aria-hidden
            className="border-l border-border-strong bg-surface px-3 py-2.5 text-sm text-tertiary"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange?.(p)}
            aria-current={p === page ? "page" : undefined}
            className={[
              "border-l border-border-strong px-4 py-2.5 text-sm font-medium transition-colors",
              p === page
                ? "bg-muted text-primary"
                : "bg-surface text-tertiary hover:bg-muted hover:text-primary",
            ].join(" ")}
          >
            {p}
          </button>
        )
      )}

      <EdgeButton
        onClick={() => onChange?.(page + 1)}
        disabled={page >= total}
        rotate="rotate-90"
        side="trailing"
      >
        Next
      </EdgeButton>
    </nav>
  );
}

const ELLIPSIS = "…";

/**
 * Pages to render: always the first and last, plus `siblings` either side of
 * the current page, with an ellipsis standing in for any gap.
 */
function pageRange(page, total, siblings) {
  const keep = new Set([1, total]);
  for (let p = page - siblings; p <= page + siblings; p += 1) {
    if (p >= 1 && p <= total) keep.add(p);
  }
  // The Figma frames show three numbers at each end, so the first and last
  // blocks stay legible rather than collapsing to a single number.
  for (let p = 1; p <= Math.min(3, total); p += 1) keep.add(p);
  for (let p = Math.max(1, total - 2); p <= total; p += 1) keep.add(p);

  const sorted = [...keep].sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(ELLIPSIS);
    out.push(p);
  });
  return out;
}

function EdgeButton({ children, onClick, disabled, rotate, side }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "flex items-center gap-2 bg-surface px-3.5 py-2.5 text-sm font-medium text-secondary transition-colors",
        "hover:bg-muted hover:text-primary",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface",
        side === "trailing" ? "border-l border-border-strong" : "",
      ].join(" ")}
    >
      {side === "leading" && <Icon name="arrow-up" size="md" className={rotate} />}
      {children}
      {side === "trailing" && <Icon name="arrow-up" size="md" className={rotate} />}
    </button>
  );
}
