import { useParams } from "react-router-dom";
import { useState } from "react";
import { CircleDot, CheckCircle2, Lock, MessageSquare } from "lucide-react";
import { useAuthStore } from "@store/authStore.js";
import {
  useIssue,
  useUpdateIssue,
  useIssueComments,
  useAddIssueComment,
} from "@hooks/useIssues.js";
import Avatar from "@components/common/Avatar.jsx";
import Button from "@components/common/Button.jsx";
import Textarea from "@components/common/Textarea.jsx";
import { PageLoader } from "@components/common/LoadingSpinner.jsx";
import ErrorMessage from "@components/common/ErrorMessage.jsx";
import { timeAgo } from "@utils/formatDate.js";
import { StatusBadge } from "@components/common/Badge.jsx";

const IssueDetailPage = () => {
  const { owner, repoName, issueNumber } = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const [comment, setComment] = useState("");

  const {
    data: issue,
    isLoading,
    isError,
    refetch,
  } = useIssue(owner, repoName, issueNumber);
  const { data: commentsData } = useIssueComments(owner, repoName, issueNumber);
  const { mutate: updateIssue, isPending: isUpdating } = useUpdateIssue(
    owner,
    repoName,
    issueNumber,
  );
  const { mutate: addComment, isPending: isCommenting } = useAddIssueComment(
    owner,
    repoName,
    issueNumber,
  );

  const comments = commentsData?.data?.comments || [];

  if (isLoading) return <PageLoader label="Loading issue..." />;
  if (isError)
    return <ErrorMessage title="Issue not found" onRetry={refetch} />;
  if (!issue) return null;

  const isOpen = issue.status === "open";
  const isAuthor = user?._id === issue.author?._id;

  const handleToggleStatus = () => {
    updateIssue({ status: isOpen ? "closed" : "open" });
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    addComment(
      { body: comment },
      {
        onSuccess: () => setComment(""),
      },
    );
  };

  return (
    <div>
      <div className="mb-4">
        <div className="flex items-start gap-3 mb-2">
          {isOpen ? (
            <CircleDot size={20} className="text-accent-green shrink-0 mt-1" />
          ) : (
            <CheckCircle2
              size={20}
              className="text-accent-purple shrink-0 mt-1"
            />
          )}
          <h1 className="text-xl font-semibold text-text-primary">
            {issue.title}{" "}
            <span className="text-text-muted font-normal">#{issue.number}</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 ml-8">
          <StatusBadge status={issue.status} />
          <span className="text-sm text-text-secondary">
            <span className="font-medium text-text-primary">
              {issue.author?.username}
            </span>{" "}
            opened this issue {timeAgo(issue.createdAt)} · {comments.length}{" "}
            comments
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-surface-secondary border border-border-default rounded-lg overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 bg-surface-tertiary border-b border-border-default">
            <Avatar
              src={issue.author?.avatarUrl}
              name={issue.author?.displayName || issue.author?.username}
              size="sm"
            />
            <span className="text-sm font-medium text-text-primary">
              {issue.author?.username}
            </span>
            <span className="text-xs text-text-muted ml-auto">
              {timeAgo(issue.createdAt)}
            </span>
          </div>

          <div className="px-4 py-4 prose-hubkode text-sm">
            {issue.body ? (
              <p className="text-text-secondary whitespace-pre-wrap">
                {issue.body}
              </p>
            ) : (
              <p className="text-text-muted italic">No description provided.</p>
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
              {comment.isEdited && (
                <span className="text-xs text-text-muted">(edited)</span>
              )}
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

        {isAuthenticated && (
          <div className="bg-surface-secondary border border-border-default rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-surface-tertiary border-b border-border-default">
              <Avatar
                src={user?.avatarUrl}
                name={user?.displayName || user?.username}
                size="sm"
              />
              <span className="text-sm text-text-muted">Write a comment</span>
            </div>

            <div className="p-4 flex flex-col gap-3">
              {issue.isLocked ? (
                <div className="flex items-center gap-2 text-sm text-text-secondary py-4 justify-center">
                  <Lock size={14} />
                  This issue is locked. Comments are disabled.
                </div>
              ) : (
                <>
                  <Textarea
                    placeholder="Leave a comment..."
                    rows={5}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <div className="flex items-center justify-between">
                    {isAuthor && (
                      <Button
                        variant={isOpen ? "secondary" : "success"}
                        size="sm"
                        isLoading={isUpdating}
                        leftIcon={
                          isOpen ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <CircleDot size={14} />
                          )
                        }
                        onClick={handleToggleStatus}
                      >
                        {isOpen ? "Close issue" : "Reopen issue"}
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={isCommenting}
                      disabled={!comment.trim()}
                      leftIcon={<MessageSquare size={14} />}
                      onClick={handleAddComment}
                      className="ml-auto"
                    >
                      Comment
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IssueDetailPage;
