import { seriesColor } from "./chart-utils.js";

/**
 * Chart drawing primitives
 * -----------------------------------------------------------------------------
 * The rendering half of the shared chart plumbing: grid, axes, legend, tooltip
 * and the table fallback. Scales, measuring and the series palette live in
 * `chart-utils.js` - see the note there for why they are split.
 *
 * These emit plain SVG that inherits colour from Tailwind classes, so a chart
 * never hardcodes a hex.
 */

/** Horizontal grid lines. Recessive by design - they are not the data. */
export function GridLines({ ticks, scale, x1, x2 }) {
  return (
    <g aria-hidden>
      {ticks.map((t) => (
        <line
          key={t}
          x1={x1}
          x2={x2}
          y1={scale(t)}
          y2={scale(t)}
          className="stroke-border-default"
          strokeWidth="1"
        />
      ))}
    </g>
  );
}

/**
 * Category labels along the bottom.
 *
 * `stride` renders every Nth label. Axis labels that overlap are worse than
 * absent ones - they read as garbage - so a caller that cannot fit them all
 * thins them rather than shrinking the type past legibility. The Figma frames
 * do the same thing by hand, labelling every other bar.
 *
 * The full set stays reachable: every mark carries a <title>, and each chart
 * ships a "View data" table.
 */
export function XAxisLabels({ labels, scale, y, stride = 1 }) {
  return (
    <g aria-hidden>
      {labels.map((label, i) =>
        i % stride === 0 ? (
          <text
            key={`${label}-${i}`}
            x={scale(i)}
            y={y}
            textAnchor="middle"
            className="fill-tertiary text-[11px]"
          >
            {label}
          </text>
        ) : null
      )}
    </g>
  );
}


/** Value labels up the left edge. */
export function YAxisLabels({ ticks, scale, x, format = (v) => v }) {
  return (
    <g aria-hidden>
      {ticks.map((t) => (
        <text
          key={t}
          x={x}
          y={scale(t) + 4}
          textAnchor="end"
          className="fill-tertiary text-[11px]"
        >
          {format(t)}
        </text>
      ))}
    </g>
  );
}

/**
 * Legend. Always rendered for two or more series - identity must never be
 * carried by colour alone, and the palette's contrast warning obliges a
 * visible label besides.
 */
export function ChartLegend({ items, className = "" }) {
  return (
    <ul
      className={`flex list-none flex-wrap items-center gap-x-4 gap-y-1 p-0 ${className}`}
    >
      {items.map((item, i) => (
        <li key={item.label} className="flex items-center gap-2 text-sm text-tertiary">
          <span
            aria-hidden
            className="size-2 shrink-0 rounded-full"
            style={{ background: item.color ?? seriesColor(i) }}
          />
          {item.label}
          {item.value != null && (
            <span className="font-medium text-primary">{item.value}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * Tooltip bubble positioned over the plot. Charts own the hit-testing; this is
 * only the presentation, so every chart's tooltip looks the same.
 */
export function ChartTooltip({ x, y, width, children }) {
  // Keep the bubble inside the plot rather than letting it clip at the edge.
  const clamped = Math.min(Math.max(x, 70), Math.max(width - 70, 70));
  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border border-border-default bg-surface px-3 py-2 text-xs whitespace-nowrap shadow-md"
      style={{ left: clamped, top: y }}
    >
      {children}
    </div>
  );
}

/**
 * Table fallback for a chart's own values.
 *
 * The dataviz guidance asks for a table view alongside any chart whose series
 * sit under the contrast floor. It is collapsed so it does not compete with
 * the plot, but it is real markup, so screen readers and Ctrl-F find it.
 */
export function ChartDataTable({ caption, columns, rows }) {
  return (
    <details className="mt-3">
      <summary className="cursor-pointer text-xs text-tertiary hover:text-secondary">
        View data
      </summary>
      <table className="mt-2 w-full border-collapse text-xs">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c}
                scope="col"
                className="border-b border-border-default py-1 text-left font-medium text-tertiary"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="border-b border-border-subtle py-1 text-primary">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
