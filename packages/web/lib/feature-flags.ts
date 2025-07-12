/**
 * Feature Flags for TravelAgentic
 * Manages feature toggles for gradual rollout and A/B testing
 */

export interface FeatureFlags {
  itineraryCentricFlow: boolean;
  enhancedTravelForm: boolean;
  streamingItineraryBuilder: boolean;
  realTimeProgressUpdates: boolean;
  activityPreferencesFlow: boolean;
  naturalLanguageModification: boolean;
  voiceCallFallback: boolean;
  browserAutomationFallback: boolean;
  pdfDocumentGeneration: boolean;
  bookingOrchestration: boolean;
  automationLevels: boolean;
  // Phase 6 features
  abTestingFramework: boolean;
  mobileOptimization: boolean;
  performanceMonitoring: boolean;
  legacyFlowComparison: boolean;
}

// Default feature flags configuration
const DEFAULT_FLAGS: FeatureFlags = {
  itineraryCentricFlow: false, // Phase 1 feature
  enhancedTravelForm: false, // Phase 1 feature
  streamingItineraryBuilder: false, // Phase 2 feature
  realTimeProgressUpdates: false, // Phase 2 feature
  activityPreferencesFlow: false, // Phase 3 feature
  naturalLanguageModification: false, // Phase 4 feature
  voiceCallFallback: false, // Phase 3 feature (Phase 6 in business tier)
  browserAutomationFallback: false, // Phase 2 feature
  pdfDocumentGeneration: false, // Phase 5 feature
  bookingOrchestration: false, // Phase 5 feature
  automationLevels: false, // Phase 1 feature
  // Phase 6 features
  abTestingFramework: false, // Phase 6 feature
  mobileOptimization: false, // Phase 6 feature
  performanceMonitoring: false, // Phase 6 feature
  legacyFlowComparison: false, // Phase 6 feature
};

// Phase-based feature flag presets
const PHASE_PRESETS: Record<string, Partial<FeatureFlags>> = {
  'phase-1': {
    itineraryCentricFlow: true,
    enhancedTravelForm: true,
    automationLevels: true,
  },
  'phase-2': {
    itineraryCentricFlow: true,
    enhancedTravelForm: true,
    streamingItineraryBuilder: true,
    realTimeProgressUpdates: true,
    browserAutomationFallback: true,
    automationLevels: true,
  },
  'phase-3': {
    itineraryCentricFlow: true,
    enhancedTravelForm: true,
    streamingItineraryBuilder: true,
    realTimeProgressUpdates: true,
    browserAutomationFallback: true,
    activityPreferencesFlow: true,
    voiceCallFallback: true,
    automationLevels: true,
  },
  'phase-4': {
    itineraryCentricFlow: true,
    enhancedTravelForm: true,
    streamingItineraryBuilder: true,
    realTimeProgressUpdates: true,
    browserAutomationFallback: true,
    activityPreferencesFlow: true,
    voiceCallFallback: true,
    naturalLanguageModification: true,
    automationLevels: true,
  },
  'phase-5': {
    itineraryCentricFlow: true,
    enhancedTravelForm: true,
    streamingItineraryBuilder: true,
    realTimeProgressUpdates: true,
    browserAutomationFallback: true,
    activityPreferencesFlow: true,
    voiceCallFallback: true,
    naturalLanguageModification: true,
    pdfDocumentGeneration: true,
    bookingOrchestration: true,
    automationLevels: true,
  },
  'phase-6': {
    itineraryCentricFlow: true,
    enhancedTravelForm: true,
    streamingItineraryBuilder: true,
    realTimeProgressUpdates: true,
    browserAutomationFallback: true,
    activityPreferencesFlow: true,
    voiceCallFallback: true,
    naturalLanguageModification: true,
    pdfDocumentGeneration: true,
    bookingOrchestration: true,
    automationLevels: true,
    // Phase 6 features
    abTestingFramework: true,
    mobileOptimization: true,
    performanceMonitoring: true,
    legacyFlowComparison: true,
  },
  'production': {
    itineraryCentricFlow: true,
    enhancedTravelForm: true,
    streamingItineraryBuilder: true,
    realTimeProgressUpdates: true,
    browserAutomationFallback: true,
    activityPreferencesFlow: true,
    voiceCallFallback: true,
    naturalLanguageModification: true,
    pdfDocumentGeneration: true,
    bookingOrchestration: true,
    automationLevels: true,
    // Phase 6 features
    abTestingFramework: true,
    mobileOptimization: true,
    performanceMonitoring: true,
    legacyFlowComparison: true,
  }
};

/**
 * Feature Flag Manager
 * Handles feature flag resolution with environment variables and user overrides
 */
class FeatureFlagManager {
  private flags: FeatureFlags;
  private userOverrides: Partial<FeatureFlags> = {};

  constructor() {
    this.flags = this.resolveFlags();
  }

  /**
   * Resolve feature flags from environment variables and presets
   */
  private resolveFlags(): FeatureFlags {
    const baseFlags = { ...DEFAULT_FLAGS };

    // Apply phase preset if specified
    const phase = process.env.NEXT_PUBLIC_FEATURE_PHASE || process.env.FEATURE_PHASE;
    if (phase && PHASE_PRESETS[phase]) {
      Object.assign(baseFlags, PHASE_PRESETS[phase]);
    }

    // Apply individual environment variable overrides
    const envFlags: Partial<FeatureFlags> = {
      itineraryCentricFlow: this.getBooleanEnvVar('NEXT_PUBLIC_FEATURE_ITINERARY_CENTRIC', 'FEATURE_ITINERARY_CENTRIC'),
      enhancedTravelForm: this.getBooleanEnvVar('NEXT_PUBLIC_FEATURE_ENHANCED_FORM', 'FEATURE_ENHANCED_FORM'),
      streamingItineraryBuilder: this.getBooleanEnvVar('NEXT_PUBLIC_FEATURE_STREAMING_BUILDER', 'FEATURE_STREAMING_BUILDER'),
      realTimeProgressUpdates: this.getBooleanEnvVar('NEXT_PUBLIC_FEATURE_REAL_TIME_PROGRESS', 'FEATURE_REAL_TIME_PROGRESS'),
      activityPreferencesFlow: this.getBooleanEnvVar('NEXT_PUBLIC_FEATURE_ACTIVITY_PREFERENCES', 'FEATURE_ACTIVITY_PREFERENCES'),
      naturalLanguageModification: this.getBooleanEnvVar('NEXT_PUBLIC_FEATURE_NL_MODIFICATION', 'FEATURE_NL_MODIFICATION'),
      voiceCallFallback: this.getBooleanEnvVar('NEXT_PUBLIC_FEATURE_VOICE_FALLBACK', 'FEATURE_VOICE_FALLBACK'),
      browserAutomationFallback: this.getBooleanEnvVar('NEXT_PUBLIC_FEATURE_BROWSER_FALLBACK', 'FEATURE_BROWSER_FALLBACK'),
      pdfDocumentGeneration: this.getBooleanEnvVar('NEXT_PUBLIC_FEATURE_PDF_GENERATION', 'FEATURE_PDF_GENERATION'),
      bookingOrchestration: this.getBooleanEnvVar('NEXT_PUBLIC_FEATURE_BOOKING_ORCHESTRATION', 'FEATURE_BOOKING_ORCHESTRATION'),
      automationLevels: this.getBooleanEnvVar('NEXT_PUBLIC_FEATURE_AUTOMATION_LEVELS', 'FEATURE_AUTOMATION_LEVELS'),
      // Phase 6 features
      abTestingFramework: this.getBooleanEnvVar('NEXT_PUBLIC_FEATURE_AB_TESTING', 'FEATURE_AB_TESTING'),
      mobileOptimization: this.getBooleanEnvVar('NEXT_PUBLIC_FEATURE_MOBILE_OPTIMIZATION', 'FEATURE_MOBILE_OPTIMIZATION'),
      performanceMonitoring: this.getBooleanEnvVar('NEXT_PUBLIC_FEATURE_PERFORMANCE_MONITORING', 'FEATURE_PERFORMANCE_MONITORING'),
      legacyFlowComparison: this.getBooleanEnvVar('NEXT_PUBLIC_FEATURE_LEGACY_FLOW_COMPARISON', 'FEATURE_LEGACY_FLOW_COMPARISON'),
    };

    // Filter out undefined values and apply to base flags
    Object.entries(envFlags).forEach(([key, value]) => {
      if (value !== undefined) {
        (baseFlags as any)[key] = value;
      }
    });

    return baseFlags;
  }

  /**
   * Get boolean environment variable with fallback
   */
  private getBooleanEnvVar(publicKey: string, serverKey: string): boolean | undefined {
    const publicValue = process.env[publicKey];
    const serverValue = process.env[serverKey];
    
    const value = publicValue || serverValue;
    if (value === undefined) return undefined;
    
    return value.toLowerCase() === 'true' || value === '1';
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(feature: keyof FeatureFlags): boolean {
    // Check user overrides first
    if (this.userOverrides[feature] !== undefined) {
      return this.userOverrides[feature]!;
    }
    
    return this.flags[feature];
  }

  /**
   * Get all current feature flags
   */
  getAllFlags(): FeatureFlags {
    return { 
      ...this.flags, 
      ...this.userOverrides 
    };
  }

  /**
   * Set user-specific override for a feature
   * Useful for A/B testing or user-specific toggles
   */
  setUserOverride(feature: keyof FeatureFlags, enabled: boolean): void {
    this.userOverrides[feature] = enabled;
  }

  /**
   * Clear user override for a feature
   */
  clearUserOverride(feature: keyof FeatureFlags): void {
    delete this.userOverrides[feature];
  }

  /**
   * Clear all user overrides
   */
  clearAllUserOverrides(): void {
    this.userOverrides = {};
  }

  /**
   * Get feature flags for client-side usage (only public flags)
   */
  getClientFlags(): Partial<FeatureFlags> {
    const clientFlags: Partial<FeatureFlags> = {};
    
    // Only include flags that have NEXT_PUBLIC_ env vars or are enabled by preset
    const flagsToInclude: (keyof FeatureFlags)[] = [
      'itineraryCentricFlow',
      'enhancedTravelForm',
      'streamingItineraryBuilder',
      'realTimeProgressUpdates',
      'activityPreferencesFlow',
      'naturalLanguageModification',
      'automationLevels'
    ];

    flagsToInclude.forEach(flag => {
      clientFlags[flag] = this.isEnabled(flag);
    });

    return clientFlags;
  }

  /**
   * Check if the new itinerary flow should be used
   */
  shouldUseItineraryFlow(): boolean {
    return this.isEnabled('itineraryCentricFlow');
  }

  /**
   * Check if enhanced form should be shown
   */
  shouldShowEnhancedForm(): boolean {
    return this.isEnabled('enhancedTravelForm');
  }

  /**
   * Check if streaming builder is available
   */
  canUseStreamingBuilder(): boolean {
    return this.isEnabled('streamingItineraryBuilder');
  }

  /**
   * Get current development phase
   */
  getCurrentPhase(): string {
    const phase = process.env.NEXT_PUBLIC_FEATURE_PHASE || process.env.FEATURE_PHASE;
    if (phase && PHASE_PRESETS[phase]) {
      return phase;
    }

    // Determine phase based on enabled features
    if (this.isEnabled('abTestingFramework')) return 'phase-6';
    if (this.isEnabled('bookingOrchestration')) return 'phase-5';
    if (this.isEnabled('naturalLanguageModification')) return 'phase-4';
    if (this.isEnabled('activityPreferencesFlow')) return 'phase-3';
    if (this.isEnabled('streamingItineraryBuilder')) return 'phase-2';
    if (this.isEnabled('itineraryCentricFlow')) return 'phase-1';
    
    return 'legacy';
  }

  /**
   * Enable a specific phase (for development/testing)
   */
  enablePhase(phase: string): void {
    if (PHASE_PRESETS[phase]) {
      Object.assign(this.flags, PHASE_PRESETS[phase]);
    }
  }
}

// Export singleton instance
export const featureFlags = new FeatureFlagManager();

// Convenience hooks for React components
export function useFeatureFlag(feature: keyof FeatureFlags): boolean {
  return featureFlags.isEnabled(feature);
}

export function useFeatureFlags(): FeatureFlags {
  return featureFlags.getAllFlags();
}

// Type guard for feature flag keys
export function isValidFeatureFlag(key: string): key is keyof FeatureFlags {
  return key in DEFAULT_FLAGS;
}

// Development utilities
export const FeatureFlagUtils = {
  /**
   * Log current feature flag status (development only)
   */
  logStatus(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('🏗️ TravelAgentic Feature Flags Status:');
      console.log(`📋 Current Phase: ${featureFlags.getCurrentPhase()}`);
      console.log('🎯 Enabled Features:');
      
      const flags = featureFlags.getAllFlags();
      Object.entries(flags).forEach(([key, enabled]) => {
        if (enabled) {
          console.log(`  ✅ ${key}`);
        }
      });

      console.log('❌ Disabled Features:');
      Object.entries(flags).forEach(([key, enabled]) => {
        if (!enabled) {
          console.log(`  ⭕ ${key}`);
        }
      });
    }
  },

  /**
   * Get feature flag configuration for debugging
   */
  getDebugInfo(): {
    phase: string;
    flags: FeatureFlags;
    environment: Record<string, string | undefined>;
  } {
    return {
      phase: featureFlags.getCurrentPhase(),
      flags: featureFlags.getAllFlags(),
      environment: {
        FEATURE_PHASE: process.env.FEATURE_PHASE,
        NEXT_PUBLIC_FEATURE_PHASE: process.env.NEXT_PUBLIC_FEATURE_PHASE,
        NODE_ENV: process.env.NODE_ENV,
      }
    };
  }
};

// Initialize feature flags and log status in development
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  FeatureFlagUtils.logStatus();
} 