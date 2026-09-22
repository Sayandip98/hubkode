import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Plus,
  ChevronDown,
  GitFork,
  BookOpen,
  Settings,
  LogOut,
  Search,
  Menu,
  X,
  Code2,
} from "lucide-react";
import { useAuthStore } from "@store/authStore.js";
import { useNotificationStore } from "@store/notificationStore.js";
import { useLogout } from "@hooks/useAuth.js";
import Avatar from "@components/common/Avatar.jsx";
import DropdownMenu, {
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
} from "@components/common/DropdownMenu.jsx";
import SearchBar from "@components/common/SearchBar.jsx";
import { useDebounce } from "@hooks/useDebounce.js";
import ROUTES from "@constants/routes.js";
import cn from "@utils/cn.js";

const Header = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(ROUTES.SEARCH(searchQuery.trim()));
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-40 h-14 bg-surface-secondary border-b border-border-default flex items-center px-4 gap-4">
      <Link
        to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME}
        className="flex items-center gap-2 shrink-0 text-text-primary hover:no-underline"
      >
        <Code2 size={24} className="text-brand-400" />
        <span className="font-bold text-base hidden sm:block">HubKode</span>
      </Link>

      {isAuthenticated && (
        <div className="flex-1 max-w-md hidden md:block">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            placeholder="Search or jump to..."
            onKeyDown={handleSearch}
            size="sm"
          />
        </div>
      )}

      <div className="flex items-center gap-1 ml-auto">
        {isAuthenticated ? (
          <>
            <DropdownMenu
              trigger={
                <button className="flex items-center gap-1 px-2 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-tertiary rounded-md transition-colors">
                  <Plus size={16} />
                  <ChevronDown size={12} />
                </button>
              }
              align="right"
              width="w-52"
            >
              {({ close }) => (
                <>
                  <DropdownLabel>Create new</DropdownLabel>
                  <DropdownItem
                    icon={<BookOpen size={14} />}
                    onClick={() => {
                      navigate(ROUTES.NEW_REPOSITORY);
                      close();
                    }}
                  >
                    New repository
                  </DropdownItem>
                  <DropdownItem
                    icon={<GitFork size={14} />}
                    onClick={() => {
                      navigate(ROUTES.ORGANIZATIONS.NEW);
                      close();
                    }}
                  >
                    New organization
                  </DropdownItem>
                </>
              )}
            </DropdownMenu>

            <Link
              to={ROUTES.NOTIFICATIONS}
              className="relative flex items-center justify-center h-9 w-9 text-text-secondary hover:text-text-primary hover:bg-surface-tertiary rounded-md transition-colors"
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-white text-2xs font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            <DropdownMenu
              trigger={
                <button className="flex items-center gap-1.5 pl-1 pr-2 py-1 hover:bg-surface-tertiary rounded-md transition-colors">
                  <Avatar
                    src={user?.avatarUrl}
                    name={user?.displayName || user?.username}
                    size="sm"
                  />
                  <ChevronDown size={12} className="text-text-muted" />
                </button>
              }
              align="right"
              width="w-56"
            >
              {({ close }) => (
                <>
                  <div className="px-3 py-2 border-b border-border-muted">
                    <p className="text-sm font-semibold text-text-primary">
                      {user?.displayName || user?.username}
                    </p>
                    <p className="text-xs text-text-muted">@{user?.username}</p>
                  </div>

                  <DropdownItem
                    icon={<BookOpen size={14} />}
                    onClick={() => {
                      navigate(ROUTES.PROFILE(user?.username));
                      close();
                    }}
                  >
                    Your profile
                  </DropdownItem>
                  <DropdownItem
                    icon={<BookOpen size={14} />}
                    onClick={() => {
                      navigate(
                        ROUTES.PROFILE_TAB(user?.username, "repositories"),
                      );
                      close();
                    }}
                  >
                    Your repositories
                  </DropdownItem>

                  <DropdownSeparator />

                  <DropdownItem
                    icon={<Settings size={14} />}
                    onClick={() => {
                      navigate(ROUTES.SETTINGS.PROFILE);
                      close();
                    }}
                  >
                    Settings
                  </DropdownItem>

                  <DropdownSeparator />

                  <DropdownItem
                    icon={<LogOut size={14} />}
                    variant="danger"
                    onClick={() => {
                      logout();
                      close();
                    }}
                  >
                    Sign out
                  </DropdownItem>
                </>
              )}
            </DropdownMenu>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to={ROUTES.AUTH.LOGIN}
              className="px-3 py-1.5 text-sm text-text-primary hover:no-underline"
            >
              Sign in
            </Link>
            <Link
              to={ROUTES.AUTH.REGISTER}
              className="px-3 py-1.5 text-sm bg-brand-600 hover:bg-brand-500 text-white rounded-md transition-colors hover:no-underline"
            >
              Sign up
            </Link>
          </div>
        )}

        <button
          className="md:hidden flex items-center justify-center h-9 w-9 text-text-secondary hover:text-text-primary hover:bg-surface-tertiary rounded-md"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileMenuOpen && isAuthenticated && (
        <div className="absolute top-14 left-0 right-0 bg-surface-secondary border-b border-border-default p-4 md:hidden z-40 animate-slide-down">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            placeholder="Search or jump to..."
            onKeyDown={(e) => {
              handleSearch(e);
              setMobileMenuOpen(false);
            }}
            size="md"
            autoFocus
          />
        </div>
      )}
    </header>
  );
};

export default Header;
