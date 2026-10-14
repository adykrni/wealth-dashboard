export interface Holding {
  name: string;
  ticker: string;
  assetClass: 'Equity' | 'Fixed Income' | 'Alternatives' | 'Cash';
  weight: number;
  value: number;
  dayGain: number | null;
  dayGainPct: number | null;
  totalGain: number;
  totalGainPct: number;
}

export interface ActivityItem {
  id: string;
  date: string;
  type: 'BUY' | 'SELL' | 'DIVIDEND' | 'REBALANCE' | 'DEPOSIT';
  security?: string;
  amount: number;
}

export interface AllocationSlice {
  label: string;
  pct: number;
  color: string;
}

export interface PerfPoint {
  label: string;
  portfolio: number;
  benchmark: number;
}

export interface PortfolioDetailData {
  managedBy: string;
  inceptionDate: string;
  benchmark: string;
  ytdReturn: number;
  vsBenchmark: number | null;
  volatility: number | null;
  sharpeRatio: number | null;
  allocation: AllocationSlice[];
  holdings: Holding[];
  activity: ActivityItem[];
  performance: PerfPoint[];
}

const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function genPerf(
  startVal: number,
  endVal: number,
  benchEndVal: number,
  nMonths: number,
  seed: number,
  amp = 0.016
): PerfPoint[] {
  const pts: PerfPoint[] = [];
  for (let i = 0; i <= nMonths; i++) {
    const d = new Date(2026, 9 - (nMonths - i), 1);
    const lbl = `${M[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
    const t = i / nMonths;
    const pTrend = startVal + (endVal - startVal) * t;
    const bTrend = startVal + (benchEndVal - startVal) * t;
    const pn = pTrend * amp * (Math.sin(i * 1.3 + seed) * 0.7 + Math.cos(i * 2.9 + seed * 0.8) * 0.5);
    const bn = bTrend * amp * 0.75 * (Math.sin(i * 1.1 + seed + 1.8) * 0.65 + Math.cos(i * 2.5 + seed * 0.9) * 0.45);
    pts.push({
      label: lbl,
      portfolio: i === 0 ? Math.round(startVal) : i === nMonths ? Math.round(endVal) : Math.round(pTrend + pn),
      benchmark: i === 0 ? Math.round(startVal) : i === nMonths ? Math.round(benchEndVal) : Math.round(bTrend + bn),
    });
  }
  return pts;
}

export const portfolioDetails: Record<string, PortfolioDetailData> = {
  '1': {
    managedBy: 'Sarah Chen',
    inceptionDate: 'Mar 2021',
    benchmark: 'MSCI World 60/40',
    ytdReturn: 11.02,
    vsBenchmark: 2.1,
    volatility: 8.4,
    sharpeRatio: 1.42,
    performance: genPerf(11_020_694, 12_450_180, 12_164_283, 36, 1.3, 0.018),
    allocation: [
      { label: 'Equities', pct: 59.8, color: '#3f8cdf' },
      { label: 'Fixed Income', pct: 29.1, color: '#7d9cd2' },
      { label: 'Alternatives', pct: 7.2, color: '#a78bfa' },
      { label: 'Cash', pct: 3.9, color: '#efc378' },
    ],
    holdings: [
      { name: 'BlackRock World Bond', ticker: 'BLAGG', assetClass: 'Fixed Income', weight: 15.3, value: 1_904_878, dayGain: 9524, dayGainPct: 0.50, totalGain: 84_200, totalGainPct: 4.63 },
      { name: 'JP Morgan Core Bond', ticker: 'JAGG', assetClass: 'Fixed Income', weight: 13.7, value: 1_705_858, dayGain: 7953, dayGainPct: 0.47, totalGain: 58_320, totalGainPct: 3.54 },
      { name: 'Apple Inc', ticker: 'AAPL', assetClass: 'Equity', weight: 12.4, value: 1_543_822, dayGain: 43_381, dayGainPct: 2.81, totalGain: 285_120, totalGainPct: 22.67 },
      { name: 'MSCI World ETF', ticker: 'ACWI', assetClass: 'Equity', weight: 10.8, value: 1_344_619, dayGain: 38_322, dayGainPct: 2.85, totalGain: 198_450, totalGainPct: 17.29 },
      { name: 'Microsoft Corp', ticker: 'MSFT', assetClass: 'Equity', weight: 9.6, value: 1_195_217, dayGain: 32_629, dayGainPct: 2.73, totalGain: 215_380, totalGainPct: 22.00 },
      { name: 'NVIDIA Corp', ticker: 'NVDA', assetClass: 'Equity', weight: 8.2, value: 1_020_915, dayGain: 35_323, dayGainPct: 3.46, totalGain: 420_150, totalGainPct: 69.89 },
      { name: 'iShares MSCI EM', ticker: 'EEM', assetClass: 'Equity', weight: 7.8, value: 971_114, dayGain: 20_879, dayGainPct: 2.15, totalGain: 82_340, totalGainPct: 9.27 },
      { name: 'Gold ETF', ticker: 'GLD', assetClass: 'Alternatives', weight: 5.3, value: 659_860, dayGain: 13_009, dayGainPct: 1.97, totalGain: 148_200, totalGainPct: 28.95 },
      { name: 'Cash & Equivalents', ticker: '—', assetClass: 'Cash', weight: 3.9, value: 485_320, dayGain: null, dayGainPct: null, totalGain: 0, totalGainPct: 0.00 },
      { name: 'Vanguard Real Estate', ticker: 'VNQ', assetClass: 'Alternatives', weight: 1.9, value: 236_553, dayGain: 4305, dayGainPct: 1.82, totalGain: 21_126, totalGainPct: 9.81 },
    ],
    activity: [
      { id: 'a1', date: '4 Oct 2026', type: 'BUY', security: 'NVDA', amount: 125_000 },
      { id: 'a2', date: '1 Oct 2026', type: 'DIVIDEND', security: 'AAPL', amount: 3_840 },
      { id: 'a3', date: '25 Sep 2026', type: 'REBALANCE', amount: 0 },
      { id: 'a4', date: '18 Sep 2026', type: 'SELL', security: 'VNQ', amount: 52_000 },
      { id: 'a5', date: '10 Sep 2026', type: 'DIVIDEND', security: 'BLAGG', amount: 9_210 },
      { id: 'a6', date: '1 Sep 2026', type: 'DEPOSIT', amount: 250_000 },
    ],
  },

  '2': {
    managedBy: 'Self-directed',
    inceptionDate: 'Jan 2022',
    benchmark: 'S&P 500',
    ytdReturn: 14.2,
    vsBenchmark: -0.8,
    volatility: 18.6,
    sharpeRatio: 0.87,
    performance: genPerf(4_907_952, 5_318_748, 5_359_828, 36, 2.1, 0.030),
    allocation: [
      { label: 'Equities', pct: 87.3, color: '#3f8cdf' },
      { label: 'Cash', pct: 8.1, color: '#efc378' },
      { label: 'Derivatives', pct: 4.6, color: '#7d9cd2' },
    ],
    holdings: [
      { name: 'Apple Inc', ticker: 'AAPL', assetClass: 'Equity', weight: 18.5, value: 983_968, dayGain: -14_892, dayGainPct: -1.51, totalGain: 152_840, totalGainPct: 18.41 },
      { name: 'NVIDIA Corp', ticker: 'NVDA', assetClass: 'Equity', weight: 16.2, value: 861_638, dayGain: -13_012, dayGainPct: -1.51, totalGain: 285_200, totalGainPct: 49.44 },
      { name: 'Tesla Inc', ticker: 'TSLA', assetClass: 'Equity', weight: 14.8, value: 787_175, dayGain: -11_847, dayGainPct: -1.51, totalGain: -42_300, totalGainPct: -5.10 },
      { name: 'Alphabet Inc', ticker: 'GOOGL', assetClass: 'Equity', weight: 12.4, value: 659_524, dayGain: -9_941, dayGainPct: -1.51, totalGain: 98_420, totalGainPct: 17.54 },
      { name: 'Meta Platforms', ticker: 'META', assetClass: 'Equity', weight: 11.6, value: 616_975, dayGain: -9_294, dayGainPct: -1.51, totalGain: 82_900, totalGainPct: 15.52 },
      { name: 'S&P 500 ETF', ticker: 'SPY', assetClass: 'Equity', weight: 13.8, value: 734_387, dayGain: -11_023, dayGainPct: -1.51, totalGain: 65_300, totalGainPct: 9.77 },
      { name: 'SPX Call Options', ticker: 'SPX C', assetClass: 'Alternatives', weight: 4.6, value: 244_800, dayGain: -8_624, dayGainPct: -3.40, totalGain: 168_135, totalGainPct: 219.46 },
      { name: 'Cash & Equivalents', ticker: '—', assetClass: 'Cash', weight: 8.1, value: 431_081, dayGain: null, dayGainPct: null, totalGain: 0, totalGainPct: 0 },
    ],
    activity: [
      { id: 'b1', date: '5 Oct 2026', type: 'BUY', security: 'NVDA', amount: 85_000 },
      { id: 'b2', date: '2 Oct 2026', type: 'SELL', security: 'TSLA', amount: 42_000 },
      { id: 'b3', date: '28 Sep 2026', type: 'BUY', security: 'SPX C', amount: 32_000 },
      { id: 'b4', date: '15 Sep 2026', type: 'SELL', security: 'AAPL', amount: 110_000 },
      { id: 'b5', date: '5 Sep 2026', type: 'DEPOSIT', amount: 500_000 },
    ],
  },

  '3': {
    managedBy: 'Klaus Weber',
    inceptionDate: 'Jun 2021',
    benchmark: 'MSCI Europe',
    ytdReturn: -3.2,
    vsBenchmark: -3.1,
    volatility: 21.4,
    sharpeRatio: -0.22,
    performance: genPerf(4_841_580, 4_622_940, 4_754_124, 36, 3.7, 0.028),
    allocation: [
      { label: 'Equities', pct: 82.4, color: '#3f8cdf' },
      { label: 'Cash', pct: 11.7, color: '#efc378' },
      { label: 'Derivatives', pct: 5.9, color: '#7d9cd2' },
    ],
    holdings: [
      { name: 'Euro Stoxx 50 ETF', ticker: 'SX5E', assetClass: 'Equity', weight: 23.4, value: 1_081_768, dayGain: 10_170, dayGainPct: 0.94, totalGain: -76_440, totalGainPct: -6.61 },
      { name: 'ASML Holding', ticker: 'ASML', assetClass: 'Equity', weight: 16.8, value: 776_654, dayGain: 7_299, dayGainPct: 0.95, totalGain: -89_400, totalGainPct: -10.32 },
      { name: 'LVMH Group', ticker: 'MC', assetClass: 'Equity', weight: 15.3, value: 707_310, dayGain: 6_649, dayGainPct: 0.94, totalGain: -62_100, totalGainPct: -8.07 },
      { name: 'SAP SE', ticker: 'SAP', assetClass: 'Equity', weight: 14.1, value: 651_835, dayGain: 6_128, dayGainPct: 0.94, totalGain: 48_200, totalGainPct: 7.99 },
      { name: 'Siemens AG', ticker: 'SIE', assetClass: 'Equity', weight: 12.8, value: 591_736, dayGain: 5_562, dayGainPct: 0.95, totalGain: -38_900, totalGainPct: -6.17 },
      { name: 'DAX Put Options', ticker: 'DAX P', assetClass: 'Alternatives', weight: 5.9, value: 272_753, dayGain: -8_152, dayGainPct: -2.90, totalGain: 128_260, totalGainPct: 88.74 },
      { name: 'Cash & Equivalents', ticker: '—', assetClass: 'Cash', weight: 11.7, value: 540_884, dayGain: null, dayGainPct: null, totalGain: 0, totalGainPct: 0 },
    ],
    activity: [
      { id: 'c1', date: '3 Oct 2026', type: 'BUY', security: 'SIE', amount: 65_000 },
      { id: 'c2', date: '29 Sep 2026', type: 'BUY', security: 'DAX P', amount: 28_000 },
      { id: 'c3', date: '22 Sep 2026', type: 'SELL', security: 'MC', amount: 95_000 },
      { id: 'c4', date: '10 Sep 2026', type: 'REBALANCE', amount: 0 },
      { id: 'c5', date: '2 Sep 2026', type: 'DEPOSIT', amount: 200_000 },
    ],
  },

  '4': {
    managedBy: 'Michael Torres',
    inceptionDate: 'Aug 2018',
    benchmark: 'Barclays US Agg',
    ytdReturn: 4.8,
    vsBenchmark: 1.3,
    volatility: 5.2,
    sharpeRatio: 1.18,
    performance: genPerf(1_704_009, 1_806_399, 1_780_802, 36, 0.8, 0.010),
    allocation: [
      { label: 'Fixed Income', pct: 52.4, color: '#7d9cd2' },
      { label: 'Equities', pct: 38.6, color: '#3f8cdf' },
      { label: 'Alternatives', pct: 3.2, color: '#a78bfa' },
      { label: 'Cash', pct: 5.8, color: '#efc378' },
    ],
    holdings: [
      { name: 'US Treasury 10Y', ticker: 'TLT', assetClass: 'Fixed Income', weight: 24.5, value: 442_568, dayGain: 2942, dayGainPct: 0.67, totalGain: 18_420, totalGainPct: 4.34 },
      { name: 'Vanguard Total Stock', ticker: 'VTI', assetClass: 'Equity', weight: 22.8, value: 412_059, dayGain: 2848, dayGainPct: 0.69, totalGain: 41_200, totalGainPct: 11.10 },
      { name: 'Invest. Grade Corp', ticker: 'LQD', assetClass: 'Fixed Income', weight: 18.2, value: 328_764, dayGain: 2191, dayGainPct: 0.67, totalGain: 12_980, totalGainPct: 4.11 },
      { name: 'iShares Dividend', ticker: 'DVY', assetClass: 'Equity', weight: 15.8, value: 285_411, dayGain: 1798, dayGainPct: 0.63, totalGain: 26_400, totalGainPct: 10.19 },
      { name: 'TIPS ETF', ticker: 'TIPS', assetClass: 'Fixed Income', weight: 9.7, value: 175_221, dayGain: 1012, dayGainPct: 0.58, totalGain: 5_810, totalGainPct: 3.43 },
      { name: 'Gold ETF', ticker: 'GLD', assetClass: 'Alternatives', weight: 3.2, value: 57_804, dayGain: 1138, dayGainPct: 1.97, totalGain: 12_080, totalGainPct: 26.44 },
      { name: 'Cash & Equivalents', ticker: '—', assetClass: 'Cash', weight: 5.8, value: 104_772, dayGain: null, dayGainPct: null, totalGain: 0, totalGainPct: 0 },
    ],
    activity: [
      { id: 'd1', date: '1 Oct 2026', type: 'DIVIDEND', security: 'DVY', amount: 1_820 },
      { id: 'd2', date: '28 Sep 2026', type: 'REBALANCE', amount: 0 },
      { id: 'd3', date: '15 Sep 2026', type: 'DIVIDEND', security: 'LQD', amount: 1_240 },
      { id: 'd4', date: '1 Sep 2026', type: 'DIVIDEND', security: 'TLT', amount: 2_140 },
      { id: 'd5', date: '15 Aug 2026', type: 'BUY', security: 'TIPS', amount: 25_000 },
    ],
  },

  '5': {
    managedBy: 'Sarah Chen',
    inceptionDate: 'Nov 2019',
    benchmark: 'MSCI World',
    ytdReturn: 8.4,
    vsBenchmark: -0.6,
    volatility: 11.8,
    sharpeRatio: 0.98,
    performance: genPerf(1_081_566, 1_142_850, 1_152_043, 36, 4.2, 0.020),
    allocation: [
      { label: 'Equities', pct: 71.4, color: '#3f8cdf' },
      { label: 'Fixed Income', pct: 22.6, color: '#7d9cd2' },
      { label: 'Cash', pct: 6.0, color: '#efc378' },
    ],
    holdings: [
      { name: 'Global Equity Fund', ticker: 'ACWI', assetClass: 'Equity', weight: 38.2, value: 436_568, dayGain: 2270, dayGainPct: 0.52, totalGain: 42_100, totalGainPct: 10.67 },
      { name: 'Clean Energy ETF', ticker: 'ICLN', assetClass: 'Equity', weight: 14.6, value: 166_857, dayGain: 867, dayGainPct: 0.52, totalGain: -10_400, totalGainPct: -5.87 },
      { name: 'US Small Cap ETF', ticker: 'IWM', assetClass: 'Equity', weight: 18.6, value: 212_570, dayGain: 1105, dayGainPct: 0.52, totalGain: 18_900, totalGainPct: 9.77 },
      { name: 'EM Bond ETF', ticker: 'EMB', assetClass: 'Fixed Income', weight: 14.2, value: 162_285, dayGain: 843, dayGainPct: 0.52, totalGain: 8_200, totalGainPct: 5.32 },
      { name: 'Aggregate Bond ETF', ticker: 'AGG', assetClass: 'Fixed Income', weight: 8.4, value: 96_000, dayGain: 499, dayGainPct: 0.52, totalGain: 2_820, totalGainPct: 3.03 },
      { name: 'Cash & Equivalents', ticker: '—', assetClass: 'Cash', weight: 6.0, value: 68_570, dayGain: null, dayGainPct: null, totalGain: 0, totalGainPct: 0 },
    ],
    activity: [
      { id: 'e1', date: '4 Oct 2026', type: 'BUY', security: 'ACWI', amount: 15_000 },
      { id: 'e2', date: '1 Oct 2026', type: 'DIVIDEND', security: 'AGG', amount: 380 },
      { id: 'e3', date: '20 Sep 2026', type: 'BUY', security: 'ICLN', amount: 12_000 },
      { id: 'e4', date: '1 Sep 2026', type: 'DEPOSIT', amount: 50_000 },
    ],
  },

  '6': {
    managedBy: 'DB Private Equity',
    inceptionDate: 'Jan 2020',
    benchmark: 'Cambridge PE Index',
    ytdReturn: 22.5,
    vsBenchmark: null,
    volatility: null,
    sharpeRatio: null,
    performance: genPerf(2_625_000, 3_750_000, 3_412_500, 36, 5.8, 0.022),
    allocation: [
      { label: 'Private Equity', pct: 84.2, color: '#3f8cdf' },
      { label: 'Co-Investments', pct: 12.1, color: '#7d9cd2' },
      { label: 'Cash', pct: 3.7, color: '#efc378' },
    ],
    holdings: [
      { name: 'Fund IV – Primary LP', ticker: 'F4-LP', assetClass: 'Alternatives', weight: 62.4, value: 2_340_000, dayGain: null, dayGainPct: null, totalGain: 840_000, totalGainPct: 56.00 },
      { name: 'Fund IV – Secondary', ticker: 'F4-S', assetClass: 'Alternatives', weight: 21.8, value: 817_500, dayGain: null, dayGainPct: null, totalGain: 86_250, totalGainPct: 11.80 },
      { name: 'Tech Co-Investment A', ticker: 'CO-A', assetClass: 'Alternatives', weight: 12.1, value: 453_750, dayGain: null, dayGainPct: null, totalGain: 198_750, totalGainPct: 77.94 },
      { name: 'Cash & Reserves', ticker: '—', assetClass: 'Cash', weight: 3.7, value: 138_750, dayGain: null, dayGainPct: null, totalGain: 0, totalGainPct: 0 },
    ],
    activity: [
      { id: 'f1', date: '30 Sep 2026', type: 'DIVIDEND', security: 'F4-LP', amount: 125_000 },
      { id: 'f2', date: '31 Mar 2026', type: 'DIVIDEND', security: 'F4-LP', amount: 118_000 },
      { id: 'f3', date: '30 Sep 2025', type: 'DIVIDEND', security: 'F4-LP', amount: 102_000 },
      { id: 'f4', date: '15 Jun 2025', type: 'BUY', security: 'CO-A', amount: 255_000 },
    ],
  },

  '7': {
    managedBy: 'James Whitfield',
    inceptionDate: 'Apr 2017',
    benchmark: 'Family Office Composite',
    ytdReturn: 9.2,
    vsBenchmark: 1.8,
    volatility: 9.1,
    sharpeRatio: 1.31,
    performance: genPerf(2_599_826, 2_914_608, 2_851_652, 36, 0.6, 0.016),
    allocation: [
      { label: 'Equities', pct: 44.8, color: '#3f8cdf' },
      { label: 'Fixed Income', pct: 28.4, color: '#7d9cd2' },
      { label: 'Alternatives', pct: 19.6, color: '#a78bfa' },
      { label: 'Cash', pct: 7.2, color: '#efc378' },
    ],
    holdings: [
      { name: 'US Large Cap Blend', ticker: 'VV', assetClass: 'Equity', weight: 22.4, value: 653_032, dayGain: 2677, dayGainPct: 0.41, totalGain: 82_400, totalGainPct: 14.43 },
      { name: 'Aggregate Bond ETF', ticker: 'AGG', assetClass: 'Fixed Income', weight: 16.8, value: 489_655, dayGain: 2008, dayGainPct: 0.41, totalGain: 22_100, totalGainPct: 4.73 },
      { name: 'International ETF', ticker: 'EFA', assetClass: 'Equity', weight: 14.2, value: 413_874, dayGain: 1697, dayGainPct: 0.41, totalGain: 38_200, totalGainPct: 10.17 },
      { name: 'US Corp Bond', ticker: 'USIG', assetClass: 'Fixed Income', weight: 11.6, value: 338_094, dayGain: 1386, dayGainPct: 0.41, totalGain: 15_800, totalGainPct: 4.90 },
      { name: 'Hedge Fund A', ticker: 'HFA', assetClass: 'Alternatives', weight: 8.2, value: 238_840, dayGain: null, dayGainPct: null, totalGain: 51_282, totalGainPct: 27.36 },
      { name: 'Art & Collectibles', ticker: 'ART', assetClass: 'Alternatives', weight: 5.8, value: 169_047, dayGain: null, dayGainPct: null, totalGain: 42_100, totalGainPct: 33.17 },
      { name: 'Real Estate Fund', ticker: 'REF', assetClass: 'Alternatives', weight: 5.6, value: 163_218, dayGain: null, dayGainPct: null, totalGain: 28_400, totalGainPct: 21.08 },
      { name: 'Cash & Equivalents', ticker: '—', assetClass: 'Cash', weight: 7.2, value: 209_850, dayGain: null, dayGainPct: null, totalGain: 0, totalGainPct: 0 },
    ],
    activity: [
      { id: 'g1', date: '2 Oct 2026', type: 'DIVIDEND', security: 'AGG', amount: 1_824 },
      { id: 'g2', date: '30 Sep 2026', type: 'DIVIDEND', security: 'USIG', amount: 1_342 },
      { id: 'g3', date: '28 Sep 2026', type: 'REBALANCE', amount: 0 },
      { id: 'g4', date: '20 Aug 2026', type: 'BUY', security: 'ART', amount: 75_000 },
      { id: 'g5', date: '15 Aug 2026', type: 'SELL', security: 'VV', amount: 120_000 },
    ],
  },

  '8': {
    managedBy: 'DB Treasury',
    inceptionDate: 'Mar 2023',
    benchmark: 'US T-Bill 3M',
    ytdReturn: 4.8,
    vsBenchmark: 0.2,
    volatility: 0.8,
    sharpeRatio: 2.14,
    performance: genPerf(379_000, 387_420, 386_578, 36, 9.1, 0.004),
    allocation: [
      { label: 'Money Market', pct: 58.2, color: '#7d9cd2' },
      { label: 'Short-term Bonds', pct: 28.4, color: '#3f8cdf' },
      { label: 'Cash', pct: 13.4, color: '#efc378' },
    ],
    holdings: [
      { name: 'US Treasury 3M', ticker: 'BIL', assetClass: 'Fixed Income', weight: 44.8, value: 173_543, dayGain: 17, dayGainPct: 0.01, totalGain: 3_840, totalGainPct: 2.26 },
      { name: 'Money Market Fund', ticker: 'SNSXX', assetClass: 'Fixed Income', weight: 28.4, value: 110_027, dayGain: 11, dayGainPct: 0.01, totalGain: 2_440, totalGainPct: 2.27 },
      { name: 'DB Cash Management', ticker: 'DBF', assetClass: 'Fixed Income', weight: 13.4, value: 51_914, dayGain: 5, dayGainPct: 0.01, totalGain: 1_140, totalGainPct: 2.24 },
      { name: 'Cash & Equivalents', ticker: '—', assetClass: 'Cash', weight: 13.4, value: 51_936, dayGain: null, dayGainPct: null, totalGain: 0, totalGainPct: 0 },
    ],
    activity: [
      { id: 'h1', date: '1 Oct 2026', type: 'DIVIDEND', security: 'BIL', amount: 712 },
      { id: 'h2', date: '1 Sep 2026', type: 'DIVIDEND', security: 'BIL', amount: 698 },
      { id: 'h3', date: '1 Aug 2026', type: 'DIVIDEND', security: 'BIL', amount: 704 },
      { id: 'h4', date: '15 Jul 2026', type: 'DEPOSIT', amount: 50_000 },
    ],
  },

  '9': {
    managedBy: 'Priya Sharma',
    inceptionDate: 'Feb 2022',
    benchmark: 'MSCI World ESG Leaders',
    ytdReturn: 15.1,
    vsBenchmark: 3.4,
    volatility: 10.2,
    sharpeRatio: 1.58,
    performance: genPerf(1_894_050, 2_180_450, 2_098_240, 36, 6.2, 0.019),
    allocation: [
      { label: 'Equities', pct: 62.4, color: '#3f8cdf' },
      { label: 'Fixed Income', pct: 24.1, color: '#7d9cd2' },
      { label: 'Alternatives', pct: 9.8, color: '#a78bfa' },
      { label: 'Cash', pct: 3.7, color: '#efc378' },
    ],
    holdings: [
      { name: 'Microsoft Corp', ticker: 'MSFT', assetClass: 'Equity', weight: 14.2, value: 309_583, dayGain: 4_653, dayGainPct: 1.50, totalGain: 62_400, totalGainPct: 25.24 },
      { name: 'MSCI ESG Leaders ETF', ticker: 'ESGU', assetClass: 'Equity', weight: 18.6, value: 405_563, dayGain: 5_959, dayGainPct: 1.47, totalGain: 52_800, totalGainPct: 14.97 },
      { name: 'Clean Energy ETF', ticker: 'ICLN', assetClass: 'Equity', weight: 12.4, value: 270_375, dayGain: 4_070, dayGainPct: 1.51, totalGain: -18_400, totalGainPct: -6.37 },
      { name: 'Apple Inc', ticker: 'AAPL', assetClass: 'Equity', weight: 10.8, value: 235_488, dayGain: 3_413, dayGainPct: 1.45, totalGain: 48_200, totalGainPct: 25.74 },
      { name: 'Green Bond Fund', ticker: 'BGRN', assetClass: 'Fixed Income', weight: 14.1, value: 307_442, dayGain: 1_842, dayGainPct: 0.60, totalGain: 22_100, totalGainPct: 7.74 },
      { name: 'ESG Corp Bond ETF', ticker: 'SUSC', assetClass: 'Fixed Income', weight: 10.0, value: 218_045, dayGain: 1_308, dayGainPct: 0.60, totalGain: 14_800, totalGainPct: 7.28 },
      { name: 'Sustainable Infra Fund', ticker: 'INFRA', assetClass: 'Alternatives', weight: 9.8, value: 213_684, dayGain: null, dayGainPct: null, totalGain: 32_400, totalGainPct: 17.89 },
      { name: 'Cash & Equivalents', ticker: '—', assetClass: 'Cash', weight: 3.7, value: 80_720, dayGain: null, dayGainPct: null, totalGain: 0, totalGainPct: 0 },
    ],
    activity: [
      { id: 'i1', date: '5 Oct 2026', type: 'BUY', security: 'ESGU', amount: 42_000 },
      { id: 'i2', date: '1 Oct 2026', type: 'DIVIDEND', security: 'BGRN', amount: 1_480 },
      { id: 'i3', date: '22 Sep 2026', type: 'REBALANCE', amount: 0 },
      { id: 'i4', date: '10 Sep 2026', type: 'SELL', security: 'ICLN', amount: 28_000 },
      { id: 'i5', date: '1 Sep 2026', type: 'DEPOSIT', amount: 100_000 },
    ],
  },

  '10': {
    managedBy: 'Michael Torres',
    inceptionDate: 'Sep 2019',
    benchmark: 'Bloomberg US Aggregate',
    ytdReturn: 3.8,
    vsBenchmark: 0.8,
    volatility: 4.1,
    sharpeRatio: 1.22,
    performance: genPerf(3_103_090, 3_245_890, 3_219_751, 36, 7.4, 0.009),
    allocation: [
      { label: 'Treasuries', pct: 44.8, color: '#3f8cdf' },
      { label: 'Corp Bonds', pct: 34.6, color: '#7d9cd2' },
      { label: 'EM Bonds', pct: 12.8, color: '#a78bfa' },
      { label: 'Cash', pct: 7.8, color: '#efc378' },
    ],
    holdings: [
      { name: 'US Treasury 10Y', ticker: 'TLT', assetClass: 'Fixed Income', weight: 24.5, value: 795_243, dayGain: 2_146, dayGainPct: 0.27, totalGain: 28_400, totalGainPct: 3.70 },
      { name: 'Investment Grade Corp', ticker: 'LQD', assetClass: 'Fixed Income', weight: 20.2, value: 655_670, dayGain: 1_770, dayGainPct: 0.27, totalGain: 22_100, totalGainPct: 3.49 },
      { name: 'US Treasury 5Y', ticker: 'IEF', assetClass: 'Fixed Income', weight: 20.3, value: 659_115, dayGain: 1_779, dayGainPct: 0.27, totalGain: 18_900, totalGainPct: 2.95 },
      { name: 'High Yield Corp Bond', ticker: 'HYG', assetClass: 'Fixed Income', weight: 14.4, value: 467_407, dayGain: 1_262, dayGainPct: 0.27, totalGain: 31_200, totalGainPct: 7.15 },
      { name: 'EM Sovereign Bond', ticker: 'EMB', assetClass: 'Fixed Income', weight: 12.8, value: 415_473, dayGain: 1_122, dayGainPct: 0.27, totalGain: 20_800, totalGainPct: 5.27 },
      { name: 'Cash & Equivalents', ticker: '—', assetClass: 'Cash', weight: 7.8, value: 252_982, dayGain: null, dayGainPct: null, totalGain: 0, totalGainPct: 0 },
    ],
    activity: [
      { id: 'j1', date: '1 Oct 2026', type: 'DIVIDEND', security: 'LQD', amount: 8_420 },
      { id: 'j2', date: '1 Oct 2026', type: 'DIVIDEND', security: 'TLT', amount: 6_840 },
      { id: 'j3', date: '15 Sep 2026', type: 'DIVIDEND', security: 'HYG', amount: 5_120 },
      { id: 'j4', date: '28 Aug 2026', type: 'BUY', security: 'EMB', amount: 80_000 },
      { id: 'j5', date: '1 Aug 2026', type: 'DIVIDEND', security: 'LQD', amount: 8_280 },
      { id: 'j6', date: '15 Jul 2026', type: 'DEPOSIT', amount: 300_000 },
    ],
  },

  '11': {
    managedBy: 'David Lim',
    inceptionDate: 'Oct 2021',
    benchmark: 'MSCI Asia Pacific',
    ytdReturn: -6.2,
    vsBenchmark: -1.8,
    volatility: 22.4,
    sharpeRatio: -0.34,
    performance: genPerf(1_926_800, 1_842_600, 1_966_246, 36, 8.1, 0.032),
    allocation: [
      { label: 'Equities', pct: 88.6, color: '#3f8cdf' },
      { label: 'Cash', pct: 11.4, color: '#efc378' },
    ],
    holdings: [
      { name: 'Asia Pacific ETF', ticker: 'AAXJ', assetClass: 'Equity', weight: 24.8, value: 456_964, dayGain: -4_570, dayGainPct: -1.00, totalGain: -48_200, totalGainPct: -9.54 },
      { name: 'Alibaba Group', ticker: 'BABA', assetClass: 'Equity', weight: 14.2, value: 261_649, dayGain: -2_616, dayGainPct: -1.00, totalGain: -82_400, totalGainPct: -23.95 },
      { name: 'Taiwan Semiconductor', ticker: 'TSM', assetClass: 'Equity', weight: 16.8, value: 309_557, dayGain: -3_096, dayGainPct: -1.00, totalGain: 48_200, totalGainPct: 18.43 },
      { name: 'Samsung Electronics', ticker: 'SSUN', assetClass: 'Equity', weight: 12.4, value: 228_482, dayGain: -2_285, dayGainPct: -1.00, totalGain: -22_100, totalGainPct: -8.82 },
      { name: 'Japan ETF', ticker: 'EWJ', assetClass: 'Equity', weight: 13.2, value: 243_223, dayGain: -2_432, dayGainPct: -1.00, totalGain: 18_400, totalGainPct: 8.18 },
      { name: 'India ETF', ticker: 'INDA', assetClass: 'Equity', weight: 7.2, value: 132_667, dayGain: -1_327, dayGainPct: -1.00, totalGain: 12_900, totalGainPct: 10.77 },
      { name: 'Cash & Equivalents', ticker: '—', assetClass: 'Cash', weight: 11.4, value: 210_058, dayGain: null, dayGainPct: null, totalGain: 0, totalGainPct: 0 },
    ],
    activity: [
      { id: 'k1', date: '4 Oct 2026', type: 'SELL', security: 'BABA', amount: 48_000 },
      { id: 'k2', date: '1 Oct 2026', type: 'BUY', security: 'TSM', amount: 62_000 },
      { id: 'k3', date: '25 Sep 2026', type: 'BUY', security: 'INDA', amount: 35_000 },
      { id: 'k4', date: '10 Sep 2026', type: 'SELL', security: 'SSUN', amount: 55_000 },
      { id: 'k5', date: '1 Sep 2026', type: 'DEPOSIT', amount: 200_000 },
    ],
  },

  '12': {
    managedBy: 'DB Alternative Investments',
    inceptionDate: 'Jul 2019',
    benchmark: 'HFRI Fund Weighted Composite',
    ytdReturn: 18.4,
    vsBenchmark: null,
    volatility: null,
    sharpeRatio: null,
    performance: genPerf(3_300_000, 4_580_000, 4_224_000, 36, 3.3, 0.024),
    allocation: [
      { label: 'Global Macro', pct: 38.4, color: '#3f8cdf' },
      { label: 'Long/Short Equity', pct: 31.2, color: '#7d9cd2' },
      { label: 'Event Driven', pct: 18.6, color: '#a78bfa' },
      { label: 'Cash & Reserves', pct: 11.8, color: '#efc378' },
    ],
    holdings: [
      { name: 'Citadel Wellington Class A', ticker: 'CWLA', assetClass: 'Alternatives', weight: 24.2, value: 1_108_360, dayGain: null, dayGainPct: null, totalGain: 382_400, totalGainPct: 52.69 },
      { name: 'Bridgewater Pure Alpha', ticker: 'BWPA', assetClass: 'Alternatives', weight: 14.2, value: 650_360, dayGain: null, dayGainPct: null, totalGain: 148_200, totalGainPct: 29.51 },
      { name: 'Point72 L/S Equity', ticker: 'PT72', assetClass: 'Alternatives', weight: 18.6, value: 852_480, dayGain: null, dayGainPct: null, totalGain: 284_800, totalGainPct: 50.21 },
      { name: 'Elliott Event Driven', ticker: 'ELED', assetClass: 'Alternatives', weight: 13.2, value: 604_560, dayGain: null, dayGainPct: null, totalGain: 204_600, totalGainPct: 51.24 },
      { name: 'DB Macro Opportunities', ticker: 'DBMO', assetClass: 'Alternatives', weight: 18.0, value: 824_400, dayGain: null, dayGainPct: null, totalGain: 260_000, totalGainPct: 46.01 },
      { name: 'Cash & Reserves', ticker: '—', assetClass: 'Cash', weight: 11.8, value: 540_440, dayGain: null, dayGainPct: null, totalGain: 0, totalGainPct: 0 },
    ],
    activity: [
      { id: 'l1', date: '30 Sep 2026', type: 'DIVIDEND', security: 'CWLA', amount: 248_000 },
      { id: 'l2', date: '30 Jun 2026', type: 'DIVIDEND', security: 'CWLA', amount: 234_000 },
      { id: 'l3', date: '31 Mar 2026', type: 'DIVIDEND', security: 'PT72', amount: 185_000 },
      { id: 'l4', date: '15 Jan 2026', type: 'BUY', security: 'DBMO', amount: 500_000 },
      { id: 'l5', date: '30 Sep 2025', type: 'DIVIDEND', security: 'BWPA', amount: 112_000 },
    ],
  },

  '13': {
    managedBy: 'James Whitfield',
    inceptionDate: 'Jan 2015',
    benchmark: 'CPI + 5%',
    ytdReturn: 6.4,
    vsBenchmark: 1.2,
    volatility: 6.8,
    sharpeRatio: 1.44,
    performance: genPerf(844_450, 892_450, 879_018, 36, 2.2, 0.012),
    allocation: [
      { label: 'Fixed Income', pct: 48.2, color: '#7d9cd2' },
      { label: 'Equities', pct: 32.4, color: '#3f8cdf' },
      { label: 'Alternatives', pct: 12.6, color: '#a78bfa' },
      { label: 'Cash', pct: 6.8, color: '#efc378' },
    ],
    holdings: [
      { name: 'US Treasury Inflation', ticker: 'TIPS', assetClass: 'Fixed Income', weight: 22.4, value: 199_909, dayGain: 940, dayGainPct: 0.47, totalGain: 8_200, totalGainPct: 4.28 },
      { name: 'Dividend Equity ETF', ticker: 'VIG', assetClass: 'Equity', weight: 18.6, value: 165_995, dayGain: 780, dayGainPct: 0.47, totalGain: 12_400, totalGainPct: 8.07 },
      { name: 'Aggregate Bond ETF', ticker: 'AGG', assetClass: 'Fixed Income', weight: 14.2, value: 126_728, dayGain: 596, dayGainPct: 0.47, totalGain: 5_800, totalGainPct: 4.80 },
      { name: 'Low Volatility Equity', ticker: 'USMV', assetClass: 'Equity', weight: 13.8, value: 123_158, dayGain: 579, dayGainPct: 0.47, totalGain: 14_100, totalGainPct: 12.93 },
      { name: 'Real Assets Fund', ticker: 'PDBC', assetClass: 'Alternatives', weight: 12.6, value: 112_449, dayGain: null, dayGainPct: null, totalGain: 7_600, totalGainPct: 7.25 },
      { name: 'Corp Bond Ladder', ticker: 'BSCM', assetClass: 'Fixed Income', weight: 11.6, value: 103_524, dayGain: 487, dayGainPct: 0.47, totalGain: 3_200, totalGainPct: 3.19 },
      { name: 'Cash & Equivalents', ticker: '—', assetClass: 'Cash', weight: 6.8, value: 60_687, dayGain: null, dayGainPct: null, totalGain: 0, totalGainPct: 0 },
    ],
    activity: [
      { id: 'm1', date: '1 Oct 2026', type: 'DIVIDEND', security: 'VIG', amount: 1_820 },
      { id: 'm2', date: '1 Oct 2026', type: 'DIVIDEND', security: 'AGG', amount: 980 },
      { id: 'm3', date: '15 Sep 2026', type: 'DIVIDEND', security: 'TIPS', amount: 1_240 },
      { id: 'm4', date: '28 Aug 2026', type: 'REBALANCE', amount: 0 },
      { id: 'm5', date: '1 Aug 2026', type: 'DIVIDEND', security: 'VIG', amount: 1_780 },
    ],
  },
};
