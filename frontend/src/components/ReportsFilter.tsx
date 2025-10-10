import React from 'react';

interface ReportsFilterProps {
  filters: {
    month: string;
    year: string;
  };
  onFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onFilterSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export function ReportsFilter({ filters, onFilterChange, onFilterSubmit, loading }: ReportsFilterProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  return (
    <div className="reports-page-filter-section">
      <h3 className="reports-page-filter-title">Filter Reports</h3>
      <form onSubmit={onFilterSubmit} className="reports-page-filter-form">
        <div className="reports-page-filter-group">
          <label htmlFor="year" className="reports-page-filter-label">Year:</label>
          <select
            id="year"
            name="year"
            value={filters.year}
            onChange={onFilterChange}
            className="reports-page-filter-select"
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div className="reports-page-filter-group">
          <label htmlFor="month" className="reports-page-filter-label">Month:</label>
          <select
            id="month"
            name="month"
            value={filters.month}
            onChange={onFilterChange}
            className="reports-page-filter-select month"
          >
            <option value="">All Months</option>
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="reports-page-filter-btn"
        >
          {loading ? 'Loading...' : 'Apply Filters'}
        </button>
      </form>
    </div>
  );
}