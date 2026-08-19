import { useId, useState } from "react";
import Icon from "./Icon.jsx";

/**
 * TagInput
 * -----------------------------------------------------------------------------
 * A labelled set of removable chips, with a field to add another.
 *
 * Figma: Settings > Business "Operating cities" (node 1181:87164), which draws
 * five brand-tinted chips each carrying an x.
 *
 * The frame shows no way to *add* a city - only the chips and their remove
 * buttons. A list you can empty but never refill is a dead end, so an add
 * field is included; it is the smallest addition that makes the control
 * coherent. See the README's deviation table.
 *
 * Each chip's remove control is a real button with its own accessible name
 * ("Remove Mumbai"), so the list is operable without a mouse and every target
 * announces what it does rather than just "x".
 */
export default function TagInput({
  label,
  value = [],
  onChange,
  placeholder = "Add and press Enter",
}) {
  const [draft, setDraft] = useState("");
  const id = useId();

  function add(e) {
    e.preventDefault();
    const next = draft.trim();
    // Silently ignore blanks and duplicates rather than adding a chip that
    // looks identical to one already there.
    if (!next || value.includes(next)) {
      setDraft("");
      return;
    }
    onChange?.([...value, next]);
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-md font-semibold text-tertiary">
        {label}
      </label>

      <ul className="flex list-none flex-wrap items-center gap-2 p-0">
        {value.map((tag) => (
          <li
            key={tag}
            className="flex items-center gap-1 rounded-full bg-brand-subtle py-1 pr-1.5 pl-3 text-sm font-medium text-on-brand"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange?.(value.filter((t) => t !== tag))}
              aria-label={`Remove ${tag}`}
              className="cursor-pointer rounded-full p-0.5 transition-colors hover:bg-brand hover:text-inverse"
            >
              <Icon name="x-close" size="sm" />
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={add}>
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-border-strong bg-surface px-3.5 py-2.5 text-md text-primary shadow-xs outline-none placeholder:text-tertiary focus:border-border-brand focus:ring-4 focus:ring-ring-brand"
        />
      </form>
    </div>
  );
}
