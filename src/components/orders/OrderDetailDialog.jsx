import { useId, useState } from "react";
import Modal from "../ui/Modal.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Tabs, { TabPanel } from "../ui/Tabs.jsx";
import { PlainTable } from "../ui/PlainTable.jsx";
import { SelectField, TextField } from "../ui/TextField.jsx";
import OrderTimeline from "./OrderTimeline.jsx";
import OrderPartyTab, { OrderHeading } from "./OrderPartyTab.jsx";
import {
  ORDER_STATUS,
  ORDER_STATUS_OPTIONS,
} from "../../data/orders.js";
import { formatINR } from "../../data/dashboard.js";

/**
 * Order detail dialog
 * Figma: GOLDEN / Orders
 *   Overview       (node 1180:50810)
 *   Client         (node 1180:50943)
 *   Printing Vendor(node 1180:51000)
 *   Binding Vendor (node 1180:51057)
 *
 * One dialog, four tabs - the same construction as ClientDetailDialog and
 * VendorDetailDialog. Three of the four tabs are one `OrderPartyTab` with a
 * different `party`, so only Overview has its own layout.
 *
 * DEVIATION: the frames draw this as a sheet filling the whole main content
 * area (1128px, no dimmed backdrop) rather than a centred modal. Rendered as
 * a Modal at that width, so it keeps the dialog behaviour every other detail
 * view in the app already has - Escape, focus trap, backdrop dismiss - rather
 * than introducing a second overlay language for one screen.
 */

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "client", label: "Client" },
  { id: "printing", label: "Printing Vendor" },
  { id: "binding", label: "Binding Vendor" },
];

export default function OrderDetailDialog({ order, open, onClose, onSave }) {
  // Tab resets per order by remounting - OrdersPage passes `key={order.id}`.
  const [tab, setTab] = useState("overview");
  const [status, setStatus] = useState(
    () => ORDER_STATUS[order?.status]?.label ?? ORDER_STATUS_OPTIONS[0]
  );
  const [note, setNote] = useState("");
  const titleId = useId();

  if (!order) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={1128}
      titleId={titleId}
      showCloseButton
      header={
        <>
          <h2 id={titleId} className="sr-only">
            Order {order.id}
          </h2>
          <Tabs tabs={TABS} value={tab} onChange={setTab} label="Order details" />
        </>
      }
    >
      <div className="min-h-70 pt-5">
        <TabPanel id="overview" active={tab === "overview"}>
          <OverviewTab
            order={order}
            status={status}
            onStatusChange={setStatus}
            note={note}
            onNoteChange={setNote}
            onSave={() => onSave?.(order.id, { status, note })}
          />
        </TabPanel>

        <TabPanel id="client" active={tab === "client"}>
          <OrderPartyTab order={order} party="client" />
        </TabPanel>

        <TabPanel id="printing" active={tab === "printing"}>
          <OrderPartyTab order={order} party="printing" />
        </TabPanel>

        <TabPanel id="binding" active={tab === "binding"}>
          <OrderPartyTab order={order} party="binding" />
        </TabPanel>
      </div>
    </Modal>
  );
}

function OverviewTab({
  order,
  status,
  onStatusChange,
  note,
  onNoteChange,
  onSave,
}) {
  const stage = ORDER_STATUS[order.status];
  const lineTotal = order.lineItems.reduce((sum, l) => sum + l.total, 0);

  return (
    <div className="flex flex-col gap-6">
      <OrderHeading order={order} />

      {/* The three parties, side by side (node 1180:50810). */}
      <div className="grid grid-cols-3 gap-4">
        {["client", "printing", "binding"].map((key) => {
          const party = order.parties[key];
          return (
            <div
              key={key}
              className="rounded-md border border-border-default px-4 py-3"
            >
              <p className="text-sm text-tertiary">{party.role}</p>
              <p className="text-md font-medium text-primary">{party.name}</p>
              {party.meta && (
                <p className="text-xs text-tertiary">{party.meta}</p>
              )}
            </div>
          );
        })}
      </div>

      <div>
        <Badge tone={stage.tone}>{stage.label}</Badge>
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-tertiary">Line Item</h3>
        <PlainTable
          columns={[
            { key: "item", label: "Item" },
            { key: "qty", label: "Qty", align: "right" },
            { key: "unit", label: "Unit", align: "right" },
            { key: "total", label: "Total", align: "right" },
          ]}
          rows={order.lineItems.map((line) => ({
            item: line.item,
            qty: line.qty,
            unit: line.unit,
            total: formatINR(line.total),
          }))}
          emptyMessage="No line items."
        />
        <p className="flex justify-end gap-8 text-md font-medium text-primary">
          <span className="text-tertiary">Total</span>
          <span className="tabular">{formatINR(lineTotal)}</span>
        </p>
      </section>

      <OrderTimeline steps={order.timeline} />

      <div className="grid grid-cols-2 gap-6">
        {/* Money summary */}
        <section className="flex flex-col gap-2 rounded-md border border-border-default px-4 py-3">
          <MoneyRow label="Due" value={order.money.due} />
          <MoneyRow label="Paid" value={order.money.paid} />
          <div className="mt-1 border-t border-border-default pt-3">
            <div className="flex items-center justify-between">
              <span className="text-md font-medium text-primary">Balance</span>
              <span className="tabular text-md font-semibold text-on-brand">
                {formatINR(order.money.balance)}
              </span>
            </div>
          </div>
        </section>

        {/* Add update */}
        <section className="flex flex-col gap-3 rounded-md border border-border-default px-4 py-3">
          <h3 className="text-md font-medium text-primary">Add update</h3>
          <SelectField
            label="Change status"
            options={ORDER_STATUS_OPTIONS}
            placeholder="Change status"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          />
          <TextField
            label="Add internal note"
            placeholder="Add internal note"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
          />
        </section>
      </div>

      <div className="flex justify-end">
        <Button variant="primary" onClick={onSave}>
          Save
        </Button>
      </div>
    </div>
  );
}

function MoneyRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-md text-tertiary">{label}</span>
      <span className="tabular text-md text-primary">{formatINR(value)}</span>
    </div>
  );
}
