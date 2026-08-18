import AttendanceDecision from "../ui/AttendanceDecision.jsx";

/**
 * Attendance approval requests.
 * Figma (node 790:22407): rows h-72, px-24 py-16, gap-12; 40px round avatar;
 * name 14/20 medium gray-900; 1px gray-200 dividers.
 *
 * The Figma avatars are all the same Untitled UI stock photo, so this renders
 * initials instead - see README for the placeholder list.
 *
 * The dropdown/Reject/Approve pair is `AttendanceDecision`, shared with the
 * Staff Attendance table - see that component for why it's one piece.
 */
export default function AttendanceRequests({ requests, onDecide, onStateChange }) {
  return (
    <div className="overflow-hidden rounded-md border border-border-default bg-surface shadow-sm">
      <ul>
        {requests.map((req) => (
          <li
            key={req.id}
            className="flex h-18 items-center gap-3 border-b border-border-default px-6 py-4 last:border-b-0"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-sm font-semibold text-on-brand">
              {initials(req.name)}
            </span>

            <p className="flex-1 text-sm font-medium text-primary">{req.name}</p>

            <AttendanceDecision
              name={req.name}
              state={req.state}
              onStateChange={(value) => onStateChange?.(req.id, value)}
              onDecide={(outcome) => onDecide?.(req.id, outcome)}
            />
          </li>
        ))}

        {requests.length === 0 && (
          <li className="px-6 py-8 text-center text-sm text-tertiary">
            No attendance requests waiting.
          </li>
        )}
      </ul>
    </div>
  );
}

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}
