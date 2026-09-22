import { Navigate, Outlet, useParams, NavLink } from "react-router-dom";
import {
  BookOpen,
  GitPullRequest,
  CircleDot,
  Settings,
  GitCommitHorizontal,
  Eye,
  Star,
  GitFork,
} from "lucide-react";
import { useAuthStore } from "@store/authStore.js";
import { useRepository } from "@hooks/useRepository.js";
import Header from "@components/layout/Header.jsx";
import Footer from "@components/layout/Footer.jsx";
import Avatar from "@components/common/Avatar.jsx";
import Badge from "@components/common/Badge.jsx";
import { PageLoader } from "@components/common/LoadingSpinner.jsx";
import ErrorMessage from "@components/common/ErrorMessage.jsx";
import { formatNumber } from "@utils/formatNumber.js";
import ROUTES from "@constants/routes.js";
import cn from "@utils/cn.js";

const RepositoryLayout = () => {
  const { owner, repoName } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const { data, isLoading, isError, error, refetch } = useRepository(
    owner,
    repoName,
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-primary">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <PageLoader label="Loading repository..." />
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-primary">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <ErrorMessage
            title="Repository not found"
            message={error?.message}
            onRetry={refetch}
          />
        </main>
      </div>
    );
  }

  const { repository, isOwner, isStarred, isWatched } = data || {};

  const isCollaborator = repository?.collaborators?.some(
    (c) => c.user._id === user?._id,
  );

  const canAccessSettings = isOwner || isCollaborator;

  const tabs = [
    {
      label: "Code",
      to: ROUTES.REPOSITORY.ROOT(owner, repoName),
      icon: BookOpen,
      end: true,
    },
    {
      label: "Issues",
      to: ROUTES.REPOSITORY.ISSUES(owner, repoName),
      icon: CircleDot,
      count: repository?.openIssuesCount,
    },
    {
      label: "Pull requests",
      to: ROUTES.REPOSITORY.PULL_REQUESTS(owner, repoName),
      icon: GitPullRequest,
      count: repository?.openPullRequestsCount,
    },
    {
      label: "Commits",
      to: ROUTES.REPOSITORY.COMMITS(
        owner,
        repoName,
        repository?.defaultBranch || "main",
      ),
      icon: GitCommitHorizontal,
    },
    ...(canAccessSettings
      ? [
          {
            label: "Settings",
            to: ROUTES.REPOSITORY.SETTINGS(owner, repoName),
            icon: Settings,
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-surface-primary">
      <Header />

      <div className="border-b border-border-default bg-surface-secondary">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex flex-wrap items-center gap-2 py-3">
            <Avatar
              src={repository?.owner?.avatarUrl || repository?.owner?.avatar}
              name={repository?.owner?.displayName || owner}
              size="xs"
            />
            <NavLink
              to={ROUTES.PROFILE(owner)}
              className="text-sm text-text-link hover:underline"
            >
              {owner}
            </NavLink>
            <span className="text-text-muted">/</span>
            <NavLink
              to={ROUTES.REPOSITORY.ROOT(owner, repoName)}
              className="text-sm font-semibold text-text-link hover:underline"
            >
              {repoName}
            </NavLink>
            {repository?.isPrivate && (
              <Badge variant="default" size="sm">
                Private
              </Badge>
            )}
            {repository?.isArchived && (
              <Badge variant="warning" size="sm">
                Archived
              </Badge>
            )}
            {repository?.forkedFrom && (
              <Badge variant="default" size="sm">
                <GitFork size={10} /> Forked
              </Badge>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center gap-1 text-xs text-text-secondary border border-border-default rounded-md overflow-hidden">
                <span className="flex items-center gap-1 px-2 py-1">
                  <Eye size={13} />
                  Watch
                </span>
                <span className="px-2 py-1 border-l border-border-default bg-surface-tertiary">
                  {formatNumber(repository?.watchersCount || 0)}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs text-text-secondary border border-border-default rounded-md overflow-hidden">
                <span className="flex items-center gap-1 px-2 py-1">
                  <GitFork size={13} />
                  Fork
                </span>
                <span className="px-2 py-1 border-l border-border-default bg-surface-tertiary">
                  {formatNumber(repository?.forkCount || 0)}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs text-text-secondary border border-border-default rounded-md overflow-hidden">
                <span className="flex items-center gap-1 px-2 py-1">
                  <Star
                    size={13}
                    className={
                      isStarred ? "fill-accent-yellow text-accent-yellow" : ""
                    }
                  />
                  {isStarred ? "Starred" : "Star"}
                </span>
                <span className="px-2 py-1 border-l border-border-default bg-surface-tertiary">
                  {formatNumber(repository?.starsCount || 0)}
                </span>
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-0.5 overflow-x-auto">
            {tabs.map((tab) => (
              <NavLink
                key={tab.label}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-1.5 px-3 py-2.5 text-sm border-b-2 transition-colors whitespace-nowrap",
                    isActive
                      ? "border-brand-500 text-text-primary font-medium"
                      : "border-transparent text-text-secondary hover:text-text-primary hover:border-border-emphasis",
                  )
                }
              >
                <tab.icon size={15} />
                {tab.label}
                {tab.count != null && tab.count > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-overlay px-1.5 text-2xs font-medium text-text-secondary">
                    {tab.count}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 py-6">
        <Outlet
          context={{
            repository,
            isOwner,
            isStarred,
            isWatched,
            refetchRepository: refetch,
          }}
        />
      </main>

      <Footer />
    </div>
  );
};

export default RepositoryLayout;
