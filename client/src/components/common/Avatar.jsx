import { useState } from "react";
import cn from "@utils/cn.js";

const SIZES = {
  xs: "h-5 w-5 text-2xs",
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
  xl: "h-12 w-12 text-lg",
  "2xl": "h-16 w-16 text-xl",
  "3xl": "h-20 w-20 text-2xl",
  "4xl": "h-24 w-24 text-3xl",
};

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const getAvatarColor = (name) => {
  if (!name) return "bg-surface-overlay";
  const colors = [
    "bg-blue-600",
    "bg-purple-600",
    "bg-green-600",
    "bg-yellow-600",
    "bg-red-600",
    "bg-pink-600",
    "bg-indigo-600",
    "bg-teal-600",
  ];
  const index =
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index];
};

const Avatar = ({
  src,
  alt,
  name,
  size = "md",
  className = "",
  showStatus = false,
  isOnline = false,
  ...props
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClass = SIZES[size] || SIZES.md;
  const initials = getInitials(name || alt);
  const bgColor = getAvatarColor(name || alt);
  const showFallback = !src || imgError;

  return (
    <span className={cn("relative inline-flex shrink-0", className)} {...props}>
      {showFallback ? (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full font-semibold text-white select-none",
            sizeClass,
            bgColor,
          )}
          aria-label={alt || name}
        >
          {initials}
        </span>
      ) : (
        <img
          src={src}
          alt={alt || name}
          onError={() => setImgError(true)}
          className={cn(
            "inline-block rounded-full object-cover bg-surface-tertiary",
            sizeClass,
          )}
        />
      )}
      {showStatus && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-surface-primary",
            isOnline ? "bg-accent-green" : "bg-text-muted",
            size === "xs" || size === "sm" ? "h-1.5 w-1.5" : "h-2.5 w-2.5",
          )}
        />
      )}
    </span>
  );
};

const AvatarGroup = ({ users = [], max = 3, size = "sm", className = "" }) => {
  const visible = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className={cn("flex -space-x-2", className)}>
      {visible.map((user, index) => (
        <Avatar
          key={user._id || index}
          src={user.avatarUrl}
          name={user.displayName || user.username}
          alt={user.username}
          size={size}
          className="ring-2 ring-surface-primary"
        />
      ))}
      {remaining > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-surface-overlay text-text-secondary font-medium ring-2 ring-surface-primary",
            SIZES[size] || SIZES.sm,
          )}
        >
          +{remaining}
        </span>
      )}
    </div>
  );
};

export default Avatar;
export { AvatarGroup };
