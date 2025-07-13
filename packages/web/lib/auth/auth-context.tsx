/**
 * Authentication Context Provider
 * Manages user authentication state across the application
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthChangeEvent, Session, Subscription } from '@supabase/supabase-js';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Reference to the auth subscription so we can clean it up on unmount
    let authListener: Subscription | null = null;

    /**
     * Initialize auth state: get the current session and subscribe to future changes
     */
    const initAuth = async () => {
      try {
        // 1. Get the initial session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        // 2. Listen for auth state changes
        const {
          data: { subscription: authSubscription },
        } = supabase.auth.onAuthStateChange(
          async (event: AuthChangeEvent, newSession: Session | null) => {
            setUser(newSession?.user ?? null);

            // Redirect after sign-in
            if (event === 'SIGNED_IN' && newSession?.user) {
              if (window.location.pathname !== '/welcome') {
                window.location.href = '/welcome';
              }
            }

            // Redirect after sign-out
            if (event === 'SIGNED_OUT') {
              if (window.location.pathname !== '/new-landing-page') {
                window.location.href = '/new-landing-page';
              }
            }
          },
        );

        authListener = authSubscription;
      } catch (error) {
        console.error('Error initializing authentication:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Cleanup subscription on unmount
    return () => {
      authListener?.unsubscribe();
    };
  }, [mounted]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
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

  // Prevent hydration errors by not rendering anything until mounted
  if (!mounted) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 