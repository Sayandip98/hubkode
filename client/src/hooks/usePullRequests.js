import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import * as prService from "@services/pullRequest.service.js";
import QUERY_KEYS from "@constants/queryKeys.js";
import ROUTES from "@constants/routes.js";
import toast from "react-hot-toast";

const usePullRequests = (owner, repoName, filters) => {
  return useQuery({
    queryKey: QUERY_KEYS.PULL_REQUESTS.ALL(owner, repoName, filters),
    queryFn: async () => {
      const response = await prService.getPullRequests(
        owner,
        repoName,
        filters,
      );
      return response.data;
    },
    enabled: !!owner && !!repoName,
    staleTime: 1 * 60 * 1000,
  });
};

const usePullRequest = (owner, repoName, prNumber) => {
  return useQuery({
    queryKey: QUERY_KEYS.PULL_REQUESTS.DETAIL(owner, repoName, prNumber),
    queryFn: async () => {
      const response = await prService.getPullRequest(
        owner,
        repoName,
        prNumber,
      );
      return response.data.pullRequest;
    },
    enabled: !!owner && !!repoName && !!prNumber,
    staleTime: 1 * 60 * 1000,
  });
};

const usePullRequestDiff = (owner, repoName, prNumber) => {
  return useQuery({
    queryKey: QUERY_KEYS.PULL_REQUESTS.DIFF(owner, repoName, prNumber),
    queryFn: async () => {
      const response = await prService.getPullRequestDiff(
        owner,
        repoName,
        prNumber,
      );
      return response.data;
    },
    enabled: !!owner && !!repoName && !!prNumber,
    staleTime: 5 * 60 * 1000,
  });
};

const useCreatePullRequest = (owner, repoName) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => prService.createPullRequest(owner, repoName, data),
    onSuccess: (response) => {
      const pullRequest = response.data.pullRequest;
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PULL_REQUESTS.ALL(owner, repoName, {}),
      });
      toast.success("Pull request created successfully");
      navigate(
        ROUTES.REPOSITORY.PULL_REQUEST(owner, repoName, pullRequest.number),
      );
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create pull request");
    },
  });
};

const useUpdatePullRequest = (owner, repoName, prNumber) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      prService.updatePullRequest(owner, repoName, prNumber, data),
    onSuccess: (response) => {
      const pullRequest = response.data.pullRequest;
      queryClient.setQueryData(
        QUERY_KEYS.PULL_REQUESTS.DETAIL(owner, repoName, prNumber),
        pullRequest,
      );
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PULL_REQUESTS.ALL(owner, repoName, {}),
      });
      toast.success("Pull request updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update pull request");
    },
  });
};

const useMergePullRequest = (owner, repoName, prNumber) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => prService.mergePullRequest(owner, repoName, prNumber),
    onSuccess: (response) => {
      const pullRequest = response.data.pullRequest;
      queryClient.setQueryData(
        QUERY_KEYS.PULL_REQUESTS.DETAIL(owner, repoName, prNumber),
        pullRequest,
      );
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PULL_REQUESTS.ALL(owner, repoName, {}),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BRANCHES.ALL(owner, repoName),
      });
      toast.success("Pull request merged successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to merge pull request");
    },
  });
};

const useSubmitReview = (owner, repoName, prNumber) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      prService.submitReview(owner, repoName, prNumber, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PULL_REQUESTS.DETAIL(owner, repoName, prNumber),
      });
      toast.success("Review submitted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit review");
    },
  });
};

const usePRComments = (owner, repoName, prNumber) => {
  return useQuery({
    queryKey: QUERY_KEYS.PULL_REQUESTS.COMMENTS(owner, repoName, prNumber),
    queryFn: async () => {
      const response = await prService.getPRComments(owner, repoName, prNumber);
      return response.data;
    },
    enabled: !!owner && !!repoName && !!prNumber,
    staleTime: 30 * 1000,
  });
};

const useAddPRComment = (owner, repoName, prNumber) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      prService.addPRComment(owner, repoName, prNumber, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PULL_REQUESTS.COMMENTS(owner, repoName, prNumber),
      });
      toast.success("Comment added successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add comment");
    },
  });
};

const useUpdatePRComment = (owner, repoName, prNumber) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, data }) =>
      prService.updatePRComment(owner, repoName, prNumber, commentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PULL_REQUESTS.COMMENTS(owner, repoName, prNumber),
      });
      toast.success("Comment updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update comment");
    },
  });
};

const useDeletePRComment = (owner, repoName, prNumber) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId) =>
      prService.deletePRComment(owner, repoName, prNumber, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PULL_REQUESTS.COMMENTS(owner, repoName, prNumber),
      });
      toast.success("Comment deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete comment");
    },
  });
};

export {
  usePullRequests,
  usePullRequest,
  usePullRequestDiff,
  useCreatePullRequest,
  useUpdatePullRequest,
  useMergePullRequest,
  useSubmitReview,
  usePRComments,
  useAddPRComment,
  useUpdatePRComment,
  useDeletePRComment,
};
