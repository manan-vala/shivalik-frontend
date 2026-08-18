import { useId } from "react";
import Icon from "./Icon.jsx";

/**
 * FileDropzone
 * -----------------------------------------------------------------------------
 * The "Proof" upload field on the payment dialogs (nodes 1180:36020,
 * 1180:36066): a dashed drop zone with a centred upload icon and a
 * "Click to upload <label>" prompt; once a file is chosen it shows the
 * filename instead.
 *
 * No upload endpoint exists yet, so this only tracks a filename locally - see
 * README. It is a real file input under the hood (keyboard- and
 * screen-reader-reachable), styled to read as the designed drop zone rather
 * than the browser's native control.
 *
 * ICON NOTE: Figma's upload icon was not exported before MCP access dropped
 * mid-task (see README). `download-cloud`, already in the sprite, rotated
 * 180deg, draws the same cloud with the arrow reversed - visually the correct
 * glyph for "upload" - so no separate icon is used. Swap for a proper "upload
 * cloud" export if the real Figma asset becomes available.
 */
export default function FileDropzone({ label, fileName, onChange, readOnly }) {
  const id = useId();

  if (readOnly) {
    return fileName ? (
      <div className="rounded-md border border-border-default px-4 py-2.5">
        <span className="text-md font-medium text-on-brand">{fileName}</span>
      </div>
    ) : (
      <p className="text-md text-placeholder">No {label.toLowerCase()} attached.</p>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border-strong bg-subtle px-6 py-8 text-center">
      <span className="flex size-9 items-center justify-center rounded-full bg-muted text-tertiary">
        <Icon name="download-cloud" size="md" className="rotate-180" />
      </span>

      <p className="text-sm text-tertiary">
        <label htmlFor={id} className="cursor-pointer font-medium text-on-brand hover:text-brand">
          Click to upload
        </label>{" "}
        {label}
      </p>

      {fileName && (
        <p className="text-sm font-medium text-primary">{fileName}</p>
      )}

      <input
        id={id}
        type="file"
        className="sr-only"
        onChange={(e) => onChange?.(e.target.files?.[0]?.name ?? "")}
      />
    </div>
  );
}
