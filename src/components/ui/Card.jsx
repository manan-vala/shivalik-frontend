/**
 * Card
 * -----------------------------------------------------------------------------
 * Panel with an optional heading row. Used by the Revenue Trend and Live
 * Activity panels and by the Monthly Attendance block.
 *
 * Figma (node 790:22354): white, 1px gray-200, radius 8, shadow-sm, p-24,
 * gap-20; heading 18/28 medium gray-900.
 */
export default function Card({ title, actions, children, className = "" }) {
  return (
    <section
      className={[
        "flex flex-col gap-5 rounded-md border border-border-default bg-surface p-6 shadow-sm",
        className,
      ].join(" ")}
    >
      {(title || actions) && (
        <header className="flex items-start gap-4">
          {title && (
            <h2 className="flex-1 text-lg font-medium text-primary">{title}</h2>
          )}
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

/**
 * Section heading that sits on the page rather than inside a card -
 * "Quick Actions", "Staff Overview", "Attendance Approval Requests".
 */
export function SectionHeading({ children }) {
  return <h2 className="text-lg font-medium text-primary">{children}</h2>;
}
