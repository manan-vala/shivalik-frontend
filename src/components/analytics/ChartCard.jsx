/**
 * ChartCard
 * -----------------------------------------------------------------------------
 * The bordered panel every Analytics block sits in: a title, an optional
 * control on the right, then the body.
 *
 * The Analytics frames put three different things in that right-hand slot - a
 * kebab menu on Vendor breakdown, a Revenue/Collected toggle on Revenue vs
 * Collected, an ageing-bucket toggle on AR ageing - so it is an `action` slot
 * rather than three variants.
 *
 * Distinct from `TableCard`: this one owns a heading and has padding, because
 * a chart needs breathing room inside the border where a table's own rows
 * provide it.
 */
export default function ChartCard({ title, action, children, className = "" }) {
  return (
    <section
      className={[
        "flex flex-col gap-4 rounded-md border border-border-default bg-surface p-5 shadow-sm",
        className,
      ].join(" ")}
    >
      {(title || action) && (
        <header className="flex items-center justify-between gap-4">
          {title && (
            <h2 className="text-md font-medium text-primary">{title}</h2>
          )}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
