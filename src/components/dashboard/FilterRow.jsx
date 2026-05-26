import React from 'react';
import { STAGES } from '@/lib/constants';

/**
 * FilterRow — search pill + 3 filter selects + result count badge.
 * Matches prototype's .frow layout exactly.
 */
export default function FilterRow({ accounts, filters, onFilter, filteredCount }) {
  const reps = [...new Set(accounts.map((a) => a.rep))].sort();
  const total = accounts.length;

  return (
    <div className="flex items-center gap-2 mb-3.5 flex-wrap">
      {/* Search pill */}
      <div className="relative flex-[0_0_210px]">
        <span className="absolute left-[10px] top-1/2 -translate-y-1/2 text-hint pointer-events-none flex items-center">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
        <input
          type="text"
          className="w-full h-[34px] pl-8 pr-3 border border-[rgba(0,0,0,0.14)] rounded-pill
            bg-white font-[family:inherit] text-sm text-ink outline-none
            placeholder:text-hint
            focus:border-brand focus:shadow-focus
            transition-all"
          placeholder="Search accounts"
          value={filters.query}
          onChange={(e) => onFilter('query', e.target.value)}
        />
      </div>

      {/* Stage filter */}
      <select
        className="h-[34px] px-[10px] border border-[rgba(0,0,0,0.14)] rounded-sm
          bg-white font-[family:inherit] text-sm font-medium text-ink outline-none cursor-pointer
          hover:border-[rgba(0,0,0,0.25)] focus:border-brand focus:shadow-focus transition-all"
        value={filters.stage}
        onChange={(e) => onFilter('stage', e.target.value)}
      >
        <option value="">All stages</option>
        {STAGES.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>

      {/* Type filter */}
      <select
        className="h-[34px] px-[10px] border border-[rgba(0,0,0,0.14)] rounded-sm
          bg-white font-[family:inherit] text-sm font-medium text-ink outline-none cursor-pointer
          hover:border-[rgba(0,0,0,0.25)] focus:border-brand focus:shadow-focus transition-all"
        value={filters.type}
        onChange={(e) => onFilter('type', e.target.value)}
      >
        <option value="">All types</option>
        <option>SFR</option>
        <option>Multifamily</option>
      </select>

      {/* Rep filter */}
      <select
        className="h-[34px] px-[10px] border border-[rgba(0,0,0,0.14)] rounded-sm
          bg-white font-[family:inherit] text-sm font-medium text-ink outline-none cursor-pointer
          hover:border-[rgba(0,0,0,0.25)] focus:border-brand focus:shadow-focus transition-all"
        value={filters.rep}
        onChange={(e) => onFilter('rep', e.target.value)}
      >
        <option value="">All reps</option>
        {reps.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>

      {/* Result count */}
      <span className="ml-auto text-xs font-medium text-hint bg-white border border-[rgba(0,0,0,0.08)] rounded-pill px-[10px] py-[3px] whitespace-nowrap">
        {filteredCount !== total
          ? `${filteredCount} of ${total}`
          : `${total} accounts`}
      </span>
    </div>
  );
}
