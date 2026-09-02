import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusTone = "negative" | "neutral" | "positive" | "warning"

const statusTones: Record<string, StatusTone> = {
  active: "positive",
  approved: "positive",
  completed: "positive",
  enabled: "positive",
  published: "positive",
  resolved: "positive",
  sent: "positive",
  success: "positive",
  archived: "neutral",
  closed: "neutral",
  disabled: "neutral",
  draft: "neutral",
  inactive: "neutral",
  cancelled: "negative",
  deleted: "negative",
  error: "negative",
  failed: "negative",
  rejected: "negative",
  spam: "negative",
  contacted: "warning",
  "in-progress": "warning",
  new: "warning",
  pending: "warning",
  scheduled: "warning",
  review: "warning",
}

const toneStyles: Record<StatusTone, string> = {
  positive: "bg-primary text-primary-foreground",
  neutral: "bg-secondary text-secondary-foreground",
  warning: "border-border bg-muted text-foreground",
  negative: "bg-destructive/10 text-destructive",
}

type StatusBadgeProps = Omit<
  React.ComponentProps<typeof Badge>,
  "children" | "variant"
> & {
  label?: React.ReactNode
  status: string
  tone?: StatusTone
}

function humanizeStatus(status: string) {
  return status
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function normalizeStatus(status: string) {
  return status.trim().toLowerCase().replace(/[\s_]+/g, "-")
}

function StatusBadge({
  className,
  label,
  status,
  tone,
  ...props
}: StatusBadgeProps) {
  const normalizedStatus = normalizeStatus(status)
  const resolvedTone = tone ?? statusTones[normalizedStatus] ?? "neutral"

  return (
    <Badge
      data-slot="status-badge"
      variant="outline"
      className={cn(toneStyles[resolvedTone], className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full bg-current opacity-70"
      />
      {label ?? humanizeStatus(status)}
    </Badge>
  )
}

export { StatusBadge, type StatusBadgeProps, type StatusTone }
