import { useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import Badge from "../../components/ui/Badge.jsx";
import SearchInput from "../../components/ui/SearchInput.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import AddClientDialog from "../../components/clients/AddClientDialog.jsx";
import ClientDetailDialog from "../../components/clients/ClientDetailDialog.jsx";
import {
  TableCard,
  TableToolbar,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  CellStack,
} from "../../components/ui/Table.jsx";
import { CLIENTS, CLIENT_STATUS } from "../../data/clients.js";

/**
 * Clients - Shivalik Admin
 * Figma: FINAL SCREENS / Shivalik / Clients (node 790:56280)
 *   + Add Client dialog     (790:56541)
 *   + Client detail dialog  (790:56511 / 56474 / 56442)
 *
 * `filter` comes from the route so the sidebar sub-items (All / Active /
 * Inactive) drive the same page rather than duplicating it three times.
 */
export default function ClientsPage({ filter = "all" }) {
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const rows = useMemo(() => {
    const byStatus =
      filter === "all" ? CLIENTS : CLIENTS.filter((c) => c.status === filter);

    const q = query.trim().toLowerCase();
    if (!q) return byStatus;

    return byStatus.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    );
  }, [filter, query]);

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      <PageHeader
        title="Clients"
        actions={
          <Button
            variant="primary"
            iconLeading="plus"
            onClick={() => setAddOpen(true)}
          >
            Add Clients
          </Button>
        }
      />

      <TableCard>
        <TableToolbar>
          <SearchInput
            placeholder="Search clients..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search clients"
          />
        </TableToolbar>

        <Table>
          <THead>
            <TR>
              <TH width={140} align="center">Client ID</TH>
              <TH width={372}>Client</TH>
              <TH align="center">Last Order</TH>
              <TH width={164} align="center">Outstanding</TH>
              <TH width={123}>Status</TH>
              <TH width={120}>
                <span className="sr-only">Actions</span>
              </TH>
            </TR>
          </THead>

          <TBody>
            {rows.map((client) => {
              const status = CLIENT_STATUS[client.status];
              return (
                <TR
                  key={client.id}
                  className="cursor-pointer transition-colors hover:bg-subtle"
                  onClick={() => setSelected(client)}
                >
                  <TD className="font-medium text-primary">{client.id}</TD>
                  <TD>
                    <CellStack primary={client.name} supporting={client.city} />
                  </TD>
                  <TD align="center">{client.lastOrder}</TD>
                  <TD align="center" className="tabular">
                    {client.outstanding}
                  </TD>
                  <TD align="center">
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </TD>
                  <TD>
                    {/* Stop propagation so the row's own click handler does not
                        also fire and open the detail dialog behind the action. */}
                    <div
                      className="flex items-center justify-end gap-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="link">Edit</Button>
                      <Button
                        variant="linkBrand"
                        onClick={() => setSelected(client)}
                      >
                        View
                      </Button>
                    </div>
                  </TD>
                </TR>
              );
            })}

            {rows.length === 0 && (
              <TR>
                <TD colSpan={6} align="center" className="text-tertiary">
                  No clients match this filter.
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </TableCard>

      <Pagination hasPrevious={false} />

      <AddClientDialog open={addOpen} onClose={() => setAddOpen(false)} />

      {/* key remounts the dialog per client, which resets it to the Overview
          tab without an effect writing state during render. */}
      <ClientDetailDialog
        key={selected?.id}
        client={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
