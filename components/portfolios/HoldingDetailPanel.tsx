'use client';

import { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Holding } from '@/lib/detail-data';
import { formatNumber } from '@/lib/format';

const NEWS: Record<string, { date: string; headline: string; source: string }[]> = {
  AAPL: [
    { date: '7 Oct', headline: 'Apple reports record Q4 services revenue, beats EPS estimates', source: 'Bloomberg' },
    { date: '3 Oct', headline: 'iPhone 17 pre-orders exceed 50M units in first 48 hours', source: 'Reuters' },
    { date: '28 Sep', headline: 'Apple expands Vision Pro enterprise program to 40 new markets', source: 'FT' },
  ],
  NVDA: [
    { date: '6 Oct', headline: 'NVIDIA Blackwell chip demand described as "insane" by Jensen Huang', source: 'Bloomberg' },
    { date: '2 Oct', headline: 'NVIDIA and TSMC sign expanded foundry agreement through 2028', source: 'Reuters' },
    { date: '25 Sep', headline: 'AI data centre capex drives NVIDIA forward guidance upgrade', source: 'FT' },
  ],
  MSFT: [
    { date: '5 Oct', headline: 'Microsoft Copilot reaches 100M enterprise users milestone', source: 'Bloomberg' },
    { date: '1 Oct', headline: 'Azure cloud revenue grows 34% YoY in latest quarter', source: 'Reuters' },
    { date: '22 Sep', headline: 'Microsoft and OpenAI deepen partnership with $10B infrastructure deal', source: 'FT' },
  ],
  TSLA: [
    { date: '6 Oct', headline: 'Tesla Q3 deliveries miss consensus by 8%, shares fall 4%', source: 'Bloomberg' },
    { date: '2 Oct', headline: 'Cybertruck recall expanded to 27,000 vehicles over software issue', source: 'Reuters' },
    { date: '18 Sep', headline: 'Tesla Robotaxi event delayed again, investors await clarity', source: 'FT' },
  ],
  GOOGL: [
    { date: '7 Oct', headline: 'Alphabet faces landmark antitrust remedy phase in search monopoly case', source: 'Bloomberg' },
    { date: '3 Oct', headline: 'Google DeepMind releases Gemini 2.0, benchmarks surpass GPT-5', source: 'Reuters' },
    { date: '27 Sep', headline: 'YouTube Shorts crosses 100B daily views, monetisation ramps', source: 'FT' },
  ],
  META: [
    { date: '5 Oct', headline: 'Meta AI assistant reaches 500M monthly active users', source: 'Bloomberg' },
    { date: '30 Sep', headline: 'Meta Quest 4 pre-orders open, enterprise focus drives demand', source: 'Reuters' },
    { date: '24 Sep', headline: 'Reels ad revenue up 22% QoQ, closing gap with YouTube', source: 'FT' },
  ],
  BLAGG: [
    { date: '1 Oct', headline: 'BlackRock World Bond Fund declares quarterly dividend: $0.42/unit', source: 'BlackRock' },
    { date: '15 Sep', headline: 'Global bond yields stabilise as Fed signals rate plateau', source: 'Bloomberg' },
    { date: '5 Sep', headline: 'BlackRock increases IG corporate allocation in multi-asset funds', source: 'FT' },
  ],
  JAGG: [
    { date: '28 Sep', headline: 'JP Morgan Core Bond overweights short-duration Treasuries', source: 'JPM AM' },
    { date: '15 Sep', headline: 'Investment grade spreads tighten 12bps on strong demand', source: 'Bloomberg' },
    { date: '3 Sep', headline: 'Core bond funds see $4.2B inflows as rate path clears', source: 'FT' },
  ],
  GLD: [
    { date: '7 Oct', headline: 'Gold hits record $2,890/oz as central bank demand accelerates', source: 'Bloomberg' },
    { date: '1 Oct', headline: 'IMF raises global gold reserve holdings forecast for 2027', source: 'Reuters' },
    { date: '22 Sep', headline: 'Geopolitical risk premium adds $120 to gold price YTD', source: 'FT' },
  ],
  ACWI: [
    { date: '6 Oct', headline: 'MSCI World ETF AUM crosses $200B as passive flows accelerate', source: 'Bloomberg' },
    { date: '1 Oct', headline: 'EM weighting in ACWI revised upward as China markets recover', source: 'Reuters' },
    { date: '25 Sep', headline: 'Global equities resilient despite rate volatility — MSCI commentary', source: 'MSCI' },
  ],
};

const GENERIC_NEWS = [
  { date: '6 Oct', headline: 'Position performing in line with benchmark over trailing quarter', source: 'DB Research' },
  { date: '1 Oct', headline: 'No material corporate actions expected in near term', source: 'DB Research' },
  { date: '20 Sep', headline: 'Sector outlook remains constructive into year-end', source: 'DB Research' },
];

const AC_COLORS: Record<string, string> = {
  Equity: '#00205b',
  'Fixed Income': '#3b82f6',
  Alternatives: '#8b5cf6',
  Cash: '#9ca3af',
};

function genPriceHistory(holding: Holding): { label: string; price: number }[] {
  const startVal = Math.max(holding.value - holding.totalGain, 1);
  const endVal = holding.value;
  const seed = (holding.ticker.charCodeAt(0) || 65) + (holding.ticker.charCodeAt(1) || 65) * 0.5;
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  return Array.from({ length: 13 }, (_, i) => {
    const t = i / 12;
    const trend = startVal + (endVal - startVal) * t;
    const amp = Math.abs(endVal - startVal) * 0.18 + endVal * 0.012;
    const noise = amp * (Math.sin(i * 1.9 + seed) * 0.6 + Math.cos(i * 3.1 + seed * 0.8) * 0.4);
    const price = i === 0 ? startVal : i === 12 ? endVal : Math.max(1, Math.round(trend + noise));
    return { label: months[i], price };
  });
}

function SparkTip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#e8eaed] rounded-[5px] shadow-sm px-[8px] py-[5px]">
      <span className="text-[11px] text-[#07132a] tabular-nums">{formatNumber(payload[0].value)}</span>
    </div>
  );
}

function MetricRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-[8px] min-h-[26px]">
      <span className="text-[11px] text-[#9ca3af] shrink-0 leading-[26px]">{label}</span>
      <span className="text-[11px] text-right leading-[26px] tabular-nums" style={{ color: color ?? '#07132a' }}>
        {value}
      </span>
    </div>
  );
}

interface Props {
  holding: Holding;
  onClose: () => void;
  onInstruction: (ticker: string) => void;
}

export default function HoldingDetailPanel({ holding, onClose, onInstruction }: Props) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 220);
  };

  const priceData = genPriceHistory(holding);
  const news = NEWS[holding.ticker] ?? GENERIC_NEWS;
  const costBasis = Math.max(holding.value - holding.totalGain, 0);
  const unrealisedPos = holding.totalGain >= 0;
  const dayPos = (holding.dayGain ?? 0) >= 0;
  const isIlliquid = holding.dayGain === null;
  const isCash = holding.assetClass === 'Cash';
  const acColor = AC_COLORS[holding.assetClass] ?? '#9ca3af';
  const displayTicker = holding.ticker === '—' ? '' : holding.ticker;

  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: 'rgba(7,19,42,0.04)',
          backdropFilter: 'blur(1px)',
          transition: 'opacity 200ms',
          opacity: visible ? 1 : 0,
        }}
        onClick={handleClose}
      />

      {/* Slide-over panel */}
      <div
        className="absolute top-0 right-0 bottom-0 w-[380px] z-20 bg-white border-l border-[#e8eaed] flex flex-col"
        style={{
          boxShadow: '-8px 0 32px rgba(0,0,0,0.07)',
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 220ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[20px] h-[44px] shrink-0 border-b border-[#f0f2f5]">
          <div className="flex items-center gap-[8px] min-w-0">
            {displayTicker && (
              <span className="text-[12px] font-mono font-semibold text-[#07132a]">{displayTicker}</span>
            )}
            <span
              className="text-[10px] px-[5px] py-[2px] rounded-[3px] font-medium shrink-0"
              style={{ backgroundColor: `${acColor}18`, color: acColor }}
            >
              {holding.assetClass === 'Fixed Income' ? 'Fixed Inc.' : holding.assetClass}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="w-[24px] h-[24px] flex items-center justify-center rounded-[4px] text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#374151] transition-colors shrink-0"
          >
            <X size={13} strokeWidth={1.75} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Name + value hero */}
          <div className="px-[20px] pt-[20px] pb-[16px]">
            <p className="text-[15px] text-[#07132a] font-medium leading-tight mb-[2px]">{holding.name}</p>
            <p className="text-[11px] text-[#9ca3af] mb-[14px]">{holding.weight.toFixed(1)}% of portfolio</p>
            <div
              className="text-[22px] text-[#07132a] tabular-nums leading-none mb-[4px]"
              style={{ fontFamily: "'DeutscheBankDisplay', sans-serif" }}
            >
              {formatNumber(holding.value)}
            </div>
            {!isIlliquid && (
              <div className="flex items-center gap-[4px]">
                {dayPos
                  ? <TrendingUp size={11} style={{ color: '#16a34a' }} />
                  : <TrendingDown size={11} style={{ color: '#dc2626' }} />}
                <span
                  className="text-[11px] tabular-nums"
                  style={{ color: dayPos ? '#16a34a' : '#dc2626' }}
                >
                  {dayPos ? '+' : '−'}{formatNumber(Math.abs(holding.dayGain!))} ({dayPos ? '+' : '−'}{Math.abs(holding.dayGainPct ?? 0).toFixed(2)}%) today
                </span>
              </div>
            )}
            {isIlliquid && (
              <span className="text-[11px] text-[#9ca3af]">Illiquid — no daily mark</span>
            )}
          </div>

          {/* Price chart (liquid, non-cash positions only) */}
          {!isIlliquid && !isCash && (
            <div className="px-[20px] border-t border-[#f0f2f5] pt-[16px] pb-[4px]">
              <p className="text-[10px] text-[#b0b7c3] uppercase tracking-[0.08em] font-medium mb-[10px]">
                12-Month Performance
              </p>
              {mounted ? (
                <ResponsiveContainer width="100%" height={110}>
                  <LineChart data={priceData} margin={{ top: 2, right: 2, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 9, fill: '#b0b7c3' }}
                      axisLine={false} tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip content={<SparkTip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />
                    <Line
                      type="monotone" dataKey="price"
                      stroke={acColor} strokeWidth={1.5}
                      dot={false}
                      activeDot={{ r: 2.5, fill: acColor, strokeWidth: 0 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[110px] bg-[#f8f9fb] rounded-[6px] animate-pulse" />
              )}
            </div>
          )}

          {/* Position detail */}
          <div className="px-[20px] py-[16px] border-t border-[#f0f2f5]">
            <p className="text-[10px] text-[#b0b7c3] uppercase tracking-[0.08em] font-medium mb-[10px]">
              Position Detail
            </p>
            <div className="flex flex-col">
              <MetricRow label="Market Value" value={formatNumber(holding.value)} />
              {!isIlliquid && !isCash && (
                <MetricRow label="Cost Basis" value={formatNumber(costBasis)} />
              )}
              {!isCash && (
                <MetricRow
                  label="Unrealised P&L"
                  value={`${unrealisedPos ? '+' : '−'}${formatNumber(Math.abs(holding.totalGain))} (${unrealisedPos ? '+' : ''}${holding.totalGainPct.toFixed(2)}%)`}
                  color={unrealisedPos ? '#16a34a' : '#dc2626'}
                />
              )}
              <MetricRow label="Portfolio Weight" value={`${holding.weight.toFixed(1)}%`} />
              {isIlliquid && <MetricRow label="Liquidity" value="Illiquid" color="#9ca3af" />}
            </div>
          </div>

          {/* News */}
          {!isCash && (
            <div className="px-[20px] py-[16px] border-t border-[#f0f2f5]">
              <p className="text-[10px] text-[#b0b7c3] uppercase tracking-[0.08em] font-medium mb-[12px]">
                Recent News
              </p>
              <div className="flex flex-col gap-[14px]">
                {news.map((item, i) => (
                  <div key={i}>
                    <p className="text-[12px] text-[#07132a] leading-[1.45] mb-[4px]">{item.headline}</p>
                    <div className="flex items-center gap-[6px]">
                      <span className="text-[10px] text-[#6b7280] font-medium">{item.source}</span>
                      <span className="text-[10px] text-[#d1d5db]">·</span>
                      <span className="text-[10px] text-[#9ca3af]">{item.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer CTA */}
        {!isCash && (
          <div className="shrink-0 px-[20px] py-[14px] border-t border-[#f0f2f5]">
            <button
              onClick={() => onInstruction(displayTicker || holding.name)}
              className="w-full bg-[#00205b] text-white text-[12px] font-medium py-[9px] rounded-[6px] hover:bg-[#001844] transition-colors"
            >
              Give instruction{displayTicker ? ` on ${displayTicker}` : ''}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
