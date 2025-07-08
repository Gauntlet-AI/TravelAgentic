# TravelAgentic Phase 1 Development Setup

Get TravelAgentic running locally with **mock APIs** in 5 minutes. Perfect for frontend development, AI integration testing, and core feature work.

## What is Phase 1?

**Phase 1** is our foundation development environment:
- ✅ **Mock APIs** for flights, hotels, activities (no API keys needed!)
- ✅ **Real AI integration** with OpenAI for trip planning
- ✅ **Local database** with Supabase
- ✅ **PDF generation** for itineraries
- ✅ **Shopping cart** functionality
- ✅ **Full UI/UX** development ready

**Perfect for**: Frontend developers, AI workflow development, core feature implementation

---

## Quick Start

### 1. Prerequisites
- **Node.js** 18+ ([download here](https://nodejs.org/))
- **Git** ([download here](https://git-scm.com/))
- **OpenAI API Key** ([get here](https://platform.openai.com/api-keys)) - Only required API key!

### 2. Clone and Install
```bash
git clone https://github.com/Gauntlet-AI/TravelAgentic.git
cd TravelAgentic
npm install
```

### 3. Environment Setup
Create `.env.local`:

```bash
# AI Integration (REQUIRED)
OPENAI_API_KEY=your_openai_key_here

# Phase 1 Configuration
USE_MOCK_APIS=true
DEVELOPMENT_PHASE=1
NODE_ENV=development

# Supabase (will be auto-configured)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=will_be_generated_next_step

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup
```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Start local database
supabase start

# Copy the anon key from output and update .env.local
# Look for: anon key: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### 5. Start Development
```bash
npm run dev
```

**🎉 Success!** Visit `http://localhost:3000` to see TravelAgentic running with realistic mock data.

---

## What You Just Built

### ✅ **Full Travel Planning App**
- Complete UI for trip planning
- Flight, hotel, and activity search (using mocks)
- AI-powered trip recommendations
- Shopping cart with booking flow
- PDF itinerary generation

### ✅ **Mock API Ecosystem**
- **Flights**: Realistic flight data, pricing, availability
- **Hotels**: Hotel listings with photos, amenities, reviews
- **Activities**: Tours, restaurants, attractions
- **No API rate limits** - perfect for development!

### ✅ **AI Integration**
- OpenAI-powered trip planning
- Conversational travel preferences
- Smart recommendations based on context
- Dynamic form generation

### ✅ **Local Development Stack**
- Supabase PostgreSQL database
- Authentication system
- File storage
- Edge functions ready

---

## Phase 1 Development Workflow

### Frontend Development
```bash
# Start the app
npm run dev

# Run tests
npm test

# Run specific test suites
npm run test:mock-apis
npm run test:components
```

### AI Development
```bash
# Test AI integration
npm run test:ai-integration

# Langflow development (optional)
npm run langflow:dev
```

### Database Development
```bash
# View database
supabase db studio

# Reset database
supabase db reset

# Create migration
supabase migration new feature_name
```

---

## Mock API Details

### Flight Mock API
- **Realistic data**: 500+ airlines, routes, pricing
- **Dynamic pricing**: Prices change based on dates/demand
- **Search filters**: Cabin class, stops, timing
- **Availability simulation**: Some flights "sell out"

### Hotel Mock API
- **Rich data**: Photos, amenities, reviews, location
- **Pricing tiers**: Budget to luxury options
- **Geographic accuracy**: Real hotel locations
- **Seasonal pricing**: Rates vary by season

### Activity Mock API
- **Diverse categories**: Tours, dining, culture, adventure
- **Local relevance**: Activities match destination
- **Booking constraints**: Time slots, group sizes
- **Review system**: Ratings and user feedback

---

## Testing in Phase 1

### Unit Tests
```bash
# Test React components
npm run test:components

# Test utility functions
npm run test:utils

# Test AI integration
npm run test:ai
```

### Integration Tests
```bash
# Test mock APIs
npm run test:mock-apis

# Test user workflows
npm run test:integration

# Test PDF generation
npm run test:pdf
```

### E2E Tests (Optional)
```bash
# Install Playwright (one-time)
npx playwright install

# Run end-to-end tests
npm run test:e2e
```

---

## Common Issues & Solutions

### "OpenAI API errors"
```bash
# Check your API key in .env.local
echo $OPENAI_API_KEY

# Verify you have credits
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### "Supabase won't start"
```bash
# Make sure Docker is running
docker --version

# Restart Supabase
supabase stop
supabase start
```

### "Mock APIs not working"
```bash
# Verify mock configuration in .env.local
USE_MOCK_APIS=true
DEVELOPMENT_PHASE=1

# Restart development server
npm run dev
```

### "Port 3000 already in use"
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### "Database connection errors"
```bash
# Check Supabase status
supabase status

# Restart database
supabase db reset
```

---

## Phase 1 File Structure

```
TravelAgentic/
├── packages/web/              # Main Next.js app
│   ├── components/           # React components
│   ├── pages/               # Next.js pages
│   ├── lib/                 # Utilities, AI integration
│   └── styles/              # CSS and styling
├── packages/mocks/            # Mock API services
│   ├── flights/             # Flight mock data & logic
│   ├── hotels/              # Hotel mock data & logic
│   └── activities/          # Activity mock data & logic
├── supabase/                 # Database schema
│   ├── migrations/          # Database migrations
│   └── functions/           # Edge functions
└── _docs/                    # Documentation
```

---

## Phase 1 Features You Can Build

### ✅ **Frontend Components**
- Trip planning forms
- Search result displays
- Shopping cart UI
- User profiles
- Itinerary views

### ✅ **AI Workflows**
- Conversational trip planning
- Smart recommendations
- Dynamic form generation
- Context-aware suggestions

### ✅ **User Experience**
- Complete booking flows
- PDF itinerary generation
- Responsive design
- Accessibility features

### ✅ **Data Management**
- User preferences
- Trip templates
- Search history
- Booking states

---

## Development Best Practices

### Environment
- Always use `USE_MOCK_APIS=true` in Phase 1
- Keep `DEVELOPMENT_PHASE=1` 
- Use meaningful test data in mocks

### Testing
- Test with mock data first
- Write tests that don't depend on external APIs
- Use realistic test scenarios

### AI Integration
- Test OpenAI integration thoroughly
- Handle API failures gracefully
- Use mock AI responses for tests

---

## Getting Help

### 1. Check the Logs
Most issues show up in terminal output:
```bash
# Development server logs
npm run dev

# Supabase logs
supabase logs
```

### 2. Restart Everything
When in doubt, restart the stack:
```bash
supabase stop
supabase start
npm run dev
```

### 3. Verify Configuration
Check your `.env.local` file has all required values.

### 4. Use Mock Data
Set `USE_MOCK_APIS=true` to avoid any API complexity.

---

## Next Steps

Once you're comfortable with Phase 1 development:

1. **Explore the codebase** - Understand the mock API structure
2. **Build features** - Add new components and workflows  
3. **Test thoroughly** - Use the comprehensive test suite
4. **Contribute** - Phase 1 is perfect for most contributions!

**When you're ready for real APIs** → See `phase2-setup.md` (coming soon)

---

## Why Start with Phase 1?

- 🚀 **Fast setup** - No API key hunting
- 🛡️ **No rate limits** - Develop without restrictions  
- 🎯 **Focus on code** - Not API configuration
- 🧪 **Perfect testing** - Predictable mock data
- 👥 **Team friendly** - Everyone can run it
- 💰 **Cost effective** - No API charges while developing

**Phase 1 is designed to get you productive immediately!** 🎉 