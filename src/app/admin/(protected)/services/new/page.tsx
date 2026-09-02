import type { Metadata } from "next";

import { ServiceCreateScreen } from "@/features/admin-services/service-create-screen";

export const metadata: Metadata = {
  title: "New service",
}

export default function NewAdminServicePage() {
  return <ServiceCreateScreen />;
}
