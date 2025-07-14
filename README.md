# ✈️ TravelAgentic

> **🚀 Active Development**: Working v0 prototype with Next.js + React components. Currently migrating to enhanced architecture.

An AI-powered travel planning application that automates the entire trip booking process from search to itinerary generation.

## 🚀 Overview

TravelAgentic is an **active** open-source AI-first travel planning platform that will:

- Collect user preferences and constraints through intelligent intake
- Search flights, hotels, and activities simultaneously using APIs and browser automation
- Handle booking automation with comprehensive 5-layer fallback system
- Generate personalized PDF itineraries with packing tips and local information
- Provide browser automation and voice call fallbacks for maximum booking success

**Current Status**: 🚀 **Working v0 Prototype** - Core UI components and App Router structure complete. Migrating to enhanced packages architecture.

## 📋 Quick Navigation

| Section                                                       | Description                                    |
| ------------------------------------------------------------- | ---------------------------------------------- |
| [🎯 Phase-Based Strategy](#-phase-based-development-strategy) | 3-phase development approach                   |
| [🚀 Quick Start](#-quick-start)                               | Get up and running in 5 minutes                |
| [🛡️ Fallback System](#-comprehensive-fallback-system)         | 5-layer fallback hierarchy                     |
| [🧪 Testing](#-testing)                                       | Mock APIs and browser automation testing       |
| [🔧 Development](#-development)                               | Phase-based development and contribution guide |
| [🎯 Roadmap](#-roadmap)                                       | Current progress and future plans              |

## 🏗️ Architecture

```
TravelAgentic/
├── packages/
│   ├── langgraph/     → LangGraph AI orchestration (4,391-line unified orchestrator)
│   ├── web/           → Next.js full-stack app (frontend + 16 API route groups)
│   ├── mocks/         → Comprehensive mock API system with service factory
│   └── seed/          → Database schema & initialization (21-table PostgreSQL)
├── _docs/             → Consolidated documentation (6 core files)
├── .github/           → CI/CD workflows
├── Dockerfile         → Production container build
├── docker-compose.yml → Development environment
└── docker-compose.prod.yml → Production deployment
```

## 🛠️ Tech Stack

### **Current Working Stack**

| Component          | Technology                           |
| ------------------ | ------------------------------------ |
| **Frontend**       | Next.js 15 + App Router + TypeScript |
| **UI Components**  | Shadcn/UI + Radix UI + Tailwind CSS  |
| **AI Integration** | OpenAI API + AI SDK                  |
| **Forms**          | React Hook Form + Zod validation     |
| **Styling**        | Tailwind CSS + CSS Variables         |
| **Development**    | ESLint + TypeScript                  |

### **Planned Enhanced Stack**

| Component              | Technology                      |
| ---------------------- | ------------------------------- |
| **AI Orchestration**   | LangGraph                       |
| **Database**           | Supabase Cloud                  |
| **Authentication**     | Supabase Auth                   |
| **PDF Generation**     | React-PDF (@react-pdf/renderer) |
| **Browser Automation** | Playwright + browser-use        |
| **Voice Calls**        | Twilio + ElevenLabs + OpenAI    |
| **Deployment**         | Docker Containers               |

## 🌐 Amadeus API Integration

TravelAgentic integrates with the **Amadeus Travel API** as the primary data source for flights, hotels, and activities. This provides access to real-time travel data from the world's largest travel marketplace.

### **Features**

- **✈️ Flight Search**: Real-time flight offers with pricing and availability
- **🏨 Hotel Search**: Hotel listings with offers and availability
- **🎯 Activity Search**: Points of interest and tours/activities
- **🔐 OAuth2 Authentication**: Automatic token refresh with 1-minute buffer
- **⚡ Rate Limiting**: Respects API limits (10 TPS test, 40 TPS production)
- **🛡️ Error Handling**: Comprehensive error handling with retry logic
- **🔄 Fallback Support**: Graceful fallback to mock services if API fails

### **Configuration**

```bash
# Phase 2: Amadeus API Configuration
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
AMADEUS_ENVIRONMENT=test  # or 'production'

# Phase Control
USE_MOCK_APIS=false
DEVELOPMENT_PHASE=2
```

### **Service Integration**

The Amadeus services automatically integrate with the TravelAgentic service factory:

- **Phase 1**: Uses mock services (`USE_MOCK_APIS=true`)  
- **Phase 2**: Uses real Amadeus API when credentials are provided
- **Fallback**: Gracefully falls back to mocks if configuration fails

### **Testing**

Test the integration without TypeScript compilation:

```bash
# Start Next.js dev server
npm run dev

# Run HTTP-based integration test  
cd packages/web
node test-amadeus-integration.js
```

For detailed Amadeus integration documentation, see: [`packages/web/lib/amadeus/README.md`](packages/web/lib/amadeus/README.md)

## 🎯 Phase-Based Development Strategy

TravelAgentic follows a strategic 3-phase development approach that balances rapid MVP delivery with production-ready scalability:

### **Phase 1: MVP Foundation (Days 1-2)**

- **Focus**: Core automation with comprehensive mocks
- **APIs**: OpenAI (AI), Stripe (payments), all travel APIs mocked
- **Goal**: Complete booking flow demonstration

### **Phase 2: Enhanced Features (Days 3-4)**

- **Focus**: Real API integration + browser automation fallbacks
- **APIs**: Amadeus (primary), Tequila (flights), Booking.com (hotels), Viator (activities)
- **Fallbacks**: Playwright + browser-use automation for API failures

### **Phase 3: Production Ready (Days 5-6)**

- **Focus**: Advanced features + comprehensive testing
- **APIs**: Twilio Voice, ElevenLabs, Rome2Rio, FlightAware
- **Goal**: Production-ready with 95% feature completeness

## 🚀 Development Setup

### **Current Setup (Working v0)**

#### Prerequisites

- Node.js 18+
- Git

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/TravelAgentic.git
cd TravelAgentic
```

#### 2. Install Dependencies

```bash
# Install all workspace dependencies
npm run install:all
```

#### 3. Set up Environment Variables

```bash
# Create environment file
cp .env.example .env.local

# Required for current v0 app
OPENAI_API_KEY=your_openai_key
```

#### 4. Start Development Server

```bash
npm run dev
```

#### 5. Access the Application

- **Web App**: http://localhost:3000

#### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run validate         # Run type-check + lint + format:check
npm run fix              # Auto-fix formatting and linting issues
npm run lint             # Run ESLint
npm run lint:fix         # Run ESLint with auto-fix
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # Run TypeScript type checking

# Workspace Management
npm run install:all      # Install all workspace dependencies
npm run clean            # Clean all node_modules and build artifacts
```

#### Quick Reference

**Start full development environment:**
```bash
# Setup LangGraph virtual environment (first time only)
cd packages/langgraph
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Start all services with Docker
cd ../..
docker-compose up --build
```

**Common Docker commands:**
```bash
# Start services in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild specific service
docker-compose up --build langgraph
```

**LangGraph development:**
```bash
# Activate virtual environment
cd packages/langgraph
source .venv/bin/activate
# or
./activate.sh

# Start LangGraph server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### **Enhanced Setup with LangGraph**

#### Prerequisites

- Docker & Docker Compose
- Python 3.8+
- Supabase CLI (optional)

#### LangGraph Virtual Environment Setup

The LangGraph service requires a Python virtual environment:

```bash
# Navigate to LangGraph directory
cd packages/langgraph

# Create virtual environment (first time only)
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate

# Or use the provided activation script
chmod +x activate.sh
./activate.sh

# Install dependencies
pip install -r requirements.txt

# Upgrade pip (recommended)
python -m pip install --upgrade pip
```

**Virtual Environment Management:**
```bash
# Activate (standard method)
source .venv/bin/activate

# Activate (using custom script)
./activate.sh

# Deactivate
deactivate

# If .venv is corrupted, recreate it
rm -rf .venv && python3 -m venv .venv
```

#### Enhanced Environment Variables

```bash
# Create environment file
cp .env.example .env

# Core configuration
USE_MOCK_APIS=true
DEVELOPMENT_PHASE=1
SUPABASE_URL=your_supabase_url
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# LangGraph configuration
LANGGRAPH_URL=http://langgraph:8000
ENABLE_LANGGRAPH=true

# Phase 2: Add travel APIs (optional)
TEQUILA_API_KEY=your_tequila_key
BOOKING_API_KEY=your_booking_key
VIATOR_API_KEY=your_viator_key

# Phase 3: Advanced APIs (optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
ELEVENLABS_API_KEY=your_elevenlabs_key
```

#### Enhanced Development with Docker

```bash
# Start all services (Web App, LangGraph, Redis)
docker-compose up --build

# Start in detached mode
docker-compose up -d --build

# Rebuild specific service
docker-compose up --build web
docker-compose up --build langgraph

# View logs
docker-compose logs -f web
docker-compose logs -f langgraph

# Stop all services
docker-compose down
```

#### Access Services

- **Web App**: http://localhost:3000
- **LangGraph API**: http://localhost:8000
- **Redis**: localhost:6379

#### Development Without Docker

```bash
# Terminal 1: Start LangGraph service
cd packages/langgraph
source .venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Start web application
cd packages/web
npm run dev
```

## 🛡️ Comprehensive Fallback System

TravelAgentic implements a 5-layer fallback hierarchy to ensure maximum booking success:

### **Fallback Hierarchy**

1. **Primary API** → Try main travel API (Tequila, Booking.com, Viator) with 3 retries
2. **Secondary API** → Switch to alternative provider for same service
3. **Browser Automation** → Playwright + browser-use for web scraping when APIs fail
4. **Voice Calling** → Twilio + ElevenLabs for manual booking via AI phone calls
5. **User Manual Input** → Pause and request user intervention as last resort

### **Browser Automation Features**

- **AI-Powered Navigation**: Natural language instructions to Playwright + browser-use
- **Target Sites**: Google Flights, Booking.com, OpenTable, GetYourGuide
- **Respectful Automation**: Rate limiting, human-like behavior, proper user agents
- **Fallback Coverage**: Flights, hotels, restaurants, activities

## 📁 Current Package Structure

### 🧠 LangGraph Package (✅ Complete)

AI workflow orchestration for travel planning logic.

- **Location**: `packages/langgraph/` (4,391-line unified orchestrator)
- **Purpose**: LangGraph-based AI workflows for travel planning
- **Key Features**: Travel orchestrator, conversation state management, agent collaboration
- **Status**: Production-ready with comprehensive testing

### 🌐 Web Package (✅ Complete)

Next.js frontend application with full-stack API routes.

- **Location**: `packages/web/` (Next.js 14 with App Router)
- **Purpose**: User interface and API layer for travel planning
- **Key Features**: Real-time components, 16 API route groups, authentication, responsive design
- **Status**: Complete implementation with SSE and LangGraph integration

### 🧪 Mock Services Package (✅ Complete)

Comprehensive mock API layer for development.

- **Location**: `packages/mocks/` (Service factory pattern)
- **Purpose**: Mock implementations of all travel services
- **Key Features**: Realistic data, configurable failures, environment-based switching
- **Status**: Complete with identical interfaces to real APIs

### 🗄️ Database Schema Package (✅ Complete)

Database initialization and schema management.

- **Location**: `packages/seed/` (21-table PostgreSQL schema)
- **Purpose**: Database structure, initialization, and seed data
- **Key Features**: Comprehensive travel schema, JSONB preferences, performance optimization
- **Status**: Production-ready schema with migration scripts

## 🧪 Testing Strategy

### **Current Testing State**

- **Status**: HTTP-based integration testing available
- **Available**: Basic linting with `npm run lint`, Amadeus API integration tests
- **Implemented**: Mock API system with comprehensive fallback testing

### **Planned Testing Implementation**

#### Run Integration Tests (Available Now)

```bash
# Start Next.js development server
npm run dev

# Run HTTP-based Amadeus integration test  
cd packages/web
node test-amadeus-integration.js

# Enable mock mode for OSS-friendly development
export USE_MOCK_APIS=true
```

#### Run Full Test Suite (Planned)

```bash
# Run all tests (when implemented)
npm run test

# Run specific package tests (planned)
npm run test:web
npm run test:edge-functions
npm run test:langgraph

# Test browser automation fallbacks (planned)
npm run test:playwright
```

#### Run Tests with Real APIs (Future)

```bash
# Requires all API keys to be configured
export USE_MOCK_APIS=false
npm run test

# Test actual browser automation (requires real sites)
npm run test:browser-automation
```

### Testing Strategy

- **Unit Tests**: Jest + React Testing Library for components
- **Integration Tests**: API client testing with mocks and real APIs
- **E2E Tests**: Playwright for full user journeys
- **Browser Automation Tests**: Playwright + browser-use for fallback scenarios
- **Failure Simulation**: Mock API failure injection for fallback testing

## 📚 Documentation

### **Main Documentation**

- **[Complete Architecture](_docs/ARCHITECTURE.md)** - Comprehensive technical architecture documentation (current implementation)
- **[Setup Guide](_docs/SETUP.md)** - Complete development environment setup
- **[Product Requirements](_docs/PRD.md)** - Complete product vision with user stories and enterprise features
- **[Contributing Guide](CONTRIBUTING.md)** - Development workflow and guidelines

### **Package Documentation**

- **[Web Frontend](packages/web/README.md)** - Next.js frontend application
- **[LangGraph Service](packages/langgraph/README.md)** - LangGraph AI service
- **[Mock Services](packages/mocks/README.md)** - Mock API layer
- **[Database Schema](packages/seed/README.md)** - Database initialization and schema

## 🔧 Development

### Phase-Based Development

Control development configuration using environment variables:

```bash
# Phase 1 Configuration (MVP)
DEVELOPMENT_PHASE=1
USE_MOCK_APIS=true

# Phase 2 Configuration (Enhanced)
DEVELOPMENT_PHASE=2
ENABLE_CONCURRENT_SEARCH=true

# Phase 3 Configuration (Advanced)
DEVELOPMENT_PHASE=3
ENABLE_ADVANCED_AUTOMATION=true
```

### Mock API Development

For contributor-friendly development without API keys:

```bash
# Enable mock APIs (recommended for development)
USE_MOCK_APIS=true

# All external API calls will return realistic mock data
npm run dev
```

**Why Mock APIs?**

- **Zero Setup**: No API keys required for development
- **Consistent Testing**: Predictable responses for automated testing
- **Offline Development**: Work without internet connectivity
- **Cost-Free**: No API usage charges during development
- **Fast Iteration**: Instant responses without rate limiting

**Transition to Real APIs**: Our API factory pattern allows seamless switching from mocks to real APIs by simply changing `USE_MOCK_APIS=false` and providing API keys.

### Adding New Features

1. **Create feature branch**: `git checkout -b feature/your-feature-name`
2. **Install dependencies**: `npm run install:all`
3. **Develop with mock APIs**: `USE_MOCK_APIS=true`
4. **Validate frequently**: `npm run validate`
5. **Auto-fix issues**: `npm run fix`
6. **Add tests**: Cover new functionality
7. **Update documentation**: README and code comments
8. **Submit PR**: Small, focused changes

## 🚢 Deployment

### Development Deployment

```bash
# Start local development environment
docker-compose up -d

# View application at http://localhost:3000
```

### Production Deployment

```bash
# Build and deploy with production configuration
docker-compose -f docker-compose.prod.yml up -d

# Or build for deployment to container platforms
docker build -t travelagentic:latest .
```

### Container Platform Options

- **AWS ECS/Fargate**: Managed containers with auto-scaling
- **Google Cloud Run**: Serverless containers, pay-per-request
- **DigitalOcean App Platform**: Simple container deployment
- **Railway**: Developer-friendly container hosting
- **Any VPS**: Simple docker-compose deployment

## 🏗️ CI/CD Pipeline

- **Automated Testing**: All PRs run tests with mock APIs
- **Code Quality**: `npm run validate` (TypeScript + ESLint + Prettier)
- **Auto-fixing**: `npm run fix` for consistent code formatting
- **Docker Build**: Automatic container builds on merge to main
- **Container Registry**: Push to your chosen container registry
- **Production Deployment**: Deploy to your container platform

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. **Fork the repository**
2. **Create a feature branch**
3. **Install dependencies**: `npm run install:all`
4. **Set up mock APIs**: `USE_MOCK_APIS=true`
5. **Make your changes**
6. **Validate code quality**: `npm run validate`
7. **Auto-fix issues**: `npm run fix`
8. **Submit a pull request**

## 🎯 Roadmap

### ✅ **Current Status: Working v0 Prototype**

- [x] Next.js 15 + App Router foundation
- [x] Shadcn/UI component library integration
- [x] OpenAI API integration
- [x] Basic travel components (flight-card, hotel-card, activity-card)
- [x] Authentication pages (login, signup)
- [x] Chat interface and research API routes

### 🔄 **Phase 1: Architecture Migration (In Progress)**

- [x] Migrate to packages/web structure
- [x] Implement mock API system
- [x] Add comprehensive Amadeus API integration
- [ ] Add comprehensive travel search flow
- [x] Integrate LangGraph for AI orchestration
- [ ] Add database integration (Supabase)

### 📋 **Phase 2: Enhanced Features (Partially Complete)**

- [x] Amadeus API integration (flights, hotels, activities)
- [x] Comprehensive error handling and fallback system  
- [x] Service factory pattern for API switching
- [ ] Alternative API integration (Tequila, Booking.com, Viator)
- [ ] Browser automation fallbacks (Playwright + browser-use)
- [ ] Advanced activity filtering and personalization
- [ ] Improved UI/UX with loading states

### 🚀 **Phase 3: Production Ready (Planned)**

- [ ] Voice call fallback system (Twilio + ElevenLabs)
- [ ] Comprehensive testing (85% coverage)
- [ ] Performance optimization and caching
- [ ] Advanced automation features
- [ ] Production deployment and monitoring

### Future Enhancements 🚀

- [ ] Multi-language support (15+ languages)
- [ ] Group travel planning and coordination
- [ ] White-label solutions for travel agencies
- [ ] Mobile app (React Native)
- [ ] Enterprise features and analytics dashboard

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💡 Philosophy

**AI-First Architecture**: Built for seamless integration with AI tools, from LangGraph workflows to browser-use automation.

**Phase-Based Development**: Strategic 3-phase approach balancing rapid MVP delivery with production scalability.

**Comprehensive Fallbacks**: 5-layer fallback system ensures booking success even when primary APIs fail.

**OSS-Friendly Development**: Contributors can run the full application with just `USE_MOCK_APIS=true`.

**Trunk-Based Development**: Fast iteration with continuous deployment and automatic preview environments.

**Modular Design**: Each package is self-contained with clear responsibilities and easy testing.

## 🆘 Support

- **Documentation**: Check package READMEs for detailed information
- **Issues**: Report bugs and request features on GitHub Issues
- **Discussions**: Join community discussions on GitHub Discussions
- **Discord**: Join our community Discord for real-time help

## 🙏 Acknowledgments

- **LangGraph**: For multi-agent AI workflow orchestration
- **Supabase**: For database and authentication infrastructure
- **Docker**: For containerized deployment
- **OpenAI**: For AI capabilities and natural language processing
- **Playwright + browser-use**: For reliable browser automation fallbacks
- **Community**: For contributions and feedback

---

**Ready to help build the future of travel planning?** 🚀

We have a **working v0 prototype** and are enhancing it with comprehensive architecture. Check out our documentation:

### **Core Documentation**

- [🏗️ Complete Architecture](_docs/ARCHITECTURE.md) - Comprehensive technical architecture documentation (current implementation)
- [⚙️ Setup Guide](_docs/SETUP.md) - Complete development environment setup
- [📋 Product Requirements](_docs/PRD.md) - Full product requirements with user stories and enterprise features
- [🤝 Contributing Guide](CONTRIBUTING.md) - Development workflow and guidelines

**Development is active with working v0 prototype - contributions welcome!**
