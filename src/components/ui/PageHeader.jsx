/**
 * PageHeader
 * -----------------------------------------------------------------------------
 * Title row that opens every desktop screen: page title on the left, actions
 * on the right.
 *
 * Figma (node 790:56304): px-32, title 30/38 medium gray-900, actions gap-12.
 */
export default function PageHeader({ title, actions }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <h1 className="text-display-sm font-medium text-primary">{title}</h1>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  );
}
