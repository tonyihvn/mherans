

/**
 * Nigerian States Mapping
 * Maps state abbreviations to full state names
 */

export const NIGERIAN_STATES = {
  'LA': 'Lagos',
  'OG': 'Ogun',
  'KN': 'Kano',
  'RV': 'Rivers',
  'NW': 'Nationwide',
  'KD': 'Kaduna',
  'ED': 'Edo',
  'KS': 'Katsina',
  'KT': 'Kogi',
  'SS': 'Cross River',
  'CR': 'Caritas',
  'BD': 'Bauchi',
  'NY': 'Nasarawa',
  'ZN': 'Zamfara',
  'FG': 'FCT'
} as const;

export type StateCode = keyof typeof NIGERIAN_STATES;

/**
 * Get full state name from abbreviation
 */
export function getStateName(code: string): string {
  return NIGERIAN_STATES[code as StateCode] || code;
}

/**
 * Get list of state codes
 */
export function getStateCodes(): StateCode[] {
  return Object.keys(NIGERIAN_STATES) as StateCode[];
}

/**
 * Get list of states as options for select dropdowns
 */
export function getStateOptions() {
  return Object.entries(NIGERIAN_STATES).map(([code, name]) => ({
    code,
    name,
    label: `${name} (${code})`
  }));
}
