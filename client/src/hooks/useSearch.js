import { useQuery } from "@tanstack/react-query";
import * as searchService from "@services/search.service.js";
import QUERY_KEYS from "@constants/queryKeys.js";
import { useDebounce } from "./useDebounce.js";

const useGlobalSearch = (query, options = {}) => {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: QUERY_KEYS.SEARCH.GLOBAL(debouncedQuery),
    queryFn: async () => {
      const response = await searchService.globalSearch({ q: debouncedQuery });
      return response.data;
    },
    enabled: !!debouncedQuery && debouncedQuery.trim().length >= 2,
    staleTime: 30 * 1000,
    ...options,
  });
};

const useSearchRepositories = (query, filters, options = {}) => {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: QUERY_KEYS.SEARCH.REPOSITORIES(debouncedQuery, filters),
    queryFn: async () => {
      const response = await searchService.searchRepositories({
        q: debouncedQuery,
        ...filters,
      });
      return response.data;
    },
    enabled: !!debouncedQuery && debouncedQuery.trim().length >= 2,
    staleTime: 30 * 1000,
    ...options,
  });
};

const useSearchUsers = (query, options = {}) => {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: QUERY_KEYS.SEARCH.USERS(debouncedQuery),
    queryFn: async () => {
      const response = await searchService.searchUsers({ q: debouncedQuery });
      return response.data;
    },
    enabled: !!debouncedQuery && debouncedQuery.trim().length >= 2,
    staleTime: 30 * 1000,
    ...options,
  });
};

const useSearchIssues = (query, filters, options = {}) => {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: QUERY_KEYS.SEARCH.ISSUES(debouncedQuery, filters),
    queryFn: async () => {
      const response = await searchService.searchIssues({
        q: debouncedQuery,
        ...filters,
      });
      return response.data;
    },
    enabled: !!debouncedQuery && debouncedQuery.trim().length >= 2,
    staleTime: 30 * 1000,
    ...options,
  });
};

const useSearchPullRequests = (query, filters, options = {}) => {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: QUERY_KEYS.SEARCH.PULL_REQUESTS(debouncedQuery, filters),
    queryFn: async () => {
      const response = await searchService.searchPullRequests({
        q: debouncedQuery,
        ...filters,
      });
      return response.data;
    },
    enabled: !!debouncedQuery && debouncedQuery.trim().length >= 2,
    staleTime: 30 * 1000,
    ...options,
  });
};

const useSearchOrganizations = (query, options = {}) => {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: QUERY_KEYS.SEARCH.ORGANIZATIONS(debouncedQuery),
    queryFn: async () => {
      const response = await searchService.searchOrganizations({
        q: debouncedQuery,
      });
      return response.data;
    },
    enabled: !!debouncedQuery && debouncedQuery.trim().length >= 2,
    staleTime: 30 * 1000,
    ...options,
  });
};

const useExploreRepositories = (filters, options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.REPOSITORIES.EXPLORE(filters),
    queryFn: async () => {
      const response = await searchService.getExploreRepositories(filters);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

export {
  useGlobalSearch,
  useSearchRepositories,
  useSearchUsers,
  useSearchIssues,
  useSearchPullRequests,
  useSearchOrganizations,
  useExploreRepositories,
};
