export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatGain(amount: number, pct: number): string {
  const sign = amount >= 0 ? '+' : '−';
  const absAmount = Math.abs(amount);
  const absPct = Math.abs(pct);
  return `${sign}${formatNumber(absAmount)} (${sign}${absPct.toFixed(2)}%)`;
}

export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
