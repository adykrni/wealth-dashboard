'use client';

import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, SlidersHorizontal } from 'lucide-react';
import { FilterState, PortfolioType, RiskLevel, Currency, ValueFilter, DayGainFilter, TotalGainFilter } from '@/lib/types';
import { getFacetCounts } from '@/lib/filters';
import { Portfolio } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  portfolios: Portfolio[];
  search: string;
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  onOpenSidePanel: () => void;
  onClose: () => void;
}

interface OptionRowProps {
  label: string;
  count: number;
  checked: boolean;
  onToggle: () => void;
}

function OptionRow({ label, count, checked, onToggle }: OptionRowProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full px-[12px] py-[6px] text-left hover:bg-[#f6f7fa] transition-colors rounded-[4px]"
    >
      <div className="flex items-center gap-[8px]">
        <div className={cn(
          'w-[14px] h-[14px] rounded-[3px] border flex items-center justify-center shrink-0',
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

function Section({ title }: { title: string }) {
  return (
    <p className="px-[12px] pt-[10px] pb-[2px] text-[10px] text-[#909297] uppercase tracking-wide">
      {title}
    </p>
  );
}

export default function QuickFilterMenu({
  open,
  anchorRef,
  portfolios,
  search,
  filters,
  onFiltersChange,
  onOpenSidePanel,
  onClose,
}: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open) return;
    if (anchorRef.current) {
      const r = anchorRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left });
    }
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  const typeCounts = getFacetCounts(portfolios, search, filters, 'type');
  const riskCounts = getFacetCounts(portfolios, search, filters, 'risk');
  const valueCounts = getFacetCounts(portfolios, search, filters, 'value');
  const dayGainCounts = getFacetCounts(portfolios, search, filters, 'dayGain');
  const totalGainCounts = getFacetCounts(portfolios, search, filters, 'totalGain');

  function toggleType(v: PortfolioType) {
    const next = filters.type.includes(v)
      ? filters.type.filter((t) => t !== v)
      : [...filters.type, v];
    onFiltersChange({ ...filters, type: next });
  }
  function toggleRisk(v: RiskLevel) {
    const next = filters.risk.includes(v)
      ? filters.risk.filter((r) => r !== v)
      : [...filters.risk, v];
    onFiltersChange({ ...filters, risk: next });
  }
  function toggleValue(v: ValueFilter) {
    onFiltersChange({ ...filters, value: filters.value === v ? null : v });
  }
  function toggleDayGain(v: DayGainFilter) {
    onFiltersChange({ ...filters, dayGain: filters.dayGain === v ? null : v, dayGainMin: '', dayGainMax: '' });
  }
  function toggleTotalGain(v: TotalGainFilter) {
    onFiltersChange({ ...filters, totalGain: filters.totalGain === v ? null : v });
  }

  const TYPES: PortfolioType[] = ['Advisory', 'Execution', 'Retirement', 'Other'];
  const RISKS: RiskLevel[] = ['Conservative', 'Moderate', 'Aggressive', 'Speculative'];

  return createPortal(
    <div
      ref={menuRef}
      style={{ top: pos.top, left: pos.left }}
      className="fixed z-[9999] w-[260px] bg-white rounded-[8px] border border-[#dfe3e9] shadow-[0px_4px_16px_rgba(0,0,0,0.10)] py-[6px]"
    >
      <Section title="Type" />
      {TYPES.map((t) => (
        <OptionRow key={t} label={t} count={typeCounts[t] ?? 0} checked={filters.type.includes(t)} onToggle={() => toggleType(t)} />
      ))}

      <Section title="Risk" />
      {RISKS.map((r) => (
        <OptionRow key={r} label={r} count={riskCounts[r] ?? 0} checked={filters.risk.includes(r)} onToggle={() => toggleRisk(r)} />
      ))}

      <Section title="Value" />
      {(['over-1m', 'over-5m', 'over-10m'] as ValueFilter[]).map((v) => {
        const labels: Record<string, string> = { 'over-1m': 'Over $1M', 'over-5m': 'Over $5M', 'over-10m': 'Over $10M' };
        return (
          <OptionRow key={v!} label={labels[v!]} count={valueCounts[v!] ?? 0} checked={filters.value === v} onToggle={() => toggleValue(v)} />
        );
      })}

      <Section title="Day gain" />
      {(['gainers', 'losers', 'flat', 'up-gt-1pct', 'down-lt-1pct'] as DayGainFilter[]).map((v) => {
        const labels: Record<string, string> = {
          gainers: 'Gainers today',
          losers: 'Losers today',
          flat: 'Flat (±0.05%)',
          'up-gt-1pct': 'Up > +1%',
          'down-lt-1pct': 'Down < −1%',
        };
        return (
          <OptionRow key={v!} label={labels[v!]} count={dayGainCounts[v!] ?? 0} checked={filters.dayGain === v} onToggle={() => toggleDayGain(v)} />
        );
      })}

      <Section title="Total gain" />
      {(['positive', 'negative'] as TotalGainFilter[]).map((v) => {
        const labels: Record<string, string> = { positive: 'Positive total gain', negative: 'Negative total gain' };
        return (
          <OptionRow key={v!} label={labels[v!]} count={totalGainCounts[v!] ?? 0} checked={filters.totalGain === v} onToggle={() => toggleTotalGain(v)} />
        );
      })}

      <div className="border-t border-[#dfe3e9] mt-[6px] pt-[6px] px-[12px]">
        <button
          onClick={() => { onOpenSidePanel(); onClose(); }}
          className="flex items-center gap-[6px] text-[13px] text-[#00205b] hover:underline"
        >
          <SlidersHorizontal size={13} />
          More options &amp; custom range
        </button>
      </div>
    </div>,
    document.body
  );
}
