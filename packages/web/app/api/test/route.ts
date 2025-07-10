import { NextResponse } from 'next/server';

/**
 * Simple test endpoint to verify server is running
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'TravelAgentic API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mockMode: process.env.USE_MOCK_APIS === 'true',
    phase: process.env.DEVELOPMENT_PHASE || '1',
  });
} 