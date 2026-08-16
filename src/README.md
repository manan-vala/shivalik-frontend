# Frontend structure

Read this before adding a file.

## What this is

A React + Vite + Tailwind v4 front end for the Shivalik / Golden book printing
and distribution ERP. One app serves five portals, gated by role.

Design source: Figma `GOLDEN (Copy)`, file `VVZ3VLv1ftnqITsHBh8TEU`, page
**FINAL SCREENS**.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

You land on `/login` - a dev role switcher standing in for real sign-in. Pick a
portal to enter it. Only the Clients screen is built; everything else renders a
placeholder.

```bash
npm run icons      # rebuild the icon sprite after adding an SVG
npm run build      # runs `icons` first, via prebuild
npm run lint
```

## Layout

```
src/
  styles/tokens.css     THE source of truth for every colour, size, radius,
                        shadow. Extracted from Figma. Includes a log of the
                        three competing dialects found in the file and how
                        each was reconciled.
  index.css             Tailwind entry + base layer. Imports tokens.css.

  assets/icons/*.svg    Raw Figma icon exports. Source files - components never
                        import these directly.

  components/
    ui/                 Portal-agnostic primitives: Icon, Button, Badge,
                        SearchInput, TextField, Table, PlainTable, Tabs, Modal,
                        Pagination, PageHeader.
    navigation/         Sidebar + SidebarNavItem, driven by the portal registry
                        and shared by every desktop screen.
    clients/            Screen-specific components for the Clients feature.

  layouts/
    PortalShell.jsx     Picks a shell from the portal's `shell` field.
    SidebarLayout.jsx   Desktop: Sidebar + scrolling main column.
    MobileLayout.jsx    Mobile: top app bar + bottom nav. Still a stub.

  routes/
    portals.js          Portal registry - THE source of truth for which portals
                        exist, their paths, roles and navigation.
    index.jsx           Route tree, generated from the registry.
    RequireRole.jsx     Role guard.

  pages/<portal>/       Screen components.
  data/                 Sample data transcribed from Figma, one file per entity.
  lib/                  Non-visual logic: auth, and later API clients.

scripts/build-icons.mjs Builds public/icons.svg from assets/icons/*.svg.
public/icons.svg        GENERATED - do not edit by hand.
```

## The three rules

**1. Never hardcode a visual value.** No hex colours, no px font sizes, no raw
radii in components. If a value you need has no token, add it to `tokens.css`.

**2. Use semantic tokens, not ramp values.** `text-secondary`, not
`text-gray-700`. `bg-status-success-bg`, not `bg-success-50`. The ramps exist so
the semantic layer has something to point at; components bind to meaning, so a
theme change touches one file and no component classes change.

**3. Status colours are named by meaning.** One `<Badge>` serves every
vocabulary in the product - Active, In Printing, Ready for Dispatch, Paid,
Present - via `success / warning / error / info / progress / alert / brand /
neutral`. A screen never picks a colour.

Tailwind scans source **text**, so a class must appear whole in the source.
`` `text-${align}` `` produces a class that is never generated - use a lookup
map of complete class names instead.

## Adding an icon

1. Export the SVG from Figma into `src/assets/icons/<kebab-name>.svg`
2. `npm run icons`
3. `<Icon name="<kebab-name>" />`

The build script normalises raw Figma exports: hardcoded strokes (hex *and*
keywords like `white`) become `currentColor`, each viewBox is rescaled so every
icon fills the same proportion of its box, and stroke widths are restated
relative to that box. Drop exports in unmodified.

## Adding a screen

1. Add an entry to the portal's `nav` in `routes/portals.js`
   (`children` for a sub-menu, `badge` for a count, `collapsible` for a chevron
   with no sub-items yet)
2. The route, sidebar link and a placeholder appear automatically
3. Build the page under `pages/<portal>/`
4. Register it in `BUILT_PAGES` in `routes/index.jsx`, keyed `"<portalId>:<path>"`

Sub-routes that differ only by a filter share one page and take the filter as a
prop - see the three Clients routes mapping to one `ClientsPage`.

## Built screens

| Screen               | Portal         | Figma node            | Path |
|----------------------|----------------|-----------------------|------|
| Clients              | Shivalik Admin | 790:56280             | `/admin/clients`, `/clients/active`, `/clients/inactive` |
| Add Client dialog    | Shivalik Admin | 790:56541             | opens from "Add Clients" |
| Client detail dialog | Shivalik Admin | 790:56511/56474/56442 | opens on row click or "View" |

## Deliberate deviations from Figma

The mockups carry template placeholders and copy errors that would be bugs if
reproduced. These were changed on purpose:

| Figma shows | Rendered as | Why |
|---|---|---|
| "Untitled UI" logo, "Olivia Rhye / olivia@untitledui.com" | Portal name + signed-in user | Untitled UI template placeholder, not client identity. The vendor screens already do this correctly. |
| "Save Vendor" on the Add **Client** dialog | "Save Client" | Copy carried over from the vendor dialog it was duplicated from. |
| Every client row has id `VN-2001` | `VN-2001` … `VN-2006` | Placeholder repetition; duplicate ids break list keys and row identity. |

The detail dialog exists as three Figma frames (Groups 26/27/28) drawn over a
flattened screenshot of the page. That is because a static file cannot show tab
state, not because they are three dialogs. Here it is one.

## Known placeholders

Wired but not real - expected to be replaced:

- `lib/auth.jsx` - role comes from localStorage, not a session. Swap the
  `useState` initialiser for the Django auth call.
- `pages/RoleSwitcher.jsx` - stands in for the designed LOGIN PAGE (1181:89498).
- `layouts/MobileLayout.jsx` - structural stub, not the designed client app.
- `data/*.js` - sample rows; replace with API calls, keep the shape.
- The sidebar search box and `Pagination`'s buttons are inert.
- `AddClientDialog` validates nothing and discards on save.
