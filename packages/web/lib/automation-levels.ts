/**
 * Automation Level Configuration for TravelAgentic
 * Defines the behavior and characteristics of different automation levels
 */

export type AutomationLevel = 1 | 2 | 3 | 4;

/**
 * Automation Package Types - Different focus areas for all automation levels
 */
export type AutomationPackage = 'budget' | 'experience' | 'time' | 'custom';

export interface AutomationLevelConfig {
  level: AutomationLevel;
  name: string;
  description: string;
  shortDescription: string;
  userType: string;
  characteristics: {
    autoFilter: boolean;
    autoSelect: boolean;
    requireConfirmation: boolean;
    showAllOptions: boolean;
    autoBook: boolean;
    waitAtCheckout: boolean;
  };
  ui: {
    showProgressSteps: boolean;
    showConfirmationDialogs: boolean;
    showAlternativeOptions: boolean;
    enableManualOverrides: boolean;
  };
  timing: {
    selectionTimeout?: number; // ms before auto-advancing
    confirmationRequired: boolean;
    batchProcessing: boolean;
  };
}

/**
 * Automation Package Configuration
 * Each package has different focus areas and can be applied to any automation level
 */
export interface AutomationPackageConfig {
  packageType: AutomationPackage;
  name: string;
  description: string;
  shortDescription: string;
  focusArea: string;
  icon: string;
  priorities: {
    budget: number; // 1-10 priority
    experience: number; // 1-10 priority
    timeEfficiency: number; // 1-10 priority
  };
  selectionCriteria: {
    priceWeight: number; // 0-1 weight in selection algorithm
    ratingWeight: number; // 0-1 weight in selection algorithm
    convenienceWeight: number; // 0-1 weight in selection algorithm
    uniquenessWeight: number; // 0-1 weight in selection algorithm
  };
  customizations: {
    flightPreference: 'cheapest' | 'fastest' | 'best-value' | 'custom';
    hotelPreference: 'budget' | 'boutique' | 'luxury' | 'convenient' | 'custom';
    activityPreference: 'popular' | 'unique' | 'budget' | 'premium' | 'custom';
    diningPreference: 'local' | 'fine-dining' | 'casual' | 'authentic' | 'custom';
  };
  userPrompts: {
    flightSelection: string;
    hotelSelection: string;
    activitySelection: string;
    overallApproach: string;
  };
}

/**
 * Custom Package Configuration
 * Allows users to define their own preferences for each category
 */
export interface CustomPackageConfig {
  flights: {
    priority: 'cheapest' | 'fastest' | 'best-value' | 'premium';
    maxPrice?: number;
    preferredAirlines?: string[];
    allowLayovers: boolean;
  };
  hotels: {
    priority: 'budget' | 'boutique' | 'luxury' | 'convenient' | 'eco-friendly';
    maxPrice?: number;
    preferredChains?: string[];
    amenities: string[];
  };
  activities: {
    priority: 'popular' | 'unique' | 'budget' | 'premium' | 'cultural';
    maxPrice?: number;
    categories: string[];
    duration: 'short' | 'medium' | 'long' | 'any';
  };
  dining: {
    priority: 'local' | 'fine-dining' | 'casual' | 'authentic' | 'vegetarian';
    maxPrice?: number;
    cuisineTypes: string[];
    dietaryRestrictions: string[];
  };
}

/**
 * Automation Package Configurations
 * Four different approaches that work with all automation levels
 */
export const AUTOMATION_PACKAGES: Record<AutomationPackage, AutomationPackageConfig> = {
  budget: {
    packageType: 'budget',
    name: 'Budget Smart',
    description: 'AI optimizes for the best deals while maintaining quality',
    shortDescription: 'Best value for money',
    focusArea: 'Cost Optimization',
    icon: 'DollarSign',
    priorities: {
      budget: 9,
      experience: 6,
      timeEfficiency: 5,
    },
    selectionCriteria: {
      priceWeight: 0.6,
      ratingWeight: 0.2,
      convenienceWeight: 0.1,
      uniquenessWeight: 0.1,
    },
    customizations: {
      flightPreference: 'cheapest',
      hotelPreference: 'budget',
      activityPreference: 'budget',
      diningPreference: 'local',
    },
    userPrompts: {
      flightSelection: 'Finding the most affordable flights with reasonable layovers',
      hotelSelection: 'Selecting well-rated budget accommodations in great locations',
      activitySelection: 'Choosing free and low-cost activities with high ratings',
      overallApproach: 'Maximizing your travel experience while minimizing costs',
    },
  },
  experience: {
    packageType: 'experience',
    name: 'Experience Smart',
    description: 'AI curates unique, memorable experiences and premium options',
    shortDescription: 'Curated premium experiences',
    focusArea: 'Experience Quality',
    icon: 'Star',
    priorities: {
      budget: 4,
      experience: 10,
      timeEfficiency: 6,
    },
    selectionCriteria: {
      priceWeight: 0.1,
      ratingWeight: 0.4,
      convenienceWeight: 0.2,
      uniquenessWeight: 0.3,
    },
    customizations: {
      flightPreference: 'best-value',
      hotelPreference: 'boutique',
      activityPreference: 'unique',
      diningPreference: 'fine-dining',
    },
    userPrompts: {
      flightSelection: 'Selecting comfortable flights with good service and timing',
      hotelSelection: 'Choosing unique, highly-rated accommodations with character',
      activitySelection: 'Curating memorable, off-the-beaten-path experiences',
      overallApproach: 'Creating an unforgettable journey with premium touches',
    },
  },
  time: {
    packageType: 'time',
    name: 'Time Smart',
    description: 'AI optimizes for speed and convenience, minimizing travel time',
    shortDescription: 'Maximum efficiency',
    focusArea: 'Time Optimization',
    icon: 'Clock',
    priorities: {
      budget: 5,
      experience: 7,
      timeEfficiency: 10,
    },
    selectionCriteria: {
      priceWeight: 0.2,
      ratingWeight: 0.3,
      convenienceWeight: 0.4,
      uniquenessWeight: 0.1,
    },
    customizations: {
      flightPreference: 'fastest',
      hotelPreference: 'convenient',
      activityPreference: 'popular',
      diningPreference: 'casual',
    },
    userPrompts: {
      flightSelection: 'Selecting the fastest, most convenient flight options',
      hotelSelection: 'Choosing centrally located hotels with easy access',
      activitySelection: 'Selecting popular, easily accessible activities',
      overallApproach: 'Optimizing your itinerary for maximum efficiency and minimal hassle',
    },
  },
  custom: {
    packageType: 'custom',
    name: 'Custom Smart',
    description: 'AI optimizes based on your specific preferences for each category',
    shortDescription: 'Personalized preferences',
    focusArea: 'Custom Configuration',
    icon: 'Settings',
    priorities: {
      budget: 5,
      experience: 5,
      timeEfficiency: 5,
    },
    selectionCriteria: {
      priceWeight: 0.25,
      ratingWeight: 0.25,
      convenienceWeight: 0.25,
      uniquenessWeight: 0.25,
    },
    customizations: {
      flightPreference: 'custom',
      hotelPreference: 'custom',
      activityPreference: 'custom',
      diningPreference: 'custom',
    },
    userPrompts: {
      flightSelection: 'Selecting flights based on your custom preferences',
      hotelSelection: 'Choosing hotels according to your specific requirements',
      activitySelection: 'Curating activities that match your personal interests',
      overallApproach: 'Tailoring every aspect of your trip to your individual preferences',
    },
  },
};

/**
 * Configuration for each automation level
 */
export const AUTOMATION_LEVEL_CONFIGS: Record<AutomationLevel, AutomationLevelConfig> = {
  1: {
    level: 1,
    name: 'Manual Control',
    description: 'No specific filtering, sorted by most likely',
    shortDescription: 'Full manual control with intelligent sorting',
    userType: 'Users who want to see all options and make their own decisions',
    characteristics: {
      autoFilter: false,
      autoSelect: false,
      requireConfirmation: true,
      showAllOptions: true,
      autoBook: false,
      waitAtCheckout: true,
    },
    ui: {
      showProgressSteps: true,
      showConfirmationDialogs: true,
      showAlternativeOptions: true,
      enableManualOverrides: true,
    },
    timing: {
      selectionTimeout: undefined,
      confirmationRequired: true,
      batchProcessing: false,
    },
  },
  2: {
    level: 2,
    name: 'Assisted Selection',
    description: 'Auto-select but require confirmation to move on',
    shortDescription: 'AI assistance with confirmation gates',
    userType: 'Users who want AI assistance but prefer to review before proceeding',
    characteristics: {
      autoFilter: true,
      autoSelect: true,
      requireConfirmation: true,
      showAllOptions: false,
      autoBook: false,
      waitAtCheckout: true,
    },
    ui: {
      showProgressSteps: true,
      showConfirmationDialogs: true,
      showAlternativeOptions: true,
      enableManualOverrides: true,
    },
    timing: {
      selectionTimeout: undefined,
      confirmationRequired: true,
      batchProcessing: false,
    },
  },
  3: {
    level: 3,
    name: 'Smart Automation',
    description: 'One-shot but wait at checkout for confirmation',
    shortDescription: 'Complete package with final review',
    userType: 'Users who trust AI selections but want final budget review',
    characteristics: {
      autoFilter: true,
      autoSelect: true,
      requireConfirmation: false,
      showAllOptions: false,
      autoBook: false,
      waitAtCheckout: true,
    },
    ui: {
      showProgressSteps: true,
      showConfirmationDialogs: false,
      showAlternativeOptions: true,
      enableManualOverrides: true,
    },
    timing: {
      selectionTimeout: 2000,
      confirmationRequired: false,
      batchProcessing: true,
    },
  },
  4: {
    level: 4,
    name: 'Full Automation',
    description: 'One-shot checkout',
    shortDescription: 'Complete automation with instant booking',
    userType: 'Power users who fully trust AI and want maximum convenience',
    characteristics: {
      autoFilter: true,
      autoSelect: true,
      requireConfirmation: false,
      showAllOptions: false,
      autoBook: true,
      waitAtCheckout: false,
    },
    ui: {
      showProgressSteps: false,
      showConfirmationDialogs: false,
      showAlternativeOptions: false,
      enableManualOverrides: false,
    },
    timing: {
      selectionTimeout: 1000,
      confirmationRequired: false,
      batchProcessing: true,
    },
  },
};

/**
 * Default automation level (Level 2 - balanced approach)
 */
export const DEFAULT_AUTOMATION_LEVEL: AutomationLevel = 2;

/**
 * Automation Level Manager
 * Provides utilities for working with automation levels and automation packages
 */
export class AutomationLevelManager {
  private currentLevel: AutomationLevel;
  private currentAutomationPackage: AutomationPackage;
  private customPackageConfig: CustomPackageConfig | null = null;

  constructor(initialLevel: AutomationLevel = DEFAULT_AUTOMATION_LEVEL, initialPackage: AutomationPackage = 'experience') {
    this.currentLevel = initialLevel;
    this.currentAutomationPackage = initialPackage;
  }

  /**
   * Get the current automation level
   */
  getCurrentLevel(): AutomationLevel {
    return this.currentLevel;
  }

  /**
   * Set the automation level
   */
  setLevel(level: AutomationLevel): void {
    if (!this.isValidLevel(level)) {
      throw new Error(`Invalid automation level: ${level}. Must be 1, 2, 3, or 4.`);
    }
    this.currentLevel = level;
  }

  /**
   * Get configuration for the current level
   */
  getCurrentConfig(): AutomationLevelConfig {
    return AUTOMATION_LEVEL_CONFIGS[this.currentLevel];
  }

  /**
   * Get configuration for a specific level
   */
  getConfig(level: AutomationLevel): AutomationLevelConfig {
    return AUTOMATION_LEVEL_CONFIGS[level];
  }

  /**
   * Check if a level value is valid
   */
  isValidLevel(level: number): level is AutomationLevel {
    return [1, 2, 3, 4].includes(level);
  }

  /**
   * Get all available automation levels
   */
  getAllLevels(): AutomationLevelConfig[] {
    return Object.values(AUTOMATION_LEVEL_CONFIGS);
  }

  /**
   * Check if the current level should auto-select options
   */
  shouldAutoSelect(): boolean {
    return this.getCurrentConfig().characteristics.autoSelect;
  }

  /**
   * Check if the current level requires confirmation
   */
  requiresConfirmation(): boolean {
    return this.getCurrentConfig().characteristics.requireConfirmation;
  }

  /**
   * Check if the current level should show all options
   */
  shouldShowAllOptions(): boolean {
    return this.getCurrentConfig().characteristics.showAllOptions;
  }

  /**
   * Check if the current level should auto-book
   */
  shouldAutoBook(): boolean {
    return this.getCurrentConfig().characteristics.autoBook;
  }

  /**
   * Check if the current level should wait at checkout
   */
  shouldWaitAtCheckout(): boolean {
    return this.getCurrentConfig().characteristics.waitAtCheckout;
  }

  /**
   * Get the selection timeout for the current level
   */
  getSelectionTimeout(): number | undefined {
    return this.getCurrentConfig().timing.selectionTimeout;
  }

  /**
   * Check if batch processing is enabled for the current level
   */
  shouldUseBatchProcessing(): boolean {
    return this.getCurrentConfig().timing.batchProcessing;
  }

  /**
   * Get UI configuration for the current level
   */
  getUIConfig() {
    return this.getCurrentConfig().ui;
  }

  /**
   * Generate flow configuration based on automation level
   */
  getFlowConfig() {
    const config = this.getCurrentConfig();
    const packageConfig = this.getAutomationPackageConfig();
    
    return {
      // Search behavior
      searchFlow: {
        showAllResults: config.characteristics.showAllOptions,
        autoFilter: config.characteristics.autoFilter,
        enablePreSelection: config.characteristics.autoSelect,
        maxResultsToShow: config.characteristics.showAllOptions ? undefined : 5,
        automationPackage: packageConfig,
      },
      
      // Selection behavior
      selectionFlow: {
        autoAdvance: !config.characteristics.requireConfirmation,
        showConfirmationSteps: config.ui.showConfirmationDialogs,
        enableModification: config.ui.enableManualOverrides,
        selectionTimeout: config.timing.selectionTimeout,
        automationCustomizations: packageConfig?.customizations,
      },
      
      // Booking behavior
      bookingFlow: {
        requireFinalConfirmation: config.characteristics.waitAtCheckout,
        autoBook: config.characteristics.autoBook,
        showBookingProgress: config.ui.showProgressSteps,
        enableCancellation: config.ui.enableManualOverrides,
      },
      
      // UI customization
      ui: {
        showProgressBar: config.ui.showProgressSteps,
        showAlternatives: config.ui.showAlternativeOptions,
        enableQuickActions: config.level >= 3,
        showDetectedPreferences: config.level >= 2,
        showPackageSelector: true, // Now available for all levels
      },
    };
  }

  /**
   * Automation Package Management
   */

  /**
   * Get the current automation package
   */
  getCurrentAutomationPackage(): AutomationPackage {
    return this.currentAutomationPackage;
  }

  /**
   * Set the automation package
   */
  setAutomationPackage(packageType: AutomationPackage): void {
    if (!this.isValidAutomationPackage(packageType)) {
      throw new Error(`Invalid automation package: ${packageType}. Must be 'budget', 'experience', 'time', or 'custom'.`);
    }
    this.currentAutomationPackage = packageType;
  }

  /**
   * Get configuration for the current automation package
   */
  getAutomationPackageConfig(): AutomationPackageConfig | null {
    return AUTOMATION_PACKAGES[this.currentAutomationPackage];
  }

  /**
   * Get configuration for a specific automation package
   */
  getAutomationPackageConfigByName(packageType: AutomationPackage): AutomationPackageConfig {
    return AUTOMATION_PACKAGES[packageType];
  }

  /**
   * Check if an automation package value is valid
   */
  isValidAutomationPackage(packageType: string): packageType is AutomationPackage {
    return ['budget', 'experience', 'time', 'custom'].includes(packageType);
  }

  /**
   * Get all available automation packages
   */
  getAllAutomationPackages(): AutomationPackageConfig[] {
    return Object.values(AUTOMATION_PACKAGES);
  }

  /**
   * Get selection criteria for current automation package
   */
  getAutomationSelectionCriteria(): AutomationPackageConfig['selectionCriteria'] | null {
    const config = this.getAutomationPackageConfig();
    return config?.selectionCriteria || null;
  }

  /**
   * Get customizations for current automation package
   */
  getAutomationCustomizations(): AutomationPackageConfig['customizations'] | null {
    const config = this.getAutomationPackageConfig();
    return config?.customizations || null;
  }

  /**
   * Get user prompts for current automation package
   */
  getAutomationUserPrompts(): AutomationPackageConfig['userPrompts'] | null {
    const config = this.getAutomationPackageConfig();
    return config?.userPrompts || null;
  }

  /**
   * Custom Package Management
   */

  /**
   * Set custom package configuration
   */
  setCustomPackageConfig(config: CustomPackageConfig): void {
    this.customPackageConfig = config;
  }

  /**
   * Get custom package configuration
   */
  getCustomPackageConfig(): CustomPackageConfig | null {
    return this.customPackageConfig;
  }

  /**
   * Clear custom package configuration
   */
  clearCustomPackageConfig(): void {
    this.customPackageConfig = null;
  }
}

/**
 * Utility functions for automation levels
 */
export const AutomationUtils = {
  /**
   * Get level name by number
   */
  getLevelName(level: AutomationLevel): string {
    return AUTOMATION_LEVEL_CONFIGS[level].name;
  },

  /**
   * Get level description by number
   */
  getLevelDescription(level: AutomationLevel): string {
    return AUTOMATION_LEVEL_CONFIGS[level].description;
  },

  /**
   * Get short description for UI display
   */
  getShortDescription(level: AutomationLevel): string {
    return AUTOMATION_LEVEL_CONFIGS[level].shortDescription;
  },

  /**
   * Get user type description
   */
  getUserType(level: AutomationLevel): string {
    return AUTOMATION_LEVEL_CONFIGS[level].userType;
  },

  /**
   * Get recommendation for user based on context
   */
  getRecommendedLevel(context: {
    isFirstTimeUser?: boolean;
    hasPreviousBookings?: boolean;
    preferredBudget?: 'low' | 'medium' | 'high';
    timeConstraints?: 'flexible' | 'moderate' | 'tight';
  }): AutomationLevel {
    const { isFirstTimeUser, hasPreviousBookings, timeConstraints } = context;

    // First-time users get assisted selection
    if (isFirstTimeUser) {
      return 2;
    }

    // Users with tight time constraints get higher automation
    if (timeConstraints === 'tight') {
      return hasPreviousBookings ? 4 : 3;
    }

    // Default to assisted selection for balanced experience
    return 2;
  },

  /**
   * Validate automation level configuration
   */
  validateLevel(level: unknown): level is AutomationLevel {
    return typeof level === 'number' && [1, 2, 3, 4].includes(level);
  },

  /**
   * Get level from string (for URL params, storage, etc.)
   */
  parseLevelFromString(value: string): AutomationLevel | null {
    const parsed = parseInt(value, 10);
    return AutomationUtils.validateLevel(parsed) ? parsed : null;
  },

  /**
   * Automation Package Utilities
   */

  /**
   * Get automation package name by type
   */
  getAutomationPackageName(packageType: AutomationPackage): string {
    return AUTOMATION_PACKAGES[packageType].name;
  },

  /**
   * Get automation package description by type
   */
  getAutomationPackageDescription(packageType: AutomationPackage): string {
    return AUTOMATION_PACKAGES[packageType].description;
  },

  /**
   * Get automation package short description by type
   */
  getAutomationPackageShortDescription(packageType: AutomationPackage): string {
    return AUTOMATION_PACKAGES[packageType].shortDescription;
  },

  /**
   * Get automation package focus area by type
   */
  getAutomationPackageFocusArea(packageType: AutomationPackage): string {
    return AUTOMATION_PACKAGES[packageType].focusArea;
  },

  /**
   * Get all automation packages
   */
  getAllAutomationPackages(): AutomationPackageConfig[] {
    return Object.values(AUTOMATION_PACKAGES);
  },

  /**
   * Get automation package recommendation based on user context
   */
  getRecommendedAutomationPackage(context: {
    budgetSensitive?: boolean;
    experienceFocused?: boolean;
    timeConstraints?: 'flexible' | 'moderate' | 'tight';
    travelStyle?: 'budget' | 'premium' | 'efficient';
  }): AutomationPackage {
    const { budgetSensitive, experienceFocused, timeConstraints, travelStyle } = context;

    // Budget-sensitive users get budget package
    if (budgetSensitive || travelStyle === 'budget') {
      return 'budget';
    }

    // Experience-focused users get experience package
    if (experienceFocused || travelStyle === 'premium') {
      return 'experience';
    }

    // Time-constrained users get time package
    if (timeConstraints === 'tight' || travelStyle === 'efficient') {
      return 'time';
    }

    // Default to experience package for balanced approach
    return 'experience';
  },

  /**
   * Validate automation package type
   */
  validateAutomationPackage(packageType: unknown): packageType is AutomationPackage {
    return typeof packageType === 'string' && ['budget', 'experience', 'time', 'custom'].includes(packageType);
  },

  /**
   * Parse automation package from string
   */
  parseAutomationPackageFromString(value: string): AutomationPackage | null {
    return AutomationUtils.validateAutomationPackage(value) ? value : null;
  },
};

/**
 * Hook integration points for easy usage throughout the app
 */
export interface AutomationLevelHookReturn {
  level: AutomationLevel;
  config: AutomationLevelConfig;
  manager: AutomationLevelManager;
  setLevel: (level: AutomationLevel) => void;
  
  // Automation Package Support
  automationPackage: AutomationPackage;
  automationPackageConfig: AutomationPackageConfig | null;
  setAutomationPackage: (packageType: AutomationPackage) => void;
  automationPackages: AutomationPackageConfig[];
  
  // Custom Package Support
  customPackageConfig: CustomPackageConfig | null;
  setCustomPackageConfig: (config: CustomPackageConfig) => void;
  clearCustomPackageConfig: () => void;
  
  // Convenience getters
  shouldAutoSelect: boolean;
  requiresConfirmation: boolean;
  shouldShowAllOptions: boolean;
  shouldAutoBook: boolean;
  shouldWaitAtCheckout: boolean;
  shouldUseBatchProcessing: boolean;
  selectionTimeout?: number;
  uiConfig: AutomationLevelConfig['ui'];
  flowConfig: ReturnType<AutomationLevelManager['getFlowConfig']>;
}

/**
 * Storage utilities for persistence
 */
export const AutomationStorage = {
  /**
   * Storage keys for user preferences
   */
  STORAGE_KEY: 'travelagentic_automation_level',
  AUTOMATION_PACKAGE_STORAGE_KEY: 'travelagentic_automation_package',
  CUSTOM_PACKAGE_CONFIG_STORAGE_KEY: 'travelagentic_custom_package_config',

  /**
   * Save automation level to localStorage
   */
  save(level: AutomationLevel): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, level.toString());
    }
  },

  /**
   * Load automation level from localStorage
   */
  load(): AutomationLevel | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? AutomationUtils.parseLevelFromString(stored) : null;
  },

  /**
   * Clear stored automation level
   */
  clear(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  },

  /**
   * Automation Package Storage
   */

  /**
   * Save automation package preference to localStorage
   */
  saveAutomationPackage(packageType: AutomationPackage): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.AUTOMATION_PACKAGE_STORAGE_KEY, packageType);
    }
  },

  /**
   * Load automation package preference from localStorage
   */
  loadAutomationPackage(): AutomationPackage | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem(this.AUTOMATION_PACKAGE_STORAGE_KEY);
    return stored ? AutomationUtils.parseAutomationPackageFromString(stored) : null;
  },

  /**
   * Clear stored automation package preference
   */
  clearAutomationPackage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.AUTOMATION_PACKAGE_STORAGE_KEY);
    }
  },

  /**
   * Custom Package Config Storage
   */

  /**
   * Save custom package configuration to localStorage
   */
  saveCustomPackageConfig(config: CustomPackageConfig): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.CUSTOM_PACKAGE_CONFIG_STORAGE_KEY, JSON.stringify(config));
    }
  },

  /**
   * Load custom package configuration from localStorage
   */
  loadCustomPackageConfig(): CustomPackageConfig | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem(this.CUSTOM_PACKAGE_CONFIG_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  /**
   * Clear stored custom package configuration
   */
  clearCustomPackageConfig(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.CUSTOM_PACKAGE_CONFIG_STORAGE_KEY);
    }
  },

  /**
   * Save both automation level and automation package
   */
  saveAll(level: AutomationLevel, packageType?: AutomationPackage): void {
    this.save(level);
    if (packageType) {
      this.saveAutomationPackage(packageType);
    }
  },

  /**
   * Load both automation level and automation package
   */
  loadAll(): { level: AutomationLevel | null; packageType: AutomationPackage | null } {
    return {
      level: this.load(),
      packageType: this.loadAutomationPackage(),
    };
  },

  /**
   * Clear all stored preferences
   */
  clearAll(): void {
    this.clear();
    this.clearAutomationPackage();
    this.clearCustomPackageConfig();
  },
};

export default AutomationLevelManager; 