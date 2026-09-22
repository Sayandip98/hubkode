import cn from "@utils/cn.js";

const PageHeader = ({
  title,
  description,
  actions,
  breadcrumb,
  className = "",
  border = true,
}) => {
  return (
    <div
      className={cn(
        "py-4 mb-6",
        border && "border-b border-border-muted",
        className,
      )}
    >
      {breadcrumb && (
        <div className="flex items-center gap-1.5 text-sm text-text-muted mb-2">
          {breadcrumb}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          {title && (
            <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
          )}
          {description && (
            <p className="text-sm text-text-secondary mt-1">{description}</p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
