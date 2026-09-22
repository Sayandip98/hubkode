import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import * as repositoryService from "@services/repository.service.js";
import * as branchService from "@services/branch.service.js";
import * as commitService from "@services/commit.service.js";
import * as fileService from "@services/file.service.js";
import QUERY_KEYS from "@constants/queryKeys.js";
import ROUTES from "@constants/routes.js";
import toast from "react-hot-toast";

const useRepository = (owner, repoName) => {
  return useQuery({
    queryKey: QUERY_KEYS.REPOSITORIES.DETAIL(owner, repoName),
    queryFn: async () => {
      const response = await repositoryService.getRepository(owner, repoName);
      return response.data;
    },
    enabled: !!owner && !!repoName,
    staleTime: 2 * 60 * 1000,
  });
};

const useUserRepositories = (username, params) => {
  return useQuery({
    queryKey: QUERY_KEYS.REPOSITORIES.USER_REPOS(username),
    queryFn: async () => {
      const response = await repositoryService.getUserRepositories(
        username,
        params,
      );
      return response.data;
    },
    enabled: !!username,
    staleTime: 2 * 60 * 1000,
  });
};

const useCreateRepository = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: repositoryService.createRepository,
    onSuccess: (response) => {
      const repository = response.data.repository;
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REPOSITORIES.ALL });
      toast.success("Repository created successfully");
      navigate(
        ROUTES.REPOSITORY.ROOT(repository.owner.username, repository.name),
      );
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create repository");
    },
  });
};

const useUpdateRepository = (owner, repoName) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      repositoryService.updateRepository(owner, repoName, data),
    onSuccess: (response) => {
      const repository = response.data.repository;
      queryClient.setQueryData(
        QUERY_KEYS.REPOSITORIES.DETAIL(owner, repoName),
        (old) => ({ ...old, repository }),
      );
      toast.success("Repository updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update repository");
    },
  });
};

const useDeleteRepository = (owner, repoName) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => repositoryService.deleteRepository(owner, repoName),
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.REPOSITORIES.DETAIL(owner, repoName),
      });
      toast.success("Repository deleted successfully");
      navigate(ROUTES.DASHBOARD);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete repository");
    },
  });
};

const useStarRepository = (owner, repoName) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ isStarred }) =>
      isStarred
        ? repositoryService.unstarRepository(owner, repoName)
        : repositoryService.starRepository(owner, repoName),
    onSuccess: (response, { isStarred }) => {
      queryClient.setQueryData(
        QUERY_KEYS.REPOSITORIES.DETAIL(owner, repoName),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            isStarred: !isStarred,
            repository: {
              ...old.repository,
              starsCount: response.data.starsCount,
            },
          };
        },
      );
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update star");
    },
  });
};

const useWatchRepository = (owner, repoName) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ isWatched }) =>
      isWatched
        ? repositoryService.unwatchRepository(owner, repoName)
        : repositoryService.watchRepository(owner, repoName),
    onSuccess: (_, { isWatched }) => {
      queryClient.setQueryData(
        QUERY_KEYS.REPOSITORIES.DETAIL(owner, repoName),
        (old) => {
          if (!old) return old;
          return { ...old, isWatched: !isWatched };
        },
      );
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update watch");
    },
  });
};

const useForkRepository = (owner, repoName) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => repositoryService.forkRepository(owner, repoName),
    onSuccess: (response) => {
      const fork = response.data.repository;
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REPOSITORIES.ALL });
      toast.success("Repository forked successfully");
      navigate(ROUTES.REPOSITORY.ROOT(fork.owner.username, fork.name));
    },
    onError: (error) => {
      toast.error(error.message || "Failed to fork repository");
    },
  });
};

const useBranches = (owner, repoName) => {
  return useQuery({
    queryKey: QUERY_KEYS.BRANCHES.ALL(owner, repoName),
    queryFn: async () => {
      const response = await branchService.getBranches(owner, repoName);
      return response.data.branches;
    },
    enabled: !!owner && !!repoName,
    staleTime: 2 * 60 * 1000,
  });
};

const useCreateBranch = (owner, repoName) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => branchService.createBranch(owner, repoName, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BRANCHES.ALL(owner, repoName),
      });
      toast.success("Branch created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create branch");
    },
  });
};

const useDeleteBranch = (owner, repoName) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (branch) => branchService.deleteBranch(owner, repoName, branch),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BRANCHES.ALL(owner, repoName),
      });
      toast.success("Branch deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete branch");
    },
  });
};

const useCommits = (owner, repoName, branch, params) => {
  return useQuery({
    queryKey: QUERY_KEYS.COMMITS.ALL(owner, repoName, branch),
    queryFn: async () => {
      const response = await commitService.getCommits(owner, repoName, {
        branch,
        ...params,
      });
      return response.data;
    },
    enabled: !!owner && !!repoName && !!branch,
    staleTime: 1 * 60 * 1000,
  });
};

const useCommit = (owner, repoName, sha) => {
  return useQuery({
    queryKey: QUERY_KEYS.COMMITS.DETAIL(owner, repoName, sha),
    queryFn: async () => {
      const response = await commitService.getCommit(owner, repoName, sha);
      return response.data;
    },
    enabled: !!owner && !!repoName && !!sha,
    staleTime: Infinity,
  });
};

const useFileTree = (owner, repoName, branch, path) => {
  return useQuery({
    queryKey: QUERY_KEYS.FILES.TREE(owner, repoName, branch, path),
    queryFn: async () => {
      const response = await fileService.getFileTree(
        owner,
        repoName,
        branch,
        path,
      );
      return response.data;
    },
    enabled: !!owner && !!repoName && !!branch,
    staleTime: 2 * 60 * 1000,
  });
};

const useFileContent = (owner, repoName, branch, path) => {
  return useQuery({
    queryKey: QUERY_KEYS.FILES.BLOB(owner, repoName, branch, path),
    queryFn: async () => {
      const response = await fileService.getFileContent(
        owner,
        repoName,
        branch,
        path,
      );
      return response.data;
    },
    enabled: !!owner && !!repoName && !!branch && !!path,
    staleTime: 2 * 60 * 1000,
  });
};

const useCollaborators = (owner, repoName) => {
  return useQuery({
    queryKey: QUERY_KEYS.REPOSITORIES.COLLABORATORS(owner, repoName),
    queryFn: async () => {
      const response = await repositoryService.getCollaborators(
        owner,
        repoName,
      );
      return response.data;
    },
    enabled: !!owner && !!repoName,
  });
};

const useAddCollaborator = (owner, repoName) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      repositoryService.addCollaborator(owner, repoName, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.REPOSITORIES.COLLABORATORS(owner, repoName),
      });
      toast.success("Collaborator added successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add collaborator");
    },
  });
};

const useRemoveCollaborator = (owner, repoName) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) =>
      repositoryService.removeCollaborator(owner, repoName, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.REPOSITORIES.COLLABORATORS(owner, repoName),
      });
      toast.success("Collaborator removed successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove collaborator");
    },
  });
};

export {
  useRepository,
  useUserRepositories,
  useCreateRepository,
  useUpdateRepository,
  useDeleteRepository,
  useStarRepository,
  useWatchRepository,
  useForkRepository,
  useBranches,
  useCreateBranch,
  useDeleteBranch,
  useCommits,
  useCommit,
  useFileTree,
  useFileContent,
  useCollaborators,
  useAddCollaborator,
  useRemoveCollaborator,
};
