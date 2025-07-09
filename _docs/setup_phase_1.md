# TravelAgentic Phase 1 Development Setup

Get TravelAgentic running locally with **mock APIs** in 5 minutes. Perfect for frontend development, AI integration testing, and core feature work.

## What is Phase 1?

**Phase 1** is our foundation development environment:

- ✅ **Mock APIs** for flights, hotels, activities (no API keys needed for most features!)
- ✅ **Real AI integration** with OpenAI for trip planning
- ✅ **Local database** with Supabase (will be initialized)
- ✅ **Full UI/UX** development ready

**Perfect for**: Frontend developers, AI workflow development, core feature implementation

---

## Quick Start

### 1. Prerequisites

- **Node.js** 18+ ([download here](https://nodejs.org/))
- **Git** ([download here](https://git-scm.com/))
- **Docker** ([download here](https://docker.com/)) - Required for local Supabase
- **OpenAI API Key** ([get here](https://platform.openai.com/api-keys)) - Only required API key!

### 2. Clone and Install

```bash
git clone https://github.com/Gauntlet-AI/TravelAgentic.git
cd TravelAgentic
npm run install:all
```

### 3. Database Setup (Using Docker Compose)

```bash
# Start the full development stack (Database + Langflow + Redis)
docker-compose up -d

# Verify services are running
docker-compose ps
```

**What this starts:**

- PostgreSQL database on port 5432
- Langflow on port 7860 (AI workflow builder)
- Redis on port 6379 (caching)

### 4. Environment Setup

Create `.env.local` in the project root:

```bash
# AI Integration (REQUIRED)
OPENAI_API_KEY=your_openai_key_here

# Phase 1 Configuration
USE_MOCK_APIS=true
DEVELOPMENT_PHASE=1
NODE_ENV=development

# Database (matches docker-compose.yml)
DATABASE_URL=postgresql://postgres:password@localhost:5432/travelagentic
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=travelagentic
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# Langflow (optional for Phase 1)
LANGFLOW_URL=http://localhost:7860

# Redis (optional for Phase 1)
REDIS_URL=redis://localhost:6379

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Verify Database Setup

```bash
# The database schema is created automatically from packages/seed/01_init.sql
# Verify it worked by connecting to the database
psql -h localhost -p 5432 -U postgres -d travelagentic -c "\dt"

# You should see: users, user_preferences, bookings, itineraries, search_cache
```

### 6. Start Development

```bash
# Start the Next.js development server (from root - recommended)
npm run dev

# Or from packages/web directory
cd packages/web
npm run dev
```

**🎉 Success!** Visit `http://localhost:3000` to see TravelAgentic running.

---

## What You Just Built

### ✅ **Working Development Environment**

- Next.js application running locally
- PostgreSQL database with travel schema
- Langflow AI workflow builder (http://localhost:7860)
- Redis caching layer
- Mock API foundation ready for implementation
- AI integration ready (with OpenAI key)

### ✅ **Current Phase 1 Status**

- **Database**: ✅ Working with travel schema
- **Langflow**: ✅ Ready for AI workflow development
- **Redis**: ✅ Ready for caching
- **Mock APIs**: ⏳ Ready for implementation (see TODOs)
- **AI Integration**: ✅ Ready with OpenAI

### ✅ **Ready for Development**

- Frontend components in `packages/web/components/`
- Database schema in place
- Environment configuration complete
- Development server running

---

## Phase 1 Development Workflow

### Starting Development (Daily)

```bash
# Start database and services (if not running)
docker-compose up -d

# Start development server (from root)
npm run dev

# Validate your code frequently
npm run validate

# Auto-fix code style issues
npm run fix
```

### Stopping Development

```bash
# Stop development server
Ctrl+C

# Stop database and services (optional - saves resources)
docker-compose down
```

### Database Management

```bash
# View database directly
psql -h localhost -p 5432 -U postgres -d travelagentic

# Check service status
docker-compose ps

# View logs
docker-compose logs supabase-db
```

---

## Current Project Structure

```
TravelAgentic/
├── packages/web/              # Next.js 15 full-stack app (App Router)
│   ├── app/                 # Next.js App Router pages and layouts
│   │   ├── api/             # API routes (flights, hotels, activities)
│   │   ├── (auth)/          # Auth pages (login, signup)
│   │   ├── (booking)/       # Booking flow pages
│   │   └── (dashboard)/     # User dashboard pages
│   ├── components/          # React components (Shadcn/UI + custom)
│   ├── lib/                 # Utilities, API integration
│   ├── hooks/               # Custom React hooks
│   ├── styles/              # CSS and styling
│   ├── .eslintrc.json       # ESLint configuration
│   ├── .prettierrc.json     # Prettier configuration
│   └── package.json         # Web package dependencies
├── packages/database/        # Database documentation
├── packages/langflow/        # Langflow AI workflows
├── packages/mocks/          # Mock API services (ready for implementation)
├── packages/seed/           # Database seed data (ready for implementation)
├── node_modules/            # Hoisted workspace dependencies
├── .gitignore               # Single gitignore for entire project
├── .env.example             # Environment variable template
├── docker-compose.yml       # PostgreSQL + Langflow + Redis
└── _docs/                   # Documentation
```

---

## Phase 1 TODOs (From Current State)

Based on the current project structure, here's what needs to be implemented:

### 🔄 **Immediate TODOs**

1. **Mock Flight API Routes** - Implement in `packages/web/pages/api/flights/`
2. **Mock Hotel API Routes** - Implement in `packages/web/pages/api/hotels/`
3. **Mock Activity API Routes** - Implement in `packages/web/pages/api/activities/`
4. **Basic Frontend Components** - Create search forms and result displays
5. **Database Integration** - Connect frontend to Supabase

### 📋 **Complete TODO List**

- [ ] Setup mock flight search API route
- [ ] Setup mock hotel search API route
- [ ] Setup mock activity search API route
- [ ] Setup user preferences API route
- [ ] Setup booking cart API route
- [ ] Setup mock checkout API route
- [ ] Setup PDF generation API route
- [ ] Setup Langflow integration

---

## Common Issues & Solutions

### "Docker not found" or "Services won't start"

```bash
# Make sure Docker is installed and running
docker --version

# If Docker is not running:
# - Start Docker Desktop (Mac/Windows)
# - Start Docker service (Linux): sudo systemctl start docker
```

### "Port already in use"

```bash
# Check what's using port 5432 (PostgreSQL)
lsof -i :5432

# Stop and restart services
docker-compose down
docker-compose up -d
```

### "Database connection failed"

```bash
# Check if services are running
docker-compose ps

# If not running, start them
docker-compose up -d

# Check your .env.local has correct credentials
# Database should be: postgresql://postgres:password@localhost:5432/travelagentic
```

### "OpenAI API errors"

```bash
# Check your API key in .env.local
echo $OPENAI_API_KEY

# Verify you have credits
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### "Mock APIs not working"

This is expected! The mock APIs need to be implemented. This is part of Phase 1 development.

---

## Development Best Practices

### Environment

- Always use `USE_MOCK_APIS=true` in Phase 1
- Keep `DEVELOPMENT_PHASE=1`
- Start Docker services before developing

### Database

- Use `psql` or database client to view data
- Don't modify the database directly in production
- Use migrations for schema changes (future)
- Database persists between docker-compose restarts

### AI Integration

- Test OpenAI integration early
- Handle API failures gracefully
- Use reasonable token limits

---

## Getting Help

### 1. Check Service Status

```bash
# Check if services are running
docker-compose ps
npm run dev # (should show no errors)

# Available development commands:
npm run validate     # Check TypeScript + ESLint + Prettier
npm run fix          # Auto-fix formatting and linting
npm run build        # Test production build
```

### 2. Check Logs

```bash
# Database logs
docker-compose logs supabase-db

# Langflow logs
docker-compose logs langflow

# Next.js logs (in terminal running npm run dev)
```

### 3. Restart Everything

```bash
# Stop everything
docker-compose down
# Stop Next.js dev server (Ctrl+C)

# Start everything
docker-compose up -d
cd packages/web && npm run dev
```

### 4. Common Solutions

- **Database issues**: Usually fixed by `docker-compose down` then `docker-compose up -d`
- **Environment issues**: Double-check `.env.local` has correct values
- **Port conflicts**: Change ports in docker-compose.yml or kill conflicting processes

---

## Next Steps

Once you have this working:

1. **Implement Mock APIs** - Start with flight search
2. **Build Frontend Components** - Create search forms and results
3. **Connect Database** - Integrate user preferences and history
4. **Add AI Integration** - Implement trip planning workflows
5. **Test Everything** - Use the mock data for development

**Phase 1 is about building the foundation!** 🚀

---

## Why This Setup Works

- 🎯 **Minimal requirements** - Only Docker, Node.js, and OpenAI key needed
- 🔄 **Matches actual project structure** - No references to non-existent files
- 📦 **Monorepo ready** - Uses the packages structure correctly
- 🧪 **Mock-first approach** - Build features before API complexity
- 🚀 **Production-ready foundation** - Real database and auth system

**This setup gets you productive immediately with the current codebase!** 🎉
