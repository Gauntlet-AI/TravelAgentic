import { ReactNode } from 'react'
import Link from 'next/link'

/**
 * Booking layout component
 * Provides a step-by-step booking flow layout
 */
export default function BookingLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-gray-900">
              TravelAgentic
            </Link>
            <div className="text-sm text-gray-500">
              Booking Process
            </div>
          </div>
        </div>
      </header>

      {/* Booking Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center space-x-8">
              {/* Step 1: Search */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-medium">
                  1
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">Search</span>
              </div>
              
              <div className="h-px w-16 bg-gray-300"></div>
              
              {/* Step 2: Select */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-600 rounded-full text-sm font-medium">
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">Select</span>
              </div>
              
              <div className="h-px w-16 bg-gray-300"></div>
              
              {/* Step 3: Checkout */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-300 text-gray-600 rounded-full text-sm font-medium">
                  3
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
} 