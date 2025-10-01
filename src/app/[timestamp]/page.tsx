'use client';

import { useState, useEffect, use, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  validateTimestamp,
  formatTimestamp,
  getBrowserTimezone,
  type DisplayMode,
} from '@/lib/timestamp';
import { getTimezoneGroups } from '@/lib/timezones';

interface TimestampPageProps {
  params: Promise<{
    timestamp: string;
  }>;
}

// Type guard for valid display modes
const isValidDisplayMode = (mode: string): mode is DisplayMode => {
  return ['default', 'date', 'compact', 'iso', 'relative'].includes(mode);
};

export default function TimestampPage({ params }: TimestampPageProps) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const modeParam = searchParams.get('mode');
  const mode =
    modeParam && isValidDisplayMode(modeParam) ? modeParam : 'default';

  const [selectedTimezone, setSelectedTimezone] = useState<string>('');
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Memoize timezone groups to prevent unnecessary recalculations
  const timezoneGroups = useMemo(() => getTimezoneGroups(), []);

  // Memoize timestamp validation to prevent unnecessary recalculations
  const timestamp = useMemo(
    () => validateTimestamp(resolvedParams.timestamp),
    [resolvedParams.timestamp]
  );

  useEffect(() => {
    if (!timestamp) {
      setError('Invalid timestamp provided');
      setIsLoading(false);
      return;
    }

    try {
      const browserTimezone = getBrowserTimezone();
      setSelectedTimezone(browserTimezone);

      const formatted = formatTimestamp(timestamp, browserTimezone, mode);
      setFormattedDate(formatted);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error formatting timestamp:', err);
      setError('Failed to format timestamp. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [timestamp, mode]);

  const handleTimezoneChange = useCallback(
    (timezone: string) => {
      if (!timezone || !timestamp) return;

      try {
        setSelectedTimezone(timezone);
        const formatted = formatTimestamp(timestamp, timezone, mode);
        setFormattedDate(formatted);
        setError(''); // Clear any previous errors
      } catch (err) {
        console.error('Error changing timezone:', err);
        setError('Failed to change timezone. Please try again.');
      }
    },
    [timestamp, mode]
  );

  if (isLoading) {
    return (
      <div className='container'>
        <h1
          className='text-3xl font-bold mb-8'
          style={{ color: 'var(--primary-color)' }}
        >
          Confirmed Date/Time
        </h1>
        <div className='confirmed-time'>
          <div
            className='text-2xl font-semibold'
            style={{ color: 'var(--text-color)' }}
          >
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container'>
        <h1 className='text-2xl font-bold mb-4' style={{ color: '#f44336' }}>
          Error
        </h1>
        <p style={{ color: 'var(--text-color)' }}>{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className='container'>
        <h1
          className='text-3xl font-bold mb-8'
          style={{ color: 'var(--primary-color)' }}
        >
          Confirmed Date/Time
        </h1>

        {formattedDate && (
          <>
            <div className='confirmed-time'>
              <div
                className='text-2xl font-semibold'
                id='bookingTime'
                style={{ color: 'var(--text-color)' }}
              >
                {formattedDate}
              </div>
            </div>
            <div className='timezone-info'>
              Displayed in your local timezone of{' '}
              <span id='timezoneName'>{selectedTimezone}</span>
            </div>

            <div className='timezone-selector'>
              <label
                htmlFor='timezone'
                className='block text-sm font-medium mb-2'
                style={{ color: 'var(--text-color)' }}
              >
                View in different timezone:
              </label>
              <select
                id='timezone'
                value={selectedTimezone}
                onChange={e => handleTimezoneChange(e.target.value)}
                disabled={isLoading}
                aria-describedby='timezone-help'
              >
                <option value=''>Select a timezone</option>
                {timezoneGroups.map(group => (
                  <optgroup key={group.label} label={group.label}>
                    {group.timezones.map(tz => (
                      <option key={tz.value} value={tz.value}>
                        {tz.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div id='timezone-help' className='timezone-help'>
                If the time shown doesn&apos;t match your local time, please
                select your correct timezone from the dropdown above.
              </div>
            </div>
          </>
        )}
      </div>

      <div className='copyright'>© {new Date().getFullYear()} SwapTZ</div>
    </>
  );
}
