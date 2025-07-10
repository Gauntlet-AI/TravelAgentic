/**
 * Mock Payment Service for TravelAgentic
 * Simulates Stripe-like payment processing for development and testing
 */

import { 
  IPaymentService, 
  BookingRequest, 
  BookingResult, 
  PaymentMethod,
  ServiceResponse, 
  MockConfig 
} from '../types';

/**
 * Mock Payment Service implementing IPaymentService
 * Provides realistic payment processing simulation with Stripe-compatible interface
 */
export class MockPaymentService implements IPaymentService {
  private config: MockConfig;
  private bookings: Map<string, BookingResult> = new Map();

  constructor(config: MockConfig = {
    failureRate: 0.02, // 2% payment failure rate
    responseDelay: { min: 1000, max: 3000 },
    enableRealisticData: true,
    enablePriceFluctuation: false
  }) {
    this.config = config;
  }

  /**
   * Process a booking with payment
   */
  async processBooking(booking: BookingRequest): Promise<ServiceResponse<BookingResult>> {
    const startTime = Date.now();

    try {
      await this.simulateDelay();

      // Validate booking request
      this.validateBookingRequest(booking);

      // Simulate payment processing failures
      if (this.shouldSimulateFailure()) {
        const failureReason = this.getRandomFailureReason();
        return {
          success: false,
          error: `Payment failed: ${failureReason}`,
          responseTime: Date.now() - startTime
        };
      }

      // Simulate additional payment method specific failures
      if (this.shouldSimulatePaymentMethodFailure(booking.paymentMethod)) {
        return {
          success: false,
          error: this.getPaymentMethodError(booking.paymentMethod),
          responseTime: Date.now() - startTime
        };
      }

      // Generate booking result
      const bookingResult = this.generateBookingResult(booking);
      
      // Store booking for later retrieval
      this.bookings.set(bookingResult.id, bookingResult);

      return {
        success: true,
        data: bookingResult,
        fallbackUsed: 'api',
        responseTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Get booking status by ID
   */
  async getBookingStatus(bookingId: string): Promise<ServiceResponse<BookingResult>> {
    const startTime = Date.now();

    try {
      await this.simulateDelay();

      if (this.shouldSimulateFailure()) {
        throw new Error('Failed to retrieve booking status');
      }

      const booking = this.bookings.get(bookingId);
      
      if (!booking) {
        return {
          success: false,
          error: 'Booking not found',
          responseTime: Date.now() - startTime
        };
      }

      // Simulate status updates for pending bookings
      if (booking.status === 'pending') {
        booking.status = Math.random() < 0.9 ? 'confirmed' : 'failed';
        booking.paymentStatus = booking.status === 'confirmed' ? 'paid' : 'failed';
      }

      return {
        success: true,
        data: booking,
        fallbackUsed: 'api',
        responseTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve booking status',
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string): Promise<ServiceResponse<boolean>> {
    const startTime = Date.now();

    try {
      await this.simulateDelay();

      if (this.shouldSimulateFailure()) {
        throw new Error('Failed to cancel booking');
      }

      const booking = this.bookings.get(bookingId);
      
      if (!booking) {
        return {
          success: false,
          error: 'Booking not found',
          responseTime: Date.now() - startTime
        };
      }

      if (booking.status === 'cancelled') {
        return {
          success: false,
          error: 'Booking is already cancelled',
          responseTime: Date.now() - startTime
        };
      }

      // Check if booking can be cancelled (within cancellation window)
      const bookingDate = new Date(booking.createdAt);
      const now = new Date();
      const hoursSinceBooking = (now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60);

      // Simulate cancellation policy (24 hours for free cancellation)
      if (hoursSinceBooking > 24) {
        const cancellationFee = Math.random() < 0.3; // 30% chance of cancellation fee
        if (cancellationFee) {
          return {
            success: false,
            error: 'Cancellation fee applies. Please contact customer service.',
            responseTime: Date.now() - startTime
          };
        }
      }

      // Update booking status
      booking.status = 'cancelled';
      booking.paymentStatus = 'pending'; // Refund pending

      return {
        success: true,
        data: true,
        fallbackUsed: 'api',
        responseTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel booking',
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Validate booking request
   */
  private validateBookingRequest(booking: BookingRequest): void {
    if (!booking.items || booking.items.length === 0) {
      throw new Error('Booking must contain at least one item');
    }

    if (!booking.paymentMethod) {
      throw new Error('Payment method is required');
    }

    if (!booking.customerInfo) {
      throw new Error('Customer information is required');
    }

    const { customerInfo } = booking;
    if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email) {
      throw new Error('Customer name and email are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      throw new Error('Invalid email address');
    }

    // Validate payment method
    if (booking.paymentMethod.type === 'credit_card' || booking.paymentMethod.type === 'debit_card') {
      if (!booking.paymentMethod.last4 || !booking.paymentMethod.brand) {
        throw new Error('Card information is incomplete');
      }
    }
  }

  /**
   * Generate a realistic booking result
   */
  private generateBookingResult(booking: BookingRequest): BookingResult {
    const bookingId = `bkg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const confirmationNumber = this.generateConfirmationNumber();

    // Calculate total price
    const totalAmount = booking.items.reduce((sum, item) => sum + item.price.amount, 0);
    const currency = booking.items[0]?.price.currency || 'USD';

    // Determine initial status based on payment method
    let status: 'confirmed' | 'pending' | 'failed' = 'confirmed';
    let paymentStatus: 'paid' | 'pending' | 'failed' = 'paid';

    // Some payment methods require additional processing time
    if (booking.paymentMethod.type === 'bank_transfer') {
      status = 'pending';
      paymentStatus = 'pending';
    } else if (Math.random() < 0.1) { // 10% chance of requiring additional verification
      status = 'pending';
      paymentStatus = 'pending';
    }

    return {
      id: bookingId,
      status,
      confirmationNumber,
      totalPrice: {
        amount: totalAmount,
        currency,
        displayPrice: this.formatPrice(totalAmount, currency)
      },
      items: booking.items,
      paymentStatus,
      createdAt: new Date().toISOString(),
      source: 'api'
    };
  }

  /**
   * Generate a realistic confirmation number
   */
  private generateConfirmationNumber(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    
    let confirmation = '';
    
    // Format: ABC123DEF (3 letters, 3 numbers, 3 letters)
    for (let i = 0; i < 3; i++) {
      confirmation += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    for (let i = 0; i < 3; i++) {
      confirmation += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    for (let i = 0; i < 3; i++) {
      confirmation += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    return confirmation;
  }

  /**
   * Check if payment method should fail
   */
  private shouldSimulatePaymentMethodFailure(paymentMethod: PaymentMethod): boolean {
    // Simulate specific payment method failures
    switch (paymentMethod.type) {
      case 'credit_card':
      case 'debit_card':
        // Simulate declined card (higher rate for cards ending in certain numbers)
        if (paymentMethod.last4) {
          const last4 = parseInt(paymentMethod.last4);
          if (last4 % 100 === 0) return true; // Cards ending in 00 always decline
          if (last4 % 50 === 0) return Math.random() < 0.5; // Cards ending in 50 have 50% failure rate
        }
        return Math.random() < 0.03; // 3% general card failure rate
      
      case 'paypal':
        return Math.random() < 0.02; // 2% PayPal failure rate
      
      case 'bank_transfer':
        return Math.random() < 0.01; // 1% bank transfer failure rate
      
      case 'apple_pay':
      case 'google_pay':
        return Math.random() < 0.01; // 1% digital wallet failure rate
      
      default:
        return false;
    }
  }

  /**
   * Get payment method specific error message
   */
  private getPaymentMethodError(paymentMethod: PaymentMethod): string {
    switch (paymentMethod.type) {
      case 'credit_card':
      case 'debit_card':
        const cardErrors = [
          'Card declined by issuing bank',
          'Insufficient funds',
          'Card expired',
          'Invalid card number',
          'Card security code is incorrect',
          'Card is restricted for online transactions'
        ];
        return cardErrors[Math.floor(Math.random() * cardErrors.length)];
      
      case 'paypal':
        return 'PayPal payment could not be processed. Please try again or use a different payment method.';
      
      case 'bank_transfer':
        return 'Bank transfer failed. Please verify your account details.';
      
      case 'apple_pay':
        return 'Apple Pay authentication failed. Please try again.';
      
      case 'google_pay':
        return 'Google Pay payment could not be completed. Please try again.';
      
      default:
        return 'Payment method not supported';
    }
  }

  /**
   * Get random payment failure reason
   */
  private getRandomFailureReason(): string {
    const reasons = [
      'Network timeout',
      'Payment processor temporarily unavailable',
      'Invalid merchant configuration',
      'Transaction amount exceeds daily limit',
      'Suspected fraudulent activity',
      'Payment gateway error',
      'Currency not supported',
      'Payment method temporarily unavailable'
    ];
    
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  /**
   * Format price for display
   */
  private formatPrice(amount: number, currency: string): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    
    return formatter.format(amount);
  }

  /**
   * Simulate API delay
   */
  private async simulateDelay(): Promise<void> {
    const delay = Math.random() * (this.config.responseDelay.max - this.config.responseDelay.min) + this.config.responseDelay.min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Check if we should simulate a failure
   */
  private shouldSimulateFailure(): boolean {
    return Math.random() < this.config.failureRate;
  }

  /**
   * Get all bookings (for testing/admin purposes)
   */
  public getAllBookings(): BookingResult[] {
    return Array.from(this.bookings.values());
  }

  /**
   * Clear all bookings (for testing purposes)
   */
  public clearBookings(): void {
    this.bookings.clear();
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<MockConfig>): void {
    this.config = { ...this.config, ...config };
  }
} 