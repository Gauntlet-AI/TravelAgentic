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
    <Card className={`${className} flex flex-col`}>
      {/* Sticky Header */}
      <CardHeader className="pb-3 sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">AI Assistant</CardTitle>
          {isMobile && (
            <Button variant="ghost" size="sm" onClick={onToggle}>
              ×
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col flex-1 relative">
        {/* Sticky Empty State Message */}
        {messages.length === 0 && (
          <div className="sticky top-16 bg-white z-10 text-center text-muted-foreground py-8 ">
            <MessageCircle className="mx-auto mb-2" size={32} />
            <p>Ask me anything about your vacation plans!</p>
          </div>
        )}
        
        {/* Scrollable Messages Area */}
        <ScrollArea className="flex-1 p-4" style={{ height: messages.length === 0 ? '300px' : '400px' }}>
          {messages.map((message) => (
            <div key={message.id} className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}>
              <div
                className={`inline-block max-w-[80%] p-3 rounded-lg ${
                  message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="text-left">
              <div className="inline-block bg-gray-100 text-gray-900 p-3 rounded-lg">AI is thinking...</div>
            </div>
          )}
        </ScrollArea>
        
        {/* Sticky Input Form */}
        <div className="sticky bottom-0 bg-white z-10 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about destinations, activities, budget..."
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
