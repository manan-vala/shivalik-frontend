/**
 * Tabs
 * -----------------------------------------------------------------------------
 * Segmented tab control used inside the client detail dialog.
 *
 * Figma (node 790:56520): track gray-100, p-4, radius 8, gap-8.
 *   active    primary-50 fill, primary-700 label, 2px primary-700 underline
 *   rest      gray-500 label, radius 6, px-12 py-8
 *
 * Implements the WAI-ARIA tab pattern - roving arrow-key focus, one tab in the
 * tab order - because a div-based segmented control is unreachable otherwise.
 */
export default function Tabs({ tabs, value, onChange, label = "Sections" }) {
  function onKeyDown(e) {
    const i = tabs.findIndex((t) => t.id === value);
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const next =
        e.key === "ArrowRight"
          ? (i + 1) % tabs.length
          : (i - 1 + tabs.length) % tabs.length;
      onChange(tabs[next].id);
    }
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="flex w-full gap-2 rounded-md bg-muted p-1"
    >
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={active}
            aria-controls={`panel-${tab.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={[
              "flex flex-1 flex-col items-center justify-center overflow-hidden text-sm font-medium transition-colors",
              active
                ? "rounded-sm bg-brand-subtle text-on-brand"
                : "rounded-sm px-3 py-2 text-tertiary hover:text-secondary",
            ].join(" ")}
          >
            <span className={active ? "p-3" : ""}>{tab.label}</span>
            {active && <span className="h-0.5 w-full bg-on-brand" />}
          </button>
        );
      })}
    </div>
  );
}

/** Panel wrapper that pairs with a tab id. */
export function TabPanel({ id, active, children }) {
  if (!active) return null;
  return (
    <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`}>
      {children}
    </div>
  );
}
