import { useState } from "react";
import { Star, GitFork, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useExploreRepositories } from "@hooks/useSearch.js";
import SearchBar from "@components/common/SearchBar.jsx";
import Select from "@components/common/Select.jsx";
import Avatar from "@components/common/Avatar.jsx";
import Pagination from "@components/common/Pagination.jsx";
import { PageLoader } from "@components/common/LoadingSpinner.jsx";
import EmptyState from "@components/common/EmptyState.jsx";
import ErrorMessage from "@components/common/ErrorMessage.jsx";
import { timeAgo } from "@utils/formatDate.js";
import { formatNumber } from "@utils/formatNumber.js";
import ROUTES from "@constants/routes.js";

const SORT_OPTIONS = [
  { value: "stars", label: "Most stars" },
  { value: "updated", label: "Recently updated" },
  { value: "created", label: "Newest" },
  { value: "forks", label: "Most forks" },
];

const RepositoryCard = ({ repository }) => {
  const ownerUsername =
    repository.owner?.username || repository.owner?.name || "unknown";

  return (
    <div className="bg-surface-secondary border border-border-default rounded-lg p-4 hover:border-border-emphasis transition-colors">
      <div className="flex items-start gap-3">
        <Avatar
          src={repository.owner?.avatarUrl}
          name={repository.owner?.displayName || ownerUsername}
          size="md"
          className="shrink-0 mt-0.5"
        />

        <div className="flex-1 min-w-0">
          <Link
            to={ROUTES.REPOSITORY.ROOT(ownerUsername, repository.name)}
            className="text-sm font-semibold text-text-link hover:underline"
          >
            {ownerUsername}/{repository.name}
          </Link>

          {repository.description && (
            <p className="text-xs text-text-secondary mt-1 line-clamp-2">
              {repository.description}
            </p>
          )}

          {repository.topics?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {repository.topics.slice(0, 4).map((topic) => (
                <span
                  key={topic}
                  className="text-2xs px-2 py-0.5 bg-brand-600/10 text-brand-300 border border-brand-500/20 rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
            {repository.language && <span>{repository.language}</span>}
            <span className="flex items-center gap-1">
              <Star size={11} />
              {formatNumber(repository.starsCount || 0)}
            </span>
            <span className="flex items-center gap-1">
              <GitFork size={11} />
              {formatNumber(repository.forkCount || 0)}
            </span>
            <span>Updated {timeAgo(repository.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExplorePage = () => {
  const [sort, setSort] = useState("stars");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, refetch } = useExploreRepositories({
    sort,
    page,
    limit: 20,
  });

  const repositories = data?.data?.repositories || [];
  const pagination = data?.pagination;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Explore</h1>
        <p className="text-sm text-text-secondary">
          Discover repositories, people, and organizations.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          onClear={() => setSearch("")}
          placeholder="Search repositories..."
          className="flex-1"
        />

        <Select
          options={SORT_OPTIONS}
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-48"
          fullWidth={false}
        />
      </div>

      {isLoading ? (
        <PageLoader label="Loading repositories..." />
      ) : isError ? (
        <ErrorMessage title="Failed to load repositories" onRetry={refetch} />
      ) : repositories.length === 0 ? (
        <EmptyState
          title="No repositories found"
          description="Try adjusting your filters."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {repositories.map((repo) => (
              <RepositoryCard key={repo._id} repository={repo} />
            ))}
          </div>

          {pagination && (
            <Pagination
              page={pagination.page}
              pages={pagination.pages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ExplorePage;
