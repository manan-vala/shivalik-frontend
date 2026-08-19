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
  ChartDataTable,
} from "./primitives.jsx";

/**
 * BarChart - single series, categorical x.
 * Figma: Analytics / Sales "Revenue by city" (node 1180:52808)
 *
 * One series, so there is no identity to carry in colour: every bar is the
 * same chart-1 fill and the category is read off the axis. That is why this
 * chart has no legend while the donut does.
 *
 * Bars carry a 4px rounded top and sit on the baseline, the mark spec the
 * dataviz guidance asks for.
 */

const H = 200;
const PAD_L = 8;
const PAD_R = 8;
const PAD_TOP = 12;
const AXIS_H = 24;

export default function BarChart({ data, format = (v) => v, caption }) {
  const [ref, width] = useMeasuredWidth();
  const plotBottom = H - AXIS_H;

  const { max, ticks } = niceTicks(Math.max(...data.map((d) => d.value)));
  const y = linearScale({ max, from: PAD_TOP, to: plotBottom });
  const x = bandScale({
    count: data.length,
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

        {data.map((d, i) => {
          const top = y(d.value);
          return (
            <rect
              key={d.label}
              x={x.start(i)}
              y={top}
              width={x.band}
              height={Math.max(plotBottom - top, 0)}
              rx="4"
              fill="var(--color-chart-1)"
              opacity="0.55"
            >
              <title>{`${d.label}: ${format(d.value)}`}</title>
            </rect>
          );
        })}

        <XAxisLabels
          labels={data.map((d) => d.label)}
          scale={x.center}
          y={H - 6}
          stride={labelStride(data.map((d) => d.label), x.step)}
        />
      </svg>

      <ChartDataTable
        caption={caption}
        columns={["Category", "Value"]}
        rows={data.map((d) => [d.label, format(d.value)])}
      />
    </div>
  );
}
