import type { Metadata } from "next";

import { DashboardScreen } from "@/features/dashboard/dashboard-screen";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function AdminDashboardPage() {
  return <DashboardScreen />;
}

