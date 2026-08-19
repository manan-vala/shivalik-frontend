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
    charts/             Five hand-rolled SVG charts on a shared module, no
                        charting dependency. See "Charts" below.
    analytics/          AnalyticsLayout (header + range + Custom dialog),
                        ChartCard, CustomRangeDialog.
    dashboard/          LiveActivity, AttendanceRequests - Dashboard-only.
    clients/            AddClientDialog, ClientDetailDialog.
    vendors/            VendorFormDialog (add/edit), VendorDetailDialog
                        (4 tabs), AssignStockDialog, VendorChatDialog.
    orders/             OrderDetailDialog (4 tabs), OrderPartyTab,
                        OrderTimeline, AssignVendorsDialog,
                        ConfirmDispatchDialog.
    quotes/             CreateQuoteDialog - also the Orders screen's
                        "Add New Quote".
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

The Analytics screens brought the second, third, fourth and fifth charts, so
the "evaluate a library then" note this section used to carry was resolved:
**hand-rolled on a shared module, no charting dependency.** These plots are
static bars and arcs rather than interactive figures, the design tokens flow
straight through as CSS variables, and a library would have meant rewriting
`RevenueTrendChart` to match. Revisit if a chart ever needs brushing, zooming
or real-time streaming.

```
charts/
  chart-utils.js      useMeasuredWidth, bandScale, linearScale, niceTicks,
                      labelStride, CHART_SERIES        (no components)
  primitives.jsx      GridLines, XAxisLabels, YAxisLabels, ChartLegend,
                      ChartTooltip, ChartDataTable     (components only)
  BarChart            Revenue by city        - single series
  DonutChart          Vendor breakdown       - part-to-whole
  GroupedBarChart     Revenue vs Collected   - two series
  StackedBarChart     AR ageing              - ordered buckets
  RevenueTrendChart   Order Frequency Trend  - change over time
```

The split between `chart-utils.js` and `primitives.jsx` is not cosmetic: Fast
Refresh only works when a module exports components alone, so the hook and the
constants cannot live beside them.

### Colour

Series colour comes from `--color-chart-1..5` in tokens.css, assigned in that
fixed order and never cycled. That set is **not** what Figma draws, and the
reason is recorded in tokens.css: the vendor-breakdown donut uses five steps of
one purple ramp, which the dataviz validator rejects at worst-adjacent
dE 7.8 normal-vision, below the 15 floor - two slices a reader with full colour
vision cannot separate. The replacement cross-hue set passes every check
(dE 25.1 deutan / 26.6 normal). Re-run `validate_palette.js` before changing
any of them, and keep the order: it is what holds the two hardest-to-separate
hues apart.

Two places keep a single-hue ramp on purpose:

- **AR ageing** stacks 0-30d -> 90d+, which is an *ordered* scale, and one hue
  light-to-dark is the correct encoding for that. The check that applies is
  lightness monotonicity, not the categorical CVD floor.
- **RevenueTrendChart** and **GroupedBarChart** use primary-400/600, a pair
  already validated at dE 17.5.

Every chart carries a legend for two or more series, a `<title>` on each mark,
and a collapsed "View data" table - the palette's sub-3:1 contrast warning
obliges a visible label, and a chart should be readable without colour.

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
| Client Issues           | Shivalik Admin | 1180:36896              | `/admin/support/client-issues` |
| Vendor Issues           | Shivalik Admin | 1180:37141              | `/admin/support/vendor-issues` |
| Knowledge Base          | Shivalik Admin | 1180:37386              | `/admin/support/knowledge-base` |
| New Ticket dialog       | Shivalik Admin | 1180:37549/37586/37608/37567 | opens from "New Ticket" |
| View Ticket dialog      | Shivalik Admin | 1180:37631/37655        | opens on row click or "View" |
| Escalate dialog         | Shivalik Admin | 1180:37643/37667        | opens from a row's "Escalate" |
| Add/Edit article dialog | Shivalik Admin | 1180:37689/37679        | opens from "Add knowledge base" or a row's "Edit" |
| Vendors                 | Shivalik Admin | 1180:48387 (GOLDEN file) | `/admin/vendors`, `…/printing`, `…/binding`, `…/active`, `…/inactive` |
| Add/Edit Vendor dialog  | Shivalik Admin | 1180:48049 / 48090      | opens from "Add Vendors" or a row's "Edit" |
| Assign Stock dialog     | Shivalik Admin | 1180:48141              | opens from a row's "Assign" |
| Vendor detail dialog    | Shivalik Admin | 1180:48178/48212/48262  | opens on row click or "View" |
| Vendor chat panel       | Shivalik Admin | 1180:48315              | opens from the detail dialog's "Chat" |
| Orders                  | Shivalik Admin | 1180:51161 (GOLDEN file) | `/admin/orders` + six stage routes |
| Order detail dialog     | Shivalik Admin | 1180:50810/50943/51000/51057 | opens on row click or "View" |
| Assign Vendors dialog   | Shivalik Admin | 1180:51117              | opens from a row's "Edit" |
| Confirm Dispatch dialog | Shivalik Admin | 1180:51138              | opens from a ready row's "Dispatch" |
| Create Quote (Orders)   | Shivalik Admin | 1180:50679              | opens from "Add New Quote" |
| Analytics / Sales       | Shivalik Admin | 1180:52808 (GOLDEN file) | `/admin/analytics/sales` |
| Analytics / Operational | Shivalik Admin | 1180:53018              | `/admin/analytics/operational` |
| Analytics / Financial   | Shivalik Admin | 1180:53377              | `/admin/analytics/financial` |
| Customise analytics dialog | Shivalik Admin | 1180:53577 / 55034 / 55069 | opens from the "Custom" range option |

The Dashboard's Add Client action reuses the same `AddClientDialog` built for
the Clients screen. Add Vendor, Create Quote and Generate Invoice are their
own components, following the same `Modal` + `TextField` pattern. Add/Edit
Staff Member are one component (`StaffFormDialog`, mode-parameterised) - see
"One dialog, three modes" above; it is the same construction with two modes
instead of three.

Client Issues and Vendor Issues are one component too - `SupportTicketsPage`
takes an `audience` prop off the route, the way `ClientsPage` takes `filter`.
The two Figma frames differ only in which tickets they list. `NewTicketDialog`
is the three-mode pattern again (Self / Client / Vendor swap one row of
pickers); `ArticleFormDialog` is the two-mode Add/Edit pattern.

Support's sub-nav (Client Issues / Vendor Issues / Knowledge Base) needed no
component change - `Sidebar` renders `footerNav` through the same
`SidebarNavItem` as `nav`, which already handles a `children`-bearing entry,
so it was a data edit in `routes/portals.js` alone.

The Vendors screens come from a **different Figma file** - `GOLDEN (Copy)`,
file key `VVZ3VLv1ftnqITsHBh8TEU` - not the `seBrOkPG7tYQyxwmF1Mx4j` file every
earlier screen was built from. Despite the name, its Vendors frame is the
Shivalik Admin sidebar, so it lands in this portal.

`VendorDetailDialog` is `ClientDetailDialog`'s construction with a fourth tab
and a Chat button; `VendorFormDialog` is the two-mode Add/Edit pattern.
`AddVendorDialog` was **deleted** - see the deviation table for why the two
files disagreed and which one won.

Orders is the fourth screen built on the `filter`-prop construction, with
seven routes behind one `OrdersPage`. Its route segments *are* the
`ORDER_STATUS` keys, so there is no segment-to-status translation table to
keep in sync.

Two extractions came out of this phase rather than new one-off code:

- **`ui/ChatThread`** - the vendor chat panel and three of the order detail
  dialog's four tabs draw the identical thread. The bubbles, avatars, typing
  indicator and composer now live in one component; `VendorChatDialog` is a
  ~25-line wrapper around it.
- **`orders/OrderPartyTab`** - the Client, Printing Vendor and Binding Vendor
  frames are one component with a `party` prop, not three near-copies. Only
  the Overview tab has a layout of its own.

`CreateQuoteDialog` was **not** rebuilt: node 1180:50679 is the same eight
fields and the same cost table as the frame it was already built from, so it
only gained a "Save Draft" action and a close control.

The three Analytics screens share `AnalyticsLayout`, which owns the page
header, the 7d/30d/90d/Custom control and the Custom dialog - the three frames
differ only in what sits underneath. The three "Custom" frames the design
supplies are byte-identical, so they are one `CustomRangeDialog`, not three.

`SegmentedToggle` (in `ui/`) is the same control three times over: the range
picker, the Revenue/Collected switch and the AR-ageing buckets. `joined` picks
the skin; behaviour and markup are identical.

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
| Knowledge base body field labelled "Contect" | "Body (markdown)" | Typo. The Edit-article frame labels the same field correctly, so this is the frame's own wording, not a rename. |
| "Add knowledge base" opens prefilled with the Edit frame's data ("How to record a payment" / "Payment") | Add mode starts empty | Copy-paste leftover from duplicating the Edit frame; every other Add dialog in the app starts empty. |
| Ticket table draws a blank header over "View" and "Action" over "Escalate" | One right-aligned "Action" header spanning both | They are one column of row actions; a blank `<th>` announces as an empty column to screen readers. |
| Escalate's "Reason" placeholder is centred in its box | Top-left, like every other textarea | The "Assign to" field in the same dialog is left-aligned, so the centring is a stray text-layer property, not an intent. |
| Escalate dialog titled "Escalate TK-2001" while the table lists `TKT-100xx` ids | Title reads the actual row's id | The two ids don't come from the same series - the frame's title was never updated to the table it sits over. |
| Ticket table's cells drawn tightly packed, with column ranges that overlap between rows | `<Table density="dense" nowrap>` | The frame is loosely assembled (stray dividers, overlapping column ranges), but the intent is unambiguous: 9 single-line columns. See "Table density" below. |
| Add Vendor drawn twice across two files: the older frame (790:22655) has a Printing/Binding **radio** group and a three-button footer; the GOLDEN frame (1180:48049) has **checkboxes** and two buttons | The GOLDEN version, as one `VendorFormDialog` | A vendor can do both printing and binding, and the newer frame ticks both boxes - the radio group was the wrong control. Unified rather than kept as two dialogs that disagree; the Dashboard's Add Vendor now opens this one too. |
| Vendor detail dialog draws four tabs but the file contains only three panels - no Stock frame exists | Stock tab renders the vendor's material list | An inert fourth tab is a dead control. The panel uses the shape the Assign Stock dialog's "Current Stock" establishes. **Confirm against the intended design before release.** |
| Vendors sidebar sub-items drawn as checkboxes (Printing / Binding / Active / Inactive) | Routes, as on Clients | The sidebar is generated from the portal registry and is a navigation tree, not a filter surface; stateful checkboxes there would have to reach across the app shell. Each item still resolves to the listing it names. |
| Vendors backdrop screenshot is titled "Orders" | "Vendors" | The backdrop is a stale screenshot pasted under the dialogs; the live frame's own header reads "Vendors". |
| Assign Stock panel labels use #808080 and #666 - two greys outside the token set | `text-tertiary` / token roles | Nearest role is Gray/500 (#667085). Two one-off hex values are not worth leaving the token system for. |
| Chat panel repeats the same stock portrait for every Anita Cruz message | Initials on a brand-tinted circle | Same call as the Attendance approval avatars - the file has no real per-person images. |
| Escalate/vendor frames title a dialog with an id from a different series (e.g. "Escalate TK-2001" over `TKT-100xx` rows) | The actual row's id | The frame titles were never updated to the tables they sit over. |
| Order detail drawn as a sheet filling the whole main content area (1128px, no dimmed backdrop) | `Modal` at width 1128 | Keeps the dialog behaviour every other detail view already has - Escape, focus trap, backdrop dismiss - rather than introducing a second overlay language for one screen. |
| Binding Vendor tab omits the "Today" divider the Client and Printing Vendor tabs draw | Divider on all three | Same conversation on all three frames; the missing rule is an inconsistency between frames, not a state. |
| Order detail frames all show ORD-5002 while the list runs ORD-10000 upward | Detail attached to the real row | Otherwise every row opens a dialog for an order id that is not in the table. |
| Orders list has no pagination, unlike every other list screen | Rendered without one | Not adding a control the design does not have. |
| Orders colours "In Printing" indigo and "In Binding" orange; the client detail dialog colours the same labels bluelight and indigo | Both kept, in separate vocabularies | The two frames genuinely paint the same labels differently. `data/orders.js` owns the Orders vocabulary; `data/clients.js` keeps the client dialog's. Colours were sampled from the rendered frame, not guessed. |
| Vendor-breakdown donut drawn as five steps of one purple ramp | Validated cross-hue `--color-chart-1..5` | The validator rejects the original at dE 7.8 normal-vision separation, below the 15 floor: two slices are indistinguishable to a reader with full colour vision. These are unordered categories, so a single-hue ramp is the wrong encoding regardless. See "Charts". |
| Analytics sidebar item named "Distribution" in the route registry | "Operational" | All three Analytics frames label it Operational; the registry name predated them. |
| "Revenue vs Collected" y axis labelled "Active users" | "Amount" | Untitled UI template copy left on a revenue chart. A wrong axis label is worse than none. |
| "Cost per delivery" last column header reads "Cost?delivery" | "Cost/delivery" | Stray character. |
| AR ageing's bucket toggle reads as a filter, but the bars stack all four buckets at once | Toggle emphasises one bucket, dimming the rest | Filtering to one bucket would leave the stack showing a total that is not the total. Emphasis lets the control do something without hiding data. |
| Analytics tables repeat one row and restart their numbering at 5 partway down | Distinct names, correct 1..10 sequence | Same placeholder repetition as the Clients screen; duplicate keys break list rendering. |

## Table density

`Table` takes two opt-in props, both added for the Support ticket table:

- `density="dense"` drops the cell gutter from 24px to 12px. Nine columns at
  the default gutter spend 432px on padding alone in a 1098px content area,
  which forces every cell to wrap.
- `nowrap` puts cells on one line (`TH` has always been nowrap; `TD` was not).

Neither is the default, and that is deliberate: Finance's ten columns rely on
being able to wrap to keep the row-action column on screen, so turning either
on globally clips it. A screen opts in once it has budgeted the width.

Other shared components gained capabilities while building Vendors:

- `CheckboxGroup` (in `TextField.jsx`, beside `RadioGroup`) - multi-select,
  because a vendor can be both a printing and a binding vendor.
- `NumberedPagination` (in `Pagination.jsx`) - "Previous 1 2 3 … 10 Next", the
  control the vendor detail dialog's Order and Payment tabs draw. Distinct
  from the three-button group used under full-page tables.
- `TextField`'s `actionDisabled` - dims an inline Verify / Auto-generate in
  place rather than removing it, which is what Edit Vendor draws.
- `Modal`'s `showCloseButton` now also works alongside a custom `header`,
  where it sits on its own row above the header content. Previously it was
  scoped to the plain-`title` path, so the tabbed dialogs could not show one.

`StatCard` gained a `tone` prop in an earlier phase for Support's "Avg
resolution time" card, which shows a *downward* arrow in a *success*-toned pill because a
shorter resolution time is the good outcome. `tone` overrides the colour the
arrow direction would otherwise imply, without touching the arrow. `Modal`
gained `showCloseButton` for the four Support dialogs.

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
