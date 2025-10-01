'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCurrentTimestamp } from '@/lib/timestamp';

export default function LandingPage() {
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);

  useEffect(() => {
    setCurrentTimestamp(getCurrentTimestamp());
  }, []);

  return (
    <div className='container'>
      <h1
        className='text-4xl font-bold mb-6'
        style={{ color: 'var(--primary-color)' }}
      >
        SwapTZ
      </h1>
      <p className='text-lg mb-8' style={{ color: 'var(--text-color)' }}>
        Convert Unix timestamps to human-readable dates and times in any
        timezone, with multiple display modes for every use case.
      </p>

      <div className='mb-8'>
        <h2 className='text-2xl font-semibold mb-4' style={{ color: '#444' }}>
          Quick Start
        </h2>
        <div className='flex flex-wrap gap-4 justify-center'>
          {currentTimestamp > 0 ? (
            <>
              <Link href={`/${currentTimestamp}`} className='button'>
                View Current Time
              </Link>
              <Link href={`/${currentTimestamp}?mode=date`} className='button'>
                Date Only
              </Link>
              <Link
                href={`/${currentTimestamp}?mode=compact`}
                className='button'
              >
                Compact
              </Link>
              <Link href={`/${currentTimestamp}?mode=iso`} className='button'>
                ISO
              </Link>
              <Link
                href={`/${currentTimestamp}?mode=relative`}
                className='button'
              >
                Relative
              </Link>
            </>
          ) : (
            <div className='flex flex-wrap gap-4 justify-center'>
              <button className='button' disabled>
                Loading...
              </button>
              <button className='button' disabled>
                Loading...
              </button>
              <button className='button' disabled>
                Loading...
              </button>
              <button className='button' disabled>
                Loading...
              </button>
              <button className='button' disabled>
                Loading...
              </button>
            </div>
          )}
        </div>
      </div>

      <div className='info-box'>
        <h2 className='text-2xl font-semibold mb-4' style={{ color: '#444' }}>
          How to Use
        </h2>
        <p className='mb-4' style={{ color: '#666' }}>
          To convert a specific timestamp, add it to the URL like this:
        </p>
        <code className='bg-gray-200 px-3 py-1 rounded text-sm font-mono'>
          https://example.com/1747510600
        </code>
        <p className='mb-4 mt-4' style={{ color: '#666' }}>
          To change the display mode, add{' '}
          <code className='bg-gray-200 px-2 py-1 rounded text-sm font-mono'>
            ?mode=MODE
          </code>{' '}
          to the URL. For example:
        </p>
        <code className='bg-gray-200 px-3 py-1 rounded text-sm font-mono'>
          https://example.com/1747510600?mode=compact
        </code>

        <h3
          className='text-xl font-semibold mt-6 mb-4'
          style={{ color: '#555' }}
        >
          Display Modes
        </h3>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='bg-gray-100'>
                <th className='px-4 py-2 text-center'>Mode</th>
                <th className='px-4 py-2 text-center'>URL Example</th>
                <th className='px-4 py-2 text-center'>Description</th>
                <th className='px-4 py-2 text-center'>Output Example</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='px-4 py-2 font-semibold'>Default</td>
                <td className='px-4 py-2'>
                  <code className='bg-gray-200 px-2 py-1 rounded text-sm font-mono'>
                    /1747510600
                  </code>
                </td>
                <td className='px-4 py-2'>Full date and time</td>
                <td className='px-4 py-2'>
                  <code className='bg-gray-200 px-2 py-1 rounded text-sm font-mono'>
                    Sun 18 May 2025 at 10:30AM
                  </code>
                </td>
              </tr>
              <tr>
                <td className='px-4 py-2 font-semibold'>date</td>
                <td className='px-4 py-2'>
                  <code className='bg-gray-200 px-2 py-1 rounded text-sm font-mono'>
                    /1747510600?mode=date
                  </code>
                </td>
                <td className='px-4 py-2'>Date only</td>
                <td className='px-4 py-2'>
                  <code className='bg-gray-200 px-2 py-1 rounded text-sm font-mono'>
                    18 May 2025
                  </code>
                </td>
              </tr>
              <tr>
                <td className='px-4 py-2 font-semibold'>compact</td>
                <td className='px-4 py-2'>
                  <code className='bg-gray-200 px-2 py-1 rounded text-sm font-mono'>
                    /1747510600?mode=compact
                  </code>
                </td>
                <td className='px-4 py-2'>Short date and time</td>
                <td className='px-4 py-2'>
                  <code className='bg-gray-200 px-2 py-1 rounded text-sm font-mono'>
                    18/05/2025 10:30
                  </code>
                </td>
              </tr>
              <tr>
                <td className='px-4 py-2 font-semibold'>iso</td>
                <td className='px-4 py-2'>
                  <code className='bg-gray-200 px-2 py-1 rounded text-sm font-mono'>
                    /1747510600?mode=iso
                  </code>
                </td>
                <td className='px-4 py-2'>ISO 8601 format</td>
                <td className='px-4 py-2'>
                  <code className='bg-gray-200 px-2 py-1 rounded text-sm font-mono'>
                    2025-05-18T10:30:00+10:00
                  </code>
                </td>
              </tr>
              <tr>
                <td className='px-4 py-2 font-semibold'>relative</td>
                <td className='px-4 py-2'>
                  <code className='bg-gray-200 px-2 py-1 rounded text-sm font-mono'>
                    /1747510600?mode=relative
                  </code>
                </td>
                <td className='px-4 py-2'>Relative to now</td>
                <td className='px-4 py-2'>
                  <code className='bg-gray-200 px-2 py-1 rounded text-sm font-mono'>
                    in 2 days
                  </code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3
          className='text-xl font-semibold mt-6 mb-4'
          style={{ color: '#555' }}
        >
          Features
        </h3>
        <ul
          className='list-disc list-inside space-y-2'
          style={{ color: '#666' }}
        >
          <li>Convert any Unix timestamp to your local time</li>
          <li>View times in different timezones</li>
          <li>Multiple display modes for every use case</li>
          <li>Common timezones are grouped for easy access</li>
          <li>Automatic browser timezone detection</li>
        </ul>

        <h3
          className='text-xl font-semibold mt-6 mb-4'
          style={{ color: '#555' }}
        >
          Valid Timestamps
        </h3>
        <ul
          className='list-disc list-inside space-y-2'
          style={{ color: '#666' }}
        >
          <li>Positive integers</li>
          <li>Between 1970 and 2100</li>
        </ul>
      </div>
    </div>
  );
}
