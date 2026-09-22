import cn from "@utils/cn.js";

const Card = ({
  children,
  className = "",
  padding = true,
  hover = false,
  bordered = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-surface-secondary rounded-md",
        bordered && "border border-border-default",
        padding && "p-4",
        hover &&
          "transition-colors hover:border-border-emphasis cursor-pointer",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = "", ...props }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 border-b border-border-default",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardBody = ({ children, className = "", ...props }) => {
  return (
    <div className={cn("p-4", className)} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className = "", ...props }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 border-t border-border-default bg-surface-primary/50 rounded-b-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
export { CardHeader, CardBody, CardFooter };
