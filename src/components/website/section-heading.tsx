import * as React from "react"

import { cn } from "@/lib/utils"

const HEADING_TAGS = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
} as const

type SectionHeadingProps = Omit<React.ComponentProps<"header">, "title"> & {
  align?: "center" | "left"
  description?: React.ReactNode
  eyebrow?: React.ReactNode
  headingLevel?: keyof typeof HEADING_TAGS
  title: React.ReactNode
}

function SectionHeading({
  align = "left",
  className,
  description,
  eyebrow,
  headingLevel = 2,
  title,
  ...props
}: SectionHeadingProps) {
  if (
    title === null ||
    title === undefined ||
    title === false ||
    (typeof title === "string" && title.trim() === "")
  ) {
    return null
  }

  const Heading = HEADING_TAGS[headingLevel] ?? "h2"

  return (
    <header
      data-slot="section-heading"
      className={cn(
        "space-y-3",
        align === "center" && "mx-auto max-w-3xl text-center",
        className
      )}
      {...props}
    >
      {eyebrow && (
        <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
          {eyebrow}
        </p>
      )}
      <Heading className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </Heading>
      {description && (
        <p
          className={cn(
            "max-w-2xl text-base leading-7 text-pretty text-muted-foreground sm:text-lg",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      )}
    </header>
  )
}

export { SectionHeading, type SectionHeadingProps }
