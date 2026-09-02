import type { Metadata } from "next";

import { SettingsScreen } from "@/features/admin-settings/settings-screen";

export const metadata: Metadata = {
  title: "Settings",
};

export default function AdminSettingsPage() {
  return <SettingsScreen />;
}

