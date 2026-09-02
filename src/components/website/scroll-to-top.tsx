"use client"

import * as React from "react"
import { ArrowUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type ScrollToTopProps = Omit<
  React.ComponentProps<"button">,
  "children" | "onClick" | "type"
> & {
  behavior?: ScrollBehavior
  label?: string
  threshold?: number
}

function ScrollToTop({
  "aria-label": ariaLabel,
  behavior = "smooth",
  className,
  label = "Scroll to top",
  threshold = 480,
  title,
  ...props
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const safeThreshold = Number.isFinite(threshold)
      ? Math.max(0, threshold)
      : 480
    const updateVisibility = () => {
      setIsVisible(window.scrollY > safeThreshold)
    }

    updateVisibility()
    window.addEventListener("scroll", updateVisibility, { passive: true })

    return () => window.removeEventListener("scroll", updateVisibility)
  }, [threshold])

  if (!isVisible) {
    return null
  }

  const scrollToTop = () => {
    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : behavior })
  }

  return (
    <button
      data-slot="scroll-to-top"
      type="button"
      aria-label={ariaLabel ?? label}
      title={title ?? label}
      className={cn(
        "fixed right-4 bottom-20 z-40 inline-flex size-11 items-center justify-center rounded-full border bg-background text-foreground shadow-md transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:right-6 sm:bottom-24",
        className
      )}
      onClick={scrollToTop}
      {...props}
    >
      <ArrowUpIcon aria-hidden="true" className="size-5" />
    </button>
  )
}

export { ScrollToTop, type ScrollToTopProps }
