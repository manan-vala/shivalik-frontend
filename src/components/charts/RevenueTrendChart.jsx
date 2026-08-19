import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";

/**
 * RevenueTrendChart
 * -----------------------------------------------------------------------------
 * Two-series area/line chart for change over time.
 *
 * Colours come from the design system, not from this file: series 1 is
 * primary-600 and series 2 is primary-400, the two chart steps recorded in the
 * Figma variables. That pair was checked with the palette validator - worst
 * adjacent separation is dE 17.5 normal-vision and 17.2 protanopia, both well
 * clear of the floor - so the two lines stay distinguishable under colour
 * vision deficiency.
 *
 * TWO ADDITIONS THE FIGMA CHART DOES NOT HAVE, both required to make it
 * readable rather than decorative:
 *
 *  - A legend. The mockup draws two unlabelled lines, so a reader cannot tell
 *    what either one measures. The lighter series also sits at 2.43:1 against
 *    white, under the 3:1 contrast floor, which obliges a visible label.
 *  - A hover crosshair and tooltip. A static file cannot show one; a chart in a
 *    browser should read its own values.
 *
 * SIZING: the viewBox tracks the measured pixel width rather than being fixed,
 * so the plot fills its card at any size. A fixed viewBox would letterbox
 * (preserveAspectRatio="meet") or stretch the text and hover dots
 * (preserveAspectRatio="none"); measuring avoids both.
 */

const H = 200;
const PAD_X = 24;
const PAD_TOP = 12;
const AXIS_H = 24;

const PLOT_TOP = PAD_TOP;
const PLOT_BOTTOM = H - AXIS_H;
const PLOT_H = PLOT_BOTTOM - PLOT_TOP;

const GRID_LINES = 5;
const FALLBACK_W = 720;

export default function RevenueTrendChart({ data }) {
  const { months, series, prefix = "", unit = "" } = data;
  const gradientId = useId();
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const [width, setWidth] = useState(FALLBACK_W);
  const [hover, setHover] = useState(null);

  // Measure before paint so the first frame is already the right size.
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    setWidth(el.clientWidth || FALLBACK_W);
  }, []);

  // Then keep tracking. setState here is in an observer callback, which is the
  // sanctioned way to sync from an external system - not a synchronous write
  // during the effect body.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(([entry]) => {
      const next = Math.round(entry.contentRect.width);
      if (next > 0) setWidth(next);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const W = width;

  const { paths, points } = useMemo(() => {
    const all = series.flatMap((s) => s.values);
    // Head-room above the peak so the line never touches the top edge.
    const max = Math.max(...all) * 1.12;

    const x = (i) => PAD_X + (i * (W - PAD_X * 2)) / (months.length - 1);
    const y = (v) => PLOT_BOTTOM - (v / max) * PLOT_H;

    const points = series.map((s) => s.values.map((v, i) => [x(i), y(v)]));
    return { paths: points.map(smoothPath), points };
  }, [series, months.length, W]);

  const areaPath = `${paths[0]} L ${points[0].at(-1)[0]} ${PLOT_BOTTOM} L ${points[0][0][0]} ${PLOT_BOTTOM} Z`;

  function onPointerMove(e) {
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const step = (W - PAD_X * 2) / (months.length - 1);
    const index = Math.round((px - PAD_X) / step);
    setHover(index >= 0 && index < months.length ? index : null);
  }

  const format = (v) => `${prefix}${v.toFixed(1)}${unit}`;

  return (
    <div className="flex flex-col gap-4">
      {/* Legend - identity is never carried by colour alone. */}
      <ul className="flex flex-wrap items-center gap-4">
        {series.map((s, i) => (
          <li key={s.id ?? s.label} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`h-0.5 w-4 rounded-full ${
                i === 0 ? "bg-primary-600" : "bg-primary-400"
              }`}
            />
            <span className="text-sm text-secondary">{s.label}</span>
          </li>
        ))}
      </ul>

      <div ref={wrapRef} className="relative w-full">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height={H}
          className="block touch-none"
          role="img"
          aria-label={`Revenue trend over ${months.length} months. ${series
            .map((s) => `${s.label} ends at ${format(s.values.at(-1))}`)
            .join(". ")}.`}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary-600)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--color-primary-600)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Recessive grid. */}
          {Array.from({ length: GRID_LINES }, (_, i) => {
            const y = PLOT_TOP + (i * PLOT_H) / (GRID_LINES - 1);
            return (
              <line
                key={i}
                x1={0}
                x2={W}
                y1={y}
                y2={y}
                stroke="var(--color-gray-100)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          <path d={areaPath} fill={`url(#${gradientId})`} />

          <path
            d={paths[1]}
            fill="none"
            stroke="var(--color-primary-400)"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={paths[0]}
            fill="none"
            stroke="var(--color-primary-600)"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />

          {hover !== null && (
            <g>
              <line
                x1={points[0][hover][0]}
                x2={points[0][hover][0]}
                y1={PLOT_TOP}
                y2={PLOT_BOTTOM}
                stroke="var(--color-gray-300)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p[hover][0]}
                  cy={p[hover][1]}
                  r="4"
                  fill={
                    i === 0
                      ? "var(--color-primary-600)"
                      : "var(--color-primary-400)"
                  }
                  // 2px surface ring so overlapping marks stay separate.
                  stroke="var(--ui-bg-surface)"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
          )}

          {/* X axis */}
          {months.map((m, i) => (
            <text
              key={m}
              x={PAD_X + (i * (W - PAD_X * 2)) / (months.length - 1)}
              y={H - 6}
              textAnchor="middle"
              className="fill-tertiary"
              style={{ fontSize: 12 }}
            >
              {m}
            </text>
          ))}
        </svg>

        {hover !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 min-w-40 -translate-x-1/2 rounded-md border border-border-default bg-surface px-3 py-2 shadow-md"
            style={{ left: `${(points[0][hover][0] / W) * 100}%` }}
          >
            <p className="mb-1 text-xs font-medium text-primary">{months[hover]}</p>
            {series.map((s, i) => (
              <p key={s.id ?? s.label} className="flex items-center gap-2 text-xs text-secondary">
                <span
                  aria-hidden="true"
                  className={`size-1.5 shrink-0 rounded-full ${
                    i === 0 ? "bg-primary-600" : "bg-primary-400"
                  }`}
                />
                {s.label}
                <span className="tabular ml-auto font-medium text-primary">
                  {format(s.values[hover])}
                </span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Catmull-Rom through the points, emitted as cubic beziers - the smooth curve
 * the design uses, without pulling the line away from its own data points the
 * way plain quadratic smoothing does.
 */
function smoothPath(pts) {
  if (pts.length < 2) return "";

  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? pts[i + 1];

    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}
