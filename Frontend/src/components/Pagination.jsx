import ContinuousPagination from "./ContinuousPagination";

export default function Pagination({ currentPage = 1, totalPages = 1, isLoading = false, onPageChange }) {
  // nothing to page through, so no empty footer bar
  if (totalPages <= 1) return null;

  // pagination-classic keeps the pre-redesign look for this control (see index.css)
  return (
    <div className="pagination-classic flex justify-center">
      <ContinuousPagination
        currentPage={currentPage}
        totalPages={totalPages}
        disabled={isLoading}
        onPageChange={(page) => onPageChange && onPageChange(page)}
      />
    </div>
  );
}
