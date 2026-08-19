import {
  TableCard,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from "../ui/Table.jsx";
import { PERMISSION_LEVELS, PERMISSION_ROLES } from "../../data/settings.js";

/**
 * PermissionMatrix
 * -----------------------------------------------------------------------------
 * Sections down the side, roles across the top, one permission level in each
 * cell.
 *
 * Drawn twice in the file - on the Roles & Permissions tab (node 1181:87262)
 * and inside Create a Role (node 1181:87651) - identically both times, so it
 * is one component used twice rather than two copies.
 *
 * DEVIATION: the frame draws each cell as a static pill. A permissions screen
 * whose cells cannot be changed is not a permissions screen, so each cell is a
 * button that cycles Full -> View Only -> None. The level is always spelled
 * out in the cell, never carried by colour, and the button's accessible name
 * says which section and role it belongs to - a grid of pills all reading
 * "Full" is unnavigable otherwise.
 */

const LEVEL_CLASS = {
  full: "border-border-brand bg-brand-subtle text-on-brand",
  view: "border-border-strong bg-surface text-secondary",
  none: "border-border-strong bg-muted text-tertiary",
};

const labelFor = (id) =>
  PERMISSION_LEVELS.find((l) => l.id === id)?.label ?? id;

/** Next level in the cycle, wrapping at the end. */
function nextLevel(current) {
  const i = PERMISSION_LEVELS.findIndex((l) => l.id === current);
  return PERMISSION_LEVELS[(i + 1) % PERMISSION_LEVELS.length].id;
}

export default function PermissionMatrix({ sections, onChange }) {
  return (
    <TableCard>
      <Table density="dense" nowrap>
        <THead>
          <TR>
            <TH width={280}>Sections</TH>
            {PERMISSION_ROLES.map((role) => (
              <TH key={role} width={180} align="center">
                {role}
              </TH>
            ))}
          </TR>
        </THead>

        <TBody>
          {sections.map((section) => (
            <TR key={section.id}>
              <TD className="text-primary">{section.label}</TD>

              {section.levels.map((level, roleIndex) => (
                <TD key={PERMISSION_ROLES[roleIndex]} align="center">
                  <button
                    type="button"
                    onClick={() =>
                      onChange?.(section.id, roleIndex, nextLevel(level))
                    }
                    aria-label={`${section.label}, ${PERMISSION_ROLES[roleIndex]}: ${labelFor(level)}. Change permission.`}
                    className={[
                      "cursor-pointer rounded-md border px-3.5 py-2 text-sm font-medium shadow-xs transition-colors hover:bg-muted",
                      LEVEL_CLASS[level] ?? LEVEL_CLASS.view,
                    ].join(" ")}
                  >
                    {labelFor(level)}
                  </button>
                </TD>
              ))}
            </TR>
          ))}
        </TBody>
      </Table>
    </TableCard>
  );
}
