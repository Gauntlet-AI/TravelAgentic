'use client';

import { useChat } from 'ai/react';
import { MessageCircle, Send, Bot, User } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export type ChatMode = 'conversation' | 'quiz' | 'autonomous' | null;

interface WelcomeChatInterfaceProps {
  className?: string;
  mode: ChatMode;
  onModeChange?: (mode: ChatMode) => void;
}

const chatModeConfig = {
  conversation: {
    title: 'Chat About Your Trip',
    placeholder: 'Tell me about your travel plans... e.g., "I want to go to Japan in March"',
    systemPrompt: `You are TravelAgentic's AI Travel Agent in CONVERSATION mode. The user has a general idea of what they want and wants to chat about their travel plans.

BEHAVIOR:
- Be conversational and collaborative
- Ask clarifying questions to understand their preferences
- Provide suggestions based on what they tell you
- Help them refine their ideas through natural conversation
- Use your tools to search for flights, hotels, and activities when they provide enough details
- Don't be too pushy with questions - let the conversation flow naturally

APPROACH:
- Start by understanding their basic travel desires
- Ask follow-up questions to get more specific details
- Once you have enough information, proactively search for options
- Present results in a friendly, conversational way
- Offer to search for alternatives or make adjustments

Remember: The user has some ideas but wants to discuss and refine them with you.`
  },
  quiz: {
    title: 'Quiz Me',
    placeholder: 'Ready to discover your perfect trip? Say "start the quiz" to begin!',
    systemPrompt: `You are TravelAgentic's AI Travel Agent in QUIZ mode. The user doesn't know what they want and needs you to ask them questions to discover their preferences.

BEHAVIOR:
- Ask ONE question at a time
- Start with broad questions and get more specific
- Make questions engaging and fun
- Use their answers to guide the next question
- Build a complete travel profile through systematic questioning

QUESTION PROGRESSION:
1. Travel style (adventure, relaxation, culture, mix)
2. Budget range (budget, mid-range, luxury)
3. Time of year/season preferences
4. Duration of trip
5. Group size and travel companions
6. Activity preferences
7. Accommodation preferences
8. Food and dining preferences
9. Transportation preferences
10. Any specific destinations they've been curious about

APPROACH:
- Keep questions light and conversational
- Explain why you're asking each question
- Summarize what you've learned periodically
- Once you have enough information, suggest 2-3 destination options
- After they choose, start searching for specific options using your tools

Remember: Guide them through discovery - they truly don't know what they want yet!`
  },
  autonomous: {
    title: 'Choose For Me',
    placeholder: 'Just tell me your budget and travel dates, and I\'ll plan everything for you!',
    systemPrompt: `You are TravelAgentic's AI Travel Agent in AUTONOMOUS mode. The user trusts you to make ALL decisions and create a complete itinerary without asking many questions.

BEHAVIOR:
- Only ask for ESSENTIAL information: budget, dates, departure location, and any hard constraints
- Make confident decisions about destination, flights, hotels, and activities
- Present complete, ready-to-book itineraries
- Use your tools extensively to find actual options
- Be decisive and authoritative in your recommendations

MINIMUM REQUIRED INFO:
- Budget range
- Travel dates (or at least month/season)
- Departure location
- Any absolute deal-breakers (allergies, mobility issues, etc.)

APPROACH:
1. Collect only essential information (max 3-4 questions)
2. Make confident destination recommendations based on budget/season
3. Immediately start searching for flights, hotels, and activities
4. Present a complete itinerary with specific bookings
5. Offer to make adjustments only if asked

DECISION MAKING:
- Choose destinations that offer good value for their budget
- Select flights with reasonable timing and connections
- Pick hotels with good locations and reviews
- Include a mix of must-see attractions and hidden gems
- Create a balanced itinerary with variety

Remember: They want you to be the expert and make all the decisions!`
  }
};

export function WelcomeChatInterface({ className, mode, onModeChange }: WelcomeChatInterfaceProps) {
  const [currentMode, setCurrentMode] = useState<ChatMode>(mode);
  
  const config = currentMode ? chatModeConfig[currentMode] : null;
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    body: {
      systemPrompt: config?.systemPrompt || '',
      mode: currentMode,
    },
  });

  const handleModeChange = (newMode: ChatMode) => {
    setCurrentMode(newMode);
    onModeChange?.(newMode);
    // Clear messages when switching modes
    setMessages([]);
  };

  const handleBackToSelection = () => {
    handleModeChange(null);
  };

  if (!currentMode || !config) {
    return (
      <Card className={`${className} flex flex-col h-full`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            AI Travel Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Bot className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <p className="text-lg font-medium mb-2">Choose how you'd like to plan your trip</p>
            <p className="text-sm">Select an option on the left to start chatting with me!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} flex flex-col h-full`}>
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <CardTitle className="text-lg">{config.title}</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToSelection}
            className="text-xs"
          >
            Change Mode
          </Button>
        </div>
        <Badge variant="outline" className="w-fit">
          {currentMode === 'conversation' && 'Collaborative Planning'}
          {currentMode === 'quiz' && 'Guided Discovery'}
          {currentMode === 'autonomous' && 'Full AI Planning'}
        </Badge>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {currentMode === 'conversation' && 'I\'m here to help you plan your trip! Tell me what you have in mind.'}
                {currentMode === 'quiz' && 'Let me ask you some questions to find your perfect destination!'}
                {currentMode === 'autonomous' && 'Just give me your budget and dates, and I\'ll handle the rest!'}
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={`rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  {/* Show tool calls if they exist */}
                  {message.toolInvocations && message.toolInvocations.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.toolInvocations.map((tool, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-sm"
                        >
                          <div className="flex items-center gap-2 font-medium text-blue-700">
                            {tool.toolName === 'searchFlights' && '✈️ Searching flights...'}
                            {tool.toolName === 'searchHotels' && '🏨 Searching hotels...'}
                            {tool.toolName === 'searchActivities' && '🎯 Searching activities...'}
                          </div>
                          {'result' in tool && tool.result && (
                            <div className="mt-1 text-xs text-gray-600">
                              {(tool.result as any).success ? (
                                <span className="text-green-600">
                                  ✅ Found {(tool.result as any).data?.length || 0} options
                                </span>
                              ) : (
                                <span className="text-red-600">
                                  ❌ {(tool.result as any).message}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Input Form */}
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder={config.placeholder}
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
} 