"use client";

/* eslint-disable @next/next/no-img-element */

import CodeMirror, { EditorView, type ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { type Diagnostic, lintGutter, linter } from "@codemirror/lint";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Bold,
  Braces,
  Code,
  Eye,
  FileCode2,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

export type MdxEditorImage = {
  id: string;
  safeName: string;
  previewUrl: string;
};

type EditorMode = "source" | "preview";

export type MdxEditorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  images: MdxEditorImage[];
  existingImageBaseUrl?: string;
  onImagesAdded: (files: File[]) => MdxEditorImage[];
};

const editorTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "#000000",
      color: "#f5f5f5",
      fontSize: "14px",
    },
    ".cm-scroller": {
      fontFamily: "var(--font-noto-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      lineHeight: "1.65",
    },
    ".cm-content": {
      caretColor: "#c3d9f3",
      minHeight: "520px",
      padding: "14px 0",
    },
    ".cm-line": {
      padding: "0 14px",
    },
    ".cm-focused": {
      outline: "none",
    },
    ".cm-focused .cm-cursor": {
      borderLeftColor: "#c3d9f3",
    },
    ".cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: "rgba(195, 217, 243, 0.24)",
    },
    ".cm-activeLine": {
      backgroundColor: "rgba(255, 255, 255, 0.035)",
    },
    ".cm-gutters": {
      backgroundColor: "#000000",
      borderRight: "1px solid #262626",
      color: "#666666",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "rgba(255, 255, 255, 0.035)",
      color: "#d4d4d8",
    },
    ".cm-placeholder": {
      color: "#666666",
    },
    ".cm-diagnosticText": {
      color: "#f5f5f5",
    },
    ".cm-tooltip": {
      backgroundColor: "#0a0a0a",
      border: "1px solid #262626",
      color: "#f5f5f5",
    },
  },
  { dark: true },
);

const editorExtensions = [
  markdown({ base: markdownLanguage }),
  lintGutter(),
  linter((view) => getMarkdownDiagnostics(view.state.doc.toString()), { delay: 500 }),
  editorTheme,
];

export function MdxEditor({
  label,
  value,
  onChange,
  placeholder = "Write in Markdown.",
  images,
  existingImageBaseUrl = "",
  onImagesAdded,
}: MdxEditorProps) {
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<EditorMode>("source");
  const [dragActive, setDragActive] = useState(false);
  const [dropMessage, setDropMessage] = useState("");

  const stagedImageUrls = useMemo(
    () => new Map(images.map((image) => [image.safeName, image.previewUrl])),
    [images],
  );

  const resolvePreviewImageSource = useCallback(
    (source: string | undefined) => {
      if (!source) {
        return "";
      }

      const trimmed = source.trim();

      if (/^(https?:|data:|blob:)/i.test(trimmed)) {
        return trimmed;
      }

      const imageName = imageNameFromMarkdownSource(trimmed);
      const stagedUrl = imageName ? stagedImageUrls.get(imageName) : undefined;

      if (stagedUrl) {
        return stagedUrl;
      }

      if (imageName && existingImageBaseUrl) {
        return `${existingImageBaseUrl.replace(/\/+$/, "")}/${encodeURIComponent(imageName)}`;
      }

      return trimmed;
    },
    [existingImageBaseUrl, stagedImageUrls],
  );

  const previewComponents = useMemo<Components>(
    () => ({
      img({ src, alt, title }) {
        return (
          <img
            src={resolvePreviewImageSource(src)}
            alt={alt ?? ""}
            title={title}
            className="mx-auto max-w-full border border-zinc-800"
          />
        );
      },
      a({ href, children }) {
        const external = href ? /^https?:\/\//i.test(href) : false;

        return (
          <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
            {children}
          </a>
        );
      },
    }),
    [resolvePreviewImageSource],
  );

  const previewWarnings = useMemo(() => getPreviewWarnings(value), [value]);

  function focusEditor() {
    window.requestAnimationFrame(() => {
      editorRef.current?.view?.focus();
    });
  }

  function replaceRange(from: number, to: number, insert: string, selectionFrom?: number, selectionTo?: number) {
    const view = editorRef.current?.view;

    if (!view) {
      onChange(`${value.slice(0, from)}${insert}${value.slice(to)}`);
      return;
    }

    view.dispatch({
      changes: { from, to, insert },
      selection:
        typeof selectionFrom === "number"
          ? { anchor: selectionFrom, head: typeof selectionTo === "number" ? selectionTo : selectionFrom }
          : { anchor: from + insert.length },
      scrollIntoView: true,
    });
    focusEditor();
  }

  function insertSnippet(snippet: string, position?: number) {
    const view = editorRef.current?.view;

    if (!view) {
      onChange(`${value}${snippet}`);
      return;
    }

    const selection = view.state.selection.main;
    const from = typeof position === "number" ? position : selection.from;
    const to = typeof position === "number" ? position : selection.to;

    replaceRange(from, to, snippet);
  }

  function wrapSelection(prefix: string, suffix: string, placeholderText: string) {
    const view = editorRef.current?.view;

    if (!view) {
      onChange(`${value}${prefix}${placeholderText}${suffix}`);
      return;
    }

    const selection = view.state.selection.main;
    const selectedText = view.state.sliceDoc(selection.from, selection.to);
    const content = selectedText || placeholderText;
    const replacement = `${prefix}${content}${suffix}`;
    const contentStart = selection.from + prefix.length;
    const contentEnd = contentStart + content.length;

    replaceRange(selection.from, selection.to, replacement, contentStart, selectedText ? contentEnd : contentEnd);
  }

  function insertCodeBlock() {
    const view = editorRef.current?.view;

    if (!view) {
      onChange(`${value}\n\n\`\`\`\ncode\n\`\`\`\n`);
      return;
    }

    const selection = view.state.selection.main;
    const selectedText = view.state.sliceDoc(selection.from, selection.to) || "code";
    const leadingBreak = needsLeadingBreak(view.state.sliceDoc(0, selection.from)) ? "\n\n" : "";
    const trailingBreak = needsTrailingBreak(view.state.sliceDoc(selection.to)) ? "\n" : "";
    const replacement = `${leadingBreak}\`\`\`\n${selectedText}\n\`\`\`\n${trailingBreak}`;
    const contentStart = selection.from + leadingBreak.length + 4;
    const contentEnd = contentStart + selectedText.length;

    replaceRange(selection.from, selection.to, replacement, contentStart, contentEnd);
  }

  function insertLink() {
    const view = editorRef.current?.view;

    if (!view) {
      onChange(`${value}[link text](https://example.com)`);
      return;
    }

    const selection = view.state.selection.main;
    const selectedText = view.state.sliceDoc(selection.from, selection.to) || "link text";
    const replacement = `[${selectedText}](https://example.com)`;
    const urlStart = selection.from + selectedText.length + 3;
    const urlEnd = urlStart + "https://example.com".length;

    replaceRange(selection.from, selection.to, replacement, urlStart, urlEnd);
  }

  function applyLinePrefix(prefix: string, placeholderText: string, options?: { ordered?: boolean; heading?: boolean }) {
    const view = editorRef.current?.view;

    if (!view) {
      onChange(`${value}\n${prefix}${placeholderText}`);
      return;
    }

    const selection = view.state.selection.main;
    const fromLine = view.state.doc.lineAt(selection.from);
    const toLine = view.state.doc.lineAt(selection.to);
    const lines = [];

    for (let lineNumber = fromLine.number; lineNumber <= toLine.number; lineNumber += 1) {
      const line = view.state.doc.line(lineNumber);
      const baseText = options?.heading ? line.text.replace(/^#{1,6}\s+/, "") : line.text;
      const linePrefix = options?.ordered ? `${lineNumber - fromLine.number + 1}. ` : prefix;
      const text = baseText || (fromLine.number === toLine.number ? placeholderText : "");
      lines.push(`${linePrefix}${text}`);
    }

    const replacement = lines.join("\n");
    const contentStart = fromLine.from + prefix.length;
    const contentEnd = contentStart + (lines[0]?.replace(prefix, "").length ?? 0);

    replaceRange(fromLine.from, toLine.to, replacement, contentStart, contentEnd);
  }

  function handleImageInputChange(event: ChangeEvent<HTMLInputElement>) {
    insertImageFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function insertImageFiles(files: File[], position?: number) {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      setDropMessage("Only image files can be added here.");
      return;
    }

    const addedImages = onImagesAdded(imageFiles);

    if (addedImages.length === 0) {
      setDropMessage("No image files were added.");
      return;
    }

    const snippets = addedImages.map((image) => buildImageMarkdown(image)).join("\n");
    insertSnippet(`\n\n${snippets}\n`, position);
    setDropMessage(`${addedImages.length} image${addedImages.length === 1 ? "" : "s"} added.`);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);

    const files = Array.from(event.dataTransfer.files ?? []);
    const dropPosition = editorRef.current?.view?.posAtCoords({
      x: event.clientX,
      y: event.clientY,
    });

    insertImageFiles(files, typeof dropPosition === "number" ? dropPosition : undefined);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setDragActive(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setDragActive(false);
    }
  }

  return (
    <section className="border border-zinc-900 bg-black">
      <div className="flex flex-col gap-3 border-b border-zinc-900 p-4 md:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="font-mono text-lg font-normal text-zinc-50">{label}</h2>
            <p className="mt-1 text-sm text-zinc-500">Text-based Markdown with syntax highlighting.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ToolbarButton label="Source" active={mode === "source"} onClick={() => setMode("source")}>
              <FileCode2 />
            </ToolbarButton>
            <ToolbarButton label="Preview" active={mode === "preview"} onClick={() => setMode("preview")}>
              <Eye />
            </ToolbarButton>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 border border-zinc-900 bg-zinc-950/50 p-1">
          <ToolbarButton
            label="Heading 2"
            disabled={mode === "preview"}
            onClick={() => applyLinePrefix("## ", "Heading", { heading: true })}
          >
            <Heading2 />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 3"
            disabled={mode === "preview"}
            onClick={() => applyLinePrefix("### ", "Heading", { heading: true })}
          >
            <Heading3 />
          </ToolbarButton>
          <ToolbarButton label="Bold" disabled={mode === "preview"} onClick={() => wrapSelection("**", "**", "bold text")}>
            <Bold />
          </ToolbarButton>
          <ToolbarButton label="Italic" disabled={mode === "preview"} onClick={() => wrapSelection("_", "_", "italic text")}>
            <Italic />
          </ToolbarButton>
          <ToolbarButton label="Quote" disabled={mode === "preview"} onClick={() => applyLinePrefix("> ", "Quote")}>
            <Quote />
          </ToolbarButton>
          <ToolbarButton
            label="Unordered list"
            disabled={mode === "preview"}
            onClick={() => applyLinePrefix("- ", "List item")}
          >
            <List />
          </ToolbarButton>
          <ToolbarButton
            label="Ordered list"
            disabled={mode === "preview"}
            onClick={() => applyLinePrefix("1. ", "List item", { ordered: true })}
          >
            <ListOrdered />
          </ToolbarButton>
          <ToolbarButton label="Inline code" disabled={mode === "preview"} onClick={() => wrapSelection("`", "`", "code")}>
            <Code />
          </ToolbarButton>
          <ToolbarButton label="Code block" disabled={mode === "preview"} onClick={insertCodeBlock}>
            <Braces />
          </ToolbarButton>
          <ToolbarButton label="Link" disabled={mode === "preview"} onClick={insertLink}>
            <Link2 />
          </ToolbarButton>
          <ToolbarButton
            label="Horizontal rule"
            disabled={mode === "preview"}
            onClick={() => insertSnippet("\n\n---\n\n")}
          >
            <Minus />
          </ToolbarButton>
          <ToolbarButton label="Image" disabled={mode === "preview"} onClick={() => imageInputRef.current?.click()}>
            <ImagePlus />
          </ToolbarButton>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={handleImageInputChange}
          />
        </div>
      </div>

      <div
        className="relative"
        onDrop={mode === "preview" ? undefined : handleDrop}
        onDragOver={mode === "preview" ? undefined : handleDragOver}
        onDragLeave={mode === "preview" ? undefined : handleDragLeave}
      >
        {mode !== "preview" ? (
          <div className="min-w-0">
            <CodeMirror
              ref={editorRef}
              value={value}
              height="620px"
              minHeight="520px"
              basicSetup={{
                foldGutter: false,
                highlightActiveLine: true,
                highlightSelectionMatches: true,
              }}
              theme="dark"
              extensions={editorExtensions}
              indentWithTab={false}
              placeholder={placeholder}
              onChange={onChange}
              className="border-0"
            />
          </div>
        ) : null}

        {mode !== "source" ? (
          <div className="min-h-[520px] min-w-0 bg-black p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-zinc-900 pb-3">
              <h3 className="font-mono text-sm font-normal uppercase tracking-[0.16em] text-zinc-400">Preview</h3>
              <p className="font-mono text-xs text-zinc-600">{value.trim() ? "Markdown" : "Empty"}</p>
            </div>

            {previewWarnings.length > 0 ? (
              <div className="mb-4 border border-amber-900/70 bg-amber-950/20 p-3 text-sm text-amber-100">
                {previewWarnings.join(" ")}
              </div>
            ) : null}

            {value.trim() ? (
              <div
                className={cn(
                  "prose prose-invert max-w-none",
                  "prose-headings:font-mono prose-headings:font-normal prose-headings:tracking-[0.02em]",
                  "prose-a:text-[#c3d9f3] prose-a:underline prose-a:decoration-zinc-600 prose-a:underline-offset-4 hover:prose-a:decoration-[#c3d9f3]",
                  "prose-p:text-zinc-300 prose-li:text-zinc-300 prose-strong:text-zinc-50 prose-blockquote:border-zinc-700 prose-blockquote:text-zinc-300",
                  "prose-hr:border-zinc-800 prose-code:text-zinc-100 prose-pre:border prose-pre:border-zinc-800 prose-pre:bg-zinc-950",
                )}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={previewComponents}>
                  {value}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="border border-dashed border-zinc-800 p-4 text-sm text-zinc-500">
                The preview will appear here as you write.
              </p>
            )}
          </div>
        ) : null}

        {dragActive ? (
          <div className="pointer-events-none absolute inset-3 grid place-items-center border border-dashed border-[#c3d9f3] bg-black/85">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#c3d9f3]">Drop images to upload</p>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-900 px-4 py-3 text-sm text-zinc-500 md:px-5">
        <p>Drop images into the editor or use the image button.</p>
        <p className="font-mono text-xs text-zinc-600">{dropMessage || `${images.length} staged image${images.length === 1 ? "" : "s"}`}</p>
      </div>
    </section>
  );
}

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon"
      className="size-9"
      title={label}
      aria-label={label}
      aria-pressed={active || undefined}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function buildImageMarkdown(image: MdxEditorImage) {
  const alt = image.safeName.replace(/\.[^.]+$/, "").replaceAll("-", " ");

  return `![${alt}](./images/${image.safeName})`;
}

function imageNameFromMarkdownSource(source: string) {
  const withoutQuery = source.split(/[?#]/)[0] ?? "";
  const match = withoutQuery.match(/(?:^|\/)images\/([^/]+)$/);

  if (match?.[1]) {
    return decodeURIComponent(match[1]);
  }

  if (!withoutQuery.includes("/") && withoutQuery.trim()) {
    return decodeURIComponent(withoutQuery);
  }

  return "";
}

function needsLeadingBreak(before: string) {
  return before.length > 0 && !before.endsWith("\n\n");
}

function needsTrailingBreak(after: string) {
  return after.length > 0 && !after.startsWith("\n");
}

function getPreviewWarnings(markdownSource: string) {
  const warnings: string[] = [];

  if (/^\s*import\s.+$/m.test(markdownSource) || /<[A-Z][A-Za-z0-9.:]*\b/.test(markdownSource)) {
    warnings.push("Preview renders safe Markdown only; MDX imports and components remain source text until build.");
  }

  return warnings;
}

function getMarkdownDiagnostics(markdownSource: string): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const lines = markdownSource.split("\n");
  let position = 0;
  let openFence: { from: number; marker: string; size: number } | null = null;

  for (const line of lines) {
    const fence = line.match(/^ {0,3}(`{3,}|~{3,})/);

    if (fence?.[1]) {
      const marker = fence[1][0] ?? "";
      const size = fence[1].length;

      if (!openFence) {
        openFence = { from: position, marker, size };
      } else if (openFence.marker === marker && size >= openFence.size) {
        openFence = null;
      }
    }

    position += line.length + 1;
  }

  if (openFence) {
    diagnostics.push({
      from: openFence.from,
      to: markdownSource.length,
      severity: "warning",
      source: "Markdown",
      message: "Close this fenced code block before publishing.",
    });
  }

  return diagnostics;
}
