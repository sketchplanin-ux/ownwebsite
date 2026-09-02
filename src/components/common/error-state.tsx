"use client"

import * as React from "react"
import { TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ErrorStateProps = Omit<React.ComponentProps<"section">, "title"> & {
  action?: React.ReactNode
  description?: React.ReactNode
  onRetry?: () => void
  retryLabel?: string
  title?: React.ReactNode
}

function ErrorState({
  action,
  className,
  description = "Please try again. If the problem continues, check your connection.",
  onRetry,
  retryLabel = "Try again",
  title = "Something went wrong",
  ...props
}: ErrorStateProps) {
  return (
    <section
      data-slot="error-state"
      className={cn(
        "flex min-h-48 flex-col items-center justify-center rounded-lg border border-destructive/30 bg-card px-6 py-10 text-center text-card-foreground",
        className
      )}
      role="alert"
      {...props}
    >
      <span
        aria-hidden="true"
        className="mb-4 inline-flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive [&_svg]:size-5"
      >
        <TriangleAlertIcon />
      </span>
      <h2 className="font-heading text-base font-semibold">{title}</h2>
      {description && (
        <p className="mt-1 max-w-md text-sm text-pretty text-muted-foreground">
          {description}
        </p>
      )}
      {(onRetry || action) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {onRetry && (
            <Button type="button" variant="outline" onClick={onRetry}>
              {retryLabel}
            </Button>
          )}
          {action}
        </div>
      )}
    </section>
  )
}

export { ErrorState, type ErrorStateProps }
