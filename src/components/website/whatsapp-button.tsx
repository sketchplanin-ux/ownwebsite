import * as React from "react"
import { MessageCircleIcon } from "lucide-react"

import { buildWhatsAppUrl } from "@/lib/url"
import { cn } from "@/lib/utils"

type WhatsAppButtonProps = Omit<
  React.ComponentProps<"a">,
  "children" | "href"
> & {
  label?: string
  message?: string
  phoneNumber?: string | null
  showLabel?: boolean
}

function WhatsAppButton({
  "aria-label": ariaLabel,
  className,
  label = "Chat with SKETCHPLAN on WhatsApp",
  message,
  phoneNumber,
  rel,
  showLabel = false,
  target = "_blank",
  title,
  ...props
}: WhatsAppButtonProps) {
  const href = buildWhatsAppUrl(phoneNumber ?? "", message)

  if (!href) {
    return null
  }

  return (
    <a
      data-slot="whatsapp-button"
      href={href}
      target={target}
      rel={rel ? `${rel} noopener noreferrer` : "noopener noreferrer"}
      aria-label={ariaLabel ?? label}
      title={title ?? label}
      className={cn(
        "fixed right-4 bottom-4 z-40 inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:right-6 sm:bottom-6",
        showLabel && "sm:px-4",
        className
      )}
      {...props}
    >
      <MessageCircleIcon aria-hidden="true" className="size-5" />
      {showLabel && <span>{label}</span>}
    </a>
  )
}

export { WhatsAppButton, type WhatsAppButtonProps }
