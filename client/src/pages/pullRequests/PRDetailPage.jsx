import { useParams } from "react-router-dom";
import { useState } from "react";
import {
  GitPullRequest,
  GitMerge,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { useAuthStore } from "@store/authStore.js";
import {
  usePullRequest,
  useMergePullRequest,
  usePRComments,
  useAddPRComment,
} from "@hooks/usePullRequests.js";
import Avatar from "@components/common/Avatar.jsx";
import Button from "@components/common/Button.jsx";
import Textarea from "@components/common/Textarea.jsx";
import { PageLoader } from "@components/common/LoadingSpinner.jsx";
import ErrorMessage from "@components/common/ErrorMessage.jsx";
import { StatusBadge } from "@components/common/Badge.jsx";
import { timeAgo } from "@utils/formatDate.js";
import { useOutletContext } from "react-router-dom";

const PRDetailPage = () => {
  const { owner, repoName, prNumber } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const context = useOutletContext();
  const { isOwner } = context || {};
  const [comment, setComment] = useState("");

  const {
    data: pr,
    isLoading,
    isError,
    refetch,
  } = usePullRequest(owner, repoName, prNumber);
  const { data: commentsData } = usePRComments(owner, repoName, prNumber);
  const { mutate: mergePR, isPending: isMerging } = useMergePullRequest(
    owner,
    repoName,
    prNumber,
  );
  const { mutate: addComment, isPending: isCommenting } = useAddPRComment(
    owner,
    repoName,
    prNumber,
  );

  const comments = commentsData?.data?.comments || [];

  if (isLoading) return <PageLoader label="Loading pull request..." />;
  if (isError)
    return <ErrorMessage title="Pull request not found" onRetry={refetch} />;
  if (!pr) return null;

  const canMerge =
    isOwner && pr.status === "open" && !pr.isDraft && pr.isMergeable;

  const handleAddComment = () => {
    if (!comment.trim()) return;
    addComment({ body: comment }, { onSuccess: () => setComment("") });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary mb-2">
          {pr.title}{" "}
          <span className="text-text-muted font-normal">#{pr.number}</span>
        </h1>

        <div className="flex items-center gap-3 flex-wrap">
          <StatusBadge status={pr.isDraft ? "draft" : pr.status} />
          <span className="text-sm text-text-secondary">
            <span className="font-medium text-text-primary">
              {pr.author?.username}
            </span>{" "}
            wants to merge{" "}
            <code className="text-xs bg-surface-tertiary px-1.5 py-0.5 rounded">
              {pr.sourceBranch}
            </code>{" "}
            into{" "}
            <code className="text-xs bg-surface-tertiary px-1.5 py-0.5 rounded">
              {pr.targetBranch}
            </code>
            {" · "}
            {timeAgo(pr.createdAt)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="bg-surface-secondary border border-border-default rounded-lg overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-surface-tertiary border-b border-border-default">
            <Avatar
              src={pr.author?.avatarUrl}
              name={pr.author?.username}
              size="sm"
            />
            <span className="text-sm font-medium text-text-primary">
              {pr.author?.username}
            </span>
            <span className="text-xs text-text-muted ml-auto">
              {timeAgo(pr.createdAt)}
            </span>
          </div>
          <div className="px-4 py-4">
            {pr.body ? (
              <p className="text-sm text-text-secondary whitespace-pre-wrap">
                {pr.body}
              </p>
            ) : (
              <p className="text-sm text-text-muted italic">
                No description provided.
              </p>
            )}
          </div>
        </div>

        {comments.map((comment) => (
          <div
            key={comment._id}
            className="bg-surface-secondary border border-border-default rounded-lg overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 bg-surface-tertiary border-b border-border-default">
              <Avatar
                src={comment.author?.avatarUrl}
                name={comment.author?.username}
                size="sm"
              />
              <span className="text-sm font-medium text-text-primary">
                {comment.author?.username}
              </span>
              <span className="text-xs text-text-muted ml-auto">
                {timeAgo(comment.createdAt)}
              </span>
            </div>
            <div className="px-4 py-4">
              <p className="text-sm text-text-secondary whitespace-pre-wrap">
                {comment.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      {pr.status === "open" && (
        <div className="bg-surface-secondary border border-border-default rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`flex items-center justify-center h-8 w-8 rounded-full ${
                pr.isMergeable ? "bg-gh-success-muted" : "bg-gh-danger-muted"
              }`}
            >
              {pr.isMergeable ? (
                <CheckCircle size={16} className="text-accent-green" />
              ) : (
                <GitMerge size={16} className="text-accent-red" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                {pr.isMergeable
                  ? "This branch has no conflicts with the base branch"
                  : "This branch has conflicts that must be resolved"}
              </p>
              <p className="text-xs text-text-secondary">
                {pr.isMergeable
                  ? "Merging can be performed automatically."
                  : "Resolve conflicts before merging."}
              </p>
            </div>
          </div>

          {canMerge && (
            <Button
              variant="success"
              size="sm"
              isLoading={isMerging}
              leftIcon={<GitMerge size={14} />}
              onClick={() => mergePR()}
            >
              Merge pull request
            </Button>
          )}
        </div>
      )}

      {isAuthenticated && pr.status === "open" && (
        <div className="bg-surface-secondary border border-border-default rounded-lg overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-surface-tertiary border-b border-border-default">
            <Avatar
              src={user?.avatarUrl}
              name={user?.displayName || user?.username}
              size="sm"
            />
            <span className="text-sm text-text-muted">Leave a comment</span>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <Textarea
              placeholder="Leave a comment..."
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                isLoading={isCommenting}
                disabled={!comment.trim()}
                leftIcon={<MessageSquare size={14} />}
                onClick={handleAddComment}
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PRDetailPage;
