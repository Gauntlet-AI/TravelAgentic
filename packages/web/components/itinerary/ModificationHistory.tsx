/**
 * Modification History Component - Placeholder
 * Placeholder component for Phase 4 modification history tracking
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, RotateCcw } from 'lucide-react';

interface ModificationHistoryProps {
  itineraryId: string;
  onRevert?: (modification: any) => void;
}

export default function ModificationHistory({ itineraryId, onRevert }: ModificationHistoryProps) {
  const mockHistory = [
    {
      id: 'mod_1',
      timestamp: '2024-01-15 14:30',
      type: 'time_change',
      description: 'Changed dinner time to 8:00 PM',
      status: 'applied'
    },
    {
      id: 'mod_2',
      timestamp: '2024-01-15 14:25',
      type: 'addition',
      description: 'Added museum visit',
      status: 'applied'
    },
    {
      id: 'mod_3',
      timestamp: '2024-01-15 14:20',
      type: 'budget_filter',
      description: 'Applied budget filter under $100',
      status: 'reverted'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Modification History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockHistory.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{item.description}</p>
                <p className="text-sm text-gray-600">{item.timestamp}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={item.status === 'applied' ? 'default' : 'outline'}
                >
                  {item.status}
                </Badge>
                {item.status === 'applied' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onRevert?.({ id: item.id, type: 'revert' })}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Revert
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 