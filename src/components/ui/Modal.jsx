import { useEffect, useId, useRef } from "react";

/**
 * Modal
 * -----------------------------------------------------------------------------
 * Built on the native <dialog> element so focus trapping, Escape-to-close and
 * top-layer stacking come from the platform rather than being reimplemented -
 * those are the parts hand-rolled modals usually get wrong.
 *
 * Figma (node 790:56543): white, radius 24, py-30, 846 wide, actions row
 * inset 30. The scrim is not in the file - that frame fakes the backdrop with
 * a flattened screenshot of the page - so gray-900/70 is a judgement call.
 *
 * The dialog element stays mounted and is driven by showModal()/close(). Every
 * way of dismissing it (Escape, backdrop click, a Cancel button, the parent
 * flipping `open`) funnels through the platform's own `close` event, so the
 * parent is notified exactly once no matter which route the user took.
 *
 *   <Modal open={open} onClose={close} title="Add Client">…</Modal>
 */
export default function Modal({
  open,
  onClose,
  title,
  header,
  titleId: titleIdProp,
  width = 846,
  children,
  footer,
}) {
  const ref = useRef(null);
  const generatedId = useId();
  // A custom `header` owns its own heading element, so it supplies the id the
  // dialog should be labelled by.
  const titleId = titleIdProp ?? generatedId;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      // Fires for Escape, backdrop click and programmatic close alike.
      onClose={onClose}
      onClick={(e) => {
        // The backdrop is part of the dialog element, so a click on it targets
        // the dialog itself rather than any child.
        if (e.target === ref.current) ref.current.close();
      }}
      style={{ maxWidth: width }}
      className={[
        // m-auto is required: a native <dialog> centres itself via `margin:
        // auto`, and Tailwind's preflight resets that to 0.
        "m-auto w-[calc(100%-2rem)] max-h-[calc(100vh-4rem)] overflow-y-auto",
        "rounded-2xl border-0 bg-surface p-0 text-secondary shadow-lg",
        "backdrop:bg-gray-900/70",
      ].join(" ")}
    >
      {/* Content is only built while the dialog is open, so a closed dialog
          costs nothing and reopening starts from a clean render. */}
      {open && (
        <div className="flex flex-col gap-5 py-7.5">
          <div className="flex flex-col gap-5 px-7.5">
            {/* `header` replaces the plain title when a dialog needs more than
                one line of chrome - the client detail dialog puts a city and a
                status badge under the name. */}
            {header ?? (
              <h2
                id={titleId}
                className="text-display-xs font-medium text-primary"
              >
                {title}
              </h2>
            )}
            {children}
          </div>

          {footer && (
            <div className="flex items-center gap-3 px-7.5">{footer}</div>
          )}
        </div>
      )}
    </dialog>
  );
}
