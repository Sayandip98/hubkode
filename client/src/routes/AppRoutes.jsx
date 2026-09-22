import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@layouts/MainLayout.jsx";
import AuthLayout from "@layouts/AuthLayout.jsx";
import RepositoryLayout from "@layouts/RepositoryLayout.jsx";

import LoginPage from "@pages/auth/LoginPage.jsx";
import RegisterPage from "@pages/auth/RegisterPage.jsx";
import DashboardPage from "@pages/dashboard/DashboardPage.jsx";
import ExplorePage from "@pages/explore/ExplorePage.jsx";
import ProfilePage from "@pages/profile/ProfilePage.jsx";
import RepositoryPage from "@pages/repository/RepositoryPage.jsx";
import FileViewerPage from "@pages/repository/FileViewerPage.jsx";
import CommitHistoryPage from "@pages/repository/CommitHistoryPage.jsx";
import CommitDetailPage from "@pages/repository/CommitDetailPage.jsx";
import NewRepositoryPage from "@pages/repository/NewRepositoryPage.jsx";
import RepositorySettingsPage from "@pages/repository/RepositorySettingsPage.jsx";
import IssuesPage from "@pages/issues/IssuesPage.jsx";
import IssueDetailPage from "@pages/issues/IssueDetailPage.jsx";
import NewIssuePage from "@pages/issues/NewIssuePage.jsx";
import PullRequestsPage from "@pages/pullRequests/PullRequestsPage.jsx";
import PRDetailPage from "@pages/pullRequests/PRDetailPage.jsx";
import NewPRPage from "@pages/pullRequests/NewPRPage.jsx";
import OrganizationPage from "@pages/organization/OrganizationPage.jsx";
import NewOrganizationPage from "@pages/organization/NewOrganizationPage.jsx";
import NotificationsPage from "@pages/notifications/NotificationsPage.jsx";
import SettingsPage from "@pages/settings/SettingsPage.jsx";
import ProfileSettingsPage from "@pages/settings/ProfileSettingsPage.jsx";
import SecuritySettingsPage from "@pages/settings/SecuritySettingsPage.jsx";
import NotFoundPage from "@pages/NotFoundPage.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/explore" replace />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<MainLayout requireAuth />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/new" element={<NewRepositoryPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/organizations/new" element={<NewOrganizationPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/profile" element={<ProfileSettingsPage />} />
        <Route path="/settings/security" element={<SecuritySettingsPage />} />
      </Route>

      <Route element={<MainLayout />}>
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/:username" element={<ProfilePage />} />
        <Route path="/orgs/:orgName" element={<OrganizationPage />} />
      </Route>

      <Route path="/:owner/:repoName" element={<RepositoryLayout />}>
        <Route index element={<RepositoryPage />} />
        <Route path="tree/:branch" element={<RepositoryPage />} />
        <Route path="tree/:branch/*" element={<RepositoryPage />} />
        <Route path="blob/:branch/*" element={<FileViewerPage />} />
        <Route path="commits/:branch" element={<CommitHistoryPage />} />
        <Route path="commit/:sha" element={<CommitDetailPage />} />
        <Route path="issues" element={<IssuesPage />} />
        <Route path="issues/new" element={<NewIssuePage />} />
        <Route path="issues/:issueNumber" element={<IssueDetailPage />} />
        <Route path="pulls" element={<PullRequestsPage />} />
        <Route path="pulls/new" element={<NewPRPage />} />
        <Route path="pulls/:prNumber" element={<PRDetailPage />} />
        <Route path="settings" element={<RepositorySettingsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
