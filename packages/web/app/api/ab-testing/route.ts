/**
 * A/B Testing API Endpoint
 * Manages test configurations, tracks events, and provides analytics
 * Supports Phase 6 A/B testing framework
 */

import { NextRequest, NextResponse } from 'next/server';

// Types for A/B testing
interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  variants: ABTestVariant[];
  trafficSplit: number; // 0-100 percentage for variant B
  startDate: string;
  endDate?: string;
  targetMetrics: string[];
  createdAt: string;
  updatedAt: string;
}

interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-100 percentage of traffic
}

interface ABTestEvent {
  testId: string;
  sessionId: string;
  variant: string;
  event: string;
  timestamp: number;
  properties?: Record<string, any>;
}

interface ABTestMetrics {
  testId: string;
  variant: string;
  totalSessions: number;
  conversions: number;
  conversionRate: number;
  averageSessionDuration: number;
  bounceRate: number;
  events: Record<string, number>;
}

// In-memory storage for demo (use database in production)
const abTests: Map<string, ABTest> = new Map();
const abTestEvents: ABTestEvent[] = [];

// Initialize with default test
initializeDefaultTest();

/**
 * GET /api/ab-testing
 * Retrieve A/B tests and analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const testId = searchParams.get('testId');

    switch (action) {
      case 'list':
        return NextResponse.json({
          success: true,
          tests: Array.from(abTests.values())
        });

      case 'metrics':
        if (!testId) {
          return NextResponse.json(
            { error: 'testId required for metrics' },
            { status: 400 }
          );
        }
        const metrics = calculateTestMetrics(testId);
        return NextResponse.json({
          success: true,
          metrics
        });

      case 'config':
        if (!testId) {
          return NextResponse.json(
            { error: 'testId required for config' },
            { status: 400 }
          );
        }
        const test = abTests.get(testId);
        if (!test) {
          return NextResponse.json(
            { error: 'Test not found' },
            { status: 404 }
          );
        }
        return NextResponse.json({
          success: true,
          test
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('A/B testing GET error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ab-testing
 * Track events or create/update tests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'track':
        return handleTrackEvent(body);

      case 'create':
        return handleCreateTest(body);

      case 'update':
        return handleUpdateTest(body);

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('A/B testing POST error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * Handle event tracking
 */
async function handleTrackEvent(body: any) {
  const { testId, sessionId, variant, event, properties } = body;

  if (!testId || !sessionId || !variant || !event) {
    return NextResponse.json(
      { error: 'Missing required fields: testId, sessionId, variant, event' },
      { status: 400 }
    );
  }

  const eventData: ABTestEvent = {
    testId,
    sessionId,
    variant,
    event,
    timestamp: Date.now(),
    properties
  };

  abTestEvents.push(eventData);

  console.log(`📊 A/B Test Event Tracked:`, eventData);

  return NextResponse.json({
    success: true,
    message: 'Event tracked successfully'
  });
}

/**
 * Handle test creation
 */
async function handleCreateTest(body: any) {
  const { name, description, variants, trafficSplit, targetMetrics } = body;

  if (!name || !variants || !Array.isArray(variants)) {
    return NextResponse.json(
      { error: 'Missing required fields: name, variants' },
      { status: 400 }
    );
  }

  const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();

  const test: ABTest = {
    id: testId,
    name,
    description: description || '',
    status: 'draft',
    variants,
    trafficSplit: trafficSplit || 50,
    startDate: timestamp,
    targetMetrics: targetMetrics || ['conversion', 'completion_rate'],
    createdAt: timestamp,
    updatedAt: timestamp
  };

  abTests.set(testId, test);

  return NextResponse.json({
    success: true,
    test
  });
}

/**
 * Handle test updates
 */
async function handleUpdateTest(body: any) {
  const { testId, ...updates } = body;

  if (!testId) {
    return NextResponse.json(
      { error: 'testId required' },
      { status: 400 }
    );
  }

  const test = abTests.get(testId);
  if (!test) {
    return NextResponse.json(
      { error: 'Test not found' },
      { status: 404 }
    );
  }

  const updatedTest = {
    ...test,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  abTests.set(testId, updatedTest);

  return NextResponse.json({
    success: true,
    test: updatedTest
  });
}

/**
 * Calculate metrics for a specific test
 */
function calculateTestMetrics(testId: string): ABTestMetrics[] {
  const testEvents = abTestEvents.filter(event => event.testId === testId);
  const variants = [...new Set(testEvents.map(event => event.variant))];

  return variants.map(variant => {
    const variantEvents = testEvents.filter(event => event.variant === variant);
    const sessions = [...new Set(variantEvents.map(event => event.sessionId))];
    
    // Calculate session durations
    const sessionDurations = sessions.map(sessionId => {
      const sessionEvents = variantEvents.filter(event => event.sessionId === sessionId);
      if (sessionEvents.length < 2) return 0;
      
      const start = Math.min(...sessionEvents.map(event => event.timestamp));
      const end = Math.max(...sessionEvents.map(event => event.timestamp));
      return end - start;
    });

    // Count conversions (completion events)
    const conversions = variantEvents.filter(event => 
      event.event === 'conversion' || event.event === 'flow_completion'
    ).length;

    // Count bounces (sessions with only one event)
    const bounces = sessions.filter(sessionId => {
      const sessionEventCount = variantEvents.filter(event => event.sessionId === sessionId).length;
      return sessionEventCount === 1;
    }).length;

    // Event counts
    const eventCounts: Record<string, number> = {};
    variantEvents.forEach(event => {
      eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;
    });

    return {
      testId,
      variant,
      totalSessions: sessions.length,
      conversions,
      conversionRate: sessions.length > 0 ? (conversions / sessions.length) * 100 : 0,
      averageSessionDuration: sessionDurations.length > 0 
        ? sessionDurations.reduce((sum, duration) => sum + duration, 0) / sessionDurations.length 
        : 0,
      bounceRate: sessions.length > 0 ? (bounces / sessions.length) * 100 : 0,
      events: eventCounts
    };
  });
}

/**
 * Initialize default A/B test for itinerary flow comparison
 */
function initializeDefaultTest() {
  const defaultTest: ABTest = {
    id: 'itinerary_flow_test',
    name: 'Itinerary-Centric vs Legacy Flow',
    description: 'Compare the new AI-powered itinerary flow against the classic search-based flow',
    status: 'active',
    variants: [
      {
        id: 'legacy',
        name: 'Legacy Search Flow',
        description: 'Traditional search-and-compare experience',
        weight: 50
      },
      {
        id: 'itinerary',
        name: 'AI Itinerary Flow',
        description: 'New AI-powered itinerary building experience',
        weight: 50
      }
    ],
    trafficSplit: 50,
    startDate: new Date().toISOString(),
    targetMetrics: ['conversion', 'completion_rate', 'user_satisfaction', 'time_to_complete'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  abTests.set(defaultTest.id, defaultTest);
}

/**
 * DELETE /api/ab-testing
 * Delete a test
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');

    if (!testId) {
      return NextResponse.json(
        { error: 'testId required' },
        { status: 400 }
      );
    }

    const deleted = abTests.delete(testId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    // Clean up events for this test
    const eventsToKeep = abTestEvents.filter(event => event.testId !== testId);
    abTestEvents.length = 0;
    abTestEvents.push(...eventsToKeep);

    return NextResponse.json({
      success: true,
      message: 'Test deleted successfully'
    });
  } catch (error) {
    console.error('A/B testing DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete test' },
      { status: 500 }
    );
  }
} 