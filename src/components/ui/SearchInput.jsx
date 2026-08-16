import Icon from "./Icon.jsx";

/**
 * SearchInput
 * -----------------------------------------------------------------------------
 * The search field used in the sidebar and above every data table.
 * Figma: bg white, 1px gray-300 border, px-14 py-10, radius 8, shadow-xs,
 * 20px leading icon, 16/24 placeholder in gray-500.
 */
export default function SearchInput({
  placeholder = "Search",
  value,
  onChange,
  className = "",
  ...rest
}) {
  return (
    <div
      className={[
        "flex items-center gap-2 rounded-md border border-border-strong bg-surface",
        "px-3.5 py-2.5 shadow-xs",
        "focus-within:border-border-brand focus-within:ring-4 focus-within:ring-ring-brand",
        className,
      ].join(" ")}
    >
      <Icon name="search" size="md" className="text-tertiary" />
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-md text-primary outline-none placeholder:text-tertiary"
        {...rest}
      />
    </div>
  );
}
