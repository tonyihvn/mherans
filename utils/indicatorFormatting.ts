

/**
 * Indicator Formatting Utilities
 * Formats indicator names from various formats to readable sentence case
 */

/**
 * Convert indicator name to sentence case
 * Handles: camelCase, snake_case, kebab-case
 * Examples:
 *   uptime_percentage → Uptime Percentage
 *   energyResilienceScore → Energy Resilience Score
 *   grid-uptime → Grid Uptime
 */
export function formatIndicatorName(name: string): string {
  // Handle snake_case
  let formatted = name.replace(/_/g, ' ');

  // Handle kebab-case
  formatted = formatted.replace(/-/g, ' ');

  // Handle camelCase - insert space before capital letters
  formatted = formatted.replace(/([a-z])([A-Z])/g, '$1 $2');

  // Convert to sentence case (first letter capital, rest lowercase)
  formatted = formatted
    .split(' ')
    .map(word => {
      // Handle words like 'kW', 'kWh', 'tCO2e', etc.
      if (/^[a-z]{1,2}[A-Z]/.test(word)) {
        return word; // Keep technical abbreviations as-is
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');

  // Clean up extra spaces
  formatted = formatted.replace(/\s+/g, ' ').trim();

  return formatted;
}

/**
 * Common indicator display names mapping
 * For special cases that don't follow standard formatting
 */
const INDICATOR_DISPLAY_NAMES: Record<string, string> = {
  'uptime_percentage': 'Grid Uptime %',
  'gridUptimePercentage': 'Grid Uptime %',
  'gridUptimeHoursPerDay': 'Grid Uptime (hours/day)',
  'energyResilienceScore': 'Energy Resilience',
  'totalElectricalLoadKW': 'Total Electrical Load (kW)',
  'estimatedDailyConsumptionKWh': 'Daily Consumption (kWh)',
  'estimatedAnnualGridConsumptionKWh': 'Annual Grid Consumption (kWh)',
  'solarGenerationAnnualKWh': 'Annual Solar Generation (kWh)',
  'dieselDailyConsumptionLitres': 'Daily Diesel Consumption (litres)',
  'dieselAnnualEmissionsTonnesCO2': 'Diesel Emissions (tCO₂e)',
  'gridAnnualEmissionsTonnesCO2': 'Grid Emissions (tCO₂e)',
  'wasteIncinerationAnnualEmissionsTonnesCO2': 'Waste Incineration Emissions (tCO₂e)',
  'totalAnnualGHGEmissionsTonnesCO2': 'Total GHG Emissions (tCO₂e)',
  'dieselDisplacementPercentage': 'Diesel Displacement %',
  'renewableEnergyPercentage': 'Renewable Energy %',
  'omReadinessScore': 'O&M Readiness Score %',
  'wasteManagementScore': 'Waste Management Score %',
};

/**
 * Get display name for an indicator
 * Uses special mappings if available, otherwise formats the name
 */
export function getIndicatorDisplayName(indicatorName: string): string {
  return INDICATOR_DISPLAY_NAMES[indicatorName] || formatIndicatorName(indicatorName);
}

/**
 * Default Font Awesome free icons grouped by category
 */
export const FONT_AWESOME_ICONS = {
  Energy: [
    { label: 'Bolt', value: 'fa-bolt' },
    { label: 'Plug', value: 'fa-plug' },
    { label: 'Lightbulb', value: 'fa-lightbulb' },
    { label: 'Sun', value: 'fa-sun' },
    { label: 'Wind', value: 'fa-wind' },
    { label: 'Battery', value: 'fa-battery-full' },
  ],
  Emissions: [
    { label: 'Smog', value: 'fa-smog' },
    { label: 'Leaf', value: 'fa-leaf' },
    { label: 'Tree', value: 'fa-tree' },
    { label: 'Globe', value: 'fa-globe' },
    { label: 'Droplet', value: 'fa-droplet' },
  ],
  Operations: [
    { label: 'Wrench', value: 'fa-wrench' },
    { label: 'Tools', value: 'fa-tools' },
    { label: 'Gears', value: 'fa-gears' },
    { label: 'Hammer', value: 'fa-hammer' },
    { label: 'Screwdriver', value: 'fa-screwdriver' },
  ],
  Health: [
    { label: 'Hospital', value: 'fa-hospital' },
    { label: 'Heartbeat', value: 'fa-heart' },
    { label: 'Capsules', value: 'fa-capsules' },
    { label: 'Stethoscope', value: 'fa-stethoscope' },
    { label: 'Syringe', value: 'fa-syringe' },
  ],
  Analytics: [
    { label: 'Chart Line', value: 'fa-chart-line' },
    { label: 'Chart Bar', value: 'fa-chart-bar' },
    { label: 'Chart Pie', value: 'fa-chart-pie' },
    { label: 'Gauge', value: 'fa-gauge' },
    { label: 'Trending Up', value: 'fa-arrow-trend-up' },
  ],
  Status: [
    { label: 'Check Circle', value: 'fa-check-circle' },
    { label: 'Alert', value: 'fa-triangle-exclamation' },
    { label: 'Circle', value: 'fa-circle' },
    { label: 'Ban', value: 'fa-ban' },
    { label: 'Question', value: 'fa-circle-question' },
  ],
  Other: [
    { label: 'Star', value: 'fa-star' },
    { label: 'Target', value: 'fa-target' },
    { label: 'Rocket', value: 'fa-rocket' },
    { label: 'Clipboard', value: 'fa-clipboard' },
    { label: 'Database', value: 'fa-database' },
  ],
};
