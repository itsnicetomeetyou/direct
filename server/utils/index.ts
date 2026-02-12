/**
 * Formats a number as a currency string.
 *
 * @param {number} amount - The amount to format.
 * @param {string} [currency='USD'] - The currency code (e.g., 'USD', 'EUR').
 * @param {string} [locale='en-US'] - The locale code (e.g., 'en-US', 'de-DE').
 * @returns {string} The formatted currency string.
 */
export function formatCurrency(
  amount: number,
  currency: string = 'PHP',
  locale: string = 'en-PH',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
