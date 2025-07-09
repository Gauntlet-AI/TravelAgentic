import Link from 'next/link';
import { ReactNode } from 'react';

/**
 * Dashboard layout component
 * Provides sidebar navigation for user dashboard pages
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900">
              TravelAgentic
            </Link>
            <nav className="flex space-x-4">
              <Link
                href="/bookings"
                className="rounded-md px-3 py-2 text-gray-700 hover:text-blue-600"
              >
                My Bookings
              </Link>
              <Link
                href="/preferences"
                className="rounded-md px-3 py-2 text-gray-700 hover:text-blue-600"
              >
                Preferences
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow">
              <nav className="space-y-2">
                <Link
                  href="/bookings"
                  className="flex items-center rounded-md px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                >
                  <span>📅</span>
                  <span className="ml-3">My Bookings</span>
                </Link>
                <Link
                  href="/preferences"
                  className="flex items-center rounded-md px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                >
                  <span>⚙️</span>
                  <span className="ml-3">Preferences</span>
                </Link>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="lg:col-span-3">{children}</main>
        </div>
      </div>
    </div>
  );
}
