import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Page from '@/app/page';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock getCurrentTimestamp to ensure consistent test results
vi.mock('@/lib/timestamp', () => ({
  getCurrentTimestamp: vi.fn(() => 1747510600),
}));

describe('Landing Page', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Page Structure', () => {
    it('should render the main heading', () => {
      render(<Page />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('SwapTZ');
    });

    it('should render the description', () => {
      render(<Page />);

      const description = screen.getByText(
        /Convert Unix timestamps to human-readable dates and times/
      );
      expect(description).toBeInTheDocument();
    });
  });

  describe('Quick Start Section', () => {
    it('should render quick start heading', () => {
      render(<Page />);

      const quickStartHeading = screen.getByRole('heading', {
        name: 'Quick Start',
      });
      expect(quickStartHeading).toBeInTheDocument();
    });

    it('should render all quick start buttons', () => {
      render(<Page />);

      const buttons = screen.getAllByRole('link');
      const quickStartButtons = buttons.filter(
        button =>
          button.textContent?.includes('View Current Time') ||
          button.textContent?.includes('Date Only') ||
          button.textContent?.includes('Compact') ||
          button.textContent?.includes('ISO') ||
          button.textContent?.includes('Relative')
      );

      expect(quickStartButtons).toHaveLength(5);
    });

    it('should have correct href attributes for quick start buttons', () => {
      render(<Page />);

      const currentTimeButton = screen.getByRole('link', {
        name: 'View Current Time',
      });
      const dateOnlyButton = screen.getByRole('link', { name: 'Date Only' });
      const compactButton = screen.getByRole('link', { name: 'Compact' });
      const isoButton = screen.getByRole('link', { name: 'ISO' });
      const relativeButton = screen.getByRole('link', { name: 'Relative' });

      expect(currentTimeButton).toHaveAttribute(
        'href',
        expect.stringMatching(/^\/\d+$/)
      );
      expect(dateOnlyButton).toHaveAttribute(
        'href',
        expect.stringMatching(/^\/\d+\?mode=date$/)
      );
      expect(compactButton).toHaveAttribute(
        'href',
        expect.stringMatching(/^\/\d+\?mode=compact$/)
      );
      expect(isoButton).toHaveAttribute(
        'href',
        expect.stringMatching(/^\/\d+\?mode=iso$/)
      );
      expect(relativeButton).toHaveAttribute(
        'href',
        expect.stringMatching(/^\/\d+\?mode=relative$/)
      );
    });
  });

  describe('How to Use Section', () => {
    it('should render how to use heading', () => {
      render(<Page />);

      const howToUseHeading = screen.getByRole('heading', {
        name: 'How to Use',
      });
      expect(howToUseHeading).toBeInTheDocument();
    });

    it('should render URL examples', () => {
      render(<Page />);

      const urlExamples = screen.getAllByText(
        /https:\/\/example\.com\/1747510600/
      );
      expect(urlExamples.length).toBeGreaterThan(0);
    });

    it('should render mode parameter explanation', () => {
      render(<Page />);

      const modeExplanation = screen.getByText(/To change the display mode/);
      expect(modeExplanation).toBeInTheDocument();

      const modeCode = screen.getByText('?mode=MODE');
      expect(modeCode).toBeInTheDocument();
    });
  });

  describe('Display Modes Table', () => {
    it('should render display modes heading', () => {
      render(<Page />);

      const tableHeading = screen.getByRole('heading', {
        name: 'Display Modes',
      });
      expect(tableHeading).toBeInTheDocument();
    });

    it('should render table with proper structure', () => {
      render(<Page />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      // Check for table headers
      expect(
        screen.getByRole('columnheader', { name: 'Mode' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: 'URL Example' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: 'Description' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('columnheader', { name: 'Output Example' })
      ).toBeInTheDocument();
    });

    it('should render all display mode rows', () => {
      render(<Page />);

      const expectedModes = ['Default', 'date', 'compact', 'iso', 'relative'];

      expectedModes.forEach(mode => {
        const modeCell = screen.getByText(mode);
        expect(modeCell).toBeInTheDocument();
      });
    });

    it('should have proper table accessibility', () => {
      render(<Page />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      const headers = screen.getAllByRole('columnheader');
      const rows = screen.getAllByRole('row');

      expect(headers).toHaveLength(4);
      expect(rows).toHaveLength(6); // 1 header + 5 data rows
    });
  });

  describe('Features Section', () => {
    it('should render features heading', () => {
      render(<Page />);

      const featuresHeading = screen.getByRole('heading', { name: 'Features' });
      expect(featuresHeading).toBeInTheDocument();
    });

    it('should render all feature list items', () => {
      render(<Page />);

      const listItems = screen.getAllByRole('listitem');
      expect(listItems.length).toBe(7); // 5 features + 2 valid timestamp criteria

      const expectedFeatures = [
        'Convert any Unix timestamp to your local time',
        'View times in different timezones',
        'Multiple display modes for every use case',
        'Common timezones are grouped for easy access',
        'Automatic browser timezone detection',
      ];

      expectedFeatures.forEach(feature => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
    });
  });

  describe('Valid Timestamps Section', () => {
    it('should render valid timestamps heading', () => {
      render(<Page />);

      const validTimestampsHeading = screen.getByRole('heading', {
        name: 'Valid Timestamps',
      });
      expect(validTimestampsHeading).toBeInTheDocument();
    });

    it('should render valid timestamp criteria', () => {
      render(<Page />);

      const criteria = ['Positive integers', 'Between 1970 and 2100'];

      criteria.forEach(criterion => {
        expect(screen.getByText(criterion)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<Page />);

      const h1 = screen.getByRole('heading', { level: 1 });
      const h2s = screen.getAllByRole('heading', { level: 2 });
      const h3s = screen.getAllByRole('heading', { level: 3 });

      expect(h1).toHaveTextContent('SwapTZ');
      expect(h2s).toHaveLength(2); // Quick Start, How to Use
      expect(h3s).toHaveLength(3); // Display Modes, Features, Valid Timestamps
    });

    it('should have proper link accessibility', () => {
      render(<Page />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
        expect(link.textContent).toBeTruthy();
      });
    });

    it('should have proper table accessibility', () => {
      render(<Page />);

      expect(screen.getByRole('table')).toBeInTheDocument();

      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(4);
    });
  });

  describe('Performance and Serverless Considerations', () => {
    it('should render without errors in serverless environment', () => {
      // Mock serverless environment
      const originalConsoleError = console.error;
      console.error = vi.fn();

      render(<Page />);

      expect(console.error).not.toHaveBeenCalled();
      console.error = originalConsoleError;
    });

    it('should handle missing browser APIs gracefully', () => {
      // Mock missing Intl API
      const originalIntl = global.Intl;
      // @ts-expect-error - Intentionally setting to undefined for testing
      global.Intl = undefined;

      expect(() => render(<Page />)).not.toThrow();

      global.Intl = originalIntl;
    });
  });

  describe('User Interactions', () => {
    it('should allow clicking on quick start buttons', async () => {
      render(<Page />);

      const currentTimeButton = screen.getByRole('link', {
        name: 'View Current Time',
      });

      expect(currentTimeButton).toBeInTheDocument();
      expect(currentTimeButton).toHaveAttribute('href', '/1747510600');

      // Test that the link is clickable (in real app, this would navigate)
      await user.click(currentTimeButton);
      // No error should be thrown
    });

    it('should have proper focus management', () => {
      render(<Page />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toBeInTheDocument();
        // Links should be focusable
        expect(link.tagName).toBe('A');
      });
    });
  });

  describe('Content Validation', () => {
    it('should have consistent styling classes', () => {
      render(<Page />);

      const container = screen.getByText('SwapTZ').closest('.container');
      expect(container).toBeInTheDocument();

      const buttons = screen.getAllByRole('link');
      buttons.forEach(button => {
        expect(button).toHaveClass('button');
      });
    });

    it('should have proper code formatting', () => {
      render(<Page />);

      const codeElements = screen.getAllByText(/https:\/\/example\.com/);
      codeElements.forEach(code => {
        expect(code).toHaveClass(
          'bg-gray-200',
          'px-3',
          'py-1',
          'rounded',
          'text-sm',
          'font-mono'
        );
      });
    });
  });
});
