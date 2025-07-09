import { ReactNode } from 'react'
import Link from 'next/link'

/**
 * Dashboard layout component
 * Provides sidebar navigation for user dashboard pages
 */
export default function DashboardLayout({
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
            <nav className="flex space-x-4">
              <Link 
                href="/bookings" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
              >
                My Bookings
              </Link>
              <Link 
                href="/preferences" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
              >
                Preferences
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <nav className="space-y-2">
                <Link 
                  href="/bookings" 
                  className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                >
                  <span>📅</span>
                  <span className="ml-3">My Bookings</span>
                </Link>
                <Link 
                  href="/preferences" 
                  className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md"
                >
                  <span>⚙️</span>
                  <span className="ml-3">Preferences</span>
                </Link>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="lg:col-span-3">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
} 