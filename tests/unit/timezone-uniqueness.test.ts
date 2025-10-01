import { describe, it, expect } from 'vitest';
import { commonTimezones, getTimezoneGroups } from '@/lib/timezones';

describe('Timezone Uniqueness', () => {
  describe('commonTimezones', () => {
    it('should have unique timezone values within each group', () => {
      commonTimezones.forEach(group => {
        const values = group.timezones.map(tz => tz.value);
        const uniqueValues = new Set(values);

        expect(values.length).toBe(uniqueValues.size);
        expect(values).toEqual([...uniqueValues]);
      });
    });

    it('should have unique timezone values across all groups', () => {
      const allValues = commonTimezones.flatMap(group =>
        group.timezones.map(tz => tz.value)
      );
      const uniqueValues = new Set(allValues);

      expect(allValues.length).toBe(uniqueValues.size);
      expect(allValues).toEqual([...uniqueValues]);
    });

    it('should have unique timezone names within each group', () => {
      commonTimezones.forEach(group => {
        const names = group.timezones.map(tz => tz.name);
        const uniqueNames = new Set(names);

        expect(names.length).toBe(uniqueNames.size);
        expect(names).toEqual([...uniqueNames]);
      });
    });

    it('should not have duplicate Pacific/Auckland entries', () => {
      const pacificAucklandEntries = commonTimezones
        .flatMap(group => group.timezones)
        .filter(tz => tz.value === 'Pacific/Auckland');

      expect(pacificAucklandEntries).toHaveLength(1);
      expect(pacificAucklandEntries[0].name).toBe('Auckland/Wellington');
    });
  });

  describe('getTimezoneGroups', () => {
    it('should return timezone groups with unique values', () => {
      const groups = getTimezoneGroups();

      groups.forEach(group => {
        const values = group.timezones.map(tz => tz.value);
        const uniqueValues = new Set(values);

        expect(values.length).toBe(uniqueValues.size);
        expect(values).toEqual([...uniqueValues]);
      });
    });

    it('should not duplicate common timezones in other group', () => {
      const groups = getTimezoneGroups();
      const commonValues = new Set(
        commonTimezones.flatMap(group => group.timezones.map(tz => tz.value))
      );

      const otherGroup = groups.find(
        group => group.label === 'All Other Timezones'
      );
      expect(otherGroup).toBeDefined();

      otherGroup?.timezones.forEach(timezone => {
        expect(commonValues.has(timezone.value)).toBe(false);
      });
    });

    it('should have unique values across all groups', () => {
      const groups = getTimezoneGroups();
      const allValues = groups.flatMap(group =>
        group.timezones.map(tz => tz.value)
      );
      const uniqueValues = new Set(allValues);

      expect(allValues.length).toBe(uniqueValues.size);
      expect(allValues).toEqual([...uniqueValues]);
    });
  });

  describe('React Key Uniqueness', () => {
    it('should generate unique keys for timezone options', () => {
      const groups = getTimezoneGroups();
      const keys: string[] = [];

      groups.forEach(group => {
        group.timezones.forEach(tz => {
          const key = tz.value; // This is what we use as React key
          keys.push(key);
        });
      });

      const uniqueKeys = new Set(keys);
      expect(keys.length).toBe(uniqueKeys.size);
      expect(keys).toEqual([...uniqueKeys]);
    });

    it('should have unique optgroup labels', () => {
      const groups = getTimezoneGroups();
      const labels = groups.map(group => group.label);
      const uniqueLabels = new Set(labels);

      expect(labels.length).toBe(uniqueLabels.size);
      expect(labels).toEqual([...uniqueLabels]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty timezone groups gracefully', () => {
      const groups = getTimezoneGroups();

      // Each group should have at least an empty array, not undefined
      groups.forEach(group => {
        expect(Array.isArray(group.timezones)).toBe(true);
      });
    });

    it('should not have any undefined or null timezone values', () => {
      const groups = getTimezoneGroups();

      groups.forEach(group => {
        group.timezones.forEach(tz => {
          expect(tz.value).toBeDefined();
          expect(tz.value).not.toBeNull();
          expect(tz.name).toBeDefined();
          expect(tz.name).not.toBeNull();
        });
      });
    });

    it('should not have empty string timezone values', () => {
      const groups = getTimezoneGroups();

      groups.forEach(group => {
        group.timezones.forEach(tz => {
          expect(tz.value).not.toBe('');
          expect(tz.name).not.toBe('');
        });
      });
    });
  });
});
