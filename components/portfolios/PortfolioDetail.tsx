'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronDown, Minus, Plus } from 'lucide-react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Portfolio } from '@/lib/types';
import { portfolios } from '@/lib/data';
import { portfolioDetails, Holding } from '@/lib/detail-data';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import HoldingDetailPanel from './HoldingDetailPanel';
import InstructionModal, { InstructionContext } from './InstructionModal';

type Period = '3M' | '6M' | 'YTD' | '1Y' | '3Y';
const PERIODS: Period[] = ['3M', '6M', 'YTD', '1Y', '3Y'];
const PERIOD_MONTHS: Record<Period, number> = { '3M': 3, '6M': 6, 'YTD': 9, '1Y': 12, '3Y': 36 };

const ACTIVITY_DOT: Record<string, string> = {
  BUY: '#2ba13f', SELL: '#e43437', DIVIDEND: '#1a69de', REBALANCE: '#ec6b10', DEPOSIT: '#2ba13f',
};

function fmtActivityText(item: { type: string; security?: string; amount: number }): string {
  const amt = item.amount > 0 ? `$${Math.round(item.amount / 1000)}K` : '';
  switch (item.type) {
    case 'BUY':      return `Bought ${item.security} at ${amt}`;
    case 'SELL':     return `Sold ${item.security} −${amt}`;
    case 'DIVIDEND': return `Received dividends from ${item.security} — +${amt}`;
    case 'REBALANCE': return 'Portfolio rebalance executed';
    case 'DEPOSIT':  return `Deposited +${amt}`;
    default:         return item.type;
  }
}

function fmtAxis(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

function ChartTip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#e8eaed] rounded-[6px] shadow-[0_4px_16px_rgba(0,0,0,0.08)] px-[12px] py-[10px]">
      <p className="text-[10px] text-[#9ca3af] mb-[5px] uppercase tracking-[0.06em]">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-[14px] mb-[2px]">
          <div className="flex items-center gap-[5px]">
            <span className="w-[8px] h-[2px] rounded-full inline-block shrink-0" style={{ backgroundColor: p.color }} />
            <span className="text-[11px] text-[#6b7280] capitalize">{p.dataKey}</span>
          </div>
          <span className="text-[12px] text-[#07132a] font-medium tabular-nums">{fmtAxis(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Chip primitives (Figma: bg #f7f7f9, border #dcdfe7 0.5px, pill) */

const TYPE_DOT: Record<string, string> = {
  Advisory:        '#7d9cd2',
  Discretionary:   '#6366f1',
  'Self-directed': '#9ca3af',
  Retirement:      '#0d9488',
  Trust:           '#0891b2',
  Foundation:      '#d97706',
  'Private Mkts':  '#8b5cf6',
  Alternatives:    '#f59e0b',
  Cash:            '#9ca3af',
  Other:           '#9ca3af',
};

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

const CHIP = 'flex items-center bg-[#f7f7f9] border-[0.5px] border-[#dcdfe7] px-[8px] py-[2px] rounded-full shrink-0';
const CHIP_LABEL = 'text-[12px] text-[#07132a] leading-[1.4] whitespace-nowrap';
const FONT = { fontFamily: 'DeutscheBankText, sans-serif' };

function TypeChip({ label }: { label: string }) {
  return (
    <div className={`${CHIP} gap-[4px]`}>
      <span className="w-[6px] h-[6px] rounded-full shrink-0" style={{ backgroundColor: TYPE_DOT[label] ?? '#9ca3af' }} />
      <span className={CHIP_LABEL} style={FONT}>{label}</span>
    </div>
  );
}

function IconChip({ src, label, gap = 4 }: { src: string; label: string; gap?: number }) {
  return (
    <div className={CHIP} style={{ gap }}>
      <img src={src} alt="" className="w-[12px] h-[12px] shrink-0" />
      <span className={CHIP_LABEL} style={FONT}>{label}</span>
    </div>
  );
}

function ManagerChip({ name }: { name: string }) {
  const initials = getInitials(name);
  return (
    <div className={`${CHIP} gap-[4px]`}>
      <div className="w-[12px] h-[12px] rounded-full bg-[#5e84cb] flex items-center justify-center shrink-0">
        <span className="text-white leading-none" style={{ fontSize: '5px', fontFamily: 'DeutscheBankText, sans-serif' }}>{initials}</span>
      </div>
      <span className={CHIP_LABEL} style={FONT}>{name}</span>
    </div>
  );
}

/* ── Sidebar stat row ─────────────────────────────────────────── */

function StatRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-[8px]">
      <span className="text-[12px] text-[#5e6878] leading-none">{label}</span>
      <span className={cn('text-[12px] tabular-nums leading-none', muted ? 'text-[#9ca3af]' : 'text-[#07132a]')}>{value}</span>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────── */

interface Props {
  portfolio: Portfolio;
  onBack: () => void;
  onSwitch?: (id: string) => void;
}

export default function PortfolioDetail({ portfolio, onBack, onSwitch }: Props) {
  const [period, setPeriod] = useState<Period>('1Y');
  const [mounted, setMounted] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);
  const [instructionCtx, setInstructionCtx] = useState<InstructionContext | null>(null);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [riskOpen, setRiskOpen]         = useState(true);
  const [allocOpen, setAllocOpen]       = useState(true);
  const [activityOpen, setActivityOpen] = useState(true);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!switcherOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setSwitcherOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [switcherOpen]);

  const detail = portfolioDetails[portfolio.id];
  if (!detail) return null;

  const chartData = useMemo(() => {
    const n = PERIOD_MONTHS[period];
    return detail.performance.slice(-n - 1);
  }, [detail.performance, period]);

  const gainPos = (portfolio.dayGain ?? 0) >= 0;
  const totalPos = portfolio.totalGain >= 0;
  const ytdPos = detail.ytdReturn >= 0;
  const alphaPos = (detail.vsBenchmark ?? 0) >= 0;

  const typeLabel = portfolio.type === 'Other'
    ? portfolio.name.includes('Trust') ? 'Trust'
      : portfolio.name.includes('Private') ? 'Private Mkts'
      : portfolio.name.includes('Cash') ? 'Cash'
      : portfolio.name.includes('Foundation') ? 'Foundation'
      : portfolio.name.includes('Alternatives') ? 'Alternatives'
      : 'Other'
    : portfolio.type;

  return (
    <div className="h-full flex flex-col overflow-hidden relative">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center h-[44px] shrink-0 border-b border-[#dfe3e9] px-[18px] gap-[10px]">

        {/* Portfolio name + switcher dropdown */}
        <div ref={switcherRef} className="relative flex items-center shrink-0">
          <button
            onClick={() => setSwitcherOpen(v => !v)}
            className="flex items-center gap-[6px] bg-white px-[4px] py-[6px] rounded-[6px] hover:bg-[#f3f5f8] transition-colors"
          >
            <span
              className="text-[16px] text-[#07132a] leading-[1.4] whitespace-nowrap"
              style={{ fontFamily: 'DeutscheBankText, sans-serif' }}
            >
              {portfolio.name}
            </span>
            <ChevronDown
              size={16}
              strokeWidth={1.75}
              className={cn('text-[#07132a] shrink-0 transition-transform', switcherOpen && 'rotate-180')}
            />
          </button>

          {switcherOpen && (
            <div
              className="absolute top-[calc(100%+4px)] left-0 z-30 bg-white rounded-[8px] overflow-hidden"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)', minWidth: '268px' }}
            >
              <p className="text-[10px] text-[#b0b7c3] uppercase tracking-[0.07em] font-medium px-[12px] pt-[10px] pb-[6px]">
                Switch portfolio
              </p>
              <div className="max-h-[280px] overflow-y-auto">
                {portfolios.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { onSwitch?.(p.id); setSwitcherOpen(false); }}
                    className={cn(
                      'flex items-center justify-between w-full px-[12px] py-[9px] text-left transition-colors gap-[12px]',
                      p.id === portfolio.id
                        ? 'bg-[#f3f5f8] text-[#07132a]'
                        : 'hover:bg-[#f8f9fb] text-[#374151]'
                    )}
                  >
                    <span className="text-[12px] truncate flex-1">{p.name}</span>
                    <span className="text-[11px] text-[#9ca3af] tabular-nums shrink-0">{formatNumber(p.value)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chip group 1: type · risk · benchmark */}
        <div className="flex items-center gap-[6px]">
          <TypeChip label={typeLabel} />
          {portfolio.risk && (
            <IconChip src="/icons/chip-risk.svg" label={portfolio.risk} gap={2} />
          )}
          <IconChip src="/icons/chip-benchmark.svg" label={detail.benchmark} gap={4} />
        </div>

        {/* Vertical divider */}
        <div className="h-[14px] w-px bg-[#dcdfe7] shrink-0" />

        {/* Chip group 2: inception · manager */}
        <div className="flex items-center gap-[6px]">
          <IconChip src="/icons/chip-date.svg" label={`Since ${detail.inceptionDate}`} gap={4} />
          {detail.managedBy === 'Self-directed'
            ? <TypeChip label="Self-directed" />
            : <ManagerChip name={detail.managedBy} />
          }
        </div>

        <div className="flex-1" />

        {/* Request rebalance */}
        <button
          onClick={() => setInstructionCtx({ type: 'rebalance' })}
          className="text-[13px] text-[#07132a] border border-[#c6ccda] px-[12px] py-[6px] rounded-[6px] hover:bg-[#f8f9fb] transition-colors shrink-0 whitespace-nowrap"
          style={{ fontFamily: 'DeutscheBankText, sans-serif' }}
        >
          Request rebalance
        </button>
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Left sidebar ─────────────────────────────────────────── */}
        <div className="w-[290px] shrink-0 border-r border-[#dfe3e9] overflow-y-auto flex flex-col gap-[15px] px-[20px] pt-[20px]">

          {/* Market value */}
          <div className="flex flex-col gap-[20px] border-b border-[#dfe3e9] pb-[16px] w-full shrink-0">
            <div className="flex flex-col gap-[4px]">
              <p className="text-[12px] text-[#383f4d] leading-[1.3]">Market value</p>
              <p className="text-[28px] text-[#07132a] tabular-nums leading-[1.3]" style={{ fontFamily: 'DeutscheBankText, sans-serif' }}>
                {formatNumber(portfolio.value)}
              </p>
            </div>
            <div className="flex items-center justify-between text-[12px] w-full">
              <p className="text-[#383f4d]">Total gain</p>
              <p className="text-[#07132a] tabular-nums">
                {totalPos ? '+' : '−'}{formatNumber(Math.abs(portfolio.totalGain))}({totalPos ? '+' : ''}{portfolio.totalGainPct.toFixed(2)}%)
              </p>
            </div>
            <div className="flex items-center justify-between text-[12px] w-full">
              <p className="text-[#383f4d]">Today gain</p>
              <p className={cn('tabular-nums', portfolio.dayGain === null ? 'text-[#9ca3af]' : 'text-[#07132a]')}>
                {portfolio.dayGain !== null
                  ? `${gainPos ? '+' : '−'}${formatNumber(Math.abs(portfolio.dayGain))} (${gainPos ? '+' : ''}${(portfolio.dayGainPct ?? 0).toFixed(2)}%)`
                  : 'Illiquid'}
              </p>
            </div>
          </div>

          {/* Risk & return */}
          <div className="flex flex-col gap-[20px] border-b border-[#dfe3e9] pb-[16px] w-full shrink-0 text-[12px]">
            <button onClick={() => setRiskOpen(v => !v)} className="flex items-center justify-between w-full group">
              <p className="text-[#383f4d] leading-[1.3]">Risk &amp; return</p>
              {riskOpen
                ? <Minus size={12} strokeWidth={1.75} className="text-[#9ca3af] group-hover:text-[#383f4d] transition-colors shrink-0" />
                : <Plus  size={12} strokeWidth={1.75} className="text-[#9ca3af] group-hover:text-[#383f4d] transition-colors shrink-0" />}
            </button>
            {riskOpen && (
              <div className="flex flex-col gap-[8px] w-full">
                <div className="flex items-center justify-between w-full">
                  <p className="text-[#383f4d]">YTD Return</p>
                  <p className="text-[#07132a] tabular-nums">{ytdPos ? '+' : ''}{detail.ytdReturn.toFixed(2)}%</p>
                </div>
                <div className="flex items-center justify-between w-full">
                  <p className="text-[#383f4d]">vs Benchmark</p>
                  <p className={cn('tabular-nums', detail.vsBenchmark === null ? 'text-[#9ca3af]' : 'text-[#07132a]')}>
                    {detail.vsBenchmark !== null ? `${alphaPos ? '+' : ''}${detail.vsBenchmark.toFixed(1)} pp` : '—'}
                  </p>
                </div>
                <div className="flex items-center justify-between w-full">
                  <p className="text-[#383f4d]">Volatility</p>
                  <p className={cn('tabular-nums', detail.volatility === null ? 'text-[#9ca3af]' : 'text-[#07132a]')}>
                    {detail.volatility !== null ? `${detail.volatility.toFixed(1)}%` : '—'}
                  </p>
                </div>
                <div className="flex items-center justify-between w-full">
                  <p className="text-[#383f4d]">Sharpe ratio</p>
                  <p className={cn('tabular-nums', detail.sharpeRatio === null ? 'text-[#9ca3af]' : 'text-[#07132a]')}>
                    {detail.sharpeRatio !== null ? detail.sharpeRatio.toFixed(2) : '—'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Allocation */}
          <div className="flex flex-col gap-[20px] border-b border-[#dfe3e9] pb-[16px] w-full shrink-0">
            <button onClick={() => setAllocOpen(v => !v)} className="flex items-center justify-between w-full group">
              <p className="text-[12px] text-[#383f4d] leading-[1.3]">Allocation</p>
              {allocOpen
                ? <Minus size={12} strokeWidth={1.75} className="text-[#9ca3af] group-hover:text-[#383f4d] transition-colors shrink-0" />
                : <Plus  size={12} strokeWidth={1.75} className="text-[#9ca3af] group-hover:text-[#383f4d] transition-colors shrink-0" />}
            </button>
            {allocOpen && <div className="flex flex-col gap-[19px] w-full">
              {/* Stacked bar */}
              <div className="flex items-center gap-[4px] w-full h-[10px]">
                {detail.allocation.map((slice) => (
                  <div
                    key={slice.label}
                    className="h-[10px] rounded-[2px]"
                    style={{ flex: `${slice.pct} 0 0`, backgroundColor: slice.color }}
                  />
                ))}
              </div>
              {/* Legend rows — same gap-[19px] container continues */}
              {detail.allocation.map((slice) => (
                <div key={slice.label} className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-[7px]">
                    <div className="w-[8px] h-[8px] rounded-[1px] shrink-0" style={{ backgroundColor: slice.color }} />
                    <p className="text-[12px] text-[#07132a] leading-normal capitalize">{slice.label}</p>
                  </div>
                  <p className="text-[12px] text-[#07132a] tabular-nums leading-normal">{slice.pct.toFixed(1)}%</p>
                </div>
              ))}
            </div>}
          </div>

          {/* Activity */}
          <div className="flex flex-col gap-[16px] flex-1 w-full min-h-0">
            <button onClick={() => setActivityOpen(v => !v)} className="flex items-center justify-between w-full group shrink-0">
              <p className="text-[12px] text-[#383f4d] leading-[1.3]">Activity</p>
              {activityOpen
                ? <Minus size={12} strokeWidth={1.75} className="text-[#9ca3af] group-hover:text-[#383f4d] transition-colors shrink-0" />
                : <Plus  size={12} strokeWidth={1.75} className="text-[#9ca3af] group-hover:text-[#383f4d] transition-colors shrink-0" />}
            </button>
            {activityOpen && <div className="flex flex-col gap-[10px] w-full overflow-y-auto flex-1 min-h-0">
              {detail.activity.map((item) => (
                <div key={item.id} className="flex flex-col gap-[4px] border-b border-[#dfe3e9] pb-[6px] w-full shrink-0">
                  <p className="text-[10px] text-[#636871] leading-[1.3]">{item.date}</p>
                  <div className="flex gap-[4px] items-center">
                    <div
                      className="w-[6px] h-[6px] rounded-full shrink-0"
                      style={{ backgroundColor: ACTIVITY_DOT[item.type] ?? '#9ca3af' }}
                    />
                    <p className="text-[12px] text-[#07132a] leading-[1.3]">{fmtActivityText(item)}</p>
                  </div>
                </div>
              ))}
            </div>}
          </div>
        </div>

        {/* Right content ────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* Performance chart */}
          <div className="shrink-0 bg-[#f9f9f9] border-b border-[#dfe3e9] flex flex-col" style={{ height: '260px' }}>
            <div className="flex items-center justify-between px-[18px] pt-[14px] pb-[10px] shrink-0">
              <span className="text-[10px] text-[#9ca3af] uppercase tracking-[0.07em] font-medium">Performance</span>
              <div className="flex items-center bg-white border border-[#e8eaed] rounded-[6px] p-[2px] gap-[1px]">
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      'px-[9px] py-[3px] rounded-[4px] text-[11px] font-medium transition-all leading-none',
                      period === p
                        ? 'bg-[#07132a] text-white shadow-[0_1px_2px_rgba(0,0,0,0.16)]'
                        : 'text-[#9ca3af] hover:text-[#6b7280]'
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 min-h-0 px-[8px] pb-[10px]">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`gd-${portfolio.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00205b" stopOpacity={0.10} />
                        <stop offset="100%" stopColor="#00205b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#ebebeb" strokeWidth={1} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: '#b0b7c3' }}
                      axisLine={false} tickLine={false} tickMargin={6}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#b0b7c3' }}
                      axisLine={false} tickLine={false}
                      tickFormatter={fmtAxis} width={52}
                    />
                    <Tooltip content={<ChartTip />} cursor={{ stroke: '#dfe3e9', strokeWidth: 1 }} />
                    <Area
                      type="monotone" dataKey="portfolio"
                      stroke="#00205b" strokeWidth={1.75}
                      fill={`url(#gd-${portfolio.id})`}
                      dot={false} activeDot={{ r: 3, fill: '#00205b', strokeWidth: 0 }}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone" dataKey="benchmark"
                      stroke="#c5cad3" strokeWidth={1.25} strokeDasharray="3 3"
                      dot={false} activeDot={false} isAnimationActive={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Chart legend */}
            <div className="flex items-center gap-[14px] px-[18px] pb-[12px] shrink-0">
              <div className="flex items-center gap-[5px]">
                <span className="w-[14px] h-[1.5px] bg-[#00205b] inline-block rounded-full" />
                <span className="text-[10px] text-[#9ca3af]">Portfolio</span>
              </div>
              <div className="flex items-center gap-[5px]">
                <svg width="14" height="2" viewBox="0 0 14 2">
                  <line x1="0" y1="1" x2="14" y2="1" stroke="#c5cad3" strokeWidth="1.5" strokeDasharray="3 2" />
                </svg>
                <span className="text-[10px] text-[#9ca3af]">{detail.benchmark}</span>
              </div>
            </div>
          </div>

          {/* Holdings table */}
          <div className="flex-1 overflow-y-auto min-h-0">

            {/* Header */}
            <div className="flex items-center border-b border-[#dfe3e9] bg-white sticky top-0 z-10">
              <div className="flex-[2.5_1_0%] min-w-0 pl-[18px] pr-[8px] py-[9px]">
                <span className="text-[10px] text-[#6b7280] uppercase tracking-[0.07em] font-medium leading-none">Security</span>
              </div>
              <div className="flex-[1_1_0%] min-w-0 px-[8px] py-[9px]">
                <span className="text-[10px] text-[#6b7280] uppercase tracking-[0.07em] font-medium leading-none">Asset Class</span>
              </div>
              <div className="flex-[1_1_0%] min-w-0 px-[8px] py-[9px] text-right">
                <span className="text-[10px] text-[#6b7280] uppercase tracking-[0.07em] font-medium leading-none">Value ($USD)</span>
              </div>
              <div className="w-[84px] shrink-0 px-[8px] py-[9px] text-right">
                <span className="text-[10px] text-[#6b7280] uppercase tracking-[0.07em] font-medium leading-none">Weight</span>
              </div>
              <div className="w-[88px] shrink-0 pl-[8px] pr-[18px] py-[9px] text-right">
                <span className="text-[10px] text-[#6b7280] uppercase tracking-[0.07em] font-medium leading-none">Total gain</span>
              </div>
            </div>

            {/* Rows */}
            {detail.holdings.map((h) => (
              <div
                key={h.ticker}
                onClick={() => h.assetClass !== 'Cash' && setSelectedHolding(h)}
                className={cn(
                  'flex items-center border-b border-[#f0f2f5] transition-colors',
                  h.assetClass !== 'Cash' ? 'cursor-pointer hover:bg-[#f8f9fb]' : ''
                )}
              >
                <div className="flex-[2.5_1_0%] min-w-0 pl-[18px] pr-[8px] py-[11px]">
                  <p className="text-[13px] text-[#07132a] leading-[1.35] truncate">{h.name}</p>
                  <p className="text-[10px] text-[#9ca3af] leading-none mt-[2px] font-mono">{h.ticker}</p>
                </div>
                <div className="flex-[1_1_0%] min-w-0 px-[8px] py-[11px]">
                  <span className="text-[12px] text-[#6b7280] leading-none">{h.assetClass === 'Fixed Income' ? 'Fixed Inc.' : h.assetClass}</span>
                </div>
                <div className="flex-[1_1_0%] min-w-0 px-[8px] py-[11px] text-right">
                  <span className="text-[13px] text-[#07132a] tabular-nums leading-none">{formatNumber(h.value)}</span>
                </div>
                <div className="w-[84px] shrink-0 px-[8px] py-[11px] text-right">
                  <span className="text-[13px] text-[#07132a] tabular-nums leading-none">{h.weight.toFixed(1)}%</span>
                </div>
                <div className="w-[88px] shrink-0 pl-[8px] pr-[18px] py-[11px] text-right">
                  {h.totalGain !== 0 ? (
                    <div>
                      <span className="text-[13px] text-[#07132a] tabular-nums leading-none block">
                        {h.totalGainPct >= 0 ? '+' : '−'}{Math.abs(h.totalGainPct).toFixed(2)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-[13px] text-[#9ca3af]">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Holding drill-down panel */}
      {selectedHolding && (
        <HoldingDetailPanel
          holding={selectedHolding}
          onClose={() => setSelectedHolding(null)}
          onInstruction={(ticker) => {
            setSelectedHolding(null);
            setInstructionCtx({ type: 'trim', ticker });
          }}
        />
      )}

      {/* Instruction modal */}
      {instructionCtx && (
        <InstructionModal
          context={instructionCtx}
          rmName={detail.managedBy === 'Self-directed' ? 'your advisor' : detail.managedBy}
          onClose={() => setInstructionCtx(null)}
        />
      )}
    </div>
  );
}
