import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@store/authStore.js";
import * as authService from "@services/auth.service.js";
import QUERY_KEYS from "@constants/queryKeys.js";
import ROUTES from "@constants/routes.js";
import toast from "react-hot-toast";

const useGetMe = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: QUERY_KEYS.AUTH.ME,
    queryFn: async () => {
      const response = await authService.getMe();
      return response.data.user;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
};

const useRegister = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (response) => {
      const { user, token } = response.data;
      setAuth(user, token);
      queryClient.setQueryData(QUERY_KEYS.AUTH.ME, user);
      toast.success("Account created successfully");
      navigate(ROUTES.DASHBOARD);
    },
    onError: (error) => {
      toast.error(error.message || "Registration failed");
    },
  });
};

const useLogin = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      const { user, token } = response.data;
      setAuth(user, token);
      queryClient.setQueryData(QUERY_KEYS.AUTH.ME, user);
      toast.success("Logged in successfully");
      navigate(ROUTES.DASHBOARD);
    },
    onError: (error) => {
      toast.error(error.message || "Login failed");
    },
  });
};

const useLogout = () => {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      toast.success("Logged out successfully");
      navigate(ROUTES.AUTH.LOGIN);
    },
    onError: () => {
      clearAuth();
      queryClient.clear();
      navigate(ROUTES.AUTH.LOGIN);
    },
  });
};

const useChangePassword = () => {
  return useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to change password");
    },
  });
};

export { useGetMe, useRegister, useLogin, useLogout, useChangePassword };
