import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import Tabs, { TabPanel } from "../../components/ui/Tabs.jsx";
import BusinessSettings from "../../components/settings/BusinessSettings.jsx";
import UsersSettings from "../../components/settings/UsersSettings.jsx";
import RolesSettings from "../../components/settings/RolesSettings.jsx";
import CreateRoleDialog from "../../components/settings/CreateRoleDialog.jsx";

/**
 * Settings - Shivalik Admin
 * Figma: GOLDEN / Settings
 *   Business            node 1181:87164
 *   Users               node 1181:88147
 *   Roles & Permissions node 1181:87262
 *   + Create a Role     node 1181:87651
 *   + Edit Staff Member node 1181:88057 - already built as StaffFormDialog
 *
 * Three tabs down the left, panel on the right. The tab list is the shared
 * `Tabs` primitive in its vertical orientation rather than a Settings-only
 * control - same ARIA pattern and same markup, only the arrow keys differ.
 *
 * "Create a Role" sits in the page header and only appears on the Roles tab,
 * which is where the frames draw it - the Business and Users frames have no
 * header action at all.
 */

const TABS = [
  { id: "business", label: "Business" },
  { id: "users", label: "Users" },
  { id: "roles", label: "Roles & Permissions" },
];

export default function SettingsPage() {
  const [tab, setTab] = useState("business");
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      <PageHeader
        title="Settings"
        actions={
          tab === "roles" ? (
            <Button variant="primary" onClick={() => setCreateOpen(true)}>
              Create a Role
            </Button>
          ) : null
        }
      />

      <div className="flex gap-8">
        <Tabs
          tabs={TABS}
          value={tab}
          onChange={setTab}
          orientation="vertical"
          label="Settings sections"
        />

        <div className="min-w-0 flex-1">
          <TabPanel id="business" active={tab === "business"}>
            <BusinessSettings />
          </TabPanel>

          <TabPanel id="users" active={tab === "users"}>
            <UsersSettings />
          </TabPanel>

          <TabPanel id="roles" active={tab === "roles"}>
            <RolesSettings />
          </TabPanel>
        </div>
      </div>

      <CreateRoleDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
