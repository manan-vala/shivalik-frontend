import Modal from "../ui/Modal.jsx";
import ChatThread from "../ui/ChatThread.jsx";
import { CHAT_MESSAGES } from "../../data/vendors.js";

/**
 * Vendor chat panel
 * Figma: GOLDEN / Vendors / Frame 284 (node 1180:48315)
 *
 * Opens from the Chat button in the vendor detail dialog's header.
 *
 * The thread itself lives in `ui/ChatThread` - the order detail dialog draws
 * the same component on three of its tabs, so the bubbles, avatars and
 * composer are shared rather than duplicated here.
 */
export default function VendorChatDialog({ vendor, open, onClose, onSend }) {
  if (!vendor) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={vendor.name}
      width={863}
      showCloseButton
    >
      <ChatThread
        messages={CHAT_MESSAGES}
        onSend={(text) => onSend?.(vendor.id, text)}
      />
    </Modal>
  );
}
