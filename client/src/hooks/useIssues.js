import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import * as issueService from "@services/issue.service.js";
import QUERY_KEYS from "@constants/queryKeys.js";
import ROUTES from "@constants/routes.js";
import toast from "react-hot-toast";

const useIssues = (owner, repoName, filters) => {
  return useQuery({
    queryKey: QUERY_KEYS.ISSUES.ALL(owner, repoName, filters),
    queryFn: async () => {
      const response = await issueService.getIssues(owner, repoName, filters);
      return response.data;
    },
    enabled: !!owner && !!repoName,
    staleTime: 1 * 60 * 1000,
  });
};

const useIssue = (owner, repoName, issueNumber) => {
  return useQuery({
    queryKey: QUERY_KEYS.ISSUES.DETAIL(owner, repoName, issueNumber),
    queryFn: async () => {
      const response = await issueService.getIssue(
        owner,
        repoName,
        issueNumber,
      );
      return response.data.issue;
    },
    enabled: !!owner && !!repoName && !!issueNumber,
    staleTime: 1 * 60 * 1000,
  });
};

const useCreateIssue = (owner, repoName) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => issueService.createIssue(owner, repoName, data),
    onSuccess: (response) => {
      const issue = response.data.issue;
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ISSUES.ALL(owner, repoName, {}),
      });
      toast.success("Issue created successfully");
      navigate(ROUTES.REPOSITORY.ISSUE(owner, repoName, issue.number));
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create issue");
    },
  });
};

const useUpdateIssue = (owner, repoName, issueNumber) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      issueService.updateIssue(owner, repoName, issueNumber, data),
    onSuccess: (response) => {
      const issue = response.data.issue;
      queryClient.setQueryData(
        QUERY_KEYS.ISSUES.DETAIL(owner, repoName, issueNumber),
        issue,
      );
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ISSUES.ALL(owner, repoName, {}),
      });
      toast.success("Issue updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update issue");
    },
  });
};

const useDeleteIssue = (owner, repoName) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (issueNumber) =>
      issueService.deleteIssue(owner, repoName, issueNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ISSUES.ALL(owner, repoName, {}),
      });
      toast.success("Issue deleted successfully");
      navigate(ROUTES.REPOSITORY.ISSUES(owner, repoName));
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete issue");
    },
  });
};

const useIssueComments = (owner, repoName, issueNumber) => {
  return useQuery({
    queryKey: QUERY_KEYS.ISSUES.COMMENTS(owner, repoName, issueNumber),
    queryFn: async () => {
      const response = await issueService.getIssueComments(
        owner,
        repoName,
        issueNumber,
      );
      return response.data;
    },
    enabled: !!owner && !!repoName && !!issueNumber,
    staleTime: 30 * 1000,
  });
};

const useAddIssueComment = (owner, repoName, issueNumber) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      issueService.addIssueComment(owner, repoName, issueNumber, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ISSUES.COMMENTS(owner, repoName, issueNumber),
      });
      toast.success("Comment added successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add comment");
    },
  });
};

const useUpdateIssueComment = (owner, repoName, issueNumber) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, data }) =>
      issueService.updateIssueComment(
        owner,
        repoName,
        issueNumber,
        commentId,
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ISSUES.COMMENTS(owner, repoName, issueNumber),
      });
      toast.success("Comment updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update comment");
    },
  });
};

const useDeleteIssueComment = (owner, repoName, issueNumber) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId) =>
      issueService.deleteIssueComment(owner, repoName, issueNumber, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ISSUES.COMMENTS(owner, repoName, issueNumber),
      });
      toast.success("Comment deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete comment");
    },
  });
};

const useToggleReaction = (owner, repoName, issueNumber) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, emoji }) =>
      issueService.toggleReaction(
        owner,
        repoName,
        issueNumber,
        commentId,
        emoji,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ISSUES.COMMENTS(owner, repoName, issueNumber),
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to toggle reaction");
    },
  });
};

export {
  useIssues,
  useIssue,
  useCreateIssue,
  useUpdateIssue,
  useDeleteIssue,
  useIssueComments,
  useAddIssueComment,
  useUpdateIssueComment,
  useDeleteIssueComment,
  useToggleReaction,
};
