/**
 * Authentication and User Types
 * Type definitions for authentication flow and user data
 */

import type { User } from '@supabase/supabase-js';

export interface AuthUser extends User {
  full_name?: string;
  avatar_url?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
  message?: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
} 