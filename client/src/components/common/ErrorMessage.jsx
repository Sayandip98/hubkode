import { AlertCircle, RefreshCw } from "lucide-react";
import cn from "@utils/cn.js";
import Button from "./Button.jsx";

const ErrorMessage = ({
  title = "Something went wrong",
  message,
  onRetry,
  className = "",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "py-6 px-4",
    md: "py-10 px-6",
    lg: "py-16 px-8",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizeClasses[size] || sizeClasses.md,
        className,
      )}
    >
      <AlertCircle
        size={size === "sm" ? 24 : 32}
        className="text-accent-red mb-3 opacity-80"
      />

      <h3 className="text-base font-semibold text-text-primary mb-1">
        {title}
      </h3>

      {message && (
        <p className="text-sm text-text-secondary max-w-sm mb-4">{message}</p>
      )}

      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw size={14} />}
        >
          Try again
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;
