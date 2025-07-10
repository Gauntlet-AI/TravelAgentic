import { ReactNode } from 'react';

/**
 * Authentication layout component
 * Provides a minimal wrapper for login and signup pages
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
