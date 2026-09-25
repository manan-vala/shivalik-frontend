import { useMemo, useState } from "react";
import Badge from "../../components/ui/Badge.jsx";
import Card from "../../components/ui/Card.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import SearchInput from "../../components/ui/SearchInput.jsx";
import { getDeadStock } from "../../lib/api/inventory.js";
import { useApiData } from "../../lib/api/use-api-data.js";
import { coverInitials } from "../../lib/format.js";

/**
 * Dead Stock — third sibling of Warehouse Map and Empty Racks under
 * Inventory Map, so it shares their breadcrumb + stat-tile + Card table
 * layout rather than the PageHeader/TableCard shell the Inventory Overview
 * screens use.
 *
 * `stock/dead-stock/` decides staleness on the backend (stock that hasn't
 * moved out for longer than the title's window, or the site default) — this
 * screen renders what it returns rather than recomputing the cutoff.
 */
export default function DeadStockPage() {
  const { data: rows, loading, error } = useApiData(getDeadStock, []);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) =>
      [row.book_title, row.isbn, row.rack_location, row.vendor_name].some((value) =>
        String(value || "").toLowerCase().includes(query)
      )
    );
  }, [rows, searchQuery]);

  const totalUnits = rows.reduce((sum, row) => sum + Number(row.curr_stock || 0), 0);
  const titles = new Set(rows.map((row) => row.book)).size;
  const sectionCounts = rows.reduce((counts, row) => {
    const section = row.rack_location?.split(" / ")[1] || "Unassigned";
    counts[section] = (counts[section] || 0) + 1;
    return counts;
  }, {});
  const largestSection = Object.entries(sectionCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      <div className="flex flex-col gap-1">
        <nav className="text-xs font-medium text-tertiary">
          Inventory Map &gt; <span className="font-semibold text-primary">Dead Stock</span>
        </nav>
        <PageHeader
          title="Dead Stock"
          description="Stock that has sat on a rack past its title's dead-stock window."
        />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-label uppercase tracking-label text-tertiary">Dead stock overview</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-5">
            <p className="text-xs text-tertiary">Dead Stock Rows</p>
            <p className="mt-2 text-2xl font-bold text-primary tabular">{rows.length}</p>
            <p className="mt-1 text-xs text-secondary">Book / rack combinations</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-tertiary">Titles Affected</p>
            <p className="mt-2 text-2xl font-bold text-primary tabular">{titles}</p>
            <p className="mt-1 text-xs text-secondary">Distinct books</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-tertiary">Units Tied Up</p>
            <p className="mt-2 text-2xl font-bold text-primary tabular">{totalUnits}</p>
            <p className="mt-1 text-xs text-warning-700">Not moved out in time</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-tertiary">Largest Section</p>
            <p className="mt-2 truncate text-xl font-bold text-primary">{largestSection?.[0] || "None"}</p>
            <p className="mt-1 text-xs text-secondary">{largestSection?.[1] || 0} rows</p>
          </Card>
        </div>
      </section>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border-default p-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            placeholder="Search dead stock..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        {loading ? (
          <p className="p-8 text-center text-sm text-tertiary">Loading dead stock...</p>
        ) : error ? (
          <p className="p-8 text-center text-sm text-error-500">{error.message}</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-tertiary">
            {rows.length === 0 ? "Nothing is flagged as dead stock." : "No dead stock matches this search."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-muted/60 text-xs text-tertiary">
                <tr>
                  <th className="px-4 py-3 font-medium">Book</th>
                  <th className="px-4 py-3 font-medium">Rack</th>
                  <th className="px-4 py-3 font-medium">Vendor</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {filtered.map((row) => (
                  <tr key={row.id} className="text-secondary">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 shrink-0 rounded bg-[#1c2c4c] text-white flex items-center justify-center text-xs font-bold">
                          {coverInitials(row.book_title)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="truncate font-semibold text-primary">{row.book_title}</span>
                          <span className="truncate text-xs text-tertiary">{row.isbn}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{row.rack_location}</td>
                    <td className="px-4 py-3">{row.vendor_name || "—"}</td>
                    <td className="px-4 py-3 tabular font-medium text-primary">{row.curr_stock}</td>
                    <td className="px-4 py-3">
                      <Badge tone="alert" size="md">Dead Stock</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
