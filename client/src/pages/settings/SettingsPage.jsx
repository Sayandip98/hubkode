import { NavLink, Outlet, Navigate } from "react-router-dom";
import { User, Shield, Palette } from "lucide-react";
import ROUTES from "@constants/routes.js";
import cn from "@utils/cn.js";

const SETTINGS_NAV = [
  { label: "Profile", to: ROUTES.SETTINGS.PROFILE, icon: User },
  { label: "Security", to: ROUTES.SETTINGS.SECURITY, icon: Shield },
];

const SettingsPage = () => {
  return <Navigate to={ROUTES.SETTINGS.PROFILE} replace />;
};

export default SettingsPage;
