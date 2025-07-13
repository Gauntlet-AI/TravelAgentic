/**
 * Authentication Context Provider
 * Manages user authentication state across the application
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

/**
 * Hook to access authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Authentication Provider Component
 * Wraps the app to provide authentication state
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: any;

    // Add a small delay to ensure hydration is complete
    const timer = setTimeout(async () => {
      try {
        // Get initial session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        // Listen for auth changes
        const {
          data: { subscription: authSubscription },
        } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
          setUser(session?.user ?? null);

          // Handle redirect after sign in – only redirect if we're not already on the welcome page
          if (event === 'SIGNED_IN' && session?.user) {
            if (window.location.pathname !== '/welcome') {
              window.location.href = '/welcome';
            }
          }

          // Handle redirect after sign out – only redirect if we're not on the landing page already
          if (event === 'SIGNED_OUT') {
            if (window.location.pathname !== '/new-landing-page') {
              window.location.href = '/new-landing-page';
            }
          }
        });

        subscription = authSubscription;
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signOut = async () => {
    try {
      // Call Supabase client-side signOut directly
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      
      // The auth state change listener will handle the redirect
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signOut,
  };

  // Prevent hydration errors by showing loading state until auth is determined
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'white'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 