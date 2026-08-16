import { useState } from "react";
import { NavLink, useLocation, useResolvedPath } from "react-router-dom";
import Icon from "../ui/Icon.jsx";
import Badge from "../ui/Badge.jsx";

/**
 * A single sidebar row, plus its sub-menu when it has one.
 *
 * Figma (node 790:56290):
 *   row        px-12 py-8, radius 6, 16/24 medium, icon 24, gap 12
 *   rest       bg white, gray-700 label
 *   active     bg primary-50, primary-700 label
 *   sub-item   pl-48 pr-12 py-8, same rest/active treatment, no icon
 *   sub-menu   gap 4, pb 8; parent group gap 8 when open
 */

const ROW =
  "flex items-center justify-between gap-3 rounded-sm px-3 py-2 text-md font-medium transition-colors";
const REST = "text-secondary hover:bg-muted";
const ACTIVE = "bg-brand-subtle text-on-brand";

export default function SidebarNavItem({ item, basePath }) {
  const hasChildren = Boolean(item.children?.length);
  const { pathname } = useLocation();
  const resolved = useResolvedPath(`${basePath}/${item.path}`);

  const sectionIsActive =
    pathname === resolved.pathname ||
    pathname.startsWith(`${resolved.pathname}/`);

  // The section holding the current route is always open, and any other
  // section can be opened by hand. Deriving it this way rather than seeding
  // useState from the route matters: the sidebar never remounts, so a seeded
  // initial value would go stale and a section reached by URL or by a link
  // from elsewhere would stay collapsed around its own active child.
  const [expanded, setExpanded] = useState(false);
  const open = expanded || sectionIsActive;

  if (!hasChildren) {
    return (
      <NavLink
        to={`${basePath}/${item.path}`}
        className={({ isActive }) =>
          [ROW, isActive ? ACTIVE : REST].join(" ")
        }
      >
        <span className="flex items-center gap-3">
          <Icon name={item.icon} size="lg" />
          {item.label}
        </span>

        <span className="flex items-center gap-2">
          {item.badge != null && (
            <Badge tone="neutral" size="md">
              {item.badge}
            </Badge>
          )}
          {item.collapsible && (
            <Icon name="chevron-down" size="md" className="text-tertiary" />
          )}
        </span>
      </NavLink>
    );
  }

  return (
    <div className={["flex flex-col", open ? "gap-2" : ""].join(" ")}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setExpanded((v) => !v)}
        className={[ROW, "w-full", sectionIsActive ? ACTIVE : REST].join(" ")}
      >
        <span className="flex items-center gap-3">
          <Icon name={item.icon} size="lg" />
          {item.label}
        </span>
        <Icon
          name="chevron-down"
          size="md"
          className={open ? "rotate-180 transition-transform" : "transition-transform"}
        />
      </button>

      {open && (
        <div className="flex flex-col gap-1 pb-2">
          {item.children.map((child) => (
            <NavLink
              key={child.path}
              to={`${basePath}/${child.path}`}
              end={child.end}
              className={({ isActive }) =>
                [
                  "rounded-sm py-2 pl-12 pr-3 text-md font-medium transition-colors",
                  isActive ? ACTIVE : REST,
                ].join(" ")
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
