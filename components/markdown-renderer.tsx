"use client"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { useTheme } from "next-themes"

interface MarkdownRendererProps {
  content: string
}

// Client component for the editor
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <ReactMarkdown
      className="prose dark:prose-invert max-w-none"
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "")
          return !inline && match ? (
            <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          )
        },
        a: ({ node, ...props }) => (
          <a
            {...props}
            target={props.href?.startsWith("http") ? "_blank" : undefined}
            rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
          />
        ),
        img: ({ node, ...props }) => <img {...props} className="rounded-md my-4" />,
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto">
            <table {...props} />
          </div>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

