"use client"

import * as React from "react"
import { Clock3Icon } from "lucide-react"

import { cn } from "@/lib/utils"

const DATE_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
})

const TIME_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
})

interface AdminClockProps {
  className?: string
}

function AdminClock({ className }: AdminClockProps) {
  const [now, setNow] = React.useState<Date | null>(null)

  React.useEffect(() => {
    const updateClock = () => setNow(new Date())
    updateClock()
    const timer = window.setInterval(updateClock, 1_000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div
      data-slot="admin-clock"
      className={cn("flex items-center gap-2.5", className)}
      aria-label="Current time in Asia/Kolkata"
    >
      <Clock3Icon aria-hidden="true" className="size-4 text-muted-foreground" />
      <div className="min-w-0 text-right leading-tight">
        <p className="truncate text-xs font-medium text-foreground">
          {now ? DATE_FORMATTER.format(now) : "India standard time"}
        </p>
        <time
          dateTime={now?.toISOString()}
          className="font-mono text-[0.65rem] tracking-[0.08em] text-muted-foreground uppercase"
        >
          {now ? `${TIME_FORMATTER.format(now)} · IST` : "--:--:-- · IST"}
        </time>
      </div>
    </div>
  )
}

export { AdminClock, type AdminClockProps }
