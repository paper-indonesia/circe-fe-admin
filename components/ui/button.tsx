import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8B5CF6] active:scale-[0.98] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white shadow-md hover:shadow-lg hover:from-[#6D28D9] hover:to-[#6D28D9]",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600 hover:shadow-md",
        outline:
          "border-2 border-[#8B5CF6] bg-white text-[#8B5CF6] hover:bg-[#EDE9FE] hover:border-[#6D28D9]",
        secondary:
          "bg-[#A78BFA] text-white shadow-md hover:bg-[#8B5CF6] hover:shadow-lg",
        ghost:
          "text-[#8B5CF6] hover:bg-[#EDE9FE] hover:text-[#6D28D9]",
        link: "text-[#8B5CF6] underline-offset-4 hover:underline hover:text-[#6D28D9]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-6",
        icon: "size-10 rounded-lg",
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