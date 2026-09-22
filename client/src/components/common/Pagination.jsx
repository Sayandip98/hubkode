import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import cn from "@utils/cn.js";
import Button from "./Button.jsx";

const getPageNumbers = (currentPage, totalPages, delta = 2) => {
  const range = [];
  const rangeWithDots = [];

  for (
    let i = Math.max(2, currentPage - delta);
    i <= Math.min(totalPages - 1, currentPage + delta);
    i++
  ) {
    range.push(i);
  }

  if (currentPage - delta > 2) {
    rangeWithDots.push(1, "...");
  } else {
    rangeWithDots.push(1);
  }

  rangeWithDots.push(...range);

  if (currentPage + delta < totalPages - 1) {
    rangeWithDots.push("...", totalPages);
  } else if (totalPages > 1) {
    rangeWithDots.push(totalPages);
  }

  return rangeWithDots;
};

const Pagination = ({
  page,
  pages,
  total,
  limit,
  onPageChange,
  className = "",
  showInfo = true,
}) => {
  if (pages <= 1) return null;

  const pageNumbers = getPageNumbers(page, pages);
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-3",
        className,
      )}
    >
      {showInfo && (
        <p className="text-sm text-text-secondary order-2 sm:order-1">
          Showing <span className="font-medium text-text-primary">{start}</span>{" "}
          to <span className="font-medium text-text-primary">{end}</span> of{" "}
          <span className="font-medium text-text-primary">{total}</span> results
        </p>
      )}

      <nav
        className="flex items-center gap-1 order-1 sm:order-2"
        aria-label="Pagination"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          leftIcon={<ChevronLeft size={14} />}
          aria-label="Previous page"
        >
          Previous
        </Button>

        <div className="flex items-center gap-1 mx-1">
          {pageNumbers.map((pageNum, index) =>
            pageNum === "..." ? (
              <span
                key={`dots-${index}`}
                className="px-2 text-text-muted"
                aria-hidden
              >
                <MoreHorizontal size={14} />
              </span>
            ) : (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                aria-current={pageNum === page ? "page" : undefined}
                className={cn(
                  "h-8 w-8 text-sm rounded-md transition-colors",
                  pageNum === page
                    ? "bg-brand-600 text-white font-medium"
                    : "text-text-secondary hover:bg-surface-tertiary hover:text-text-primary",
                )}
              >
                {pageNum}
              </button>
            ),
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          rightIcon={<ChevronRight size={14} />}
          aria-label="Next page"
        >
          Next
        </Button>
      </nav>
    </div>
  );
};

export default Pagination;
