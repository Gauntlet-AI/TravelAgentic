/**
 * Comprehensive Mock API Test Suite for TravelAgentic
 * 
 * This script tests all mock APIs to ensure they're working correctly:
 * - Flight Search API (POST and GET streaming)
 * - Hotel Search API (POST and GET streaming)  
 * - Activity Search API (POST and GET streaming)
 * - Payment Booking API (POST)
 * - Error handling and edge cases
 * 
 * Run with: node test-mock-apis.js
 */

const http = require('http');
const https = require('https');

const API_BASE_URL = 'http://localhost:3003';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

class APITester {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.testResults = [];
    this.passedTests = 0;
    this.failedTests = 0;
  }

  log(message, color = colors.white) {
    console.log(`${color}${message}${colors.reset}`);
  }

  async makeRequest(endpoint, method = 'GET', body = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const jsonData = data ? JSON.parse(data) : {};
            resolve({ 
              status: res.statusCode, 
              data: jsonData,
              headers: res.headers
            });
          } catch (error) {
            resolve({ 
              status: res.statusCode, 
              data: data,
              headers: res.headers
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (body) {
        req.write(JSON.stringify(body));
      }

      req.end();
    });
  }

  async testEndpoint(name, endpoint, method, body, expectedStatus = 200, validateResponse = null) {
    this.log(`\n🧪 Testing ${name}...`, colors.cyan);
    
    try {
      const response = await this.makeRequest(endpoint, method, body);
      
      if (response.status === expectedStatus) {
        this.log(`✅ ${name} - Status: ${response.status}`, colors.green);
        
        if (validateResponse) {
          const validation = validateResponse(response.data);
          if (validation.valid) {
            this.log(`✅ ${name} - Response validation passed`, colors.green);
          } else {
            this.log(`❌ ${name} - Response validation failed: ${validation.message}`, colors.red);
            this.failedTests++;
            return false;
          }
        }
        
        this.passedTests++;
        return true;
      } else {
        this.log(`❌ ${name} - Expected status ${expectedStatus}, got ${response.status}`, colors.red);
        this.log(`Response: ${JSON.stringify(response.data, null, 2)}`, colors.yellow);
        this.failedTests++;
        return false;
      }
    } catch (error) {
      this.log(`❌ ${name} - Error: ${error.message}`, colors.red);
      this.failedTests++;
      return false;
    }
  }

  async waitForServer(retries = MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
      try {
        this.log(`🔄 Checking if server is running... (attempt ${i + 1}/${retries})`, colors.yellow);
        await this.makeRequest('/api/test', 'GET');
        this.log('✅ Server is running!', colors.green);
        return true;
      } catch (error) {
        if (i === retries - 1) {
          this.log('❌ Server is not responding. Please make sure the development server is running.', colors.red);
          this.log('Run: cd packages/web && npm run dev', colors.yellow);
          return false;
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }

  async testFlightSearchAPI() {
    this.log('\n🛫 Testing Flight Search API', colors.blue);
    
    // Test valid flight search
    const validFlightSearch = {
      origin: 'JFK',
      destination: 'LAX',
      departureDate: '2025-08-01',
      returnDate: '2025-08-05',
      passengers: { adults: 2, children: 0, infants: 0 },
      cabin: 'economy'
    };

    const validateFlightResponse = (data) => {
      if (!data.success) return { valid: false, message: 'Response not successful' };
      if (!data.data || !Array.isArray(data.data)) return { valid: false, message: 'No flight data array' };
      if (data.data.length === 0) return { valid: false, message: 'No flights returned' };
      
      const flight = data.data[0];
      if (!flight.segments || !Array.isArray(flight.segments) || flight.segments.length === 0) {
        return { valid: false, message: 'Flight object missing segments' };
      }
      if (!flight.price || !flight.price.amount) {
        return { valid: false, message: 'Flight object missing price information' };
      }
      
      const segment = flight.segments[0];
      if (!segment.airline || !segment.departure || !segment.arrival) {
        return { valid: false, message: 'Flight segment missing required fields' };
      }
      
      return { valid: true };
    };

    await this.testEndpoint(
      'Flight Search - Valid Request',
      '/api/flights/search',
      'POST',
      validFlightSearch,
      200,
      validateFlightResponse
    );

    // Test missing parameters
    await this.testEndpoint(
      'Flight Search - Missing Origin',
      '/api/flights/search',
      'POST',
      { destination: 'LAX', departureDate: '2025-08-01' },
      400
    );

    // Test streaming endpoint
    await this.testEndpoint(
      'Flight Search - Streaming Valid',
      '/api/flights/search?stream=true&origin=JFK&destination=LAX&departureDate=2025-08-01',
      'GET',
      null,
      200
    );
  }

  async testHotelSearchAPI() {
    this.log('\n🏨 Testing Hotel Search API', colors.blue);
    
    // Test valid hotel search
    const validHotelSearch = {
      destination: 'New York',
      checkIn: '2025-08-01',
      checkOut: '2025-08-05',
      guests: { adults: 2, children: 0, rooms: 1 },
      starRating: [3, 4, 5]
    };

    const validateHotelResponse = (data) => {
      if (!data.success) return { valid: false, message: 'Response not successful' };
      if (!data.data || !Array.isArray(data.data)) return { valid: false, message: 'No hotel data array' };
      if (data.data.length === 0) return { valid: false, message: 'No hotels returned' };
      
      const hotel = data.data[0];
      if (!hotel.name || !hotel.price || !hotel.location || !hotel.rating) {
        return { valid: false, message: 'Hotel object missing required fields' };
      }
      
      return { valid: true };
    };

    await this.testEndpoint(
      'Hotel Search - Valid Request',
      '/api/hotels/search',
      'POST',
      validHotelSearch,
      200,
      validateHotelResponse
    );

    // Test past check-in date
    await this.testEndpoint(
      'Hotel Search - Past Check-in Date',
      '/api/hotels/search',
      'POST',
      {
        destination: 'New York',
        checkIn: '2023-01-01',
        checkOut: '2023-01-05',
        guests: { adults: 2, children: 0, rooms: 1 }
      },
      400
    );

    // Test streaming endpoint
    await this.testEndpoint(
      'Hotel Search - Streaming Valid',
      '/api/hotels/search?stream=true&destination=New York&checkIn=2025-08-01&checkOut=2025-08-05',
      'GET',
      null,
      200
    );
  }

  async testActivitySearchAPI() {
    this.log('\n🎯 Testing Activity Search API', colors.blue);
    
    // Test valid activity search
    const validActivitySearch = {
      destination: 'Paris',
      startDate: '2025-08-01',
      endDate: '2025-08-05',
      categories: ['culture', 'outdoor'],
      groupSize: 4
    };

    const validateActivityResponse = (data) => {
      if (!data.success) return { valid: false, message: 'Response not successful' };
      if (!data.data || !Array.isArray(data.data)) return { valid: false, message: 'No activity data array' };
      if (data.data.length === 0) return { valid: false, message: 'No activities returned' };
      
      const activity = data.data[0];
      if (!activity.name || !activity.price || !activity.location || !activity.categories) {
        return { valid: false, message: 'Activity object missing required fields' };
      }
      
      return { valid: true };
    };

    await this.testEndpoint(
      'Activity Search - Valid Request',
      '/api/activities/search',
      'POST',
      validActivitySearch,
      200,
      validateActivityResponse
    );

    // Test missing destination
    await this.testEndpoint(
      'Activity Search - Missing Destination',
      '/api/activities/search',
      'POST',
      { startDate: '2025-08-01' },
      400
    );

    // Test streaming endpoint
    await this.testEndpoint(
      'Activity Search - Streaming Valid',
      '/api/activities/search?stream=true&destination=Paris',
      'GET',
      null,
      200
    );
  }

  async testPaymentBookingAPI() {
    this.log('\n💳 Testing Payment Booking API', colors.blue);
    
    // Test valid booking
    const validBooking = {
      items: [
        {
          type: 'flight',
          id: 'FL001',
          price: 299.99,
          currency: 'USD',
          details: {
            airline: 'American Airlines',
            flightNumber: 'AA123',
            origin: 'JFK',
            destination: 'LAX'
          }
        }
      ],
      paymentMethod: {
        type: 'card',
        card: {
          number: '4111111111111111',
          expiry: '12/25',
          cvv: '123'
        }
      },
      customerInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890'
      }
    };

    const validateBookingResponse = (data) => {
      if (!data.success) return { valid: false, message: 'Response not successful' };
      if (!data.data || !data.data.id) return { valid: false, message: 'No booking ID returned' };
      if (!data.data.paymentStatus) return { valid: false, message: 'No payment status returned' };
      
      return { valid: true };
    };

    await this.testEndpoint(
      'Payment Booking - Valid Request',
      '/api/payments/booking',
      'POST',
      validBooking,
      200,
      validateBookingResponse
    );

    // Test missing customer info
    await this.testEndpoint(
      'Payment Booking - Missing Customer Info',
      '/api/payments/booking',
      'POST',
      { items: validBooking.items, paymentMethod: validBooking.paymentMethod },
      400
    );

    // Test invalid email
    await this.testEndpoint(
      'Payment Booking - Invalid Email',
      '/api/payments/booking',
      'POST',
      {
        ...validBooking,
        customerInfo: {
          ...validBooking.customerInfo,
          email: 'invalid-email'
        }
      },
      400
    );
  }

  async testMockServiceFactory() {
    this.log('\n🏭 Testing Mock Service Factory', colors.blue);
    
    // Test environment variable switching
    const originalEnv = process.env.USE_MOCK_APIS;
    
    try {
      // Set to mock mode
      process.env.USE_MOCK_APIS = 'true';
      
      this.log('✅ Mock API environment variable set to true', colors.green);
      
      // Test if mocks are being used (should return mock data)
      const testResponse = await this.makeRequest('/api/flights/search', 'POST', {
        origin: 'JFK',
        destination: 'LAX',
        departureDate: '2025-08-01'
      });
      
      if (testResponse.status === 200 && testResponse.data.success) {
        this.log('✅ Mock services are functioning correctly', colors.green);
        this.passedTests++;
      } else {
        this.log('❌ Mock services are not functioning correctly', colors.red);
        this.failedTests++;
      }
      
    } finally {
      // Restore original environment
      process.env.USE_MOCK_APIS = originalEnv;
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Mock API Test Suite', colors.magenta);
    this.log('=' * 50, colors.magenta);
    
    // Check if server is running
    const serverRunning = await this.waitForServer();
    if (!serverRunning) {
      return;
    }

    // Run all tests
    await this.testFlightSearchAPI();
    await this.testHotelSearchAPI();
    await this.testActivitySearchAPI();
    await this.testPaymentBookingAPI();
    await this.testMockServiceFactory();

    // Print summary
    this.log('\n' + '=' * 50, colors.magenta);
    this.log('📊 Test Results Summary', colors.magenta);
    this.log('=' * 50, colors.magenta);
    
    const totalTests = this.passedTests + this.failedTests;
    const passRate = totalTests > 0 ? ((this.passedTests / totalTests) * 100).toFixed(1) : 0;
    
    this.log(`✅ Passed: ${this.passedTests}`, colors.green);
    this.log(`❌ Failed: ${this.failedTests}`, colors.red);
    this.log(`📈 Pass Rate: ${passRate}%`, passRate >= 80 ? colors.green : colors.yellow);
    
    if (this.failedTests === 0) {
      this.log('\n🎉 All tests passed! Mock APIs are working correctly.', colors.green);
    } else {
      this.log('\n⚠️  Some tests failed. Please check the implementation.', colors.yellow);
    }
  }
}

// Run the tests
const tester = new APITester(API_BASE_URL);
tester.runAllTests().catch(console.error); 