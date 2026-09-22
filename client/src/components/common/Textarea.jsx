import { forwardRef } from "react";
import cn from "@utils/cn.js";

const Textarea = forwardRef(
  (
    {
      label,
      error,
      hint,
      fullWidth = true,
      rows = 4,
      className = "",
      containerClassName = "",
      disabled = false,
      required = false,
      showCount = false,
      maxLength,
      value,
      ...props
    },
    ref,
  ) => {
    const currentLength = typeof value === "string" ? value.length : 0;

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

        <textarea
          ref={ref}
          rows={rows}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          value={value}
          className={cn(
            "w-full bg-surface-secondary border border-border-default rounded-md text-text-primary placeholder-text-muted transition-colors resize-y px-3 py-2 text-sm",
            "focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            error &&
              "border-accent-red focus:border-accent-red focus:ring-accent-red",
            className,
          )}
          {...props}
        />

        <div className="flex items-start justify-between gap-2">
          <div>
            {error && <p className="text-xs text-accent-red">{error}</p>}
            {hint && !error && (
              <p className="text-xs text-text-muted">{hint}</p>
            )}
          </div>

          {showCount && maxLength && (
            <p
              className={cn(
                "text-xs ml-auto shrink-0",
                currentLength >= maxLength
                  ? "text-accent-red"
                  : "text-text-muted",
              )}
            >
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
