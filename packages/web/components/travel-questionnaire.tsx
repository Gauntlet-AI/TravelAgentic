'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, CheckCircle, MapPin, Plane, Users, DollarSign, Home, Activity, Clock, HelpCircle, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

export interface TravelQuestion {
  id: string;
  question: string;
  type: 'text' | 'select' | 'radio' | 'checkbox' | 'date' | 'quick-select' | 'number-picker' | 'location-search';
  options?: string[];
  required: boolean;
  category: 'basics' | 'preferences' | 'logistics' | 'budget' | 'activities';
  icon?: React.ReactNode;
  subtitle?: string;
  defaultValue?: string | number;
  quickOptions?: Array<{ value: string; label: string; popular?: boolean }>;
}

export interface QuestionnaireResponse {
  questionId: string;
  answer: string | string[] | null;
  isUnsure: boolean;
}

export interface TravelQuestionnaireProps {
  onComplete: (responses: QuestionnaireResponse[]) => void;
  onAnswerChange?: (questionId: string, answer: string | string[] | null, isUnsure: boolean) => void;
  automationLevel?: number;
}

// Enhanced travel questions with better UX
const travelQuestions: TravelQuestion[] = [
  {
    id: 'trip-purpose',
    question: 'What type of trip are you planning?',
    subtitle: 'This helps us tailor the entire experience',
    type: 'quick-select',
    required: true,
    category: 'basics',
    icon: <Plane className="h-4 w-4" />,
    quickOptions: [
      { value: 'leisure', label: 'Leisure/Vacation', popular: true },
      { value: 'business', label: 'Business Trip' },
      { value: 'family', label: 'Family Visit', popular: true },
      { value: 'romance', label: 'Romantic Getaway', popular: true },
      { value: 'adventure', label: 'Adventure/Sports' },
      { value: 'education', label: 'Educational/Cultural' }
    ]
  },
  {
    id: 'departure-location',
    question: 'Where are you departing from?',
    subtitle: 'City, airport, or region',
    type: 'location-search',
    required: true,
    category: 'basics',
    icon: <MapPin className="h-4 w-4" />
  },
  {
    id: 'destination',
    question: 'Where would you like to go?',
    subtitle: 'City, country, or region',
    type: 'location-search',
    required: true,
    category: 'basics',
    icon: <MapPin className="h-4 w-4" />
  },
  {
    id: 'travelers',
    question: 'How many travelers?',
    subtitle: 'Including yourself',
    type: 'number-picker',
    required: true,
    category: 'basics',
    icon: <Users className="h-4 w-4" />,
    defaultValue: 2
  },
  {
    id: 'departure-date',
    question: 'When would you like to depart?',
    subtitle: 'Select your preferred departure date',
    type: 'date',
    required: true,
    category: 'basics',
    icon: <CalendarIcon className="h-4 w-4" />
  },
  {
    id: 'trip-duration',
    question: 'How long is your trip?',
    subtitle: 'Approximate duration',
    type: 'quick-select',
    required: true,
    category: 'basics',
    icon: <Clock className="h-4 w-4" />,
    quickOptions: [
      { value: '2-3', label: '2-3 days', popular: true },
      { value: '4-5', label: '4-5 days', popular: true },
      { value: '1-week', label: '1 week', popular: true },
      { value: '2-weeks', label: '2 weeks' },
      { value: '3-weeks', label: '3+ weeks' },
      { value: 'flexible', label: 'Flexible' }
    ]
  },
  {
    id: 'budget-range',
    question: 'What\'s your budget range?',
    subtitle: 'Total budget for all travelers',
    type: 'quick-select',
    required: false,
    category: 'budget',
    icon: <DollarSign className="h-4 w-4" />,
    quickOptions: [
      { value: 'budget', label: 'Budget-friendly (Under $2k)', popular: true },
      { value: 'mid-range', label: 'Mid-range ($2k-$5k)', popular: true },
      { value: 'premium', label: 'Premium ($5k-$10k)', popular: true },
      { value: 'luxury', label: 'Luxury ($10k+)' },
      { value: 'flexible', label: 'Flexible/Open' }
    ]
  },
  {
    id: 'accommodation-type',
    question: 'Where would you like to stay?',
    subtitle: 'Choose your preferred accommodation style',
    type: 'quick-select',
    required: false,
    category: 'preferences',
    icon: <Home className="h-4 w-4" />,
    quickOptions: [
      { value: 'hotel', label: 'Hotel', popular: true },
      { value: 'vacation-rental', label: 'Vacation Rental/Airbnb', popular: true },
      { value: 'resort', label: 'Resort', popular: true },
      { value: 'boutique', label: 'Boutique Hotel' },
      { value: 'hostel', label: 'Hostel' },
      { value: 'mixed', label: 'Mix of options' }
    ]
  },
  {
    id: 'activity-preferences',
    question: 'What interests you most?',
    subtitle: 'Select all that apply - helps us plan activities',
    type: 'checkbox',
    required: false,
    category: 'activities',
    icon: <Activity className="h-4 w-4" />,
    options: [
      'Cultural sites & museums',
      'Food & local cuisine',
      'Nature & outdoor activities',
      'Shopping & markets',
      'Nightlife & entertainment',
      'Adventure sports',
      'Relaxation & spa',
      'Photography & sightseeing',
      'Local experiences & tours'
    ]
  },
  {
    id: 'travel-style',
    question: 'How do you prefer to travel?',
    subtitle: 'Your travel personality',
    type: 'quick-select',
    required: false,
    category: 'preferences',
    icon: <Plane className="h-4 w-4" />,
    quickOptions: [
      { value: 'planned', label: 'Well-planned itinerary', popular: true },
      { value: 'flexible', label: 'Flexible & spontaneous', popular: true },
      { value: 'mix', label: 'Mix of both', popular: true },
      { value: 'local', label: 'Local & authentic' },
      { value: 'comfort', label: 'Comfort & convenience' }
    ]
  },
  {
    id: 'special-requirements',
    question: 'Any special requirements?',
    subtitle: 'Dietary, accessibility, or other needs',
    type: 'checkbox',
    required: false,
    category: 'logistics',
    icon: <HelpCircle className="h-4 w-4" />,
    options: [
      'Vegetarian/Vegan options',
      'Accessibility features needed',
      'Traveling with pets',
      'Child-friendly activities',
      'Dietary restrictions/allergies',
      'Language assistance needed',
      'Medical considerations',
      'None of the above'
    ]
  }
];

export default function TravelQuestionnaire({ onComplete, onAnswerChange, automationLevel = 1 }: TravelQuestionnaireProps) {
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [currentSection, setCurrentSection] = useState<'basics' | 'preferences' | 'logistics' | 'budget' | 'activities'>('basics');

  const sections = [
    { id: 'basics', label: 'Basics', icon: <Plane className="h-4 w-4" /> },
    { id: 'preferences', label: 'Preferences', icon: <Home className="h-4 w-4" /> },
    { id: 'activities', label: 'Activities', icon: <Activity className="h-4 w-4" /> },
    { id: 'logistics', label: 'Details', icon: <HelpCircle className="h-4 w-4" /> }
  ];

  const currentQuestions = travelQuestions.filter(q => q.category === currentSection);
  const completedQuestions = responses.filter(r => r.answer !== null || r.isUnsure).length;
  const totalQuestions = travelQuestions.length;
  const progress = (completedQuestions / totalQuestions) * 100;

  const getCurrentResponse = (questionId: string): QuestionnaireResponse | undefined => {
    return responses.find(r => r.questionId === questionId);
  };

  const updateResponse = (questionId: string, answer: string | string[] | null, isUnsure: boolean = false) => {
    const newResponse: QuestionnaireResponse = {
      questionId,
      answer,
      isUnsure
    };

    setResponses(prev => {
      const existing = prev.findIndex(r => r.questionId === questionId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newResponse;
        return updated;
      }
      return [...prev, newResponse];
    });

    if (onAnswerChange) {
      onAnswerChange(questionId, answer, isUnsure);
    }
  };

  const handleComplete = () => {
    setIsComplete(true);
    onComplete(responses);
  };

  const canCompleteSection = (section: string) => {
    const sectionQuestions = travelQuestions.filter(q => q.category === section);
    const requiredQuestions = sectionQuestions.filter(q => q.required);
    const answeredRequired = requiredQuestions.filter(q => {
      const response = getCurrentResponse(q.id);
      return response && (response.answer || response.isUnsure);
    });
    return answeredRequired.length === requiredQuestions.length;
  };

  const renderQuestionInput = (question: TravelQuestion) => {
    const currentResponse = getCurrentResponse(question.id);
    const currentAnswer = currentResponse?.answer || '';
    const isUnsure = currentResponse?.isUnsure || false;

    if (isUnsure) {
      return (
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 text-yellow-700">
            <HelpCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Marked as "Let AI decide"</span>
          </div>
          <p className="text-sm text-yellow-600 mt-1">
            Our AI agents will help you with this during planning.
          </p>
        </div>
      );
    }

    switch (question.type) {
      case 'quick-select':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.quickOptions?.map((option) => (
              <Button
                key={option.value}
                variant={currentAnswer === option.value ? 'default' : 'outline'}
                onClick={() => updateResponse(question.id, option.value)}
                className="justify-start h-auto p-4 text-left"
              >
                <div className="flex items-center justify-between w-full">
                  <span>{option.label}</span>
                  {option.popular && (
                    <Badge variant="secondary" className="ml-2 text-xs">Popular</Badge>
                  )}
                </div>
              </Button>
            ))}
          </div>
        );

             case 'number-picker':
         return (
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => {
                   const current = Number(currentAnswer) || Number(question.defaultValue) || 1;
                   if (current > 1) updateResponse(question.id, String(current - 1));
                 }}
                 disabled={Number(currentAnswer) <= 1}
               >
                 -
               </Button>
               <div className="w-16 text-center">
                 <Input
                   type="number"
                   value={currentAnswer || question.defaultValue || 1}
                   onChange={(e) => updateResponse(question.id, e.target.value)}
                   className="text-center"
                   min="1"
                   max="20"
                 />
               </div>
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => {
                   const current = Number(currentAnswer) || Number(question.defaultValue) || 1;
                   if (current < 20) updateResponse(question.id, String(current + 1));
                 }}
                 disabled={Number(currentAnswer) >= 20}
               >
                 +
               </Button>
             </div>
             <span className="text-sm text-gray-500">
               {Number(currentAnswer) === 1 ? 'traveler' : 'travelers'}
             </span>
           </div>
         );

      case 'location-search':
        return (
          <Input
            placeholder="Type a city, airport, or region..."
            value={currentAnswer as string}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            className="w-full"
          />
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {currentAnswer ? format(new Date(currentAnswer as string), 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={currentAnswer ? new Date(currentAnswer as string) : undefined}
                onSelect={(date) => updateResponse(question.id, date?.toISOString() || '')}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'checkbox':
        const selectedOptions = (currentAnswer as string[]) || [];
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  id={option}
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateResponse(question.id, [...selectedOptions, option]);
                    } else {
                      updateResponse(question.id, selectedOptions.filter(o => o !== option));
                    }
                  }}
                />
                <Label htmlFor={option} className="text-sm font-medium cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <Input
            placeholder="Type your answer..."
            value={currentAnswer as string}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            className="w-full"
          />
        );
    }
  };

  if (isComplete) {
    return (
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <h2 className="text-2xl font-bold text-green-700">All Set!</h2>
        </div>
        <p className="text-gray-600 text-lg">
          Perfect! We've collected your travel preferences. Our AI agents are ready to create your personalized itinerary.
        </p>
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="font-semibold text-blue-700">Questions Answered</div>
            <div className="text-2xl font-bold text-blue-600">{responses.length}</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="font-semibold text-purple-700">AI Assistance</div>
            <div className="text-2xl font-bold text-purple-600">{responses.filter(r => r.isUnsure).length}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Travel Questionnaire</h2>
        </div>
        <p className="text-gray-600">Help us plan your perfect trip</p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-500">{completedQuestions} of {totalQuestions} questions completed</p>
      </div>

      {/* Section Navigation */}
      <div className="flex justify-center">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={currentSection === section.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentSection(section.id as any)}
              className="flex items-center gap-2"
            >
              {section.icon}
              {section.label}
              {canCompleteSection(section.id) && (
                <CheckCircle className="h-3 w-3 text-green-500" />
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {currentQuestions.map((question) => (
          <Card key={question.id} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    {question.icon}
                  </div>
                  <div className="flex-1">
                    <Label className="text-base font-semibold text-gray-900">
                      {question.question}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {question.subtitle && (
                      <p className="text-sm text-gray-500 mt-1">{question.subtitle}</p>
                    )}
                  </div>
                </div>
                
                {renderQuestionInput(question)}
                
                {/* Let AI Decide Option */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateResponse(question.id, null, true)}
                    className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Let AI decide this for me
                  </Button>
                  
                  {getCurrentResponse(question.id) && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Complete Button */}
      {currentSection === 'logistics' && (
        <div className="text-center pt-6">
          <Button
            onClick={handleComplete}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            Complete Questionnaire
            <CheckCircle className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
} 