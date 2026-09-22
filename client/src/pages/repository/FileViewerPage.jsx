import { useParams, Link, useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import { Copy, Check, Download, ChevronRight } from "lucide-react";
import { useFileContent } from "@hooks/useRepository.js";
import Button from "@components/common/Button.jsx";
import { PageLoader } from "@components/common/LoadingSpinner.jsx";
import ErrorMessage from "@components/common/ErrorMessage.jsx";
import { formatBytes } from "@utils/formatNumber.js";
import {
  getFileLanguage,
  getLanguageDisplayName,
} from "@utils/getFileLanguage.js";
import ROUTES from "@constants/routes.js";

const FileViewerPage = () => {
  const { owner, repoName, branch, "*": filePath } = useParams();
  const { data, isLoading, isError, refetch } = useFileContent(
    owner,
    repoName,
    branch,
    filePath,
  );

  const [copied, setCopied] = useState(false);
  const [highlighted, setHighlighted] = useState(null);

  const file = data?.data;

  const language = file ? getFileLanguage(file.name) : "text";

  useEffect(() => {
    if (!file?.content) return;

    const highlight = async () => {
      try {
        const { codeToHtml } = await import("shiki");
        const html = await codeToHtml(file.content, {
          lang: language,
          theme: "github-dark",
        });
        setHighlighted(html);
      } catch {
        setHighlighted(null);
      }
    };

    highlight();
  }, [file?.content, language]);

  const handleCopy = () => {
    if (file?.content) {
      navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const pathParts = filePath ? filePath.split("/") : [];

  if (isLoading) return <PageLoader label="Loading file..." />;
  if (isError) return <ErrorMessage title="File not found" onRetry={refetch} />;
  if (!file) return null;

  return (
    <div>
      <nav className="flex items-center gap-1 text-sm mb-4 flex-wrap">
        <Link
          to={ROUTES.REPOSITORY.ROOT(owner, repoName)}
          className="text-text-link hover:underline"
        >
          {repoName}
        </Link>
        {pathParts.map((part, index) => {
          const partPath = pathParts.slice(0, index + 1).join("/");
          const isLast = index === pathParts.length - 1;
          return (
            <span key={partPath} className="flex items-center gap-1">
              <ChevronRight size={14} className="text-text-muted" />
              {isLast ? (
                <span className="font-semibold text-text-primary">{part}</span>
              ) : (
                <Link
                  to={ROUTES.REPOSITORY.TREE(owner, repoName, branch, partPath)}
                  className="text-text-link hover:underline"
                >
                  {part}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      <div className="bg-surface-secondary border border-border-default rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-default bg-surface-tertiary">
          <div className="flex items-center gap-3 text-xs text-text-secondary">
            <span>{getLanguageDisplayName(language)}</span>
            <span>{formatBytes(file.size)}</span>
            {file.content && (
              <span>{file.content.split("\n").length} lines</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCopy}
              aria-label="Copy file content"
              disabled={file.isBinary}
            >
              {copied ? (
                <Check size={14} className="text-accent-green" />
              ) : (
                <Copy size={14} />
              )}
            </Button>
          </div>
        </div>

        {file.isBinary ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <p className="text-sm text-text-secondary mb-2">
              This file is binary and cannot be displayed.
            </p>
            <p className="text-xs text-text-muted">
              {getLanguageDisplayName(language)} · {formatBytes(file.size)}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {highlighted ? (
              <div
                className="text-sm [&>pre]:!bg-transparent [&>pre]:p-4 [&>pre]:m-0 [&>pre]:overflow-visible"
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
            ) : (
              <pre className="p-4 text-sm text-text-primary font-mono overflow-x-auto whitespace-pre">
                <code>{file.content}</code>
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileViewerPage;
