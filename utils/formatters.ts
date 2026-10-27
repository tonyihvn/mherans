/**
 * Formatting utilities for display
 */

/**
 * Convert snake_case to Sentence case
 * @param text - Text in snake_case format (e.g., "uptime_percentage")
 * @returns Sentence case text (e.g., "Uptime Percentage")
 */
export function snakeCaseToSentenceCase(text: string): string {
  return text
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format a number to fixed decimal places
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted number string or 'N/A' if value is null/undefined
 */
export function formatNumber(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined) return 'N/A';
  return value.toFixed(decimals);
}

/**
 * Format a number as percentage
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Capitalize first letter of each word
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export function capitalizeWords(text: string): string {
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
