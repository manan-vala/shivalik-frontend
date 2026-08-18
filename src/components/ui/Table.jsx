import { createContext, useContext, useMemo } from "react";

/**
 * Table primitives
 * -----------------------------------------------------------------------------
 * The single densest pattern in the product - 4,162 table cell instances across
 * FINAL SCREENS - so it is built once here and composed per screen.
 *
 * Figma geometry:
 *   header cell   h-44, px-24 py-12, 12/18 medium, gray-500
 *   body cell     h-72, px-24 py-16, 14/20
 *   row divider   1px gray-200
 *   card          white, 1px gray-200, radius 8, shadow-sm, clipped
 *
 * Built on real <table> markup rather than divs so it stays navigable to
 * screen readers and keyboard users.
 *
 *   <TableCard>
 *     <TableToolbar>...</TableToolbar>
 *     <Table>
 *       <THead><TR><TH>Client</TH>...</TR></THead>
 *       <TBody><TR><TD>...</TD></TR></TBody>
 *     </Table>
 *   </TableCard>
 */

const ALIGN = {
  left: "text-left justify-start",
  center: "text-center justify-center",
  right: "text-right justify-end",
};

/**
 * Cell density.
 *
 * The default 24px gutter is the Figma spec for the 5-7 column tables
 * (Clients, Staff, Finance). Support's ticket table carries 9 columns in the
 * same 1098px content area, where 24px gutters alone would eat 432px and
 * force every cell to wrap - the design draws those cells single-line and
 * tightly packed. `density="dense"` is that second spec, kept here so a
 * screen picks a documented option instead of overriding padding per cell.
 *
 * `nowrap` is the matching opt-in for single-line cells. It is NOT the default:
 * the wider tables (Finance's 10 columns) rely on being able to wrap to keep
 * their last column on screen, so forcing one line there clips the row
 * actions. A screen turns it on once it has budgeted the width for it.
 */
const TableContext = createContext({ density: "default", nowrap: false });

const PAD = {
  default: "px-6",
  dense: "px-3",
};

export function TableCard({ children, className = "" }) {
  return (
    <div
      className={[
        "overflow-hidden rounded-md border border-border-default bg-surface shadow-sm",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

/** Filters row that sits above the table, inside the same card. */
export function TableToolbar({ children, className = "" }) {
  return (
    <div
      className={[
        "border-b border-border-default px-4 py-3",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function Table({
  children,
  density = "default",
  nowrap = false,
  className = "",
}) {
  const ctx = useMemo(() => ({ density, nowrap }), [density, nowrap]);

  return (
    <TableContext.Provider value={ctx}>
      <div className="overflow-x-auto">
        <table className={["w-full border-collapse", className].join(" ")}>
          {children}
        </table>
      </div>
    </TableContext.Provider>
  );
}

export function THead({ children }) {
  return <thead>{children}</thead>;
}

export function TBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TR({ children, className = "", ...rest }) {
  return (
    <tr
      className={["border-b border-border-default last:border-b-0", className].join(" ")}
      {...rest}
    >
      {children}
    </tr>
  );
}

export function TH({ children, align = "left", width, className = "" }) {
  const { density } = useContext(TableContext);

  return (
    <th
      scope="col"
      style={width ? { width } : undefined}
      className={[
        `h-11 ${PAD[density]} py-3 text-xs font-medium text-tertiary whitespace-nowrap`,
        ALIGN[align].split(" ")[0],
        className,
      ].join(" ")}
    >
      {children}
    </th>
  );
}

export function TD({ children, align = "left", className = "", ...rest }) {
  const { density, nowrap } = useContext(TableContext);

  return (
    <td
      className={[
        `h-18 ${PAD[density]} py-4 text-sm text-tertiary align-middle`,
        nowrap ? "whitespace-nowrap" : "",
        ALIGN[align].split(" ")[0],
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </td>
  );
}

/**
 * Two-line cell: a primary value with a supporting line beneath.
 * Used for the Client column (name over city).
 */
export function CellStack({ primary, supporting }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-primary">{primary}</span>
      {supporting && <span className="text-sm text-tertiary">{supporting}</span>}
    </div>
  );
}
