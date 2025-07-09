import { ReactNode } from 'react';

/**
 * Authentication layout component
 * Provides a clean, centered layout for login and signup pages
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            TravelAgentic
          </h1>
          <p className="text-gray-600">AI-Powered Travel Planning</p>
        </div>
        <div className="rounded-xl bg-white p-8 shadow-lg">{children}</div>
      </div>
    </div>
  );
}
