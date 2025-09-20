// Formatting utilities

export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
