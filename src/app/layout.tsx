import type { Metadata } from 'next';
import './globals.css';

// Performance optimization: Preload critical resources
const preloadLinks = [
  { href: '/favicon.ico', as: 'image', type: 'image/x-icon' },
];

export const metadata: Metadata = {
  title: 'SwapTZ - Convert Unix Timestamps',
  description:
    'Convert Unix timestamps to human-readable dates and times in any timezone, with multiple display modes for every use case.',
  keywords: [
    'unix timestamp',
    'timestamp converter',
    'timezone converter',
    'date converter',
    'unix time',
    'epoch time',
    'time conversion',
    'date time',
  ],
  authors: [{ name: 'SwapTZ' }],
  creator: 'SwapTZ',
  publisher: 'SwapTZ',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: 'SwapTZ - Convert Unix Timestamps',
    description:
      'Convert Unix timestamps to human-readable dates and times in any timezone, with multiple display modes for every use case.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'SwapTZ - Convert Unix Timestamps',
    description:
      'Convert Unix timestamps to human-readable dates and times in any timezone, with multiple display modes for every use case.',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#2196f3',
  colorScheme: 'light',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' dir='ltr'>
      <head>
        <meta charSet='utf-8' />
        <meta name='format-detection' content='telephone=no' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content='SwapTZ' />
        <meta name='application-name' content='SwapTZ' />
        <meta name='msapplication-TileColor' content='#2196f3' />
        <meta name='msapplication-config' content='/browserconfig.xml' />

        {/* Performance optimizations - Add preconnect/dns-prefetch for external resources as needed */}

        {/* Preload critical resources */}
        {preloadLinks.map(link => (
          <link
            key={link.href}
            rel='preload'
            href={link.href}
            as={link.as}
            type={link.type}
          />
        ))}

        {/* Security headers */}
        <meta httpEquiv='X-Content-Type-Options' content='nosniff' />
        <meta httpEquiv='X-Frame-Options' content='DENY' />
        <meta httpEquiv='X-XSS-Protection' content='1; mode=block' />
        <meta
          httpEquiv='Referrer-Policy'
          content='strict-origin-when-cross-origin'
        />
      </head>
      <body>
        <div id='root' role='main'>
          {children}
        </div>

        {/* Error boundary fallback for client-side errors */}
        <noscript>
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              margin: '2rem',
            }}
          >
            <h2>JavaScript Required</h2>
            <p>
              This application requires JavaScript to function properly. Please
              enable JavaScript in your browser settings.
            </p>
          </div>
        </noscript>
      </body>
    </html>
  );
}
