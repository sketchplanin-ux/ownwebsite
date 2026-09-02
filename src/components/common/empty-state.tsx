import * as React from "react"
import { InboxIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type EmptyStateProps = Omit<React.ComponentProps<"section">, "title"> & {
  action?: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  title?: React.ReactNode
}

function EmptyState({
  action,
  className,
  description = "There is nothing to show yet.",
  icon = <InboxIcon />,
  title = "No results found",
  ...props
}: EmptyStateProps) {
  return (
    <section
      data-slot="empty-state"
      className={cn(
        "flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed bg-card px-6 py-10 text-center text-card-foreground",
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="mb-4 inline-flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-5"
      >
        {icon}
      </span>
      <h2 className="font-heading text-base font-semibold">{title}</h2>
      {description && (
        <p className="mt-1 max-w-md text-sm text-pretty text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </section>
  )
}

export { EmptyState, type EmptyStateProps }
