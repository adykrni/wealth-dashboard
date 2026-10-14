'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Portfolio } from '@/lib/types';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

const RISK_BADGE: Record<string, { dot: string }> = {
  Conservative:            { dot: '#16a34a' },
  Moderate:                { dot: '#d97706' },
  Aggressive:              { dot: '#dc2626' },
  Speculative:             { dot: '#7c3aed' },
  'Moderately aggressive': { dot: '#db2777' },
};

type SortKey = 'name' | 'value' | 'dayGainPct' | 'totalGainPct';
type SortDir = 'asc' | 'desc';

interface Props {
  portfolios: Portfolio[];
  onSelect?: (id: string) => void;
}

export default function PortfolioTable({ portfolios, onSelect }: Props) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  const sorted = sortKey === null
    ? [...portfolios]
    : [...portfolios].sort((a, b) => {
        const av = sortKey === 'name' ? a.name : sortKey === 'value' ? a.value : sortKey === 'dayGainPct' ? (a.dayGainPct ?? -Infinity) : a.totalGainPct;
        const bv = sortKey === 'name' ? b.name : sortKey === 'value' ? b.value : sortKey === 'dayGainPct' ? (b.dayGainPct ?? -Infinity) : b.totalGainPct;
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });

  if (portfolios.length === 0) return null;

  const hdCell = 'text-[10px] text-[#6b7280] uppercase tracking-[0.07em] font-medium leading-none';

  return (
    <div className="w-full">

      {/* ── Header row ─────────────────────────────────────────── */}
      <div className="flex border-b border-[#e8eaed]">

        {/* Portfolio — left-aligned, arrow after label */}
        <div
          className="flex-[2_1_0%] min-w-0 flex items-center gap-[3px] cursor-pointer select-none px-[20px] py-[7px] hover:bg-[#f8f9fb] transition-colors group"
          onClick={() => handleSort('name')}
        >
          <span className={hdCell}>Portfolio</span>
          <GhostArrow active={sortKey === 'name'} dir={sortKey === 'name' ? sortDir : 'asc'} />
        </div>

        {/* Value — right-aligned, arrow before label */}
        <div
          className="flex-[1_1_0%] min-w-0 flex items-center gap-[3px] justify-end cursor-pointer select-none px-[20px] py-[7px] hover:bg-[#f8f9fb] transition-colors group"
          onClick={() => handleSort('value')}
        >
          <GhostArrow active={sortKey === 'value'} dir={sortKey === 'value' ? sortDir : 'asc'} />
          <span className={hdCell}>Value (USD)</span>
        </div>

        {/* Day Gain */}
        <div
          className="flex-[1_1_0%] min-w-0 flex items-center gap-[3px] justify-end cursor-pointer select-none px-[20px] py-[7px] hover:bg-[#f8f9fb] transition-colors group"
          onClick={() => handleSort('dayGainPct')}
        >
          <GhostArrow active={sortKey === 'dayGainPct'} dir={sortKey === 'dayGainPct' ? sortDir : 'asc'} />
          <span className={hdCell}>Day Gain</span>
        </div>

        {/* Total Gain */}
        <div
          className="flex-[1_1_0%] min-w-0 flex items-center gap-[3px] justify-end cursor-pointer select-none px-[20px] py-[7px] hover:bg-[#f8f9fb] transition-colors group"
          onClick={() => handleSort('totalGainPct')}
        >
          <GhostArrow active={sortKey === 'totalGainPct'} dir={sortKey === 'totalGainPct' ? sortDir : 'asc'} />
          <span className={hdCell}>Total Gain</span>
        </div>

        {/* Risk — non-sortable: no cursor, no hover */}
        <div className="w-[172px] shrink-0 px-[16px] py-[7px]">
          <span className={hdCell}>Risk</span>
        </div>
      </div>

      {/* ── Data rows ──────────────────────────────────────────── */}
      {sorted.map((p) => (
        <div
          key={p.id}
          onClick={() => onSelect?.(p.id)}
          className={cn(
            'flex items-center border-b border-[#f0f2f5] hover:bg-[#f8f9fb] transition-colors duration-75',
            onSelect && 'cursor-pointer'
          )}
        >
          {/* Portfolio name */}
          <div className="flex-[2_1_0%] min-w-0 px-[20px] py-[13px]">
            <span className="text-[13px] text-[#07132a] leading-none truncate block">{p.name}</span>
          </div>

          {/* Value */}
          <div className="flex-[1_1_0%] min-w-0 px-[20px] py-[13px] text-right">
            <span className="text-[13px] text-[#07132a] tabular-nums whitespace-nowrap leading-none">
              {formatNumber(p.value)}
            </span>
          </div>

          {/* Day Gain */}
          <div className="flex-[1_1_0%] min-w-0 px-[20px] py-[11px] text-right">
            {p.dayGain === null ? (
              <span className="text-[13px] text-[#9ca3af]">—</span>
            ) : (
              <div className="flex flex-col gap-[3px] items-end text-[#07132a]">
                <span className="text-[12px] tabular-nums whitespace-nowrap leading-none">
                  {p.dayGain >= 0 ? '+' : '−'}{formatNumber(Math.abs(p.dayGain))}
                </span>
                <span className="text-[10px] tabular-nums whitespace-nowrap leading-none opacity-50">
                  ({p.dayGain >= 0 ? '+' : '−'}{p.dayGainPct!.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>

          {/* Total Gain — primary text, historical context */}
          <div className="flex-[1_1_0%] min-w-0 px-[20px] py-[11px] text-right">
            <div className="flex flex-col gap-[3px] items-end text-[#07132a]">
              <span className="text-[12px] tabular-nums whitespace-nowrap leading-none">
                {p.totalGain >= 0 ? '+' : '−'}{formatNumber(Math.abs(p.totalGain))}
              </span>
              <span className="text-[10px] tabular-nums whitespace-nowrap leading-none opacity-50">
                ({p.totalGain >= 0 ? '+' : '−'}{p.totalGainPct.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Risk badge */}
          <div className="w-[172px] shrink-0 px-[16px] py-[13px] flex items-center">
            {p.risk && RISK_BADGE[p.risk] ? (
              <span className="inline-flex items-center gap-[5px] text-[11px] leading-none px-[8px] py-[4px] rounded-full whitespace-nowrap font-medium bg-[#f3f4f6] text-[#07132a]">
                <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ backgroundColor: RISK_BADGE[p.risk].dot }} />
                {p.risk}
              </span>
            ) : (
              <span className="text-[13px] text-[#9ca3af]">—</span>
            )}
          </div>
        </div>
      ))}

    </div>
  );
}

function GhostArrow({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={cn(
      'shrink-0 transition-opacity duration-100',
      active
        ? 'text-[#07132a] opacity-100'
        : 'text-[#b0b7c3] opacity-0 group-hover:opacity-100'
    )}>
      {dir === 'desc' ? <ChevronDown size={9} /> : <ChevronUp size={9} />}
    </span>
  );
}
