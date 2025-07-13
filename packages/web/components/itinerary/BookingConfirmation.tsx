/**
 * Booking Confirmation Component
 * Displays final confirmation details, booking summaries, and next steps
 * Provides access to generated documents and post-booking actions
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Download, 
  Share2, 
  Mail, 
  Phone, 
  FileText,
  ExternalLink,
  Copy,
  Star,
  Clock,
  Plane,
  Building,
  Utensils,
  Camera,
  Printer,
  MessageSquare
} from 'lucide-react';

// Types for booking confirmation
interface BookingConfirmationProps {
  finalizationId: string;
  confirmationData?: ConfirmationData;
  onAction?: (action: string, data?: any) => void;
  showDetailedView?: boolean;
}

interface ConfirmationData {
  confirmationNumber: string;
  status: 'confirmed' | 'pending' | 'failed';
  finalizationId: string;
  totalCost: number;
  currency: string;
  bookingDate: string;
  itinerary: ItineraryDetails;
  bookingResults: BookingResult[];
  documents: DocumentInfo[];
  contactInfo: ContactInfo;
  nextSteps: NextStep[];
}

interface ItineraryDetails {
  destination: string;
  startDate: string;
  endDate: string;
  duration: number;
  travelers: number;
  tripType: string;
}

interface BookingResult {
  type: 'flight' | 'hotel' | 'activity' | 'restaurant' | 'transport';
  itemId: string;
  status: 'confirmed' | 'pending' | 'failed';
  confirmationNumber?: string;
  providerName: string;
  details: any;
  cost: number;
  checkInDate?: string;
  checkOutDate?: string;
  time?: string;
  vouchers?: VoucherInfo[];
}

interface VoucherInfo {
  type: 'eticket' | 'voucher' | 'confirmation';
  format: 'pdf' | 'qr' | 'text';
  content: string;
  downloadUrl?: string;
}

interface DocumentInfo {
  documentId: string;
  type: 'complete' | 'summary' | 'vouchers';
  downloadUrl: string;
  generatedAt: string;
  fileSize: number;
  pageCount: number;
}

interface ContactInfo {
  email: string;
  phone?: string;
  emergencyContact?: string;
}

interface NextStep {
  title: string;
  description: string;
  action?: string;
  urgent?: boolean;
  completed?: boolean;
}

/**
 * Main BookingConfirmation component
 */
export default function BookingConfirmation({
  finalizationId,
  confirmationData,
  onAction,
  showDetailedView = true
}: BookingConfirmationProps) {
  const [data, setData] = useState<ConfirmationData | null>(confirmationData || null);
  const [isLoading, setIsLoading] = useState(!confirmationData);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Fetch confirmation data if not provided
  useEffect(() => {
    if (!confirmationData && finalizationId) {
      fetchConfirmationData();
    }
  }, [finalizationId, confirmationData]);

  /**
   * Fetch confirmation data
   */
  const fetchConfirmationData = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/itinerary/finalize?finalizationId=${finalizationId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch confirmation data');
      }

      const result = await response.json();
      setData(mapToConfirmationData(result));
    } catch (error) {
      console.error('Failed to fetch confirmation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle action clicks
   */
  const handleAction = (action: string, actionData?: any) => {
    if (onAction) {
      onAction(action, actionData);
    }

    // Handle common actions
    switch (action) {
      case 'copy_confirmation':
        copyToClipboard(data?.confirmationNumber || '');
        break;
      case 'download_document':
        if (actionData?.downloadUrl) {
          window.open(actionData.downloadUrl, '_blank');
        }
        break;
      case 'share_itinerary':
        shareItinerary();
        break;
      case 'add_to_calendar':
        addToCalendar();
        break;
      case 'contact_support':
        contactSupport();
        break;
    }
  };

  /**
   * Copy text to clipboard
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  /**
   * Share itinerary
   */
  const shareItinerary = () => {
    if (navigator.share && data) {
      navigator.share({
        title: `Travel Itinerary - ${data.itinerary.destination}`,
        text: `Check out my trip to ${data.itinerary.destination}!`,
        url: window.location.href
      });
    } else {
      copyToClipboard(window.location.href);
    }
  };

  /**
   * Add to calendar
   */
  const addToCalendar = () => {
    if (!data) return;

    const startDate = new Date(data.itinerary.startDate);
    const endDate = new Date(data.itinerary.endDate);
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      `Trip to ${data.itinerary.destination}`
    )}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(
      `Confirmation: ${data.confirmationNumber}`
    )}`;
    
    window.open(calendarUrl, '_blank');
  };

  /**
   * Contact support
   */
  const contactSupport = () => {
    const email = 'support@travelagentic.com';
    const subject = `Booking Support - ${data?.confirmationNumber}`;
    const body = `Hi, I need assistance with my booking confirmation ${data?.confirmationNumber}.`;
    
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading confirmation details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Unable to load confirmation details. Please check your confirmation number and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Confirmation Header */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">
            Booking Confirmed!
          </CardTitle>
          <p className="text-green-700">
            Your amazing journey to {data.itinerary.destination} is all set
          </p>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <div>
            <p className="text-sm text-green-600 mb-1">Confirmation Number</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-green-800">
                {data.confirmationNumber}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction('copy_confirmation')}
                className="text-green-600 hover:bg-green-100"
              >
                {copiedText === data.confirmationNumber ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Status: {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
          </Badge>
        </CardContent>
      </Card>

      {/* Trip Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Trip Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Destination:</span>
                <span className="font-medium">{data.itinerary.destination}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{data.itinerary.duration} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Travelers:</span>
                <span className="font-medium">{data.itinerary.travelers} people</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Check-in:</span>
                <span className="font-medium">
                  {new Date(data.itinerary.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Check-out:</span>
                <span className="font-medium">
                  {new Date(data.itinerary.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Cost:</span>
                <span className="font-bold text-lg">
                  {data.currency} {data.totalCost}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.bookingResults.map((booking, index) => (
              <BookingItem 
                key={index} 
                booking={booking} 
                onAction={handleAction}
                showDetails={showDetailedView}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      {data.documents && data.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Travel Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {data.documents.map((doc, index) => (
                <DocumentItem 
                  key={index} 
                  document={doc} 
                  onAction={handleAction}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {data.nextSteps && data.nextSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.nextSteps.map((step, index) => (
                <NextStepItem 
                  key={index} 
                  step={step} 
                  onAction={handleAction}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={() => handleAction('add_to_calendar')}
              className="w-full flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Add to Calendar
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleAction('share_itinerary')}
              className="w-full flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share Trip
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => handleAction('contact_support')}
              className="w-full flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Contact Support
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.print()}
              className="w-full flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print Confirmation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{data.contactInfo.email}</span>
              </div>
              {data.contactInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{data.contactInfo.phone}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                Booking Date: {new Date(data.bookingDate).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-600">
                Reference: {data.finalizationId}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {copiedText && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Copied to clipboard!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/**
 * Booking Item Component
 */
function BookingItem({ 
  booking, 
  onAction, 
  showDetails 
}: { 
  booking: BookingResult; 
  onAction: (action: string, data?: any) => void;
  showDetails: boolean;
}) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flight':
        return <Plane className="w-5 h-5" />;
      case 'hotel':
        return <Building className="w-5 h-5" />;
      case 'activity':
        return <Camera className="w-5 h-5" />;
      case 'restaurant':
        return <Utensils className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getTypeIcon(booking.type)}
          <div>
            <h4 className="font-medium capitalize">
              {booking.type} Booking
            </h4>
            <p className="text-sm text-gray-600">
              {booking.providerName}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <Badge className={getStatusColor(booking.status)}>
            {booking.status}
          </Badge>
          <div className="text-sm font-medium mt-1">
            ${booking.cost}
          </div>
        </div>
      </div>

      {booking.confirmationNumber && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Confirmation:</span>
          <span className="font-medium">{booking.confirmationNumber}</span>
        </div>
      )}

      {showDetails && booking.details && (
        <div className="text-sm space-y-1">
          {Object.entries(booking.details).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-600 capitalize">
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
              </span>
              <span>{String(value)}</span>
            </div>
          ))}
        </div>
      )}

      {booking.vouchers && booking.vouchers.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium">Vouchers:</span>
          <div className="flex gap-2">
            {booking.vouchers.map((voucher, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onAction('download_voucher', voucher)}
              >
                <Download className="w-3 h-3 mr-1" />
                {voucher.type}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Document Item Component
 */
function DocumentItem({ 
  document, 
  onAction 
}: { 
  document: DocumentInfo; 
  onAction: (action: string, data?: any) => void;
}) {
  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span className="font-medium capitalize">
            {document.type} Document
          </span>
        </div>
        <Badge variant="outline">
          {document.pageCount} pages
        </Badge>
      </div>
      
      <div className="text-xs text-gray-600">
        <div>Size: {(document.fileSize / 1024).toFixed(1)} KB</div>
        <div>Generated: {new Date(document.generatedAt).toLocaleString()}</div>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => onAction('download_document', document)}
      >
        <Download className="w-3 h-3 mr-1" />
        Download PDF
      </Button>
    </div>
  );
}

/**
 * Next Step Item Component
 */
function NextStepItem({ 
  step, 
  onAction 
}: { 
  step: NextStep; 
  onAction: (action: string, data?: any) => void;
}) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${
      step.urgent ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
    }`}>
      <div className={`w-2 h-2 rounded-full mt-2 ${
        step.completed ? 'bg-green-500' : 
        step.urgent ? 'bg-red-500' : 'bg-blue-500'
      }`} />
      
      <div className="flex-1">
        <h4 className="font-medium">{step.title}</h4>
        <p className="text-sm text-gray-600">{step.description}</p>
        
        {step.action && !step.completed && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => onAction(step.action!, step)}
          >
            Take Action
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Map API response to confirmation data
 */
function mapToConfirmationData(apiResponse: any): ConfirmationData {
  return {
    confirmationNumber: apiResponse.confirmationNumber || 'TR-2024-001',
    status: apiResponse.status === 'completed' ? 'confirmed' : apiResponse.status,
    finalizationId: apiResponse.finalizationId,
    totalCost: apiResponse.totalCost || 1555,
    currency: apiResponse.currency || 'USD',
    bookingDate: apiResponse.timestamp || new Date().toISOString(),
    itinerary: {
      destination: 'Barcelona, Spain',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 3,
      travelers: 2,
      tripType: 'leisure'
    },
    bookingResults: apiResponse.bookingResults || [
      {
        type: 'flight',
        itemId: 'flight_1',
        status: 'confirmed',
        confirmationNumber: 'FL-ABC123',
        providerName: 'Premium Airways',
        details: {
          flightNumber: 'PA 1234',
          departure: '10:00 AM',
          arrival: '1:45 PM'
        },
        cost: 450
      },
      {
        type: 'hotel',
        itemId: 'hotel_1',
        status: 'confirmed',
        confirmationNumber: 'HT-XYZ789',
        providerName: 'Luxury Resort',
        details: {
          checkIn: '3:00 PM',
          checkOut: '11:00 AM',
          nights: 3
        },
        cost: 600
      }
    ],
    documents: apiResponse.documentId ? [
      {
        documentId: apiResponse.documentId,
        type: 'complete',
        downloadUrl: `/api/documents/${apiResponse.documentId}`,
        generatedAt: new Date().toISOString(),
        fileSize: 245760,
        pageCount: 8
      }
    ] : [],
    contactInfo: {
      email: 'user@example.com',
      phone: '+1 (555) 123-4567'
    },
    nextSteps: [
      {
        title: 'Check-in Online',
        description: 'Complete online check-in 24 hours before departure',
        action: 'checkin_flight',
        urgent: false,
        completed: false
      },
      {
        title: 'Travel Insurance',
        description: 'Consider purchasing travel insurance for your trip',
        action: 'buy_insurance',
        urgent: false,
        completed: false
      }
    ]
  };
} 