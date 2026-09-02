import type { Metadata } from "next";

import { BannersAdminScreen } from "@/features/admin-banners/banners-admin-screen";

export const metadata: Metadata = {
  title: "Banners",
};

export default function AdminBannersPage() {
  return <BannersAdminScreen />;
}
