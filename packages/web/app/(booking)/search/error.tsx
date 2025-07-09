'use client'

import { useEffect } from 'react'

/**
 * Search error boundary component
 * Handles errors during travel search with recovery options
 */
export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to monitoring service
    console.error('Search error:', error)
  }, [error])

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg 
            className="w-8 h-8 text-red-600" 
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
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Search Temporarily Unavailable
        </h2>
        
        <p className="text-gray-600 mb-6">
          We're having trouble searching for travel options right now. This might be due to:
        </p>

        <ul className="text-sm text-gray-500 mb-6 space-y-1">
          <li>• High demand on travel booking sites</li>
          <li>• Temporary API connectivity issues</li>
          <li>• Your search criteria needs adjustment</li>
        </ul>

        {/* Recovery Actions */}
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Try Search Again
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Home
          </button>
        </div>

        {/* Fallback Options */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">
            Alternative Options:
          </p>
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
  )
} 