import type { Metadata } from "next";

import { BannerCreateScreen } from "@/features/admin-banners/banner-create-screen";

export const metadata: Metadata = {
  title: "Create Banner",
};

export default function AdminBannerCreatePage() {
  return <BannerCreateScreen />;
}
