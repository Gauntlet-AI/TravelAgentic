# Contributing to TravelAgentic

We're excited that you're interested in contributing to TravelAgentic! This guide will help you get started with our development workflow and contribution process.

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose
- Git
- Node.js 18+ (for local development without Docker)
- Supabase account (for cloud database) or local PostgreSQL

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/yourusername/TravelAgentic.git
cd TravelAgentic
```

### 2. Set up Development Environment

```bash
# Copy environment template
cp .env.example .env

# For development without API keys, use mock mode
echo "USE_MOCK_APIS=true" >> .env
echo "OPENAI_API_KEY=your_openai_key" >> .env

# Start all services (Web App, Langflow, Redis, Local DB)
docker-compose up -d

# View running services
docker-compose ps
```

### 3. Verify Setup

```bash
# Check that all services are running
curl http://localhost:3000/api/health
curl http://localhost:7860/health

# Run tests (if implemented)
npm run test
```

Access the application at:
- **Web App**: http://localhost:3000
- **Langflow UI**: http://localhost:7860
- **Local PostgreSQL**: localhost:5432 (for database access)
- **Redis**: localhost:6379 (for cache debugging)

## 📋 Development Workflow (Trunk-Based Development)

We use a fast, CI/CD-driven **trunk-based development model**:

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
- Each PR automatically builds a Docker container for testing.

### ✅ Merging
- Merge only after PR approval and CI passing.
- Keep PRs small and focused.

### ✅ Phase-Based Development
- Use phase-based configuration to manage feature rollout.
- You may merge partially complete features safely by configuring appropriate phases.

### ✅ Deployment
- Merging to `main` triggers Docker image build and push to container registry.

### ✅ Key Rules
- **No dev branch**; all work happens via PRs to `main`.
- Keep your PRs small, frequent, and tested.

## 🧪 Testing Strategy

### Mock API Development (Recommended)

For contributor-friendly development without API keys:

```bash
# Enable mock APIs
export USE_MOCK_APIS=true

# Run all tests
npm run test

# Run specific package tests
npm run test:web
npm run test:edge-functions

# Start development server
npm run dev
```

### Real API Testing (Optional)

```bash
# Requires all API keys to be configured
export USE_MOCK_APIS=false
npm run test
```

## 📦 Package Structure

Each package is self-contained with its own README:

- **`packages/langflow/`** - AI workflow orchestration
- **`packages/edge-functions/`** - API orchestration
- **`packages/web/`** - Next.js frontend
- **`packages/database/`** - Supabase schema & migrations
- **`packages/mocks/`** - Mock API responses
- **`packages/test_flows/`** - Langflow test flows
- **`packages/seed/`** - Database seed data

## 🔧 Development Guidelines

### Code Style

- **TypeScript**: Use strict mode for all new code
- **ESLint + Prettier**: Automatic formatting on save
- **Conventional Commits**: Follow conventional commit format
- **Documentation**: JSDoc comments for all public functions

### File Structure

```typescript
// ✅ Good: Clear, descriptive structure
packages/web/components/FlightSearch/
├── FlightSearch.tsx
├── FlightSearch.test.tsx
├── FlightSearch.module.css
├── types.ts
└── index.ts

// ❌ Bad: Unclear structure
packages/web/components/
├── flight.tsx
├── hotel.tsx
└── activity.tsx
```

### Component Guidelines

```typescript
// ✅ Good: Proper TypeScript, JSDoc, clear naming
interface FlightSearchProps {
  /** User's departure city */
  departure: string
  /** User's destination city */
  destination: string
  /** Search callback function */
  onSearch: (results: FlightResult[]) => void
}

/**
 * Flight search component with real-time results
 */
export const FlightSearch: React.FC<FlightSearchProps> = ({
  departure,
  destination,
  onSearch
}) => {
  // Component implementation
}

// ❌ Bad: No types, unclear purpose
export const FlightSearch = (props: any) => {
  // Component implementation
}
```

### API Integration

```typescript
// ✅ Good: Error handling, mock support
export const searchFlights = async (params: FlightSearchParams) => {
  try {
    if (process.env.USE_MOCK_APIS === 'true') {
      return await mockFlightSearch(params)
    }
    
    const response = await fetch('/api/flights/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    })
    
    if (!response.ok) {
      throw new Error(`Flight search failed: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Flight search error:', error)
    throw error
  }
}

// ❌ Bad: No error handling, no mock support
export const searchFlights = async (params: any) => {
  const response = await fetch('/api/flights/search', {
    method: 'POST',
    body: JSON.stringify(params)
  })
  return response.json()
}
```

## 🎯 Contributing to Specific Packages

### Contributing to Langflow (`packages/langflow/`)

1. **Design flows** in the Langflow UI (http://localhost:7860)
2. **Export flows** as JSON to the `flows/` directory
3. **Create test flows** with mock data
4. **Update documentation** in the package README

### Contributing to Edge Functions (`packages/edge-functions/`)

1. **Create new API endpoints** in the `api/` directory
2. **Add comprehensive error handling**
3. **Support mock API mode** for testing
4. **Include rate limiting** for production endpoints
5. **Add unit tests** for all functions

### Contributing to Web Frontend (`packages/web/`)

1. **Follow component structure** guidelines
2. **Use TypeScript strictly**
3. **Add unit tests** for components
4. **Test responsive design** on mobile and desktop
5. **Include accessibility features**

### Contributing to Database (`packages/database/`)

1. **Create migration files** for schema changes
2. **Update TypeScript types** after migrations
3. **Add appropriate indexes** for performance
4. **Include seed data** for testing
5. **Document RLS policies**

## 🧾 Commit Guidelines

Follow conventional commits:

```bash
# Feature
git commit -m "feat: add flight search component"

# Bug fix
git commit -m "fix: resolve booking form validation"

# Documentation
git commit -m "docs: update API documentation"

# Refactor
git commit -m "refactor: improve error handling"

# Test
git commit -m "test: add unit tests for booking flow"
```

## 🔄 Pull Request Process

### 1. Create Your Branch

```bash
git checkout -b feature/your-feature-name main
```

### 2. Make Your Changes

- Follow the coding guidelines
- Add tests for new functionality
- Update documentation as needed
- Test with mock APIs: `USE_MOCK_APIS=true`

### 3. Test Your Changes

```bash
# Run all tests
npm run test

# Test specific packages
npm run test:web
npm run test:edge-functions

# Lint code
npm run lint

# Type check
npm run type-check
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add your feature description"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub.

### 6. PR Review Process

- **Automated checks** must pass (CI/CD pipeline)
- **Code review** by at least one maintainer
- **Preview deployment** will be created automatically
- **Small, focused changes** are preferred

## 🚀 Phase-Based Development

Use phase-based configuration to manage feature rollout:

### Environment Variables

```bash
# Control development phase
DEVELOPMENT_PHASE=1
USE_MOCK_APIS=true
ENABLE_CONCURRENT_SEARCH=true
ENABLE_ADVANCED_AUTOMATION=false
```

### Implementation

```typescript
// lib/phase-config.ts
export const getPhaseConfig = (phase: number = 1) => {
  const configs = {
    1: {
      mockApis: true,
      browserFallback: false,
      voiceCalling: false,
      realPayments: false
    },
    2: {
      mockApis: false,
      browserFallback: true,
      voiceCalling: false,
      realPayments: false
    },
    3: {
      mockApis: false,
      browserFallback: true,
      voiceCalling: true,
      realPayments: true
    }
  };
  return configs[phase] || configs[1];
};

// Usage in components
import { getPhaseConfig } from '../lib/phase-config'

export const SearchPage = () => {
  const config = getPhaseConfig(process.env.DEVELOPMENT_PHASE);
  
  return (
    <div>
      {config.browserFallback && <BrowserFallbackIndicator />}
      {/* ... rest of component */}
    </div>
  )
}
```

## 🐛 Bug Reports

When reporting bugs:

1. **Use the bug report template**
2. **Include reproduction steps**
3. **Provide environment information**
4. **Include relevant logs/screenshots**
5. **Test with mock APIs first**

## 💡 Feature Requests

For new features:

1. **Check existing issues** to avoid duplicates
2. **Use the feature request template**
3. **Provide clear use cases**
4. **Consider implementation complexity**
5. **Discuss in GitHub Discussions first**

## 🎨 Design Contributions

For UI/UX improvements:

1. **Follow existing design patterns**
2. **Ensure accessibility compliance**
3. **Test on multiple devices**
4. **Provide mockups/wireframes**
5. **Consider mobile-first design**

## 📖 Documentation

Help improve our documentation:

1. **Update README files** for code changes
2. **Add inline code comments**
3. **Create tutorials** for complex features
4. **Fix typos and unclear explanations**
5. **Add examples** for API usage

## 🛡️ Security

For security issues:

1. **Do not open public issues** for security vulnerabilities
2. **Create a private security advisory** on GitHub or email maintainers directly
3. **Follow responsible disclosure**
4. **Allow time for fixes** before public disclosure

## 🤝 Community

Join our community:

- **GitHub Discussions**: Ask questions and share ideas
- **Discord**: Real-time chat and support
- **Twitter**: Follow us for updates
- **Blog**: Read about our development journey

## 📜 Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

## 🙏 Recognition

Contributors are recognized in:
- **README contributors section**
- **Release notes** for significant contributions
- **Hall of Fame** for outstanding contributors

---

**Thank you for contributing to TravelAgentic!** 🚀

Your contributions help make AI-powered travel planning accessible to everyone. 