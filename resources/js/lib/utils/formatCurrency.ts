const currencyFormatter = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}
