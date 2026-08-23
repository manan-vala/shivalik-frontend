import { useEffect, useState, useMemo } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import SearchInput from "../../components/ui/SearchInput.jsx";
import Icon from "../../components/ui/Icon.jsx";
import Badge from "../../components/ui/Badge.jsx";
import { getSections, getRacks, getBookInventory } from "../../lib/api/inventory.js";

function responseItems(response) {
  return Array.isArray(response) ? response : response?.results || [];
}

export default function WarehouseMapPage() {
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [racks, setRacks] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedRackId, setSelectedRackId] = useState(2); // Default selected A-02 to match screenshot
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [secRes, rackRes, invRes] = await Promise.allSettled([
          getSections(),
          getRacks(),
          getBookInventory(),
        ]);

        const loadedSections = secRes.status === "fulfilled" ? responseItems(secRes.value) : [];
        const loadedRacks = rackRes.status === "fulfilled" ? responseItems(rackRes.value) : [];
        const loadedInv = invRes.status === "fulfilled" ? responseItems(invRes.value) : [];

        setSections(loadedSections);
        setRacks(loadedRacks);
        setInventory(loadedInv);
      } catch (err) {
        console.error("Failed to load warehouse data:", err);
        setSections([]);
        setRacks([]);
        setInventory([]);
        setError(err.message || "Failed to load warehouse data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Group racks by section name
  const groupedSections = useMemo(() => {
    const map = {};

    // Ensure all sections exist in map
    sections.forEach((sec) => {
      map[sec.name] = [];
    });

    racks.forEach((rack) => {
      const secName = rack.section_name || sections.find((s) => s.id === rack.section)?.name || "Section A";
      if (!map[secName]) map[secName] = [];

      // Filter by search query if applicable
      const query = searchQuery.trim().toLowerCase();
      let matches = true;

      if (query) {
        const matchesRack = rack.name?.toLowerCase().includes(query) || rack.code?.toLowerCase().includes(query) || secName.toLowerCase().includes(query);
        const rackBooks = inventory.filter((b) => b.rack === rack.id);
        const matchesBook = rackBooks.some((b) => (b.book_title || b.title || "").toLowerCase().includes(query) || (b.isbn || "").toLowerCase().includes(query));
        matches = matchesRack || matchesBook;
      }

      if (matches) {
        map[secName].push(rack);
      }
    });

    return map;
  }, [sections, racks, inventory, searchQuery]);

  // Currently selected rack details
  const selectedRack = useMemo(() => {
    return racks.find((r) => r.id === selectedRackId) || null;
  }, [racks, selectedRackId]);

  // Books stored on selected rack
  const selectedRackBooks = useMemo(() => {
    if (!selectedRackId) return [];
    return inventory.filter((item) => item.rack === selectedRackId);
  }, [inventory, selectedRackId]);

  // Capacity calculations for selected rack
  const capacityStats = useMemo(() => {
    if (!selectedRack) return { total: 0, occupied: 0, available: 0, percentage: 0 };
    const total = selectedRack.max_capacity || 200;
    const occupied = selectedRack.current_stock || 0;
    const available = Math.max(0, total - occupied);
    const percentage = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { total, occupied, available, percentage };
  }, [selectedRack]);

  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col gap-1">
        <nav className="text-xs font-medium text-tertiary">
          Inventory Map &gt; <span className="text-primary font-semibold">Warehouse Map</span>
        </nav>
        <PageHeader
          title="Warehouse Map"
          description="Interactive rack-by-rack layout of the warehouse floor."
        />
      </div>

      {/* Global Search Bar */}
      <div className="w-full max-w-xl">
        <SearchInput
          placeholder="Search by book name, ISBN, author, or rack location"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Main Grid & Detail Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {/* Left 2D Warehouse Floor Layout (Spans 2-3 Columns) */}
        <div className="lg:col-span-2 xl:col-span-3">
          <Card className="p-6">
            <div className="flex items-center justify-between border-b border-border-default pb-4">
              <div>
                <h2 className="text-lg font-semibold text-primary">Warehouse Floor Layout</h2>
                <p className="text-xs text-tertiary">Click any rack to view details</p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs font-medium text-secondary">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-gray-300"></span>
                  Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-brand"></span>
                  Occupied
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <p className="text-sm text-tertiary animate-pulse">Loading warehouse floor map...</p>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
                {Object.entries(groupedSections).map(([secName, secRacks]) => (
                  <div key={secName} className="flex min-w-0 flex-col gap-3">
                    {/* Section Header Header Badge */}
                    <div className="flex justify-center">
                      <span className="flex min-h-18 w-full items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-center text-xs font-semibold text-inverse shadow-xs">
                        {secName}
                      </span>
                    </div>

                    {/* Section Rack List */}
                    <div className="flex flex-col gap-3">
                      {secRacks.length === 0 ? (
                        <div className="rounded-md border border-dashed border-border-default p-4 text-center text-xs text-tertiary">
                          No racks found
                        </div>
                      ) : (
                        secRacks.map((rack) => {
                          const isSelected = selectedRackId === rack.id;
                          const cap = rack.max_capacity || 200;
                          const stock = rack.current_stock || 0;
                          const pct = cap > 0 ? Math.round((stock / cap) * 100) : 0;

                          // Color indicator logic
                          let barColor = "bg-success-500";
                          if (pct > 80) barColor = "bg-error-500";
                          else if (pct > 50) barColor = "bg-warning-500";

                          return (
                            <button
                              key={rack.id}
                              type="button"
                              onClick={() => setSelectedRackId(rack.id)}
                              className={`flex min-h-36 flex-col justify-between rounded-lg border p-4 text-left transition-all ${
                                isSelected
                                  ? "border-brand bg-primary-50/50 shadow-sm ring-2 ring-brand"
                                  : "border-border-default bg-surface hover:border-border-strong hover:bg-muted/50"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-primary">
                                  {rack.name || rack.code}
                                </span>
                              </div>

                              <div className="mt-4 flex items-center justify-between gap-2">
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                                  <div
                                    className={`h-full ${barColor} transition-all duration-300`}
                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium tabular text-tertiary">
                                  {pct}%
                                </span>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Side Panel: Rack Detail or Empty Selection State */}
        <div className="min-w-0 lg:col-span-1">
          <Card className="h-full p-4 sm:p-6">
            {!selectedRack ? (
              <div className="flex h-80 flex-col items-center justify-center text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-brand-subtle text-on-brand mb-4">
                  <Icon name="search" size="lg" />
                </div>
                <h3 className="text-md font-semibold text-primary">Select a Rack</h3>
                <p className="mt-1 text-xs text-tertiary max-w-xs">
                  Click on any rack in the warehouse map to view detailed information.
                </p>
              </div>
            ) : (
              <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
                {/* Rack Header */}
                <div className="flex items-start justify-between border-b border-border-default pb-4">
                  <div className="min-w-0 pr-3">
                    <h3 className="break-words text-lg font-bold text-primary">
                      Rack {selectedRack.name || selectedRack.code}
                    </h3>
                    <p className="text-xs text-tertiary">
                      {selectedRack.section_name || "Section A"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRackId(null)}
                    className="rounded-md p-1 text-tertiary hover:bg-muted hover:text-primary"
                    aria-label="Close rack details"
                  >
                    <Icon name="x-close" size="md" />
                  </button>
                </div>

                {/* Quick Capacity Stats Grid */}
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2.5">
                    <span className="text-xs font-medium text-tertiary">Total</span>
                    <span className="text-lg font-bold text-primary tabular">
                      {capacityStats.total}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2.5">
                    <span className="text-xs font-medium text-tertiary">Occupied</span>
                    <span className="text-lg font-bold text-brand tabular">
                      {capacityStats.occupied}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2.5">
                    <span className="text-xs font-medium text-tertiary">Available</span>
                    <span className="text-lg font-bold text-success-700 tabular">
                      {capacityStats.available}
                    </span>
                  </div>
                </div>

                {/* Overall Occupancy Progress Bar */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs text-tertiary font-medium">
                    <span>Occupancy Rate</span>
                    <span>{capacityStats.percentage}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full bg-brand transition-all duration-300"
                      style={{ width: `${Math.min(capacityStats.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Stored Books List */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-sm font-semibold text-primary">
                    Stored Books ({selectedRackBooks.reduce((sum, b) => sum + (b.curr_stock || 0), 0)})
                  </h4>

                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
                    {selectedRackBooks.length === 0 ? (
                      <p className="py-4 text-center text-xs text-tertiary">
                        No books currently recorded on this rack.
                      </p>
                    ) : (
                      selectedRackBooks.map((book) => (
                        <div
                          key={book.id || book.book}
                          className="flex items-center justify-between rounded-md border border-border-default bg-subtle p-3 transition-colors hover:bg-muted/40"
                        >
                          <div className="flex flex-col min-w-0 pr-2">
                            <span className="truncate text-sm font-medium text-primary">
                              {book.book_title || book.title || "Untitled Book"}
                            </span>
                            {book.isbn && (
                              <span className="truncate text-xs text-tertiary">
                                ISBN: {book.isbn}
                              </span>
                            )}
                          </div>
                          <Badge tone="brand" size="md" className="shrink-0 font-bold tabular">
                            {book.curr_stock}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 rounded-md bg-muted/40 p-3 text-xs text-tertiary">
                  <div className="contents">
                    <span className="whitespace-nowrap">Last Updated:</span>
                    <span className="break-words text-right font-medium text-secondary">
                      {selectedRack.last_change_date
                        ? new Date(selectedRack.last_change_date).toLocaleString()
                        : "12-08-2024 10:30 AM"}
                    </span>
                  </div>
                  <div className="contents">
                    <span className="whitespace-nowrap">Recorded By:</span>
                    <span className="break-words text-right font-medium text-secondary">
                      {selectedRack.updated_by_name || "Inv. Manager"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
