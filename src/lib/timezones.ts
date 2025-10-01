export interface TimezoneOption {
  name: string;
  value: string;
}

export interface TimezoneGroup {
  label: string;
  timezones: TimezoneOption[];
}

/**
 * Type guard to check if a value is a valid timezone string
 */
export function isValidTimezone(timezone: unknown): timezone is string {
  if (typeof timezone !== 'string' || timezone.length === 0) {
    return false;
  }

  // Basic timezone format validation (Region/City)
  return timezone.includes('/') && timezone.length > 3;
}

/**
 * Type guard to check if a value is a TimezoneOption
 */
export function isTimezoneOption(option: unknown): option is TimezoneOption {
  return (
    typeof option === 'object' &&
    option !== null &&
    'name' in option &&
    'value' in option &&
    typeof (option as TimezoneOption).name === 'string' &&
    typeof (option as TimezoneOption).value === 'string'
  );
}

/**
 * Type guard to check if a value is a TimezoneGroup
 */
export function isTimezoneGroup(group: unknown): group is TimezoneGroup {
  return (
    typeof group === 'object' &&
    group !== null &&
    'label' in group &&
    'timezones' in group &&
    typeof (group as TimezoneGroup).label === 'string' &&
    Array.isArray((group as TimezoneGroup).timezones)
  );
}

/**
 * Common timezones grouped by region for easy access
 */
export const commonTimezones: TimezoneGroup[] = [
  {
    label: 'Australia',
    timezones: [
      { name: 'Sydney', value: 'Australia/Sydney' },
      { name: 'Melbourne', value: 'Australia/Melbourne' },
      { name: 'Brisbane', value: 'Australia/Brisbane' },
      { name: 'Perth', value: 'Australia/Perth' },
      { name: 'Adelaide', value: 'Australia/Adelaide' },
      { name: 'Darwin', value: 'Australia/Darwin' },
    ],
  },
  {
    label: 'New Zealand',
    timezones: [{ name: 'Auckland/Wellington', value: 'Pacific/Auckland' }],
  },
  {
    label: 'United Kingdom',
    timezones: [{ name: 'London', value: 'Europe/London' }],
  },
  {
    label: 'United States',
    timezones: [
      { name: 'Eastern Time (New York)', value: 'America/New_York' },
      { name: 'Central Time (Chicago)', value: 'America/Chicago' },
      { name: 'Mountain Time (Denver)', value: 'America/Denver' },
      { name: 'Pacific Time (Los Angeles)', value: 'America/Los_Angeles' },
    ],
  },
];

/**
 * Fallback timezones for when Intl API is not available
 */
const FALLBACK_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
] as const;

/**
 * Cache for timezone data to improve performance in serverless environments
 */
let timezoneCache: {
  allTimezones: string[] | null;
  timezoneGroups: TimezoneGroup[] | null;
  lastUpdated: number;
} = {
  allTimezones: null,
  timezoneGroups: null,
  lastUpdated: 0,
};

/**
 * Cache TTL in milliseconds (5 minutes)
 */
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Check if cache is valid
 */
function isCacheValid(): boolean {
  return Date.now() - timezoneCache.lastUpdated < CACHE_TTL;
}

/**
 * Clear the timezone cache
 */
export function clearTimezoneCache(): void {
  timezoneCache = {
    allTimezones: null,
    timezoneGroups: null,
    lastUpdated: 0,
  };
}

/**
 * Gets all available timezones from the browser
 */
export function getAllTimezones(): string[] {
  // Return cached result if valid
  if (timezoneCache.allTimezones && isCacheValid()) {
    return timezoneCache.allTimezones;
  }

  try {
    // Check if Intl API is available
    if (typeof Intl === 'undefined' || !Intl.supportedValuesOf) {
      console.warn(
        'Intl.supportedValuesOf not available, using fallback timezones'
      );
      const fallback = [...FALLBACK_TIMEZONES];
      timezoneCache.allTimezones = fallback;
      timezoneCache.lastUpdated = Date.now();
      return fallback;
    }

    const timezones = Intl.supportedValuesOf('timeZone');

    // Validate the result
    if (!Array.isArray(timezones) || timezones.length === 0) {
      console.warn(
        'Intl.supportedValuesOf returned invalid data, using fallback timezones'
      );
      const fallback = [...FALLBACK_TIMEZONES];
      timezoneCache.allTimezones = fallback;
      timezoneCache.lastUpdated = Date.now();
      return fallback;
    }

    // Filter out any invalid timezone strings
    const validTimezones = timezones.filter(
      tz => typeof tz === 'string' && tz.length > 0 && tz.includes('/')
    );

    if (validTimezones.length === 0) {
      console.warn('No valid timezones found, using fallback timezones');
      const fallback = [...FALLBACK_TIMEZONES];
      timezoneCache.allTimezones = fallback;
      timezoneCache.lastUpdated = Date.now();
      return fallback;
    }

    const sortedTimezones = validTimezones.sort();
    timezoneCache.allTimezones = sortedTimezones;
    timezoneCache.lastUpdated = Date.now();
    return sortedTimezones;
  } catch (error) {
    console.warn(
      'Error getting timezones from Intl API, using fallback:',
      error
    );
    const fallback = [...FALLBACK_TIMEZONES];
    timezoneCache.allTimezones = fallback;
    timezoneCache.lastUpdated = Date.now();
    return fallback;
  }
}

/**
 * Gets all timezone groups including common ones and all others
 */
export function getTimezoneGroups(): TimezoneGroup[] {
  // Return cached result if valid
  if (timezoneCache.timezoneGroups && isCacheValid()) {
    return timezoneCache.timezoneGroups;
  }

  try {
    // Get common timezone values for filtering
    const commonTimezoneValues = new Set(
      commonTimezones.flatMap(group => group.timezones).map(tz => tz.value)
    );

    // Get all available timezones
    const allTimezones = getAllTimezones();

    // Filter out common timezones and create timezone options
    const otherTimezones = allTimezones
      .filter(tz => !commonTimezoneValues.has(tz))
      .map(tz => ({
        name: formatTimezoneName(tz),
        value: tz,
      }));

    const result = [
      ...commonTimezones,
      {
        label: 'All Other Timezones',
        timezones: otherTimezones,
      },
    ];

    // Cache the result
    timezoneCache.timezoneGroups = result;
    timezoneCache.lastUpdated = Date.now();

    return result;
  } catch (error) {
    console.error('Error getting timezone groups:', error);
    // Return just common timezones as fallback
    const fallback = [
      ...commonTimezones,
      {
        label: 'All Other Timezones',
        timezones: [],
      },
    ];

    // Cache the fallback result
    timezoneCache.timezoneGroups = fallback;
    timezoneCache.lastUpdated = Date.now();

    return fallback;
  }
}

/**
 * Formats timezone name for display
 */
function formatTimezoneName(timezone: string): string {
  if (!timezone || typeof timezone !== 'string') {
    return 'Unknown';
  }

  // Convert "America/New_York" to "New York"
  const parts = timezone.split('/');
  if (parts.length < 2) {
    return timezone;
  }

  const city = parts[parts.length - 1];
  return city.replace(/_/g, ' ');
}

/**
 * Find a timezone option by value
 */
export function findTimezoneByValue(
  timezoneGroups: TimezoneGroup[],
  value: string
): TimezoneOption | null {
  if (!isValidTimezone(value)) {
    return null;
  }

  for (const group of timezoneGroups) {
    const found = group.timezones.find(tz => tz.value === value);
    if (found) {
      return found;
    }
  }

  return null;
}

/**
 * Get timezone groups for a specific region
 */
export function getTimezonesByRegion(
  timezoneGroups: TimezoneGroup[],
  region: string
): TimezoneOption[] {
  const group = timezoneGroups.find(g =>
    g.label.toLowerCase().includes(region.toLowerCase())
  );
  return group?.timezones || [];
}

/**
 * Search timezones by name or value
 */
export function searchTimezones(
  timezoneGroups: TimezoneGroup[],
  query: string
): TimezoneOption[] {
  if (!query || typeof query !== 'string') {
    return [];
  }

  const searchTerm = query.toLowerCase();
  const results: TimezoneOption[] = [];

  for (const group of timezoneGroups) {
    for (const timezone of group.timezones) {
      if (
        timezone.name.toLowerCase().includes(searchTerm) ||
        timezone.value.toLowerCase().includes(searchTerm)
      ) {
        results.push(timezone);
      }
    }
  }

  return results;
}

/**
 * Get timezone statistics
 */
export function getTimezoneStats(timezoneGroups: TimezoneGroup[]): {
  totalGroups: number;
  totalTimezones: number;
  regions: string[];
} {
  const regions = timezoneGroups.map(group => group.label);
  const totalTimezones = timezoneGroups.reduce(
    (sum, group) => sum + group.timezones.length,
    0
  );

  return {
    totalGroups: timezoneGroups.length,
    totalTimezones,
    regions,
  };
}
