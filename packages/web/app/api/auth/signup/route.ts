/**
 * User Registration API Route
 * Handles new user signup with email/password authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { signUpUser, upsertUserProfile } from '@/lib/auth/helpers';

// Validation schema for signup data
const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
});

/**
 * POST /api/auth/signup
 * Creates a new user account
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request data
    const validation = signUpSchema.safeParse(body);
    
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

    const { firstName, lastName, email, password } = validation.data;

    // Attempt to create the user
    const result = await signUpUser({
      firstName,
      lastName,
      email,
      password,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    // If user was created and we have a session, create the profile
    if (result.user) {
      await upsertUserProfile(result.user);
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      requiresConfirmation: !result.user, // true if user needs to confirm email
    });

  } catch (error) {
    console.error('Signup API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred during signup',
      },
      { status: 500 }
    );
  }
} 