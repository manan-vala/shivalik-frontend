import { useId } from "react";
import Icon from "./Icon.jsx";

/**
 * TextField / Select
 * -----------------------------------------------------------------------------
 * Labelled form controls used by the dialogs.
 *
 * Figma (node 790:56543):
 *   label   16/24 semibold, gray-500
 *   input   white, 1px gray-300, px-14 py-10, radius 8, shadow-xs, 16/24
 *   action  inline button inside the field: white, 1px gray-300, px-14 py-8,
 *           radius 8, 14/20 medium gray-700 - "Verify", "Auto-generate"
 *
 * The label is a real <label htmlFor>, so clicking it focuses the field and
 * screen readers announce the pair.
 */

const FIELD =
  "flex items-center gap-2 rounded-md border border-border-strong bg-surface px-3.5 py-2.5 shadow-xs " +
  "focus-within:border-border-brand focus-within:ring-4 focus-within:ring-ring-brand";

const CONTROL =
  "min-w-0 flex-1 bg-transparent text-md text-primary outline-none placeholder:text-tertiary";

function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="text-md font-semibold text-tertiary">
      {children}
    </label>
  );
}

/** Small button that sits inside a field, e.g. "Verify". */
function InlineAction({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-md border border-border-strong bg-surface px-3.5 py-2 text-sm font-medium text-secondary shadow-xs transition-colors hover:bg-muted"
    >
      {children}
    </button>
  );
}

export function TextField({
  label,
  action,
  onAction,
  className = "",
  ...rest
}) {
  const id = useId();

  return (
    <div className={["flex flex-col gap-2", className].join(" ")}>
      <Label htmlFor={id}>{label}</Label>
      <div className={FIELD}>
        <input id={id} className={CONTROL} {...rest} />
        {action && <InlineAction onClick={onAction}>{action}</InlineAction>}
      </div>
    </div>
  );
}

/**
 * Multi-line field - "Body", "Add note", "Reason" across the Support dialogs
 * (nodes 1180:37549, 37631, 37643). Same label/border/focus chrome as
 * TextField; a plain `<textarea>` in place of the single-line control since
 * none of TextField's inline-action slot is used by any multi-line field.
 */
export function Textarea({
  label,
  rows = 4,
  maxLength,
  value = "",
  className = "",
  ...rest
}) {
  const id = useId();

  return (
    <div className={["flex flex-col gap-2", className].join(" ")}>
      <div className="flex items-baseline justify-between">
        <Label htmlFor={id}>{label}</Label>
        {maxLength && (
          <span className="text-xs text-placeholder">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      {/* FIELD's focus-within only lights up for a focused *descendant* - the
          bare `${FIELD} ${CONTROL}` concatenation TextField/Select use won't
          work here because the textarea itself is the focusable element, not
          a child of the bordered box. Wrapping it restores that contract. */}
      <div className={FIELD}>
        <textarea
          id={id}
          rows={rows}
          maxLength={maxLength}
          value={value}
          className={`${CONTROL} resize-none`}
          {...rest}
        />
      </div>
    </div>
  );
}

export function SelectField({
  label,
  options = [],
  placeholder = "Select",
  className = "",
  value,
  ...rest
}) {
  const id = useId();
  // Controlled and uncontrolled callers both exist, and React warns if a
  // select carries `value` and `defaultValue` at once - so the empty
  // "show the placeholder" default is only supplied when nobody is driving
  // the field from state.
  const modeProps =
    value === undefined ? { defaultValue: "" } : { value };

  return (
    <div className={["flex flex-col gap-2", className].join(" ")}>
      <Label htmlFor={id}>{label}</Label>
      <div className={FIELD}>
        <select
          id={id}
          // appearance-none so the field keeps the designed chevron rather than
          // the platform's own dropdown arrow.
          className={`${CONTROL} appearance-none`}
          {...modeProps}
          {...rest}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" size="md" className="shrink-0 text-tertiary" />
      </div>
    </div>
  );
}

/**
 * Bare select with no label block - for a select that sits inside a table row
 * or toolbar where the column header already names it. `aria-label` is
 * required so it still announces.
 *
 * `disabled` dims the whole control (border-default, text-disabled), not just
 * the native element - the Staff Attendance table's decided rows lock the
 * dropdown once Approved/Rejected (node 1181:84773).
 */
export function Select({ options = [], className = "", disabled, ...rest }) {
  return (
    <div
      className={[
        FIELD,
        disabled ? "border-border-default" : "",
        className,
      ].join(" ")}
    >
      <select
        disabled={disabled}
        className={`${CONTROL} appearance-none ${disabled ? "text-disabled" : ""}`}
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <Icon
        name="chevron-down"
        size="md"
        className={`shrink-0 ${disabled ? "text-disabled" : "text-tertiary"}`}
      />
    </div>
  );
}

/**
 * Radio group - the Vendor Type control in the Add Vendor dialog (horizontal,
 * the default) and the New Ticket dialog's Priority control (vertical, node
 * 1180:37562 - each option its own 40px row).
 */
export function RadioGroup({
  label,
  name,
  options = [],
  value,
  onChange,
  layout = "horizontal",
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-md font-semibold text-tertiary">{label}</legend>
      <div className={layout === "vertical" ? "flex flex-col" : "flex gap-6"}>
        {options.map((opt) => (
          <label
            key={opt}
            className={[
              "flex cursor-pointer items-center gap-2 text-md text-primary",
              layout === "vertical" ? "h-10" : "flex-1",
            ].join(" ")}
          >
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              onChange={(e) => onChange(e.target.value)}
              className="size-4 accent-[var(--ui-bg-brand)]"
            />
            {opt}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default TextField;
