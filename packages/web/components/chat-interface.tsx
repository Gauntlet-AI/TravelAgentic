'use client';

import { useChat } from 'ai/react';
import { MessageCircle, Send } from 'lucide-react';

import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

import type { TravelDetails } from '@/lib/mock-data';

interface ChatInterfaceProps {
  className?: string;
  isMobile?: boolean;
  isCollapsed?: boolean;
  onToggle?: () => void;
  hideCard?: boolean;
  travelDetails?: TravelDetails | null; // Add travel details prop
  onTabChange?: (tabValue: string) => void; // Add tab change handler
}

export function ChatInterface({
  className,
  isMobile,
  isCollapsed,
  onToggle,
  hideCard,
  travelDetails,
  onTabChange,
}: ChatInterfaceProps) {
  // Create context message with current travel selections
  // Track processed tool calls to prevent re-execution
  const processedToolCallsRef = useRef<Set<string>>(new Set());

  const getTravelContext = () => {
    if (!travelDetails) {
      return "The user hasn't made any travel selections yet.";
    }
    
    const { 
      departureLocation, 
      destination, 
      startDate, 
      endDate, 
      adults, 
      children 
    } = travelDetails;
    
    let context = "CURRENT USER SELECTIONS:\n";
    
    if (departureLocation) {
      context += `- Departure: ${departureLocation}\n`;
    }
    
    if (destination) {
      context += `- Destination: ${destination}\n`;
    }
    
    if (startDate && endDate) {
      context += `- Travel Dates: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}\n`;
    } else if (startDate) {
      context += `- Departure Date: ${startDate.toLocaleDateString()}\n`;
    }
    
    if (adults || children) {
      const travelerInfo = [];
      if (adults) travelerInfo.push(`${adults} adult${adults !== 1 ? 's' : ''}`);
      if (children) travelerInfo.push(`${children} child${children !== 1 ? 'ren' : ''}`);
      context += `- Travelers: ${travelerInfo.join(', ')}\n`;
    }
    

    
    context += "\nIMPORTANT: Use these existing selections when making recommendations. If the user asks to search for something and relevant details are already selected, use them automatically without asking again.";
    
    return context;
  };

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: '/api/chat',
      body: {
        travelContext: getTravelContext(), // Include travel context in API calls
      },
    });

  // Effect to handle tab changes from tool calls
  useEffect(() => {
    // Find all changeTab tool calls across all messages
    const allChangeTabToolCalls = messages.flatMap((msg) => 
      msg.toolInvocations?.filter(tool => tool.toolName === 'changeTab') || []
    );

    // Process only new tool calls that haven't been processed yet
    allChangeTabToolCalls.forEach((toolCall) => {
      const toolCallId = toolCall.toolCallId;
      
      // Skip if already processed
      if (processedToolCallsRef.current.has(toolCallId)) {
        return;
      }
      
      // Execute the tab change for new tool calls
      if ('args' in toolCall && toolCall.args) {
        const args = toolCall.args as { tabValue: string };
        onTabChange?.(args.tabValue);
        
        // Mark as processed
        processedToolCallsRef.current.add(toolCallId);
      }
    });
  }, [messages, onTabChange]);

  // Construct container classes so the chat panel stays visible while the user scrolls (desktop only)
  const containerClasses = `${className ?? ''} flex flex-col ${!isMobile ? 'sticky top-0 max-h-screen overflow-y-auto' : ''}`;

  // Legacy mobile collapsed view (no longer used with new bubble)
  if (isMobile && isCollapsed) {
    return (
      <div
        className={`${className} cursor-pointer bg-blue-500 p-4 text-white`}
        onClick={onToggle}
      >
        <div className="flex items-center justify-center gap-2">
          <MessageCircle size={20} />
          <span>Chat with AI Assistant</span>
        </div>
      </div>
    );
  }

  const chatContent = (
    <>
      {/* Header - only show if not hiding card */}
      {!hideCard && (
        <CardHeader className="sticky top-0 z-10 bg-white pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">AI Travel Assistant</CardTitle>
            {isMobile && (
              <Button variant="ghost" size="sm" onClick={onToggle}>
                ×
              </Button>
            )}
          </div>
          
          {/* Show current selections summary */}
          {travelDetails && (
            <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
              <div className="font-medium text-blue-700 mb-1">Current Trip:</div>
              {travelDetails.departureLocation && travelDetails.destination && (
                <div>{travelDetails.departureLocation} → {travelDetails.destination}</div>
              )}
              {travelDetails.startDate && travelDetails.endDate && (
                <div>{travelDetails.startDate.toLocaleDateString()} - {travelDetails.endDate.toLocaleDateString()}</div>
              )}
              {(travelDetails.adults || travelDetails.children) && (
                <div>
                  {travelDetails.adults} adult{travelDetails.adults !== 1 ? 's' : ''}
                  {travelDetails.children > 0 && `, ${travelDetails.children} child${travelDetails.children !== 1 ? 'ren' : ''}`}
                </div>
              )}
            </div>
          )}
        </CardHeader>
      )}

      <CardContent className={hideCard ? 'flex h-full flex-col p-0' : ''}>
        {/* Empty State Message */}
        {messages.length === 0 && (
          <div
            className={`py-8 text-center text-muted-foreground ${hideCard ? 'sticky top-0 z-10 bg-white' : 'sticky top-16 z-10 bg-white'}`}
          >
            <MessageCircle className="mx-auto mb-2" size={32} />
            <p>Ask me anything about your vacation plans!</p>
            {travelDetails ? (
              <p className="text-sm text-blue-600">I can see your current selections and will use them in my recommendations.</p>
            ) : (
              <p className="text-sm">Fill out your travel details and I'll help with personalized suggestions.</p>
            )}
          </div>
        )}

        {/* Scrollable Messages Area */}
        <ScrollArea className="flex-1 overflow-y-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div
                className={`inline-block max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.content}

                {/* Show tool calls if they exist */}
                {message.toolInvocations &&
                  message.toolInvocations.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.toolInvocations.map((tool, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-sm"
                        >
                          <div className="flex items-center gap-2 font-medium text-blue-700">
                            {tool.toolName === 'searchFlights' &&
                              '✈️ Searching flights...'}
                            {tool.toolName === 'searchHotels' &&
                              '🏨 Searching hotels...'}
                            {tool.toolName === 'searchActivities' &&
                              '🎯 Searching activities...'}
                          </div>
                          {'result' in tool && tool.result && (
                            <div className="mt-1 text-xs text-gray-600">
                              {(tool.result as any).success ? (
                                <span className="text-green-600">
                                  ✅ Found{' '}
                                  {(tool.result as any).data?.length || 0}{' '}
                                  options
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
          ))}
          {isLoading && (
            <div className="text-left">
              <div className="inline-block rounded-lg bg-gray-100 p-3 text-gray-900">
                AI is thinking...
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Input Form */}
        <div className="sticky bottom-0 z-10 bg-white p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder={
                travelDetails 
                  ? "e.g., 'Find flights' or 'Search budget hotels' or 'Show me outdoor activities'"
                  : "e.g., 'Find flights to Tokyo for March 15' or 'Search budget hotels in Barcelona'"
              }
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              <Send size={16} />
            </Button>
          </form>
        </div>
      </CardContent>
    </>
  );

  // Return content with or without Card wrapper
  if (hideCard) {
    return <div className={containerClasses}>{chatContent}</div>;
  }

  return <Card className={containerClasses}>{chatContent}</Card>;
}
