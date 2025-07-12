/**
 * useAutomationLevel Hook for TravelAgentic
 * Provides React integration for the automation level system
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  AutomationLevel, 
  AutomationLevelManager, 
  AutomationLevelHookReturn,
  AutomationStorage,
  AutomationUtils,
  AutomationPackage,
  CustomPackageConfig,
  DEFAULT_AUTOMATION_LEVEL 
} from '@/lib/automation-levels';

/**
 * Main automation level hook
 * Provides complete automation level management with persistence
 */
export function useAutomationLevel(initialLevel?: AutomationLevel, initialPackage?: AutomationPackage): AutomationLevelHookReturn {
  // Initialize automation level from storage or use provided initial level
  const [level, setLevelState] = useState<AutomationLevel>(() => {
    if (initialLevel) return initialLevel;
    
    const stored = AutomationStorage.load();
    return stored || DEFAULT_AUTOMATION_LEVEL;
  });

  // Initialize automation package from storage or use provided initial package
  const [automationPackage, setAutomationPackageState] = useState<AutomationPackage>(() => {
    if (initialPackage) return initialPackage;
    
    const stored = AutomationStorage.loadAutomationPackage();
    return stored || 'experience';
  });

  // Initialize custom package configuration
  const [customPackageConfig, setCustomPackageConfigState] = useState<CustomPackageConfig | null>(() => {
    return AutomationStorage.loadCustomPackageConfig();
  });

  // Create automation manager instance
  const manager = useMemo(() => new AutomationLevelManager(level, automationPackage), [level, automationPackage]);

  // Get current configuration
  const config = useMemo(() => manager.getCurrentConfig(), [manager]);

  // Get automation package configuration
  const automationPackageConfig = useMemo(() => manager.getAutomationPackageConfig(), [manager]);

  // Get all automation packages
  const automationPackages = useMemo(() => manager.getAllAutomationPackages(), [manager]);

  // Update level with persistence
  const setLevel = useCallback((newLevel: AutomationLevel) => {
    if (!AutomationUtils.validateLevel(newLevel)) {
      console.warn(`Invalid automation level: ${newLevel}`);
      return;
    }

    setLevelState(newLevel);
    manager.setLevel(newLevel);
    AutomationStorage.save(newLevel);
  }, [manager]);

  // Update automation package with persistence
  const setAutomationPackage = useCallback((packageType: AutomationPackage) => {
    if (!AutomationUtils.validateAutomationPackage(packageType)) {
      console.warn(`Invalid automation package: ${packageType}`);
      return;
    }

    setAutomationPackageState(packageType);
    manager.setAutomationPackage(packageType);
    AutomationStorage.saveAutomationPackage(packageType);
  }, [manager]);

  // Update custom package configuration
  const setCustomPackageConfig = useCallback((config: CustomPackageConfig) => {
    setCustomPackageConfigState(config);
    manager.setCustomPackageConfig(config);
    AutomationStorage.saveCustomPackageConfig(config);
  }, [manager]);

  // Clear custom package configuration
  const clearCustomPackageConfig = useCallback(() => {
    setCustomPackageConfigState(null);
    manager.clearCustomPackageConfig();
    AutomationStorage.clearCustomPackageConfig();
  }, [manager]);

  // Sync manager when level or package changes
  useEffect(() => {
    manager.setLevel(level);
    manager.setAutomationPackage(automationPackage);
    if (customPackageConfig) {
      manager.setCustomPackageConfig(customPackageConfig);
    }
  }, [level, automationPackage, customPackageConfig, manager]);

  // Generate flow configuration
  const flowConfig = useMemo(() => manager.getFlowConfig(), [manager]);

  // Return comprehensive hook interface
  return {
    level,
    config,
    manager,
    setLevel,
    
    // Automation Package Support
    automationPackage,
    automationPackageConfig,
    setAutomationPackage,
    automationPackages,
    
    // Custom Package Support
    customPackageConfig,
    setCustomPackageConfig,
    clearCustomPackageConfig,
    
    // Convenience getters
    shouldAutoSelect: manager.shouldAutoSelect(),
    requiresConfirmation: manager.requiresConfirmation(),
    shouldShowAllOptions: manager.shouldShowAllOptions(),
    shouldAutoBook: manager.shouldAutoBook(),
    shouldWaitAtCheckout: manager.shouldWaitAtCheckout(),
    shouldUseBatchProcessing: manager.shouldUseBatchProcessing(),
    selectionTimeout: manager.getSelectionTimeout(),
    uiConfig: manager.getUIConfig(),
    flowConfig,
  };
}

/**
 * Hook for getting automation level recommendations
 * Helps suggest appropriate automation levels based on user context
 */
export function useAutomationRecommendation(context: {
  isFirstTimeUser?: boolean;
  hasPreviousBookings?: boolean;
  preferredBudget?: 'low' | 'medium' | 'high';
  timeConstraints?: 'flexible' | 'moderate' | 'tight';
}) {
  const recommendedLevel = useMemo(() => 
    AutomationUtils.getRecommendedLevel(context), 
    [context]
  );

  const recommendedConfig = useMemo(() => 
    AutomationUtils.getLevelDescription(recommendedLevel),
    [recommendedLevel]
  );

  return {
    recommendedLevel,
    recommendedConfig,
    isRecommended: (level: AutomationLevel) => level === recommendedLevel,
  };
}

/**
 * Hook for automation level flow control
 * Provides utilities for managing different flows based on automation level
 */
export function useAutomationFlow(automationLevel: AutomationLevel) {
  const manager = useMemo(() => new AutomationLevelManager(automationLevel), [automationLevel]);
  const flowConfig = useMemo(() => manager.getFlowConfig(), [manager]);

  // Flow state management
  const [currentStep, setCurrentStep] = useState<string>('start');
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<NodeJS.Timeout | null>(null);
  const [userInteractionDetected, setUserInteractionDetected] = useState(false);

  // Auto-advance functionality for higher automation levels
  const startAutoAdvance = useCallback((callback: () => void, customTimeout?: number) => {
    if (!flowConfig.selectionFlow.autoAdvance) return;

    const timeout = customTimeout || manager.getSelectionTimeout();
    if (!timeout) return;

    const timer = setTimeout(() => {
      if (!userInteractionDetected) {
        callback();
      }
    }, timeout);

    setAutoAdvanceTimer(timer);
    return timer;
  }, [flowConfig.selectionFlow.autoAdvance, manager, userInteractionDetected]);

  // Cancel auto-advance when user interacts
  const cancelAutoAdvance = useCallback(() => {
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      setAutoAdvanceTimer(null);
    }
    setUserInteractionDetected(true);
  }, [autoAdvanceTimer]);

  // Reset interaction detection
  const resetInteractionDetection = useCallback(() => {
    setUserInteractionDetected(false);
  }, []);

  // Clean up timers
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
      }
    };
  }, [autoAdvanceTimer]);

  return {
    flowConfig,
    currentStep,
    setCurrentStep,
    startAutoAdvance,
    cancelAutoAdvance,
    resetInteractionDetection,
    userInteractionDetected,
    
    // Flow control helpers
    shouldShowConfirmation: (stepType: 'selection' | 'booking') => {
      if (stepType === 'selection') return flowConfig.selectionFlow.showConfirmationSteps;
      return flowConfig.bookingFlow.requireFinalConfirmation;
    },
    
    shouldAutoProcess: () => flowConfig.selectionFlow.autoAdvance,
    canModify: () => flowConfig.selectionFlow.enableModification,
    shouldShowProgress: () => flowConfig.ui.showProgressBar,
  };
}

/**
 * Hook for automation level analytics and tracking
 * Tracks user behavior and automation level effectiveness
 */
export function useAutomationAnalytics() {
  const [analytics, setAnalytics] = useState({
    levelChanges: 0,
    currentSession: {
      startTime: Date.now(),
      interactionCount: 0,
      autoAdvanceUsed: 0,
      manualOverrides: 0,
    },
  });

  const trackLevelChange = useCallback((fromLevel: AutomationLevel, toLevel: AutomationLevel, reason?: string) => {
    setAnalytics(prev => ({
      ...prev,
      levelChanges: prev.levelChanges + 1,
    }));

    // Here you could send analytics to your tracking service
    console.log(`Automation level changed: ${fromLevel} → ${toLevel}`, { reason });
  }, []);

  const trackInteraction = useCallback((type: 'click' | 'auto_advance' | 'manual_override' | 'timeout') => {
    setAnalytics(prev => ({
      ...prev,
      currentSession: {
        ...prev.currentSession,
        interactionCount: prev.currentSession.interactionCount + 1,
        autoAdvanceUsed: type === 'auto_advance' ? prev.currentSession.autoAdvanceUsed + 1 : prev.currentSession.autoAdvanceUsed,
        manualOverrides: type === 'manual_override' ? prev.currentSession.manualOverrides + 1 : prev.currentSession.manualOverrides,
      },
    }));
  }, []);

  const getSessionSummary = useCallback(() => {
    const session = analytics.currentSession;
    const duration = Date.now() - session.startTime;
    
    return {
      duration,
      totalInteractions: session.interactionCount,
      autoAdvanceRatio: session.interactionCount > 0 ? session.autoAdvanceUsed / session.interactionCount : 0,
      manualOverrideRatio: session.interactionCount > 0 ? session.manualOverrides / session.interactionCount : 0,
    };
  }, [analytics]);

  return {
    analytics,
    trackLevelChange,
    trackInteraction,
    getSessionSummary,
  };
}

/**
 * Hook for integrating automation levels with search and booking flows
 * Provides specialized functionality for travel booking workflows
 */
export function useAutomationBookingFlow(automationLevel: AutomationLevel) {
  const { flowConfig, shouldAutoProcess, canModify } = useAutomationFlow(automationLevel);
  const [bookingState, setBookingState] = useState<{
    stage: 'search' | 'selection' | 'review' | 'booking' | 'complete';
    selections: Record<string, any>;
    autoSelections: Record<string, any>;
    userOverrides: Record<string, any>;
  }>({
    stage: 'search',
    selections: {},
    autoSelections: {},
    userOverrides: {},
  });

  // Handle auto-selection based on automation level
  const handleAutoSelection = useCallback((category: string, options: any[], aiRecommendation: any) => {
    if (!flowConfig.searchFlow.enablePreSelection) return null;

    const autoSelected = aiRecommendation || options[0];
    
    setBookingState(prev => ({
      ...prev,
      autoSelections: {
        ...prev.autoSelections,
        [category]: autoSelected,
      },
    }));

    // If level requires confirmation, don't auto-apply
    if (flowConfig.selectionFlow.showConfirmationSteps) {
      return autoSelected;
    }

    // Auto-apply for higher automation levels
    setBookingState(prev => ({
      ...prev,
      selections: {
        ...prev.selections,
        [category]: autoSelected,
      },
    }));

    return autoSelected;
  }, [flowConfig]);

  // Handle user confirmation
  const confirmSelection = useCallback((category: string, selection?: any) => {
    const finalSelection = selection || bookingState.autoSelections[category];
    
    setBookingState(prev => ({
      ...prev,
      selections: {
        ...prev.selections,
        [category]: finalSelection,
      },
    }));
  }, [bookingState.autoSelections]);

  // Handle user overrides
  const overrideSelection = useCallback((category: string, newSelection: any) => {
    if (!canModify()) return;

    setBookingState(prev => ({
      ...prev,
      selections: {
        ...prev.selections,
        [category]: newSelection,
      },
      userOverrides: {
        ...prev.userOverrides,
        [category]: newSelection,
      },
    }));
  }, [canModify]);

  // Check if ready to proceed to next stage
  const canProceedToNext = useCallback(() => {
    const requiredCategories = ['flights', 'hotels']; // Customize based on your needs
    
    if (flowConfig.selectionFlow.showConfirmationSteps) {
      return requiredCategories.every(cat => bookingState.selections[cat]);
    }

    return requiredCategories.every(cat => 
      bookingState.selections[cat] || bookingState.autoSelections[cat]
    );
  }, [flowConfig.selectionFlow.showConfirmationSteps, bookingState]);

  // Auto-proceed for higher automation levels
  const autoProceeed = useCallback(() => {
    if (!shouldAutoProcess() || !canProceedToNext()) return false;

    // Auto-fill any missing selections with auto-selections
    setBookingState(prev => {
      const newSelections = { ...prev.selections };
      Object.entries(prev.autoSelections).forEach(([key, value]) => {
        if (!newSelections[key]) {
          newSelections[key] = value;
        }
      });

      return {
        ...prev,
        selections: newSelections,
        stage: getNextStage(prev.stage),
      };
    });

    return true;
  }, [shouldAutoProcess, canProceedToNext]);

  return {
    bookingState,
    setBookingState,
    handleAutoSelection,
    confirmSelection,
    overrideSelection,
    canProceedToNext,
    autoProceeed,
    flowConfig,
  };
}

// Helper function for stage progression
function getNextStage(currentStage: string): any {
  const stages = ['search', 'selection', 'review', 'booking', 'complete'];
  const currentIndex = stages.indexOf(currentStage);
  return stages[currentIndex + 1] || currentStage;
}

export default useAutomationLevel; 