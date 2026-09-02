import { ChevronRightIcon } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

interface AdminBreadcrumbItem {
  href?: string
  label: string
}

interface AdminBreadcrumbsProps {
  className?: string
  items: readonly AdminBreadcrumbItem[]
}

function AdminBreadcrumbs({ className, items }: AdminBreadcrumbsProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("min-w-0", className)}
    >
      <ol className="flex min-w-0 items-center gap-1.5 text-[0.65rem] font-medium tracking-[0.08em] text-muted-foreground uppercase">
        {items.map((item, index) => {
          const current = index === items.length - 1

          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
              {index > 0 && (
                <ChevronRightIcon
                  aria-hidden="true"
                  className="size-3 shrink-0 opacity-50"
                />
              )}
              {item.href && !current ? (
                <Link
                  href={item.href}
                  className="truncate rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={current ? "page" : undefined}
                  className={cn("truncate", current && "text-foreground")}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export {
  AdminBreadcrumbs,
  type AdminBreadcrumbItem,
  type AdminBreadcrumbsProps,
}
