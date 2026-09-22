import cn from "@utils/cn.js";

const SIZES = {
  xs: "h-3 w-3 border",
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-2",
  xl: "h-12 w-12 border-4",
};

const LoadingSpinner = ({
  size = "md",
  className = "",
  label = "Loading...",
}) => {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        "inline-block rounded-full border-border-emphasis border-t-text-link animate-spin",
        SIZES[size] || SIZES.md,
        className,
      )}
    />
  );
};

const PageLoader = ({ label = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-3">
      <LoadingSpinner size="lg" label={label} />
      <p className="text-text-secondary text-sm">{label}</p>
    </div>
  );
};

const FullPageLoader = ({ label = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-primary">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="xl" label={label} />
        <p className="text-text-secondary text-sm">{label}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
export { PageLoader, FullPageLoader };
