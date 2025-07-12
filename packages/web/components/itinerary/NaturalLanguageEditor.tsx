/**
 * Natural Language Editor Component - Placeholder
 * Placeholder component for Phase 4 natural language editing
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface NaturalLanguageEditorProps {
  onModification?: (modification: any) => void;
}

export default function NaturalLanguageEditor({ onModification }: NaturalLanguageEditorProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && onModification) {
      onModification({
        type: 'natural_language',
        request: message,
        description: `Natural language request: ${message}`
      });
      setMessage('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Natural Language Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Describe what you'd like to change about your itinerary in natural language.
          </p>
          
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Move dinner to 8 PM or Add a museum visit"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} disabled={!message.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="text-xs text-gray-500">
            Try phrases like: "make dinner earlier", "add a museum visit", "find cheaper hotel"
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 