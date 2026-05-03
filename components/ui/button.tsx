import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent font-mono text-xs font-normal uppercase tracking-[0.18em] transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border-zinc-100 bg-transparent text-zinc-50 hover:bg-zinc-50 hover:text-zinc-950",
        destructive:
          "border-red-400/70 bg-transparent text-red-200 hover:bg-red-950/40 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border-zinc-700 bg-transparent text-zinc-100 hover:border-zinc-100 hover:bg-zinc-950",
        secondary:
          "border-zinc-800 bg-zinc-950 text-zinc-100 hover:border-zinc-500",
        ghost:
          "border-transparent text-zinc-300 hover:bg-zinc-950 hover:text-zinc-50",
        link: "border-transparent px-0 text-[#c3d9f3] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2 has-[>svg]:px-4",
        sm: "h-9 gap-1.5 px-3 has-[>svg]:px-3",
        lg: "h-12 px-7 has-[>svg]:px-5",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
