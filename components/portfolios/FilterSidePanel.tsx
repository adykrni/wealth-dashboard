'use client';

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { FilterState, PortfolioType, RiskLevel, Currency, ValueFilter, DayGainFilter, TotalGainFilter } from '@/lib/types';
import { Portfolio } from '@/lib/types';
import { applyFilters, getFacetCounts, INITIAL_FILTERS } from '@/lib/filters';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  portfolios: Portfolio[];
  search: string;
  filters: FilterState;
  onApply: (f: FilterState) => void;
  onClose: () => void;
}

interface CheckRowProps {
  label: string;
  count: number;
  checked: boolean;
  onToggle: () => void;
}

function CheckRow({ label, count, checked, onToggle }: CheckRowProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full py-[7px] text-left hover:bg-[#f6f7fa] px-[4px] rounded-[4px] transition-colors"
    >
      <div className="flex items-center gap-[10px]">
        <div className={cn(
          'w-[15px] h-[15px] rounded-[3px] border flex items-center justify-center shrink-0',
          checked ? 'bg-[#00205b] border-[#00205b]' : 'border-[#c0c5ce] bg-white'
        )}>
          {checked && <Check size={9} className="text-white" strokeWidth={3} />}
        </div>
        <span className="text-[13px] text-[#07132a]">{label}</span>
      </div>
      <span className="text-[12px] text-[#909297]">{count}</span>
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] text-[#909297] uppercase tracking-wide mb-[4px] mt-[16px] first:mt-0">{children}</p>;
}

export default function FilterSidePanel({ open, portfolios, search, filters, onApply, onClose }: Props) {
  const [draft, setDraft] = useState<FilterState>(filters);

  // Sync draft when panel opens
  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  if (!open) return null;

  const previewCount = applyFilters(portfolios, search, draft).length;

  const typeCounts = getFacetCounts(portfolios, search, draft, 'type');
  const riskCounts = getFacetCounts(portfolios, search, draft, 'risk');
  const currencyCounts = getFacetCounts(portfolios, search, draft, 'currency');
  const valueCounts = getFacetCounts(portfolios, search, draft, 'value');
  const dayGainCounts = getFacetCounts(portfolios, search, draft, 'dayGain');
  const totalGainCounts = getFacetCounts(portfolios, search, draft, 'totalGain');

  function toggleType(v: PortfolioType) {
    const next = draft.type.includes(v) ? draft.type.filter((t) => t !== v) : [...draft.type, v];
    setDraft((d) => ({ ...d, type: next }));
  }
  function toggleRisk(v: RiskLevel) {
    const next = draft.risk.includes(v) ? draft.risk.filter((r) => r !== v) : [...draft.risk, v];
    setDraft((d) => ({ ...d, risk: next }));
  }
  function toggleCurrency(v: Currency) {
    const next = draft.currency.includes(v) ? draft.currency.filter((c) => c !== v) : [...draft.currency, v];
    setDraft((d) => ({ ...d, currency: next }));
  }
  function toggleValue(v: ValueFilter) {
    setDraft((d) => ({ ...d, value: d.value === v ? null : v }));
  }
  function toggleDayGain(v: DayGainFilter) {
    setDraft((d) => ({ ...d, dayGain: d.dayGain === v ? null : v, dayGainMin: '', dayGainMax: '' }));
  }
  function toggleTotalGain(v: TotalGainFilter) {
    setDraft((d) => ({ ...d, totalGain: d.totalGain === v ? null : v }));
  }

  const TYPES: PortfolioType[] = ['Advisory', 'Execution', 'Retirement', 'Other'];
  const RISKS: RiskLevel[] = ['Conservative', 'Moderate', 'Aggressive', 'Speculative'];
  const CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP', 'CHF'];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 z-50 h-full w-[360px] bg-white shadow-[−4px_0_24px_rgba(0,0,0,0.12)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-[20px] py-[16px] border-b border-[#dfe3e9]">
          <h2 className="text-[15px] font-semibold text-[#07132a]">Filter portfolios</h2>
          <button onClick={onClose} className="text-[#909297] hover:text-[#07132a]">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-[20px] py-[16px]">
          <SectionTitle>Type</SectionTitle>
          {TYPES.map((t) => (
            <CheckRow key={t} label={t} count={typeCounts[t] ?? 0} checked={draft.type.includes(t)} onToggle={() => toggleType(t)} />
          ))}

          <SectionTitle>Risk</SectionTitle>
          {RISKS.map((r) => (
            <CheckRow key={r} label={r} count={riskCounts[r] ?? 0} checked={draft.risk.includes(r)} onToggle={() => toggleRisk(r)} />
          ))}

          <SectionTitle>Currency</SectionTitle>
          {CURRENCIES.map((c) => (
            <CheckRow key={c} label={c} count={currencyCounts[c] ?? 0} checked={draft.currency.includes(c)} onToggle={() => toggleCurrency(c)} />
          ))}

          <SectionTitle>Value</SectionTitle>
          {(['over-1m', 'over-5m', 'over-10m'] as ValueFilter[]).map((v) => {
            const labels: Record<string, string> = { 'over-1m': 'Over $1M', 'over-5m': 'Over $5M', 'over-10m': 'Over $10M' };
            return <CheckRow key={v!} label={labels[v!]} count={valueCounts[v!] ?? 0} checked={draft.value === v} onToggle={() => toggleValue(v)} />;
          })}

          <SectionTitle>Day gain</SectionTitle>
          {(['gainers', 'losers', 'flat', 'up-gt-1pct', 'down-lt-1pct'] as DayGainFilter[]).map((v) => {
            const labels: Record<string, string> = {
              gainers: 'Gainers today', losers: 'Losers today', flat: 'Flat (±0.05%)',
              'up-gt-1pct': 'Up > +1%', 'down-lt-1pct': 'Down < −1%',
            };
            return <CheckRow key={v!} label={labels[v!]} count={dayGainCounts[v!] ?? 0} checked={draft.dayGain === v} onToggle={() => toggleDayGain(v)} />;
          })}

          {/* Custom day gain range */}
          <div className="mt-[6px]">
            <button
              onClick={() => setDraft((d) => ({ ...d, dayGain: d.dayGain === 'custom' ? null : 'custom' }))}
              className="flex items-center gap-[8px] py-[7px] px-[4px] text-left"
            >
              <div className={cn(
                'w-[15px] h-[15px] rounded-[3px] border flex items-center justify-center shrink-0',
                draft.dayGain === 'custom' ? 'bg-[#00205b] border-[#00205b]' : 'border-[#c0c5ce] bg-white'
              )}>
                {draft.dayGain === 'custom' && <Check size={9} className="text-white" strokeWidth={3} />}
              </div>
              <span className="text-[13px] text-[#07132a]">Custom range (%)</span>
            </button>
            {draft.dayGain === 'custom' && (
              <div className="flex items-center gap-[8px] pl-[25px] mt-[4px]">
                <input
                  type="number"
                  placeholder="Min"
                  value={draft.dayGainMin}
                  onChange={(e) => setDraft((d) => ({ ...d, dayGainMin: e.target.value }))}
                  className="w-[80px] border border-[#dfe3e9] rounded-[4px] px-[8px] py-[4px] text-[13px] focus:outline-none focus:border-[#00205b]"
                />
                <span className="text-[12px] text-[#909297]">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={draft.dayGainMax}
                  onChange={(e) => setDraft((d) => ({ ...d, dayGainMax: e.target.value }))}
                  className="w-[80px] border border-[#dfe3e9] rounded-[4px] px-[8px] py-[4px] text-[13px] focus:outline-none focus:border-[#00205b]"
                />
              </div>
            )}
          </div>

          <SectionTitle>Total gain</SectionTitle>
          {(['positive', 'negative'] as TotalGainFilter[]).map((v) => {
            const labels: Record<string, string> = { positive: 'Positive total gain', negative: 'Negative total gain' };
            return <CheckRow key={v!} label={labels[v!]} count={totalGainCounts[v!] ?? 0} checked={draft.totalGain === v} onToggle={() => toggleTotalGain(v)} />;
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-[#dfe3e9] px-[20px] py-[14px] flex items-center justify-between">
          <span className="text-[13px] text-[#909297]">
            {previewCount} portfolio{previewCount !== 1 ? 's' : ''} match
          </span>
          <div className="flex items-center gap-[8px]">
            <button
              onClick={() => { setDraft(INITIAL_FILTERS); onApply(INITIAL_FILTERS); onClose(); }}
              className="px-[14px] py-[7px] text-[13px] text-[#3c4556] border border-[#dfe3e9] rounded-[6px] hover:bg-[#f6f7fa] transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => { onApply(draft); onClose(); }}
              className="px-[14px] py-[7px] text-[13px] text-white bg-[#00205b] rounded-[6px] hover:bg-[#001a4a] transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
