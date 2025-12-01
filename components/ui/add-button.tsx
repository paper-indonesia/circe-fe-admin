import React from "react"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { Plus, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AddButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  icon?: LucideIcon
  children?: React.ReactNode
  variant?: "default" | "compact"
}

export const AddButton = React.forwardRef<HTMLButtonElement, AddButtonProps>(
  ({ icon: Icon = Plus, children = "Add", variant = "default", className, disabled, ...props }, ref) => {
    return (
      <ShimmerButton
        ref={ref}
        shimmerColor="#ffffff"
        shimmerSize="0.05em"
        shimmerDuration="3s"
        borderRadius="8px"
        background={disabled ? "linear-gradient(135deg, #9CA3AF 0%, #D1D5DB 100%)" : "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)"}
        className={cn(
          "transition-shadow duration-300 h-10 text-sm font-medium",
          variant === "compact" ? "px-3 py-2" : "px-4 py-2",
          disabled && "opacity-60 cursor-not-allowed",
          className
        )}
        disabled={disabled}
        {...props}
      >
        <span className={cn(
          "flex items-center gap-2 text-center tracking-tight",
          disabled ? "text-gray-100" : "text-white"
        )}>
          <Icon className="h-4 w-4 flex-shrink-0" />
          <span className="whitespace-nowrap">{children}</span>
        </span>
      </ShimmerButton>
    )
  }
)

AddButton.displayName = "AddButton"
