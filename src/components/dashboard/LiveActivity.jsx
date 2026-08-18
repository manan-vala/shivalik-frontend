import Card from "../ui/Card.jsx";

/**
 * Live Activity feed.
 * Figma (node 790:22358): 240 wide, title 18/28, each item is a 14/20 medium
 * gray-700 headline over a 14/20 gray-500 detail line whose trailing party is
 * highlighted in primary-700.
 */
export default function LiveActivity({ items }) {
  return (
    <Card title="Live Activity" className="w-60 shrink-0">
      <ul className="flex flex-col gap-5">
        {items.map((item) => (
          <li key={item.title + item.link} className="flex flex-col">
            <p className="text-sm font-medium text-secondary">{item.title}</p>
            <p className="text-sm text-tertiary">
              {item.detail && `${item.detail} `}
              <span className="font-medium text-on-brand">{item.link}</span>
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
