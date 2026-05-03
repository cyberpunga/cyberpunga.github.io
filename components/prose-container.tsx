import type React from "react";
import { cn } from "@/lib/utils";

interface ProseContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export function ProseContainer({ children, className, size = "lg" }: ProseContainerProps) {
  const maxWidthClass = {
    sm: "max-w-prose",
    md: "max-w-2xl",
    lg: "max-w-3xl",
    xl: "max-w-4xl",
    full: "max-w-none",
  }[size];

  return (
    <div
      className={cn(
        "prose prose-invert",
        "prose-headings:font-mono prose-headings:font-normal prose-headings:tracking-[0.02em]",
        "prose-a:text-[#c3d9f3] prose-a:underline prose-a:decoration-zinc-600 prose-a:underline-offset-4 hover:prose-a:decoration-[#c3d9f3]",
        "prose-p:text-zinc-300 prose-li:text-zinc-300 prose-strong:text-zinc-50 prose-blockquote:border-zinc-700 prose-blockquote:text-zinc-300",
        "prose-hr:border-zinc-800 prose-code:text-zinc-100 prose-pre:border prose-pre:border-zinc-800 prose-pre:bg-zinc-950",
        maxWidthClass,
        className,
      )}
    >
      {children}
    </div>
  );
}
