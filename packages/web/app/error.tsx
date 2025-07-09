'use client';

import { useEffect } from 'react';

/**
 * Global error boundary component
 * Handles critical application errors with manual booking fallback
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to monitoring service
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="mx-auto max-w-lg rounded-lg bg-white p-8 text-center shadow-xl">
            {/* Error Icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-10 w-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            {/* Error Message */}
            <h1 className="mb-4 text-2xl font-bold text-gray-900">
              Something Went Wrong
            </h1>

            <p className="mb-8 text-gray-600">
              We're experiencing technical difficulties with our AI-powered
              travel platform. Don't worry - we have fallback options to help
              you plan your trip.
            </p>

            {/* Recovery Actions */}
            <div className="mb-8 space-y-4">
              <button
                onClick={reset}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 text-lg font-medium text-white transition-colors hover:bg-blue-700"
              >
                Try Again
              </button>

              <button
                onClick={() => (window.location.href = '/')}
                className="w-full rounded-lg bg-gray-200 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-300"
              >
                Reload Application
              </button>
            </div>

            {/* Manual Booking Fallback */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
              <h3 className="mb-3 text-lg font-semibold text-blue-900">
                Need to Book Right Away?
              </h3>

              <p className="mb-4 text-sm text-blue-800">
                Our 5-layer fallback system ensures you can always book your
                travel:
              </p>

              <div className="mb-4 space-y-2 text-sm text-blue-700">
                <div className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-blue-400"></span>
                  Manual search assistance
                </div>
                <div className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-blue-400"></span>
                  Phone booking support
                </div>
                <div className="flex items-center">
                  <span className="mr-2 h-2 w-2 rounded-full bg-blue-400"></span>
                  Direct airline/hotel booking
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                  Call Support: 1-800-TRAVEL
                </button>
                <button className="flex-1 rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50">
                  Manual Search
                </button>
              </div>
            </div>

            {/* Error Details (Development) */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 overflow-auto rounded bg-gray-100 p-3 text-xs">
                  {error.message}
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
