'use client';

import { useEffect } from 'react';

/**
 * Search error boundary component
 * Handles errors during travel search with recovery options
 */
export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to monitoring service
    console.error('Search error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="mx-auto max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        {/* Error Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
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
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          Search Temporarily Unavailable
        </h2>

        <p className="mb-6 text-gray-600">
          We're having trouble searching for travel options right now. This
          might be due to:
        </p>

        <ul className="mb-6 space-y-1 text-sm text-gray-500">
          <li>• High demand on travel booking sites</li>
          <li>• Temporary API connectivity issues</li>
          <li>• Your search criteria needs adjustment</li>
        </ul>

        {/* Recovery Actions */}
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Try Search Again
          </button>

          <button
            onClick={() => (window.location.href = '/')}
            className="w-full rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
          >
            Back to Home
          </button>
        </div>

        {/* Fallback Options */}
        <div className="mt-6 border-t border-gray-200 pt-6">
          <p className="mb-3 text-sm text-gray-500">Alternative Options:</p>
          <div className="flex justify-center space-x-4 text-sm">
            <button className="text-blue-600 hover:text-blue-800">
              Manual Search
            </button>
            <span className="text-gray-300">|</span>
            <button className="text-blue-600 hover:text-blue-800">
              Call Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
