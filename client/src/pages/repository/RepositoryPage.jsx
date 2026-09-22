import { useOutletContext, useParams, Link } from "react-router-dom";
import { useState } from "react";
import {
  GitBranch,
  File,
  Folder,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";

import { useFileTree, useBranches } from "@hooks/useRepository.js";

import Button from "@components/common/Button.jsx";
import Select from "@components/common/Select.jsx";
import { PageLoader } from "@components/common/LoadingSpinner.jsx";
import EmptyState from "@components/common/EmptyState.jsx";
import ErrorMessage from "@components/common/ErrorMessage.jsx";

import { timeAgo } from "@utils/formatDate.js";
import ROUTES from "@constants/routes.js";

const CloneSection = ({ owner, repoName }) => {
  const [copied, setCopied] = useState(false);

  const cloneUrl = `https://github.com/${owner}/${repoName}.git`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cloneUrl);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy clone URL:", error);
    }
  };

  return (
    <div className="bg-surface-secondary border border-border-default rounded-lg p-4">
      <h3 className="text-sm font-semibold text-text-primary mb-3">
        Clone repository
      </h3>

      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs bg-surface-tertiary px-3 py-2 rounded-md text-text-secondary font-mono truncate">
          {cloneUrl}
        </code>

        <Button
          variant="secondary"
          size="icon-sm"
          onClick={handleCopy}
          aria-label="Copy clone URL"
        >
          {copied ? (
            <Check size={14} className="text-accent-green" />
          ) : (
            <Copy size={14} />
          )}
        </Button>
      </div>
    </div>
  );
};

const FileTreeRow = ({ entry, owner, repoName, branch }) => {
  const isDir = entry.type === "dir";

  const Icon = isDir ? Folder : File;

  const to = isDir
    ? ROUTES.REPOSITORY.TREE(owner, repoName, branch, entry.path)
    : ROUTES.REPOSITORY.BLOB(owner, repoName, branch, entry.path);

  return (
    <tr className="hover:bg-surface-tertiary/50 transition-colors border-t border-border-muted first:border-0">
      <td className="py-2 px-4">
        <Link
          to={to}
          className="flex items-center gap-2 text-sm text-text-primary hover:text-text-link hover:no-underline"
        >
          <Icon
            size={15}
            className={
              isDir ? "text-accent-blue shrink-0" : "text-text-muted shrink-0"
            }
          />

          <span className="truncate">{entry.name}</span>
        </Link>
      </td>

      <td className="py-2 px-4 hidden md:table-cell">
        <span className="text-xs text-text-secondary truncate max-w-xs block">
          {entry.lastCommit?.message || ""}
        </span>
      </td>

      <td className="py-2 px-4 text-right hidden sm:table-cell">
        <span className="text-xs text-text-muted whitespace-nowrap">
          {entry.lastCommit?.date ? timeAgo(entry.lastCommit.date) : ""}
        </span>
      </td>
    </tr>
  );
};

const RepositoryPage = () => {
  const { owner, repoName } = useParams();

  const context = useOutletContext();
  const { repository } = context || {};

  const currentBranch = repository?.defaultBranch || "main";

  const { data: branchesData } = useBranches(owner, repoName);

  const branches = branchesData || [];

  const {
    data: treeData,
    isLoading,
    isError,
    refetch,
  } = useFileTree(owner, repoName, currentBranch, "");

  const tree = treeData?.data?.tree || [];

  /*
   * Empty repository
   */
  if (!repository?.isInitialized) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-surface-secondary border border-border-default rounded-lg p-8 text-center mb-6">
          <AlertCircle
            size={40}
            className="text-text-muted mx-auto mb-4 opacity-50"
          />

          <h2 className="text-lg font-semibold text-text-primary mb-2">
            This repository is empty
          </h2>

          <p className="text-sm text-text-secondary mb-6">
            Get started by creating a new file or pushing an existing
            repository.
          </p>

          <div className="text-left bg-surface-tertiary rounded-lg p-4">
            <p className="text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">
              Quick setup
            </p>

            <code className="text-xs text-text-primary font-mono block">
              git init
              <br />
              git remote add origin https://hubkode.dev/{owner}/{repoName}.git
              <br />
              git branch -M main
              <br />
              git push -u origin main
            </code>
          </div>
        </div>

        <CloneSection owner={owner} repoName={repoName} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-repo gap-6">
      {/* Repository files */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <Select
            options={branches.map((branch) => ({
              value: branch.name,
              label: branch.name,
            }))}
            value={currentBranch}
            onChange={() => {}}
            fullWidth={false}
            className="w-48"
          />

          <div className="flex items-center gap-2 text-xs text-text-muted">
            <GitBranch size={13} />
            <span>{branches.length} branches</span>
          </div>
        </div>

        {isLoading ? (
          <PageLoader label="Loading files..." />
        ) : isError ? (
          <ErrorMessage title="Failed to load files" onRetry={refetch} />
        ) : tree.length === 0 ? (
          <EmptyState title="This branch is empty" />
        ) : (
          <div className="bg-surface-secondary border border-border-default rounded-lg overflow-hidden">
            <table className="w-full">
              <tbody>
                {tree.map((entry) => (
                  <FileTreeRow
                    key={entry.path}
                    entry={entry}
                    owner={owner}
                    repoName={repoName}
                    branch={currentBranch}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <aside className="flex flex-col gap-4">
        {repository?.description && (
          <div className="bg-surface-secondary border border-border-default rounded-lg p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-2">
              About
            </h3>

            <p className="text-sm text-text-secondary">
              {repository.description}
            </p>

            {/* Website */}
            {repository.website && (
              <a
                href={repository.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-text-link hover:underline mt-2 block break-all"
              >
                {repository.website}
              </a>
            )}

            {/* Topics */}
            {repository.topics?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {repository.topics.map((topic) => (
                  <span
                    key={topic}
                    className="text-xs px-2 py-0.5 bg-brand-600/10 text-brand-300 border border-brand-500/20 rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <CloneSection owner={owner} repoName={repoName} />
      </aside>
    </div>
  );
};

export default RepositoryPage;
