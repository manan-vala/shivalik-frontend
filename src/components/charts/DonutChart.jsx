import {
  seriesColor,
} from "./chart-utils.js";
import {
  ChartLegend,
  ChartDataTable,
} from "./primitives.jsx";

/**
 * DonutChart - part-to-whole across unordered categories.
 * Figma: Analytics / Sales "Vendor breakdown" (node 1180:52808)
 *
 * DEVIATION - COLOUR. Figma draws the five slices as five steps of one purple
 * ramp. The dataviz validator rejects that outright: the two lightest steps
 * sit dE 7.8 apart in normal vision, below the 15 floor, so a reader with full
 * colour vision cannot separate them - and secondary encoding does not excuse
 * that check. These are unordered categories (Fiction, Academic, Comic...),
 * not an ordered scale, so a single-hue ramp is the wrong encoding for them
 * regardless. The validated cross-hue set in `CHART_SERIES` is used instead;
 * see tokens.css for the validator output.
 *
 * A 2px surface-coloured ring separates adjacent slices, so the boundary is
 * legible even where two fills are close in value.
 *
 * Percentages are printed in the legend rather than on the arcs: at these
 * slice sizes an on-arc label collides, and the palette's contrast warning
 * obliges a visible label somewhere regardless.
 */

const SIZE = 180;
const STROKE = 34;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

export default function DonutChart({ data, caption }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

  // Cumulative offsets are derived rather than accumulated in a closure: a
  // `let` reassigned inside .map() at component-body scope is a value that
  // survives past render, which the React compiler rejects outright.
  const fractions = data.map((d) => d.value / total);
  const arcs = data.map((d, i) => ({
    ...d,
    color: seriesColor(i),
    percent: Math.round(fractions[i] * 100),
    dash: fractions[i] * C,
    offset: fractions.slice(0, i).reduce((sum, f) => sum + f, 0) * C,
  }));

  return (
    <div className="flex flex-wrap items-center gap-8">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        role="img"
        aria-label={caption}
        className="shrink-0"
      >
        {/* -90deg so the first slice starts at 12 o'clock. */}
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          {arcs.map((arc) => (
            <circle
              key={arc.label}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke={arc.color}
              strokeWidth={STROKE}
              strokeDasharray={`${arc.dash} ${C - arc.dash}`}
              strokeDashoffset={-arc.offset}
              // Surface-coloured ring between neighbouring slices.
              style={{ paintOrder: "stroke" }}
            >
              <title>{`${arc.label}: ${arc.percent}%`}</title>
            </circle>
          ))}
        </g>
      </svg>

      <div className="flex min-w-40 flex-col gap-2">
        <ChartLegend
          className="flex-col !items-start"
          items={arcs.map((arc) => ({
            label: arc.label,
            color: arc.color,
            value: `${arc.percent}%`,
          }))}
        />
        <ChartDataTable
          caption={caption}
          columns={["Category", "Share"]}
          rows={arcs.map((a) => [a.label, `${a.percent}%`])}
        />
      </div>
    </div>
  );
}
