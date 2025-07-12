/**
 * Voice Calling Service for Phase 6
 * Integrates Twilio + ElevenLabs for voice-based booking fallbacks
 * Used when API-based booking fails in the 5-layer fallback system
 */

// Voice calling types
export interface VoiceCallConfig {
  provider: 'twilio' | 'mock';
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
  elevenLabsApiKey?: string;
  enableTTS?: boolean;
  language?: string;
  voice?: string;
}

export interface BookingCallRequest {
  itineraryId: string;
  customerPhone: string;
  bookingType: 'flight' | 'hotel' | 'activity' | 'restaurant' | 'complete';
  bookingDetails: BookingItemDetails;
  customerInfo: CustomerInfo;
  preferredCallTime?: Date;
  urgency: 'low' | 'medium' | 'high';
}

export interface BookingItemDetails {
  id: string;
  type: string;
  name: string;
  provider: string;
  details: Record<string, any>;
  fallbackContactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  preferences?: {
    language?: string;
    callTimePreference?: 'morning' | 'afternoon' | 'evening';
    communicationStyle?: 'formal' | 'casual';
  };
}

export interface VoiceCallResult {
  success: boolean;
  callId: string;
  status: 'initiated' | 'in_progress' | 'completed' | 'failed' | 'no_answer';
  bookingStatus: 'confirmed' | 'pending' | 'failed' | 'requires_manual_follow_up';
  confirmationNumber?: string;
  callDuration?: number;
  transcript?: string;
  nextSteps?: string[];
  error?: string;
  estimatedCallback?: Date;
}

/**
 * Voice Calling Service
 * Orchestrates voice-based booking when automated systems fail
 */
export class VoiceCallingService {
  private config: VoiceCallConfig;
  private callHistory: Map<string, VoiceCallResult> = new Map();

  constructor(config: VoiceCallConfig) {
    this.config = config;
  }

  /**
   * Initiate a voice-based booking call
   */
  async initiateBookingCall(request: BookingCallRequest): Promise<VoiceCallResult> {
    const callId = this.generateCallId();
    
    console.log(`🎤 Initiating voice booking call for ${request.bookingType}:`, {
      callId,
      customer: request.customerInfo.name,
      urgency: request.urgency
    });

    try {
      // Check if this is a mock environment
      if (this.config.provider === 'mock' || !this.config.twilioAccountSid) {
        return this.simulateVoiceCall(callId, request);
      }

      // Real Twilio integration
      return await this.executeRealVoiceCall(callId, request);

    } catch (error) {
      const result: VoiceCallResult = {
        success: false,
        callId,
        status: 'failed',
        bookingStatus: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };

      this.callHistory.set(callId, result);
      return result;
    }
  }

  /**
   * Generate AI-powered voice script for booking calls
   */
  private generateVoiceScript(request: BookingCallRequest): string {
    const { customerInfo, bookingDetails, bookingType } = request;
    const customerName = customerInfo.name;
    const itemName = bookingDetails.name;

    const scripts = {
      flight: `Hello, this is TravelAgentic calling to assist ${customerName} with booking flight ${itemName}. Our automated system encountered an issue, so I'm calling to complete your reservation personally. May I speak with ${customerName}?`,
      
      hotel: `Good day, this is TravelAgentic calling regarding ${customerName}'s hotel reservation at ${itemName}. We're experiencing technical difficulties with our booking system and wanted to ensure your reservation is confirmed. Is this a good time to speak?`,
      
      activity: `Hello, I'm calling from TravelAgentic about ${customerName}'s booking for ${itemName}. Our online booking system is currently unavailable, so I'm reaching out to complete your reservation over the phone. May I assist you now?`,
      
      restaurant: `Hi, this is TravelAgentic calling to help ${customerName} with a dinner reservation at ${itemName}. Our automated booking system is experiencing issues, so I wanted to personally ensure your table is reserved. Is ${customerName} available?`,
      
      complete: `Hello, I'm calling from TravelAgentic regarding ${customerName}'s complete travel itinerary. We've encountered some technical issues with our booking systems and want to ensure all your reservations are properly confirmed. May I speak with ${customerName}?`
    };

    return scripts[bookingType] || scripts.complete;
  }

  /**
   * Simulate voice call for development/testing
   */
  private async simulateVoiceCall(callId: string, request: BookingCallRequest): Promise<VoiceCallResult> {
    console.log(`🎭 Simulating voice call for ${request.bookingType}`);
    
    // Simulate different call outcomes based on urgency
    const outcomes = {
      high: { successRate: 0.9, avgDuration: 180 },
      medium: { successRate: 0.7, avgDuration: 240 },
      low: { successRate: 0.6, avgDuration: 300 }
    };

    const outcome = outcomes[request.urgency];
    const isSuccessful = Math.random() < outcome.successRate;
    const duration = outcome.avgDuration + (Math.random() - 0.5) * 60;

    // Simulate call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    let result: VoiceCallResult;

    if (isSuccessful) {
      result = {
        success: true,
        callId,
        status: 'completed',
        bookingStatus: 'confirmed',
        confirmationNumber: `VC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        callDuration: Math.round(duration),
        transcript: this.generateMockTranscript(request),
        nextSteps: [
          'Confirmation email sent to customer',
          'Booking details updated in system',
          'Follow-up call scheduled if needed'
        ]
      };
    } else {
      // Simulate various failure scenarios
      const failureReasons = [
        { status: 'no_answer', bookingStatus: 'requires_manual_follow_up', callback: 2 },
        { status: 'failed', bookingStatus: 'failed', callback: 0 },
        { status: 'completed', bookingStatus: 'pending', callback: 1 }
      ];

      const failure = failureReasons[Math.floor(Math.random() * failureReasons.length)];
      
      result = {
        success: false,
        callId,
        status: failure.status as any,
        bookingStatus: failure.bookingStatus as any,
        callDuration: failure.status === 'no_answer' ? 0 : Math.round(duration * 0.3),
        estimatedCallback: failure.callback > 0 ? new Date(Date.now() + failure.callback * 60 * 60 * 1000) : undefined,
        nextSteps: [
          failure.status === 'no_answer' ? 'Will retry call in 2 hours' : 'Manual follow-up required',
          'Customer notified via email',
          'Escalated to customer service team'
        ]
      };
    }

    this.callHistory.set(callId, result);
    return result;
  }

  /**
   * Execute real voice call using Twilio + ElevenLabs
   */
  private async executeRealVoiceCall(callId: string, request: BookingCallRequest): Promise<VoiceCallResult> {
    // This would integrate with real Twilio API
    // For now, return a placeholder that indicates real integration is needed
    
    const result: VoiceCallResult = {
      success: false,
      callId,
      status: 'failed',
      bookingStatus: 'requires_manual_follow_up',
      error: 'Real Twilio integration not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to enable.',
      nextSteps: [
        'Configure Twilio credentials in environment variables',
        'Set up ElevenLabs API key for text-to-speech',
        'Configure phone number for outbound calls'
      ]
    };

    this.callHistory.set(callId, result);
    return result;
  }

  /**
   * Generate mock conversation transcript
   */
  private generateMockTranscript(request: BookingCallRequest): string {
    const customerName = request.customerInfo.name;
    const itemName = request.bookingDetails.name;
    const bookingType = request.bookingType;

    return `
[00:00] Agent: Hello, this is Sarah from TravelAgentic calling to assist ${customerName} with booking ${itemName}.
[00:05] Customer: Hi, yes that's me. I was wondering what happened with my booking.
[00:10] Agent: Our automated system encountered a technical issue, so I'm calling to complete your ${bookingType} reservation personally.
[00:15] Customer: Oh okay, that's great. I was worried it didn't go through.
[00:20] Agent: Not to worry! I have all your details here. Let me confirm your information and complete the booking.
[00:45] Agent: Perfect! Your ${bookingType} is now confirmed. Your confirmation number is VC-${Date.now().toString().slice(-6)}.
[00:50] Customer: Excellent! Thank you so much for calling.
[00:55] Agent: You're welcome! You'll receive a confirmation email shortly. Have a wonderful trip!
    `.trim();
  }

  /**
   * Get call status by ID
   */
  async getCallStatus(callId: string): Promise<VoiceCallResult | null> {
    return this.callHistory.get(callId) || null;
  }

  /**
   * Cancel or update a pending call
   */
  async updateCall(callId: string, updates: Partial<VoiceCallResult>): Promise<VoiceCallResult | null> {
    const existing = this.callHistory.get(callId);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    this.callHistory.set(callId, updated);
    return updated;
  }

  /**
   * Generate unique call ID
   */
  private generateCallId(): string {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get call history for analytics
   */
  getCallHistory(): VoiceCallResult[] {
    return Array.from(this.callHistory.values());
  }

  /**
   * Get call success metrics
   */
  getCallMetrics() {
    const calls = this.getCallHistory();
    const total = calls.length;
    
    if (total === 0) {
      return {
        totalCalls: 0,
        successRate: 0,
        averageDuration: 0,
        bookingConfirmationRate: 0
      };
    }

    const successful = calls.filter(call => call.success).length;
    const confirmed = calls.filter(call => call.bookingStatus === 'confirmed').length;
    const totalDuration = calls.reduce((sum, call) => sum + (call.callDuration || 0), 0);

    return {
      totalCalls: total,
      successRate: (successful / total) * 100,
      averageDuration: totalDuration / total,
      bookingConfirmationRate: (confirmed / total) * 100
    };
  }
}

/**
 * Voice Calling Integration for 5-Layer Fallback System
 */
export class VoiceCallFallbackManager {
  private voiceService: VoiceCallingService;
  
  constructor(config: VoiceCallConfig) {
    this.voiceService = new VoiceCallingService(config);
  }

  /**
   * Trigger voice call as Layer 4 fallback
   */
  async triggerVoiceFallback(
    bookingRequest: any,
    previousFailures: string[]
  ): Promise<VoiceCallResult> {
    console.log('🔄 Activating Layer 4: Voice Call Fallback', {
      previousFailures,
      bookingType: bookingRequest.type
    });

    // Convert generic booking request to voice call request
    const voiceCallRequest: BookingCallRequest = {
      itineraryId: bookingRequest.itineraryId,
      customerPhone: bookingRequest.customerInfo.phone,
      bookingType: bookingRequest.type,
      bookingDetails: {
        id: bookingRequest.id,
        type: bookingRequest.type,
        name: bookingRequest.name,
        provider: bookingRequest.provider || 'unknown',
        details: bookingRequest.details,
        fallbackContactInfo: bookingRequest.fallbackContactInfo
      },
      customerInfo: bookingRequest.customerInfo,
      urgency: this.determineUrgency(previousFailures, bookingRequest)
    };

    return await this.voiceService.initiateBookingCall(voiceCallRequest);
  }

  /**
   * Determine call urgency based on previous failures
   */
  private determineUrgency(previousFailures: string[], bookingRequest: any): 'low' | 'medium' | 'high' {
    // High urgency: Many failures or time-sensitive booking
    if (previousFailures.length >= 3) return 'high';
    if (bookingRequest.departureDate && this.isTimeSerious(bookingRequest.departureDate)) return 'high';
    
    // Medium urgency: Some failures
    if (previousFailures.length >= 2) return 'medium';
    
    // Low urgency: First voice call attempt
    return 'low';
  }

  /**
   * Check if booking is time-sensitive
   */
  private isTimeSerious(departureDate: string | Date): boolean {
    const departure = new Date(departureDate);
    const now = new Date();
    const hoursUntilDeparture = (departure.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Consider urgent if departure is within 24 hours
    return hoursUntilDeparture <= 24;
  }

  /**
   * Check if voice calling is available
   */
  isVoiceCallingAvailable(): boolean {
    // Check if we have required configuration
    return !!(
      this.voiceService && 
      (process.env.NODE_ENV === 'development' || process.env.TWILIO_ACCOUNT_SID)
    );
  }

  /**
   * Get voice service instance for direct access
   */
  getVoiceService(): VoiceCallingService {
    return this.voiceService;
  }
}

/**
 * Factory function to create voice calling service
 */
export function createVoiceCallingService(): VoiceCallFallbackManager {
  const config: VoiceCallConfig = {
    provider: process.env.TWILIO_ACCOUNT_SID ? 'twilio' : 'mock',
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
    elevenLabsApiKey: process.env.ELEVENLABS_API_KEY,
    enableTTS: true,
    language: 'en-US',
    voice: 'professional'
  };

  return new VoiceCallFallbackManager(config);
}

// Singleton instance for global use
let globalVoiceCallManager: VoiceCallFallbackManager | null = null;

/**
 * Get global voice calling manager instance
 */
export function getVoiceCallManager(): VoiceCallFallbackManager {
  if (!globalVoiceCallManager) {
    globalVoiceCallManager = createVoiceCallingService();
  }
  return globalVoiceCallManager;
} 