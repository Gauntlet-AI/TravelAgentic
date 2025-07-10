/**
 * Authentication Helper Functions
 * Utilities for user authentication and session management
 */

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { AuthUser, SignUpData, SignInData, AuthResponse, UserProfile } from './types';

/**
 * Signs up a new user with email and password
 * Creates both auth user and public user profile
 */
export async function signUpUser(data: SignUpData): Promise<AuthResponse> {
  try {
    const { firstName, lastName, email, password } = data;
    const fullName = `${firstName} ${lastName}`.trim();

    const supabaseServer = await createSupabaseServerClient();

    // Create the auth user
    const { data: authData, error: authError } = await supabaseServer.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      return {
        success: false,
        error: authError.message,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Failed to create user account',
      };
    }

    // Check if user needs email confirmation
    if (!authData.session) {
      return {
        success: true,
        message: 'Please check your email to confirm your account',
      };
    }

    return {
      success: true,
      user: authData.user as AuthUser,
      message: 'Account created successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Signs in a user with email and password
 */
export async function signInUser(data: SignInData): Promise<AuthResponse> {
  try {
    const { email, password } = data;

    const supabaseServer = await createSupabaseServerClient();

    const { data: authData, error: authError } = await supabaseServer.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return {
        success: false,
        error: authError.message,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Failed to sign in',
      };
    }

    return {
      success: true,
      user: authData.user as AuthUser,
      message: 'Signed in successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Signs out the current user
 */
export async function signOutUser(): Promise<AuthResponse> {
  try {
    const supabaseServer = await createSupabaseServerClient();
    const { error } = await supabaseServer.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Signed out successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Gets the current user from the server side
 * Used in server components and API routes
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabaseServer = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabaseServer.auth.getUser();

    return user as AuthUser | null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Gets the user profile from the public.users table
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const supabaseServer = await createSupabaseServerClient();
    const { data, error } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Creates or updates a user profile in the public.users table
 * This is typically called after successful authentication
 */
export async function upsertUserProfile(user: AuthUser): Promise<boolean> {
  try {
    const supabaseServer = await createSupabaseServerClient();
    const { error } = await supabaseServer
      .from('users')
      .upsert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting user profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error upserting user profile:', error);
    return false;
  }
} 