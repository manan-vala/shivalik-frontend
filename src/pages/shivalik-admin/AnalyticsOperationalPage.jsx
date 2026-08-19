import AnalyticsLayout from "../../components/analytics/AnalyticsLayout.jsx";
import ChartCard from "../../components/analytics/ChartCard.jsx";
import ProgressBar from "../../components/ui/ProgressBar.jsx";
import RevenueTrendChart from "../../components/charts/RevenueTrendChart.jsx";
import {
  TableCard,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "../../components/ui/Table.jsx";
import {
  FILL_RATE_BY_DISTRIBUTOR,
  COST_PER_DELIVERY,
  ORDER_FREQUENCY_TREND,
} from "../../data/analytics.js";
import { formatINR } from "../../data/dashboard.js";

/**
 * Analytics > Operational - Shivalik Admin
 * Figma: GOLDEN / Analytics (node 1180:53018)
 *
 * Two tables and one chart. "Fill rate by distributor" draws a bar per row,
 * but it is a table with a `ProgressBar` cell rather than a chart - the same
 * treatment the Knowledge Base's "Helpful" column already uses.
 *
 * The Order Frequency Trend block is the identical chart and dataset the Sales
 * screen shows, so it is the same component and the same export.
 *
 * DEVIATION: the "Cost per delivery" table's last column header reads
 * "Cost?delivery" in the frame - a stray character. Rendered as
 * "Cost/delivery".
 */
export default function AnalyticsOperationalPage() {
  return (
    <AnalyticsLayout>
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-primary">
          Fill rate by distributor
        </h2>

        <TableCard>
          <Table density="dense" nowrap>
            <THead>
              <TR>
                <TH width={300}>Distributor</TH>
                <TH width={280}>Fill rate</TH>
                <TH width={120} align="right">Deliveries</TH>
              </TR>
            </THead>
            <TBody>
              {FILL_RATE_BY_DISTRIBUTOR.map((row) => (
                <TR key={row.rank}>
                  <TD className="text-primary">
                    {row.rank}. {row.name}
                  </TD>
                  <TD>
                    <ProgressBar value={row.fillRate} />
                  </TD>
                  <TD align="right" className="text-status-success-fg">
                    {row.deliveries}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableCard>
      </section>

      <ChartCard title="Order Frequency Trend">
        <RevenueTrendChart data={ORDER_FREQUENCY_TREND} />
      </ChartCard>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-primary">Cost per delivery</h2>

        <TableCard>
          <Table density="dense" nowrap>
            <THead>
              <TR>
                <TH width={320}>#Distributors</TH>
                <TH width={120} align="center">Deliveries</TH>
                <TH width={140} align="center">Total Cost</TH>
                <TH width={140} align="right">Cost/delivery</TH>
              </TR>
            </THead>
            <TBody>
              {COST_PER_DELIVERY.map((row) => (
                <TR key={row.rank}>
                  <TD className="text-primary">
                    {row.rank}. {row.name}
                  </TD>
                  <TD align="center">{row.deliveries}</TD>
                  <TD align="center" className="font-medium text-primary">
                    {formatINR(row.totalCost)}
                  </TD>
                  <TD align="right">{formatINR(row.costPerDelivery)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableCard>
      </section>
    </AnalyticsLayout>
  );
}
