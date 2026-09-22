import cn from "@utils/cn.js";
import LoadingSpinner from "./LoadingSpinner.jsx";

const VARIANTS = {
  primary:
    "bg-brand-600 hover:bg-brand-500 text-white border border-brand-500 shadow-btn-primary",
  secondary:
    "bg-surface-tertiary hover:bg-surface-overlay text-text-primary border border-border-default",
  danger: "bg-accent-red hover:bg-red-400 text-white border border-red-500",
  ghost:
    "bg-transparent hover:bg-surface-tertiary text-text-secondary hover:text-text-primary border border-transparent",
  outline:
    "bg-transparent hover:bg-surface-tertiary text-text-primary border border-border-default",
  success:
    "bg-accent-green hover:bg-green-400 text-white border border-green-500",
  link: "bg-transparent text-text-link hover:underline border-none p-0 h-auto shadow-none",
};

const SIZES = {
  xs: "text-xs px-2 py-1 h-6 rounded",
  sm: "text-sm px-3 py-1.5 h-7 rounded-md",
  md: "text-sm px-4 py-2 h-9 rounded-md",
  lg: "text-base px-5 py-2.5 h-11 rounded-md",
  xl: "text-lg px-6 py-3 h-13 rounded-lg",
  icon: "p-2 h-9 w-9 rounded-md",
  "icon-sm": "p-1.5 h-7 w-7 rounded-md",
  "icon-lg": "p-2.5 h-11 w-11 rounded-md",
};

const Button = ({
  children,
  variant = "secondary",
  size = "md",
  isLoading = false,
  disabled = false,
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  className = "",
  type = "button",
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary select-none whitespace-nowrap",
        VARIANTS[variant] || VARIANTS.secondary,
        SIZES[size] || SIZES.md,
        fullWidth && "w-full",
        isDisabled && "opacity-60 cursor-not-allowed pointer-events-none",
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children && <span>{children}</span>}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;
