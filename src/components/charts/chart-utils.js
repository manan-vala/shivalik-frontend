import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Chart utilities
 * -----------------------------------------------------------------------------
 * The non-rendering half of the chart plumbing: measuring, scales and the
 * series palette. Split from `primitives.jsx` because Fast Refresh only
 * works when a module exports components alone - mixing a hook and some
 * constants in beside them breaks it.
 *
 * Everything here returns numbers or strings; nothing renders.
 *
 * SERIES COLOUR comes from `CHART_SERIES` below, which points at the validated
 * `--color-chart-*` tokens. Assign in order and never cycle - see tokens.css
 * for the validator output and why the order matters.
 */

/** Fixed categorical order. A sixth category folds into "Other", not slot 1. */
export const CHART_SERIES = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export const seriesColor = (i) => CHART_SERIES[i % CHART_SERIES.length];

/**
 * Track the container's pixel width so the viewBox can match it 1:1.
 *
 * A fixed viewBox either letterboxes or stretches the text; measuring avoids
 * both. Same approach RevenueTrendChart uses - lifted here so the other charts
 * do not each reimplement it.
 */
export function useMeasuredWidth(fallback = 720) {
  const ref = useRef(null);
  const [width, setWidth] = useState(fallback);

  // Measure before paint so the first frame is already the right size.
  useLayoutEffect(() => {
    const el = ref.current;
    if (el?.clientWidth) setWidth(el.clientWidth);
  }, []);

  // Then keep tracking. setState inside an observer callback is the sanctioned
  // way to sync from an external system.
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      const next = Math.round(entry.contentRect.width);
      if (next > 0) setWidth(next);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, width];
}

/**
 * Evenly spaced categories across a range, with padding either side.
 * Returns the band centre and the band width.
 */
export function bandScale({ count, from, to, padding = 0.3 }) {
  const span = to - from;
  const step = span / Math.max(count, 1);
  const band = step * (1 - padding);
  return {
    step,
    band,
    center: (i) => from + step * i + step / 2,
    start: (i) => from + step * i + (step - band) / 2,
  };
}

/** Value -> pixel, with the axis inverted (0 at the bottom). */
export function linearScale({ max, from, to }) {
  const span = to - from;
  return (v) => to - (v / (max || 1)) * span;
}

/** A "nice" axis maximum plus the tick values under it. */
export function niceTicks(max, count = 5) {
  if (max <= 0) return { max: 1, ticks: [0, 1] };
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? mag * 10;
  const top = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(Number(v.toFixed(6)));
  return { max: top, ticks };
}

/**
 * How many x-axis labels to skip so they stop colliding, given the space each
 * one gets. ~6.2px per character at the 11px axis size, plus a small gutter.
 *
 * Overlapping axis labels are worse than absent ones - they read as garbage -
 * so a chart that cannot fit them all thins them rather than shrinking the
 * type past legibility. The Figma frames do the same by hand, labelling every
 * other bar. Nothing is lost: every mark carries a <title> and each chart
 * ships a "View data" table.
 */
export function labelStride(labels, step) {
  const widest = Math.max(...labels.map((l) => String(l).length)) * 6.2 + 8;
  return Math.max(1, Math.ceil(widest / Math.max(step, 1)));
}
