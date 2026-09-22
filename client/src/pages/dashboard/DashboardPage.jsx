import { Link } from "react-router-dom";
import { Plus, BookOpen, Star, GitFork } from "lucide-react";
import { useAuthStore } from "@store/authStore.js";
import { useUserRepositories } from "@hooks/useRepository.js";
import Button from "@components/common/Button.jsx";
import Avatar from "@components/common/Avatar.jsx";
import { PageLoader } from "@components/common/LoadingSpinner.jsx";
import EmptyState from "@components/common/EmptyState.jsx";
import { timeAgo } from "@utils/formatDate.js";
import { formatNumber } from "@utils/formatNumber.js";
import ROUTES from "@constants/routes.js";
import cn from "@utils/cn.js";

const RepositoryItem = ({ repository }) => {
  const ownerUsername =
    repository.owner?.username || repository.owner?.name || "unknown";

  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-border-muted last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to={ROUTES.REPOSITORY.ROOT(ownerUsername, repository.name)}
            className="text-sm font-semibold text-text-link hover:underline"
          >
            {ownerUsername}/{repository.name}
          </Link>
          {repository.isPrivate && (
            <span className="text-xs px-1.5 py-0.5 rounded border border-border-default text-text-muted">
              Private
            </span>
          )}
        </div>

        {repository.description && (
          <p className="text-xs text-text-secondary mt-1 line-clamp-1">
            {repository.description}
          </p>
        )}

        <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
          {repository.language && <span>{repository.language}</span>}
          {repository.starsCount > 0 && (
            <span className="flex items-center gap-1">
              <Star size={11} />
              {formatNumber(repository.starsCount)}
            </span>
          )}
          {repository.forkCount > 0 && (
            <span className="flex items-center gap-1">
              <GitFork size={11} />
              {formatNumber(repository.forkCount)}
            </span>
          )}
          <span>Updated {timeAgo(repository.updatedAt)}</span>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { data, isLoading } = useUserRepositories(user?.username, {
    sort: "updated",
    limit: 10,
  });

  const repositories = data?.data?.repositories || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-primary">
            Recent repositories
          </h2>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => (window.location.href = ROUTES.NEW_REPOSITORY)}
          >
            New
          </Button>
        </div>

        <div className="bg-surface-secondary border border-border-default rounded-lg divide-y divide-border-muted">
          {isLoading ? (
            <div className="p-8">
              <PageLoader label="Loading repositories..." />
            </div>
          ) : repositories.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={40} />}
              title="No repositories yet"
              description="Create your first repository to get started."
              action={{
                label: "Create repository",
                onClick: () => (window.location.href = ROUTES.NEW_REPOSITORY),
              }}
            />
          ) : (
            <div className="px-4">
              {repositories.map((repo) => (
                <RepositoryItem key={repo._id} repository={repo} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-surface-secondary border border-border-default rounded-lg p-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar
              src={user?.avatarUrl}
              name={user?.displayName || user?.username}
              size="lg"
            />
            <div>
              <Link
                to={ROUTES.PROFILE(user?.username)}
                className="text-sm font-semibold text-text-primary hover:underline"
              >
                {user?.displayName || user?.username}
              </Link>
              <p className="text-xs text-text-muted">@{user?.username}</p>
            </div>
          </div>

          {user?.bio && (
            <p className="text-sm text-text-secondary mb-3">{user.bio}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <span>
              <span className="font-semibold text-text-primary">
                {user?.followersCount || 0}
              </span>{" "}
              followers
            </span>
            <span>
              <span className="font-semibold text-text-primary">
                {user?.followingCount || 0}
              </span>{" "}
              following
            </span>
          </div>
        </div>

        <div className="bg-surface-secondary border border-border-default rounded-lg p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            Quick links
          </h3>
          <nav className="flex flex-col gap-1">
            {[
              { label: "Your profile", to: ROUTES.PROFILE(user?.username) },
              {
                label: "Your repositories",
                to: ROUTES.PROFILE_TAB(user?.username, "repositories"),
              },
              { label: "Explore", to: ROUTES.EXPLORE },
              { label: "Settings", to: ROUTES.SETTINGS.PROFILE },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm text-text-secondary hover:text-text-primary transition-colors py-1"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
