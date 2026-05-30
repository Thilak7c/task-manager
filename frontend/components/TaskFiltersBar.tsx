'use client';

import { TaskFilters } from '@/lib/api';
import { useCallback, useState } from 'react';

interface Props {
  filters: TaskFilters;
  onChange: (filters: Partial<TaskFilters>) => void;
}

export function TaskFiltersBar({ filters, onChange }: Props) {
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onChange({ search: searchValue });
    }
  };

  const handleSearchBlur = () => {
    if (searchValue !== filters.search) {
      onChange({ search: searchValue });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-3 items-center">
      {/* Search */}
      <div className="flex-1 min-w-48">
        <input
          type="text"
          placeholder="Search tasks… (press Enter)"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          onBlur={handleSearchBlur}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Status filter */}
      <select
        value={filters.status || ''}
        onChange={(e) => onChange({ status: e.target.value as any })}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>

      {/* Priority filter */}
      <select
        value={filters.priority || ''}
        onChange={(e) => onChange({ priority: e.target.value as any })}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">All Priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      {/* Clear filters */}
      {(filters.status || filters.priority || filters.search) && (
        <button
          onClick={() => {
            setSearchValue('');
            onChange({ status: '', priority: '', search: '' });
          }}
          className="text-sm text-gray-500 hover:text-red-500 underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
