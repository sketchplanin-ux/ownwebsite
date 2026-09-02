"use client"

import type { ReactNode } from "react"
import { MenuIcon } from "lucide-react"

import { AdminBrand } from "@/components/admin/admin-brand"
import {
  AdminBreadcrumbs,
  type AdminBreadcrumbItem,
} from "@/components/admin/admin-breadcrumbs"
import { AdminClock } from "@/components/admin/admin-clock"
import { AdminLogoutButton } from "@/components/admin/admin-logout-button"
import { Button } from "@/components/ui/button"
import { useAdmin } from "@/hooks/use-admin"
import type { AdminRole } from "@/types/auth"

interface AdminTopbarProps {
  breadcrumbs: readonly AdminBreadcrumbItem[]
  onOpenNavigation: () => void
  title: ReactNode
}

function formatAdminRole(role: AdminRole | null) {
  if (!role) {
    return "Admin"
  }

  return role
    .toLocaleLowerCase("en-US")
    .split("_")
    .map((word) => word.charAt(0).toLocaleUpperCase("en-US") + word.slice(1))
    .join(" ")
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase("en-US"))
    .join("")

  return initials || "A"
}

function AdminTopbar({
  breadcrumbs,
  onOpenNavigation,
  title,
}: AdminTopbarProps) {
  const admin = useAdmin()
  const displayName =
    admin.adminUser?.name?.trim() ||
    admin.adminUser?.email?.trim() ||
    "Administrator"

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 supports-backdrop-filter:backdrop-blur-xl">
      <div className="flex min-h-20 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="lg:hidden"
          aria-label="Open admin navigation"
          onClick={onOpenNavigation}
        >
          <MenuIcon aria-hidden="true" />
        </Button>

        <AdminBrand compact className="shrink-0" />

        <div aria-hidden="true" className="hidden h-9 w-px bg-border sm:block" />

        <div className="min-w-0 flex-1">
          <AdminBreadcrumbs items={breadcrumbs} className="hidden sm:block" />
          <h1 className="truncate text-xl font-semibold leading-tight sm:mt-1 sm:text-2xl">
            {title}
          </h1>
        </div>

        <AdminClock className="hidden xl:flex" />

        <div aria-hidden="true" className="hidden h-9 w-px bg-border xl:block" />

        <div className="hidden min-w-0 items-center gap-2.5 md:flex">
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold tracking-wide text-primary-foreground"
          >
            {getInitials(displayName)}
          </span>
          <span className="hidden min-w-0 leading-tight xl:block">
            <span className="block max-w-40 truncate text-sm font-semibold">
              {displayName}
            </span>
            <span className="block font-mono text-[0.6rem] tracking-[0.1em] text-muted-foreground uppercase">
              {formatAdminRole(admin.role)}
            </span>
          </span>
          <span className="sr-only">
            Signed in as {displayName}, {formatAdminRole(admin.role)}
          </span>
        </div>

        <AdminLogoutButton className="px-2.5 [&>span]:hidden 2xl:[&>span]:inline" />
      </div>
    </header>
  )
}

export {
  AdminTopbar,
  formatAdminRole,
  getInitials,
  type AdminTopbarProps,
}
