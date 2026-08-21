import { useEffect, useMemo, useState } from "react";
import Badge from "../../components/ui/Badge.jsx";
import Card from "../../components/ui/Card.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";
import SearchInput from "../../components/ui/SearchInput.jsx";
import { getRacks } from "../../lib/api/inventory.js";

function responseItems(response) {
  return Array.isArray(response) ? response : response?.results || [];
}

function formatDate(value) {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleDateString();
}

export default function EmptyRacksPage() {
  const [racks, setRacks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRacks() {
      setLoading(true);
      setError("");
      try {
        const response = await getRacks();
        if (active) setRacks(responseItems(response));
      } catch (err) {
        if (active) setError(err.message || "Unable to load racks.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadRacks();
    return () => {
      active = false;
    };
  }, []);

  const emptyRacks = useMemo(
    () => racks.filter((rack) => Number(rack.current_stock || 0) === 0),
    [racks]
  );

  const filteredRacks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return emptyRacks.filter((rack) => {
      const matchesSearch = !query || [
        rack.name,
        rack.code,
        rack.section_name,
        rack.section?.name,
      ].some((value) => String(value || "").toLowerCase().includes(query));
      const isRecent = rack.last_used
        && Date.now() - new Date(rack.last_used).getTime() <= 7 * 86400000;
      const matchesStatus = statusFilter === "all"
        || (statusFilter === "recent" && isRecent)
        || (statusFilter === "empty" && !isRecent);
      return matchesSearch && matchesStatus;
    });
  }, [emptyRacks, searchQuery, statusFilter]);

  const totalCapacity = emptyRacks.reduce(
    (total, rack) => total + Number(rack.max_capacity || 0),
    0
  );
  const recentlyUsed = emptyRacks.filter(
    (rack) => rack.last_used && Date.now() - new Date(rack.last_used).getTime() <= 7 * 86400000
  ).length;
  const sectionCounts = emptyRacks.reduce((counts, rack) => {
    const section = rack.section_name || "Unassigned";
    counts[section] = (counts[section] || 0) + 1;
    return counts;
  }, {});
  const mostUsedSection = Object.entries(sectionCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      <div className="flex flex-col gap-1">
        <nav className="text-xs font-medium text-tertiary">
          Inventory Map &gt; <span className="font-semibold text-primary">Empty Racks</span>
        </nav>
        <PageHeader
          title="Empty Racks"
          description="Storage locations with zero occupancy."
        />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-label uppercase tracking-label text-tertiary">Empty racks overview</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-5">
            <p className="text-xs text-tertiary">Total Empty Racks</p>
            <p className="mt-2 text-2xl font-bold text-primary tabular">{emptyRacks.length}</p>
            <p className="mt-1 text-xs text-secondary">Available locations</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-tertiary">Available Capacity</p>
            <p className="mt-2 text-2xl font-bold text-primary tabular">{totalCapacity}</p>
            <p className="mt-1 text-xs text-success-700">Total units capacity</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-tertiary">Recently Used</p>
            <p className="mt-2 text-2xl font-bold text-primary tabular">{recentlyUsed}</p>
            <p className="mt-1 text-xs text-secondary">Used in the last 7 days</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-tertiary">Largest Section</p>
            <p className="mt-2 truncate text-xl font-bold text-primary">{mostUsedSection?.[0] || "None"}</p>
            <p className="mt-1 text-xs text-secondary">{mostUsedSection?.[1] || 0} empty racks</p>
          </Card>
        </div>
      </section>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border-default p-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            placeholder="Search empty racks..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-md border border-border-default bg-surface px-3 py-2 text-sm text-secondary"
            aria-label="Filter empty racks"
          >
            <option value="all">All Status</option>
            <option value="recent">Recently Used</option>
            <option value="empty">Empty Long Term</option>
          </select>
        </div>

        {loading ? (
          <p className="p-8 text-center text-sm text-tertiary">Loading empty racks...</p>
        ) : error ? (
          <p className="p-8 text-center text-sm text-error-500">{error}</p>
        ) : filteredRacks.length === 0 ? (
          <p className="p-8 text-center text-sm text-tertiary">No empty racks found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-muted/60 text-xs text-tertiary">
                <tr>
                  <th className="px-4 py-3 font-medium">Rack</th>
                  <th className="px-4 py-3 font-medium">Section</th>
                  <th className="px-4 py-3 font-medium">Capacity</th>
                  <th className="px-4 py-3 font-medium">Current Status</th>
                  <th className="px-4 py-3 font-medium">Last Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {filteredRacks.map((rack) => (
                  <tr key={rack.id} className="text-secondary">
                    <td className="px-4 py-3 font-semibold text-primary">{rack.name || rack.code}</td>
                    <td className="px-4 py-3">{rack.section_name || "Unassigned"}</td>
                    <td className="px-4 py-3 tabular">{rack.max_capacity || 0} units</td>
                    <td className="px-4 py-3"><Badge tone="neutral" size="md">Empty</Badge></td>
                    <td className="px-4 py-3">{formatDate(rack.last_used)}</td>
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
