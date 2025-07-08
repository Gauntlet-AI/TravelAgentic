# ✈️ TravelAgentic — Complete Architecture & Development Plan

This document defines the complete technical architecture, repository structure, testing strategy, CI/CD pipeline, trunk-based development workflow, and contribution guidelines for the open-source AI-powered travel planning application TravelAgentic.

---

## ✅ Technical Stack Overview

| Component         | Technology |
|------------------|------------|
| AI Reasoning & Planning | Langflow |
| API Orchestration | Supabase/Vercel Edge Functions (Deno/TypeScript) |
| Database & Auth  | Supabase |
| Frontend         | Next.js (Vercel) |
| PDF Generation   | React-PDF (@react-pdf/renderer) |
| Browser Automation Fallbacks | Playwright + browser-use |
| AI Voice Calling | Twilio Voice + ElevenLabs + OpenAI GPT |
| Deployment       | Vercel (for web, serverless functions, and previews) |

---

## ✅ Repository Structure (Modular + Open Source Friendly)

```
TravelAgentic/
│
├── .github/                → GitHub workflows, issue templates, etc.
│
├── _docs/                  → Project documentation.
│   ├── Architecture.md     → Complete technical architecture (this file).
│   └── Commit-Style-Guide.md → Git commit conventions.
│
├── README.md               → Project overview, setup, contribution guide.
│
├── LICENSE                 → Open-source license (MIT or Apache 2.0).
│
├── CONTRIBUTING.md         → Contributor guide.
│
├── .gitignore              → Git ignore patterns.
│
├── packages/               → Core services.
│   │
│   ├── langflow/           → Langflow workflows & AI agent configs.
│   │   ├── flows/          → JSON Langflow visual agent flows.
│   │   ├── prompts/        → Prompt templates (for agent tasks).
│   │   └── README.md       → Docs for Langflow setup.
│   │
│   ├── edge-functions/     → Supabase/Vercel Edge Functions.
│   │   ├── api/            → API functions (Flights, Hotels, Activities, PDF).
│   │   ├── utils/          → API clients & shared code.
│   │   ├── supabase.ts     → DB helpers.
│   │   └── README.md       → Setup & deployment guide.
│   │
│   ├── web/                → Next.js frontend.
│   │   ├── pages/          → User pages.
│   │   ├── components/     → UI components (e.g., activity cards).
│   │   └── README.md       → Frontend notes.
│   │
│   ├── database/           → Supabase migrations and schemas.
│   │   └── README.md       → DB structure & usage guide.
│   │
│   ├── mocks/              → Mock API responses for testing.
│   │
│   ├── test_flows/         → Langflow test flows with mock data.
│   │
│   └── seed/               → DB seeds for Supabase testing.
│
├── .env.example            → Example environment variables.
│
└── docker-compose.yml      → (Optional) Dev environment for Langflow & DB.
```

### ✅ Implementation Status

The repository structure above represents the target architecture. Current implementation status:

| Component | Status | Notes |
|-----------|--------|-------|
| Core Structure | ✅ Complete | All directories and main files implemented |
| CI/CD Pipeline | ✅ Complete | GitHub Actions workflow matches specification |
| Environment Config | ✅ Complete | `.env.example` contains all required variables |
| Documentation | ✅ Enhanced | Added `_docs/` directory for better organization |
| Missing Files | ⚠️ Needs Creation | `packages/edge-functions/supabase.ts` - DB helpers |

---

## ✅ Full End-to-End Application Workflow

1. **User Intake:** Collect broad user preferences (budget, dates, location, etc.).
2. **Flight Search:** Auto-search flights based on preferences.
3. **Lodging Search:** Auto-search hotels or Airbnb listings.
4. **Concurrent Activity Search & User Input:** Run background search for activities while gathering additional activity preferences from the user.
5. **Activity Filtering:** Combine background results + user choices, present for multi-select.
6. **Checkout & Booking:** Book all selected options via APIs.
7. **Fallbacks:** Handle booking failures via auto-retries, fallbacks, pauses, or AI voice calls.
8. **PDF Itinerary:** Auto-generate a PDF containing:
   - Flight details (including baggage recheck info).
   - Lodging and activity schedules.
   - Packing tips based on itinerary.
9. **Itinerary Delivery:** Email PDF and store it for download.

---

## ✅ Development Workflow (Trunk-Based Development)

We use a fast, CI/CD-driven **trunk-based development model** for rapid iteration and deployment:

### ✅ Why We Use This Model:
- We need to move quickly and deploy often while keeping the app stable.
- All development happens through Pull Requests directly into `main`—we **don't use a long-lived `dev` branch**.

### ✅ Key Principles:
| Principle                     | Description |
|-------------------------------|-------------|
| **Single Stable Main Branch**  | All code merges into `main` via PRs; no dev branch. |
| **Small, Fast PRs**            | PRs must be small and incremental for fast reviews. |
| **Mandatory CI/CD**            | Every PR must pass tests and validations (mock APIs, Langflow, etc.). |
| **Feature Flags**              | Incomplete features can be safely merged but hidden behind feature flags. |
| **Preview Deployments**        | Each PR auto-deploys to its own preview environment for testing. |
| **Continuous Deployment**      | Every merge to `main` auto-deploys to production (or via scheduled deploys). |

### ✅ Branching Strategy
- All new features and fixes should be developed on **feature branches** from `main`:
  ```bash
  git checkout -b feature/your-feature-name main
  ```

### ✅ Pull Request (PR) Process
- Open PRs **directly against `main`**.
- Every PR must pass:
  - Tests (using mock APIs)
  - Langflow flow validation
  - Linting

### ✅ Preview Deployments
- Each PR automatically deploys to a **Vercel Preview URL**.

### ✅ Merging
- Merge only after PR approval and CI passing.
- Keep PRs small and focused.

### ✅ Feature Flags
- Use environment-based or DB-based feature flags for incomplete features.
- You may merge partially complete features safely behind flags.

### ✅ Deployment
- Merging to `main` triggers auto-deployment to production.

### ✅ Key Rules
- **No dev branch**; all work happens via PRs to `main`.
- Keep your PRs small, frequent, and tested.

### ✅ Benefits:
- Faster merging, fewer conflicts.
- Better contributor experience (every PR tested and previewed automatically).
- Simple branching; easier to manage in open source projects.

### ✅ Risks (and Solutions):
| Risk                                    | Solution |
|-----------------------------------------|----------|
| Accidentally merging unfinished features | Use feature flags to control visibility. |
| CI/CD failures blocking merges           | Keep pipelines stable, prioritize quick fixes. |
| Large, risky PRs                        | Require small, focused PRs with clear scopes. |

---

## ✅ GitHub Actions CI/CD Pipeline

### `.github/workflows/ci-cd-pipeline.yml`
```yaml
name: CI/CD Pipeline

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Dependencies
        run: npm install

      - name: Run Tests (Mock APIs)
        env:
          USE_MOCK_APIS: 'true'
        run: npm run test

      - name: Validate Langflow Flows
        run: npm run validate:flows

      - name: Lint Code
        run: npm run lint

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: build-and-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Production (Vercel)
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## ✅ Testing Strategy (Mock APIs & OSS-Friendly Development)

### ✅ Mock API Strategy
- Use `USE_MOCK_APIS=true` to enable mock API mode.
- Mock files for flights, hotels, activities, bookings, voice calls in `/mocks/` directory.
- Langflow test flows with mock data in `/test_flows/`.
- DB seeds for Supabase testing in `/seed/` directory.
- Voice calls fully mocked during tests (logs calls instead of dialing).

### ✅ Advanced Testing Techniques (OSS-Focused)
- Mock APIs ensure all contributors can run tests without real API keys.
- Playwright used for end-to-end UI tests with mocks and browser automation fallback testing.
- browser-use integration tests validate AI-powered booking flows.
- GitHub Actions pipeline uses `USE_MOCK_APIS=true` by default for CI.
- Optional local testing with real APIs after mock-based testing passes.

---

## ✅ Feature Flag Strategy (Lightweight + OSS-Friendly)

### ✅ Why Feature Flags:
- Allow unfinished or experimental features to merge safely into `main` without being visible to users.

### ✅ Implementation Options:
| Method          | Recommended For |
|-----------------|-----------------|
| ENV Variables   | Early-stage features, globally toggled. |
| Supabase DB Flags | Per-user or per-session flags; more advanced targeting. |

### ✅ Simple ENV Flag Example (Next.js + Edge Functions):
```ts
if (process.env.FEATURE_ACTIVITY_FILTERS === 'true') {
  enableActivityFilters();
}
```

### ✅ Supabase DB Flag Example:
```sql
CREATE TABLE feature_flags (
  id SERIAL PRIMARY KEY,
  feature_name TEXT UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE
);
```

```ts
const isEnabled = await getFeatureFlag('activity_filters');
if (isEnabled) {
  enableActivityFilters();
}
```

### ✅ Best Practices:
- Document all flags in `/packages/web/README.md` or a `FEATURE_FLAGS.md` file.
- Remove old flags after features fully launch.
- Keep flags simple and predictable.

---

## ✅ Advanced Design Notes

### ✅ Comprehensive Fallback Strategy

#### **Multi-Layer Fallback Hierarchy**
1. **Primary API** (always try first with 3 retries)
2. **Secondary API** (different provider for same service)
3. **Browser Automation** (Playwright + browser-use for web scraping)
4. **Voice Calling** (Twilio + ElevenLabs for manual booking)
5. **User Manual Input** (pause and request user intervention)

#### **Browser Automation Fallbacks**
- **Playwright + browser-use** for AI-powered web automation when APIs fail
- **Flight Search**: Google Flights, Kayak fallback scraping
- **Hotel Booking**: Booking.com, Expedia direct automation
- **Restaurant Reservations**: OpenTable automation
- **Activity Booking**: GetYourGuide, Viator web interface
- **Respectful Automation**: Rate limiting, human-like behavior, proper user agents

#### **AI Voice Calling Costs & Strategy**
We use Twilio Voice + ElevenLabs + OpenAI GPT for outbound voice bookings when all digital methods fail.
- **Estimated Cost per US Call:** ~$0.03 - $0.05 per call (3 mins typical length).
- **Twilio:** ~0.85 cents/minute for US outbound calls.
- **ElevenLabs & OpenAI GPT:** costs are minimal per call.
- **OSS-Friendly Design:** Voice calling is optional and fully mocked in tests.

#### **Automation-Level Based Fallback Strategy**
Based on the automation slider (0-10 scale):
- **0-3:** Pause and ask user on every failure
- **4-7:** Auto-retry → browser automation → ask user
- **8-10:** Auto-retry → browser automation → voice call → user notification

### ✅ Automation Slider & Booking Fallback Logic
- Slider value stored in agent memory; controls automation level.
- Decisions made dynamically by Langflow agent during booking phase.
- **Example Logic:**
  - **Low automation:** Ask user on every failure.
  - **Mid automation:** Auto-rebook with nearest alternative.
  - **High automation:** Auto-rebook, retry later, or initiate voice call.

---

### ✅ PDF Itinerary Generation Strategy
Post-checkout, the system generates a PDF itinerary including:
- Flight info (e.g., baggage recheck requirements).
- Lodging details (check-in/out, location, amenities).
- Activity schedule.
- Personalized packing tips (e.g., sunscreen, hiking shoes, documents).
- Emergency contacts & local tips.

### ✅ Implementation:
- Langflow generates text-based itinerary & packing tips.
- Edge Functions generate the PDF using React-PDF for structured, programmatic PDF creation.
- Delivered via email or stored in Supabase Storage for download.

---

### ✅ Langflow + Edge Functions Rationale
Why we chose this stack:
- **Langflow** provides visual, easily editable LLM workflows with context memory.
- **Edge Functions** (Vercel/Supabase) handle scalable API orchestration with full code flexibility.
- **OSS-friendly:** Both tools are open source or self-hostable.
- **Easy testing & contributor onboarding** with mock APIs and modular components.

### ✅ Alternatives Considered:
- **n8n:** Too redundant with Langflow; not AI-first.
- **LangGraph:** Powerful but too complex and code-heavy for initial fast-moving MVP.

---

## ✅ Environment Configuration

### ✅ Required Environment Variables (`.env.example`)
```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Phase 1 APIs (Essential - Days 1-2)
OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=your_stripe_key
LANGFLOW_API_KEY=your_langflow_key

# Phase 2 APIs (Enhanced - Days 3-4)
TEQUILA_API_KEY=your_tequila_key
BOOKING_API_KEY=your_booking_key
VIATOR_API_KEY=your_viator_key
WEATHER_API_KEY=your_weather_key
CURRENCY_API_KEY=your_currency_key
ANTHROPIC_API_KEY=your_anthropic_key

# Phase 3 APIs (Advanced - Days 5-6)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
ELEVENLABS_API_KEY=your_elevenlabs_key
ROME2RIO_API_KEY=your_rome2rio_key
FLIGHTAWARE_API_KEY=your_flightaware_key
FOURSQUARE_API_KEY=your_foursquare_key

# Browser Automation (Playwright + browser-use)
PLAYWRIGHT_BROWSERS_PATH=/path/to/browsers
BROWSER_USE_HEADLESS=true
BROWSER_USE_TIMEOUT=30000
AUTOMATION_USER_AGENT=TravelAgentic/1.0 (+https://github.com/Gauntlet-AI/TravelAgentic)
AUTOMATION_DELAY_MS=2000

# Feature Flags
FEATURE_ACTIVITY_FILTERS=true
FEATURE_VOICE_CALLING=false
FEATURE_PDF_GENERATION=true
FEATURE_BROWSER_FALLBACK=true
ENABLE_CONCURRENT_SEARCH=true
ENABLE_AI_SELECTION=true

# Testing & Development
USE_MOCK_APIS=true
NODE_ENV=development
```

---

## ✅ Deployment Strategy

### ✅ Production Deployment
- **Frontend & API:** Vercel (Next.js app with Edge Functions)
- **Database:** Supabase (managed PostgreSQL)
- **AI Workflows:** Langflow (self-hosted or cloud)
- **File Storage:** Supabase Storage (for PDFs, user uploads)

### ✅ Development Environment
- **Local Development:** Docker Compose setup for Langflow + Supabase
- **Preview Deployments:** Automatic Vercel previews per PR
- **Testing:** Jest + React Testing Library + Playwright
- **Browser Automation:** Playwright + browser-use for fallback testing

---

## ✅ Security & Privacy Considerations

### ✅ Data Protection
- All sensitive user data encrypted at rest and in transit
- PII handling compliance (GDPR, CCPA)
- Secure API key management via environment variables
- Rate limiting on all public endpoints

### ✅ Authentication & Authorization
- Supabase Auth for user management
- JWT tokens for API access
- Role-based access control (RBAC)
- Session management with secure cookies

---

## ✅ Monitoring & Observability

### ✅ Application Monitoring
- **Error Tracking:** Sentry or similar
- **Performance Monitoring:** Vercel Analytics
- **Uptime Monitoring:** Pingdom or similar
- **API Monitoring:** Custom dashboards for booking success rates

### ✅ Business Metrics
- **Conversion Rates:** User journey completion rates
- **Booking Success:** API success/failure rates
- **Cost Tracking:** Voice call costs, API usage costs
- **User Satisfaction:** Feedback collection and analysis

---

## ✅ Contribution Guidelines

### ✅ Getting Started
1. Fork the repository
2. Set up your development environment using `docker-compose up`
3. Copy `.env.example` to `.env` and configure mock APIs
4. Run tests with `npm run test`
5. Create a feature branch: `git checkout -b feature/your-feature-name`

### ✅ Documentation Structure
- **`README.md`** - Project overview and quick start guide
- **`CONTRIBUTING.md`** - Detailed contribution guidelines
- **`_docs/Architecture.md`** - Complete technical architecture (this document)
- **`_docs/Commit-Style-Guide.md`** - Git commit conventions and standards
- **Package-specific READMEs** - Setup and usage guides for each package

### ✅ Code Quality Standards
- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- Jest for unit tests (>80% coverage required)
- Playwright + browser-use for E2E tests and automation fallback testing
- JSDoc comments for all public functions

### ✅ PR Requirements
- Small, focused changes
- Tests passing (with mock APIs)
- Documentation updated
- Code review by at least one maintainer
- No breaking changes without discussion

---

## ✅ Roadmap & Future Enhancements

### ✅ Phase 1 (MVP)
- [x] Basic user intake flow
- [x] Flight search integration
- [x] Hotel search integration
- [x] Simple activity recommendations
- [x] Basic PDF itinerary generation

### ✅ Phase 2 (Enhanced Features)
- [ ] Advanced activity filtering
- [ ] Browser automation fallback system (Playwright + browser-use)
- [ ] Voice call fallback system
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Group travel planning

### ✅ Phase 3 (Enterprise Features)
- [ ] White-label solutions
- [ ] Advanced analytics dashboard
- [ ] API marketplace for travel partners
- [ ] AI-powered budget optimization
- [ ] Real-time travel alerts

---

This comprehensive document serves as the complete technical specification for TravelAgentic, combining architecture, development workflow, testing strategy, and contribution guidelines in a single authoritative source. 