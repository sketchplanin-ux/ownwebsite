import * as React from "react"
import { LoaderCircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const spinnerSizes = {
  sm: "size-4",
  md: "size-6",
  lg: "size-10",
} as const

type LoadingSpinnerProps = Omit<React.ComponentProps<"span">, "children"> & {
  decorative?: boolean
  label?: string
  size?: keyof typeof spinnerSizes
}

function LoadingSpinner({
  className,
  decorative = false,
  label = "Loading",
  size = "md",
  ...props
}: LoadingSpinnerProps) {
  return (
    <span
      data-slot="loading-spinner"
      {...props}
      role={decorative ? undefined : "status"}
      aria-live={decorative ? undefined : "polite"}
      aria-hidden={decorative || undefined}
      className={cn("inline-flex shrink-0", className)}
    >
      <LoaderCircleIcon
        aria-hidden="true"
        className={cn("animate-spin motion-reduce:animate-none", spinnerSizes[size])}
      />
      {!decorative && <span className="sr-only">{label}</span>}
    </span>
  )
}

export { LoadingSpinner, type LoadingSpinnerProps }
