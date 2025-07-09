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
 * Enhanced with function calling for agentic behavior
 * AI can now take actions like searching flights, hotels, and activities
 */
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Enhanced travel-specific system prompt for agentic behavior
    const travelSystemPrompt = `You are TravelAgentic's AI Travel Agent, an autonomous travel planning assistant that can take real actions to help users book their perfect vacation.

AGENTIC CAPABILITIES:
You have access to tools that let you:
- Search for flights in real-time
- Find and compare hotels 
- Discover activities and attractions
- Check availability and pricing
- Provide personalized recommendations based on actual data

CORE FUNCTIONS:
- Use searchFlights() when users need flight options
- Use searchHotels() when users need accommodation options  
- Use searchActivities() when users want things to do
- Always provide specific, actionable results with real data

INTERACTION STYLE:
- Ask clarifying questions to gather search parameters
- Take action by calling functions when you have enough information
- Provide specific recommendations with prices, times, and booking details
- Explain what you're doing ("Let me search for flights for you...")
- Be proactive in offering to search when users express travel needs

WHEN TO USE TOOLS:
- User mentions needing flights → call searchFlights()
- User asks about hotels/accommodation → call searchHotels()
- User wants activities/attractions → call searchActivities()
- User provides destination, dates, or travel details → offer to search

ALWAYS:
- Gather required parameters before calling functions
- Explain what you're searching for
- Present results in a clear, organized way
- Offer to search for additional options
- Be helpful and proactive in taking actions to assist with travel planning

Remember: You're not just giving advice - you're actively helping users find and compare real travel options!`;

    const result = streamText({
      model: openai('gpt-4-turbo'),
      messages,
      system: travelSystemPrompt,
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
