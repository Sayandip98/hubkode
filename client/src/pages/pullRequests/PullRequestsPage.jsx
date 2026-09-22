import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { GitPullRequest, Plus, GitMerge } from "lucide-react";
import { usePullRequests } from "@hooks/usePullRequests.js";
import { useAuthStore } from "@store/authStore.js";
import Avatar from "@components/common/Avatar.jsx";
import Button from "@components/common/Button.jsx";
import Pagination from "@components/common/Pagination.jsx";
import { PageLoader } from "@components/common/LoadingSpinner.jsx";
import EmptyState from "@components/common/EmptyState.jsx";
import ErrorMessage from "@components/common/ErrorMessage.jsx";
import { timeAgo } from "@utils/formatDate.js";
import ROUTES from "@constants/routes.js";
import cn from "@utils/cn.js";

const PRStatusIcon = ({ status }) => {
  if (status === "merged")
    return <GitMerge size={16} className="text-accent-purple shrink-0" />;
  if (status === "closed")
    return <GitPullRequest size={16} className="text-accent-red shrink-0" />;
  return <GitPullRequest size={16} className="text-accent-green shrink-0" />;
};

const PullRequestsPage = () => {
  const { owner, repoName } = useParams();
  const { isAuthenticated } = useAuthStore();
  const [status, setStatus] = useState("open");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = usePullRequests(
    owner,
    repoName,
    { status, page, limit: 20 },
  );

  const pullRequests = data?.data?.pullRequests || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 p-0.5 bg-surface-tertiary rounded-lg">
          {["open", "closed", "merged"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors capitalize",
                status === s
                  ? "bg-surface-secondary text-text-primary font-medium shadow-sm"
                  : "text-text-secondary hover:text-text-primary",
              )}
            >
              <PRStatusIcon status={s} />
              {s}
            </button>
          ))}
        </div>

        {isAuthenticated && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() =>
              (window.location.href = ROUTES.REPOSITORY.NEW_PR(owner, repoName))
            }
          >
            New pull request
          </Button>
        )}
      </div>

      <div className="bg-surface-secondary border border-border-default rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <PageLoader label="Loading pull requests..." />
          </div>
        ) : isError ? (
          <ErrorMessage
            title="Failed to load pull requests"
            onRetry={refetch}
          />
        ) : pullRequests.length === 0 ? (
          <EmptyState
            icon={<GitPullRequest size={40} />}
            title={`No ${status} pull requests`}
            description="There are no pull requests matching the current filter."
          />
        ) : (
          pullRequests.map((pr) => (
            <div
              key={pr._id}
              className="flex items-start gap-3 px-4 py-3 border-b border-border-muted last:border-0 hover:bg-surface-tertiary/30 transition-colors"
            >
              <PRStatusIcon status={pr.status} />

              <div className="flex-1 min-w-0">
                <Link
                  to={ROUTES.REPOSITORY.PULL_REQUEST(
                    owner,
                    repoName,
                    pr.number,
                  )}
                  className="text-sm font-medium text-text-primary hover:text-text-link"
                >
                  {pr.title}
                  {pr.isDraft && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 bg-surface-overlay text-text-muted border border-border-default rounded">
                      Draft
                    </span>
                  )}
                </Link>

                <p className="text-xs text-text-muted mt-1">
                  #{pr.number} {pr.status === "merged" ? "merged" : "opened"}{" "}
                  {timeAgo(pr.createdAt)} by{" "}
                  <span className="text-text-secondary">
                    {pr.author?.username}
                  </span>
                  {" · "}
                  <span className="font-mono">{pr.sourceBranch}</span>
                  {" → "}
                  <span className="font-mono">{pr.targetBranch}</span>
                </p>
              </div>

              {pr.assignees?.length > 0 && (
                <div className="flex -space-x-1.5 shrink-0">
                  {pr.assignees.slice(0, 3).map((assignee) => (
                    <Avatar
                      key={assignee._id}
                      src={assignee.avatarUrl}
                      name={assignee.username}
                      size="xs"
                      className="ring-1 ring-surface-secondary"
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

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

export default PullRequestsPage;
