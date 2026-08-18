import { useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import { StatGrid } from "../../components/ui/StatCard.jsx";
import {
  TableCard,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "../../components/ui/Table.jsx";
import NewTicketDialog from "../../components/support/NewTicketDialog.jsx";
import TicketDetailDialog from "../../components/support/TicketDetailDialog.jsx";
import EscalateDialog from "../../components/support/EscalateDialog.jsx";
import { SUPPORT_SUMMARY, TICKETS, TICKET_STATUS } from "../../data/support.js";

/**
 * Support > Client Issues / Vendor Issues - Shivalik Admin
 * Figma: FINAL SCREENS / Shivalik Final
 *   Support_ client issues (node 1180:36896)
 *   Support_ vendor issues (node 1180:37141)
 *   + New Ticket   (1180:37549 / 37586 / 37608 / 37567)
 *   + View Ticket  (1180:37631 / 37655)
 *   + Escalate     (1180:37643 / 37667)
 *
 * The two screens are pixel-identical apart from which tickets they list, so
 * `audience` is a prop off the route rather than a second copy of the page -
 * the same construction as ClientsPage's `filter`.
 *
 * The stat row is the Dashboard's own StatCard/StatGrid (node 1180:36931 is
 * the same "Metric item" instance), and the table is the shared Table
 * primitives. Nothing here is a Support-specific layout except the columns.
 *
 * DEVIATION: the source draws the two action columns with separate headers -
 * a blank one over "View" and "Action" over "Escalate". Rendered as one
 * "Action" header over both, since they are one column of row actions and a
 * blank <th> announces as an empty column to screen readers.
 */
export default function SupportTicketsPage({ audience = "client" }) {
  const [newOpen, setNewOpen] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [escalating, setEscalating] = useState(null);

  const rows = useMemo(
    () => TICKETS.filter((t) => t.audience === audience || t.audience === "both"),
    [audience]
  );

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      <PageHeader
        title="Support"
        actions={
          <Button variant="primary" iconLeading="plus" onClick={() => setNewOpen(true)}>
            New Ticket
          </Button>
        }
      />

      <StatGrid items={SUPPORT_SUMMARY} />

      <TableCard>
        {/* dense: 9 columns in the width the other screens give 5-7, so the
            24px default gutter would wrap every cell. See Table.jsx. */}
        <Table density="dense" nowrap>
          <THead>
            <TR>
              <TH width={114} align="center">ID</TH>
              <TH width={215}>Subject</TH>
              <TH width={166} align="center">Raised by</TH>
              <TH width={85} align="center">Category</TH>
              <TH width={75} align="center">Priority</TH>
              <TH width={89} align="center">Assigned</TH>
              <TH width={88} align="center">SLA</TH>
              <TH width={96} align="center">Status</TH>
              <TH width={142} align="right">Action</TH>
            </TR>
          </THead>

          <TBody>
            {rows.map((ticket) => {
              const status = TICKET_STATUS[ticket.status];
              return (
                <TR
                  key={ticket.id}
                  className="cursor-pointer transition-colors hover:bg-subtle"
                  onClick={() => setViewing(ticket)}
                >
                  <TD align="center">{ticket.id}</TD>
                  <TD className="text-primary">{ticket.subject}</TD>
                  <TD align="center">{ticket.raisedBy}</TD>
                  <TD align="center">
                    <Badge tone="brand">{ticket.category}</Badge>
                  </TD>
                  <TD align="center">{ticket.priority}</TD>
                  <TD align="center">{ticket.assigned}</TD>
                  <TD align="center">{ticket.sla}</TD>
                  <TD align="center">
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </TD>
                  <TD>
                    {/* Stopped here so the row's own click handler does not
                        also open the detail dialog behind Escalate. */}
                    <div
                      className="flex items-center justify-end gap-6"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="link" onClick={() => setViewing(ticket)}>
                        View
                      </Button>
                      <Button variant="link" onClick={() => setEscalating(ticket)}>
                        Escalate
                      </Button>
                    </div>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </TableCard>

      <Pagination hasPrevious={false} />

      <NewTicketDialog open={newOpen} onClose={() => setNewOpen(false)} />

      {/* key remounts each dialog per ticket, so its fields re-seed from the
          new row without an effect writing state during render. */}
      <TicketDetailDialog
        key={`view-${viewing?.id}`}
        ticket={viewing}
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
      />

      <EscalateDialog
        key={`escalate-${escalating?.id}`}
        ticket={escalating}
        open={Boolean(escalating)}
        onClose={() => setEscalating(null)}
      />
    </div>
  );
}
