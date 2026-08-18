import Icon from "../ui/Icon.jsx";

/**
 * AttendanceCalendar
 * -----------------------------------------------------------------------------
 * Three month-grids side by side, showing which days a staff member was
 * present. Figma's Attendance tab (node 1181:84936) reuses Untitled UI's date
 * *range* picker to draw this - consecutive present days are joined into one
 * continuous pill via small connector pieces between cells, and weekends
 * break the run.
 *
 * Two deliberate simplifications from that source, both documented in
 * README:
 *
 *  1. Each present day renders as its own independent rounded pill rather
 *     than a connected band. The connector carries no information beyond
 *     "these two adjacent days are both present," which independent pills
 *     already show - reproducing it pixel-for-pixel would be real effort
 *     spent on library chrome, not on the data.
 *  2. Figma's own date sequence is broken in all three month grids (e.g.
 *     "26 27 28 29 30 32 1" - a phantom "32"). This renders real calendar
 *     math for the given months instead of transcribing that.
 *
 * Colour states, read from the source: present = brand-subtle pill / on-brand
 * text; weekend = muted pill / secondary text; today = solid brand circle /
 * inverse text; everything else (absent, or outside the shown month) is plain
 * text with no pill.
 *
 * The `presentOn` set and `today` are illustrative, matching Figma's picture
 * of mostly-present weekdays - they are not algebraically tied to the
 * Present/Absent/Rate figures shown above the grids, the same way the
 * Dashboard's revenue chart doesn't derive from its own KPI cards.
 */

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export default function AttendanceCalendar({ months, presentOn, today }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {months.map(({ year, month, label }) => (
        <MonthGrid
          key={`${year}-${month}`}
          year={year}
          month={month}
          label={label}
          presentOn={presentOn}
          today={today}
        />
      ))}
    </div>
  );
}

function MonthGrid({ year, month, label, presentOn, today }) {
  const cells = buildMonthCells(year, month);

  return (
    <div className="rounded-md border border-border-default bg-surface shadow-lg">
      <div className="flex items-center justify-between px-6 py-5">
        {/* Decorative, non-interactive: this history view shows a fixed
            range rather than paging through months. chevron-down reused
            rotated, rather than fetching dedicated left/right glyphs for a
            control that doesn't do anything - see README. */}
        <Icon name="chevron-down" size="md" className="rotate-90 text-tertiary" />
        <p className="text-md font-medium text-secondary">{label}</p>
        <Icon name="chevron-down" size="md" className="-rotate-90 text-tertiary" />
      </div>

      <div className="flex flex-col gap-1 px-6 pb-5">
        <div className="grid grid-cols-7">
          {WEEKDAY_LABELS.map((d) => (
            <span
              key={d}
              className="flex h-10 items-center justify-center text-sm font-medium text-secondary"
            >
              {d}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((cell) => (
            <DayCell
              key={cell.iso}
              cell={cell}
              present={presentOn.has(cell.iso)}
              isToday={cell.iso === today}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DayCell({ cell, present, isToday }) {
  if (!cell.inMonth) {
    return (
      <span className="flex size-10 items-center justify-center text-sm text-placeholder">
        {cell.day}
      </span>
    );
  }

  if (isToday) {
    return (
      <span className="flex size-10 items-center justify-center rounded-full bg-brand text-sm font-medium text-inverse">
        {cell.day}
      </span>
    );
  }

  if (cell.isWeekend) {
    return (
      <span className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-medium text-secondary">
        {cell.day}
      </span>
    );
  }

  if (present) {
    return (
      <span className="flex size-10 items-center justify-center rounded-full bg-brand-subtle text-sm font-medium text-on-brand">
        {cell.day}
      </span>
    );
  }

  return (
    <span className="flex size-10 items-center justify-center text-sm text-secondary">
      {cell.day}
    </span>
  );
}

/** A Monday-start 6-week grid for the given month, with real date arithmetic. */
function buildMonthCells(year, month) {
  const first = new Date(year, month, 1);
  // getDay(): 0=Sun..6=Sat -> convert to a Monday-start offset.
  const leading = (first.getDay() + 6) % 7;

  const start = new Date(year, month, 1 - leading);
  const cells = [];

  for (let i = 0; i < 42; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);

    const day = date.getDay();
    cells.push({
      iso: toISODate(date),
      day: date.getDate(),
      inMonth: date.getMonth() === month,
      isWeekend: day === 0 || day === 6,
    });
  }

  // Trim trailing rows that fall entirely outside the month, so short months
  // don't render a mostly-empty sixth week.
  while (cells.length > 35 && !cells.slice(-7).some((c) => c.inMonth)) {
    cells.splice(-7);
  }

  return cells;
}

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
