export function cn(...classes: (string | undefined | null | boolean | Record<string, boolean>)[]) {
  const result: string[] = [];
  classes.forEach(c => {
    if (!c) return;
    if (typeof c === 'string') {
      result.push(c);
    } else if (typeof c === 'object') {
      Object.entries(c).forEach(([key, val]) => {
        if (val) result.push(key);
      });
    }
  });
  return result.join(' ');
}

export function truncateURN(urn: string | undefined | null): string {
  if (!urn) return '';
  if (urn.length <= 16) return urn;
  return urn.substring(0, 16) + '...';
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount);
}
