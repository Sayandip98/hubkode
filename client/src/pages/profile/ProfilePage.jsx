import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Link as LinkIcon,
  Building2,
  Calendar,
  Users,
} from "lucide-react";

import { useAuthStore } from "@store/authStore.js";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import * as userService from "@services/user.service.js";
import { useUserRepositories } from "@hooks/useRepository.js";

import Avatar from "@components/common/Avatar.jsx";
import Button from "@components/common/Button.jsx";
import { PageLoader } from "@components/common/LoadingSpinner.jsx";
import ErrorMessage from "@components/common/ErrorMessage.jsx";
import EmptyState from "@components/common/EmptyState.jsx";

import { formatDate, timeAgo } from "@utils/formatDate.js";

import { formatNumber } from "@utils/formatNumber.js";

import QUERY_KEYS from "@constants/queryKeys.js";
import ROUTES from "@constants/routes.js";

import toast from "react-hot-toast";

const ProfilePage = () => {
  const { username } = useParams();

  const { user: currentUser, isAuthenticated } = useAuthStore();

  const queryClient = useQueryClient();

  // Fetch profile
  const {
    data: profileData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.USERS.PROFILE(username),

    queryFn: async () => {
      const response = await userService.getUserProfile(username);

      return response.data;
    },

    enabled: !!username,
  });

  // Fetch repositories
  const { data: reposData } = useUserRepositories(username, {
    sort: "updated",
    limit: 6,
  });

  // Follow / unfollow
  const { mutate: toggleFollow, isPending: isFollowPending } = useMutation({
    mutationFn: ({ isFollowing }) =>
      isFollowing
        ? userService.unfollowUser(username)
        : userService.followUser(username),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.USERS.PROFILE(username),
      });
    },

    onError: (error) => {
      toast.error(error.message || "Failed to update follow status");
    },
  });

  // Loading state
  if (isLoading) {
    return <PageLoader label="Loading profile..." />;
  }

  // Error state
  if (isError) {
    return <ErrorMessage title="User not found" onRetry={refetch} />;
  }

  const { user, isOwnProfile } = profileData || {};

  const repositories = reposData?.data?.repositories || [];

  // Check following status
  const isFollowing =
    user?.followers?.some(
      (follower) => (follower?._id || follower) === currentUser?._id,
    ) || false;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* =========================
          PROFILE SIDEBAR
      ========================== */}
      <aside className="lg:col-span-1">
        <div className="flex flex-col items-center lg:items-start gap-4">
          {/* Avatar */}
          <Avatar
            src={user?.avatarUrl}
            name={user?.displayName || user?.username}
            size="4xl"
            className="ring-4 ring-border-default"
          />

          {/* Name */}
          <div className="text-center lg:text-left">
            <h1 className="text-xl font-bold text-text-primary">
              {user?.displayName || user?.username}
            </h1>

            <p className="text-text-secondary text-base">@{user?.username}</p>
          </div>

          {/* Bio */}
          {user?.bio && (
            <p className="text-sm text-text-secondary text-center lg:text-left">
              {user.bio}
            </p>
          )}

          {/* Follow Button */}
          {isAuthenticated && !isOwnProfile && (
            <Button
              variant={isFollowing ? "secondary" : "primary"}
              size="sm"
              fullWidth
              isLoading={isFollowPending}
              onClick={() => toggleFollow({ isFollowing })}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
          )}

          {/* Edit Profile */}
          {isOwnProfile && (
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => (window.location.href = ROUTES.SETTINGS.PROFILE)}
            >
              Edit profile
            </Button>
          )}

          {/* Followers / Following */}
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <Link
              to={ROUTES.PROFILE_TAB(username, "followers")}
              className="flex items-center gap-1 hover:text-text-primary"
            >
              <Users size={14} />
              <span className="font-semibold text-text-primary">
                {formatNumber(user?.followersCount || 0)}
              </span>
              followers
            </Link>

            <span className="text-text-muted">·</span>

            <Link
              to={ROUTES.PROFILE_TAB(username, "following")}
              className="hover:text-text-primary"
            >
              <span className="font-semibold text-text-primary">
                {formatNumber(user?.followingCount || 0)}
              </span>{" "}
              following
            </Link>
          </div>

          {/* User Information */}
          <div className="flex flex-col gap-2 text-sm text-text-secondary w-full">
            {/* Company */}
            {user?.company && (
              <span className="flex items-center gap-2">
                <Building2 size={14} className="shrink-0" />

                {user.company}
              </span>
            )}

            {/* Location */}
            {user?.location && (
              <span className="flex items-center gap-2">
                <MapPin size={14} className="shrink-0" />

                {user.location}
              </span>
            )}

            {/* Website */}
            {user?.website && (
              <a
                href={
                  user.website.startsWith("http")
                    ? user.website
                    : `https://${user.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-text-link hover:underline"
              >
                <LinkIcon size={14} className="shrink-0" />

                <span className="truncate">{user.website}</span>
              </a>
            )}

            {/* Joined Date */}
            <span className="flex items-center gap-2">
              <Calendar size={14} className="shrink-0" />
              Joined {formatDate(user?.createdAt)}
            </span>
          </div>
        </div>
      </aside>

      {/* =========================
          MAIN CONTENT
      ========================== */}
      <main className="lg:col-span-3">
        {/* Repository Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-text-primary">
            Repositories
          </h2>

          {isOwnProfile && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => (window.location.href = ROUTES.NEW_REPOSITORY)}
            >
              New
            </Button>
          )}
        </div>

        {/* Repository List */}
        {repositories.length === 0 ? (
          <EmptyState
            title="No repositories yet"
            description={
              isOwnProfile
                ? "Create your first repository."
                : `${username} hasn't created any public repositories yet.`
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {repositories.map((repo) => (
              <div
                key={repo._id}
                className="bg-surface-secondary border border-border-default rounded-lg p-4 hover:border-border-emphasis transition-colors"
              >
                {/* Repository Name */}
                <Link
                  to={ROUTES.REPOSITORY.ROOT(username, repo.name)}
                  className="text-sm font-semibold text-text-link hover:underline"
                >
                  {repo.name}
                </Link>

                {/* Description */}
                {repo.description && (
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                    {repo.description}
                  </p>
                )}

                {/* Repository Metadata */}
                <div className="flex items-center gap-3 mt-3 text-xs text-text-muted">
                  {repo.language && <span>{repo.language}</span>}

                  <span>Updated {timeAgo(repo.updatedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
