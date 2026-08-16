/**
 * PlainTable / DetailList
 * -----------------------------------------------------------------------------
 * The lightweight row treatment used inside dialogs - underlined rows with no
 * card, border or fill. Distinct from the bordered TableCard used on full pages.
 *
 * Figma (nodes 790:56485, 790:56522):
 *   rows    py-8, 1px gray-200 bottom border, gap-12 between rows
 *   text    16/24 medium; labels and headers gray-500, values gray-900
 *
 * Both are real table / dl markup so the header-to-cell and label-to-value
 * relationships survive for screen readers.
 */

const ROW = "flex items-center justify-between border-b border-border-default py-2";

/** Label/value pairs - the Overview tab. */
export function DetailList({ items }) {
  return (
    <dl className="flex flex-col gap-3 text-md font-medium">
      {items.map((item) => (
        <div key={item.label} className={ROW}>
          <dt className="text-tertiary">{item.label}</dt>
          <dd className="m-0 text-right text-primary">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Flat table - the Order and Payment tabs.
 *
 * columns: [{ key, label, align }]
 * rows:    [{ [key]: node }]
 */
export function PlainTable({ columns, rows, emptyMessage = "Nothing to show." }) {
  return (
    <table className="w-full border-collapse text-md font-medium">
      <thead>
        <tr>
          {columns.map((col, i) => (
            <th
              key={col.key}
              scope="col"
              className={[
                "border-b border-border-default py-2 font-medium text-tertiary",
                align(col.align, i, columns.length),
              ].join(" ")}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, r) => (
          <tr key={r}>
            {columns.map((col, i) => (
              <td
                key={col.key}
                className={[
                  "border-b border-border-default py-2 text-primary",
                  align(col.align, i, columns.length),
                ].join(" ")}
              >
                {row[col.key]}
              </td>
            ))}
          </tr>
        ))}

        {rows.length === 0 && (
          <tr>
            <td
              colSpan={columns.length}
              className="py-6 text-center text-tertiary"
            >
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

/**
 * First column reads left, last reads right, anything between is centred.
 *
 * Class names are looked up rather than interpolated - Tailwind scans source
 * text, so a template literal like `text-${align}` produces a class that is
 * never generated.
 */
const ALIGN = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

function align(explicit, index, count) {
  if (explicit) return ALIGN[explicit] ?? ALIGN.left;
  if (index === 0) return ALIGN.left;
  if (index === count - 1) return ALIGN.right;
  return ALIGN.center;
}
