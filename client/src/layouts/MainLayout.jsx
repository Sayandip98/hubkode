import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@store/authStore.js";
import Header from "@components/layout/Header.jsx";
import Footer from "@components/layout/Footer.jsx";
import ROUTES from "@constants/routes.js";

const MainLayout = ({ requireAuth = false }) => {
  const { isAuthenticated } = useAuthStore();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={ROUTES.AUTH.LOGIN} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-primary">
      <Header />
      <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
