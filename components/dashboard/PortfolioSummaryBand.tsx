import { summaryData } from '@/lib/data';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

export default function PortfolioSummaryBand() {
  const d = summaryData;
  const gainPos = d.dayGain >= 0;

  return (
    <div className="flex items-stretch">

      {/* ── TOTAL MARKET VALUE ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-[14px] px-[24px] py-[22px]">
        <p className="text-[10px] text-[#909297] uppercase tracking-[0.08em] leading-none whitespace-nowrap">
          Total Market Value&ensp;·&ensp;{d.asOfDate}
        </p>
        <div className="flex flex-col gap-[6px]">
          <p className="text-[30px] text-[#07132a] leading-none tracking-tight tabular-nums">
            {formatNumber(d.totalMarketValue)}
          </p>
          <p className={cn(
            'text-[11px] leading-none tabular-nums',
            gainPos ? 'text-[#16a34a]' : 'text-[#dc2626]'
          )}>
            {gainPos ? '+' : ''}{formatNumber(d.dayGain)}&ensp;({gainPos ? '+' : ''}{d.dayGainPct.toFixed(2)}%)
          </p>
        </div>
      </div>

      <Divider />

      {/* ── PERFORMANCE ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-between px-[24px] py-[22px]">
        <p className="text-[10px] text-[#909297] uppercase tracking-[0.08em] leading-none whitespace-nowrap">Performance</p>
        <div className="flex flex-col gap-[8px]">
          <Row label="Total return YTD" value={`+${d.ytdReturn.toFixed(2)}%`} />
          <Row label="vs Benchmark" value={`+${d.vsBenchmark.toFixed(1)} pp`} valueGreen />
        </div>
      </div>

      <Divider />

      {/* ── POSITION ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-between px-[24px] py-[22px]">
        <p className="text-[10px] text-[#909297] uppercase tracking-[0.08em] leading-none whitespace-nowrap">Position</p>
        <div className="flex flex-col gap-[8px]">
          <Row label="Net asset value" value={formatNumber(d.netAssetValue)} />
          <Row label="Liabilities" value={formatNumber(d.liabilities)} />
        </div>
      </div>

      <Divider />

      {/* ── LIQUIDITY ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-between px-[24px] py-[22px]">
        <p className="text-[10px] text-[#909297] uppercase tracking-[0.08em] leading-none whitespace-nowrap">Liquidity</p>
        <div className="flex flex-col gap-[8px]">
          <Row label="Available borrowing" value={formatNumber(d.availableBorrowing)} />
          <Row label="Cash" value={formatNumber(d.cash)} />
        </div>
      </div>

    </div>
  );
}

function Divider() {
  return (
    <div className="shrink-0 self-stretch py-[10px]">
      <div className="w-px h-full bg-[#dfe3e9]" />
    </div>
  );
}

function Row({
  label,
  value,
  valueGreen,
}: {
  label: string;
  value: string;
  valueGreen?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-[12px]">
      <span className="text-[12px] text-[#6b7280] leading-none shrink-0">{label}</span>
      <span className={cn(
        'text-[12px] leading-none tabular-nums text-right',
        valueGreen ? 'text-[#16a34a]' : 'text-[#07132a]'
      )}>
        {value}
      </span>
    </div>
  );
}
