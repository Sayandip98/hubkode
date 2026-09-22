import { useParams, Link } from "react-router-dom";
import { MapPin, Link as LinkIcon, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import * as orgService from "@services/organization.service.js";
import { useAuthStore } from "@store/authStore.js";
import Avatar from "@components/common/Avatar.jsx";
import { PageLoader } from "@components/common/LoadingSpinner.jsx";
import ErrorMessage from "@components/common/ErrorMessage.jsx";
import QUERY_KEYS from "@constants/queryKeys.js";
import ROUTES from "@constants/routes.js";
import { timeAgo } from "@utils/formatDate.js";

const OrganizationPage = () => {
  const { orgName } = useParams();
  const { user, isAuthenticated } = useAuthStore();

  // Organization details
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: QUERY_KEYS.ORGANIZATIONS.DETAIL(orgName),
    queryFn: async () => {
      const response = await orgService.getOrganization(orgName);
      return response.data;
    },
    enabled: !!orgName,
  });

  // Organization repositories
  const { data: reposData } = useQuery({
    queryKey: QUERY_KEYS.ORGANIZATIONS.REPOSITORIES(orgName),
    queryFn: async () => {
      const response = await orgService.getOrganizationRepositories(orgName, {
        limit: 6,
      });

      return response.data;
    },
    enabled: !!orgName,
  });

  if (isLoading) {
    return <PageLoader label="Loading organization..." />;
  }

  if (isError) {
    return <ErrorMessage title="Organization not found" onRetry={refetch} />;
  }

  const { organization, isMember, memberRole } = data || {};

  const repositories = reposData?.repositories || [];

  const isOwner = memberRole === "owner";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <aside className="lg:col-span-1">
        <div className="flex flex-col items-center lg:items-start gap-4">
          <Avatar
            src={organization?.avatarUrl}
            name={organization?.displayName || organization?.name}
            size="4xl"
            className="ring-4 ring-border-default"
          />

          <div className="text-center lg:text-left">
            <h1 className="text-xl font-bold text-text-primary">
              {organization?.displayName || organization?.name}
            </h1>

            <p className="text-text-secondary">@{organization?.name}</p>
          </div>

          {organization?.description && (
            <p className="text-sm text-text-secondary">
              {organization.description}
            </p>
          )}

          <div className="flex flex-col gap-2 text-sm text-text-secondary w-full">
            {/* Members */}
            <span className="flex items-center gap-2">
              <Users size={14} />
              {organization?.membersCount || 0} members
            </span>

            {/* Location */}
            {organization?.location && (
              <span className="flex items-center gap-2">
                <MapPin size={14} />
                {organization.location}
              </span>
            )}

            {/* Website */}
            {organization?.website && (
              <a
                href={organization.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-text-link hover:underline"
              >
                <LinkIcon size={14} />
                <span className="truncate">{organization.website}</span>
              </a>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:col-span-3">
        {/* Repositories */}
        <div className="mb-6">
          <h2 className="text-base font-semibold text-text-primary mb-3">
            Repositories
          </h2>

          {repositories.length === 0 ? (
            <p className="text-sm text-text-secondary">No repositories yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {repositories.map((repo) => (
                <div
                  key={repo._id}
                  className="bg-surface-secondary border border-border-default rounded-lg p-4 hover:border-border-emphasis transition-colors"
                >
                  <Link
                    to={ROUTES.REPOSITORY.ROOT(orgName, repo.name)}
                    className="text-sm font-semibold text-text-link hover:underline"
                  >
                    {repo.name}
                  </Link>

                  {repo.description && (
                    <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                      {repo.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                    {repo.language && <span>{repo.language}</span>}

                    <span>Updated {timeAgo(repo.updatedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Members */}
        <div>
          <h2 className="text-base font-semibold text-text-primary mb-3">
            Members
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {organization?.members?.slice(0, 9).map((member) => {
              const memberUser = member.user;

              return (
                <Link
                  key={memberUser?._id || memberUser}
                  to={ROUTES.PROFILE(memberUser?.username)}
                  className="flex items-center gap-2 p-3 bg-surface-secondary border border-border-default rounded-lg hover:border-border-emphasis transition-colors hover:no-underline"
                >
                  <Avatar
                    src={memberUser?.avatarUrl}
                    name={memberUser?.username}
                    size="sm"
                  />

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {memberUser?.displayName || memberUser?.username}
                    </p>

                    <p className="text-xs text-text-muted capitalize">
                      {member.role}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrganizationPage;
