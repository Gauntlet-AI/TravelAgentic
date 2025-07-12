/**
 * Itinerary Finalization Page
 * Main page for finalizing bookings and completing the travel booking process
 * Integrates all Phase 5 components for a complete booking experience
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ItineraryFinalization from '@/components/itinerary/ItineraryFinalization';
import BookingStatus from '@/components/itinerary/BookingStatus';
import BookingConfirmation from '@/components/itinerary/BookingConfirmation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';

// Types for page state
interface PageState {
  mode: 'finalize' | 'status' | 'confirmation';
  itineraryId?: string;
  finalizationId?: string;
  confirmationNumber?: string;
  error?: string;
}

interface ItineraryData {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  days: any[];
  totalCost: number;
}

/**
 * Finalization Page Component
 */
export default function FinalizePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [pageState, setPageState] = useState<PageState>({
    mode: 'finalize'
  });
  const [itineraryData, setItineraryData] = useState<ItineraryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get parameters from URL
  useEffect(() => {
    const itineraryId = searchParams.get('itineraryId');
    const finalizationId = searchParams.get('finalizationId');
    const confirmationNumber = searchParams.get('confirmation');
    const mode = searchParams.get('mode') as 'finalize' | 'status' | 'confirmation' || 'finalize';

    setPageState({
      mode,
      itineraryId: itineraryId || undefined,
      finalizationId: finalizationId || undefined,
      confirmationNumber: confirmationNumber || undefined
    });

    // Load itinerary data if available
    if (itineraryId) {
      loadItineraryData(itineraryId);
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  /**
   * Load itinerary data
   */
  const loadItineraryData = async (itineraryId: string) => {
    try {
      // In a real implementation, this would fetch from the database
      // For now, use mock data
      const mockData: ItineraryData = {
        id: itineraryId,
        destination: 'Paris, France',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        travelers: 2,
        totalCost: 1555,
        days: [
          {
            dayNumber: 1,
            title: 'Arrival Day',
            date: new Date(),
            items: [
              {
                type: 'flight',
                title: 'Flight to Paris',
                description: 'Direct flight, 8h duration',
                time: '10:00 AM',
                price: '$650'
              },
              {
                type: 'hotel',
                title: 'Hotel Check-in',
                description: 'Luxury hotel in city center',
                time: '3:00 PM',
                price: '$200/night'
              }
            ]
          },
          {
            dayNumber: 2,
            title: 'City Exploration',
            date: new Date(Date.now() + 24 * 60 * 60 * 1000),
            items: [
              {
                type: 'activity',
                title: 'Eiffel Tower Visit',
                description: 'Iconic landmark with city views',
                time: '9:00 AM',
                price: '$30'
              }
            ]
          }
        ]
      };

      setItineraryData(mockData);
    } catch (error) {
      console.error('Failed to load itinerary:', error);
      setPageState(prev => ({ 
        ...prev, 
        error: 'Failed to load itinerary data' 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle finalization completion
   */
  const handleFinalizationComplete = (result: any) => {
    // Update URL to show confirmation
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('mode', 'confirmation');
    newUrl.searchParams.set('finalizationId', result.finalizationId);
    newUrl.searchParams.set('confirmation', result.confirmationNumber);
    
    window.history.pushState({}, '', newUrl.toString());
    
    setPageState({
      mode: 'confirmation',
      itineraryId: pageState.itineraryId,
      finalizationId: result.finalizationId,
      confirmationNumber: result.confirmationNumber
    });
  };

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    switch (pageState.mode) {
      case 'status':
      case 'confirmation':
        router.push('/itinerary/view');
        break;
      case 'finalize':
        router.push('/itinerary/view');
        break;
      default:
        router.push('/');
        break;
    }
  };

  /**
   * Handle home navigation
   */
  const handleGoHome = () => {
    router.push('/');
  };

  /**
   * Handle cancellation
   */
  const handleCancel = () => {
    router.push('/itinerary/view');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading your travel details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pageState.error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{pageState.error}</AlertDescription>
          </Alert>
          
          <div className="text-center">
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              
              <div className="h-6 w-px bg-gray-300" />
              
              <div>
                <h1 className="text-lg font-semibold">
                  {pageState.mode === 'finalize' && 'Finalize Booking'}
                  {pageState.mode === 'status' && 'Booking Status'}
                  {pageState.mode === 'confirmation' && 'Booking Confirmed'}
                </h1>
                {itineraryData && (
                  <p className="text-sm text-gray-600">
                    {itineraryData.destination} • {itineraryData.travelers} travelers
                  </p>
                )}
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleGoHome}
              className="text-gray-600 hover:text-gray-900"
            >
              <Home className="w-4 h-4 mr-1" />
              Home
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6">
        {/* Finalization Mode */}
        {pageState.mode === 'finalize' && pageState.itineraryId && (
          <ItineraryFinalization
            itineraryId={pageState.itineraryId}
            itineraryData={itineraryData}
            onFinalizationComplete={handleFinalizationComplete}
            onCancel={handleCancel}
          />
        )}

        {/* Status Mode */}
        {pageState.mode === 'status' && pageState.finalizationId && (
          <div className="max-w-4xl mx-auto px-6">
            <BookingStatus
              finalizationId={pageState.finalizationId}
              autoRefresh={true}
              refreshInterval={3000}
              showDetailedView={true}
              onComplete={(result) => {
                handleFinalizationComplete(result);
              }}
            />
          </div>
        )}

        {/* Confirmation Mode */}
        {pageState.mode === 'confirmation' && pageState.finalizationId && (
          <BookingConfirmation
            finalizationId={pageState.finalizationId}
            showDetailedView={true}
            onAction={(action, data) => {
              console.log('Confirmation action:', action, data);
              
              // Handle specific actions
              switch (action) {
                case 'return_home':
                  handleGoHome();
                  break;
                case 'view_itinerary':
                  router.push(`/itinerary/view?id=${pageState.itineraryId}`);
                  break;
                default:
                  break;
              }
            }}
          />
        )}

        {/* No Data Fallback */}
        {(!pageState.itineraryId && pageState.mode === 'finalize') && (
          <div className="max-w-4xl mx-auto px-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No itinerary found. Please make sure you have a valid itinerary to finalize.
              </AlertDescription>
            </Alert>
            
            <div className="text-center mt-6">
              <Button onClick={() => router.push('/itinerary/building')}>
                Create New Itinerary
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Progress Indicator for non-confirmation modes */}
      {pageState.mode !== 'confirmation' && (
        <div className="fixed bottom-6 right-6">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  pageState.mode === 'finalize' ? 'bg-blue-500' : 'bg-green-500'
                }`} />
                <span className="font-medium">
                  {pageState.mode === 'finalize' && 'Ready to Book'}
                  {pageState.mode === 'status' && 'Processing...'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 