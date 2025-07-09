import { ReactNode } from 'react'

/**
 * Authentication layout component
 * Provides a clean, centered layout for login and signup pages
 */
export default function AuthLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TravelAgentic</h1>
          <p className="text-gray-600">AI-Powered Travel Planning</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8">
          {children}
        </div>
      </div>
    </div>
  )
} 