"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import type { AdminBreadcrumbItem } from "@/components/admin/admin-breadcrumbs"
import { AdminMobileSidebar } from "@/components/admin/admin-mobile-sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminTopbar } from "@/components/admin/admin-topbar"
import { ADMIN_ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface AdminPageDescriptor {
  breadcrumbs: readonly AdminBreadcrumbItem[]
  title: string
}

const ADMIN_PAGE_LABELS = [
  { href: ADMIN_ROUTES.dashboard, label: "Dashboard" },
  { href: ADMIN_ROUTES.homepage, label: "Homepage" },
  { href: ADMIN_ROUTES.services, label: "Services" },
  { href: ADMIN_ROUTES.projects, label: "Projects" },
  { href: ADMIN_ROUTES.blogs, label: "Blogs" },
  { href: ADMIN_ROUTES.banners, label: "Banners" },
  { href: ADMIN_ROUTES.offers, label: "Offers" },
  { href: ADMIN_ROUTES.leads, label: "Leads" },
  { href: ADMIN_ROUTES.settings, label: "Settings" },
] as const

function normalizePath(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname
}

function getAdminPageDescriptor(pathname: string): AdminPageDescriptor {
  const normalizedPath = normalizePath(pathname)
  const match = ADMIN_PAGE_LABELS.find(({ href }) => {
    const normalizedHref = normalizePath(href)
    return (
      normalizedPath === normalizedHref ||
      normalizedPath.startsWith(`${normalizedHref}/`)
    )
  })
  const title = match?.label ?? "Admin"

  if (title === "Dashboard") {
    return { title, breadcrumbs: [{ label: "Dashboard" }] }
  }

  return {
    title,
    breadcrumbs: [
      { label: "Dashboard", href: ADMIN_ROUTES.dashboard },
      { label: title },
    ],
  }
}

interface AdminShellProps {
  actions?: React.ReactNode
  breadcrumbs?: readonly AdminBreadcrumbItem[]
  children: React.ReactNode
  className?: string
  contentClassName?: string
  description?: React.ReactNode
  title?: React.ReactNode
}

function AdminShell({
  actions,
  breadcrumbs,
  children,
  className,
  contentClassName,
  description,
  title,
}: AdminShellProps) {
  const pathname = usePathname()
  const [navigationOpen, setNavigationOpen] = React.useState(false)
  const descriptor = getAdminPageDescriptor(pathname)
  const pageTitle = title ?? descriptor.title
  const pageBreadcrumbs = breadcrumbs ?? descriptor.breadcrumbs

  return (
    <div
      data-slot="admin-shell"
      className={cn("min-h-dvh bg-background", className)}
    >
      <a
        href="#admin-main-content"
        className="fixed top-3 left-3 z-[100] -translate-y-20 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg transition-transform focus-visible:translate-y-0 motion-reduce:transition-none"
      >
        Skip to admin content
      </a>

      <AdminSidebar />
      <AdminMobileSidebar
        open={navigationOpen}
        onOpenChange={setNavigationOpen}
      />

      <div className="min-h-dvh min-w-0 lg:pl-68">
        <AdminTopbar
          title={pageTitle}
          breadcrumbs={pageBreadcrumbs}
          onOpenNavigation={() => setNavigationOpen(true)}
        />

        <main
          id="admin-main-content"
          tabIndex={-1}
          className={cn(
            "mx-auto w-full max-w-[100rem] px-4 py-6 outline-none sm:px-6 sm:py-8 lg:px-8",
            contentClassName
          )}
        >
          {(description || actions) && (
            <div className="mb-6 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
              {description && (
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                  {description}
                </p>
              )}
              {actions && (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {actions}
                </div>
              )}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}

export {
  ADMIN_PAGE_LABELS,
  AdminShell,
  getAdminPageDescriptor,
  type AdminPageDescriptor,
  type AdminShellProps,
}
