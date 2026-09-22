import cn from "@utils/cn.js";

const VARIANTS = {
  default:
    "bg-surface-overlay text-text-secondary border border-border-default",
  primary: "bg-brand-600/20 text-brand-300 border border-brand-500/30",
  success: "bg-gh-success-muted text-accent-green border border-green-500/30",
  danger: "bg-gh-danger-muted text-accent-red border border-red-500/30",
  warning:
    "bg-gh-attention-muted text-accent-yellow border border-yellow-500/30",
  info: "bg-blue-500/10 text-accent-blue border border-blue-500/30",
  purple: "bg-gh-done-muted text-accent-purple border border-purple-500/30",
  open: "bg-gh-success-muted text-accent-green border border-green-500/30",
  closed: "bg-gh-danger-muted text-accent-red border border-red-500/30",
  merged: "bg-gh-done-muted text-accent-purple border border-purple-500/30",
  draft: "bg-surface-overlay text-text-secondary border border-border-default",
};

const SIZES = {
  sm: "text-xs px-1.5 py-0.5 rounded",
  md: "text-xs px-2 py-0.5 rounded-full",
  lg: "text-sm px-2.5 py-1 rounded-full",
};

const Badge = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...props
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium whitespace-nowrap",
        VARIANTS[variant] || VARIANTS.default,
        SIZES[size] || SIZES.md,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};

const StatusBadge = ({ status, ...props }) => {
  const variantMap = {
    open: "open",
    closed: "closed",
    merged: "merged",
    draft: "draft",
  };

  const labelMap = {
    open: "Open",
    closed: "Closed",
    merged: "Merged",
    draft: "Draft",
  };

  return (
    <Badge variant={variantMap[status] || "default"} {...props}>
      {labelMap[status] || status}
    </Badge>
  );
};

export default Badge;
export { StatusBadge };
