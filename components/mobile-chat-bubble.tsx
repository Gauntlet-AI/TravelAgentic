"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChatInterface } from "@/components/chat-interface"
import { MessageCircle } from "lucide-react"

interface MobileChatBubbleProps {
  className?: string
}

export function MobileChatBubble({ className }: MobileChatBubbleProps) {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <>
      {/* Floating Chat Bubble */}
      <Button
        onClick={() => setIsChatOpen(true)}
        className={`
          fixed bottom-6 right-6 z-50 
          w-14 h-14 rounded-full shadow-lg 
          bg-blue-600 hover:bg-blue-700 
          transition-all duration-300 ease-in-out
          hover:scale-110 active:scale-95
          ${className}
        `}
        size="icon"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </Button>

      {/* Chat Modal */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="w-[95vw] h-[85vh] max-w-none p-0 gap-0 rounded-t-2xl fixed bottom-0 top-auto translate-y-0">
          <DialogHeader className="p-4 pb-2 bg-white rounded-t-2xl">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">AI Assistant</DialogTitle>
              {/* Built-in Dialog close button handles closing, so custom button removed to prevent duplicate X icons */}
            </div>
          </DialogHeader>
          
          {/* Chat Interface without outer card styling */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <ChatInterface 
              className="h-full"
              isMobile={true}
              isCollapsed={false}
              hideCard={true}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 