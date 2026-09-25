import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Card, { SectionHeading } from "../../components/ui/Card.jsx";
import { StatGrid } from "../../components/ui/StatCard.jsx";
import Button from "../../components/ui/Button.jsx";
import Tabs from "../../components/ui/Tabs.jsx";
import RevenueTrendChart from "../../components/charts/RevenueTrendChart.jsx";
import LiveActivity from "../../components/dashboard/LiveActivity.jsx";
import AttendanceRequests from "../../components/dashboard/AttendanceRequests.jsx";
import AddClientDialog from "../../components/clients/AddClientDialog.jsx";
import VendorFormDialog from "../../components/vendors/VendorFormDialog.jsx";
import CreateQuoteDialog from "../../components/quotes/CreateQuoteDialog.jsx";
import GenerateInvoiceDialog from "../../components/invoices/GenerateInvoiceDialog.jsx";
import { createVendor } from "../../lib/api/inventory.js";
import {
  KPIS,
  REVENUE_TREND,
  LIVE_ACTIVITY,
  STAFF_OVERVIEW,
  MONTHLY_ATTENDANCE,
  ATTENDANCE_REQUESTS,
} from "../../data/dashboard.js";

/**
 * Dashboard - Shivalik Admin
 * Figma: FINAL SCREENS / Shivalik / Dashboard (node 790:22313)
 *
 * The four dialogs it opens are the four Quick Actions, and are the entire
 * difference between the five frames supplied for this screen:
 *   Group 6 (790:22621) Add Client       Group 8 (790:22695) Create Quote
 *   Group 7 (790:22655) Add Vendor       Group 9 (790:22793) Generate Invoice
 * Each is the same dashboard with one dialog over it, so they are one screen
 * with four dialogs here.
 */

const RANGES = [
  { id: "12m", label: "12 months" },
  { id: "3m", label: "3 months" },
  { id: "30d", label: "30 days" },
  { id: "7d", label: "7 days" },
  { id: "24h", label: "24 hours" },
];

export default function DashboardPage() {
  const [range, setRange] = useState("12m");
  const [dialog, setDialog] = useState(null);
  const [requests, setRequests] = useState(ATTENDANCE_REQUESTS);

  const close = () => setDialog(null);

  function decide(id) {
    // Removing the row is the placeholder behaviour until the endpoint exists.
    setRequests((rows) => rows.filter((r) => r.id !== id));
  }

  function changeState(id, state) {
    setRequests((rows) =>
      rows.map((r) => (r.id === id ? { ...r, state } : r))
    );
  }

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      <PageHeader title="Dashboard" />

      <StatGrid items={KPIS} />

      <div className="flex flex-col gap-5 xl:flex-row">
        <Card
          title="Revenue Trend"
          className="min-w-0 flex-1"
          actions={null}
        >
          <Tabs
            tabs={RANGES}
            value={range}
            onChange={setRange}
            label="Revenue trend range"
          />
          {/* Only the 12-month series exists in the design; the other ranges
              render the same data until the API can supply them. */}
          <RevenueTrendChart data={REVENUE_TREND} />
        </Card>

        <LiveActivity items={LIVE_ACTIVITY} />
      </div>

      <section className="flex flex-col gap-4">
        <SectionHeading>Quick Actions</SectionHeading>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <Button variant="primary" iconLeading="user-plus" onClick={() => setDialog("client")}>
            Add Client
          </Button>
          <Button variant="secondary" iconLeading="user-plus" onClick={() => setDialog("vendor")}>
            Add Vendor
          </Button>
          <Button variant="secondary" iconLeading="file-plus" onClick={() => setDialog("quote")}>
            Create Quote
          </Button>
          <Button variant="secondary" iconLeading="download-cloud" onClick={() => setDialog("invoice")}>
            Generate Invoice
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading>Staff Overview</SectionHeading>
        <StatGrid items={STAFF_OVERVIEW} />
      </section>

      <Card title={MONTHLY_ATTENDANCE.title}>
        <StatGrid items={MONTHLY_ATTENDANCE.stats} />
      </Card>

      <section className="flex flex-col gap-4">
        {/* Figma reads "Attendance Appoval Requests" - see README. */}
        <SectionHeading>Attendance Approval Requests</SectionHeading>
        <AttendanceRequests
          requests={requests}
          onDecide={decide}
          onStateChange={changeState}
        />
      </section>

      <AddClientDialog open={dialog === "client"} onClose={close} />
      {/* The one quick action with a backend: it creates a real vendor, the
          same call the Vendors screen makes. VendorFormDialog reports a
          failed save itself and only closes once the vendor exists. */}
      <VendorFormDialog
        mode="add"
        open={dialog === "vendor"}
        onClose={close}
        onSaved={async (payload) => {
          await createVendor(payload);
          close();
        }}
      />
      <CreateQuoteDialog open={dialog === "quote"} onClose={close} />
      <GenerateInvoiceDialog open={dialog === "invoice"} onClose={close} />
    </div>
  );
}
