import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai("gpt-4-turbo"),
    messages,
    system: `You are a helpful AI vacation planning assistant. Help users plan their perfect vacation by understanding their preferences and providing personalized recommendations. Be friendly, knowledgeable about travel destinations, and ask clarifying questions when needed. You can help with destinations, activities, budgeting, and travel logistics.`,
  })

  return result.toDataStreamResponse()
}
