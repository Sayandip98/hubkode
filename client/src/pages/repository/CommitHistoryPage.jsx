import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { GitCommitHorizontal } from "lucide-react";
import { useCommits } from "@hooks/useRepository.js";
import Avatar from "@components/common/Avatar.jsx";
import Pagination from "@components/common/Pagination.jsx";
import { PageLoader } from "@components/common/LoadingSpinner.jsx";
import EmptyState from "@components/common/EmptyState.jsx";
import ErrorMessage from "@components/common/ErrorMessage.jsx";
import { timeAgo } from "@utils/formatDate.js";
import ROUTES from "@constants/routes.js";

const CommitHistoryPage = () => {
  const { owner, repoName, branch } = useParams();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useCommits(
    owner,
    repoName,
    branch,
    { page, limit: 20 },
  );

  const commits = data?.data?.commits || [];
  const pagination = data?.data?.pagination;

  if (isLoading) return <PageLoader label="Loading commits..." />;
  if (isError)
    return <ErrorMessage title="Failed to load commits" onRetry={refetch} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-text-primary">
          Commits on {branch}
        </h2>
        {pagination && (
          <p className="text-sm text-text-secondary">
            {pagination.total} commits
          </p>
        )}
      </div>

      {commits.length === 0 ? (
        <EmptyState
          icon={<GitCommitHorizontal size={40} />}
          title="No commits yet"
          description="Make your first commit to see history here."
        />
      ) : (
        <div className="flex flex-col">
          {commits.map((commit) => (
            <div
              key={commit._id}
              className="flex items-start gap-3 py-3 border-b border-border-muted last:border-0"
            >
              <Avatar
                src={commit.author?.user?.avatarUrl}
                name={commit.author?.name}
                size="sm"
                className="mt-0.5 shrink-0"
              />

              <div className="flex-1 min-w-0">
                <Link
                  to={ROUTES.REPOSITORY.COMMIT(owner, repoName, commit.sha)}
                  className="text-sm font-medium text-text-primary hover:text-text-link line-clamp-1"
                >
                  {commit.message}
                </Link>
                <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                  <span className="font-medium text-text-secondary">
                    {commit.author?.name}
                  </span>
                  <span>committed {timeAgo(commit.createdAt)}</span>
                </div>
              </div>

              <code className="text-xs font-mono text-text-link bg-surface-tertiary px-2 py-1 rounded hover:bg-surface-overlay transition-colors shrink-0">
                <Link
                  to={ROUTES.REPOSITORY.COMMIT(owner, repoName, commit.sha)}
                >
                  {commit.sha.slice(0, 7)}
                </Link>
              </code>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="mt-6">
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

export default CommitHistoryPage;
