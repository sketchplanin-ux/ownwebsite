import type { ReactNode } from "react"

import { AdminRouteGuard } from "@/components/admin/admin-route-guard"
import { PERMISSIONS } from "@/features/auth/permissions"

export default function AdminServicesLayout({ children }: { children: ReactNode }) {
  return (
    <AdminRouteGuard permissions={PERMISSIONS.MANAGE_SERVICES}>
      {children}
    </AdminRouteGuard>
  )
}
