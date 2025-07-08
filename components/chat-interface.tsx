"use client"

import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, MessageCircle } from "lucide-react"

interface ChatInterfaceProps {
  className?: string
  isMobile?: boolean
  isCollapsed?: boolean
  onToggle?: () => void
}

export function ChatInterface({ className, isMobile, isCollapsed, onToggle }: ChatInterfaceProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()

  if (isMobile && isCollapsed) {
    return (
      <div className={`${className} bg-blue-500 text-white p-4 cursor-pointer`} onClick={onToggle}>
        <div className="flex items-center justify-center gap-2">
          <MessageCircle size={20} />
          <span>Chat with AI Assistant</span>
        </div>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">AI Assistant</CardTitle>
          {isMobile && (
            <Button variant="ghost" size="sm" onClick={onToggle}>
              ×
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] p-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="mx-auto mb-4" size={32} />
              <p className="mb-4">Hi! I'm your AI Travel Agent 🚀</p>
              <div className="text-sm space-y-2 max-w-xs mx-auto">
                <p className="font-medium">I can take action for you:</p>
                <ul className="text-left space-y-1">
                  <li>• 🔍 Search flights in real-time</li>
                  <li>• 🏨 Find and compare hotels</li>
                  <li>• 🎯 Discover activities & attractions</li>
                  <li>• 💰 Check prices and availability</li>
                  <li>• 📋 Create personalized recommendations</li>
                </ul>
                <p className="pt-2 text-xs text-gray-500">
                  Try: "Find flights from NYC to Tokyo for March 15th" or "Search hotels in Paris for 2 nights"
                </p>
              </div>
            </div>
          )}
          {messages.map((message) => (
            <div key={message.id} className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}>
              <div
                className={`inline-block max-w-[80%] p-3 rounded-lg ${
                  message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                }`}
              >
                {message.content}
                
                {/* Show tool calls if they exist */}
                {message.toolInvocations && message.toolInvocations.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.toolInvocations.map((tool, index) => (
                      <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm">
                        <div className="flex items-center gap-2 text-blue-700 font-medium">
                          {tool.toolName === 'searchFlights' && '✈️ Searching flights...'}
                          {tool.toolName === 'searchHotels' && '🏨 Searching hotels...'}  
                          {tool.toolName === 'searchActivities' && '🎯 Searching activities...'}
                        </div>
                        {'result' in tool && tool.result && (
                          <div className="mt-1 text-gray-600 text-xs">
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
          ))}
          {isLoading && (
            <div className="text-left">
              <div className="inline-block bg-gray-100 text-gray-900 p-3 rounded-lg">AI is thinking...</div>
            </div>
          )}
        </ScrollArea>
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="e.g., 'Find flights to Tokyo for March 15' or 'Search budget hotels in Barcelona'"
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              <Send size={16} />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
