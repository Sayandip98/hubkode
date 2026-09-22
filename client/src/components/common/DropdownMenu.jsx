import { useEffect, useRef, useState } from "react";
import cn from "@utils/cn.js";

const DropdownMenu = ({
  trigger,
  children,
  align = "left",
  className = "",
  width = "w-48",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={() => setIsOpen((prev) => !prev)}>{trigger}</div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1 bg-surface-secondary border border-border-default rounded-md shadow-overlay animate-slide-down py-1",
            align === "right" ? "right-0" : "left-0",
            width,
            className,
          )}
          role="menu"
        >
          {typeof children === "function"
            ? children({ close: () => setIsOpen(false) })
            : children}
        </div>
      )}
    </div>
  );
};

const DropdownItem = ({
  children,
  onClick,
  className = "",
  disabled = false,
  variant = "default",
  icon = null,
  ...props
}) => {
  const variantClass =
    variant === "danger"
      ? "text-accent-red hover:bg-gh-danger-muted"
      : "text-text-primary hover:bg-surface-tertiary";

  return (
    <button
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left transition-colors",
        variantClass,
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {icon && <span className="shrink-0 text-text-muted">{icon}</span>}
      {children}
    </button>
  );
};

const DropdownSeparator = () => (
  <div className="my-1 border-t border-border-muted" role="separator" />
);

const DropdownLabel = ({ children, className = "" }) => (
  <div
    className={cn(
      "px-3 py-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider",
      className,
    )}
  >
    {children}
  </div>
);

export default DropdownMenu;
export { DropdownItem, DropdownSeparator, DropdownLabel };
