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
portal to enter it. Only Shivalik Admin has built screens so far (Dashboard,
Clients, Finance, Staff - see "Built screens" below); everything else renders
a placeholder.

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
    ui/                 Portal-agnostic primitives: Icon, Button, Badge, Card,
                        StatCard, SearchInput, TextField/Select/RadioGroup,
                        Table, PlainTable, Tabs, Modal, Pagination, PageHeader.
    navigation/         Sidebar + SidebarNavItem, driven by the portal registry
                        and shared by every desktop screen.
    charts/             RevenueTrendChart - hand-rolled SVG, not a library. See
                        "Charts" below before adding a second one.
    dashboard/          LiveActivity, AttendanceRequests - Dashboard-only.
    clients/            AddClientDialog, ClientDetailDialog.
    vendors/            AddVendorDialog.
    quotes/             CreateQuoteDialog.
    invoices/           GenerateInvoiceDialog.
    finance/            PaymentFields + PaymentDialog - one dialog for Add /
                        Verify / View, parameterised by `mode`. See "One
                        dialog, three modes" below before adding a fourth
                        near-duplicate payment dialog.
    staff/              StaffDetailDialog (3 tabs), StaffFormDialog (add/edit
                        modes), StaffAttendanceTable, AttendanceCalendar.

  data/                 Sample data transcribed from Figma, one file per
                        entity - see also `AttendanceDecision` and `StatGrid`
                        in components/ui/, shared by Dashboard and Staff.

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

## Charts

`RevenueTrendChart` is hand-rolled SVG, not a charting library - the project
has no chart dependency yet, and this one component did not justify adding
one. If a second chart is needed, evaluate a library then; do not keep
extending this file into one.

Its palette (`--color-primary-600` / `--color-primary-400`) was run through
the dataviz skill's contrast/CVD validator before use - normal-vision
separation dE 17.5, well clear of the floor. The lighter series sits under the
3:1 contrast floor against white, which is why the chart carries a legend and
a hover tooltip that the Figma mockup does not: colour alone is not enough to
read it. Re-run the validator before changing either colour.

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

| Screen                  | Portal         | Figma node             | Path |
|-------------------------|----------------|-------------------------|------|
| Clients                 | Shivalik Admin | 790:56280               | `/admin/clients`, `/clients/active`, `/clients/inactive` |
| Add Client dialog       | Shivalik Admin | 790:56541               | opens from "Add Clients" |
| Client detail dialog    | Shivalik Admin | 790:56511/56474/56442   | opens on row click or "View" |
| Dashboard               | Shivalik Admin | 790:22313               | `/admin/dashboard` |
| Add Vendor dialog       | Shivalik Admin | 790:22655               | opens from "Add Vendor" |
| Create Quote dialog     | Shivalik Admin | 790:22695               | opens from "Create Quote" |
| Generate Invoice dialog | Shivalik Admin | 790:22793               | opens from "Generate Invoice" |
| Finance                 | Shivalik Admin | 1180:35746              | `/admin/finance` |
| Add Payment dialog      | Shivalik Admin | 1180:36020              | opens from "Add Payment" |
| Verify Payment dialog   | Shivalik Admin | 1180:36066              | opens from the row "Verify" button |
| View (payment) dialog   | Shivalik Admin | inside 1180:36096       | opens from a row's "View" |
| All Staff               | Shivalik Admin | 1181:84436              | `/admin/staff` |
| Attendance              | Shivalik Admin | 1181:84672              | `/admin/staff/attendance` |
| Staff detail dialog     | Shivalik Admin | 1181:84909/36/72 (77 is a duplicate frame, not modelled) | opens on row click or "View" |
| Add Staff Member dialog | Shivalik Admin | 1181:84993              | opens from "Add Staff Member" |
| Edit Staff Member dialog| Shivalik Admin | 1181:85085              | opens from the detail dialog's "Edit" |

The Dashboard's Add Client action reuses the same `AddClientDialog` built for
the Clients screen. Add Vendor, Create Quote and Generate Invoice are their
own components, following the same `Modal` + `TextField` pattern. Add/Edit
Staff Member are one component (`StaffFormDialog`, mode-parameterised) - see
"One dialog, three modes" above; it is the same construction with two modes
instead of three.

## One dialog, three modes

Add Payment, Verify Payment and View are one component, `PaymentDialog`, not
three. All three show the same five fields in the same order (`PaymentFields`)
and differ only in whether Client/Order pickers sit above them, whether the
fields are editable, and which buttons sit in the footer - a `mode` prop
covers all three differences. Before adding a fourth payment-shaped dialog,
extend this component rather than copying it; before adding an unrelated
form dialog elsewhere, this is the pattern to follow (see also how
`ClientDetailDialog`'s three tabs and `PaymentDialog`'s three modes both solve
"one Figma concept, several frames" the same way).

`PaymentDialog` seeds its fields from `useState` initialisers, not an effect -
`FinancePage` remounts it with `key={mode + payment.id}` when a different row
or mode opens. Same fix as `ClientDetailDialog`'s tab reset; see that file if
you need the reasoning again.

## Deliberate deviations from Figma

The mockups carry template placeholders and copy errors that would be bugs if
reproduced. These were changed on purpose:

| Figma shows | Rendered as | Why |
|---|---|---|
| "Untitled UI" logo, "Olivia Rhye / olivia@untitledui.com" | Portal name + signed-in user | Untitled UI template placeholder, not client identity. The vendor screens already do this correctly. |
| "Save Vendor" on the Add **Client** dialog | "Save Client" | Copy carried over from the vendor dialog it was duplicated from. |
| Every client row has id `VN-2001` | `VN-2001` … `VN-2006` | Placeholder repetition; duplicate ids break list keys and row identity. |
| Approval avatars are all the same stock photo | Initials on a brand-tinted circle | Same placeholder photo repeated per row in Figma; not real per-employee images. |
| "Attendance Appoval Requests" | "Attendance Approval Requests" | Spelling error in the Figma layer/copy. |
| Create Quote's cost table: line items total ₹5,79,500 but Subtotal/GST/Grand Total all read ₹90,000 | Totals computed from the line items | The Figma numbers don't add up - placeholder figures, not a real quote. Rendered arithmetic is self-consistent; wire to the pricing endpoint when it exists. |
| Revenue Trend chart has two unlabelled lines, no legend, no hover | Legend + hover crosshair/tooltip added | A static file can't show a legend's absence being a real problem, but it is one: the second line is unreadable without it (see "Charts"). |
| A field showing `0` (a legitimate "fully paid" value) | Renders as `0` | Fixed a real bug while building this, not a Figma deviation: the first pass checked `payment.due ? ... : ""`, and `0` is falsy in JS, so every paid-in-full row's View dialog silently rendered its Payment Due field empty. Now checks `!= null`. |
| List Salary column reads ₹68,000; the same person's Salary tab reads ₹85,000 Monthly | Both preserved, unreconciled | Same category as the client id repetition - placeholder data, not something to silently "fix" into agreement. |
| The Attendance tab's 3-month calendar shows a broken date sequence in all three grids (e.g. "26 27 28 29 30 32 1" - a phantom "32") | Real calendar math for Jan/Feb/Mar 2022 | Unlike copy or colour placeholders, wrong dates would actively mislead - this is the one deviation here driven by correctness, not by taste. |
| Calendar's connected present-day range (Untitled UI's date-range-picker chrome, joined pills across adjacent days) | Independent rounded pills per day | The connector adds no information beyond "these two adjacent days are both present," which independent pills already convey - not worth reproducing pixel-for-pixel. |
| Attendance table: one decided row's dropdown ("Late") looks enabled despite already having an outcome badge; the other decided row's dropdown is visibly locked | Both decided rows lock the dropdown | Figma is internally inconsistent on this one control state across its two examples; the locked state is the one that reads correctly once a decision exists, so both rows use it. |

The client detail dialog exists as three Figma frames (Groups 26/27/28,
Clients screen) drawn over a flattened screenshot of the page; the three
payment dialogs (Add/Verify/View, Finance screen) and the staff detail
dialog's three tabs (Overview/Attendance/Salary, Groups 75/76/78) are the same
pattern under different names. All three are one dialog each here, not three
- see "One dialog, three modes" above.

## Known Figma/icon access gaps

Figma MCP access dropped mid-build on the Finance screens, after screenshots
and most `get_design_context` calls had already been captured but before two
icon exports. Both substitutions reuse an icon already in the sprite rather
than inventing new SVG paths, and are called out at their point of use:

- **Upload affordance** (`FileDropzone`) - `download-cloud` rotated 180deg,
  which draws the same cloud with the arrow reversed.
- **Proof-attached indicator** (Finance table's Proof column) - `check-circle`
  in the success tone, rather than a literal paperclip glyph.
- **Invoice download** (Finance table's Invoice column) - `download-cloud` at
  `sm`, standing in for a dedicated small download glyph.

Figma access dropped again mid-way through the Staff build (a separate
outage, same failure mode - `/mcp` reauth fixed it). No icon exports were
missed that time; the calendar's decorative month-nav arrows reuse
`chevron-down` rotated ±90deg rather than fetching dedicated chevron-left/
chevron-right glyphs, since the control isn't functional (see
`AttendanceCalendar`) - a substitution of convenience, not a gap.

Swap in the real Figma exports for these three if access is available later;
none are load-bearing enough to block on.

## Known placeholders

Wired but not real - expected to be replaced:

- `lib/auth.jsx` - role comes from localStorage, not a session. Swap the
  `useState` initialiser for the Django auth call.
- `pages/RoleSwitcher.jsx` - stands in for the designed LOGIN PAGE (1181:89498).
- `layouts/MobileLayout.jsx` - structural stub, not the designed client app.
- `data/*.js` - sample rows; replace with API calls, keep the shape.
- The sidebar search box and `Pagination`'s buttons are inert.
- `AddClientDialog` validates nothing and discards on save.
