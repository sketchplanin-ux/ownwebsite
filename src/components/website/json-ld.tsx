import * as React from "react"

const JSON_LD_ESCAPE_MAP = {
  "&": "\\u0026",
  "<": "\\u003c",
  ">": "\\u003e",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
} as const

type JsonLdProps = Omit<
  React.ComponentProps<"script">,
  "children" | "dangerouslySetInnerHTML" | "type"
> & {
  data?: unknown
}

function serializeJsonLd(data: unknown): string | null {
  if (data === null || typeof data !== "object") {
    return null
  }

  try {
    const serialized = JSON.stringify(data)

    if (!serialized) {
      return null
    }

    return serialized.replace(
      /[<>&\u2028\u2029]/g,
      (character) =>
        JSON_LD_ESCAPE_MAP[character as keyof typeof JSON_LD_ESCAPE_MAP]
    )
  } catch {
    return null
  }
}

function JsonLd({ data, ...props }: JsonLdProps) {
  const serialized = serializeJsonLd(data)

  if (!serialized) {
    return null
  }

  return (
    <script
      data-slot="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialized }}
      {...props}
    />
  )
}

export { JsonLd, serializeJsonLd, type JsonLdProps }
