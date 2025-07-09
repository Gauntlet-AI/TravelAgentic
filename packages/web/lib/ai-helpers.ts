/**
 * AI Helper Functions for TravelAgentic
 * Provides utility functions and prompt templates for travel-specific AI interactions
 */

export interface TravelContext {
  destination?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  travelers?: number;
  budget?: string;
  interests?: string[];
  travelStyle?: 'luxury' | 'budget' | 'mid-range' | 'adventure' | 'relaxation';
}

/**
 * Generate a context-aware travel prompt
 * @param userMessage - The user's message
 * @param context - Travel context from the form or previous conversation
 * @returns Enhanced prompt with travel context
 */
export function enhanceTravelPrompt(
  userMessage: string,
  context?: TravelContext
): string {
  if (!context) return userMessage;

  const contextParts = [];

  if (context.destination) {
    contextParts.push(`Destination: ${context.destination}`);
  }

  if (context.startDate && context.endDate) {
    contextParts.push(
      `Travel dates: ${context.startDate} to ${context.endDate}`
    );
  }

  if (context.travelers) {
    contextParts.push(`Number of travelers: ${context.travelers}`);
  }

  if (context.budget) {
    contextParts.push(`Budget range: ${context.budget}`);
  }

  if (context.interests?.length) {
    contextParts.push(`Interests: ${context.interests.join(', ')}`);
  }

  if (context.travelStyle) {
    contextParts.push(`Travel style: ${context.travelStyle}`);
  }

  if (contextParts.length === 0) return userMessage;

  return `User's question: ${userMessage}

Travel Context:
${contextParts.join('\n')}

Please provide travel advice considering this context.`;
}

/**
 * Common travel prompt templates
 */
export const travelPromptTemplates = {
  destinationRecommendation:
    "I'm looking for travel destination recommendations. Here are my preferences:",
  budgetPlanning:
    'Help me plan a budget for my trip. I want to understand costs for:',
  activitySuggestions: 'What are the best activities and attractions in',
  foodRecommendations: 'What are the must-try foods and best restaurants in',
  culturalTips: 'What cultural norms and etiquette should I know when visiting',
  packingAdvice: 'What should I pack for a trip to',
  safetyAdvice: 'What safety considerations should I know about traveling to',
  transportationHelp:
    'What are the best transportation options for getting around',
};

/**
 * Generate quick travel suggestions based on user input
 * @param input - User's partial input
 * @returns Array of suggested prompts
 */
export function generateTravelSuggestions(input: string): string[] {
  const suggestions = [];
  const lowerInput = input.toLowerCase();

  if (
    lowerInput.includes('budget') ||
    lowerInput.includes('cost') ||
    lowerInput.includes('expensive')
  ) {
    suggestions.push('Help me plan a budget for my trip');
    suggestions.push("What's the average daily cost in [destination]?");
  }

  if (
    lowerInput.includes('food') ||
    lowerInput.includes('restaurant') ||
    lowerInput.includes('eat')
  ) {
    suggestions.push('What are the must-try local dishes?');
    suggestions.push('Recommend some great restaurants');
  }

  if (
    lowerInput.includes('activity') ||
    lowerInput.includes('things to do') ||
    lowerInput.includes('attractions')
  ) {
    suggestions.push('What are the top attractions to visit?');
    suggestions.push('Suggest some unique local experiences');
  }

  if (suggestions.length === 0) {
    suggestions.push(
      'I want to plan a trip to [destination]',
      "What's the best time to visit [destination]?",
      'Help me create a 3-day itinerary for [destination]'
    );
  }

  return suggestions.slice(0, 3); // Return max 3 suggestions
}

/**
 * Extract travel entities from user message using simple pattern matching
 * @param message - User's message
 * @returns Extracted travel information
 */
export function extractTravelEntities(message: string): Partial<TravelContext> {
  const context: Partial<TravelContext> = {};

  // Simple pattern matching for common travel entities
  const budgetPatterns =
    /\$?\d+(?:,\d{3})*(?:\.\d{2})?|\b(?:budget|cheap|expensive|luxury)\b/gi;
  const travelerPatterns =
    /\b(\d+)\s*(?:people|person|traveler|adult|couple)\b/gi;
  const timePatterns =
    /\b(?:spring|summer|fall|autumn|winter|\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})\b/gi;

  const budgetMatches = message.match(budgetPatterns);
  if (budgetMatches) {
    context.budget = budgetMatches[0];
  }

  const travelerMatches = message.match(travelerPatterns);
  if (travelerMatches) {
    const number = parseInt(travelerMatches[0].match(/\d+/)?.[0] || '1');
    context.travelers = number;
  }

  return context;
}
