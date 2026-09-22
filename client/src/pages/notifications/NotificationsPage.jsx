import { useState } from "react";
import {
  Bell,
  Check,
  Trash2,
  CircleDot,
  GitPullRequest,
  GitCommitHorizontal,
  Star,
  Users,
} from "lucide-react";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteAllNotifications,
} from "@hooks/useNotifications.js";
import Button from "@components/common/Button.jsx";
import Avatar from "@components/common/Avatar.jsx";
import Pagination from "@components/common/Pagination.jsx";
import { PageLoader } from "@components/common/LoadingSpinner.jsx";
import EmptyState from "@components/common/EmptyState.jsx";
import PageHeader from "@components/layout/PageHeader.jsx";
import { timeAgo } from "@utils/formatDate.js";
import cn from "@utils/cn.js";

const NOTIFICATION_ICONS = {
  issue_opened: <CircleDot size={14} className="text-accent-green" />,
  issue_closed: <CircleDot size={14} className="text-accent-purple" />,
  issue_comment: <CircleDot size={14} className="text-accent-blue" />,
  issue_assigned: <CircleDot size={14} className="text-accent-yellow" />,
  pr_opened: <GitPullRequest size={14} className="text-accent-green" />,
  pr_merged: <GitPullRequest size={14} className="text-accent-purple" />,
  pr_closed: <GitPullRequest size={14} className="text-accent-red" />,
  pr_review_requested: (
    <GitPullRequest size={14} className="text-accent-yellow" />
  ),
  pr_reviewed: <GitPullRequest size={14} className="text-accent-blue" />,
  commit_pushed: (
    <GitCommitHorizontal size={14} className="text-text-secondary" />
  ),
  repo_starred: <Star size={14} className="text-accent-yellow" />,
  repo_forked: (
    <GitCommitHorizontal size={14} className="text-text-secondary" />
  ),
  user_followed: <Users size={14} className="text-accent-blue" />,
  collaborator_added: <Users size={14} className="text-accent-green" />,
};

const NotificationsPage = () => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");

  const { data, isLoading } = useNotifications({
    page,
    limit: 20,
    status: filter === "unread" ? "unread" : undefined,
  });

  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();
  const { mutate: deleteAll, isPending: isDeletingAll } =
    useDeleteAllNotifications();

  const notifications = data?.data?.notifications || [];
  const unreadCount = data?.data?.unreadCount || 0;
  const pagination = data?.pagination;

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Notifications"
        description={
          unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
            : "You're all caught up!"
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Check size={14} />}
              isLoading={isMarkingAll}
              onClick={() => markAllAsRead()}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 size={14} />}
              isLoading={isDeletingAll}
              onClick={() => deleteAll()}
              disabled={notifications.length === 0}
            >
              Delete all
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-1 p-0.5 bg-surface-tertiary rounded-lg mb-4 w-fit">
        {["all", "unread"].map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md transition-colors capitalize",
              filter === f
                ? "bg-surface-secondary text-text-primary font-medium shadow-sm"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <PageLoader label="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={40} />}
          title="No notifications"
          description={
            filter === "unread"
              ? "You have no unread notifications."
              : "You have no notifications yet."
          }
        />
      ) : (
        <div className="flex flex-col bg-surface-secondary border border-border-default rounded-lg overflow-hidden">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={cn(
                "flex items-start gap-3 px-4 py-3 border-b border-border-muted last:border-0 transition-colors",
                notification.readStatus === "unread"
                  ? "bg-brand-600/5"
                  : "hover:bg-surface-tertiary/30",
              )}
            >
              {notification.readStatus === "unread" && (
                <span className="h-2 w-2 rounded-full bg-brand-500 mt-2 shrink-0" />
              )}

              <Avatar
                src={notification.actor?.avatarUrl}
                name={notification.actor?.username}
                size="sm"
                className="shrink-0 mt-0.5"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {NOTIFICATION_ICONS[notification.type]}
                  <span className="text-sm text-text-secondary">
                    <span className="font-medium text-text-primary">
                      {notification.actor?.username}
                    </span>{" "}
                    {notification.message}
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  {timeAgo(notification.createdAt)}
                  {notification.repository && (
                    <> · {notification.repository.fullName}</>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {notification.readStatus === "unread" && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => markAsRead(notification._id)}
                    aria-label="Mark as read"
                  >
                    <Check size={12} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => deleteNotification(notification._id)}
                  aria-label="Delete notification"
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="mt-4">
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
