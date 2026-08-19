import { useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import { TextField } from "../ui/TextField.jsx";
import PermissionMatrix from "./PermissionMatrix.jsx";
import { PERMISSION_SECTIONS } from "../../data/settings.js";

/**
 * Create a Role
 * Figma: GOLDEN / Settings (node 1181:87651)
 *
 * A role name over the same `PermissionMatrix` the Roles & Permissions tab
 * shows, with Discard / Save beneath.
 *
 * DEVIATION: the frame draws this as a sheet filling the main content area
 * rather than a centred modal. Rendered as a Modal at that width, the same
 * call made for the order detail dialog - it keeps Escape, the focus trap and
 * backdrop dismiss rather than introducing a second overlay language.
 *
 * The draft starts from the current permission defaults rather than empty:
 * a new role with every section set to "Full" would be a dangerous default,
 * and one set to "None" everywhere is tedious to fill in. The defaults are
 * what the frame shows.
 */
export default function CreateRoleDialog({ open, onClose, onSave }) {
  const [name, setName] = useState("");
  const [sections, setSections] = useState(PERMISSION_SECTIONS);

  function setLevel(sectionId, roleIndex, level) {
    setSections((list) =>
      list.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              levels: section.levels.map((current, i) =>
                i === roleIndex ? level : current
              ),
            }
          : section
      )
    );
  }

  function discard() {
    setName("");
    setSections(PERMISSION_SECTIONS);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create a Role"
      width={1128}
      showCloseButton
      footer={
        <div className="flex flex-1 justify-end gap-3">
          <Button variant="secondary" size="lg" onClick={discard}>
            Discard
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={() => onSave?.({ name, sections })}
          >
            Save
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <TextField
          label="Role Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <PermissionMatrix sections={sections} onChange={setLevel} />
      </div>
    </Modal>
  );
}
