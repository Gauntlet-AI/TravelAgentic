/**
 * Itinerary Layout Component
 * Provides a clean, focused layout for the itinerary-centric flow
 */

import Link from 'next/link';
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ItineraryLayoutProps {
  children: ReactNode;
}

export default function ItineraryLayout({ children }: ItineraryLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold text-gray-900">
                TravelAgentic
              </Link>
              <div className="hidden sm:block h-6 w-px bg-gray-300"></div>
              <div className="hidden sm:block text-sm text-gray-500">
                Itinerary Builder
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  <span className="hidden sm:inline">Back to Home</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center space-x-8">
              {/* Step 1: Plan */}
              <div className="flex items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                  1
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">
                  Plan
                </span>
              </div>

              <div className="h-px w-16 bg-gray-300"></div>

              {/* Step 2: Build */}
              <div className="flex items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-gray-600">
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">
                  Build
                </span>
              </div>

              <div className="h-px w-16 bg-gray-300"></div>

              {/* Step 3: Review */}
              <div className="flex items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-gray-600">
                  3
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">
                  Review
                </span>
              </div>

              <div className="h-px w-16 bg-gray-300"></div>

              {/* Step 4: Book */}
              <div className="flex items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-gray-600">
                  4
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">
                  Book
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