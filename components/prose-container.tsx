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

  return <div className={cn("prose prose-zinc dark:prose-invert", maxWidthClass, className)}>{children}</div>;
}
