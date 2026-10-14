# Portfolio Detail Page — Design Decision Report

**Feature:** Portfolio drill-down view triggered by clicking a portfolio row  
**Date:** October 2026  
**Status:** Implemented, zero TypeScript errors, zero runtime errors

---

## 1. Navigation Pattern

**Decision: State-based SPA transition, no routing change**

When a user clicks a portfolio row, `PortfoliosTab` sets a `selectedId` state variable. If a portfolio is selected, it renders `PortfolioDetail` in place of the table. Clicking "← Portfolios" clears the state and the table reappears.

**Why:** The app is a single-page dashboard, not a multi-page app. Introducing URL routing (e.g., `/portfolios/[id]`) would require:
- Migrating to Next.js dynamic routes
- Handling deep-linking, refresh, and browser history
- Preserving filter/sort state across navigation

For a prototype, the cost-to-value ratio is wrong. State swap is instant, reversible, and requires no additional infrastructure.

**Tradeoff accepted:** Deep-linking to a specific portfolio is not possible (no shareable URL). In production, this would be worth addressing with shallow routing (`router.push('?pid=1', { scroll: false })`), keeping the path stable while encoding state in the query string.

---

## 2. Information Architecture

**Decision: What to show on the detail page**

The page follows a "funnel" hierarchy — highest-signal information at the top, granular data below:

```
Portfolio identity (name, type, risk, manager, benchmark, inception)
  → Hero metrics (current value, day gain, total gain)
    → Performance chart (visual trend + period picker)
      → KPI cards (YTD, α vs benchmark, σ volatility, Sharpe ratio)
        → Asset allocation (donut + breakdown bars)
        → Recent activity (timeline)
          → Holdings table (full breakdown)
```

**Rationale for each section:**

| Section | Fintech product rationale |
|---|---|
| Hero metrics | Users orient by value first; "how much do I have?" before "how is it doing?" |
| Performance chart | Time-series context is essential — a +12% total gain means nothing without knowing if it happened last month or over 5 years |
| Period picker (3M → 3Y) | Different user jobs: traders watch 3M, long-term investors check 3Y; both need to use the same screen |
| KPI cards | Institutional shorthand. Sharpe > 1 is good. α vs benchmark tells whether the manager adds value. Volatility sets risk expectations |
| Allocation donut | Composition is the "why" behind performance. Equity-heavy explains high gains AND high volatility simultaneously |
| Activity timeline | Provides operational context. A recent REBALANCE explains today's allocation. A large DEPOSIT explains why value jumped |
| Holdings table | The deepest level. Allows power users to see what's actually inside the portfolio |

**What was deliberately left out:**
- Drawdown history chart (prototype scope; would add in v2 as a risk tab)
- Transaction cost analysis (requires trade execution data)
- ESG scores (requires a data feed integration)
- Tax lot breakdown (requires cost-basis accounting data)

---

## 3. Performance Chart Design

**Decision: ComposedChart (Area + dashed Line) vs dual AreaChart**

Used recharts `ComposedChart` with:
- `Area` for portfolio (solid navy fill with gradient fade)
- `Line` for benchmark (1.5px grey dashed)

**Why this over alternatives:**
- **Visual hierarchy:** The filled area draws the eye to the portfolio; the benchmark is deliberately subordinate — it's a reference, not the main story
- **Colour psychology:** DB navy (#00205b) for portfolio builds brand trust. Grey dashed is neutral, implying "comparison"
- **Alternative considered:** Two overlapping Area charts. Rejected because overlapping fills create colour-mixing artifacts and the benchmark fill would compete for attention

**Gradient fill:** The gradient (12% opacity at top → 0% at bottom) adds depth and makes the chart feel premium without being distracting. This is the standard Robinhood/Fidelity pattern.

**Animation disabled (`isAnimationActive={false}`):** recharts animations cause a visible flash on every period switch since each switch remounts chart data. Static rendering is snappier and more professional for a dashboard context.

**Y-axis formatting:** `$14M`, `$3.5M` — compact notation rather than full numbers which would overflow. The tooltip shows full precision on hover.

**Period options: 3M, 6M, YTD, 1Y, 3Y**  
Omitted 1M because monthly data has only 2 data points in our data model, which renders as a featureless line segment with no information value. In a production system with daily price data, 1M would be the most-watched period.

---

## 4. KPI Card Design

**Decision: 4 metrics, plain number, colour-coded**

| Metric | Colour rule |
|---|---|
| YTD Return | Green if positive, red if negative |
| vs Benchmark | Green if outperforming (α > 0), red if underperforming |
| Volatility | Always primary text colour — volatility is not inherently good or bad; it's contextual |
| Sharpe Ratio | Green if ≥ 1 (good risk-adjusted return), amber if 0–1, red if negative |

**Why Sharpe coloured at 1.0:** A Sharpe ratio of 1.0 is widely used as the threshold for "acceptable" risk-adjusted return. This is standard portfolio management practice.

**"N/A" for illiquid portfolios:** Private equity (Portfolio 6) doesn't have daily pricing, so volatility, Sharpe, and benchmark comparison are undefined. Displaying "N/A" rather than zero is deliberately honest — zero would imply zero risk, which is misleading.

---

## 5. Asset Allocation — Donut vs Bar Chart

**Decision: Donut chart (recharts PieChart) with horizontal bar breakdown alongside**

**Why donut over bar chart:**  
- Part-to-whole relationships read better on a donut than a bar chart — the eye naturally perceives the "slice" as a fraction of the whole
- Donut (vs filled pie) leaves space for a potential center label in v2 (e.g., total value)

**Why the breakdown bars alongside:**  
- The donut is hard to read precisely for small slices (e.g., 3.9% Cash vs 7.2% Alternatives)
- The horizontal percentage bars give exact values with visual proportionality
- The colour dot on each row ties back to the donut unambiguously

**Alternative considered:** Stacked horizontal bar chart for the entire allocation. Rejected because it reads well on desktop but breaks on narrow screens.

---

## 6. Activity Timeline Design

**Decision: Vertical timeline with colour-coded event dots**

Event types and their colours:
| Type | Colour | Semantic reason |
|---|---|---|
| BUY | Green | Positive action, adding exposure |
| SELL | Red | Reducing exposure, potentially a loss trigger |
| DIVIDEND | Blue | Income event, informationally neutral |
| REBALANCE | Amber | Warning-level event — marks a significant structural change |
| DEPOSIT | Green | Positive action, growing the portfolio |

**Amount display:** Deposits and dividends show `+$xxx,xxx`. Sells show `−$xxx,xxx`. Rebalances show no amount (it's a structural event, not a cash flow event).

**Tradeoff:** Timeline shows most recent 4-6 events only. For a full transaction ledger, a dedicated "Transactions" tab (already planned in the tab bar) would be the right place.

---

## 7. Holdings Table Design

**Decision: Mirror the main portfolio table style**

The holdings table uses identical column padding, font sizes, and hover states as the main `PortfolioTable`. This creates visual consistency — users who understand the main table immediately understand the holdings table.

**Asset class colour badges:** Each holding's asset class gets a small coloured badge (same colours as the donut chart). This allows users to visually scan and spot concentration quickly.

**"Top Holdings" label (not "All Holdings"):** For multi-holding portfolios, the data model shows the major positions. Labelling it "Top Holdings" is more honest than "All Holdings" since smaller positions may not be represented.

---

## 8. SSR / Hydration Safety

**Decision: `mounted` state guard for recharts components**

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
```

Both `ResponsiveContainer` (area chart) and `PieChart` (donut) use DOM measurement APIs that don't exist during server-side rendering. Without this guard, Next.js would throw a hydration mismatch error.

The fallback renders a `bg-[#f8f9fb] animate-pulse` placeholder that is visually coherent and prevents layout shift.

**Alternative considered:** `dynamic(() => import('./PortfolioDetail'), { ssr: false })`. Rejected because it would delay the entire component, not just the charts, causing a blank-then-flash experience.

---

## 9. Data Model Design

**Decision: `portfolioDetails` as a static Record in `lib/detail-data.ts`**

All 8 portfolio detail objects are pre-defined at build time. Performance data is generated deterministically using a seeded sinusoidal noise function.

**Why static over computed:**
- This is a prototype; no API exists
- Static data is instantly available, no loading states needed
- The `genPerf` function produces visually plausible data (smooth trend + realistic oscillations) from just 4 parameters: start value, end value, benchmark end value, and a seed

**Performance data accuracy:** The charts show portfolio dollar value vs a hypothetical benchmark initialized at the same starting value. This is the "dollar-indexed" benchmark comparison standard in wealth management — it answers "where would my money be today if it had tracked the benchmark instead?"

**Limitation to acknowledge in production:** Performance history would come from a portfolio management system API. The chart would show actual historical NAV, not a generated approximation.

---

## 10. Tests Run

| Test | Result |
|---|---|
| TypeScript compile (`tsc --noEmit`) | ✅ Zero errors |
| Browser console errors | ✅ Zero errors |
| Click portfolio row → detail view | ✅ Works |
| Back button → portfolio table | ✅ Works |
| Period picker (3M, 6M, YTD, 1Y, 3Y) | ✅ Chart updates |
| Illiquid portfolio (Private Markets) | ✅ "Illiquid", "N/A" render correctly |
| Conservative portfolio (Retirement – Primary) | ✅ Fixed income allocation shows correctly |
| Chart tooltip on hover | ✅ Shows portfolio + benchmark values |
| Holdings table scroll | ✅ Scrolls within detail page |
| Filters preserved on back navigation | ✅ State is preserved (filters applied before click remain after back) |

---

## Summary

The portfolio detail page was designed around three principles:

1. **Information hierarchy:** Most important facts (value, gain) are instantly visible above the fold. Detail (holdings, allocation) requires intentional scrolling.

2. **Visual premium:** Navy gradient chart, clean typography, colour-coded semantic indicators — matching the benchmark set by Robinhood, Fidelity, and modern wealth management tools.

3. **Honesty under uncertainty:** Illiquid assets show "Illiquid" and "N/A" rather than fabricating daily marks. "Top Holdings" rather than "All Holdings". These small word choices prevent misleading the user with false precision.
