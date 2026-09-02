import type { Metadata } from "next";

import { PagesScreen } from "@/features/admin-settings/pages-screen";

export const metadata: Metadata = {
  title: "Managed pages",
};

export default function AdminHomepagePage() {
  return <PagesScreen />;
}

