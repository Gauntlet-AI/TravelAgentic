/**
 * Natural Language Editor Component
 * Allows users to modify their itinerary using natural language conversations with an AI agent
 * Supports context-aware modifications and provides real-time feedback
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Send, 
  Loader2, 
  MessageCircle, 
  User, 
  Bot, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  Clock,
  MapPin,
  Calendar,
  Activity
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  changes?: Array<{
    type: 'add' | 'remove' | 'modify' | 'move';
    description: string;
    itemId?: string;
    success: boolean;
  }>;
  suggestions?: string[];
}

interface NaturalLanguageEditorProps {
  itinerary: any;
  onModification: (modification: any) => void;
  className?: string;
}

export function NaturalLanguageEditor({
  itinerary,
  onModification,
  className = ''
}: NaturalLanguageEditorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'agent',
      content: "Hi! I'm your AI travel assistant. I can help you modify your itinerary using natural language. Try saying things like:\n\n• \"Move the museum visit to tomorrow\"\n• \"Find me a restaurant for dinner on day 3\"\n• \"Replace the walking tour with something more relaxing\"\n• \"Add more cultural activities to my trip\"",
      timestamp: new Date(),
      suggestions: [
        "Show me my current schedule",
        "Find me a restaurant for tonight",
        "Make day 2 more relaxing",
        "Add more outdoor activities"
      ]
    }
  ]);
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isProcessing) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsProcessing(true);
    setError(null);

    try {
      const requestBody = {
        itineraryId: itinerary.id,
        modificationType: 'natural_language',
        request: currentMessage,
        context: {
          totalDays: itinerary.days.length,
          destination: itinerary.destination,
          currentItems: itinerary.days.flatMap((day: any) => day.items)
        }
      };

      console.log('Natural Language Editor sending request:', requestBody);

      // Send request to the modification API
      const response = await fetch('/api/itinerary/modify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Natural Language Editor received response:', result);

      // Create agent response message
      const agentMessage: Message = {
        id: `agent-${Date.now()}`,
        type: 'agent',
        content: result.message || 'I\'ve processed your request.',
        timestamp: new Date(),
        changes: result.changes || [],
        suggestions: result.suggestions || []
      };

      setMessages(prev => [...prev, agentMessage]);

      // Apply modifications if successful
      if (result.success && result.changes && result.changes.length > 0) {
        onModification(result);
      }

    } catch (err) {
      setError('Failed to process your request. Please try again.');
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'system',
        content: 'Sorry, I encountered an error processing your request. Please try rephrasing or being more specific.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
    inputRef.current?.focus();
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'agent':
        return <Bot className="h-4 w-4" />;
      case 'system':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'agent':
        return 'bg-green-100 text-green-900 border-green-200';
      case 'system':
        return 'bg-orange-100 text-orange-900 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-900 border-gray-200';
    }
  };

  const renderChanges = (changes: Message['changes']) => {
    if (!changes || changes.length === 0) return null;

    return (
      <div className="mt-3 space-y-2">
        <h4 className="font-medium text-sm">Changes Made:</h4>
        {changes.map((change, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 p-2 rounded-md text-sm ${
              change.success 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {change.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="capitalize">{change.type}:</span>
            <span>{change.description}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderSuggestions = (suggestions: Message['suggestions']) => {
    if (!suggestions || suggestions.length === 0) return null;

    return (
      <div className="mt-3 space-y-2">
        <h4 className="font-medium text-sm">Try these suggestions:</h4>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-xs"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">AI Travel Assistant</h3>
          <p className="text-sm text-gray-600">Modify your itinerary using natural language</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type !== 'user' && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'agent' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  {getMessageIcon(message.type)}
                </div>
              )}
              
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                <div className={`p-3 rounded-lg border ${getMessageColor(message.type)}`}>
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                  
                  {renderChanges(message.changes)}
                  {renderSuggestions(message.suggestions)}
                </div>
                
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{message.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>

              {message.type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                  {getMessageIcon(message.type)}
                </div>
              )}
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-green-100 text-green-900 border border-green-200 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Processing your request...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Error Display */}
      {error && (
        <Alert className="mx-4 mb-4 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me to modify your itinerary..."
            disabled={isProcessing}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isProcessing}
            className="px-4"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
} 