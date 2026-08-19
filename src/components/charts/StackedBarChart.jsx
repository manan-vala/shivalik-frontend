import {
  useMeasuredWidth,
  bandScale,
  linearScale,
  niceTicks,
  labelStride,
} from "./chart-utils.js";
import {
  GridLines,
  XAxisLabels,
  ChartLegend,
  ChartDataTable,
} from "./primitives.jsx";

/**
 * StackedBarChart - ordered buckets stacked per category.
 * Figma: Analytics / Financial "AR ageing" (node 1180:53377)
 *
 * COLOUR: one purple ramp, light to dark. Unlike the donut, Figma's
 * single-hue treatment is *correct* here - 0-30d / 31-60d / 61-90d / 90d+ is
 * an ordered scale, not a set of unordered categories, and the dataviz
 * guidance asks for exactly one hue light-to-dark for that. The check that
 * applies is lightness monotonicity, which primary-200 -> 800 satisfies by
 * construction; the categorical CVD floor does not apply to a sequential ramp.
 *
 * Reading order matches the ramp: the lightest segment is the newest bucket
 * and sits on top, so "more dark" reads as "more overdue".
 *
 * A 2px surface gap separates stacked segments so the boundaries stay visible
 * where two adjacent steps are close in value.
 */

const H = 220;
const PAD_L = 8;
const PAD_R = 8;
const PAD_TOP = 12;
const AXIS_H = 28;

/** Sequential ramp, oldest (darkest) first - see the note above. */
const RAMP = [
  "var(--color-primary-800)",
  "var(--color-primary-600)",
  "var(--color-primary-400)",
  "var(--color-primary-200)",
];

export default function StackedBarChart({
  categories,
  buckets,
  emphasis,
  format = (v) => v,
  caption,
}) {
  const [ref, width] = useMeasuredWidth();
  const plotBottom = H - AXIS_H;

  const totals = categories.map((_, i) =>
    buckets.reduce((sum, b) => sum + b.values[i], 0)
  );
  const { max, ticks } = niceTicks(Math.max(...totals));
  const y = linearScale({ max, from: PAD_TOP, to: plotBottom });

  const x = bandScale({
    count: categories.length,
    from: PAD_L,
    to: width - PAD_R,
    padding: 0.45,
  });

  return (
    <div ref={ref} className="w-full">
      <svg
        viewBox={`0 0 ${width} ${H}`}
        width="100%"
        height={H}
        role="img"
        aria-label={caption}
      >
        <GridLines ticks={ticks} scale={y} x1={PAD_L} x2={width - PAD_R} />

        {categories.map((cat, i) => {
          let cursor = 0;
          return (
            <g key={cat}>
              {buckets.map((bucket, bi) => {
                const value = bucket.values[i];
                const top = y(cursor + value);
                const bottom = y(cursor);
                cursor += value;
                // 2px surface gap between segments, except under the lowest.
                const gap = bi === 0 ? 0 : 2;
                const height = Math.max(bottom - top - gap, 0);
                return (
                  <rect
                    key={bucket.label}
                    x={x.start(i)}
                    y={top}
                    width={x.band}
                    height={height}
                    rx={bi === buckets.length - 1 ? 4 : 0}
                    fill={RAMP[bi % RAMP.length]}
                    // Emphasis dims the other buckets rather than dropping
                    // them, so the stack still totals what it should.
                    opacity={!emphasis || emphasis === bucket.id ? 1 : 0.3}
                  >
                    <title>{`${cat} - ${bucket.label}: ${format(value)}`}</title>
                  </rect>
                );
              })}
            </g>
          );
        })}

        <XAxisLabels
          labels={categories}
          scale={x.center}
          y={H - 8}
          stride={labelStride(categories, x.step)}
        />
      </svg>

      <ChartLegend
        className="mt-2"
        items={buckets.map((b, i) => ({ label: b.label, color: RAMP[i] }))}
      />

      <ChartDataTable
        caption={caption}
        columns={["Account", ...buckets.map((b) => b.label)]}
        rows={categories.map((cat, i) => [
          cat,
          ...buckets.map((b) => format(b.values[i])),
        ])}
      />
    </div>
  );
}
