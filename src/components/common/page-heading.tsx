import * as React from "react"

import { cn } from "@/lib/utils"

type PageHeadingProps = Omit<React.ComponentProps<"header">, "title"> & {
  actions?: React.ReactNode
  description?: React.ReactNode
  eyebrow?: React.ReactNode
  title: React.ReactNode
}

function PageHeading({
  actions,
  className,
  description,
  eyebrow,
  title,
  ...props
}: PageHeadingProps) {
  return (
    <header
      data-slot="page-heading"
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
      {...props}
    >
      <div className="min-w-0 space-y-1">
        {eyebrow && (
          <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>
        )}
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-3xl text-sm text-pretty text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </header>
  )
}

export { PageHeading, type PageHeadingProps }
