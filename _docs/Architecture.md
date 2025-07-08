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
| PDF Generation   | Puppeteer (HTML to PDF) |
| AI Voice Calling | Twilio Voice + ElevenLabs + OpenAI GPT |
| Deployment       | Vercel (for web, serverless functions, and previews) |

---

## ✅ Repository Structure (Modular + Open Source Friendly)

```
TravelAgentic/
│
├── .github/                → GitHub workflows, issue templates, etc.
│
├── README.md               → Project overview, setup, contribution guide.
│
├── LICENSE                 → Open-source license (MIT or Apache 2.0).
│
├── CONTRIBUTING.md         → Contributor guide.
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
- Playwright or Cypress recommended for end-to-end UI tests with mocks.
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

### ✅ AI Voice Calling Costs & Fallback Strategy
We use Twilio Voice + ElevenLabs + OpenAI GPT for outbound voice bookings when APIs fail.
- **Estimated Cost per US Call:** ~$0.03 - $0.05 per call (3 mins typical length).
- **Twilio:** ~0.85 cents/minute for US outbound calls.
- **ElevenLabs & OpenAI GPT:** costs are minimal per call.
- **OSS-Friendly Design:** Voice calling is optional and fully mocked in tests.

### ✅ Fallback Booking Strategy:
- Based on the automation slider (0-10 scale):
  - **0:** Fully manual (pause and ask user).
  - **5:** Mix of automatic fallback and manual checks.
  - **10:** Fully autonomous with voice call fallbacks.
- Agent decides whether to retry, fallback, pause, or call based on slider level.

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
- Edge Functions generate the PDF using Puppeteer (HTML-to-PDF) or pdf-lib (structured PDF).
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

# API Keys
OPENAI_API_KEY=your_openai_key
LANGFLOW_API_KEY=your_langflow_key

# External APIs
AMADEUS_API_KEY=your_amadeus_key
BOOKING_API_KEY=your_booking_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
ELEVENLABS_API_KEY=your_elevenlabs_key

# Feature Flags
FEATURE_ACTIVITY_FILTERS=false
FEATURE_VOICE_CALLING=false
FEATURE_PDF_GENERATION=true

# Testing
USE_MOCK_APIS=false
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
- **Testing:** Jest + React Testing Library + Playwright/Cypress

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

### ✅ Code Quality Standards
- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- Jest for unit tests (>80% coverage required)
- Playwright for E2E tests
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