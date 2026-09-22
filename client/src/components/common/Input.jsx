import { forwardRef } from "react";
import cn from "@utils/cn.js";

const Input = forwardRef(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      fullWidth = true,
      size = "md",
      className = "",
      containerClassName = "",
      labelClassName = "",
      disabled = false,
      required = false,
      ...props
    },
    ref,
  ) => {
    const sizeClasses = {
      sm: "h-7 text-sm px-2.5",
      md: "h-9 text-sm px-3",
      lg: "h-11 text-base px-4",
    };

    const inputClass = cn(
      "w-full bg-surface-secondary border border-border-default rounded-md text-text-primary placeholder-text-muted transition-colors",
      "focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500",
      "disabled:opacity-60 disabled:cursor-not-allowed",
      error &&
        "border-accent-red focus:border-accent-red focus:ring-accent-red",
      leftIcon && "pl-9",
      rightIcon && "pr-9",
      sizeClasses[size] || sizeClasses.md,
      className,
    );

    return (
      <div
        className={cn(
          "flex flex-col gap-1.5",
          fullWidth && "w-full",
          containerClassName,
        )}
      >
        {label && (
          <label
            className={cn(
              "text-sm font-medium text-text-primary",
              required &&
                "after:content-['*'] after:ml-0.5 after:text-accent-red",
              labelClassName,
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            disabled={disabled}
            required={required}
            className={inputClass}
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p className="text-xs text-accent-red flex items-center gap-1">
            {error}
          </p>
        )}

        {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
