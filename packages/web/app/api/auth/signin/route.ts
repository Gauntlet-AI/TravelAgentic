/**
 * User Login API Route
 * Handles user authentication with email/password
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { signInUser, upsertUserProfile } from '@/lib/auth/helpers';

// Validation schema for signin data
const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * POST /api/auth/signin
 * Authenticates an existing user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request data
    const validation = signInSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input data',
          details: validation.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Attempt to sign in the user
    const result = await signInUser({ email, password });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 401 }
      );
    }

    // Update user profile if signin was successful
    if (result.user) {
      await upsertUserProfile(result.user);
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      user: result.user ? {
        id: result.user.id,
        email: result.user.email,
        full_name: result.user.user_metadata?.full_name,
      } : null,
    });

  } catch (error) {
    console.error('Signin API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred during signin',
      },
      { status: 500 }
    );
  }
} 