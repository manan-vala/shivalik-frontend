import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import SearchInput from "../ui/SearchInput.jsx";
import SidebarNavItem from "./SidebarNavItem.jsx";

/**
 * Sidebar
 * -----------------------------------------------------------------------------
 * The shared left navigation. Every desktop screen in both admin portals and
 * the vendor portal uses it, so it is driven entirely by the portal registry
 * (routes/portals.js) rather than being written per screen.
 *
 * Figma (node 790:56281):
 *   width      312 (311 + 1px right divider)
 *   nav        pt-32, gap-24; header px-24 pr-20; search px-24; items px-16
 *   footer     pb-32 px-16, gap-24; divider above the account row
 *
 * NOTE ON BRANDING: the Figma frames still carry the Untitled UI template's
 * logo and the "Olivia Rhye / olivia@untitledui.com" account row. Those are
 * placeholders from the component library, not the client's identity, so this
 * renders the portal's own name and the signed-in user instead. The vendor
 * portal screens already do it this way in Figma.
 */
export default function Sidebar({ portal, user, onSignOut }) {
  const [query, setQuery] = useState("");

  // The vendor portal is designed at 1280 with a narrower rail than the two
  // admin portals at 1440. Both widths are tokens, not literals.
  const width =
    portal.shell === "vendor" ? "w-sidebar-narrow" : "w-sidebar";

  return (
    <aside
      className={`flex ${width} shrink-0 flex-col justify-between border-r border-border-default bg-surface`}
    >
      <div className="flex flex-col gap-6 pt-8">
        <header className="flex items-center gap-3 pl-6 pr-5">
          <span className="flex size-8 items-center justify-center rounded-sm bg-brand text-sm font-semibold text-inverse">
            {portal.label.charAt(0)}
          </span>
          <span className="text-md font-semibold text-primary">
            {portal.label}
          </span>
        </header>

        <div className="px-6">
          <SearchInput
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={`Search ${portal.label}`}
          />
        </div>

        <nav className="flex flex-col gap-1 px-4" aria-label="Main">
          {portal.nav.map((item) => (
            <SidebarNavItem
              key={item.path}
              item={item}
              basePath={portal.basePath}
            />
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-6 px-4 pb-8">
        {portal.footerNav.length > 0 && (
          <nav className="flex flex-col gap-1" aria-label="Secondary">
            {portal.footerNav.map((item) => (
              <SidebarNavItem
                key={item.path}
                item={item}
                basePath={portal.basePath}
              />
            ))}
          </nav>
        )}

        <hr className="border-0 border-t border-border-default" />

        <div className="flex items-center justify-between gap-3 px-2">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-sm font-semibold text-on-brand">
              {initials(user.name)}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-primary">
                {user.name}
              </span>
              <span className="truncate text-sm text-tertiary">
                {user.email}
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={onSignOut}
            aria-label="Sign out"
            className="rounded-md p-2 text-tertiary transition-colors hover:bg-muted hover:text-primary"
          >
            <Icon name="log-out" size="md" />
          </button>
        </div>
      </div>
    </aside>
  );
}

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}
