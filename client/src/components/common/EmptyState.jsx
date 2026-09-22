import cn from "@utils/cn.js";
import Button from "./Button.jsx";

const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = "",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "py-8",
    md: "py-12",
    lg: "py-16",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizeClasses[size] || sizeClasses.md,
        className,
      )}
    >
      {icon && <div className="mb-4 text-text-muted opacity-40">{icon}</div>}

      {title && (
        <h3 className="text-base font-semibold text-text-primary mb-1">
          {title}
        </h3>
      )}

      {description && (
        <p className="text-sm text-text-secondary max-w-sm mb-4">
          {description}
        </p>
      )}

      {action && (
        <Button
          variant={action.variant || "primary"}
          size={action.size || "md"}
          onClick={action.onClick}
          leftIcon={action.icon}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
