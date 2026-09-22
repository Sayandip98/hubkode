import { Navigate, Outlet } from "react-router-dom";
import { Code2 } from "lucide-react";
import { useAuthStore } from "@store/authStore.js";
import ROUTES from "@constants/routes.js";

const AuthLayout = () => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <div className="min-h-screen bg-surface-primary flex flex-col">
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2">
          <Code2 size={32} className="text-brand-400" />
          <span className="text-xl font-bold text-text-primary">HubKode</span>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>

      <footer className="py-6 text-center">
        <p className="text-xs text-text-muted">
          © {new Date().getFullYear()} HubKode. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default AuthLayout;
