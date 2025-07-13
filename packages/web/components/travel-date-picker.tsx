'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Interface for the date range value
export interface DateRange {
  startDate: Date | undefined;
  endDate: Date | undefined;
}

// Props for the travel date picker component
interface TravelDatePickerProps {
  value: DateRange;
  onValueChange: (range: DateRange) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  numberOfMonths?: number;
  disabled?: boolean;
}

/**
 * TravelDatePicker - A reusable date range picker component for travel dates
 * 
 * Features:
 * - Three-click behavior: first date, second date, reset
 * - Hover preview for date ranges
 * - Disables past dates
 * - Proper range styling with start, middle, and end modifiers
 * - Smart date formatting for display
 */
export function TravelDatePicker({
  value,
  onValueChange,
  label = "Travel dates",
  placeholder = "Select travel dates",
  className = "",
  buttonClassName = "",
  numberOfMonths = 1,
  disabled = false
}: TravelDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<Date | undefined>();

  const { startDate, endDate } = value;

  // Handle date selection with three-click behavior
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate || disabled) return;

    if (!startDate) {
      // First click: select start date
      onValueChange({
        startDate: selectedDate,
        endDate: undefined
      });
      setHoveredDate(undefined);
    } else if (!endDate) {
      // Second click: select end date and close picker
      onValueChange({
        startDate,
        endDate: selectedDate
      });
      setHoveredDate(undefined);
      setIsOpen(false);
    } else {
      // Third click: reset to new start date, clear end date
      onValueChange({
        startDate: selectedDate,
        endDate: undefined
      });
      setHoveredDate(undefined);
      // Keep picker open for selecting end date
    }
  };

  // Get the display range including hover preview
  const getDisplayRange = () => {
    if (!startDate) return undefined;

    if (endDate) {
      // Both dates selected - show actual range
      const range = {
        from: startDate < endDate ? startDate : endDate,
        to: startDate < endDate ? endDate : startDate,
      };
      return range;
    }

    if (hoveredDate && startDate) {
      // Show hover preview between start date and hovered date
      const range = {
        from: startDate < hoveredDate ? startDate : hoveredDate,
        to: startDate < hoveredDate ? hoveredDate : startDate,
      };
      return range;
    }

    return { from: startDate, to: undefined }; // Only start date selected
  };

  // Format the display text for the button
  const getDisplayText = () => {
    if (!startDate) return placeholder;

    if (endDate) {
      const orderedStartDate = startDate < endDate ? startDate : endDate;
      const orderedEndDate = startDate < endDate ? endDate : startDate;
      
      if (numberOfMonths === 1) {
        // Mobile format - shorter
        return `${format(orderedStartDate, 'PPP')} - ${format(orderedEndDate, 'PPP')}`;
      } else {
        // Desktop format - more compact
        return `${format(orderedStartDate, 'MMM d')} - ${format(orderedEndDate, 'MMM d')}`;
      }
    }

    if (numberOfMonths === 1) {
      return `${format(startDate, 'PPP')} - Select end date`;
    } else {
      return `${format(startDate, 'MMM d')} - Select end date`;
    }
  };

  // Calculate range middle days for styling
  const getRangeMiddleDays = () => {
    const range = getDisplayRange();
    
    if (!range?.from || !range?.to) return [];

    const days = [];
    const start = new Date(range.from);
    const end = new Date(range.to);

    // Make sure we're comparing dates correctly
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const current = new Date(start);
    current.setDate(current.getDate() + 1); // Start from day after start

    while (current < end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  // Check if a date is in the past
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="flex items-center gap-2 text-sm font-medium">
          <CalendarIcon size={16} />
          {label}
        </Label>
      )}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={`w-full justify-start border border-gray-400 bg-transparent text-left font-normal ${buttonClassName}`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getDisplayText()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={handleDateSelect}
            onDayMouseEnter={(day) => {
              if (startDate && !endDate) {
                setHoveredDate(day);
              }
            }}
            onDayMouseLeave={() => {
              if (startDate && !endDate) {
                setHoveredDate(undefined);
              }
            }}
            disabled={isPastDate}
            numberOfMonths={numberOfMonths}
            initialFocus
            modifiers={{
              range_start: startDate ? [startDate] : [],
              range_end: endDate ? [endDate] : [],
              range_middle: getRangeMiddleDays(),
              past: isPastDate,
            }}
            modifiersClassNames={{
              range_start: 'bg-primary text-primary-foreground',
              range_end: 'bg-primary text-primary-foreground',
              range_middle: 'bg-accent text-accent-foreground',
              past: 'text-muted-foreground opacity-30 cursor-not-allowed bg-gray-100',
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Hook for managing travel date picker state
export function useTravelDatePicker(initialValue?: DateRange) {
  const [dateRange, setDateRange] = useState<DateRange>(
    initialValue || { startDate: undefined, endDate: undefined }
  );

  const isComplete = dateRange.startDate && dateRange.endDate;
  
  const getOrderedDates = () => {
    if (!isComplete) return { startDate: undefined, endDate: undefined };
    
    const { startDate, endDate } = dateRange;
    return {
      startDate: startDate! < endDate! ? startDate : endDate,
      endDate: startDate! < endDate! ? endDate : startDate,
    };
  };

  const reset = () => {
    setDateRange({ startDate: undefined, endDate: undefined });
  };

  const setStartDate = (date: Date | undefined) => {
    setDateRange(prev => ({ ...prev, startDate: date }));
  };

  const setEndDate = (date: Date | undefined) => {
    setDateRange(prev => ({ ...prev, endDate: date }));
  };

  return {
    dateRange,
    setDateRange,
    isComplete,
    getOrderedDates,
    reset,
    setStartDate,
    setEndDate,
  };
}

// Utility function to get number of days between two dates
export function getDaysBetween(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

// Utility function to format date range for display
export function formatDateRange(
  startDate: Date | undefined, 
  endDate: Date | undefined, 
  options?: {
    compact?: boolean;
    includeYear?: boolean;
  }
): string {
  if (!startDate) return "No dates selected";
  
  const { compact = false, includeYear = false } = options || {};
  
  if (!endDate) {
    const formatString = compact ? 'MMM d' : includeYear ? 'PPP' : 'MMM d, yyyy';
    return `${format(startDate, formatString)} - Select end date`;
  }

  const orderedStart = startDate < endDate ? startDate : endDate;
  const orderedEnd = startDate < endDate ? endDate : startDate;
  
  if (compact) {
    return `${format(orderedStart, 'MMM d')} - ${format(orderedEnd, 'MMM d')}`;
  }
  
  const formatString = includeYear ? 'PPP' : 'MMM d, yyyy';
  return `${format(orderedStart, formatString)} - ${format(orderedEnd, formatString)}`;
} 