import * as React from "react"

import { isSafeGoogleMapsEmbedUrl } from "@/lib/url"
import { cn } from "@/lib/utils"

type GoogleMapProps = Omit<
  React.ComponentProps<"iframe">,
  "loading" | "src" | "title"
> & {
  embedUrl?: string | null
  title?: string
}

function GoogleMap({
  allowFullScreen = true,
  className,
  embedUrl,
  height = 420,
  referrerPolicy = "no-referrer-when-downgrade",
  title = "SKETCHPLAN office location",
  width = "100%",
  ...props
}: GoogleMapProps) {
  const src = embedUrl?.trim() ?? ""

  if (!isSafeGoogleMapsEmbedUrl(src)) {
    return null
  }

  const accessibleTitle = title.trim() || "Location map"

  return (
    <iframe
      data-slot="google-map"
      src={src}
      title={accessibleTitle}
      loading="lazy"
      allowFullScreen={allowFullScreen}
      referrerPolicy={referrerPolicy}
      width={width}
      height={height}
      className={cn(
        "min-h-80 w-full rounded-xl border-0 bg-muted",
        className
      )}
      {...props}
    />
  )
}

export { GoogleMap, type GoogleMapProps }
