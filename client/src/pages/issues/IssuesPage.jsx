import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CircleDot, Plus, CheckCircle2 } from "lucide-react";
import { useIssues } from "@hooks/useIssues.js";
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

const IssuesPage = () => {
  const { owner, repoName } = useParams();
  const { isAuthenticated } = useAuthStore();
  const [status, setStatus] = useState("open");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useIssues(owner, repoName, {
    status,
    page,
    limit: 20,
  });

  const issues = data?.data?.issues || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 p-0.5 bg-surface-tertiary rounded-lg">
          <button
            onClick={() => {
              setStatus("open");
              setPage(1);
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors",
              status === "open"
                ? "bg-surface-secondary text-text-primary font-medium shadow-sm"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            <CircleDot
              size={14}
              className={status === "open" ? "text-accent-green" : ""}
            />
            Open
          </button>
          <button
            onClick={() => {
              setStatus("closed");
              setPage(1);
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors",
              status === "closed"
                ? "bg-surface-secondary text-text-primary font-medium shadow-sm"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            <CheckCircle2
              size={14}
              className={status === "closed" ? "text-accent-purple" : ""}
            />
            Closed
          </button>
        </div>

        {isAuthenticated && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() =>
              (window.location.href = ROUTES.REPOSITORY.NEW_ISSUE(
                owner,
                repoName,
              ))
            }
          >
            New issue
          </Button>
        )}
      </div>

      <div className="bg-surface-secondary border border-border-default rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <PageLoader label="Loading issues..." />
          </div>
        ) : isError ? (
          <ErrorMessage title="Failed to load issues" onRetry={refetch} />
        ) : issues.length === 0 ? (
          <EmptyState
            icon={<CircleDot size={40} />}
            title={`No ${status} issues`}
            description={
              status === "open"
                ? "There are no open issues. Create one to get started."
                : "There are no closed issues yet."
            }
            action={
              isAuthenticated && status === "open"
                ? {
                    label: "New issue",
                    onClick: () =>
                      (window.location.href = ROUTES.REPOSITORY.NEW_ISSUE(
                        owner,
                        repoName,
                      )),
                  }
                : undefined
            }
          />
        ) : (
          <>
            {issues.map((issue) => (
              <div
                key={issue._id}
                className="flex items-start gap-3 px-4 py-3 border-b border-border-muted last:border-0 hover:bg-surface-tertiary/30 transition-colors"
              >
                {issue.status === "open" ? (
                  <CircleDot
                    size={16}
                    className="text-accent-green shrink-0 mt-0.5"
                  />
                ) : (
                  <CheckCircle2
                    size={16}
                    className="text-accent-purple shrink-0 mt-0.5"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <Link
                    to={ROUTES.REPOSITORY.ISSUE(owner, repoName, issue.number)}
                    className="text-sm font-medium text-text-primary hover:text-text-link"
                  >
                    {issue.title}
                  </Link>

                  {issue.labels?.length > 0 && (
                    <span className="ml-2 inline-flex gap-1">
                      {issue.labels.map((label) => (
                        <span
                          key={label._id || label.name}
                          className="text-2xs px-1.5 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: `${label.color}20`,
                            color: label.color,
                            border: `1px solid ${label.color}40`,
                          }}
                        >
                          {label.name}
                        </span>
                      ))}
                    </span>
                  )}

                  <p className="text-xs text-text-muted mt-1">
                    #{issue.number} opened {timeAgo(issue.createdAt)} by{" "}
                    <span className="text-text-secondary">
                      {issue.author?.username}
                    </span>
                    {issue.commentsCount > 0 && (
                      <span className="ml-2">
                        · {issue.commentsCount} comments
                      </span>
                    )}
                  </p>
                </div>

                {issue.assignees?.length > 0 && (
                  <div className="flex -space-x-1.5 shrink-0">
                    {issue.assignees.slice(0, 3).map((assignee) => (
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
            ))}
          </>
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

export default IssuesPage;
