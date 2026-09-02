import type { Metadata } from "next"

import { ServicesAdminScreen } from "@/features/admin-services/services-admin-screen"

export const metadata: Metadata = {
  title: "Services",
}

export default function AdminServicesPage() {
  return <ServicesAdminScreen />
}
