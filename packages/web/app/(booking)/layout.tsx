import Link from 'next/link';
import { ReactNode } from 'react';

/**
 * Booking layout component
 * Provides a step-by-step booking flow layout
 */
export default function BookingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900">
              TravelAgentic
            </Link>
            <div className="text-sm text-gray-500">Booking Process</div>
          </div>
        </div>
      </header>

      {/* Booking Progress Steps */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center space-x-8">
              {/* Step 1: Search */}
              <div className="flex items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                  1
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">
                  Search
                </span>
              </div>

              <div className="h-px w-16 bg-gray-300"></div>

              {/* Step 2: Select */}
              <div className="flex items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-gray-600">
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">
                  Select
                </span>
              </div>

              <div className="h-px w-16 bg-gray-300"></div>

              {/* Step 3: Checkout */}
              <div className="flex items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-gray-600">
                  3
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">
                  Checkout
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
