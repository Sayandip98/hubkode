import { useState, useRef } from "react";
import cn from "@utils/cn.js";

const Tooltip = ({
  children,
  content,
  position = "top",
  delay = 300,
  className = "",
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef(null);

  if (disabled || !content) return children;

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-surface-overlay",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-surface-overlay",
    left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-surface-overlay",
    right:
      "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-surface-overlay",
  };

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timerRef.current);
    setIsVisible(false);
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isVisible && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 pointer-events-none",
            positionClasses[position] || positionClasses.top,
          )}
        >
          <div
            className={cn(
              "bg-surface-overlay border border-border-default text-text-primary text-xs font-medium px-2.5 py-1.5 rounded-md shadow-overlay whitespace-nowrap",
              className,
            )}
          >
            {content}
          </div>
          <div
            className={cn(
              "absolute w-0 h-0 border-4",
              arrowClasses[position] || arrowClasses.top,
            )}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
