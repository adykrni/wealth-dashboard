import {
  Portfolio,
  FilterState,
  PortfolioType,
  RiskLevel,
  Currency,
} from './types';

export const INITIAL_FILTERS: FilterState = {
  type: [],
  risk: [],
  currency: [],
  value: null,
  dayGain: null,
  dayGainMin: '',
  dayGainMax: '',
  totalGain: null,
};

export function applyFilters(
  portfolios: Portfolio[],
  search: string,
  filters: FilterState
): Portfolio[] {
  return portfolios.filter((p) => {
    if (search.trim()) {
      if (!p.name.toLowerCase().includes(search.trim().toLowerCase()))
        return false;
    }

    if (filters.type.length > 0 && !filters.type.includes(p.type))
      return false;

    if (filters.risk.length > 0) {
      if (!p.risk || !filters.risk.includes(p.risk)) return false;
    }

    if (filters.currency.length > 0 && !filters.currency.includes(p.currency))
      return false;

    if (filters.value) {
      const thresholds: Record<string, number> = {
        'over-1m': 1_000_000,
        'over-5m': 5_000_000,
        'over-10m': 10_000_000,
      };
      if (p.value < thresholds[filters.value]) return false;
    }

    if (filters.dayGain) {
      if (p.dayGainPct === null) return false;
      switch (filters.dayGain) {
        case 'gainers':
          if (p.dayGainPct <= 0) return false;
          break;
        case 'losers':
          if (p.dayGainPct >= 0) return false;
          break;
        case 'flat':
          if (Math.abs(p.dayGainPct) > 0.05) return false;
          break;
        case 'up-gt-1pct':
          if (p.dayGainPct <= 1) return false;
          break;
        case 'down-lt-1pct':
          if (p.dayGainPct >= -1) return false;
          break;
        case 'custom': {
          const min =
            filters.dayGainMin !== '' ? parseFloat(filters.dayGainMin) : -Infinity;
          const max =
            filters.dayGainMax !== '' ? parseFloat(filters.dayGainMax) : Infinity;
          if (p.dayGainPct < min || p.dayGainPct > max) return false;
          break;
        }
      }
    }

    if (filters.totalGain) {
      if (filters.totalGain === 'positive' && p.totalGain <= 0) return false;
      if (filters.totalGain === 'negative' && p.totalGain >= 0) return false;
    }

    return true;
  });
}

// Facet counts: exclude the category being counted (standard faceted search)
export function getFacetCounts(
  portfolios: Portfolio[],
  search: string,
  filters: FilterState,
  category: keyof FilterState
): Record<string, number> {
  const without = { ...filters } as FilterState;
  if (category === 'type') without.type = [];
  else if (category === 'risk') without.risk = [];
  else if (category === 'currency') without.currency = [];
  else if (category === 'value') without.value = null;
  else if (category === 'dayGain') { without.dayGain = null; without.dayGainMin = ''; without.dayGainMax = ''; }
  else if (category === 'totalGain') without.totalGain = null;

  const base = applyFilters(portfolios, search, without);
  const counts: Record<string, number> = {};

  if (category === 'type') {
    const types: PortfolioType[] = ['Advisory', 'Execution', 'Retirement', 'Other'];
    for (const t of types) counts[t] = base.filter((p) => p.type === t).length;
  } else if (category === 'risk') {
    const risks: RiskLevel[] = ['Conservative', 'Moderate', 'Aggressive', 'Speculative'];
    for (const r of risks) counts[r] = base.filter((p) => p.risk === r).length;
  } else if (category === 'currency') {
    const currencies: Currency[] = ['USD', 'EUR', 'GBP', 'CHF'];
    for (const c of currencies) counts[c] = base.filter((p) => p.currency === c).length;
  } else if (category === 'value') {
    counts['over-1m'] = base.filter((p) => p.value > 1_000_000).length;
    counts['over-5m'] = base.filter((p) => p.value > 5_000_000).length;
    counts['over-10m'] = base.filter((p) => p.value > 10_000_000).length;
  } else if (category === 'dayGain') {
    counts['gainers'] = base.filter((p) => p.dayGainPct !== null && p.dayGainPct > 0).length;
    counts['losers'] = base.filter((p) => p.dayGainPct !== null && p.dayGainPct < 0).length;
    counts['flat'] = base.filter((p) => p.dayGainPct !== null && Math.abs(p.dayGainPct) <= 0.05).length;
    counts['up-gt-1pct'] = base.filter((p) => p.dayGainPct !== null && p.dayGainPct > 1).length;
    counts['down-lt-1pct'] = base.filter((p) => p.dayGainPct !== null && p.dayGainPct < -1).length;
  } else if (category === 'totalGain') {
    counts['positive'] = base.filter((p) => p.totalGain > 0).length;
    counts['negative'] = base.filter((p) => p.totalGain < 0).length;
  }

  return counts;
}

export function countActiveFilters(filters: FilterState): number {
  let n = 0;
  if (filters.type.length > 0) n++;
  if (filters.risk.length > 0) n++;
  if (filters.currency.length > 0) n++;
  if (filters.value) n++;
  if (filters.dayGain) n++;
  if (filters.totalGain) n++;
  return n;
}

export interface FilterClause {
  key: string;
  label: string;
  values: string[];
}

export function getFilterClauses(
  filters: FilterState,
  search: string
): FilterClause[] {
  const clauses: FilterClause[] = [];

  if (search.trim()) {
    clauses.push({ key: 'search', label: 'Search', values: [search.trim()] });
  }
  if (filters.type.length > 0) {
    clauses.push({ key: 'type', label: 'Type is', values: [...filters.type] });
  }
  if (filters.risk.length > 0) {
    clauses.push({ key: 'risk', label: 'Risk is', values: [...filters.risk] });
  }
  if (filters.currency.length > 0) {
    clauses.push({ key: 'currency', label: 'Currency is', values: [...filters.currency] });
  }
  if (filters.value) {
    const labels: Record<string, string> = {
      'over-1m': 'Over $1M',
      'over-5m': 'Over $5M',
      'over-10m': 'Over $10M',
    };
    clauses.push({ key: 'value', label: 'Value is', values: [labels[filters.value]] });
  }
  if (filters.dayGain) {
    const labels: Record<string, string> = {
      gainers: 'Gainers today',
      losers: 'Losers today',
      flat: 'Flat (±0.05%)',
      'up-gt-1pct': 'Up > +1%',
      'down-lt-1pct': 'Down < −1%',
      custom: `${filters.dayGainMin || ''}% – ${filters.dayGainMax || ''}%`,
    };
    clauses.push({ key: 'dayGain', label: 'Day gain is', values: [labels[filters.dayGain]] });
  }
  if (filters.totalGain) {
    const labels: Record<string, string> = { positive: 'Positive', negative: 'Negative' };
    clauses.push({ key: 'totalGain', label: 'Total gain is', values: [labels[filters.totalGain]] });
  }

  return clauses;
}
