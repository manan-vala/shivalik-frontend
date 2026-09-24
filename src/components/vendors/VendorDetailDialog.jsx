import { useEffect, useId, useState } from "react";
import Modal from "../ui/Modal.jsx";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Tabs, { TabPanel } from "../ui/Tabs.jsx";
import { DetailList, PlainTable } from "../ui/PlainTable.jsx";
import { getVendorPurchaseOrders } from "../../lib/api/inventory.js";
import { PO_STATUS, poTotal } from "../../data/purchaseOrders.js";
import { formatINR } from "../../lib/format.js";

/**
 * Vendor detail dialog
 *
 * Overview and Purchase Orders, both real: `Vendor`'s own fields, and its
 * orders from `vendors/{id}/purchase_orders/`.
 *
 * DEVIATION from the earlier Figma-derived build: that version also drew
 * Order/Payment/Stock/Chat tabs backed by mock data with no equivalent
 * concept on this backend — a book-distribution vendor here is a supplier
 * with purchase orders, not a print shop with a materials ledger, a
 * payment history or a chat thread. Dropped rather than left fake; Overview
 * gains the fields the mock never had (categories, terms, blocked state)
 * and Purchase Orders replaces Order/Payment/Stock with what the backend
 * actually tracks.
 */

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Purchase Orders" },
];

export default function VendorDetailDialog({ vendor, open, onClose, onEdit, onBlockToggle }) {
  const [tab, setTab] = useState("overview");
  const titleId = useId();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  useEffect(() => {
    if (!vendor || tab !== "orders") return;
    let active = true;

    async function loadOrders() {
      setOrdersLoading(true);
      setOrdersError("");
      try {
        const rows = await getVendorPurchaseOrders(vendor.id);
        if (active) setOrders(rows);
      } catch (err) {
        if (active) setOrdersError(err.message);
      } finally {
        if (active) setOrdersLoading(false);
      }
    }

    loadOrders();
    return () => {
      active = false;
    };
  }, [vendor, tab]);

  if (!vendor) return null;

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
              <h2 id={titleId} className="text-display-xs font-medium text-primary">
                {vendor.company_name}
              </h2>
              <div className="flex items-center gap-2">
                <Badge tone={vendor.is_blocked ? "alert" : "success"}>
                  {vendor.is_blocked ? "Blocked" : "Active"}
                </Badge>
                <span className="text-xs font-medium text-tertiary">{vendor.vendor_name}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => onEdit?.(vendor)}>
                Edit
              </Button>
              <Button
                variant={vendor.is_blocked ? "success" : "dangerOutline"}
                size="sm"
                onClick={() => onBlockToggle?.(vendor)}
              >
                {vendor.is_blocked ? "Unblock" : "Block"}
              </Button>
            </div>
          </div>
          <Tabs tabs={TABS} value={tab} onChange={setTab} label="Vendor details" />
        </div>
      }
    >
      <div className="flex min-h-70 flex-col gap-6 pt-5">
        <TabPanel id="overview" active={tab === "overview"}>
          <DetailList
            items={[
              { label: "Contact Person", value: vendor.contact_person || "—" },
              { label: "Phone", value: vendor.phone || "—" },
              { label: "Email", value: vendor.email || "—" },
              { label: "Address", value: vendor.address || "—" },
              { label: "GSTIN", value: vendor.gst_number },
              {
                label: "Categories Supplied",
                value: vendor.categories_supplied?.length ? vendor.categories_supplied.join(", ") : "—",
              },
              {
                label: "Expected Delivery",
                value: vendor.expected_delivery_days ? `${vendor.expected_delivery_days} days` : "—",
              },
              { label: "Payment Terms", value: vendor.payment_terms || "—" },
              { label: "Purchase Orders", value: vendor.purchase_orders_count ?? 0 },
              {
                label: "Last Delivery",
                value: vendor.last_delivery_date
                  ? new Date(vendor.last_delivery_date).toLocaleDateString()
                  : "None yet",
              },
              { label: "Notes", value: vendor.notes || "—" },
            ]}
          />
        </TabPanel>

        <TabPanel id="orders" active={tab === "orders"}>
          {ordersError ? (
            <p className="py-6 text-center text-sm text-error-500">{ordersError}</p>
          ) : (
            <PlainTable
              columns={[
                { key: "id", label: "PO #" },
                { key: "date", label: "Order Date" },
                { key: "total", label: "Total", align: "right" },
                { key: "status", label: "Status", align: "right" },
              ]}
              rows={orders.map((order) => {
                const status = PO_STATUS[order.status] ?? PO_STATUS.DRAFT;
                return {
                  id: `PO-${order.id}`,
                  date: order.order_date || "—",
                  total: formatINR(poTotal(order)),
                  status: <Badge tone={status.tone}>{status.label}</Badge>,
                };
              })}
              emptyMessage={ordersLoading ? "Loading purchase orders..." : "No purchase orders yet."}
            />
          )}
        </TabPanel>
      </div>
    </Modal>
  );
}
