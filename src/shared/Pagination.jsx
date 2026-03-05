import React from 'react';

/**
 * Basic pagination control used across various list pages.
 *
 * Props:
 *  - currentPage: number (1-based)
 *  - totalItems: number
 *  - pageSize: number
 *  - onPageChange: callback(newPage)
 */
function Pagination({ currentPage, totalItems, pageSize, onPageChange }) {
  if (!totalItems || pageSize <= 0) return null;

  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const firstItemIndex = (currentPage - 1) * pageSize + 1;
  const lastItemIndex = Math.min(currentPage * pageSize, totalItems);

  const handleClick = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    onPageChange(newPage);
  };

  // build a small range around the current page for display
  const pageButtons = [];
  const range = 2; // show 2 pages before/after current
  for (let p = 1; p <= totalPages; p++) {
    if (
      p === 1 ||
      p === totalPages ||
      (p >= currentPage - range && p <= currentPage + range)
    ) {
      pageButtons.push(p);
    } else if (
      pageButtons[pageButtons.length - 1] !== '...'
    ) {
      pageButtons.push('...');
    }
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-200">
      <div className="text-xs text-slate-600">
        Showing {firstItemIndex} - {lastItemIndex} of {totalItems}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleClick(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Prev
        </button>
        {pageButtons.map((p, idx) =>
          p === '...' ? (
            <span key={`dots-${idx}`} className="px-2">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => handleClick(p)}
              className={`px-2 py-1 rounded-lg border border-slate-300 hover:bg-slate-50 ${
                p === currentPage
                  ? 'bg-[#FF4D4F] text-white border-[#FF4D4F]'
                  : 'bg-white text-slate-700'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => handleClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;
