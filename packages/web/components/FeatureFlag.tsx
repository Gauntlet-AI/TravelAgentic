/**
 * Feature Flag Wrapper Component
 * Conditionally renders content based on feature flags
 * Foundation for A/B testing and gradual rollouts
 */

'use client';

import { ReactNode } from 'react';
import { featureFlags, type FeatureFlags } from '@/lib/feature-flags';

interface FeatureFlagProps {
  feature: keyof FeatureFlags;
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

/**
 * Conditionally renders children based on feature flag status
 */
export function FeatureFlag({ 
  feature, 
  children, 
  fallback = null, 
  className 
}: FeatureFlagProps) {
  const isEnabled = featureFlags.isEnabled(feature);
  
  if (!isEnabled) {
    return fallback;
  }

  return (
    <div className={className}>
      {children}
    </div>
  );
}

/**
 * Renders content only if feature is enabled
 */
export function OnlyIf({ 
  feature, 
  children 
}: { 
  feature: keyof FeatureFlags; 
  children: ReactNode;
}) {
  return (
    <FeatureFlag feature={feature}>
      {children}
    </FeatureFlag>
  );
}

/**
 * Renders content only if feature is disabled
 */
export function OnlyIfNot({ 
  feature, 
  children 
}: { 
  feature: keyof FeatureFlags; 
  children: ReactNode;
}) {
  const isEnabled = featureFlags.isEnabled(feature);
  
  return !isEnabled ? <>{children}</> : null;
} 