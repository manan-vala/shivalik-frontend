import { useId, useState } from "react";
import Modal from "../ui/Modal.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Tabs, { TabPanel } from "../ui/Tabs.jsx";
import { DetailList, PlainTable } from "../ui/PlainTable.jsx";
import { NumberedPagination } from "../ui/Pagination.jsx";
import {
  SPECIALIZATION,
  VENDOR_ORDER_STATUS,
  VENDOR_PAYMENT_STATUS,
} from "../../data/vendors.js";

/**
 * Vendor detail dialog
 * Figma: GOLDEN / Vendors
 *   Overview (node 1180:48178)
 *   Order    (node 1180:48212)
 *   Payment  (node 1180:48262)
 *   Stock    - see DEVIATION below
 *
 * One dialog, four tabs - the same construction as ClientDetailDialog, whose
 * Overview/Order/Payment frames these mirror almost field for field. What is
 * new here is the Chat button in the header and the fourth tab.
 *
 * DEVIATION: the tab bar draws four tabs in every frame, but the file only
 * contains three panels - no Stock frame was drawn. Leaving the tab inert
 * would ship a dead control, so Stock renders the vendor's material list, the
 * same shape the Assign Stock dialog's "Current Stock" panel establishes
 * (node 1180:48145). Confirm against the intended design before release.
 *
 * The Order and Payment tabs page through with NumberedPagination rather than
 * the three-button group used under full-page tables - that is what both
 * frames draw.
 */

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "order", label: "Order" },
  { id: "payment", label: "Payment" },
  { id: "stock", label: "Stock" },
];

export default function VendorDetailDialog({ vendor, open, onClose, onChat }) {
  // Tab and page reset per vendor by remounting - VendorsPage passes
  // `key={selected?.id}` rather than an effect writing state during render.
  const [tab, setTab] = useState("overview");
  const [page, setPage] = useState(1);
  const titleId = useId();

  if (!vendor) return null;

  const specialization = SPECIALIZATION[vendor.specialization];

  return (
    <Modal
      open={open}
      onClose={onClose}
      width={863}
      titleId={titleId}
      showCloseButton
      header={
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-5">
              <h2
                id={titleId}
                className="text-display-xs font-medium text-primary"
              >
                {vendor.name}
              </h2>
              <div className="flex items-center gap-2">
                <Badge tone="brand">{specialization.label}</Badge>
                <span className="text-xs font-medium text-tertiary">
                  {vendor.city}
                </span>
              </div>
            </div>
            <Button variant="brandSubtle" onClick={() => onChat?.(vendor)}>
              Chat
            </Button>
          </div>
          <Tabs
            tabs={TABS}
            value={tab}
            onChange={setTab}
            label="Vendor details"
          />
        </div>
      }
    >
      <div className="flex min-h-70 flex-col gap-6 pt-5">
        <TabPanel id="overview" active={tab === "overview"}>
          <DetailList
            items={[
              { label: "Contact", value: vendor.contact },
              { label: "Phone", value: vendor.phone },
              { label: "Email", value: vendor.email },
              { label: "Vendor ID", value: vendor.id },
              { label: "Registered", value: vendor.registered },
              { label: "Specialization", value: specialization.label },
            ]}
          />
        </TabPanel>

        <TabPanel id="order" active={tab === "order"}>
          <div className="flex flex-col gap-6">
            <PlainTable
              columns={[
                { key: "id", label: "Order ID" },
                { key: "client", label: "Client" },
                { key: "status", label: "Status" },
              ]}
              rows={vendor.orders.map((order) => {
                const s = VENDOR_ORDER_STATUS[order.status];
                return {
                  id: order.id,
                  client: order.client,
                  status: <Badge tone={s.tone}>{s.label}</Badge>,
                };
              })}
              emptyMessage="No orders yet."
            />
            <NumberedPagination page={page} total={10} onChange={setPage} />
          </div>
        </TabPanel>

        <TabPanel id="payment" active={tab === "payment"}>
          <div className="flex flex-col gap-6">
            <PlainTable
              columns={[
                { key: "date", label: "Date" },
                { key: "amount", label: "Amount" },
                { key: "status", label: "Status" },
              ]}
              rows={vendor.payments.map((payment) => {
                const s = VENDOR_PAYMENT_STATUS[payment.status];
                return {
                  date: payment.date,
                  amount: payment.amount,
                  status: <Badge tone={s.tone}>{s.label}</Badge>,
                };
              })}
              emptyMessage="No payments recorded."
            />
            <NumberedPagination page={page} total={10} onChange={setPage} />
          </div>
        </TabPanel>

        <TabPanel id="stock" active={tab === "stock"}>
          <PlainTable
            columns={[
              { key: "material", label: "Material" },
              { key: "quantity", label: "Quantity" },
            ]}
            rows={vendor.stock.map((item) => ({
              material: item.material,
              quantity: item.quantity,
            }))}
            emptyMessage="No stock assigned."
          />
        </TabPanel>
      </div>
    </Modal>
  );
}
