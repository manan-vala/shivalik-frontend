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
  YAxisLabels,
  ChartLegend,
  ChartDataTable,
} from "./primitives.jsx";

/**
 * GroupedBarChart - two series side by side per category.
 * Figma: Analytics / Financial "Revenue vs Collected" (node 1180:53377)
 *
 * COLOUR: primary-400 / primary-600, the pair RevenueTrendChart already uses.
 * That pair was validated at dE 17.5 normal-vision separation, clear of the
 * floor, so it is reused here rather than spending two categorical slots -
 * and it is what the frame draws.
 *
 * A 2px surface gap sits between the two bars of a pair, which is what keeps
 * them readable as two marks rather than one wide one.
 *
 * The frame labels the y axis "Active users" on a revenue chart - a template
 * leftover. The axis label comes from props here so the page supplies the
 * right one; see the page for the deviation note.
 */

const H = 220;
const PAD_L = 44;
const PAD_R = 12;
const PAD_TOP = 12;
const AXIS_H = 40;

const SERIES_COLOR = ["var(--color-primary-400)", "var(--color-primary-600)"];

export default function GroupedBarChart({
  categories,
  series,
  yLabel,
  xLabel,
  emphasis,
  format = (v) => v,
  caption,
}) {
  const [ref, width] = useMeasuredWidth();
  const plotBottom = H - AXIS_H;

  const peak = Math.max(...series.flatMap((s) => s.values));
  const { max, ticks } = niceTicks(peak);
  const y = linearScale({ max, from: PAD_TOP, to: plotBottom });

  const group = bandScale({
    count: categories.length,
    from: PAD_L,
    to: width - PAD_R,
    padding: 0.4,
  });
  // Each pair splits its band, with a 2px gutter between the two bars.
  const barW = Math.max((group.band - 2) / 2, 1);

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
        <YAxisLabels ticks={ticks} scale={y} x={PAD_L - 8} format={format} />

        {categories.map((cat, i) =>
          series.map((s, si) => {
            const value = s.values[i];
            const top = y(value);
            return (
              <rect
                key={`${cat}-${s.label}`}
                x={group.start(i) + si * (barW + 2)}
                y={top}
                width={barW}
                height={Math.max(plotBottom - top, 0)}
                rx="4"
                fill={SERIES_COLOR[si % SERIES_COLOR.length]}
                // Emphasis dims the other series rather than hiding it, so
                // the comparison the chart exists for is still readable.
                opacity={!emphasis || emphasis === s.id ? 1 : 0.35}
              >
                <title>{`${cat} - ${s.label}: ${format(value)}`}</title>
              </rect>
            );
          })
        )}

        <XAxisLabels
          labels={categories}
          scale={group.center}
          y={plotBottom + 18}
          stride={labelStride(categories, group.step)}
        />

        {yLabel && (
          <text
            transform={`rotate(-90 12 ${H / 2})`}
            x={12}
            y={H / 2}
            textAnchor="middle"
            className="fill-tertiary text-[11px]"
          >
            {yLabel}
          </text>
        )}
        {xLabel && (
          <text
            x={(PAD_L + width - PAD_R) / 2}
            y={H - 4}
            textAnchor="middle"
            className="fill-tertiary text-[11px]"
          >
            {xLabel}
          </text>
        )}
      </svg>

      <ChartLegend
        className="mt-2"
        items={series.map((s, i) => ({ label: s.label, color: SERIES_COLOR[i] }))}
      />

      <ChartDataTable
        caption={caption}
        columns={[xLabel ?? "Category", ...series.map((s) => s.label)]}
        rows={categories.map((cat, i) => [
          cat,
          ...series.map((s) => format(s.values[i])),
        ])}
      />
    </div>
  );
}
