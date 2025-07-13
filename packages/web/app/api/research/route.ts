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
      // Extract JSON from markdown code blocks if present
      let jsonText = result.text.trim();
      
      // Check if response is wrapped in markdown code blocks
      if (jsonText.startsWith('```json')) {
        const startIndex = jsonText.indexOf('{');
        const lastBraceIndex = jsonText.lastIndexOf('}');
        if (startIndex !== -1 && lastBraceIndex !== -1) {
          jsonText = jsonText.substring(startIndex, lastBraceIndex + 1);
        }
      } else if (jsonText.startsWith('```')) {
        // Handle generic code blocks
        const lines = jsonText.split('\n');
        lines.shift(); // Remove first ```
        lines.pop(); // Remove last ```
        jsonText = lines.join('\n');
      }
      
      structuredData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw response:', result.text.substring(0, 200) + '...');
      // Fallback to text response if JSON parsing fails
      return Response.json({ research: result.text, structured: false });
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
