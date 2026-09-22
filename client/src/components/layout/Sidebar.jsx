import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  GitPullRequest,
  CircleDot,
  Star,
  Building2,
  Bell,
  Settings,
  Compass,
} from "lucide-react";
import { useAuthStore } from "@store/authStore.js";
import { useNotificationStore } from "@store/notificationStore.js";
import Avatar from "@components/common/Avatar.jsx";
import ROUTES from "@constants/routes.js";
import cn from "@utils/cn.js";

const NAV_ITEMS = (username, unreadCount) => [
  {
    label: "Dashboard",
    to: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Explore",
    to: ROUTES.EXPLORE,
    icon: Compass,
  },
  {
    label: "Repositories",
    to: ROUTES.PROFILE_TAB(username, "repositories"),
    icon: BookOpen,
  },
  {
    label: "Pull requests",
    to: "#",
    icon: GitPullRequest,
  },
  {
    label: "Issues",
    to: "#",
    icon: CircleDot,
  },
  {
    label: "Stars",
    to: ROUTES.PROFILE_TAB(username, "stars"),
    icon: Star,
  },
  {
    label: "Organizations",
    to: ROUTES.ORGANIZATIONS.NEW,
    icon: Building2,
  },
  {
    label: "Notifications",
    to: ROUTES.NOTIFICATIONS,
    icon: Bell,
    badge: unreadCount > 0 ? unreadCount : null,
  },
  {
    label: "Settings",
    to: ROUTES.SETTINGS.PROFILE,
    icon: Settings,
  },
];

const Sidebar = ({ className = "" }) => {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();

  const navItems = NAV_ITEMS(user?.username, unreadCount);

  return (
    <aside className={cn("flex flex-col gap-1 w-60 shrink-0 py-4", className)}>
      {user && (
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <Avatar
            src={user.avatarUrl}
            name={user.displayName || user.username}
            size="md"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">
              {user.displayName || user.username}
            </p>
            <p className="text-xs text-text-muted truncate">@{user.username}</p>
          </div>
        </div>
      )}

      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                isActive
                  ? "bg-surface-tertiary text-text-primary font-medium"
                  : "text-text-secondary hover:bg-surface-tertiary hover:text-text-primary",
              )
            }
          >
            <item.icon size={16} className="shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-2xs font-bold text-white">
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
