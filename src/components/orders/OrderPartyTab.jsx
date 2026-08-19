import ChatThread from "../ui/ChatThread.jsx";
import { CHAT_MESSAGES } from "../../data/orders.js";

/**
 * One party tab of the order detail dialog - a card naming the party, then
 * the conversation with them.
 *
 * Figma: Client (node 1180:50943), Printing Vendor (1180:51000) and Binding
 * Vendor (1180:51057). The three frames are identical apart from which party
 * the card names, so they are this one component with a `party` prop rather
 * than three near-copies.
 *
 * DEVIATION: the Binding Vendor frame omits the "Today" divider the other two
 * draw above the thread. Rendered with the divider on all three - the thread
 * is the same conversation and the missing rule is an inconsistency between
 * frames, not a state.
 */
export default function OrderPartyTab({ order, party }) {
  const details = order.parties[party];
  if (!details) return null;

  return (
    <div className="flex flex-col gap-6">
      <OrderHeading order={order} />

      <section className="rounded-md border border-border-default px-4 py-3">
        <p className="text-sm text-tertiary">{details.role}</p>
        <p className="text-display-xs font-semibold text-primary">
          {details.name}
        </p>
        {details.meta && (
          <p className="text-md text-tertiary">{details.meta}</p>
        )}
      </section>

      <ChatThread messages={CHAT_MESSAGES} />
    </div>
  );
}

/**
 * The order id and placed-at line that every tab repeats above its content.
 * Exported so the Overview tab uses the identical block.
 */
export function OrderHeading({ order }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border-default pb-4">
      <h3 className="text-display-xs font-semibold text-on-brand">
        {order.id.replace("ORD-", "ORD - ")}
      </h3>
      <p className="text-md text-tertiary">{order.placed}</p>
    </div>
  );
}
