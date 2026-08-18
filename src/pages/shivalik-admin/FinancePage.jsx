import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Icon from "../../components/ui/Icon.jsx";
import SummaryCard from "../../components/ui/SummaryCard.jsx";
import {
  TableCard,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "../../components/ui/Table.jsx";
import PaymentDialog from "../../components/finance/PaymentDialog.jsx";
import { PAYMENTS, PAYMENT_STATUS, FINANCE_SUMMARY } from "../../data/finance.js";
import { formatINR } from "../../data/dashboard.js";

/**
 * Finance - Shivalik Admin
 * Figma: FINAL SCREENS / Shivalik Final / Finance MAin (node 1180:35746)
 *   + Generate Invoice dialog (1180:36127) - already built for the Dashboard;
 *     reused here rather than rebuilt, see FinanceHeader below
 *   + Add Payment dialog       (1180:36020)
 *   + Verify Payment dialog    (1180:36066)
 *   + View dialog              inside Group 48 (1180:36096)
 *
 * The last three are one component, `PaymentDialog`, parameterised by mode -
 * see that file for why. This page only decides *which* mode and *which* row.
 */

/** Every payment row this table can format. Two known data inconsistencies
 * (a "Paid" row with a due amount, an "Overdue" row with none) are preserved
 * from Figma rather than corrected - see data/finance.js. */
export default function FinancePage() {
  const [payments, setPayments] = useState(PAYMENTS);
  const [dialog, setDialog] = useState(null); // { mode, payment } | null

  function closeDialog() {
    setDialog(null);
  }

  function handleAddPayment() {
    // No backend yet - this only closes the dialog. See README.
    closeDialog();
  }

  function handleVerify(payment) {
    setPayments((rows) =>
      rows.map((r) => (r.id === payment.id ? { ...r, status: "paid", due: 0 } : r))
    );
    closeDialog();
  }

  function handleReject(payment) {
    setPayments((rows) =>
      rows.map((r) => (r.id === payment.id ? { ...r, status: "overdue" } : r))
    );
    closeDialog();
  }

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      <PageHeader
        title="Finance"
        actions={
          <Button
            variant="brandSubtle"
            size="lg"
            iconLeading="plus"
            onClick={() => setDialog({ mode: "add", payment: null })}
          >
            Add Payment
          </Button>
        }
      />

      <div className="flex gap-6">
        {FINANCE_SUMMARY.map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}
      </div>

      <div className="flex justify-end">
        <Button variant="brandSubtle" size="sm" iconLeading="filter-lines">
          Filters
        </Button>
      </div>

      <TableCard>
        <Table>
          <THead>
            <TR>
              <TH>Client</TH>
              <TH>Order ID</TH>
              <TH align="right">Value</TH>
              <TH align="right">Due</TH>
              <TH>Due date</TH>
              <TH align="center">Invoice</TH>
              <TH>Paid on</TH>
              <TH align="center">Proof</TH>
              <TH>Status</TH>
              <TH align="right">
                <span className="sr-only">Action</span>
              </TH>
            </TR>
          </THead>

          <TBody>
            {payments.map((payment) => {
              const status = PAYMENT_STATUS[payment.status];

              return (
                <TR key={payment.id}>
                  <TD className="font-medium text-primary">{payment.client}</TD>
                  {/* Purple per Figma, but not a live link: no order-detail
                      screen exists yet to send it to. */}
                  <TD className="font-medium text-on-brand">{payment.orderId}</TD>
                  <TD align="right" className="tabular font-medium text-primary">
                    {formatINR(payment.value)}
                  </TD>
                  <TD
                    align="right"
                    className={`tabular font-medium ${
                      payment.due > 0 ? "text-status-warning-fg" : "text-primary"
                    }`}
                  >
                    {formatINR(payment.due)}
                  </TD>
                  <TD>{payment.dueDate}</TD>
                  <TD align="center">
                    <button
                      type="button"
                      aria-label={`Download invoice for ${payment.orderId}`}
                      className="text-on-brand transition-colors hover:text-brand"
                    >
                      {/* download-cloud, reused - see README for why no
                          dedicated invoice-download glyph was exported. */}
                      <Icon name="download-cloud" size="sm" />
                    </button>
                  </TD>
                  <TD>{payment.paidOn}</TD>
                  <TD align="center">
                    {payment.hasProof ? (
                      <Icon
                        name="check-circle"
                        size="sm"
                        className="text-status-success-fg"
                        title="Proof attached"
                      />
                    ) : (
                      <span className="text-tertiary" aria-label="No proof attached">
                        —
                      </span>
                    )}
                  </TD>
                  <TD>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </TD>
                  <TD align="right">
                    {payment.status === "verifying" ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setDialog({ mode: "verify", payment })}
                      >
                        Verify
                      </Button>
                    ) : (
                      <Button
                        variant="linkBrand"
                        onClick={() => setDialog({ mode: "view", payment })}
                      >
                        View
                      </Button>
                    )}
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </TableCard>

      {/* key remounts on row/mode change, seeding PaymentDialog's state fresh
          without an effect - see that file's header comment. */}
      {dialog && (
        <PaymentDialog
          key={`${dialog.mode}-${dialog.payment?.id ?? "new"}`}
          mode={dialog.mode}
          payment={dialog.payment}
          open
          onClose={closeDialog}
          onSave={handleAddPayment}
          onVerify={handleVerify}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
