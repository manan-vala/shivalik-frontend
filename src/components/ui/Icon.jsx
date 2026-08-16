import { ICON_NAMES } from "./icon-names.js";

/**
 * Icon
 * -----------------------------------------------------------------------------
 * Renders a glyph from the generated sprite at public/icons.svg.
 *
 * Icons inherit `currentColor`, so colour comes from the surrounding text
 * colour rather than a prop:
 *
 *   <Icon name="truck" />                        inherits
 *   <span className="text-tertiary"><Icon name="truck" /></span>
 *   <Icon name="check-circle" className="text-status-success-fg" />
 *
 * Sizes map to the grid the icons were drawn on:
 *   sm 16px  ·  md 20px (default, table + button icons)  ·  lg 24px (nav)
 *
 * Decorative by default. Pass `title` when the icon is the only label — that
 * switches it to img role and gives it an accessible name.
 */

const SIZES = { sm: 16, md: 20, lg: 24 };

export function Icon({ name, size = "md", title, className = "", ...rest }) {
  if (import.meta.env.DEV && !ICON_NAMES.includes(name)) {
    console.warn(
      `<Icon name="${name}" /> is not in the sprite. ` +
        `Add src/assets/icons/${name}.svg then run \`npm run icons\`. ` +
        `Available: ${ICON_NAMES.join(", ")}`
    );
  }

  const px = SIZES[size] ?? size;
  const base = `${import.meta.env.BASE_URL}icons.svg`;

  return (
    <svg
      width={px}
      height={px}
      className={`inline-block shrink-0 ${className}`}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <use href={`${base}#${name}`} />
    </svg>
  );
}

export default Icon;
