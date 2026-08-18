import Icon from "./Icon.jsx";

/**
 * Button
 * -----------------------------------------------------------------------------
 * Variants observed in FINAL SCREENS:
 *   primary      filled brand - page-level actions ("Add Clients"), and the
 *                "Verify" row action in the Finance table
 *   secondary    outlined, neutral
 *   brandSubtle  tinted brand fill - "Send Details to Mobile"
 *   success      filled success - confirming money movement: "Add Payment",
 *                "Verify" inside the payment dialogs (nodes 1180:36020/36066).
 *                Not the same green as `primary`'s purple: Finance's own
 *                dialect uses a distinct action colour for this one class of
 *                action, built from the success ramp rather than invented.
 *   dangerOutline outlined in the error colour - "Reject" on Verify Payment.
 *                Outline rather than filled: it is the least-common action in
 *                that footer, and Untitled UI reserves solid-red fills for
 *                truly destructive, unrecoverable actions.
 *   link         text-only, no chrome - the "Edit" action in table rows
 *   linkBrand    text-only in brand colour - the "View" action in table rows
 *
 * Sizes follow the Untitled UI button scale; `md` (px-16 py-10, 14/20) is what
 * the designed screens use.
 */

const VARIANTS = {
  primary:
    "bg-brand border border-brand text-inverse shadow-xs hover:bg-brand-hover hover:border-brand-hover",
  secondary:
    "bg-surface border border-border-strong text-secondary shadow-xs hover:bg-muted",
  // Tinted brand fill - the "Send Details to Mobile" action in the Add Client
  // dialog. Reads as secondary but stays in the brand family.
  brandSubtle:
    "bg-brand-subtle border border-brand-subtle text-on-brand shadow-xs hover:bg-primary-100",
  success:
    "bg-success border border-success text-inverse shadow-xs hover:bg-success-hover hover:border-success-hover",
  dangerOutline:
    "bg-surface border border-status-error-fg text-status-error-fg shadow-xs hover:bg-status-error-bg",
  link: "text-tertiary hover:text-primary",
  linkBrand: "text-on-brand hover:text-brand",
};

const SIZES = {
  sm: "px-3 py-2 text-sm rounded-md gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-md gap-2",
  lg: "px-4.5 py-2.5 text-md rounded-md gap-2",
};

const BARE = new Set(["link", "linkBrand"]);

export default function Button({
  variant = "primary",
  size = "md",
  iconLeading,
  iconTrailing,
  children,
  className = "",
  type = "button",
  ...rest
}) {
  const bare = BARE.has(variant);

  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        bare ? "gap-2 text-sm" : SIZES[size],
        VARIANTS[variant],
        className,
      ].join(" ")}
      {...rest}
    >
      {iconLeading && <Icon name={iconLeading} size="md" />}
      {children}
      {iconTrailing && <Icon name={iconTrailing} size="md" />}
    </button>
  );
}
