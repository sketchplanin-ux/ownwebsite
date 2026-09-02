import Image from "next/image"

import { cn } from "@/lib/utils"

interface AdminBrandProps {
  className?: string
  compact?: boolean
  tone?: "default" | "inverse"
}

function AdminBrand({
  className,
  compact = false,
  tone = "default",
}: AdminBrandProps) {
  const inverse = tone === "inverse"

  return (
    <div
      data-slot="admin-brand"
      className={cn("flex min-w-0 items-center gap-3", className)}
    >
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-lg border p-1.5",
          inverse
            ? "border-white/15 bg-white/5"
            : "border-border bg-muted/60"
        )}
      >
        <Image
          src="/brand/sketchplan-mark.png"
          alt=""
          width={compact ? 25 : 34}
          height={compact ? 28 : 38}
          priority
          unoptimized
          className="object-contain"
        />
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block truncate font-heading font-semibold tracking-[0.12em]",
            compact ? "text-sm" : "text-base",
            inverse ? "text-white" : "text-foreground"
          )}
        >
          SKETCHPLAN
        </span>
        {!compact && (
          <span
            className={cn(
              "mt-0.5 block truncate font-mono text-[0.6rem] tracking-[0.2em] uppercase",
              inverse ? "text-slate-400" : "text-muted-foreground"
            )}
          >
            Control studio
          </span>
        )}
      </span>
    </div>
  )
}

export { AdminBrand, type AdminBrandProps }
