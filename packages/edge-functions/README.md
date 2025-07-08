# Edge Functions Package

This package contains the Supabase/Vercel Edge Functions for TravelAgentic's API orchestration.

## Overview

Edge Functions provide scalable, serverless API endpoints for:
- Flight search API integration
- Hotel and accommodation search
- Activity and attraction search
- Booking management
- PDF itinerary generation
- Voice call fallback handling

## Directory Structure

```
packages/edge-functions/
├── api/            → API functions (Flights, Hotels, Activities, PDF)
├── utils/          → API clients & shared code
├── supabase.ts     → DB helpers
├── dist/          → Compiled functions (gitignored)
└── README.md      → This file
```

## Setup

### Development Environment

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Deploy to Vercel
vercel --prod
```

### Environment Variables

Required environment variables (add to `.env.local`):

```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# API Keys
OPENAI_API_KEY=your_openai_key
AMADEUS_API_KEY=your_amadeus_key
BOOKING_API_KEY=your_booking_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
ELEVENLABS_API_KEY=your_elevenlabs_key

# Phase Configuration
USE_MOCK_APIS=false
```

## API Endpoints

### Flight Search
- `POST /api/flights/search` - Search for flights
- `GET /api/flights/:id` - Get flight details
- `POST /api/flights/book` - Book selected flight

### Hotel Search
- `POST /api/hotels/search` - Search for hotels
- `GET /api/hotels/:id` - Get hotel details
- `POST /api/hotels/book` - Book selected hotel

### Activity Search
- `POST /api/activities/search` - Search for activities
- `GET /api/activities/:id` - Get activity details
- `POST /api/activities/book` - Book selected activity

### Booking Management
- `GET /api/bookings` - List user bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings/cancel` - Cancel booking

### PDF Generation
- `POST /api/pdf/generate` - Generate itinerary PDF
- `GET /api/pdf/:id` - Download PDF

### Voice Calling
- `POST /api/voice/call` - Initiate voice call for booking
- `GET /api/voice/status/:id` - Check call status

## Development

### Creating New Edge Functions

1. Create a new file in the `api/` directory
2. Follow the standard Edge Function structure:

```typescript
import { createClient } from '@supabase/supabase-js'

export default async function handler(req: Request) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200, 
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  }

  try {
    // Your function logic here
    const data = await req.json()
    
    // Process and return response
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
```

### Using Utilities

Common utilities are available in the `utils/` directory:

```typescript
import { createSupabaseClient } from '../utils/supabase'
import { callExternalAPI } from '../utils/api-client'
import { validateRequest } from '../utils/validation'
```

### Database Integration

Use the Supabase client for database operations:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Example: Save booking
const { data, error } = await supabase
  .from('bookings')
  .insert([booking])
```

## Testing

### Mock API Mode

Enable mock APIs for testing:

```bash
# Test with mock APIs
USE_MOCK_APIS=true npm run test

# Test with real APIs (requires API keys)
USE_MOCK_APIS=false npm run test
```

### Unit Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- flights.test.ts

# Run with coverage
npm run test:coverage
```

## Deployment

### Vercel Deployment

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Supabase Edge Functions

```bash
# Deploy to Supabase
supabase functions deploy

# Deploy specific function
supabase functions deploy flight-search
```

## Error Handling

All functions should implement proper error handling:

```typescript
try {
  // API call
  const result = await externalAPI.call(params)
  return successResponse(result)
} catch (error) {
  console.error('API Error:', error)
  
  // Return appropriate error response
  if (error.code === 'RATE_LIMIT') {
    return errorResponse('Rate limit exceeded', 429)
  }
  
  return errorResponse('Internal server error', 500)
}
```

## Rate Limiting

Functions implement rate limiting to prevent abuse:

```typescript
import { rateLimit } from '../utils/rate-limit'

export default async function handler(req: Request) {
  // Apply rate limiting
  const rateLimitResult = await rateLimit(req)
  if (!rateLimitResult.success) {
    return errorResponse('Rate limit exceeded', 429)
  }
  
  // Continue with function logic
}
```

## Monitoring

Functions are monitored for:
- Response times
- Error rates
- API usage
- Rate limit violations

View metrics in:
- Vercel Analytics Dashboard
- Supabase Dashboard
- Custom monitoring endpoints

## Contributing

When adding new edge functions:

1. Follow the established patterns
2. Add comprehensive error handling
3. Include unit tests
4. Update this README
5. Test with both mock and real APIs
6. Ensure proper rate limiting 