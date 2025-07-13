'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, Loader2, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

import type { TravelDetails } from '@/lib/mock-data';
import { useLangGraphChat } from '@/hooks/use-langgraph-conversation';
import { formatTravelDetailsForLangGraph } from '@/lib/langgraph-service';

interface ChatInterfaceProps {
  className?: string;
  isMobile?: boolean;
  isCollapsed?: boolean;
  onToggle?: () => void;
  hideCard?: boolean;
  travelDetails?: TravelDetails | null;
  onTabChange?: (tabValue: string) => void;
  conversationId?: string | null; // Pass conversation ID from parent
  onConversationStart?: (conversationId: string) => void; // Callback when conversation starts
}

export function ChatInterface({
  className,
  isMobile,
  isCollapsed,
  onToggle,
  hideCard,
  travelDetails,
  onTabChange,
  conversationId,
  onConversationStart,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Use LangGraph chat hook
  const { messages, isLoading, error, sendMessage } = useLangGraphChat(conversationId || null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle connection errors
  useEffect(() => {
    if (error) {
      setConnectionError(error);
    } else {
      setConnectionError(null);
    }
  }, [error]);

  const getTravelContext = () => {
    if (!travelDetails) {
      return "No travel details provided yet.";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // If no conversation ID, we can't send messages
    if (!conversationId) {
      setConnectionError('No active conversation. Please start planning to begin chatting.');
      return;
    }

    const messageToSend = input.trim();
    setInput('');
    
    try {
      // Include travel context in the message if available
      const contextualMessage = travelDetails 
        ? `${messageToSend}\n\nContext:\n${getTravelContext()}`
        : messageToSend;
        
      await sendMessage(contextualMessage);
      setConnectionError(null);
    } catch (error) {
      console.error('Failed to send message:', error);
      setConnectionError('Failed to send message. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

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

  // Construct container classes so the chat panel stays visible while the user scrolls (desktop only)
  const containerClasses = `${className ?? ''} flex flex-col ${!isMobile ? 'sticky top-0 max-h-screen overflow-y-auto' : ''}`;

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
          
          {/* Connection status indicator */}
          <div className="flex items-center gap-2">
            <Badge variant={conversationId ? "default" : "outline"} className={conversationId ? "bg-green-500" : ""}>
              {conversationId ? (
                <>
                  <div className="w-2 h-2 bg-white rounded-full mr-2" />
                  Connected
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
                  Not Connected
                </>
              )}
            </Badge>
            
            {connectionError && (
              <Badge variant="destructive" className="text-xs">
                Error
              </Badge>
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
        {/* Connection Error */}
        {connectionError && (
          <div className="mx-4 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{connectionError}</span>
            </div>
          </div>
        )}

        {/* Empty State Message */}
        {messages.length === 0 && !conversationId && (
          <div
            className={`py-8 text-center text-muted-foreground ${hideCard ? 'sticky top-0 z-10 bg-white' : 'sticky top-16 z-10 bg-white'}`}
          >
            <MessageCircle className="mx-auto mb-2" size={32} />
            <p>Start planning your trip to begin chatting!</p>
            <p className="text-sm text-gray-500 mt-2">
              Fill out your travel details and click "Start Planning" to activate the AI assistant.
            </p>
          </div>
        )}

        {/* Connected but no messages */}
        {messages.length === 0 && conversationId && (
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
          {messages.map((message, index) => (
            <div
              key={`${message.timestamp}-${index}`}
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

                {/* Show metadata if available */}
                {message.metadata?.section && (
                  <div className="mt-2 text-xs opacity-75">
                    Section: {message.metadata.section}
                  </div>
                )}
              </div>
              
              {/* Show timestamp */}
              <div className="text-xs text-gray-500 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="text-left">
              <div className="inline-block rounded-lg bg-gray-100 p-3 text-gray-900">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AI is thinking...
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input Form */}
        <div className="sticky bottom-0 z-10 bg-white p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder={
                !conversationId 
                  ? "Start planning to activate chat..."
                  : travelDetails 
                    ? "e.g., 'Find flights' or 'Search budget hotels' or 'Show me outdoor activities'"
                    : "e.g., 'Find flights to Tokyo for March 15' or 'Search budget hotels in Barcelona'"
              }
              className="flex-1"
              disabled={!conversationId || isLoading}
            />
            <Button 
              type="submit" 
              disabled={!conversationId || isLoading || !input.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </Button>
          </form>
          
          {/* Helper text */}
          {conversationId && (
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: I can help you search for flights, hotels, activities, and answer questions about your trip.
            </p>
          )}
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
