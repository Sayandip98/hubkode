import { useRef } from "react";
import { Search, X } from "lucide-react";
import cn from "@utils/cn.js";

const SearchBar = ({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  size = "md",
  className = "",
  autoFocus = false,
  onKeyDown,
  ...props
}) => {
  const inputRef = useRef(null);

  const sizeClasses = {
    sm: "h-7 text-sm pl-8 pr-7",
    md: "h-9 text-sm pl-9 pr-8",
    lg: "h-11 text-base pl-10 pr-9",
  };

  const iconSize = {
    sm: 13,
    md: 15,
    lg: 17,
  };

  const iconPositions = {
    sm: "left-2.5",
    md: "left-3",
    lg: "left-3.5",
  };

  const clearPositions = {
    sm: "right-2",
    md: "right-2.5",
    lg: "right-3",
  };

  return (
    <div className={cn("relative", className)}>
      <Search
        size={iconSize[size] || 15}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 text-text-muted pointer-events-none",
          iconPositions[size] || iconPositions.md,
        )}
      />

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          "w-full bg-surface-secondary border border-border-default rounded-md text-text-primary placeholder-text-muted transition-colors",
          "focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500",
          sizeClasses[size] || sizeClasses.md,
        )}
        {...props}
      />

      {value && onClear && (
        <button
          type="button"
          onClick={() => {
            onClear();
            inputRef.current?.focus();
          }}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors",
            clearPositions[size] || clearPositions.md,
          )}
          aria-label="Clear search"
        >
          <X size={iconSize[size] || 15} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
