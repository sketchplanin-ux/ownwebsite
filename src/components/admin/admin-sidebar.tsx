"use client"

import type { LucideIcon } from "lucide-react"
import {
  FileTextIcon,
  FolderKanbanIcon,
  HomeIcon,
  ImageIcon,
  InboxIcon,
  Layers3Icon,
  LayoutDashboardIcon,
  SettingsIcon,
  TagIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { AdminBrand } from "@/components/admin/admin-brand"
import { AdminLogoutButton } from "@/components/admin/admin-logout-button"
import { AdminProductCredit } from "@/components/admin/admin-product-credit"
import { PERMISSIONS, type Permission } from "@/features/auth/permissions"
import { useAdmin } from "@/hooks/use-admin"
import { ADMIN_ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface AdminNavigationItem {
  href: string
  icon: LucideIcon
  label: string
  permission?: Permission
}

const ADMIN_NAVIGATION_ITEMS: readonly AdminNavigationItem[] = [
  {
    href: ADMIN_ROUTES.dashboard,
    icon: LayoutDashboardIcon,
    label: "Dashboard",
  },
  {
    href: ADMIN_ROUTES.homepage,
    icon: HomeIcon,
    label: "Homepage",
    permission: PERMISSIONS.MANAGE_CONTENT,
  },
  {
    href: ADMIN_ROUTES.services,
    icon: Layers3Icon,
    label: "Services",
    permission: PERMISSIONS.MANAGE_SERVICES,
  },
  {
    href: ADMIN_ROUTES.projects,
    icon: FolderKanbanIcon,
    label: "Projects",
    permission: PERMISSIONS.MANAGE_PROJECTS,
  },
  {
    href: ADMIN_ROUTES.blogs,
    icon: FileTextIcon,
    label: "Blogs",
    permission: PERMISSIONS.MANAGE_BLOGS,
  },
  {
    href: ADMIN_ROUTES.banners,
    icon: ImageIcon,
    label: "Banners",
    permission: PERMISSIONS.MANAGE_BANNERS,
  },
  {
    href: ADMIN_ROUTES.offers,
    icon: TagIcon,
    label: "Offers",
    permission: PERMISSIONS.MANAGE_OFFERS,
  },
  {
    href: ADMIN_ROUTES.leads,
    icon: InboxIcon,
    label: "Leads",
    permission: PERMISSIONS.VIEW_LEADS,
  },
  {
    href: ADMIN_ROUTES.settings,
    icon: SettingsIcon,
    label: "Settings",
    permission: PERMISSIONS.MANAGE_SETTINGS,
  },
]

function normalizeAdminPath(path: string) {
  return path.length > 1 ? path.replace(/\/+$/, "") : path
}

function isAdminNavigationItemActive(pathname: string, href: string) {
  const currentPath = normalizeAdminPath(pathname)
  const itemPath = normalizeAdminPath(href)
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`)
}

interface AdminSidebarContentProps {
  onNavigate?: () => void
}

function AdminSidebarContent({ onNavigate }: AdminSidebarContentProps) {
  const pathname = usePathname()
  const admin = useAdmin()
  const visibleItems = ADMIN_NAVIGATION_ITEMS.filter(
    (item) => !item.permission || admin.can(item.permission)
  )

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-slate-950 text-slate-100">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:2rem_2rem]"
      />

      <div className="relative border-b border-white/10 px-5 py-5">
        <AdminBrand tone="inverse" />
        <p className="mt-5 font-mono text-[0.58rem] tracking-[0.18em] text-slate-500 uppercase">
          Drawing set · Admin / 01
        </p>
      </div>

      <nav
        aria-label="Admin navigation"
        className="relative min-h-0 flex-1 overflow-y-auto px-3 py-5"
      >
        <p className="px-3 pb-2 font-mono text-[0.58rem] tracking-[0.2em] text-slate-500 uppercase">
          Workspace
        </p>
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const active = isAdminNavigationItemActive(pathname, item.href)
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={onNavigate}
                  className={cn(
                    "group relative flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/70 motion-reduce:transition-none",
                    active
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary transition-opacity motion-reduce:transition-none",
                      active ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                    )}
                  />
                  <Icon
                    aria-hidden="true"
                    className={cn(
                      "size-4.5 shrink-0",
                      active ? "text-primary" : "text-slate-500 group-hover:text-slate-300"
                    )}
                  />
                  <span>{item.label}</span>
                  <span
                    aria-hidden="true"
                    className="ml-auto font-mono text-[0.55rem] text-slate-600"
                  >
                    {String(visibleItems.indexOf(item) + 1).padStart(2, "0")}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="relative space-y-3 border-t border-white/10 p-3">
        <AdminLogoutButton
          inverse
          onLoggedOut={onNavigate}
          className="w-full justify-start"
        />
        <AdminProductCredit inverse />
      </div>
    </div>
  )
}

function AdminSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-68 border-r border-slate-800 lg:block">
      <AdminSidebarContent />
    </aside>
  )
}

export {
  ADMIN_NAVIGATION_ITEMS,
  AdminSidebar,
  AdminSidebarContent,
  isAdminNavigationItemActive,
  type AdminNavigationItem,
  type AdminSidebarContentProps,
}
