import { AdminShell } from "@/components/admin-shell";
import { SettingsForm } from "@/components/settings-form";
import { getSettings } from "@/lib/settings";

export default async function SettingsAdmin() {
  const data = await getSettings();
  return (
    <AdminShell title="网站设置">
      <SettingsForm initial={data} />
    </AdminShell>
  );
}
