import { useId, useState } from "react";
import Modal from "../ui/Modal.jsx";
import Badge from "../ui/Badge.jsx";
import Tabs, { TabPanel } from "../ui/Tabs.jsx";
import { DetailList, PlainTable } from "../ui/PlainTable.jsx";
import {
  CLIENT_STATUS,
  ORDER_STATUS,
  PAYMENT_STATUS,
} from "../../data/clients.js";

/**
 * Client detail dialog
 * Figma: FINAL SCREENS / Shivalik
 *   Overview  Group 28 (790:56511), modal 790:56513
 *   Order     Group 27 (790:56474), modal 790:56476
 *   Payment   Group 26 (790:56442), modal 790:56444
 *
 * One dialog, three tabs - the Figma frames are three separate screens because
 * a static file cannot show tab state, not because they are separate dialogs.
 *
 * NOTE: the status pill beside the city uses primary-700 at 20% opacity in
 * Figma, which is a one-off treatment rather than a token. It is rendered here
 * with the `brand` badge tone so the pill stays inside the token system.
 */

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "order", label: "Order" },
  { id: "payment", label: "Payment" },
];

export default function ClientDetailDialog({ client, open, onClose }) {
  // Tab resets to Overview whenever a different client is opened. That is done
  // by remounting - ClientsPage passes `key={selected?.id}` - rather than with
  // an effect that writes state during render.
  const [tab, setTab] = useState("overview");
  const titleId = useId();

  if (!client) return null;

  const status = CLIENT_STATUS[client.status];

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={863}
      titleId={titleId}
      header={
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-5">
            <h2 id={titleId} className="text-display-xs font-medium text-primary">
              {client.name}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-tertiary">
                {client.city}
              </span>
              <Badge tone="brand">{status.label}</Badge>
            </div>
          </div>
          <Tabs
            tabs={TABS}
            value={tab}
            onChange={setTab}
            label="Client details"
          />
        </div>
      }
    >
      <div className="min-h-70 pt-5">
        <TabPanel id="overview" active={tab === "overview"}>
          <DetailList
            items={[
              { label: "Contact", value: client.contact },
              { label: "Phone", value: client.phone },
              { label: "Email", value: client.email },
              { label: "Customer ID", value: client.customerId },
              { label: "Registered", value: client.registered },
              { label: "Outstanding", value: `Rs ${client.outstanding}` },
            ]}
          />
        </TabPanel>

        <TabPanel id="order" active={tab === "order"}>
          <PlainTable
            columns={[
              { key: "id", label: "Order ID" },
              { key: "date", label: "Date" },
              { key: "value", label: "Value" },
              { key: "status", label: "Status" },
            ]}
            rows={client.orders.map((order) => {
              const s = ORDER_STATUS[order.status];
              return {
                id: order.id,
                date: order.date,
                value: order.value,
                status: <Badge tone={s.tone}>{s.label}</Badge>,
              };
            })}
            emptyMessage="No orders yet."
          />
        </TabPanel>

        <TabPanel id="payment" active={tab === "payment"}>
          <PlainTable
            columns={[
              { key: "date", label: "Date" },
              { key: "amount", label: "Amount" },
              { key: "method", label: "Method" },
              { key: "status", label: "Status" },
            ]}
            rows={client.payments.map((payment) => {
              const s = PAYMENT_STATUS[payment.status];
              return {
                date: payment.date,
                amount: payment.amount,
                method: payment.method,
                status: <Badge tone={s.tone}>{s.label}</Badge>,
              };
            })}
            emptyMessage="No payments recorded."
          />
        </TabPanel>
      </div>
    </Modal>
  );
}
