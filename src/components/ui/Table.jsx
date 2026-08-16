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

export function Table({ children, className = "" }) {
  return (
    <div className="overflow-x-auto">
      <table className={["w-full border-collapse", className].join(" ")}>
        {children}
      </table>
    </div>
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
  return (
    <th
      scope="col"
      style={width ? { width } : undefined}
      className={[
        "h-11 px-6 py-3 text-xs font-medium text-tertiary whitespace-nowrap",
        ALIGN[align].split(" ")[0],
        className,
      ].join(" ")}
    >
      {children}
    </th>
  );
}

export function TD({ children, align = "left", className = "", ...rest }) {
  return (
    <td
      className={[
        "h-18 px-6 py-4 text-sm text-tertiary align-middle",
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
