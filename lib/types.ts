export type RiskLevel =
  | 'Conservative'
  | 'Moderate'
  | 'Aggressive'
  | 'Speculative'
  | 'Moderately aggressive';

export type PortfolioType = 'Advisory' | 'Execution' | 'Retirement' | 'Other';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CHF';

export interface Portfolio {
  id: string;
  name: string;
  type: PortfolioType;
  value: number;
  currency: Currency;
  dayGain: number | null;
  dayGainPct: number | null;
  totalGain: number;
  totalGainPct: number;
  risk: RiskLevel | null;
}

export type DayGainFilter =
  | 'gainers'
  | 'losers'
  | 'flat'
  | 'up-gt-1pct'
  | 'down-lt-1pct'
  | 'custom'
  | null;

export type ValueFilter = 'over-1m' | 'over-5m' | 'over-10m' | null;
export type TotalGainFilter = 'positive' | 'negative' | null;

export interface FilterState {
  type: PortfolioType[];
  risk: RiskLevel[];
  currency: Currency[];
  value: ValueFilter;
  dayGain: DayGainFilter;
  dayGainMin: string;
  dayGainMax: string;
  totalGain: TotalGainFilter;
}

export type Tab =
  | 'portfolios'
  | 'cio-insights'
  | 'watchlist'
  | 'holdings'
  | 'liabilities'
  | 'transactions';
