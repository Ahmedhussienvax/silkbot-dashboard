import * as React from "react"
import { cn } from "@/lib/utils"

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost" | "gradient" | "danger"
    size?: "sm" | "md" | "lg" | "icon"
    loading?: boolean
  }
>(({ className, variant = "default", size = "md", loading, children, ...props }, ref) => {
  const variants = {
    default: "bg-white/10 text-white hover:bg-white/20 border border-white/10",
    outline: "bg-transparent border border-white/20 text-white hover:border-white/40",
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5",
    gradient: "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg hover:scale-[1.02]",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
  }

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-10 py-4 text-base",
    icon: "p-3",
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl font-bold transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-95",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      ) : null}
      {children}
    </button>
  )
})
Button.displayName = "Button"

export { Button }
