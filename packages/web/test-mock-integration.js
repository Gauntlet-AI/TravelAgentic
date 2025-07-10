/**
 * Test script to verify mock API integration
 * This script tests all the travel API endpoints to ensure they work with mock services
 */

// Set environment for mock APIs
process.env.USE_MOCK_APIS = 'true';
process.env.DEVELOPMENT_PHASE = '1';
process.env.NODE_ENV = 'development';

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Test flight search endpoint
 */
async function testFlightSearch() {
  console.log('🛫 Testing flight search...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/flights/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        origin: 'JFK',
        destination: 'LAX',
        departureDate: '2025-12-15',
        passengers: 2,
        cabin: 'economy'
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Flight search successful');
      console.log(`   Found ${data.data?.length || 0} flights`);
      console.log(`   Response time: ${data.responseTime}ms`);
      console.log(`   Fallback used: ${data.fallbackUsed}`);
    } else {
      console.log('❌ Flight search failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Flight search error:', error.message);
  }
}

/**
 * Test hotel search endpoint
 */
async function testHotelSearch() {
  console.log('🏨 Testing hotel search...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/hotels/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: 'Los Angeles',
        checkIn: '2025-12-15',
        checkOut: '2025-12-18',
        guests: {
          adults: 2,
          children: 0,
          rooms: 1
        }
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Hotel search successful');
      console.log(`   Found ${data.data?.length || 0} hotels`);
      console.log(`   Response time: ${data.responseTime}ms`);
      console.log(`   Fallback used: ${data.fallbackUsed}`);
    } else {
      console.log('❌ Hotel search failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Hotel search error:', error.message);
  }
}

/**
 * Test activity search endpoint
 */
async function testActivitySearch() {
  console.log('🎯 Testing activity search...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/activities/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination: 'Los Angeles',
        startDate: '2025-12-15',
        endDate: '2025-12-18',
        categories: ['outdoor', 'culture']
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Activity search successful');
      console.log(`   Found ${data.data?.length || 0} activities`);
      console.log(`   Response time: ${data.responseTime}ms`);
      console.log(`   Fallback used: ${data.fallbackUsed}`);
    } else {
      console.log('❌ Activity search failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Activity search error:', error.message);
  }
}

/**
 * Test activity categories endpoint
 */
async function testActivityCategories() {
  console.log('📂 Testing activity categories...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/activities/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Activity categories successful');
      console.log(`   Found ${data.data?.length || 0} categories`);
      console.log(`   Response time: ${data.responseTime}ms`);
      console.log(`   Fallback used: ${data.fallbackUsed}`);
    } else {
      console.log('❌ Activity categories failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Activity categories error:', error.message);
  }
}

/**
 * Test payment booking endpoint
 */
async function testPaymentBooking() {
  console.log('💳 Testing payment booking...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/payments/booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            type: 'flight',
            id: 'FL001',
            quantity: 1,
            price: { amount: 299.99, currency: 'USD' }
          },
          {
            type: 'hotel',
            id: 'HT001',
            quantity: 3,
            price: { amount: 150.00, currency: 'USD' }
          }
        ],
        paymentMethod: {
          type: 'card',
          cardNumber: '4111111111111111',
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: '123'
        },
        customerInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890'
        }
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Payment booking successful');
      console.log(`   Booking ID: ${data.data?.bookingId}`);
      console.log(`   Status: ${data.data?.status}`);
      console.log(`   Total: $${data.data?.totalAmount} ${data.data?.currency}`);
      console.log(`   Response time: ${data.responseTime}ms`);
      console.log(`   Fallback used: ${data.fallbackUsed}`);
    } else {
      console.log('❌ Payment booking failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Payment booking error:', error.message);
  }
}

/**
 * Test API status endpoint
 */
async function testAPIStatus() {
  console.log('🔍 Testing API status...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ API status check successful');
      console.log(`   Environment: ${data.environment}`);
      console.log(`   Mock mode: ${data.mockMode}`);
      console.log(`   Phase: ${data.phase}`);
      console.log(`   Timestamp: ${data.timestamp}`);
    } else {
      console.log('❌ API status check failed:', data.error);
    }
  } catch (error) {
    console.log('❌ API status error:', error.message);
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 Starting Mock API Integration Tests\n');
  console.log('Environment Configuration:');
  console.log(`   USE_MOCK_APIS: ${process.env.USE_MOCK_APIS}`);
  console.log(`   DEVELOPMENT_PHASE: ${process.env.DEVELOPMENT_PHASE}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}\n`);
  
  await testAPIStatus();
  console.log('');
  
  await testFlightSearch();
  console.log('');
  
  await testHotelSearch();
  console.log('');
  
  await testActivitySearch();
  console.log('');
  
  await testActivityCategories();
  console.log('');
  
  await testPaymentBooking();
  console.log('');
  
  console.log('✨ Mock API Integration Tests Complete!\n');
  console.log('Next steps:');
  console.log('1. Set USE_MOCK_APIS=true in your .env.local file');
  console.log('2. Set DEVELOPMENT_PHASE=1 in your .env.local file');
  console.log('3. Start the development server with: npm run dev');
  console.log('4. Test the frontend by visiting http://localhost:3000');
}

// Export functions for potential use in other test files
module.exports = {
  testFlightSearch,
  testHotelSearch,
  testActivitySearch,
  testActivityCategories,
  testPaymentBooking,
  testAPIStatus,
  runAllTests
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
} 