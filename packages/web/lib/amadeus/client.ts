import {
  AmadeusClientConfig,
  AmadeusAuthResponse,
  AmadeusApiError,
  AmadeusRateLimitState,
  AmadeusFlightSearchParams,
  AmadeusFlightSearchResponse,
  AmadeusHotelSearchParams,
  AmadeusHotelSearchResponse,
  AmadeusHotelOffersParams,
  AmadeusHotelOffersResponse,
  AmadeusActivitySearchParams,
  AmadeusActivitySearchResponse,
  AmadeusToursActivitiesParams,
  AmadeusToursActivitiesResponse,
} from './types';

/**
 * Amadeus API Client
 * 
 * Features:
 * - OAuth2 authentication with automatic token refresh
 * - Rate limiting (10 TPS for test environment)
 * - Error handling with detailed error reporting
 * - Retry mechanism with exponential backoff
 * - Support for both test and production environments
 */
export class AmadeusClient {
  private config: AmadeusClientConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private rateLimitState: AmadeusRateLimitState = {
    requestCount: 0,
    resetTime: Date.now() + 1000,
    lastRequestTime: 0,
  };

  constructor(config: AmadeusClientConfig) {
    this.config = {
      baseUrl: config.baseUrl || 'https://test.api.amadeus.com',
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
      rateLimitDelay: config.rateLimitDelay || 100, // 10 TPS = 100ms between requests
      ...config,
    };
  }

  /**
   * Authenticate with Amadeus API using OAuth2 client credentials
   */
  private async authenticate(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const authUrl = `${this.config.baseUrl}/v1/security/oauth2/token`;
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    try {
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });

      if (!response.ok) {
        const error: AmadeusApiError = await response.json();
        throw new Error(`Authentication failed: ${error.errors?.[0]?.detail || 'Unknown error'}`);
      }

      const authData: AmadeusAuthResponse = await response.json();
      this.accessToken = authData.access_token;
      this.tokenExpiresAt = Date.now() + (authData.expires_in * 1000) - 60000; // 1 minute buffer

      return this.accessToken;
    } catch (error) {
      throw new Error(`Amadeus authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Rate limiting implementation
   * Test environment: 10 TPS (1 request every 100ms)
   * Production environment: 40 TPS (1 request every 25ms)
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    
    // Reset counter if time window has passed
    if (now >= this.rateLimitState.resetTime) {
      this.rateLimitState.requestCount = 0;
      this.rateLimitState.resetTime = now + 1000; // 1 second window
    }

    // Check if we need to wait
    const timeSinceLastRequest = now - this.rateLimitState.lastRequestTime;
    if (timeSinceLastRequest < this.config.rateLimitDelay!) {
      const waitTime = this.config.rateLimitDelay! - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.rateLimitState.requestCount++;
    this.rateLimitState.lastRequestTime = Date.now();
  }

  /**
   * Make authenticated API request with retry logic
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    await this.enforceRateLimit();

    const token = await this.authenticate();
    const url = `${this.config.baseUrl}${endpoint}`;

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    for (let attempt = 0; attempt < this.config.retryAttempts!; attempt++) {
      try {
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
          const errorData: AmadeusApiError = await response.json();
          
          // Handle rate limiting
          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : this.config.retryDelay! * Math.pow(2, attempt);
            
            console.warn(`Rate limited, waiting ${waitTime}ms before retry (attempt ${attempt + 1}/${this.config.retryAttempts})`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }

          // Handle authentication errors
          if (response.status === 401) {
            this.accessToken = null;
            this.tokenExpiresAt = 0;
            
            if (attempt < this.config.retryAttempts! - 1) {
              console.warn(`Authentication error, retrying (attempt ${attempt + 1}/${this.config.retryAttempts})`);
              continue;
            }
          }

          throw new Error(`Amadeus API error: ${errorData.errors?.[0]?.detail || 'Unknown error'}`);
        }

        const data: T = await response.json();
        return data;

      } catch (error) {
        if (attempt === this.config.retryAttempts! - 1) {
          throw error;
        }

        const waitTime = this.config.retryDelay! * Math.pow(2, attempt);
        console.warn(`Request failed, retrying in ${waitTime}ms (attempt ${attempt + 1}/${this.config.retryAttempts})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    throw new Error('Maximum retry attempts exceeded');
  }

  // ==============================================================================
  // FLIGHT SEARCH METHODS
  // ==============================================================================

  /**
   * Search for flight offers
   */
  async searchFlights(params: AmadeusFlightSearchParams): Promise<AmadeusFlightSearchResponse> {
    console.log('🌐 [AMADEUS-CLIENT] Building flight search request with params:', params);
    
    const queryParams = new URLSearchParams({
      originLocationCode: params.originLocationCode,
      destinationLocationCode: params.destinationLocationCode,
      departureDate: params.departureDate,
      adults: params.adults.toString(),
    });

    if (params.returnDate) queryParams.append('returnDate', params.returnDate);
    if (params.children) queryParams.append('children', params.children.toString());
    if (params.infants) queryParams.append('infants', params.infants.toString());
    if (params.travelClass) queryParams.append('travelClass', params.travelClass);
    if (params.nonStop) queryParams.append('nonStop', params.nonStop.toString());
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.max) queryParams.append('max', params.max.toString());
    if (params.currencyCode) queryParams.append('currencyCode', params.currencyCode);
    if (params.includedAirlineCodes) queryParams.append('includedAirlineCodes', params.includedAirlineCodes.join(','));
    if (params.excludedAirlineCodes) queryParams.append('excludedAirlineCodes', params.excludedAirlineCodes.join(','));

    const finalUrl = `/v2/shopping/flight-offers?${queryParams}`;
    console.log('🎯 [AMADEUS-CLIENT] Final API URL:', finalUrl);

    return this.makeRequest<AmadeusFlightSearchResponse>(finalUrl);
  }

  /**
   * Confirm flight offer pricing
   */
  async confirmFlightPricing(flightOffers: any[]): Promise<any> {
    return this.makeRequest('/v1/shopping/flight-offers/pricing', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'flight-offers-pricing',
          flightOffers,
        },
      }),
    });
  }

  // ==============================================================================
  // HOTEL SEARCH METHODS
  // ==============================================================================

  /**
   * Search for hotels by city or location
   */
  async searchHotels(params: AmadeusHotelSearchParams): Promise<AmadeusHotelSearchResponse> {
    const queryParams = new URLSearchParams();

    if (params.cityCode) queryParams.append('cityCode', params.cityCode);
    if (params.latitude) queryParams.append('latitude', params.latitude.toString());
    if (params.longitude) queryParams.append('longitude', params.longitude.toString());
    if (params.radius) queryParams.append('radius', params.radius.toString());
    if (params.radiusUnit) queryParams.append('radiusUnit', params.radiusUnit);
    if (params.chainCodes) queryParams.append('chainCodes', params.chainCodes.join(','));
    if (params.amenities) queryParams.append('amenities', params.amenities.join(','));
    if (params.ratings) queryParams.append('ratings', params.ratings.join(','));
    if (params.hotelSource) queryParams.append('hotelSource', params.hotelSource);

    return this.makeRequest<AmadeusHotelSearchResponse>(`/v1/reference-data/locations/hotels/by-city?${queryParams}`);
  }

  /**
   * Get hotel offers for specific hotels
   */
  async getHotelOffers(params: AmadeusHotelOffersParams): Promise<AmadeusHotelOffersResponse> {
    const queryParams = new URLSearchParams({
      hotelIds: params.hotelIds.join(','),
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      adults: params.adults.toString(),
    });

    if (params.childAges) queryParams.append('childAges', params.childAges.join(','));
    if (params.roomQuantity) queryParams.append('roomQuantity', params.roomQuantity.toString());
    if (params.priceRange) queryParams.append('priceRange', params.priceRange);
    if (params.currency) queryParams.append('currency', params.currency);
    if (params.lang) queryParams.append('lang', params.lang);
    if (params.bestRateOnly) queryParams.append('bestRateOnly', params.bestRateOnly.toString());
    if (params.view) queryParams.append('view', params.view);

    return this.makeRequest<AmadeusHotelOffersResponse>(`/v3/shopping/hotel-offers?${queryParams}`);
  }

  // ==============================================================================
  // ACTIVITY/POI SEARCH METHODS
  // ==============================================================================

  /**
   * Search for points of interest
   */
  async searchPointsOfInterest(params: AmadeusActivitySearchParams): Promise<AmadeusActivitySearchResponse> {
    const queryParams = new URLSearchParams();

    if (params.latitude) queryParams.append('latitude', params.latitude.toString());
    if (params.longitude) queryParams.append('longitude', params.longitude.toString());
    if (params.radius) queryParams.append('radius', params.radius.toString());
    if (params.north) queryParams.append('north', params.north.toString());
    if (params.west) queryParams.append('west', params.west.toString());
    if (params.south) queryParams.append('south', params.south.toString());
    if (params.east) queryParams.append('east', params.east.toString());
    if (params.categories) queryParams.append('categories', params.categories.join(','));
    if (params.source) queryParams.append('source', params.source);

    return this.makeRequest<AmadeusActivitySearchResponse>(`/v1/reference-data/locations/pois?${queryParams}`);
  }

  /**
   * Search for tours and activities
   */
  async searchToursAndActivities(params: AmadeusToursActivitiesParams): Promise<AmadeusToursActivitiesResponse> {
    const queryParams = new URLSearchParams();

    if (params.latitude) queryParams.append('latitude', params.latitude.toString());
    if (params.longitude) queryParams.append('longitude', params.longitude.toString());
    if (params.radius) queryParams.append('radius', params.radius.toString());
    if (params.categoryCode) queryParams.append('categoryCode', params.categoryCode);
    if (params.subcategoryCode) queryParams.append('subcategoryCode', params.subcategoryCode);
    if (params.currencyCode) queryParams.append('currencyCode', params.currencyCode);
    if (params.destination) queryParams.append('destination', params.destination);
    if (params.minimumDuration) queryParams.append('minimumDuration', params.minimumDuration);
    if (params.maximumDuration) queryParams.append('maximumDuration', params.maximumDuration);
    if (params.minimumPrice) queryParams.append('minimumPrice', params.minimumPrice.toString());
    if (params.maximumPrice) queryParams.append('maximumPrice', params.maximumPrice.toString());
    if (params.availabilityDateFrom) queryParams.append('availabilityDateFrom', params.availabilityDateFrom);
    if (params.availabilityDateTo) queryParams.append('availabilityDateTo', params.availabilityDateTo);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.page) queryParams.append('page[offset]', params.page.toString());
    if (params.limit) queryParams.append('page[limit]', params.limit.toString());

    return this.makeRequest<AmadeusToursActivitiesResponse>(`/v1/shopping/activities?${queryParams}`);
  }

  // ==============================================================================
  // UTILITY METHODS
  // ==============================================================================

  /**
   * Get client configuration
   */
  getConfig(): AmadeusClientConfig {
    return { ...this.config };
  }

  /**
   * Get current rate limit state
   */
  getRateLimitState(): AmadeusRateLimitState {
    return { ...this.rateLimitState };
  }

  /**
   * Reset authentication (force token refresh)
   */
  resetAuth(): void {
    this.accessToken = null;
    this.tokenExpiresAt = 0;
  }
}

/**
 * Create Amadeus client instance from environment variables
 */
export function createAmadeusClient(): AmadeusClient {
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
  const isProduction = process.env.AMADEUS_ENVIRONMENT === 'production';

  if (!clientId || !clientSecret) {
    throw new Error('Amadeus credentials not configured. Please set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET environment variables.');
  }

  return new AmadeusClient({
    clientId,
    clientSecret,
    baseUrl: isProduction ? 'https://api.amadeus.com' : 'https://test.api.amadeus.com',
    rateLimitDelay: isProduction ? 25 : 100, // 40 TPS for production, 10 TPS for test
  });
} 