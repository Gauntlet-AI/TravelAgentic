import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

import {
  searchActivities,
  searchFlights,
  searchHotels,
} from '@/lib/travel-tools';

export const maxDuration = 30;

/**
 * AI Chat API Route for TravelAgentic
 * Enhanced with function calling for agentic behavior and travel context awareness
 * AI can now take actions like searching flights, hotels, and activities
 */
export async function POST(req: Request) {
  try {
    const { messages, travelContext, systemPrompt, mode } = await req.json();

    // Use custom system prompt if provided, otherwise use default
    const defaultSystemPrompt = `You are TravelAgentic's AI Travel Agent, an autonomous travel planning assistant that can take real actions to help users book their perfect vacation.

AGENTIC CAPABILITIES:
You have access to tools that let you:
- Search for flights in real-time
- Find and compare hotels 
- Discover activities and attractions
- Check availability and pricing
- Provide personalized recommendations based on actual data
- Control the user interface to show relevant content

CORE FUNCTIONS:
- Use searchFlights() when users need flight options
- Use searchHotels() when users need accommodation options  
- Use searchActivities() when users want things to do
- Use changeTab() to switch the user interface to show relevant content
- Always provide specific, actionable results with real data

UI CONTROL CAPABILITIES:
You can control the user interface tabs with changeTab() tool:
- "activities" tab: Activity preferences and selection
- "flights" tab: Flight search results and options
- "hotels" tab: Hotel search results and accommodations
- "results" tab: Activity results based on selected preferences

CONTEXT AWARENESS:
${travelContext || "The user hasn't made any travel selections yet."}

SMART BEHAVIOR:
- If the user has already selected travel details (departure, destination, dates, travelers), USE THEM automatically
- Don't ask for information that's already provided in the context
- When user says "find flights" and destination/origin are known, search immediately AND switch to flights tab
- When user says "search hotels" and destination/dates are known, search immediately AND switch to hotels tab
- When user says "show me activities" or "what can I do", switch to results tab (activities results)
- When user wants to select activity preferences, switch to activities tab
- Mention what selections you're using: "I'll search for flights from [departure] to [destination] for [dates]"
- If critical info is missing, ask only for what's needed

INTERACTION STYLE:
- Be proactive and use existing selections intelligently
- Take action by calling functions when you have enough information
- Provide specific recommendations with prices, times, and booking details
- Explain what you're doing ("Based on your selected destination, let me search for flights...")
- Automatically switch to relevant tabs to show users what they asked for
- Offer to search for additional options or modify criteria

WHEN TO USE TOOLS:
- User mentions needing flights → call searchFlights() using known details + changeTab("flights")
- User asks about hotels/accommodation → call searchHotels() using known details + changeTab("hotels")
- User wants activities/attractions → call searchActivities() using known details + changeTab("results")
- User wants to modify activity preferences → call changeTab("activities")
- User provides new details or changes → update and search with new criteria + switch appropriate tab

TAB SWITCHING EXAMPLES:
- "Show me flights" → changeTab("flights")
- "Find hotels" → changeTab("hotels") 
- "What activities are available?" → changeTab("results")
- "I want to change my activity preferences" → changeTab("activities")
- "Show me the activity results" → changeTab("results")

ALWAYS:
- Check the context for existing selections before asking questions
- Use available information to make searches more efficient
- Switch to the appropriate tab to show users relevant content
- Present results in a clear, organized way
- Offer to search for additional options or refine criteria
- Be helpful and proactive in taking actions to assist with travel planning

Remember: You're not just giving advice - you're actively helping users find and compare real travel options using their existing selections and showing them the right interface!`;

    // Use custom system prompt if provided, otherwise use default with context
    const finalSystemPrompt = systemPrompt || (defaultSystemPrompt + 
      `AGENTIC CAPABILITIES:
You have access to tools that let you:
- Search for flights in real-time
- Find and compare hotels 
- Discover activities and attractions
- Check availability and pricing
- Provide personalized recommendations based on actual data
- Control the user interface to show relevant content

CORE FUNCTIONS:
- Use searchFlights() when users need flight options
- Use searchHotels() when users need accommodation options  
- Use searchActivities() when users want things to do
- Use changeTab() to switch the user interface to show relevant content
- Always provide specific, actionable results with real data

UI CONTROL CAPABILITIES:
You can control the user interface tabs with changeTab() tool:
- "activities" tab: Activity preferences and selection
- "flights" tab: Flight search results and options
- "hotels" tab: Hotel search results and accommodations
- "results" tab: Activity results based on selected preferences

CONTEXT AWARENESS:
${travelContext || "The user hasn't made any travel selections yet."}

SMART BEHAVIOR:
- If the user has already selected travel details (departure, destination, dates, travelers), USE THEM automatically
- Don't ask for information that's already provided in the context
- When user says "find flights" and destination/origin are known, search immediately AND switch to flights tab
- When user says "search hotels" and destination/dates are known, search immediately AND switch to hotels tab
- When user says "show me activities" or "what can I do", switch to results tab (activities results)
- When user wants to select activity preferences, switch to activities tab
- Mention what selections you're using: "I'll search for flights from [departure] to [destination] for [dates]"
- If critical info is missing, ask only for what's needed

INTERACTION STYLE:
- Be proactive and use existing selections intelligently
- Take action by calling functions when you have enough information
- Provide specific recommendations with prices, times, and booking details
- Explain what you're doing ("Based on your selected destination, let me search for flights...")
- Automatically switch to relevant tabs to show users what they asked for
- Offer to search for additional options or modify criteria

WHEN TO USE TOOLS:
- User mentions needing flights → call searchFlights() using known details + changeTab("flights")
- User asks about hotels/accommodation → call searchHotels() using known details + changeTab("hotels")
- User wants activities/attractions → call searchActivities() using known details + changeTab("results")
- User wants to modify activity preferences → call changeTab("activities")
- User provides new details or changes → update and search with new criteria + switch appropriate tab

TAB SWITCHING EXAMPLES:
- "Show me flights" → changeTab("flights")
- "Find hotels" → changeTab("hotels") 
- "What activities are available?" → changeTab("results")
- "I want to change my activity preferences" → changeTab("activities")
- "Show me the activity results" → changeTab("results")

ALWAYS:
- Check the context for existing selections before asking questions
- Use available information to make searches more efficient
- Switch to the appropriate tab to show users relevant content
- Present results in a clear, organized way
- Offer to search for additional options or refine criteria
- Be helpful and proactive in taking actions to assist with travel planning

Remember: You're not just giving advice - you're actively helping users find and compare real travel options using their existing selections and showing them the right interface!`);

    const result = streamText({
      model: openai('gpt-4-turbo'),
      messages,
      system: finalSystemPrompt,
      temperature: 0.7,
      maxTokens: 1500,
      tools: {
        searchFlights: tool({
          description: 'Search for flight options between two cities',
          parameters: z.object({
            origin: z.string().describe('Departure city or airport code'),
            destination: z.string().describe('Arrival city or airport code'),
            departureDate: z
              .string()
              .describe('Departure date in YYYY-MM-DD format'),
            returnDate: z
              .string()
              .optional()
              .describe(
                'Return date in YYYY-MM-DD format (optional for one-way)'
              ),
            passengers: z.number().default(1).describe('Number of passengers'),
            cabin: z
              .enum(['economy', 'premium', 'business', 'first'])
              .default('economy')
              .describe('Cabin class preference'),
          }),
          execute: async ({
            origin,
            destination,
            departureDate,
            returnDate,
            passengers,
            cabin,
          }) => {
            console.log(
              `🤖 AI is searching flights: ${origin} → ${destination}`
            );
            return await searchFlights({
              origin,
              destination,
              departureDate,
              returnDate,
              passengers,
              cabin,
            });
          },
        }),

        searchHotels: tool({
          description: 'Search for hotel accommodations in a destination',
          parameters: z.object({
            destination: z
              .string()
              .describe('City or location to search for hotels'),
            checkIn: z.string().describe('Check-in date in YYYY-MM-DD format'),
            checkOut: z
              .string()
              .describe('Check-out date in YYYY-MM-DD format'),
            guests: z.number().default(1).describe('Number of guests'),
            priceRange: z
              .enum(['budget', 'mid-range', 'luxury', 'any'])
              .default('any')
              .describe('Price range preference'),
          }),
          execute: async ({
            destination,
            checkIn,
            checkOut,
            guests,
            priceRange,
          }) => {
            console.log(`🤖 AI is searching hotels in: ${destination}`);
            return await searchHotels({
              destination,
              checkIn,
              checkOut,
              guests,
              priceRange,
            });
          },
        }),

        searchActivities: tool({
          description: 'Search for activities and attractions in a destination',
          parameters: z.object({
            destination: z
              .string()
              .describe('City or location to search for activities'),
            dates: z
              .array(z.string())
              .optional()
              .describe(
                'Array of dates in YYYY-MM-DD format for activity availability'
              ),
            interests: z
              .array(z.string())
              .optional()
              .describe(
                "Types of activities of interest (e.g., 'outdoor', 'culture', 'food', 'adventure')"
              ),
            duration: z
              .enum(['half-day', 'full-day', 'multi-day', 'any'])
              .default('any')
              .describe('Preferred activity duration'),
          }),
          execute: async ({ destination, dates, interests, duration }) => {
            console.log(`🤖 AI is searching activities in: ${destination}`);
            return await searchActivities({
              destination,
              dates,
              interests,
              duration,
            });
          },
        }),

        changeTab: tool({
          description: 'Change the user interface tab to show relevant content',
          parameters: z.object({
            tabValue: z
              .enum(['activities', 'flights', 'hotels', 'results'])
              .describe('The tab to switch to: activities (preferences), flights (search results), hotels (accommodations), results (activity results)'),
          }),
          execute: async ({ tabValue }) => {
            console.log(`🤖 AI is switching to ${tabValue} tab`);
            
            // Frontend will handle the actual tab change via useEffect watching tool calls
            return {
              success: true,
              message: `Switching to ${tabValue} tab to show relevant content`,
              tab: tabValue,
            };
          },
        }),

        updateTripInfo: tool({
          description: 'Update the trip information with collected user preferences. Call this when you have gathered all required trip details.',
          parameters: z.object({
            departureLocation: z.string().describe('Where the user is departing from (city, airport)'),
            destination: z.string().describe('Where the user wants to go (city, country)'),
            departureDate: z.string().describe('Departure date in YYYY-MM-DD format'),
            flightType: z.enum(['economy', 'premium economy', 'business', 'first class']).describe('Flight class preference'),
            hotelType: z.enum(['budget', 'mid-range', 'luxury', 'boutique']).describe('Hotel category preference'),
            returnFlight: z.boolean().describe('Whether user wants round trip (true) or one-way (false)'),
            duration: z.string().describe('Trip duration (e.g., "5 days", "1 week", "10 days")'),
            activities: z.string().describe('Activity preferences (e.g., "adventure, culture", "relaxation, food", "nightlife, shopping")'),
            travelers: z.number().describe('Total number of travelers (adults + children)'),
          }),
          execute: async ({ 
            departureLocation, 
            destination, 
            departureDate,
            flightType, 
            hotelType, 
            returnFlight, 
            duration, 
            activities, 
            travelers 
          }) => {
            console.log(`🤖 AI is updating trip info: ${departureLocation} → ${destination} on ${departureDate}`);
            
            // Frontend will handle the actual trip info update via useEffect watching tool calls
            return {
              success: true,
              message: 'Trip information updated successfully! You can now proceed to itinerary planning.',
              tripInfo: {
                departureLocation,
                destination,
                departureDate,
                flightType,
                hotelType,
                returnFlight,
                duration,
                activities,
                travelers,
              },
            };
          },
        }),
      },
      toolChoice: 'auto',
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
