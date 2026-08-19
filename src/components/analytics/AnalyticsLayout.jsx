import { useState } from "react";
import PageHeader from "../ui/PageHeader.jsx";
import SegmentedToggle from "../ui/SegmentedToggle.jsx";
import CustomRangeDialog from "./CustomRangeDialog.jsx";

/**
 * Shell shared by the three Analytics screens.
 * Figma: Sales (1180:52808), Operational (1180:53018), Financial (1180:53377)
 *
 * All three draw the same header, the same 7d / 30d / 90d / Custom control and
 * the same "Customise your analytics" dialog behind Custom - the three frames
 * differ only in what sits underneath. So the range state, the toggle and the
 * dialog live here once and each page supplies its own body.
 *
 * `range` is handed to the body so a page can label or refetch by it. Nothing
 * refetches yet - the data module is static - but the prop is the seam the
 * API will plug into, and it keeps the pages from each owning range state.
 */

const RANGES = [
  { id: "7d", label: "7d" },
  { id: "30d", label: "30d" },
  { id: "90d", label: "90d" },
  { id: "custom", label: "Custom" },
];

export default function AnalyticsLayout({ children }) {
  const [range, setRange] = useState("7d");
  const [customOpen, setCustomOpen] = useState(false);
  const [customRange, setCustomRange] = useState(null);

  function pickRange(next) {
    setRange(next);
    // Custom is the only option that needs more input before it means anything.
    if (next === "custom") setCustomOpen(true);
  }

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      <PageHeader title="Analytics" />

      <div className="flex justify-end">
        <SegmentedToggle
          options={RANGES}
          value={range}
          onChange={pickRange}
          label="Date range"
        />
      </div>

      {typeof children === "function" ? children({ range, customRange }) : children}

      <CustomRangeDialog
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        onPublish={(next) => {
          setCustomRange(next);
          setCustomOpen(false);
        }}
      />
    </div>
  );
}
