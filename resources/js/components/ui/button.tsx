import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-[#000000] text-white shadow-subtle hover:bg-[#262626] dark:bg-[#ffffff] dark:text-[#0a0a0a] dark:hover:bg-[#e5e5e5]",
        destructive:
          "bg-destructive text-white shadow-subtle hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-[#e5e5e5] bg-white text-[#171717] shadow-subtle hover:bg-[#f5f5f5] dark:border-[#262626] dark:bg-[#171717] dark:text-[#f5f5f5] dark:hover:bg-[#262626]",
        secondary:
          "bg-[#f5f5f5] text-[#171717] hover:bg-[#e5e5e5] dark:bg-[#262626] dark:text-[#f5f5f5] dark:hover:bg-[#333333]",
        ghost: "hover:bg-[#f5f5f5] hover:text-[#171717] dark:hover:bg-[#262626] dark:hover:text-[#f5f5f5]",
        link: "text-[#2563eb] underline-offset-4 hover:underline dark:text-[#3b82f6]",
        pill: "rounded-full bg-[#000000] text-white hover:bg-[#262626] dark:bg-[#ffffff] dark:text-[#0a0a0a]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-10 rounded-lg px-6 has-[>svg]:px-4",
        pill: "h-9 px-5 py-2 rounded-full",
        icon: "size-9",
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
  loading = false,
  disabled,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
  }) {
  if (asChild) {
    return (
      <Slot
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Slot>
    )
  }

  return (
    <button
      data-slot="button"
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  )
}

export { Button, buttonVariants }
