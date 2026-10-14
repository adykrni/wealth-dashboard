'use client';

import { useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { FilterState } from '@/lib/types';
import { getFilterClauses, countActiveFilters, INITIAL_FILTERS } from '@/lib/filters';
import { cn } from '@/lib/utils';
import QuickFilterMenu from './QuickFilterMenu';
import { Portfolio } from '@/lib/types';

interface Props {
  search: string;
  filters: FilterState;
  portfolios: Portfolio[];
  quickMenuOpen: boolean;
  view: 'list' | 'chart';
  onSearchChange: (v: string) => void;
  onFiltersChange: (f: FilterState) => void;
  onToggleQuickMenu: () => void;
  onCloseQuickMenu: () => void;
  onOpenSidePanel: () => void;
  onViewChange: (v: 'list' | 'chart') => void;
}

export default function FilterBar({
  search,
  filters,
  portfolios,
  quickMenuOpen,
  view,
  onSearchChange,
  onFiltersChange,
  onToggleQuickMenu,
  onCloseQuickMenu,
  onOpenSidePanel,
  onViewChange,
}: Props) {
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const activeCount = countActiveFilters(filters) + (search.trim() ? 1 : 0);
  const clauses = getFilterClauses(filters, search);

  function removeClause(key: string) {
    if (key === 'search') {
      onSearchChange('');
    } else if (key === 'type') {
      onFiltersChange({ ...filters, type: [] });
    } else if (key === 'risk') {
      onFiltersChange({ ...filters, risk: [] });
    } else if (key === 'currency') {
      onFiltersChange({ ...filters, currency: [] });
    } else if (key === 'value') {
      onFiltersChange({ ...filters, value: null });
    } else if (key === 'dayGain') {
      onFiltersChange({ ...filters, dayGain: null, dayGainMin: '', dayGainMax: '' });
    } else if (key === 'totalGain') {
      onFiltersChange({ ...filters, totalGain: null });
    }
  }

  function clearAll() {
    onSearchChange('');
    onFiltersChange(INITIAL_FILTERS);
  }

  // 'f' shortcut to open quick filter menu
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'f' && e.target instanceof Element) {
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        e.preventDefault();
        onToggleQuickMenu();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onToggleQuickMenu]);

  return (
    <div className="border-t border-b border-[#dfe3e9] flex items-center justify-between px-[20px] py-[10px] gap-[10px]">
      {/* Left: search + filter + formula bar */}
      <div className="flex items-center gap-[10px] flex-1 min-w-0">
        {/* Search */}
        <div className="flex items-center gap-[8px] py-[4px] rounded-[6px] shrink-0">
          <Search size={16} className="text-[#85868b]" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Search portfolios"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="text-[14px] text-[#07132a] placeholder:text-[#85868b] bg-transparent outline-none w-[160px]"
          />
        </div>

        {/* Divider */}
        <div className="w-px h-[16px] bg-[#dfe3e9] shrink-0" />

        {/* Filter by button + formula bar */}
        <div className="relative flex items-center gap-[10px] flex-1 min-w-0">
          <button
            ref={filterBtnRef}
            onClick={onToggleQuickMenu}
            className="flex items-center gap-[6px] px-[8px] py-[4px] rounded-[6px] hover:bg-[#f6f7fa] transition-colors shrink-0"
          >
            <SlidersHorizontal size={16} strokeWidth={1.75} className="text-[#07132a]" />
            <span className="text-[14px] text-[#07132a]">Filter by</span>
            {activeCount > 0 && (
              <span className="text-[10px] text-white bg-[#00205b] rounded-full w-[16px] h-[16px] flex items-center justify-center font-medium">
                {activeCount}
              </span>
            )}
          </button>

          {/* Divider */}
          {clauses.length > 0 && (
            <div className="w-px h-[16px] bg-[#dfe3e9] shrink-0" />
          )}

          {/* Formula bar chips */}
          <div className="flex items-center gap-[8px] flex-wrap flex-1 min-w-0">
            {clauses.map((clause) => (
              <div key={clause.key} className="flex items-center gap-[4px] shrink-0">
                <span className="text-[12px] text-[#909297]">{clause.label}</span>
                {clause.values.map((v) => (
                  <span
                    key={v}
                    className="flex items-center gap-[6px] border border-[#d3d3d3] rounded-[4px] px-[8px] py-[2px] text-[14px] text-[#101013]"
                  >
                    {v}
                    <button
                      onClick={() => removeClause(clause.key)}
                      className="text-[#909297] hover:text-[#07132a]"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            ))}
          </div>

          {/* Quick filter menu */}
          <QuickFilterMenu
            open={quickMenuOpen}
            anchorRef={filterBtnRef}
            portfolios={portfolios}
            search={search}
            filters={filters}
            onFiltersChange={onFiltersChange}
            onOpenSidePanel={onOpenSidePanel}
            onClose={onCloseQuickMenu}
          />
        </div>
      </div>

      {/* Right: segmented list/chart toggle */}
      <div className="flex items-center bg-[#eef0f3] rounded-[6px] p-[2px] shrink-0">
        <button
          onClick={() => onViewChange('list')}
          className={cn(
            'px-[10px] py-[4px] rounded-[4px] text-[11px] font-medium leading-none transition-all',
            view === 'list'
              ? 'bg-white text-[#07132a] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
              : 'text-[#6b7280] hover:text-[#07132a]'
          )}
        >
          List
        </button>
        <button
          onClick={() => onViewChange('chart')}
          className={cn(
            'px-[10px] py-[4px] rounded-[4px] text-[11px] font-medium leading-none transition-all',
            view === 'chart'
              ? 'bg-white text-[#07132a] shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
              : 'text-[#6b7280] hover:text-[#07132a]'
          )}
        >
          Chart
        </button>
      </div>
    </div>
  );
}
