import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { destination, startDate, endDate, travelers, departureLocation } = await req.json();

  try {
    const result = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: `You are a travel planning AI. Generate detailed travel recommendations for a trip from ${departureLocation} to ${destination} for ${travelers} travelers visiting from ${startDate} to ${endDate}.

      Please provide your response in the following JSON format:

      {
        "flightPreferences": {
          "preferredAirlines": ["Airline 1", "Airline 2", "Airline 3"],
          "preferredTimes": ["morning", "afternoon", "evening"],
          "stopPreference": "direct" | "one-stop" | "any",
          "cabinClass": "economy" | "premium" | "business",
          "reasoning": "Brief explanation of flight preferences"
        },
        "hotelPreferences": {
          "preferredTypes": ["luxury", "boutique", "business", "family-friendly"],
          "amenities": ["wifi", "pool", "gym", "spa", "restaurant"],
          "locationPreference": "city center" | "airport" | "tourist area",
          "priceRange": "budget" | "mid-range" | "luxury",
          "reasoning": "Brief explanation of hotel preferences"
        },
        "activityRecommendations": [
          {
            "name": "Activity Name",
            "category": "outdoor" | "indoor" | "culture" | "food" | "adventure" | "sightseeing",
            "description": "Brief description",
            "estimatedCost": 50,
            "duration": "2-3 hours",
            "bestTime": "morning" | "afternoon" | "evening",
            "priority": "high" | "medium" | "low"
          }
        ],
        "travelGuide": "Comprehensive travel guide text with all recommendations and tips"
      }

      Provide at least 10 diverse activity recommendations covering different categories. Make sure the recommendations are specific to ${destination} and appropriate for ${travelers} travelers. Include a mix of must-see attractions, local experiences, and hidden gems.

      Base your recommendations on the actual destination and travel dates, considering factors like weather, local events, and seasonal activities.`,
    });

    // Parse the JSON response
    let structuredData;
    try {
      // Try parsing directly first
      structuredData = JSON.parse(result.text);
    } catch (parseError) {
      try {
        // If direct parsing fails, try extracting JSON from markdown code blocks
        const jsonMatch = result.text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          structuredData = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (secondParseError) {
        console.error('Failed to parse AI response as JSON:', parseError);
        console.error('Also failed to extract from markdown:', secondParseError);
        console.error('Raw response:', result.text);
        // Fallback to text response if JSON parsing fails
        return Response.json({ research: result.text, structured: false });
      }
    }

    return Response.json({ 
      research: structuredData.travelGuide || result.text,
      structured: true,
      flightPreferences: structuredData.flightPreferences,
      hotelPreferences: structuredData.hotelPreferences,
      activityRecommendations: structuredData.activityRecommendations
    });
  } catch (error) {
    console.error('Research error:', error);
    return Response.json(
      { error: 'Failed to research activities' },
      { status: 500 }
    );
  }
}
