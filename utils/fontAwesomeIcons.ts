/**
 * Font Awesome Icons for Indicators
 * A curated list of Font Awesome 6 free icons suitable for indicators
 */

export const FONT_AWESOME_FREE_ICONS = [
  // Energy & Power
  { value: 'fa-bolt', label: '⚡ Bolt', category: 'Energy' },
  { value: 'fa-plug', label: '🔌 Plug', category: 'Energy' },
  { value: 'fa-sun', label: '☀️ Sun', category: 'Energy' },
  { value: 'fa-wind', label: '💨 Wind', category: 'Energy' },
  { value: 'fa-droplet', label: '💧 Droplet', category: 'Energy' },

  // Charts & Analytics
  { value: 'fa-chart-line', label: '📈 Chart Line', category: 'Analytics' },
  { value: 'fa-chart-bar', label: '📊 Chart Bar', category: 'Analytics' },
  { value: 'fa-chart-pie', label: '🥧 Chart Pie', category: 'Analytics' },
  { value: 'fa-gauge', label: '⚙️ Gauge', category: 'Analytics' },
  { value: 'fa-trending-up', label: '📉 Trending Up', category: 'Analytics' },

  // Facilities & Infrastructure
  { value: 'fa-building', label: '🏢 Building', category: 'Facility' },
  { value: 'fa-hospital', label: '🏥 Hospital', category: 'Facility' },
  { value: 'fa-water', label: '💧 Water', category: 'Facility' },
  { value: 'fa-pipes', label: '🔧 Pipes', category: 'Facility' },
  { value: 'fa-gears', label: '⚙️ Gears', category: 'Facility' },

  // Operations & Maintenance
  { value: 'fa-wrench', label: '🔧 Wrench', category: 'Operations' },
  { value: 'fa-tools', label: '🛠️ Tools', category: 'Operations' },
  { value: 'fa-hammer', label: '🔨 Hammer', category: 'Operations' },
  { value: 'fa-screwdriver', label: '🪛 Screwdriver', category: 'Operations' },
  { value: 'fa-people-group', label: '👥 People Group', category: 'Operations' },

  // Environment & Emissions
  { value: 'fa-leaf', label: '🍃 Leaf', category: 'Environment' },
  { value: 'fa-tree', label: '🌳 Tree', category: 'Environment' },
  { value: 'fa-cloud', label: '☁️ Cloud', category: 'Environment' },
  { value: 'fa-smog', label: '🌫️ Smog', category: 'Environment' },
  { value: 'fa-heart-pulse', label: '💚 Heart Pulse', category: 'Environment' },

  // Safety & Compliance
  { value: 'fa-shield', label: '🛡️ Shield', category: 'Safety' },
  { value: 'fa-check-circle', label: '✓ Check Circle', category: 'Safety' },
  { value: 'fa-exclamation-triangle', label: '⚠️ Warning', category: 'Safety' },
  { value: 'fa-lock', label: '🔒 Lock', category: 'Safety' },
  { value: 'fa-fire-extinguisher', label: '🧯 Fire Extinguisher', category: 'Safety' },

  // General Metrics
  { value: 'fa-percent', label: '% Percent', category: 'General' },
  { value: 'fa-calculator', label: '🧮 Calculator', category: 'General' },
  { value: 'fa-circle-info', label: 'ℹ️ Info', category: 'General' },
  { value: 'fa-circle-check', label: '✓ Verified', category: 'General' },
  { value: 'fa-circle-xmark', label: '✗ Failed', category: 'General' },
];

/**
 * Group icons by category for display
 */
export const FONT_AWESOME_ICONS_BY_CATEGORY = FONT_AWESOME_FREE_ICONS.reduce(
  (acc, icon) => {
    if (!acc[icon.category]) {
      acc[icon.category] = [];
    }
    acc[icon.category].push(icon);
    return acc;
  },
  {} as Record<string, typeof FONT_AWESOME_FREE_ICONS>
);

/**
 * Get icon label by value
 */
export function getIconLabel(value: string): string {
  const icon = FONT_AWESOME_FREE_ICONS.find(i => i.value === value);
  return icon ? icon.label : value;
}
