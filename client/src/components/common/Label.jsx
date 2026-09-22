import cn from "@utils/cn.js";

const Label = ({
  children,
  htmlFor,
  required = false,
  className = "",
  ...props
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "text-sm font-medium text-text-primary",
        required && "after:content-['*'] after:ml-0.5 after:text-accent-red",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
};

export default Label;
