/**
 * Order timeline
 * Figma: order detail Overview tab (node 1180:50810)
 *
 * Quote Sent -> Delivered, with the timestamp of each step on the right.
 * Three states, which is the whole point of the component:
 *   done     step name in body text, timestamp shown
 *   current  the stage the order is actually at - drawn in orange
 *   pending  not reached yet - greyed, no timestamp
 *
 * `alert` is the orange role (orange-50/700), the same one the "In Binding"
 * badge uses, so the current step is coloured from the token layer rather
 * than a per-screen hex.
 */

const STATE_CLASS = {
  done: "text-primary",
  current: "text-status-alert-fg",
  pending: "text-tertiary",
};

export default function OrderTimeline({ steps = [] }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-tertiary">Timeline</h3>
      <ol className="flex list-none flex-col gap-3 p-0">
        {steps.map((entry) => (
          <li
            key={entry.step}
            className="flex items-baseline justify-between gap-4"
          >
            <span
              className={`text-md ${STATE_CLASS[entry.state] ?? STATE_CLASS.pending}`}
            >
              {entry.step}
            </span>
            {entry.at && (
              <span className="text-sm text-tertiary">{entry.at}</span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
