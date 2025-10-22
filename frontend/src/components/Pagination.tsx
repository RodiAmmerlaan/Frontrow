import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasActiveFilters: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage,
  hasActiveFilters,
  onPageChange 
}: PaginationProps) {
  const safeCurrentPage = typeof currentPage === 'number' && !isNaN(currentPage) ? Math.max(1, currentPage) : 1;
  const safeTotalPages = typeof totalPages === 'number' && !isNaN(totalPages) ? Math.max(0, totalPages) : 0;
  const safeTotalItems = typeof totalItems === 'number' && !isNaN(totalItems) ? Math.max(0, totalItems) : 0;
  
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    
    let startPage = Math.max(1, safeCurrentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(safeTotalPages, startPage + maxVisibleButtons - 1);
    
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }
    
    buttons.push(
      <button
        key="prev"
        className={`pagination-btn pagination-nav ${safeCurrentPage === 1 ? 'disabled' : ''}`}
        onClick={() => onPageChange(safeCurrentPage - 1)}
        disabled={safeCurrentPage === 1}
      >
        ‹
      </button>
    );
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`pagination-btn ${safeCurrentPage === i ? 'active' : ''}`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      );
    }
    
    buttons.push(
      <button
        key="next"
        className={`pagination-btn pagination-nav ${safeCurrentPage === safeTotalPages ? 'disabled' : ''}`}
        onClick={() => onPageChange(safeCurrentPage + 1)}
        disabled={safeCurrentPage === safeTotalPages}
      >
        ›
      </button>
    );
    
    return buttons;
  };

  if (safeTotalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span>
          Pagina {safeCurrentPage} van {safeTotalPages} ({safeTotalItems} evenementen{hasActiveFilters ? ' gefilterd' : ''})
        </span>
      </div>
      <div className="pagination-controls">
        {renderPaginationButtons()}
      </div>
    </div>
  );
}