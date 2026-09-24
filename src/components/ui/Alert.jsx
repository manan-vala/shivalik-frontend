/**
 * Alert
 * -----------------------------------------------------------------------------
 * Inline result or failure message for a screen or form. Errors are announced
 * (`role="alert"`), confirmations politely (`role="status"`).
 *
 *   <Alert tone="error">Could not load stock.</Alert>
 *   <Alert tone="success">Stocked 40 units.</Alert>
 */
const TONES = {
  error: "border-status-error-fg/30 bg-status-error-bg text-status-error-fg",
  success: "border-status-success-fg/30 bg-status-success-bg text-status-success-fg",
  info: "border-status-info-fg/30 bg-status-info-bg text-status-info-fg",
};

export default function Alert({ tone = "info", children, className = "" }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={["rounded-md border p-4 text-sm", TONES[tone], className].join(" ")}
    >
      {children}
    </div>
  );
}
