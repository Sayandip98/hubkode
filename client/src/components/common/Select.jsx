import { forwardRef } from "react";
import cn from "@utils/cn.js";
import { ChevronDown } from "lucide-react";

const Select = forwardRef(
  (
    {
      label,
      error,
      hint,
      options = [],
      placeholder,
      fullWidth = true,
      size = "md",
      className = "",
      containerClassName = "",
      disabled = false,
      required = false,
      ...props
    },
    ref,
  ) => {
    const sizeClasses = {
      sm: "h-7 text-sm pl-2.5 pr-8",
      md: "h-9 text-sm pl-3 pr-9",
      lg: "h-11 text-base pl-4 pr-10",
    };

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
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            disabled={disabled}
            required={required}
            className={cn(
              "w-full appearance-none bg-surface-secondary border border-border-default rounded-md text-text-primary transition-colors cursor-pointer",
              "focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              error &&
                "border-accent-red focus:border-accent-red focus:ring-accent-red",
              sizeClasses[size] || sizeClasses.md,
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          />
        </div>

        {error && <p className="text-xs text-accent-red">{error}</p>}
        {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
