import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";
import Button from "@components/common/Button.jsx";
import ROUTES from "@constants/routes.js";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-surface-primary flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-6">
        <p className="text-8xl font-bold text-text-muted opacity-20 select-none">
          404
        </p>
      </div>

      <h1 className="text-2xl font-bold text-text-primary mb-2">
        This is not the page you are looking for.
      </h1>

      <p className="text-sm text-text-secondary mb-8 max-w-sm">
        The page you were looking for doesn't exist. It may have been moved or
        deleted.
      </p>

      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          leftIcon={<Home size={15} />}
          onClick={() => (window.location.href = ROUTES.DASHBOARD)}
        >
          Take me home
        </Button>
        <Button
          variant="secondary"
          leftIcon={<Search size={15} />}
          onClick={() => (window.location.href = ROUTES.EXPLORE)}
        >
          Explore
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
