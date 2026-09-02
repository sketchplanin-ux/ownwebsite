"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { LoadingSpinner } from "@/components/common/loading-spinner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PaginationControlsProps = Omit<
  React.ComponentProps<"nav">,
  "children"
> & {
  currentPage: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  isLoading?: boolean
  label?: string
  nextLabel?: string
  onNextPage: () => void
  onPreviousPage: () => void
  previousLabel?: string
  totalPages?: number
}

function PaginationControls({
  className,
  currentPage,
  hasNextPage,
  hasPreviousPage,
  isLoading = false,
  label = "Pagination",
  nextLabel = "Next",
  onNextPage,
  onPreviousPage,
  previousLabel = "Previous",
  totalPages,
  ...props
}: PaginationControlsProps) {
  const safeCurrentPage = Math.max(1, Math.floor(currentPage))
  const safeTotalPages =
    totalPages === undefined
      ? undefined
      : Math.max(safeCurrentPage, Math.floor(totalPages))
  const pageStatus = safeTotalPages
    ? `Page ${safeCurrentPage} of ${safeTotalPages}`
    : `Page ${safeCurrentPage}`

  return (
    <nav
      data-slot="pagination-controls"
      aria-label={label}
      aria-busy={isLoading}
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        className
      )}
      {...props}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!hasPreviousPage || isLoading}
        aria-label={`${previousLabel} page`}
        onClick={onPreviousPage}
      >
        <ChevronLeftIcon aria-hidden="true" />
        <span className="hidden sm:inline">{previousLabel}</span>
      </Button>

      <span
        className="inline-flex min-w-24 items-center justify-center gap-2 text-sm text-muted-foreground"
        aria-live="polite"
        aria-atomic="true"
      >
        {isLoading && <LoadingSpinner decorative size="sm" />}
        {pageStatus}
      </span>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!hasNextPage || isLoading}
        aria-label={`${nextLabel} page`}
        onClick={onNextPage}
      >
        <span className="hidden sm:inline">{nextLabel}</span>
        <ChevronRightIcon aria-hidden="true" />
      </Button>
    </nav>
  )
}

export { PaginationControls, type PaginationControlsProps }
