import AnalyticsLayout from "../../components/analytics/AnalyticsLayout.jsx";
import ChartCard from "../../components/analytics/ChartCard.jsx";
import BarChart from "../../components/charts/BarChart.jsx";
import DonutChart from "../../components/charts/DonutChart.jsx";
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
  REVENUE_BY_CITY,
  VENDOR_BREAKDOWN,
  ORDER_FREQUENCY_TREND,
  TOP_CLIENTS,
} from "../../data/analytics.js";

/**
 * Analytics > Sales - Shivalik Admin
 * Figma: GOLDEN / Analytics (node 1180:52808)
 *
 * Header, range toggle and the Custom dialog come from `AnalyticsLayout`,
 * shared with the Operational and Financial screens.
 *
 * The Order Frequency Trend block reuses the Dashboard's `RevenueTrendChart`
 * unchanged - it is the same two-series area/line chart, and it already
 * carries the legend and hover tooltip this frame omits.
 */
export default function AnalyticsSalesPage() {
  return (
    <AnalyticsLayout>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Revenue by city">
          <BarChart
            data={REVENUE_BY_CITY}
            caption="Revenue by city"
            format={(v) => `${v}K`}
          />
        </ChartCard>

        <ChartCard title="Vendor breakdown">
          <DonutChart data={VENDOR_BREAKDOWN} caption="Vendor breakdown" />
        </ChartCard>
      </div>

      <ChartCard title="Order Frequency Trend">
        <RevenueTrendChart data={ORDER_FREQUENCY_TREND} />
      </ChartCard>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-primary">Top #10 Clients</h2>

        <TableCard>
          <Table density="dense" nowrap>
            <THead>
              <TR>
                <TH width={320}>#Client</TH>
                <TH width={120} align="center">Avg Value</TH>
                <TH width={100} align="center">Orders</TH>
                <TH width={120} align="center">Revenue</TH>
                <TH width={100} align="right">Growth</TH>
              </TR>
            </THead>
            <TBody>
              {TOP_CLIENTS.map((client) => (
                <TR key={client.rank}>
                  <TD className="text-primary">
                    {client.rank}. {client.name}
                  </TD>
                  <TD align="center">{client.avgValue}</TD>
                  <TD align="center">{client.orders}</TD>
                  <TD align="center" className="font-medium text-primary">
                    {client.revenue}
                  </TD>
                  <TD align="right" className="text-status-success-fg">
                    {client.growth}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableCard>
      </section>
    </AnalyticsLayout>
  );
}
