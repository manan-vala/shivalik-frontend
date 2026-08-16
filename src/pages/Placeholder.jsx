import Icon from "../components/ui/Icon.jsx";

/**
 * Stands in for every screen that has not been built yet, so the route tree is
 * navigable end to end. Delete usages from routes/index.jsx as real screens
 * land.
 */
export default function Placeholder({ portal, item, notFound }) {
  if (notFound) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-display-sm">Screen not found</h1>
        <p className="text-md text-tertiary">
          No route matches this path inside {portal.label}.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-label uppercase tracking-label text-tertiary">
          {portal.label}
        </p>
        <h1 className="text-display-sm flex items-center gap-3">
          <Icon name={item.icon} size="lg" className="text-on-brand" />
          {item.label}
        </h1>
      </header>

      <div className="rounded-md border border-border-default bg-surface p-6 shadow-xs">
        <p className="text-sm text-secondary">
          Not built yet. Route, shell, tokens and icons are wired — this is where
          the designed screen goes.
        </p>
      </div>
    </div>
  );
}
