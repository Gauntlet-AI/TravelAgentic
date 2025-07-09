import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { destination, startDate, endDate, travelers } = await req.json();

  try {
    const result = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: `Research and provide detailed activity recommendations for ${destination} for ${travelers} travelers visiting from ${startDate} to ${endDate}. 

      Please provide a comprehensive list of activities including:
      - Outdoor activities and nature experiences
      - Indoor attractions and museums
      - Nightlife and entertainment venues
      - Cultural experiences and historical sites
      - Food and dining recommendations
      - Adventure and sports activities
      - Sightseeing and landmarks

      For each activity, include:
      - Name and brief description
      - Estimated cost per person
      - Duration
      - Best time to visit
      - Category (outdoor, indoor, nightlife, culture, food, adventure, sightseeing)

      Format the response as a detailed travel guide.`,
    });

    return Response.json({ research: result.text });
  } catch (error) {
    console.error('Research error:', error);
    return Response.json(
      { error: 'Failed to research activities' },
      { status: 500 }
    );
  }
}
