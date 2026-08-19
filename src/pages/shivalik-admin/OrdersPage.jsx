import { useMemo, useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import Badge from "../../components/ui/Badge.jsx";
import SearchInput from "../../components/ui/SearchInput.jsx";
import { StatGrid } from "../../components/ui/StatCard.jsx";
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
import CreateQuoteDialog from "../../components/quotes/CreateQuoteDialog.jsx";
import OrderDetailDialog from "../../components/orders/OrderDetailDialog.jsx";
import AssignVendorsDialog from "../../components/orders/AssignVendorsDialog.jsx";
import ConfirmDispatchDialog from "../../components/orders/ConfirmDispatchDialog.jsx";
import {
  ORDERS,
  ORDER_STATUS,
  ORDER_PAYMENT_STATUS,
  ORDER_SUMMARY,
} from "../../data/orders.js";
import { formatINR } from "../../data/dashboard.js";

/**
 * Orders - Shivalik Admin
 * Figma: GOLDEN / Orders (node 1180:51161)
 *   + Create Quote          (1180:50679)
 *   + Order detail dialog   (1180:50810 / 50943 / 51000 / 51057)
 *   + Assign Vendors        (1180:51117)
 *   + Confirm Dispatch      (1180:51138)
 *
 * `filter` comes from the route so the seven sidebar sub-items drive one
 * page, the same construction as ClientsPage, VendorsPage and
 * SupportTicketsPage. The filter values are the `ORDER_STATUS` keys, so the
 * route segment and the status key are the same string by design - no
 * translation table to keep in sync.
 *
 * DEVIATION: the frame draws no pagination under this table, unlike every
 * other list screen. Rendered without one rather than adding a control the
 * design does not have.
 */
export default function OrdersPage({ filter = "all" }) {
  const [query, setQuery] = useState("");
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [assigning, setAssigning] = useState(null);
  const [dispatching, setDispatching] = useState(null);

  const rows = useMemo(() => {
    const byStage =
      filter === "all" ? ORDERS : ORDERS.filter((o) => o.status === filter);

    const q = query.trim().toLowerCase();
    if (!q) return byStage;

    return byStage.filter(
      (o) =>
        o.id.toLowerCase().includes(q) || o.client.toLowerCase().includes(q)
    );
  }, [filter, query]);

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      <PageHeader
        title="Orders"
        actions={
          <Button
            variant="primary"
            iconLeading="plus"
            onClick={() => setQuoteOpen(true)}
          >
            Add New Quote
          </Button>
        }
      />

      <StatGrid items={ORDER_SUMMARY} />

      <TableCard>
        <TableToolbar>
          <SearchInput
            placeholder="Search by Order ID or by client name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search orders"
          />
        </TableToolbar>

        {/* dense + nowrap: eight columns, two of them long status pills. */}
        <Table density="dense" nowrap>
          <THead>
            <TR>
              <TH width={120} align="center">Order ID</TH>
              <TH width={200}>Client</TH>
              <TH width={70} align="center">Items</TH>
              <TH width={90} align="center">Value</TH>
              <TH width={150} align="center">Status</TH>
              <TH width={160} align="center">Payment</TH>
              <TH width={110} align="center">Dispatch</TH>
              <TH width={170} align="right">Action</TH>
            </TR>
          </THead>

          <TBody>
            {rows.map((order) => {
              const stage = ORDER_STATUS[order.status];
              const payment = ORDER_PAYMENT_STATUS[order.payment];
              const canDispatch = order.status === "ready-for-dispatch";

              return (
                <TR
                  key={order.id}
                  className="cursor-pointer transition-colors hover:bg-subtle"
                  onClick={() => setSelected(order)}
                >
                  <TD align="center" className="font-medium text-primary">
                    {order.id}
                  </TD>
                  <TD>
                    <CellStack primary={order.client} supporting={order.city} />
                  </TD>
                  <TD align="center">{order.items}</TD>
                  <TD align="center" className="tabular">
                    {formatINR(order.value)}
                  </TD>
                  <TD align="center">
                    <Badge tone={stage.tone}>{stage.label}</Badge>
                  </TD>
                  <TD align="center">
                    <Badge tone={payment.tone}>{payment.label}</Badge>
                  </TD>
                  <TD align="center">
                    {/* Stopped so the row click does not also open the detail
                        dialog behind the Dispatch dialog. Only a row that is
                        actually ready shows the button - the frame draws it on
                        that one row alone. */}
                    <div onClick={(e) => e.stopPropagation()}>
                      {canDispatch && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setDispatching(order)}
                        >
                          Dispatch
                        </Button>
                      )}
                    </div>
                  </TD>
                  <TD>
                    <div
                      className="flex items-center justify-end gap-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="link" onClick={() => setSelected(order)}>
                        View
                      </Button>
                      <Button variant="link">Delete</Button>
                      <Button
                        variant="link"
                        onClick={() => setAssigning(order)}
                      >
                        Edit
                      </Button>
                    </div>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </TableCard>

      <CreateQuoteDialog open={quoteOpen} onClose={() => setQuoteOpen(false)} />

      {/* Each dialog is keyed so its fields re-seed from the row it was opened
          for, without an effect writing state during render. */}
      <OrderDetailDialog
        key={`detail-${selected?.id}`}
        order={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
      />

      <AssignVendorsDialog
        key={`assign-${assigning?.id}`}
        order={assigning}
        open={Boolean(assigning)}
        onClose={() => setAssigning(null)}
      />

      <ConfirmDispatchDialog
        key={`dispatch-${dispatching?.id}`}
        order={dispatching}
        open={Boolean(dispatching)}
        onClose={() => setDispatching(null)}
      />
    </div>
  );
}
