import { Link } from "react-router-dom";
import { Code2 } from "lucide-react";
import ROUTES from "@constants/routes.js";

const Footer = () => {
  return (
    <footer className="border-t border-border-muted bg-surface-primary mt-auto">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-text-muted">
            <Code2 size={16} className="text-brand-400" />
            <span className="text-sm">
              © {new Date().getFullYear()} HubKode
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {[
              { label: "Explore", to: ROUTES.EXPLORE },
              { label: "Privacy", to: "#" },
              { label: "Terms", to: "#" },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-xs text-text-muted hover:text-text-secondary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
