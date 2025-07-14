# TravelAgentic Setup Guide

**Complete development environment setup for TravelAgentic** - Get running in 5 minutes with Docker, mock APIs, and AI integration.

## 📋 Quick Start

### Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **Docker** ([download](https://docker.com/)) - Required for development services
- **Git** ([download](https://git-scm.com/))
- **OpenAI API Key** ([get here](https://platform.openai.com/api-keys)) - Only required API key for development

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/TravelAgentic.git
cd TravelAgentic
npm run install:all
```

### 2. Environment Configuration

Create `.env` file in the project root:

```bash
# Copy template and fill in your values
cp .env.example .env
```

**Essential Variables:**
```bash
# AI Integration (REQUIRED)
OPENAI_API_KEY=your_openai_key_here

# Development Mode
USE_MOCK_APIS=true
NODE_ENV=development

# Database (matches docker-compose.yml)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Services (auto-configured for Docker)
LANGGRAPH_URL=http://localhost:8000
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Development Environment

```bash
# Start all services (Database, LangGraph, Redis, Web)
docker-compose up --build

# Verify services are running
docker-compose ps
```

**What this starts:**
- **Web App**: http://localhost:3000
- **LangGraph AI**: http://localhost:8000  
- **Database**: PostgreSQL on :5432
- **Redis**: Cache on :6379

### 4. Verify Setup

```bash
# Check web app
curl http://localhost:3000

# Check LangGraph service
curl http://localhost:8000/health

# Run code quality checks
npm run validate
```

**🎉 Success!** Visit http://localhost:3000 to see TravelAgentic running.

---

## 🏗️ Development Architecture

### What You Built

- **Next.js 14** full-stack application with App Router
- **LangGraph** AI service for travel planning orchestration
- **PostgreSQL** database with 21-table travel schema
- **Redis** caching layer for performance
- **Mock APIs** for development (no external API dependencies)

### Current Status

| Component | Status | Description |
|-----------|---------|-------------|
| **Web Frontend** | ✅ Complete | Next.js 14 with real-time components |
| **LangGraph AI** | ✅ Complete | 4,391-line unified orchestrator |
| **Database** | ✅ Complete | 21-table PostgreSQL schema |
| **Mock Services** | ✅ Complete | Comprehensive mock API layer |
| **Docker Environment** | ✅ Complete | Multi-service development setup |

---

## 🔧 Development Commands

### Daily Development

```bash
# Start services (if not running)
docker-compose up -d

# Start development server
npm run dev

# Code quality checks
npm run validate

# Auto-fix formatting and linting
npm run fix
```

### Code Quality

```bash
# Run all checks (TypeScript + ESLint + Prettier)
npm run validate

# Individual checks
npm run type-check    # TypeScript type checking
npm run lint         # ESLint checking
npm run format       # Format code with Prettier
```

### Production Build

```bash
# Create production build
npm run build

# Start production server
npm run start
```

### Testing

```bash
# Run LangGraph tests
./run-langgraph-tests.sh all

# Run specific test
./run-langgraph-tests.sh test_orchestrator.py

# Interactive testing shell
./run-langgraph-tests.sh shell
```

---

## 📁 Project Structure

```
TravelAgentic/
├── packages/
│   ├── web/                # Next.js frontend + API routes
│   │   ├── app/           # App Router pages and layouts
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and API clients
│   ├── langgraph/         # LangGraph AI service
│   │   ├── main.py        # FastAPI application
│   │   ├── prompts/       # AI agent prompts
│   │   └── travel_graphs/ # Graph implementations
│   ├── mocks/             # Mock service layer
│   │   ├── data/          # Mock data sources
│   │   ├── services/      # Service implementations
│   │   └── factories/     # Service factory pattern
│   └── seed/              # Database initialization
├── .env                   # Environment configuration
├── docker-compose.yml     # Development services
└── _docs/                 # Documentation
```

---

## 🐳 Docker Services

### Service Configuration

| Service | Port | Purpose |
|---------|------|---------|
| **web** | 3000 | Next.js frontend and API routes |
| **langgraph** | 8000 | LangGraph AI orchestrator |
| **redis** | 6379 | Session management and caching |

### Service Management

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs web
docker-compose logs langgraph

# Stop services
docker-compose down

# Rebuild services
docker-compose up --build
```

---

## 🔄 Mock vs Real APIs

### Development Mode (Default)

```bash
# In .env
USE_MOCK_APIS=true
```

**Benefits:**
- No external API keys needed (except OpenAI)
- Realistic data for development
- No rate limits or costs
- Configurable failures for testing

### Production Mode

```bash
# In .env
USE_MOCK_APIS=false

# Real API keys required
AMADEUS_CLIENT_ID=your_amadeus_id
AMADEUS_CLIENT_SECRET=your_amadeus_secret
```

---

## 🗄️ Database

### Schema Overview

21-table PostgreSQL schema including:
- **User Management**: users, user_preferences, user_sessions
- **Travel Planning**: bookings, itineraries, search_cache
- **AI Orchestration**: conversations, context_snapshots
- **Advanced Features**: shopping_carts, automation_logs

### Database Management

```bash
# Initialize database (automatic with Docker)
docker-compose up -d

# Access database directly
docker-compose exec db psql -U postgres -d travelagentic

# Check tables
docker-compose exec db psql -U postgres -d travelagentic -c "\dt"
```

---

## 🤖 AI Integration

### OpenAI Configuration

```bash
# Required in .env
OPENAI_API_KEY=your_openai_key_here
```

### LangGraph Service

- **URL**: http://localhost:8000
- **Health Check**: http://localhost:8000/health
- **Orchestrator**: 4,391-line unified conversation system
- **Agents**: Flight, Hotel, Activity, Booking, Itinerary

### Testing AI Integration

```bash
# Test orchestrator
./run-langgraph-tests.sh test_orchestrator.py

# Test web integration
./run-langgraph-tests.sh test_webserver_client.py
```

---

## 🔧 Environment Variables

### Required Variables

```bash
# Core Configuration
OPENAI_API_KEY=your_openai_key           # AI integration
USE_MOCK_APIS=true                       # Development mode
NODE_ENV=development                     # Environment

# Database
SUPABASE_URL=your_supabase_url          # Database connection
SUPABASE_ANON_KEY=your_supabase_anon_key # Database auth
SUPABASE_SERVICE_KEY=your_service_key    # Database admin

# Services
LANGGRAPH_URL=http://localhost:8000      # AI service
REDIS_URL=redis://localhost:6379         # Cache
NEXT_PUBLIC_APP_URL=http://localhost:3000 # Web app
```

### Optional Variables (Production)

```bash
# Travel APIs
AMADEUS_CLIENT_ID=your_amadeus_id
AMADEUS_CLIENT_SECRET=your_amadeus_secret

# Payment Processing
STRIPE_SECRET_KEY=your_stripe_key

# Voice Integration
TWILIO_ACCOUNT_SID=your_twilio_sid
ELEVENLABS_API_KEY=your_elevenlabs_key
```

### Environment Best Practices

1. **Single Source**: All config in root `.env` file
2. **Never Commit**: `.env` is gitignored
3. **Template**: Update `.env.example` with new variables
4. **Docker**: Docker Compose reads root `.env` automatically

---

## 🚨 Troubleshooting

### Common Issues

#### Services Won't Start
```bash
# Check Docker is running
docker --version

# Check for port conflicts
lsof -i :3000
lsof -i :8000

# Restart services
docker-compose down
docker-compose up -d
```

#### Database Connection Issues
```bash
# Check services are running
docker-compose ps

# Check environment variables
echo $SUPABASE_URL

# Restart database
docker-compose restart db
```

#### OpenAI API Errors
```bash
# Verify API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check credits and usage
```

#### Module Not Found
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+
```

### Service Status

```bash
# Check all services
docker-compose ps

# Check specific service logs
docker-compose logs web
docker-compose logs langgraph

# Check web app health
curl http://localhost:3000/api/health
```

---

## 📚 Next Steps

### After Setup

1. **Explore the UI** - Visit http://localhost:3000
2. **Test AI Features** - Try the travel planning flow
3. **Review Code** - Check `packages/web/components/`
4. **Run Tests** - Use `./run-langgraph-tests.sh`

### Development Workflow

1. **Start Docker services** - `docker-compose up -d`
2. **Start development server** - `npm run dev`
3. **Make changes** - Edit code with hot reload
4. **Run validation** - `npm run validate`
5. **Test thoroughly** - Use mock APIs and test runner

### Production Deployment

1. **Get real API keys** - Amadeus, Stripe, etc.
2. **Set production environment** - `USE_MOCK_APIS=false`
3. **Configure database** - Production Supabase instance
4. **Deploy containers** - See `_docs/deployment.md`

---

## 🎯 Development Focus

### Current Implementation

- ✅ **Complete Architecture** - All systems operational
- ✅ **Mock APIs** - Full development capability
- ✅ **AI Integration** - LangGraph orchestrator working
- ✅ **Real-time UI** - Live updates and streaming

### Development Priority

1. **Real API Integration** - Connect to Amadeus, Booking.com
2. **Enhanced Testing** - Comprehensive test coverage
3. **Performance Optimization** - Speed improvements
4. **Production Deployment** - Full deployment setup

---

**You're ready to develop!** 🚀

The setup provides a complete development environment with AI-powered travel planning, real-time updates, and comprehensive mock services. Start building features immediately without external API dependencies. 