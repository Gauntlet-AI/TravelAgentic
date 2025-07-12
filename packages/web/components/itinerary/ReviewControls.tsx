/**
 * Review Controls Component - Placeholder
 * Placeholder component for Phase 4 review controls
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReviewControlsProps {
  onModification?: (modification: any) => void;
}

export default function ReviewControls({ onModification }: ReviewControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={() => onModification?.({ type: 'shuffle' })}>
            Shuffle Activities
          </Button>
          <Button variant="outline" onClick={() => onModification?.({ type: 'optimize' })}>
            Optimize Schedule
          </Button>
          <Button variant="outline" onClick={() => onModification?.({ type: 'add_activity' })}>
            Add Activity
          </Button>
          <Button variant="outline" onClick={() => onModification?.({ type: 'change_budget' })}>
            Adjust Budget
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 