export type DisplayMode = 'default' | 'date' | 'compact' | 'iso' | 'relative';

export interface TimestampConversion {
  timestamp: number;
  formattedDate: string;
  timezone: string;
  mode: DisplayMode;
}

/**
 * Type guard to check if a string is a valid DisplayMode
 */
export function isValidDisplayMode(mode: string): mode is DisplayMode {
  return ['default', 'date', 'compact', 'iso', 'relative'].includes(mode);
}

/**
 * Type guard to check if a value is a valid timestamp
 */
export function isValidTimestamp(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/**
 * Constants for timestamp validation
 */
export const TIMESTAMP_CONSTANTS = {
  MIN_TIMESTAMP: 0, // Unix epoch
  MAX_TIMESTAMP: 4102444800, // Jan 1, 2100
  SECONDS_IN_MINUTE: 60,
  SECONDS_IN_HOUR: 3600,
  SECONDS_IN_DAY: 86400,
  SECONDS_IN_WEEK: 604800,
  SECONDS_IN_YEAR: 31536000, // Approximate
} as const;

/**
 * Validates that the timestamp is a valid integer and within reasonable range
 */
export function validateTimestamp(timestampStr: string): number | null {
  if (!timestampStr || typeof timestampStr !== 'string') {
    return null;
  }

  try {
    const timestamp = parseInt(timestampStr, 10);

    // Check if timestamp is within reasonable range (1970 to 2100)
    if (
      isNaN(timestamp) ||
      timestamp < TIMESTAMP_CONSTANTS.MIN_TIMESTAMP ||
      timestamp > TIMESTAMP_CONSTANTS.MAX_TIMESTAMP
    ) {
      return null;
    }

    return timestamp;
  } catch {
    return null;
  }
}

/**
 * Formats a timestamp based on the specified mode and timezone
 */
export function formatTimestamp(
  timestamp: number,
  timezone: string = 'UTC',
  mode: DisplayMode = 'default'
): string {
  if (!Number.isFinite(timestamp) || timestamp < 0) {
    throw new Error('Invalid timestamp: must be a positive finite number');
  }

  if (!timezone || typeof timezone !== 'string') {
    throw new Error('Invalid timezone: must be a non-empty string');
  }

  try {
    const date = new Date(timestamp * 1000);

    // Validate the date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid timestamp: results in invalid date');
    }

    switch (mode) {
      case 'date':
        return new Intl.DateTimeFormat('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: timezone,
        }).format(date);

      case 'compact':
        return new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: timezone,
        })
          .format(date)
          .replace(',', '');

      case 'iso':
        // Convert to the selected timezone using toLocaleString, then format as ISO
        const tzDate = new Date(
          date.toLocaleString('en-US', { timeZone: timezone })
        );
        return tzDate.toISOString().replace('.000Z', '');

      case 'relative':
        return getRelativeTime(date);

      default:
        return new Intl.DateTimeFormat('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
          timeZone: timezone,
        }).format(date);
    }
  } catch (error) {
    // Handle timezone errors gracefully
    if (error instanceof RangeError && error.message.includes('timezone')) {
      console.warn(`Invalid timezone "${timezone}", falling back to UTC`);
      return formatTimestamp(timestamp, 'UTC', mode);
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Gets relative time (e.g., "in 2 days", "3 hours ago")
 */
function getRelativeTime(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date provided to getRelativeTime');
  }

  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  // Handle very large differences (years)
  if (Math.abs(diffDay) >= 365) {
    const diffYear = Math.round(diffDay / 365);
    return diffYear > 0
      ? `in ${diffYear} year${diffYear === 1 ? '' : 's'}`
      : `${-diffYear} year${diffYear === -1 ? '' : 's'} ago`;
  }

  // Handle weeks
  if (Math.abs(diffDay) >= 7) {
    const diffWeek = Math.round(diffDay / 7);
    return diffWeek > 0
      ? `in ${diffWeek} week${diffWeek === 1 ? '' : 's'}`
      : `${-diffWeek} week${diffWeek === -1 ? '' : 's'} ago`;
  }

  if (Math.abs(diffSec) < 60) {
    return diffSec > 0
      ? `in ${diffSec} second${diffSec === 1 ? '' : 's'}`
      : `${-diffSec} second${diffSec === -1 ? '' : 's'} ago`;
  } else if (Math.abs(diffMin) < 60) {
    return diffMin > 0
      ? `in ${diffMin} minute${diffMin === 1 ? '' : 's'}`
      : `${-diffMin} minute${diffMin === -1 ? '' : 's'} ago`;
  } else if (Math.abs(diffHour) < 24) {
    return diffHour > 0
      ? `in ${diffHour} hour${diffHour === 1 ? '' : 's'}`
      : `${-diffHour} hour${diffHour === -1 ? '' : 's'} ago`;
  } else {
    return diffDay > 0
      ? `in ${diffDay} day${diffDay === 1 ? '' : 's'}`
      : `${-diffDay} day${diffDay === -1 ? '' : 's'} ago`;
  }
}

/**
 * Gets the current timestamp
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Comprehensive timestamp conversion function
 */
export function convertTimestamp(
  timestamp: number,
  timezone: string = 'UTC',
  mode: DisplayMode = 'default'
): TimestampConversion {
  const formattedDate = formatTimestamp(timestamp, timezone, mode);

  return {
    timestamp,
    formattedDate,
    timezone,
    mode,
  };
}

/**
 * Safely format timestamp with error handling
 */
export function safeFormatTimestamp(
  timestamp: number,
  timezone: string = 'UTC',
  mode: DisplayMode = 'default',
  fallback: string = 'Invalid timestamp'
): string {
  try {
    return formatTimestamp(timestamp, timezone, mode);
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return fallback;
  }
}

/**
 * Gets the user's browser timezone
 */
export function getBrowserTimezone(): string {
  try {
    // Check if Intl API is available
    if (typeof Intl === 'undefined' || !Intl.DateTimeFormat) {
      console.warn('Intl API not available, falling back to UTC');
      return 'UTC';
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Validate timezone is not empty
    if (!timezone || typeof timezone !== 'string') {
      console.warn('Invalid timezone detected, falling back to UTC');
      return 'UTC';
    }

    return timezone;
  } catch (error) {
    console.warn('Failed to get browser timezone, falling back to UTC:', error);
    return 'UTC';
  }
}
