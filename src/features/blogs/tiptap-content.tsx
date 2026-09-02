import * as React from "react"

import { ResponsiveImage } from "@/components/website/responsive-image"
import { sanitizeLinkUrl } from "@/lib/url"
import { cn } from "@/lib/utils"
import type { JsonValue } from "@/types/common"
import type { TipTapDocument, TipTapMark, TipTapNode } from "@/types/blog"

interface TipTapContentProps {
  className?: string
  document?: TipTapDocument | null
}

function readStringAttribute(
  attributes: Record<string, JsonValue> | undefined,
  name: string
): string | null {
  const value = attributes?.[name]
  return typeof value === "string" ? value : null
}

function readNumberAttribute(
  attributes: Record<string, JsonValue> | undefined,
  name: string
): number | undefined {
  const value = attributes?.[name]
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined
}

function readPlainText(node: TipTapNode): string {
  if (node.type === "text") {
    return node.text ?? ""
  }

  return (Array.isArray(node.content) ? node.content : [])
    .map(readPlainText)
    .join("")
}

function renderMarkedText(text: string, marks: TipTapMark[] = []) {
  let output: React.ReactNode = text

  const safeMarks = Array.isArray(marks) ? marks : []
  for (const mark of [...safeMarks].reverse()) {
    switch (mark.type) {
      case "bold":
      case "strong":
        output = <strong>{output}</strong>
        break
      case "italic":
      case "em":
        output = <em>{output}</em>
        break
      case "strike":
        output = <s>{output}</s>
        break
      case "underline":
        output = <span className="underline underline-offset-2">{output}</span>
        break
      case "code":
        output = (
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]">
            {output}
          </code>
        )
        break
      case "link": {
        const href = sanitizeLinkUrl(
          readStringAttribute(mark.attrs, "href") ?? ""
        )
        if (href) {
          const isExternal = href.startsWith("http://") || href.startsWith("https://")
          output = (
            <a
              href={href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="font-medium underline decoration-current/40 underline-offset-4 hover:decoration-current"
            >
              {output}
            </a>
          )
        }
        break
      }
      default:
        break
    }
  }

  return output
}

function renderChildren(nodes: TipTapNode[] | undefined, path: string) {
  return (Array.isArray(nodes) ? nodes : []).map((node, index) => (
    <React.Fragment key={`${path}-${index}`}>
      {renderNode(node, `${path}-${index}`)}
    </React.Fragment>
  ))
}

function renderHeading(node: TipTapNode, path: string) {
  const content = renderChildren(node.content, path)
  const level = readNumberAttribute(node.attrs, "level")

  if (level === 3) {
    return <h3>{content}</h3>
  }
  if (level === 4) {
    return <h4>{content}</h4>
  }
  if (level === 5) {
    return <h5>{content}</h5>
  }
  if (level === 6) {
    return <h6>{content}</h6>
  }

  return <h2>{content}</h2>
}

function renderNode(node: TipTapNode, path: string): React.ReactNode {
  switch (node.type) {
    case "doc":
      return renderChildren(node.content, path)
    case "text":
      return renderMarkedText(node.text ?? "", node.marks)
    case "paragraph":
      return <p>{renderChildren(node.content, path)}</p>
    case "heading":
      return renderHeading(node, path)
    case "bulletList":
      return <ul>{renderChildren(node.content, path)}</ul>
    case "orderedList":
      return <ol>{renderChildren(node.content, path)}</ol>
    case "listItem":
      return <li>{renderChildren(node.content, path)}</li>
    case "blockquote":
      return <blockquote>{renderChildren(node.content, path)}</blockquote>
    case "codeBlock":
      return (
        <pre>
          <code>{readPlainText(node)}</code>
        </pre>
      )
    case "hardBreak":
      return <br />
    case "horizontalRule":
      return <hr />
    case "image": {
      const source = readStringAttribute(node.attrs, "src")
      if (!source) {
        return null
      }

      return (
        <ResponsiveImage
          src={source}
          alt={readStringAttribute(node.attrs, "alt") ?? "Article illustration"}
          title={readStringAttribute(node.attrs, "title") ?? undefined}
          width={readNumberAttribute(node.attrs, "width")}
          height={readNumberAttribute(node.attrs, "height")}
          sizes="(max-width: 768px) 100vw, 768px"
          className="my-8 w-full rounded-xl object-cover"
        />
      )
    }
    default:
      return null
  }
}

function TipTapContent({ className, document }: TipTapContentProps) {
  if (!document || document.type !== "doc") {
    return null
  }

  return (
    <div
      data-slot="tiptap-content"
      className={cn(
        "space-y-5 text-base leading-8 text-foreground/90 [&_a]:focus-visible:rounded-sm [&_a]:focus-visible:ring-2 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-5 [&_blockquote]:text-muted-foreground [&_h2]:pt-5 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:pt-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h4]:pt-3 [&_h4]:text-lg [&_h4]:font-semibold [&_h5]:font-semibold [&_h6]:font-semibold [&_hr]:my-10 [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-muted [&_pre]:p-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6",
        className
      )}
    >
      {renderNode(document, "document")}
    </div>
  )
}

export { TipTapContent, type TipTapContentProps }
