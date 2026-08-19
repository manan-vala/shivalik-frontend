import { useState } from "react";
import SearchInput from "../ui/SearchInput.jsx";
import { Select } from "../ui/TextField.jsx";
import PermissionMatrix from "./PermissionMatrix.jsx";
import { PERMISSION_SECTIONS, ROLE_SCOPES } from "../../data/settings.js";

/**
 * Settings > Roles & Permissions
 * Figma: GOLDEN / Settings (node 1181:87262)
 *
 * The matrix is `PermissionMatrix`, shared with the Create a Role sheet.
 *
 * Permission edits are held here rather than inside the matrix so the page
 * owns the data and the matrix stays a presentation component - the same
 * split Create a Role uses with its own draft state.
 */
export default function RolesSettings() {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState(ROLE_SCOPES[0]);
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 border-b border-border-default pb-5">
        <SearchInput
          placeholder="Search by email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search roles by email"
          className="flex-1"
        />
        <Select
          aria-label="Role scope"
          options={ROLE_SCOPES}
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="w-40 shrink-0"
        />
      </div>

      <PermissionMatrix sections={sections} onChange={setLevel} />
    </div>
  );
}
