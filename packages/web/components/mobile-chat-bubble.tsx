'use client';

import { MessageCircle, X } from 'lucide-react';

import { useState } from 'react';

import { ChatInterface } from '@/components/chat-interface';
import { Button } from '@/components/ui/button';
// Dialog removed to keep ChatInterface mounted and preserve state

import type { TravelDetails } from '@/lib/mock-data';

interface MobileChatBubbleProps {
  className?: string;
  travelDetails?: TravelDetails | null;
  onTabChange?: (tabValue: string) => void;
  customSystemPrompt?: string;
  customPlaceholder?: string;
  customEmptyStateMessage?: string;
  initialMessage?: string;
  mode?: string;
  onTripInfoUpdate?: (info: any) => void;
  tripInfoComplete?: boolean;
}

export function MobileChatBubble({
  className,
  travelDetails,
  onTabChange,
  customSystemPrompt,
  customPlaceholder,
  customEmptyStateMessage,
  initialMessage,
  mode,
  onTripInfoUpdate,
  tripInfoComplete,
}: MobileChatBubbleProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Bubble */}
      <Button
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-6 right-6 z-50 h-14 px-4 rounded-full bg-blue-600 shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:bg-blue-700 active:scale-95 flex items-center gap-2 ${className}`}
      >
        <MessageCircle className="h-6 w-6 text-white" />
        <span className="text-white font-medium text-sm">AI Travel Assistant</span>
      </Button>

      {/* Slide-up Chat Panel (remains mounted to preserve state) */}
      <div
        className={`fixed bottom-0 left-1/2 z-50 h-[85vh] w-[95vw] max-w-none -translate-x-1/2 transform rounded-t-2xl bg-white shadow-lg transition-transform duration-300 ease-in-out ${{
          true: 'pointer-events-auto translate-y-0',
          false: 'pointer-events-none translate-y-full',
        }[String(isChatOpen) as 'true' | 'false']}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-2xl bg-white p-4 pb-2 shadow-md">
          <span className="text-lg font-semibold">AI Travel Assistant</span>
          <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Chat Interface without outer card styling */}
        <div className="flex h-[calc(100%-48px)] flex-col overflow-hidden">
          <ChatInterface
            className="h-full"
            isMobile={true}
            isCollapsed={false}
            hideCard={true}
            travelDetails={travelDetails}
            onTabChange={onTabChange}
            customSystemPrompt={customSystemPrompt}
            customPlaceholder={customPlaceholder}
            customEmptyStateMessage={customEmptyStateMessage}
            initialMessage={initialMessage}
            mode={mode}
            onTripInfoUpdate={onTripInfoUpdate}
            tripInfoComplete={tripInfoComplete}
          />
        </div>
      </div>
    </>
  );
}
