import ContinuousPagination from "./ContinuousPagination";

export default function Pagination({ currentPage = 1, totalPages = 1, isLoading = false, onPageChange }) {
  // nothing to page through, so no empty footer bar
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center px-4 py-3 bg-surface-alt border-t border-line">
      <ContinuousPagination
        currentPage={currentPage}
        totalPages={totalPages}
        disabled={isLoading}
        onPageChange={(page) => onPageChange && onPageChange(page)}
      />
    </div>
  );
}
