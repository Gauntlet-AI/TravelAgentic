/**
 * User Logout API Route
 * Handles user signout and session cleanup
 */

import { NextRequest, NextResponse } from 'next/server';
import { signOutUser } from '@/lib/auth/helpers';

/**
 * POST /api/auth/signout
 * Signs out the current user and clears the session
 */
export async function POST(request: NextRequest) {
  try {
    // Attempt to sign out the user
    const result = await signOutUser();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });

  } catch (error) {
    console.error('Signout API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred during signout',
      },
      { status: 500 }
    );
  }
} 