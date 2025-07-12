/**
 * Itinerary Finalization Component
 * Main interface for finalizing bookings, processing payments, and generating documents
 * Provides comprehensive booking orchestration and status tracking
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Download, 
  Share2, 
  Phone, 
  Mail, 
  Calendar,
  MapPin,
  Users,
  DollarSign,
  FileText,
  Shield,
  RefreshCw
} from 'lucide-react';

// Types for finalization process
interface FinalizationProps {
  itineraryId: string;
  itineraryData: any;
  onFinalizationComplete?: (result: FinalizationResult) => void;
  onCancel?: () => void;
}

interface FinalizationResult {
  success: boolean;
  finalizationId: string;
  confirmationNumber: string;
  documentId?: string;
  totalCost: number;
}

interface PaymentMethod {
  type: 'stripe' | 'paypal' | 'bank_transfer';
  details: {
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    holderName?: string;
    email?: string;
    bankAccount?: string;
  };
}

interface ContactInfo {
  email: string;
  phone?: string;
  emergencyContact?: string;
  specialRequests?: string;
}

/**
 * Main ItineraryFinalization component
 */
export default function ItineraryFinalization({
  itineraryId,
  itineraryData,
  onFinalizationComplete,
  onCancel
}: FinalizationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [finalizationStatus, setFinalizationStatus] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    type: 'stripe',
    details: {}
  });
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: '',
    phone: '',
    emergencyContact: '',
    specialRequests: ''
  });
  const [preferences, setPreferences] = useState({
    generateDocument: true,
    sendNotifications: true,
    autoBook: true
  });
  const [documentGenerating, setDocumentGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState<any>(null);

  const steps = [
    'Review & Confirm',
    'Payment Details',
    'Contact Information',
    'Processing',
    'Completion'
  ];

  const totalCost = calculateTotalCost(itineraryData);

  /**
   * Start the finalization process
   */
  const handleStartFinalization = async () => {
    setIsProcessing(true);
    setCurrentStep(3); // Processing step

    try {
      const response = await fetch('/api/itinerary/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itineraryId,
          paymentMethod,
          preferences,
          contactInfo
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start finalization');
      }

      const result = await response.json();
      setFinalizationStatus(result);

      // Poll for status updates
      pollFinalizationStatus(result.finalizationId);

    } catch (error) {
      console.error('Finalization error:', error);
      setIsProcessing(false);
    }
  };

  /**
   * Poll finalization status
   */
  const pollFinalizationStatus = async (finalizationId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/itinerary/finalize?finalizationId=${finalizationId}`);
        const status = await response.json();
        
        setFinalizationStatus(status);

        // Check if finalization is complete
        if (status.status === 'completed') {
          clearInterval(pollInterval);
          setCurrentStep(4); // Completion step
          setIsProcessing(false);

          // Generate document if requested
          if (preferences.generateDocument) {
            generateItineraryDocument(finalizationId);
          }

          // Notify parent component
          if (onFinalizationComplete) {
            onFinalizationComplete({
              success: true,
              finalizationId,
              confirmationNumber: status.confirmationNumber,
              documentId: status.documentId,
              totalCost: status.totalCost
            });
          }
        } else if (status.status === 'failed') {
          clearInterval(pollInterval);
          setIsProcessing(false);
        }

      } catch (error) {
        console.error('Status polling error:', error);
      }
    }, 2000);

    // Stop polling after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 5 * 60 * 1000);
  };

  /**
   * Generate PDF document
   */
  const generateItineraryDocument = async (finalizationId: string) => {
    setDocumentGenerating(true);

    try {
      const response = await fetch('/api/documents/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itineraryId,
          finalizationId,
          documentType: 'complete',
          format: {
            includeQRCodes: true,
            includeMaps: false,
            includePhotos: false,
            language: 'en',
            currency: 'USD'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate document');
      }

      const document = await response.json();
      setGeneratedDocument(document);

    } catch (error) {
      console.error('Document generation error:', error);
    } finally {
      setDocumentGenerating(false);
    }
  };

  /**
   * Download generated document
   */
  const handleDownloadDocument = () => {
    if (generatedDocument) {
      window.open(generatedDocument.downloadUrl, '_blank');
    }
  };

  /**
   * Render step content
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <ReviewStep itineraryData={itineraryData} totalCost={totalCost} />;
      
      case 1:
        return (
          <PaymentStep 
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            totalCost={totalCost}
          />
        );
      
      case 2:
        return (
          <ContactStep 
            contactInfo={contactInfo}
            onContactInfoChange={setContactInfo}
            preferences={preferences}
            onPreferencesChange={setPreferences}
          />
        );
      
      case 3:
        return (
          <ProcessingStep 
            finalizationStatus={finalizationStatus}
            isProcessing={isProcessing}
          />
        );
      
      case 4:
        return (
          <CompletionStep 
            finalizationStatus={finalizationStatus}
            generatedDocument={generatedDocument}
            documentGenerating={documentGenerating}
            onDownloadDocument={handleDownloadDocument}
          />
        );
      
      default:
        return null;
    }
  };

  /**
   * Check if current step is valid
   */
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return paymentMethod.type && paymentMethod.details.cardNumber;
      case 2:
        return contactInfo.email;
      default:
        return true;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Finalize Your Trip</h1>
        <p className="text-gray-600">
          Complete your booking and get ready for your amazing journey
        </p>
      </div>

      {/* Progress indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div 
                key={step}
                className={`flex items-center ${
                  index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${index <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {index < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="ml-2 text-sm hidden sm:block">{step}</span>
                {index < steps.length - 1 && (
                  <div className={`
                    w-8 h-0.5 mx-4
                    ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
          
          <Progress 
            value={(currentStep / (steps.length - 1)) * 100} 
            className="h-2"
          />
        </CardContent>
      </Card>

      {/* Step content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStep === 3 && <RefreshCw className="w-5 h-5 animate-spin" />}
            {steps[currentStep]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      {currentStep < 3 && (
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : onCancel?.()}
          >
            {currentStep === 0 ? 'Cancel' : 'Previous'}
          </Button>
          
          <Button 
            onClick={() => {
              if (currentStep === 2) {
                handleStartFinalization();
              } else {
                setCurrentStep(currentStep + 1);
              }
            }}
            disabled={!isStepValid()}
          >
            {currentStep === 2 ? 'Finalize Booking' : 'Next'}
          </Button>
        </div>
      )}

      {currentStep === 4 && (
        <div className="text-center">
          <Button onClick={onCancel}>Return to Dashboard</Button>
        </div>
      )}
    </div>
  );
}

/**
 * Review Step Component
 */
function ReviewStep({ itineraryData, totalCost }: { itineraryData: any; totalCost: number }) {
  return (
    <div className="space-y-6">
      {/* Trip summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Trip Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Destination:</span>
              <span className="font-medium">{itineraryData.destination}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{itineraryData.days?.length || 3} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Travelers:</span>
              <span className="font-medium">{itineraryData.travelers || 2} people</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dates:</span>
              <span className="font-medium">
                {new Date().toLocaleDateString()} - {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Flights:</span>
              <span className="font-medium">$450</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hotels:</span>
              <span className="font-medium">$600</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Activities:</span>
              <span className="font-medium">$225</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Restaurants:</span>
              <span className="font-medium">$280</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${totalCost}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please review all details carefully. Once booking is confirmed, changes may incur additional fees.
        </AlertDescription>
      </Alert>
    </div>
  );
}

/**
 * Payment Step Component
 */
function PaymentStep({ 
  paymentMethod, 
  onPaymentMethodChange, 
  totalCost 
}: { 
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  totalCost: number;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Payment Details</h3>
        <p className="text-gray-600">Total amount: <span className="text-2xl font-bold">${totalCost}</span></p>
      </div>

      <Tabs value={paymentMethod.type} onValueChange={(value) => 
        onPaymentMethodChange({ ...paymentMethod, type: value as any })
      }>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stripe">Credit Card</TabsTrigger>
          <TabsTrigger value="paypal">PayPal</TabsTrigger>
          <TabsTrigger value="bank_transfer">Bank Transfer</TabsTrigger>
        </TabsList>

        <TabsContent value="stripe" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input 
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={paymentMethod.details.cardNumber || ''}
                onChange={(e) => onPaymentMethodChange({
                  ...paymentMethod,
                  details: { ...paymentMethod.details, cardNumber: e.target.value }
                })}
              />
            </div>
            <div>
              <Label htmlFor="holderName">Cardholder Name</Label>
              <Input 
                id="holderName"
                placeholder="John Doe"
                value={paymentMethod.details.holderName || ''}
                onChange={(e) => onPaymentMethodChange({
                  ...paymentMethod,
                  details: { ...paymentMethod.details, holderName: e.target.value }
                })}
              />
            </div>
            <div>
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input 
                id="expiry"
                placeholder="MM/YY"
                value={paymentMethod.details.expiryDate || ''}
                onChange={(e) => onPaymentMethodChange({
                  ...paymentMethod,
                  details: { ...paymentMethod.details, expiryDate: e.target.value }
                })}
              />
            </div>
            <div>
              <Label htmlFor="cvv">CVV</Label>
              <Input 
                id="cvv"
                placeholder="123"
                value={paymentMethod.details.cvv || ''}
                onChange={(e) => onPaymentMethodChange({
                  ...paymentMethod,
                  details: { ...paymentMethod.details, cvv: e.target.value }
                })}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="paypal" className="space-y-4">
          <div>
            <Label htmlFor="paypalEmail">PayPal Email</Label>
            <Input 
              id="paypalEmail"
              type="email"
              placeholder="john@example.com"
              value={paymentMethod.details.email || ''}
              onChange={(e) => onPaymentMethodChange({
                ...paymentMethod,
                details: { ...paymentMethod.details, email: e.target.value }
              })}
            />
          </div>
          <Alert>
            <AlertDescription>
              You will be redirected to PayPal to complete your payment securely.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="bank_transfer" className="space-y-4">
          <Alert>
            <AlertDescription>
              Bank transfer details will be provided after confirmation. Payment must be completed within 24 hours.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      <div className="flex items-center space-x-2">
        <Shield className="w-4 h-4 text-green-600" />
        <span className="text-sm text-gray-600">Your payment information is encrypted and secure</span>
      </div>
    </div>
  );
}

/**
 * Contact Step Component
 */
function ContactStep({
  contactInfo,
  onContactInfoChange,
  preferences,
  onPreferencesChange
}: {
  contactInfo: ContactInfo;
  onContactInfoChange: (info: ContactInfo) => void;
  preferences: any;
  onPreferencesChange: (prefs: any) => void;
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Contact Information & Preferences</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input 
            id="email"
            type="email"
            placeholder="john@example.com"
            value={contactInfo.email}
            onChange={(e) => onContactInfoChange({
              ...contactInfo,
              email: e.target.value
            })}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input 
            id="phone"
            placeholder="+1 (555) 123-4567"
            value={contactInfo.phone || ''}
            onChange={(e) => onContactInfoChange({
              ...contactInfo,
              phone: e.target.value
            })}
          />
        </div>
        <div>
          <Label htmlFor="emergency">Emergency Contact</Label>
          <Input 
            id="emergency"
            placeholder="Emergency contact details"
            value={contactInfo.emergencyContact || ''}
            onChange={(e) => onContactInfoChange({
              ...contactInfo,
              emergencyContact: e.target.value
            })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="requests">Special Requests</Label>
        <Input 
          id="requests"
          placeholder="Any special requests or dietary restrictions..."
          value={contactInfo.specialRequests || ''}
          onChange={(e) => onContactInfoChange({
            ...contactInfo,
            specialRequests: e.target.value
          })}
        />
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">Preferences</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="generateDocument"
              checked={preferences.generateDocument}
              onCheckedChange={(checked) => onPreferencesChange({
                ...preferences,
                generateDocument: checked
              })}
            />
            <Label htmlFor="generateDocument">Generate PDF itinerary document</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="sendNotifications"
              checked={preferences.sendNotifications}
              onCheckedChange={(checked) => onPreferencesChange({
                ...preferences,
                sendNotifications: checked
              })}
            />
            <Label htmlFor="sendNotifications">Send booking confirmations and updates</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="autoBook"
              checked={preferences.autoBook}
              onCheckedChange={(checked) => onPreferencesChange({
                ...preferences,
                autoBook: checked
              })}
            />
            <Label htmlFor="autoBook">Automatically book all confirmed items</Label>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Processing Step Component
 */
function ProcessingStep({ 
  finalizationStatus, 
  isProcessing 
}: { 
  finalizationStatus: any; 
  isProcessing: boolean;
}) {
  if (!finalizationStatus) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p>Initiating booking process...</p>
      </div>
    );
  }

  const stages = finalizationStatus.bookingProgress?.stages || {};
  const overall = finalizationStatus.bookingProgress?.overall || 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Processing Your Booking</h3>
        <p className="text-gray-600">Please wait while we confirm all your reservations</p>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="font-medium">Overall Progress</span>
            <span>{overall}%</span>
          </div>
          <Progress value={overall} className="h-3" />
        </div>

        <div className="grid gap-3">
          {Object.entries(stages).map(([stage, data]: [string, any]) => (
            <div key={stage} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {data.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : data.status === 'processing' ? (
                  <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                ) : data.status === 'failed' ? (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-400" />
                )}
                <span className="capitalize font-medium">
                  {stage.replace('_', ' ')}
                </span>
              </div>
              <Badge variant={
                data.status === 'completed' ? 'default' :
                data.status === 'processing' ? 'secondary' :
                data.status === 'failed' ? 'destructive' :
                'outline'
              }>
                {data.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {finalizationStatus.estimatedCompletion && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Estimated completion: {new Date(finalizationStatus.estimatedCompletion).toLocaleTimeString()}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/**
 * Completion Step Component
 */
function CompletionStep({
  finalizationStatus,
  generatedDocument,
  documentGenerating,
  onDownloadDocument
}: {
  finalizationStatus: any;
  generatedDocument: any;
  documentGenerating: boolean;
  onDownloadDocument: () => void;
}) {
  return (
    <div className="space-y-6 text-center">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h3>
        <p className="text-gray-600">
          Your trip has been successfully booked. Get ready for an amazing journey!
        </p>
      </div>

      {finalizationStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Confirmation Number:</span>
              <span className="font-bold text-lg">{finalizationStatus.confirmationNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Cost:</span>
              <span className="font-bold">${finalizationStatus.totalCost}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Booking Date:</span>
              <span>{new Date(finalizationStatus.timestamp).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h4 className="font-medium">Next Steps</h4>
        <div className="grid gap-2">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onDownloadDocument}
            disabled={!generatedDocument && !documentGenerating}
          >
            {documentGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating Document...
              </>
            ) : generatedDocument ? (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Itinerary PDF
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Document Not Available
              </>
            )}
          </Button>
          
          <Button variant="outline" className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            Share Trip Details
          </Button>
          
          <Button variant="outline" className="w-full">
            <Calendar className="w-4 h-4 mr-2" />
            Add to Calendar
          </Button>
        </div>
      </div>

      <Alert>
        <Mail className="h-4 w-4" />
        <AlertDescription>
          Confirmation emails and booking vouchers have been sent to your email address.
        </AlertDescription>
      </Alert>
    </div>
  );
}

/**
 * Calculate total cost from itinerary data
 */
function calculateTotalCost(itineraryData: any): number {
  // Mock calculation for Phase 5 demo
  return 1555;
} 