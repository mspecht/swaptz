import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  commonTimezones,
  getTimezoneGroups,
  getAllTimezones,
  isValidTimezone,
  isTimezoneOption,
  isTimezoneGroup,
  findTimezoneByValue,
  getTimezonesByRegion,
  searchTimezones,
  getTimezoneStats,
  clearTimezoneCache,
} from '@/lib/timezones';

// Mock Intl.supportedValuesOf
const mockSupportedTimezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Brisbane',
  'Australia/Perth',
  'Australia/Adelaide',
  'Australia/Darwin',
  'Pacific/Auckland',
  'Asia/Tokyo',
  'Europe/Paris',
  'America/Toronto',
];

describe('commonTimezones', () => {
  it('should contain expected timezone groups', () => {
    expect(commonTimezones).toHaveLength(4);

    const groupLabels = commonTimezones.map(group => group.label);
    expect(groupLabels).toContain('Australia');
    expect(groupLabels).toContain('New Zealand');
    expect(groupLabels).toContain('United Kingdom');
    expect(groupLabels).toContain('United States');
  });

  it('should have correct timezone structure', () => {
    commonTimezones.forEach(group => {
      expect(group).toHaveProperty('label');
      expect(group).toHaveProperty('timezones');
      expect(Array.isArray(group.timezones)).toBe(true);

      group.timezones.forEach(timezone => {
        expect(timezone).toHaveProperty('name');
        expect(timezone).toHaveProperty('value');
        expect(typeof timezone.name).toBe('string');
        expect(typeof timezone.value).toBe('string');
      });
    });
  });

  it('should contain specific expected timezones', () => {
    const australiaGroup = commonTimezones.find(
      group => group.label === 'Australia'
    );
    expect(australiaGroup).toBeDefined();

    const sydneyTz = australiaGroup?.timezones.find(
      tz => tz.value === 'Australia/Sydney'
    );
    expect(sydneyTz).toBeDefined();
    expect(sydneyTz?.name).toBe('Sydney');
  });
});

describe('getAllTimezones', () => {
  beforeEach(() => {
    clearTimezoneCache();
  });

  it('should return timezones from Intl API', () => {
    vi.mocked(Intl.supportedValuesOf).mockReturnValue(mockSupportedTimezones);

    const result = getAllTimezones();
    expect(result).toEqual(expect.arrayContaining(mockSupportedTimezones));
    expect(result).toHaveLength(mockSupportedTimezones.length);
  });

  it('should handle Intl API errors gracefully', () => {
    vi.mocked(Intl.supportedValuesOf).mockImplementation(() => {
      throw new Error('Intl API error');
    });

    const result = getAllTimezones();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle missing Intl API', () => {
    const originalIntl = global.Intl;
    // @ts-expect-error - Intentionally setting to undefined for testing
    global.Intl = undefined;

    const result = getAllTimezones();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);

    global.Intl = originalIntl;
  });

  it('should cache results', () => {
    vi.mocked(Intl.supportedValuesOf).mockReturnValue(mockSupportedTimezones);

    const result1 = getAllTimezones();
    const result2 = getAllTimezones();

    expect(result1).toBe(result2); // Should return same reference due to caching
  });
});

describe('getTimezoneGroups', () => {
  beforeEach(() => {
    clearTimezoneCache();
    vi.mocked(Intl.supportedValuesOf).mockReturnValue(mockSupportedTimezones);
  });

  it('should return all timezone groups including common ones', () => {
    const result = getTimezoneGroups();

    expect(result.length).toBeGreaterThan(commonTimezones.length);
    expect(result).toEqual(expect.arrayContaining(commonTimezones));
  });

  it('should include "All Other Timezones" group', () => {
    const result = getTimezoneGroups();

    const otherGroup = result.find(
      group => group.label === 'All Other Timezones'
    );
    expect(otherGroup).toBeDefined();
    expect(otherGroup?.timezones.length).toBeGreaterThan(0);
  });

  it('should not duplicate common timezones in other group', () => {
    const result = getTimezoneGroups();

    const commonTimezoneValues = new Set(
      commonTimezones.flatMap(group => group.timezones.map(tz => tz.value))
    );

    const otherGroup = result.find(
      group => group.label === 'All Other Timezones'
    );
    expect(otherGroup).toBeDefined();

    otherGroup?.timezones.forEach(timezone => {
      expect(commonTimezoneValues.has(timezone.value)).toBe(false);
    });
  });

  it('should sort other timezones alphabetically', () => {
    const result = getTimezoneGroups();
    const otherGroup = result.find(
      group => group.label === 'All Other Timezones'
    );

    expect(otherGroup).toBeDefined();
    const timezoneValues = otherGroup?.timezones.map(tz => tz.value) || [];
    const sortedValues = [...timezoneValues].sort();

    expect(timezoneValues).toEqual(sortedValues);
  });

  it('should handle empty supported timezones', () => {
    vi.mocked(Intl.supportedValuesOf).mockReturnValue([]);

    const result = getTimezoneGroups();
    expect(result).toHaveLength(commonTimezones.length + 1); // +1 for "All Other Timezones" group
    expect(result).toEqual(expect.arrayContaining(commonTimezones));
    expect(result[result.length - 1].label).toBe('All Other Timezones');
    // When Intl returns empty array, we fall back to FALLBACK_TIMEZONES
    expect(result[result.length - 1].timezones.length).toBeGreaterThan(0);
  });

  it('should cache results', () => {
    const result1 = getTimezoneGroups();
    const result2 = getTimezoneGroups();

    expect(result1).toBe(result2); // Should return same reference due to caching
  });
});

describe('Type Guards', () => {
  describe('isValidTimezone', () => {
    it('should validate timezone strings correctly', () => {
      expect(isValidTimezone('America/New_York')).toBe(true);
      expect(isValidTimezone('Europe/London')).toBe(true);
      expect(isValidTimezone('UTC')).toBe(false); // Doesn't contain '/'
      expect(isValidTimezone('')).toBe(false);
      expect(isValidTimezone(null)).toBe(false);
      expect(isValidTimezone(123)).toBe(false);
    });
  });

  describe('isTimezoneOption', () => {
    it('should validate timezone options correctly', () => {
      expect(
        isTimezoneOption({ name: 'New York', value: 'America/New_York' })
      ).toBe(true);
      expect(isTimezoneOption({ name: 'New York' })).toBe(false);
      expect(isTimezoneOption({ value: 'America/New_York' })).toBe(false);
      expect(isTimezoneOption(null)).toBe(false);
      expect(isTimezoneOption('invalid')).toBe(false);
    });
  });

  describe('isTimezoneGroup', () => {
    it('should validate timezone groups correctly', () => {
      expect(isTimezoneGroup({ label: 'US', timezones: [] })).toBe(true);
      expect(isTimezoneGroup({ label: 'US' })).toBe(false);
      expect(isTimezoneGroup({ timezones: [] })).toBe(false);
      expect(isTimezoneGroup(null)).toBe(false);
      expect(isTimezoneGroup('invalid')).toBe(false);
    });
  });
});

describe('Utility Functions', () => {
  let timezoneGroups: ReturnType<typeof getTimezoneGroups>;

  beforeEach(() => {
    clearTimezoneCache();
    vi.mocked(Intl.supportedValuesOf).mockReturnValue(mockSupportedTimezones);
    timezoneGroups = getTimezoneGroups();
  });

  describe('findTimezoneByValue', () => {
    it('should find timezone by value', () => {
      const result = findTimezoneByValue(timezoneGroups, 'America/New_York');
      expect(result).toBeDefined();
      expect(result?.name).toBe('Eastern Time (New York)');
    });

    it('should return null for invalid timezone', () => {
      const result = findTimezoneByValue(timezoneGroups, 'Invalid/Timezone');
      expect(result).toBeNull();
    });

    it('should return null for invalid input', () => {
      const result = findTimezoneByValue(timezoneGroups, '');
      expect(result).toBeNull();
    });
  });

  describe('getTimezonesByRegion', () => {
    it('should get timezones by region', () => {
      const result = getTimezonesByRegion(timezoneGroups, 'United States');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].value).toContain('America/');
    });

    it('should return empty array for unknown region', () => {
      const result = getTimezonesByRegion(timezoneGroups, 'Unknown Region');
      expect(result).toHaveLength(0);
    });
  });

  describe('searchTimezones', () => {
    it('should search timezones by name', () => {
      const result = searchTimezones(timezoneGroups, 'New York');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].name).toContain('New York');
    });

    it('should search timezones by value', () => {
      const result = searchTimezones(timezoneGroups, 'America/New_York');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].value).toBe('America/New_York');
    });

    it('should return empty array for no matches', () => {
      const result = searchTimezones(timezoneGroups, 'NonExistent');
      expect(result).toHaveLength(0);
    });

    it('should handle empty query', () => {
      const result = searchTimezones(timezoneGroups, '');
      expect(result).toHaveLength(0);
    });
  });

  describe('getTimezoneStats', () => {
    it('should return correct statistics', () => {
      const stats = getTimezoneStats(timezoneGroups);

      expect(stats.totalGroups).toBeGreaterThan(0);
      expect(stats.totalTimezones).toBeGreaterThan(0);
      expect(Array.isArray(stats.regions)).toBe(true);
      expect(stats.regions.length).toBe(stats.totalGroups);
    });
  });
});
