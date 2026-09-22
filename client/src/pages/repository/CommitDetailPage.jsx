import { useParams, Link } from "react-router-dom";
import { useCommit } from "@hooks/useRepository.js";
import Avatar from "@components/common/Avatar.jsx";
import Badge from "@components/common/Badge.jsx";
import { PageLoader } from "@components/common/LoadingSpinner.jsx";
import ErrorMessage from "@components/common/ErrorMessage.jsx";
import { formatDateTime } from "@utils/formatDate.js";
import { formatLines } from "@utils/formatNumber.js";
import ROUTES from "@constants/routes.js";
import cn from "@utils/cn.js";

const CommitDetailPage = () => {
  const { owner, repoName, sha } = useParams();
  const { data, isLoading, isError, refetch } = useCommit(owner, repoName, sha);

  if (isLoading) return <PageLoader label="Loading commit..." />;
  if (isError)
    return <ErrorMessage title="Commit not found" onRetry={refetch} />;

  const { commit, diff } = data?.data || {};

  return (
    <div>
      <div className="bg-surface-secondary border border-border-default rounded-lg p-5 mb-6">
        <h1 className="text-lg font-semibold text-text-primary mb-1">
          {commit?.message}
        </h1>
        {commit?.description && (
          <p className="text-sm text-text-secondary mb-4">
            {commit.description}
          </p>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <Avatar
            src={commit?.author?.user?.avatarUrl}
            name={commit?.author?.name}
            size="sm"
          />
          <span className="text-sm text-text-primary font-medium">
            {commit?.author?.name}
          </span>
          <span className="text-sm text-text-secondary">
            committed {formatDateTime(commit?.createdAt)}
          </span>

          <code className="ml-auto text-xs font-mono text-text-link bg-surface-tertiary px-2 py-1 rounded">
            {sha?.slice(0, 7)}
          </code>
        </div>

        {commit?.stats && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border-muted text-xs text-text-secondary">
            <span>
              <span className="font-semibold text-text-primary">
                {commit.stats.filesChanged}
              </span>{" "}
              files changed
            </span>
            <span className="text-accent-green">
              +{commit.stats.additions} additions
            </span>
            <span className="text-accent-red">
              -{commit.stats.deletions} deletions
            </span>
          </div>
        )}
      </div>

      {diff && diff.length > 0 && (
        <div className="flex flex-col gap-4">
          {diff.map((fileDiff, index) => (
            <div
              key={index}
              className="bg-surface-secondary border border-border-default rounded-lg overflow-hidden"
            >
              <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-tertiary border-b border-border-default">
                <span className="text-sm font-mono text-text-primary">
                  {fileDiff.path}
                </span>
                <Badge
                  variant={
                    fileDiff.status === "added"
                      ? "success"
                      : fileDiff.status === "deleted"
                        ? "danger"
                        : "default"
                  }
                  size="sm"
                  className="ml-auto"
                >
                  {fileDiff.status}
                </Badge>
              </div>

              {fileDiff.baseContent !== null ||
              fileDiff.headContent !== null ? (
                <div className="overflow-x-auto">
                  <pre className="p-4 text-xs font-mono text-text-primary whitespace-pre">
                    {fileDiff.headContent || fileDiff.baseContent}
                  </pre>
                </div>
              ) : (
                <p className="p-4 text-sm text-text-muted">
                  Binary file changed
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommitDetailPage;
