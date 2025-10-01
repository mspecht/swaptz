import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RootLayout from '@/app/layout';

// Mock CSS imports
vi.mock('@/app/globals.css', () => ({}));

describe('RootLayout', () => {
  it('should render children correctly', () => {
    const testContent = 'Test Content';

    render(
      <RootLayout>
        <div>{testContent}</div>
      </RootLayout>
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('should have proper HTML structure', () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    const html = document.documentElement;
    const body = document.body;
    const main = screen.getByRole('main');

    expect(html).toHaveAttribute('lang', 'en');
    expect(html).toHaveAttribute('dir', 'ltr');
    expect(body).toBeInTheDocument();
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('id', 'root');
  });

  it('should include security headers', () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    const head = document.head;
    const securityHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection',
      'Referrer-Policy',
    ];

    securityHeaders.forEach(header => {
      const meta = head.querySelector(`meta[http-equiv="${header}"]`);
      expect(meta).toBeInTheDocument();
    });
  });

  it('should include mobile app meta tags', () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    const head = document.head;
    const mobileTags = [
      'format-detection',
      'mobile-web-app-capable',
      'apple-mobile-web-app-capable',
      'apple-mobile-web-app-title',
      'application-name',
    ];

    mobileTags.forEach(tag => {
      const meta = head.querySelector(`meta[name="${tag}"]`);
      expect(meta).toBeInTheDocument();
    });
  });

  it('should include noscript fallback', () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    const noscript = document.querySelector('noscript');
    expect(noscript).toBeInTheDocument();
  });

  it('should preload critical resources', () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    const head = document.head;
    const preloadLink = head.querySelector('link[rel="preload"]');
    expect(preloadLink).toBeInTheDocument();
    expect(preloadLink).toHaveAttribute('href', '/favicon.ico');
    expect(preloadLink).toHaveAttribute('as', 'image');
  });
});
