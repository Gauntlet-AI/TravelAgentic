'use client';

import { MessageCircle } from 'lucide-react';

import { useState } from 'react';

import { ChatInterface } from '@/components/chat-interface';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MobileChatBubbleProps {
  className?: string;
}

export function MobileChatBubble({ className }: MobileChatBubbleProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Bubble */}
      <Button
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-blue-600 shadow-lg transition-all duration-300 ease-in-out hover:scale-110 hover:bg-blue-700 active:scale-95 ${className} `}
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>

      {/* Chat Modal */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="fixed bottom-0 top-auto h-[85vh] w-[95vw] max-w-none translate-y-0 gap-0 rounded-t-2xl p-0">
          <DialogHeader className="rounded-t-2xl bg-white p-4 pb-2">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">
                AI Assistant
              </DialogTitle>
              {/* Built-in Dialog close button handles closing, so custom button removed to prevent duplicate X icons */}
            </div>
          </DialogHeader>

          {/* Chat Interface without outer card styling */}
          <div className="flex h-full flex-1 flex-col overflow-hidden">
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
  );
}
