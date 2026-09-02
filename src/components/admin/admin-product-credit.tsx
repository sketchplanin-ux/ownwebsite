import Image from "next/image"

import { cn } from "@/lib/utils"

interface AdminProductCreditProps {
  className?: string
  inverse?: boolean
}

function AdminProductCredit({
  className,
  inverse = false,
}: AdminProductCreditProps) {
  return (
    <div
      data-slot="admin-product-credit"
      className={cn(
        "rounded-lg border p-3",
        inverse
          ? "border-white/10 bg-white/[0.035]"
          : "border-border bg-muted/40",
        className
      )}
    >
      <div className={cn("w-fit", inverse && "rounded bg-white/95 p-1.5")}>
        <Image
          src="/brand/creative-link.png"
          alt=""
          width={614}
          height={139}
          unoptimized
          className="h-auto w-24 object-contain object-left"
        />
      </div>
      <p
        className={cn(
          "mt-2 font-mono text-[0.6rem] tracking-[0.14em] uppercase",
          inverse ? "text-slate-400" : "text-muted-foreground"
        )}
      >
        Product by Creative Link
      </p>
    </div>
  )
}

export { AdminProductCredit, type AdminProductCreditProps }
