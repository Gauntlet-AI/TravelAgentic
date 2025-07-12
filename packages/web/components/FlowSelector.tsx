/**
 * A/B Testing Flow Selector Component
 * Randomly assigns users to different flows and tracks metrics
 * Compares old search-based flow vs new itinerary-centric flow
 */

'use client';

import { useEffect, useState, ReactNode } from 'react';
import { featureFlags } from '@/lib/feature-flags';

export type FlowVariant = 'legacy' | 'itinerary' | 'auto';

interface FlowSelectorProps {
  children: ReactNode;
  legacyFlow: ReactNode;
  itineraryFlow: ReactNode;
  testName?: string;
  splitPercentage?: number; // 0-100, percentage for itinerary flow
  enableABTesting?: boolean;
}

interface ABTestSession {
  variant: FlowVariant;
  testName: string;
  startTime: number;
  userId?: string;
  sessionId: string;
}

/**
 * A/B Testing Flow Selector
 * Assigns users to different flows and tracks performance metrics
 */
export function FlowSelector({
  children,
  legacyFlow,
  itineraryFlow,
  testName = 'itinerary_flow_test',
  splitPercentage = 50,
  enableABTesting = true
}: FlowSelectorProps) {
  const [variant, setVariant] = useState<FlowVariant>('auto');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Determine flow variant
    const selectedVariant = determineFlowVariant(
      testName, 
      splitPercentage, 
      enableABTesting
    );
    
    setVariant(selectedVariant);
    setIsLoading(false);

    // Track A/B test assignment
    trackABTestAssignment(testName, selectedVariant);
  }, [testName, splitPercentage, enableABTesting]);

  // Show loading state while determining variant
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Render based on variant
  if (variant === 'legacy') {
    return <>{legacyFlow}</>;
  }
  
  if (variant === 'itinerary') {
    return <>{itineraryFlow}</>;
  }

  // Default fallback
  return <>{children}</>;
}

/**
 * Determine which flow variant to show based on A/B testing rules
 */
function determineFlowVariant(
  testName: string, 
  splitPercentage: number, 
  enableABTesting: boolean
): FlowVariant {
  // Check if A/B testing is disabled
  if (!enableABTesting) {
    return featureFlags.isEnabled('itineraryCentricFlow') ? 'itinerary' : 'legacy';
  }

  // Check for existing session assignment
  const existingSession = getABTestSession(testName);
  if (existingSession) {
    return existingSession.variant;
  }

  // Random assignment based on split percentage
  const randomValue = Math.random() * 100;
  const assignedVariant = randomValue < splitPercentage ? 'itinerary' : 'legacy';

  // Store session assignment
  storeABTestSession({
    variant: assignedVariant,
    testName,
    startTime: Date.now(),
    sessionId: generateSessionId()
  });

  return assignedVariant;
}

/**
 * Get existing A/B test session from localStorage
 */
function getABTestSession(testName: string): ABTestSession | null {
  try {
    const stored = localStorage.getItem(`ab_test_${testName}`);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Store A/B test session in localStorage
 */
function storeABTestSession(session: ABTestSession): void {
  try {
    localStorage.setItem(
      `ab_test_${session.testName}`, 
      JSON.stringify(session)
    );
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Track A/B test assignment for analytics
 */
function trackABTestAssignment(testName: string, variant: FlowVariant): void {
  // Send to analytics service (placeholder)
  console.log(`🧪 A/B Test Assignment:`, {
    test: testName,
    variant,
    timestamp: new Date().toISOString(),
    phase: featureFlags.getCurrentPhase()
  });

  // In production, this would send to your analytics service:
  // analytics.track('ab_test_assignment', { testName, variant });
}

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Hook for A/B test metrics tracking
 */
export function useABTestMetrics(testName: string) {
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    const session = getABTestSession(testName);
    if (!session) return;

    const event = {
      testName,
      variant: session.variant,
      event: eventName,
      timestamp: Date.now(),
      sessionDuration: Date.now() - session.startTime,
      properties
    };

    console.log(`📊 A/B Test Event:`, event);
    
    // In production, send to analytics:
    // analytics.track('ab_test_event', event);
  };

  const trackConversion = (type: string, value?: number) => {
    trackEvent('conversion', { type, value });
  };

  const trackFlowCompletion = (step: string) => {
    trackEvent('flow_completion', { step });
  };

  const trackError = (error: string, step?: string) => {
    trackEvent('error', { error, step });
  };

  return {
    trackEvent,
    trackConversion,
    trackFlowCompletion,
    trackError
  };
} 