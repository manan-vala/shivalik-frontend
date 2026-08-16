import { NavLink, Outlet } from "react-router-dom";
import Icon from "../components/ui/Icon.jsx";

/**
 * Mobile shell: top app bar + fixed bottom navigation.
 * Used by Shivalik Client and Golden Client.
 *
 * Figma (node 1079:92768): 390 wide, 64px bars, primary-800 bottom bar.
 * Still a structural stub - the designed client screens have not been built.
 */
export default function MobileLayout({ portal }) {
  const bottomBar = portal.nav.filter((i) => i.inBottomBar);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-page">
      <header className="flex h-appbar shrink-0 items-center justify-between border-b border-border-default bg-surface px-4">
        <p className="text-display-xs font-bold text-on-brand">{portal.label}</p>
        <Icon
          name="bell"
          size="md"
          className="text-tertiary"
          title="Notifications"
        />
      </header>

      <main className="flex-1 px-4 py-6 pb-24">
        <Outlet />
      </main>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 mx-auto flex h-appbar max-w-[430px] items-stretch bg-deep"
      >
        {bottomBar.map((item) => (
          <NavLink
            key={item.path}
            to={`${portal.basePath}/${item.path}`}
            className={({ isActive }) =>
              [
                "flex flex-1 flex-col items-center justify-center gap-1 text-2xs font-medium",
                isActive ? "text-inverse" : "text-inverse/70",
              ].join(" ")
            }
          >
            <Icon name={item.icon} size="md" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
