import * as React from "react"

import { LoadingSpinner } from "@/components/common/loading-spinner"
import { cn } from "@/lib/utils"

const loadingStateVariants = {
  inline: "min-h-20 flex-row",
  panel: "min-h-48 flex-col rounded-lg border bg-card p-6 text-card-foreground",
  page: "min-h-[50vh] flex-col px-6 py-12",
} as const

type LoadingStateProps = Omit<React.ComponentProps<"div">, "children"> & {
  description?: React.ReactNode
  message?: React.ReactNode
  variant?: keyof typeof loadingStateVariants
}

function LoadingState({
  className,
  description,
  message = "Loading…",
  variant = "panel",
  ...props
}: LoadingStateProps) {
  return (
    <div
      data-slot="loading-state"
      {...props}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-busy="true"
      className={cn(
        "flex items-center justify-center gap-3 text-center",
        loadingStateVariants[variant],
        className
      )}
    >
      <LoadingSpinner decorative size={variant === "page" ? "lg" : "md"} />
      <div className="space-y-1">
        <p className="font-medium text-foreground">{message}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}

export { LoadingState, type LoadingStateProps }
