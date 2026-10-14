'use client';

import { useState, useMemo } from 'react';
import { FilterState } from '@/lib/types';
import { portfolios, summaryData } from '@/lib/data';
import { applyFilters, countActiveFilters, INITIAL_FILTERS } from '@/lib/filters';
import { formatNumber, formatGain } from '@/lib/format';
import { cn } from '@/lib/utils';
import FilterBar from './FilterBar';
import FilterSidePanel from './FilterSidePanel';
import PortfolioTable from './PortfolioTable';

interface Props {
  onSelectPortfolio?: (id: string) => void;
}

export default function PortfoliosTab({ onSelectPortfolio }: Props) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [view, setView] = useState<'list' | 'chart'>('list');

  const filtered = useMemo(
    () => applyFilters(portfolios, search, filters),
    [search, filters]
  );

  const isFiltered = search.trim().length > 0 || countActiveFilters(filters) > 0;
  const showTotal = filtered.length > 0;

  const totalRow = useMemo(() => {
    if (!isFiltered) {
      return {
        value: summaryData.totalMarketValue,
        dayGain: summaryData.dayGain,
        dayGainPct: summaryData.dayGainPct,
        totalGain: 1942671.85,
        totalGainPct: 11.02,
        risk: 'Moderately aggressive',
      };
    }
    const totalValue = filtered.reduce((s, p) => s + p.value, 0);
    const totalDayGain = filtered.reduce((s, p) => s + (p.dayGain ?? 0), 0);
    const totalGain = filtered.reduce((s, p) => s + p.totalGain, 0);
    const costBasis = totalValue - totalGain;
    const dayGainPct = totalValue > 0 ? (totalDayGain / (totalValue - totalDayGain)) * 100 : 0;
    const totalGainPct = costBasis > 0 ? (totalGain / costBasis) * 100 : 0;
    return { value: totalValue, dayGain: totalDayGain, dayGainPct, totalGain, totalGainPct, risk: '' };
  }, [filtered, isFiltered]);

  function handleClearFilters() {
    setSearch('');
    setFilters(INITIAL_FILTERS);
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {view === 'list' ? (
        <>
          <FilterBar
            search={search}
            filters={filters}
            portfolios={portfolios}
            quickMenuOpen={quickMenuOpen}
            view={view}
            onSearchChange={setSearch}
            onFiltersChange={setFilters}
            onToggleQuickMenu={() => setQuickMenuOpen((v) => !v)}
            onCloseQuickMenu={() => setQuickMenuOpen(false)}
            onOpenSidePanel={() => setSidePanelOpen(true)}
            onViewChange={setView}
          />

          {/* Scrollable table body */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-[40px] h-[40px] rounded-full bg-[#f3f4f6] flex items-center justify-center mb-[16px]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                  </svg>
                </div>
                <p className="text-[13px] text-[#374151] font-medium leading-none mb-[6px]">No portfolios found</p>
                <p className="text-[12px] text-[#9ca3af] leading-none mb-[16px]">Try adjusting your search or filters</p>
                <button
                  onClick={handleClearFilters}
                  className="text-[12px] text-[#00205b] font-medium hover:underline leading-none"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <PortfolioTable portfolios={filtered} onSelect={onSelectPortfolio} />
            )}
          </div>

          {/* Total row — pinned to card bottom */}
          {showTotal && (
            <div className="shrink-0 flex items-center w-full bg-[#F8F8F8] border-t border-[#e8eaed]">
              <div className="flex-[2_1_0%] min-w-0 px-[20px] py-[13px]">
                <span className="text-[13px] text-[#07132a] leading-none">
                  {isFiltered ? 'Subtotal' : 'All portfolios'}
                </span>
              </div>
              <div className="flex-[1_1_0%] min-w-0 px-[20px] py-[13px] text-right">
                <span className="text-[13px] text-[#07132a] tabular-nums leading-none whitespace-nowrap">
                  {formatNumber(totalRow.value)}
                </span>
              </div>
              <div className="flex-[1_1_0%] min-w-0 px-[20px] py-[11px] text-right">
                <div className="flex flex-col gap-[3px] items-end text-[#07132a]">
                  <span className="text-[12px] tabular-nums whitespace-nowrap leading-none">
                    {totalRow.dayGain >= 0 ? '+' : '−'}{formatNumber(Math.abs(totalRow.dayGain))}
                  </span>
                  <span className="text-[10px] tabular-nums whitespace-nowrap leading-none opacity-50">
                    ({totalRow.dayGain >= 0 ? '+' : '−'}{totalRow.dayGainPct.toFixed(2)}%)
                  </span>
                </div>
              </div>
              <div className="flex-[1_1_0%] min-w-0 px-[20px] py-[11px] text-right">
                <div className="flex flex-col gap-[3px] items-end text-[#07132a]">
                  <span className="text-[12px] tabular-nums whitespace-nowrap leading-none">
                    {totalRow.totalGain >= 0 ? '+' : '−'}{formatNumber(Math.abs(totalRow.totalGain))}
                  </span>
                  <span className="text-[10px] tabular-nums whitespace-nowrap leading-none opacity-50">
                    ({totalRow.totalGain >= 0 ? '+' : '−'}{totalRow.totalGainPct.toFixed(2)}%)
                  </span>
                </div>
              </div>
              <div className="w-[172px] shrink-0 px-[16px] py-[13px] flex items-center">
                {!isFiltered && (
                  <span className="inline-flex items-center gap-[5px] text-[11px] leading-none px-[8px] py-[4px] rounded-full whitespace-nowrap font-medium bg-[#e8eaed] text-[#07132a]">
                    <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ backgroundColor: '#db2777' }} />
                    Moderately aggressive
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col flex-1">
          <FilterBar
            search={search}
            filters={filters}
            portfolios={portfolios}
            quickMenuOpen={quickMenuOpen}
            view={view}
            onSearchChange={setSearch}
            onFiltersChange={setFilters}
            onToggleQuickMenu={() => setQuickMenuOpen((v) => !v)}
            onCloseQuickMenu={() => setQuickMenuOpen(false)}
            onOpenSidePanel={() => setSidePanelOpen(true)}
            onViewChange={setView}
          />
          <div className="flex flex-col items-center justify-center h-64 text-[#909297] border border-dashed border-[#dfe3e9] rounded-[8px] mx-[20px] my-[20px]">
            <p className="text-[14px]">Indexed performance chart</p>
            <p className="text-[12px] mt-1">Design will be provided in the next iteration.</p>
            <button onClick={() => setView('list')} className="mt-4 text-[13px] text-[#00205b] hover:underline">
              Back to list view
            </button>
          </div>
        </div>
      )}

      <FilterSidePanel
        open={sidePanelOpen}
        portfolios={portfolios}
        search={search}
        filters={filters}
        onApply={(f) => { setFilters(f); setSidePanelOpen(false); }}
        onClose={() => setSidePanelOpen(false)}
      />
    </div>
  );
}
