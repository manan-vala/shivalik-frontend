import { useState } from "react";
import AnalyticsLayout from "../../components/analytics/AnalyticsLayout.jsx";
import ChartCard from "../../components/analytics/ChartCard.jsx";
import SegmentedToggle from "../../components/ui/SegmentedToggle.jsx";
import Button from "../../components/ui/Button.jsx";
import GroupedBarChart from "../../components/charts/GroupedBarChart.jsx";
import StackedBarChart from "../../components/charts/StackedBarChart.jsx";
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
  REVENUE_VS_COLLECTED,
  AR_AGEING,
  GST_SUMMARY,
} from "../../data/analytics.js";

/**
 * Analytics > Financial - Shivalik Admin
 * Figma: GOLDEN / Analytics (node 1180:53377)
 *
 * Both charts carry their own `SegmentedToggle` in the ChartCard's action
 * slot - the same control the range picker above them uses.
 *
 * DEVIATION: the frame labels the Revenue vs Collected y axis "Active users",
 * which is Untitled UI template copy left on a revenue chart. Rendered as
 * "Amount", the quantity the bars actually encode - a wrong axis label is
 * worse than no label.
 *
 * DEVIATION: the AR ageing toggle reads as a filter in the frame (one bucket
 * highlighted) but the bars are stacked, showing all four at once. Both are
 * kept: the chart always stacks all four, and the toggle emphasises one by
 * dimming the rest, so the control does something without hiding data.
 */
export default function AnalyticsFinancialPage() {
  const [series, setSeries] = useState("collected");
  const [bucket, setBucket] = useState("90d+");

  return (
    <AnalyticsLayout>
      <ChartCard
        title="Revenue vs Collected"
        action={
          <SegmentedToggle
            joined
            label="Series"
            options={REVENUE_VS_COLLECTED.series.map((s) => ({
              id: s.id,
              label: s.label,
            }))}
            value={series}
            onChange={setSeries}
          />
        }
      >
        <GroupedBarChart
          categories={REVENUE_VS_COLLECTED.categories}
          series={REVENUE_VS_COLLECTED.series}
          yLabel="Amount"
          xLabel="Month"
          emphasis={series}
          caption="Revenue versus collected by month"
        />
      </ChartCard>

      <ChartCard
        title="AR ageing"
        action={
          <SegmentedToggle
            joined
            label="Ageing bucket"
            options={AR_AGEING.buckets.map((b) => ({
              id: b.id,
              label: b.label,
            }))}
            value={bucket}
            onChange={setBucket}
          />
        }
      >
        <StackedBarChart
          categories={AR_AGEING.categories}
          buckets={AR_AGEING.buckets}
          emphasis={bucket}
          caption="Accounts receivable ageing by account"
        />
      </ChartCard>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-primary">GST Summary</h2>

        <TableCard>
          <Table density="dense" nowrap>
            <THead>
              <TR>
                <TH width={280}>#Month</TH>
                <TH width={140} align="center">Taxable</TH>
                <TH width={140} align="center">GST</TH>
                <TH width={140} align="center">Net</TH>
                <TH width={120} align="right">Export</TH>
              </TR>
            </THead>
            <TBody>
              {GST_SUMMARY.map((row) => (
                <TR key={row.rank}>
                  <TD className="text-primary">
                    {row.rank}. {row.month}
                  </TD>
                  <TD align="center">{row.taxable}</TD>
                  <TD align="center">{row.gst}</TD>
                  <TD align="center" className="font-medium text-primary">
                    {row.net}
                  </TD>
                  <TD>
                    <div className="flex justify-end">
                      <Button variant="link">Export</Button>
                    </div>
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
