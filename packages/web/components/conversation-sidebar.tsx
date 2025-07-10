'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User,
  Bookmark,
  Download,
  RotateCcw,
  Clock,
  Camera,
  Sparkles,
  Plane,
  Hotel,
  MapPin,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isTyping?: boolean;
  metadata?: {
    type?: 'itinerary_update' | 'agent_status' | 'user_input' | 'search_result' | 'recommendation';
    section?: string;
    progress?: number;
    data?: any;
  };
}

interface ItinerarySnapshot {
  id: string;
  label: string;
  timestamp: number;
  progress: number;
  sections: string[];
}

interface ConversationSidebarProps {
  conversationId?: string;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
  automationLevel?: number;
}

// Realistic AI responses for different scenarios
const AI_RESPONSES = {
  welcome: [
    "Hi there! I'm your AI travel assistant. I'm excited to help you plan an amazing trip! Where would you like to go? 🌟",
    "Hello! Ready to create your perfect travel experience? Tell me about your dream destination and I'll start working on it right away! ✈️",
    "Welcome! I'm here to help you plan an unforgettable journey. What destination has been on your wishlist? 🗺️"
  ],
  processing: [
    "Great choice! I'm now analyzing the best options for your trip. This might take a moment while I search hundreds of possibilities...",
    "Perfect! Let me work my magic and find you the best deals. I'm checking flights, hotels, and activities right now...",
    "Excellent! I'm coordinating with my specialist agents to find you amazing options. Stay tuned for updates!"
  ],
  flightFound: [
    "✈️ Fantastic news! I found some excellent flight options for you. The best one is a direct flight with great timing and competitive pricing.",
    "🎯 Flight search complete! I've discovered several great options, including a premium airline with excellent reviews for just a bit more.",
    "🚀 Success! Found some amazing flights including a perfect morning departure that'll give you the most time at your destination."
  ],
  hotelFound: [
    "🏨 Hotel search complete! I found a perfect match for your style and budget. The location is ideal and the reviews are outstanding.",
    "🌟 Great news on accommodation! I've found a highly-rated place that's perfectly located near all the attractions you'll love.",
    "🏆 Accommodation sorted! Found you a gem with amazing amenities and a location that'll make exploring super convenient."
  ],
  activitiesFound: [
    "🎨 Activities curated! I've planned a perfect mix of must-see attractions and hidden gems based on your interests.",
    "🗺️ Your experience itinerary is ready! I've balanced popular attractions with authentic local experiences you'll remember forever.",
    "✨ Activity planning complete! I've created the perfect blend of culture, adventure, and relaxation tailored just for you."
  ],
  completion: [
    "🎉 Your complete travel itinerary is ready! Everything is perfectly coordinated - flights, accommodation, and amazing experiences. Ready to book?",
    "✅ Mission accomplished! Your dream trip is fully planned with all the details taken care of. Shall we proceed with booking?",
    "🌟 All done! Your personalized travel plan is complete and optimized. I'm confident you'll have an incredible experience!"
  ],
  suggestions: [
    "💡 Pro tip: I noticed the weather will be perfect during your visit. I've added some outdoor activities to take advantage of it!",
    "🍷 Based on your interests, I've included a local food tour that gets rave reviews from travelers like yourself.",
    "📸 I spotted some Instagram-worthy locations that align perfectly with your itinerary timing. Want me to add photo stops?",
    "🚊 I found a great local transport pass that'll save you money and time. Shall I include it in your logistics?",
    "🎭 There's a special cultural event happening during your visit. Would you like me to see if I can get tickets?"
  ]
};

const QUICK_RESPONSES = [
  "Tell me more about activities",
  "What about the budget?", 
  "Can you find alternatives?",
  "Book everything now",
  "I need to modify something",
  "What's the weather like?",
  "Any restaurant recommendations?",
  "Show me the timeline"
];

export default function ConversationSidebar({
  conversationId = 'conversation',
  isOpen = true,
  onToggle,
  className = '',
  automationLevel = 0
}: ConversationSidebarProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);

  const [snapshots, setSnapshots] = useState<ItinerarySnapshot[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickResponses, setShowQuickResponses] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Welcome message on first load
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeTimer = setTimeout(() => {
        addMessage('assistant', AI_RESPONSES.welcome[Math.floor(Math.random() * AI_RESPONSES.welcome.length)], { type: 'agent_status' });
      }, 1000);
      
      return () => clearTimeout(welcomeTimer);
    }
  }, [messages.length]);

  const addMessage = (role: 'user' | 'assistant', content: string, metadata?: any) => {
    const message: ConversationMessage = {
      id: Date.now().toString() + Math.random(),
      role,
      content,
      timestamp: Date.now(),
      metadata
    };
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    addMessage('user', newMessage, { type: 'user_input' });
    setNewMessage('');
    setShowQuickResponses(false);

    // Simulate intelligent AI response based on message content
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const response = generateIntelligentResponse(newMessage);
        addMessage('assistant', response, { type: 'agent_status' });
      }, 1000 + Math.random() * 2000);
    }, 500);
  };

  const generateIntelligentResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('budget') || msg.includes('cost') || msg.includes('price')) {
      return "I understand budget is important! Based on your requirements, I'm finding options that give you the best value. I can also show you premium alternatives if you're flexible.";
    }
    
    if (msg.includes('activity') || msg.includes('things to do') || msg.includes('attractions')) {
      return "Great question about activities! I'm curating experiences based on your interests. I'll include both must-see attractions and local favorites that most tourists miss.";
    }
    
    if (msg.includes('food') || msg.includes('restaurant') || msg.includes('dining')) {
      return "Excellent choice focusing on food! Paris has incredible dining. I'm including a mix of Michelin-starred restaurants, charming bistros, and local food tours in your itinerary.";
    }
    
    if (msg.includes('hotel') || msg.includes('accommodation') || msg.includes('stay')) {
      return "For accommodation, I'm prioritizing location and reviews. I've found places that are perfectly positioned for your planned activities with excellent guest ratings.";
    }
    
    if (msg.includes('flight') || msg.includes('airline') || msg.includes('departure')) {
      return "For flights, I'm balancing convenience, price, and airline quality. I can show you direct flights for speed or connecting flights if you want to save money.";
    }
    
    if (msg.includes('book') || msg.includes('confirm') || msg.includes('reserve')) {
      return "Ready to book? Perfect! I'll walk you through each component so you can review everything before confirming. Everything looks great from my analysis!";
    }
    
    if (msg.includes('change') || msg.includes('modify') || msg.includes('different')) {
      return "No problem at all! I can easily adjust any part of your itinerary. What would you like to modify? I'll find alternatives that match your preferences.";
    }
    
    // Default intelligent response
    const responses = [
      "That's a great point! Let me incorporate that into your planning. I'm always learning to make your trip even better.",
      "I understand exactly what you're looking for. Give me a moment to optimize your itinerary based on that preference.",
      "Absolutely! I'll make sure to factor that in. Your trip should be exactly what you envision.",
      "Perfect insight! That helps me personalize your experience even more. I'm updating your recommendations now."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleQuickResponse = (response: string) => {
    addMessage('user', response, { type: 'user_input' });
    setShowQuickResponses(false);
    
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const aiResponse = generateIntelligentResponse(response);
        addMessage('assistant', aiResponse, { type: 'agent_status' });
      }, 1500);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const createSnapshot = () => {
    const snapshot: ItinerarySnapshot = {
      id: Date.now().toString(),
      label: `Snapshot ${snapshots.length + 1}`,
      timestamp: Date.now(),
      progress: Math.min(85 + snapshots.length * 5, 100),
      sections: ['flights', 'accommodation', 'activities']
    };
    setSnapshots(prev => [...prev, snapshot]);
    addMessage('assistant', "📸 Snapshot saved! You can return to this version anytime if you want to try different options.", { type: 'agent_status' });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageIcon = (message: ConversationMessage) => {
    if (message.role === 'user') return <User className="h-4 w-4" />;
    if (message.metadata?.type === 'search_result') {
      if (message.metadata.section === 'flights') return <Plane className="h-4 w-4" />;
      if (message.metadata.section === 'accommodation') return <Hotel className="h-4 w-4" />;
      if (message.metadata.section === 'activities') return <MapPin className="h-4 w-4" />;
    }
    if (message.metadata?.type === 'recommendation') return <Sparkles className="h-4 w-4" />;
    return <Bot className="h-4 w-4" />;
  };

  const getMessageBadge = (message: ConversationMessage) => {
    if (message.metadata?.type === 'search_result' && message.metadata.section) {
      return (
        <Badge variant="secondary" className="text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          {message.metadata.section}
        </Badge>
      );
    }
    if (message.metadata?.type === 'recommendation') {
      return (
        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
          <Sparkles className="h-3 w-3 mr-1" />
          suggestion
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className={`flex flex-col h-full bg-white border-l ${className}`}>
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <div className="p-1.5 bg-blue-500 rounded-full">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            AI Travel Assistant
          </h3>
          {onToggle && (
            <Button variant="ghost" size="sm" onClick={onToggle}>
              ×
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Online</span>
          </div>
          <Separator orientation="vertical" className="h-3" />
          <span>{messages.length} messages</span>
          <Separator orientation="vertical" className="h-3" />
          <span>Session: {conversationId}</span>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}>
                {message.role !== 'user' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className={`
                      ${message.metadata?.type === 'search_result' ? 'bg-green-100 text-green-600' :
                        message.metadata?.type === 'recommendation' ? 'bg-purple-100 text-purple-600' :
                        'bg-blue-100 text-blue-600'}
                    `}>
                      {getMessageIcon(message)}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[85%] ${
                  message.role === 'user' ? 'order-first' : ''
                }`}>
                  <div className={`rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : message.metadata?.type === 'search_result'
                      ? 'bg-green-50 text-green-900 border border-green-200'
                      : message.metadata?.type === 'recommendation'
                      ? 'bg-purple-50 text-purple-900 border border-purple-200'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    
                    {/* Show data preview for search results */}
                    {message.metadata?.data && (
                      <div className="mt-2 p-2 bg-white rounded border text-xs">
                        {message.metadata.section === 'flights' && (
                          <div className="flex justify-between">
                            <span>{message.metadata.data.airline}</span>
                            <span>${message.metadata.data.price}</span>
                          </div>
                        )}
                        {message.metadata.section === 'accommodation' && (
                          <div>
                            <div className="font-medium">{message.metadata.data.name}</div>
                            <div className="text-gray-600">⭐ {message.metadata.data.rating} • {message.metadata.data.location}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {formatTime(message.timestamp)}
                      </span>
                      {getMessageBadge(message)}
                    </div>
                  </div>
                </div>

                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-green-100 text-green-600">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-xs text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Quick Responses */}
      {showQuickResponses && !isTyping && (
        <div className="p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-600 mb-2">Quick responses:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_RESPONSES.slice(0, 4).map((response, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickResponse(response)}
                className="text-xs h-7"
              >
                {response}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2 mb-3">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your trip..."
            className="flex-1"
            disabled={isTyping}
          />
          <Button onClick={handleSendMessage} size="sm" disabled={!newMessage.trim() || isTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={createSnapshot}
            variant="outline" 
            size="sm"
          >
            <Camera className="h-3 w-3 mr-1" />
            Snapshot
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-3 w-3 mr-1" />
            Export Chat
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowQuickResponses(!showQuickResponses)}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Suggestions
          </Button>
        </div>
      </div>

      {/* Snapshots */}
      {snapshots.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Saved Snapshots ({snapshots.length})
          </h4>
          
          <div className="space-y-2">
            {snapshots.slice(-3).map((snapshot) => (
              <div 
                key={snapshot.id}
                className="flex items-center justify-between p-2 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{snapshot.label}</p>
                  <p className="text-xs text-gray-500">
                    {formatTime(snapshot.timestamp)} • {snapshot.progress}% complete
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 