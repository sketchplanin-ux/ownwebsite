"use client";

import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code2,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  Unlink,
} from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { isSafeHttpUrl, isSafeLinkUrl } from "@/lib/url";
import { cn } from "@/lib/utils";
import type { TipTapDocument } from "@/types/blog";

interface RichTextEditorProps {
  disabled?: boolean;
  error?: boolean;
  onChange: (document: TipTapDocument) => void;
  value: TipTapDocument;
}

interface ToolbarButtonProps {
  active?: boolean;
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}

function ToolbarButton({
  active = false,
  children,
  disabled,
  label,
  onClick,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant={active ? "secondary" : "ghost"}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function RichTextEditor({
  disabled = false,
  error = false,
  onChange,
  value,
}: RichTextEditorProps) {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    content: value,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          autolink: false,
          openOnClick: false,
          isAllowedUri: (url) => isSafeLinkUrl(url),
          HTMLAttributes: {
            rel: "noopener noreferrer",
          },
        },
      }),
      Image.configure({ inline: false }),
      Placeholder.configure({
        placeholder: "Write the article content…",
      }),
    ],
    editorProps: {
      attributes: {
        "aria-label": "Article content",
        class:
          "min-h-80 px-4 py-4 text-sm leading-7 outline-none [&_.is-editor-empty:first-child:before]:pointer-events-none [&_.is-editor-empty:first-child:before]:float-left [&_.is-editor-empty:first-child:before]:h-0 [&_.is-editor-empty:first-child:before]:text-muted-foreground [&_.is-editor-empty:first-child:before]:content-[attr(data-placeholder)] [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_h4]:text-lg [&_h4]:font-semibold [&_hr]:my-6 [&_img]:my-5 [&_img]:max-w-full [&_img]:rounded-lg [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-4 [&_ul]:list-disc [&_ul]:pl-6",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChangeRef.current(currentEditor.getJSON() as TipTapDocument);
    },
  });

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) {
    return (
      <div
        role="status"
        className="flex min-h-80 items-center justify-center rounded-lg border text-sm text-muted-foreground"
      >
        Loading editor…
      </div>
    );
  }

  const editLink = () => {
    const previousHref = editor.getAttributes("link").href;
    const href = window.prompt(
      "Enter an HTTP(S) URL or same-site path:",
      typeof previousHref === "string" ? previousHref : "https://",
    );
    if (href === null) {
      return;
    }
    const normalizedHref = href.trim();
    if (!normalizedHref) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    if (!isSafeLinkUrl(normalizedHref)) {
      toast.error("Use an HTTP(S) URL or a same-site path beginning with /, #, or ?.");
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: normalizedHref })
      .run();
  };

  const insertImage = () => {
    const source = window.prompt("Enter an HTTP(S) image URL:", "https://");
    if (source === null) {
      return;
    }
    const normalizedSource = source.trim();
    if (!isSafeHttpUrl(normalizedSource)) {
      toast.error("Use a valid HTTP or HTTPS image URL.");
      return;
    }
    const alternativeText = window.prompt(
      "Describe the image for screen-reader users:",
      "",
    );
    if (alternativeText === null) {
      return;
    }
    if (!alternativeText.trim()) {
      toast.error("Image alternative text is required.");
      return;
    }
    editor
      .chain()
      .focus()
      .setImage({ src: normalizedSource, alt: alternativeText.trim() })
      .run();
  };

  const toolbarDisabled = disabled || !editor.isEditable;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-background",
        error && "border-destructive ring-3 ring-destructive/20",
        disabled && "opacity-65",
      )}
    >
      <div
        role="toolbar"
        aria-label="Rich-text formatting"
        className="flex flex-wrap gap-1 border-b bg-muted/40 p-2"
      >
        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          disabled={toolbarDisabled}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          disabled={toolbarDisabled}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          active={editor.isActive("underline")}
          disabled={toolbarDisabled}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Strikethrough"
          active={editor.isActive("strike")}
          disabled={toolbarDisabled}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading level 2"
          active={editor.isActive("heading", { level: 2 })}
          disabled={toolbarDisabled}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading level 3"
          active={editor.isActive("heading", { level: 3 })}
          disabled={toolbarDisabled}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Bulleted list"
          active={editor.isActive("bulletList")}
          disabled={toolbarDisabled}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive("orderedList")}
          disabled={toolbarDisabled}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Block quote"
          active={editor.isActive("blockquote")}
          disabled={toolbarDisabled}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Code block"
          active={editor.isActive("codeBlock")}
          disabled={toolbarDisabled}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code2 aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Horizontal rule"
          disabled={toolbarDisabled}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Add or edit link"
          active={editor.isActive("link")}
          disabled={toolbarDisabled}
          onClick={editLink}
        >
          <Link2 aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Remove link"
          disabled={toolbarDisabled || !editor.isActive("link")}
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <Unlink aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Insert image by URL"
          disabled={toolbarDisabled}
          onClick={insertImage}
        >
          <ImagePlus aria-hidden="true" />
        </ToolbarButton>
        <span aria-hidden="true" className="mx-1 w-px bg-border" />
        <ToolbarButton
          label="Undo"
          disabled={toolbarDisabled || !editor.can().chain().focus().undo().run()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          disabled={toolbarDisabled || !editor.can().chain().focus().redo().run()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 aria-hidden="true" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
