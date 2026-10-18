export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalProblems = 0,
  limit = 10,
  isLoading = false,
  onPageChange,
}) {
  if (totalProblems <= 0) return null;

  const startItem = Math.min((currentPage - 1) * limit + 1, totalProblems);
  const endItem = Math.min(currentPage * limit, totalProblems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-[#16171a] border-t border-[#2a2c31] text-xs text-[#9a9ca3]">
      {/* Item Range Counter */}
      <div>
        Showing{" "}
        <span className="font-semibold text-white tabular-nums">{startItem}</span> to{" "}
        <span className="font-semibold text-white tabular-nums">{endItem}</span> of{" "}
        <span className="font-semibold text-white tabular-nums">{totalProblems}</span> problems
      </div>

      {/* Page Navigation Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange && onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage <= 1 || isLoading}
            className="px-2.5 py-1 rounded-lg border border-[#2a2c31] bg-[#18191c] hover:bg-[#222428] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1 font-medium"
          >
            ‹ Prev
          </button>

          {/* Numbered Page Buttons */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onPageChange && onPageChange(pageNum)}
              disabled={isLoading}
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center ${
                currentPage === pageNum
                  ? "bg-[#e2a24a] text-black font-bold shadow-sm"
                  : "bg-[#18191c] border border-[#2a2c31] hover:bg-[#222428] hover:text-white text-[#c4c6cb]"
              }`}
            >
              {pageNum}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() => onPageChange && onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage >= totalPages || isLoading}
            className="px-2.5 py-1 rounded-lg border border-[#2a2c31] bg-[#18191c] hover:bg-[#222428] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1 font-medium"
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
}
