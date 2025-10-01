import { describe, it, expect, vi } from 'vitest';
import {
  validateTimestamp,
  formatTimestamp,
  getCurrentTimestamp,
  isValidDisplayMode,
  isValidTimestamp,
  convertTimestamp,
  safeFormatTimestamp,
  getBrowserTimezone,
} from '@/lib/timestamp';

describe('validateTimestamp', () => {
  it('should validate a valid timestamp', () => {
    expect(validateTimestamp('1747510600')).toBe(1747510600);
    expect(validateTimestamp('0')).toBe(0);
    expect(validateTimestamp('4102444800')).toBe(4102444800); // Jan 1, 2100
  });

  it('should reject invalid timestamps', () => {
    expect(validateTimestamp('invalid')).toBeNull();
    expect(validateTimestamp('')).toBeNull();
    expect(validateTimestamp('-1')).toBeNull();
    expect(validateTimestamp('4102444801')).toBeNull(); // After 2100
    expect(validateTimestamp('1.5')).toBe(1); // parseInt converts 1.5 to 1
  });

  it('should handle edge cases', () => {
    expect(validateTimestamp('0')).toBe(0); // Unix epoch
    expect(validateTimestamp('4102444800')).toBe(4102444800); // Jan 1, 2100
  });
});

describe('formatTimestamp', () => {
  const mockTimestamp = 1747510600;
  const mockTimezone = 'Australia/Sydney';

  it('should format timestamp in default mode', () => {
    const result = formatTimestamp(mockTimestamp, mockTimezone, 'default');
    expect(result).toContain('May 2025');
    expect(result).toContain('at');
  });

  it('should format timestamp in date mode', () => {
    const result = formatTimestamp(mockTimestamp, mockTimezone, 'date');
    expect(result).toContain('May 2025');
    expect(result).not.toContain('at');
  });

  it('should format timestamp in compact mode', () => {
    const result = formatTimestamp(mockTimestamp, mockTimezone, 'compact');
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/);
  });

  it('should format timestamp in iso mode', () => {
    const result = formatTimestamp(mockTimestamp, mockTimezone, 'iso');
    expect(result).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('should format timestamp in relative mode', () => {
    const result = formatTimestamp(mockTimestamp, mockTimezone, 'relative');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should use default mode when no mode specified', () => {
    const result = formatTimestamp(mockTimestamp, mockTimezone);
    expect(result).toContain('May 2025');
    expect(result).toContain('at');
  });
});

describe('getCurrentTimestamp', () => {
  it('should return current timestamp', () => {
    const mockTime = 1747510600000; // Mock time in milliseconds
    vi.spyOn(Date, 'now').mockReturnValue(mockTime);

    const result = getCurrentTimestamp();
    expect(result).toBe(1747510600); // Should be in seconds
  });
});

describe('isValidDisplayMode', () => {
  it('should validate display modes correctly', () => {
    expect(isValidDisplayMode('default')).toBe(true);
    expect(isValidDisplayMode('date')).toBe(true);
    expect(isValidDisplayMode('compact')).toBe(true);
    expect(isValidDisplayMode('iso')).toBe(true);
    expect(isValidDisplayMode('relative')).toBe(true);
    expect(isValidDisplayMode('invalid')).toBe(false);
    expect(isValidDisplayMode('')).toBe(false);
  });
});

describe('isValidTimestamp', () => {
  it('should validate timestamps correctly', () => {
    expect(isValidTimestamp(1747510600)).toBe(true);
    expect(isValidTimestamp(0)).toBe(true);
    expect(isValidTimestamp(-1)).toBe(false);
    expect(isValidTimestamp(NaN)).toBe(false);
    expect(isValidTimestamp(Infinity)).toBe(false);
    expect(isValidTimestamp('1747510600')).toBe(false);
    expect(isValidTimestamp(null)).toBe(false);
  });
});

describe('convertTimestamp', () => {
  it('should convert timestamp with all properties', () => {
    const result = convertTimestamp(1747510600, 'UTC', 'default');

    expect(result).toHaveProperty('timestamp', 1747510600);
    expect(result).toHaveProperty('timezone', 'UTC');
    expect(result).toHaveProperty('mode', 'default');
    expect(result).toHaveProperty('formattedDate');
    expect(typeof result.formattedDate).toBe('string');
  });
});

describe('safeFormatTimestamp', () => {
  it('should format timestamp safely', () => {
    const result = safeFormatTimestamp(1747510600, 'UTC', 'default');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return fallback on error', () => {
    const result = safeFormatTimestamp(-1, 'UTC', 'default', 'Error occurred');
    expect(result).toBe('Error occurred');
  });
});

describe('getBrowserTimezone', () => {
  it('should return browser timezone', () => {
    const result = getBrowserTimezone();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle missing Intl API', () => {
    const originalIntl = global.Intl;
    // @ts-expect-error - Intentionally setting to undefined for testing
    global.Intl = undefined;

    const result = getBrowserTimezone();
    expect(result).toBe('UTC');

    global.Intl = originalIntl;
  });

  it('should handle Intl errors gracefully', () => {
    const originalIntl = global.Intl;
    global.Intl = {
      DateTimeFormat: () => {
        throw new Error('Intl error');
      },
      supportedLocalesOf: () => [],
    } as unknown as typeof Intl;

    const result = getBrowserTimezone();
    expect(result).toBe('UTC');

    global.Intl = originalIntl;
  });
});

describe('Error Handling', () => {
  it('should handle invalid timestamps in formatTimestamp', () => {
    expect(() => formatTimestamp(-1, 'UTC', 'default')).toThrow(
      'Invalid timestamp'
    );
    expect(() => formatTimestamp(NaN, 'UTC', 'default')).toThrow(
      'Invalid timestamp'
    );
  });

  it('should handle invalid timezones in formatTimestamp', () => {
    expect(() => formatTimestamp(1747510600, '', 'default')).toThrow(
      'Invalid timezone'
    );
    expect(() =>
      formatTimestamp(1747510600, null as unknown as string, 'default')
    ).toThrow('Invalid timezone');
  });

  it('should handle invalid dates in getRelativeTime', () => {
    expect(() => formatTimestamp(1747510600, 'UTC', 'relative')).not.toThrow();
  });
});
