# ✈️ TravelAgentic

An AI-powered travel planning application that automates the entire trip booking process from search to itinerary generation.

## 🚀 Overview

TravelAgentic is an open-source AI-first travel planning platform that:
- Collects user preferences and constraints
- Searches flights, hotels, and activities simultaneously
- Handles booking automation with intelligent fallbacks
- Generates personalized PDF itineraries
- Provides voice call fallbacks for failed bookings

## 🏗️ Architecture

```
TravelAgentic/
├── packages/
│   ├── langflow/       → AI workflow orchestration
│   ├── edge-functions/ → API orchestration (Vercel/Supabase)
│   ├── web/           → Next.js frontend
│   ├── database/      → Supabase schema & migrations
│   ├── mocks/         → Mock API responses for testing
│   ├── test_flows/    → Langflow test flows
│   └── seed/          → Database seed data
├── .github/           → CI/CD workflows
├── _docs/             → Documentation
└── docker-compose.yml → Local development environment
```

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **AI Orchestration** | Langflow |
| **API Layer** | Vercel Edge Functions / Supabase Functions |
| **Database** | Supabase (PostgreSQL) |
| **Frontend** | Next.js + TypeScript |
| **Authentication** | Supabase Auth |
| **PDF Generation** | Puppeteer |
| **Voice Calls** | Twilio + ElevenLabs + OpenAI |
| **Deployment** | Vercel + Supabase |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Supabase CLI
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/TravelAgentic.git
cd TravelAgentic
```

### 2. Set up Environment Variables

```bash
# Copy environment template
cp .env.example .env

# Edit with your API keys (or use mock mode)
# For development, you can use:
USE_MOCK_APIS=true
```

### 3. Start Development Environment

```bash
# Start all services (Supabase, Langflow, Redis)
docker-compose up -d

# Install dependencies
npm install

# Start the web application
cd packages/web
npm run dev
```

### 4. Access the Application

- **Web App**: http://localhost:3000
- **Langflow UI**: http://localhost:7860
- **Supabase Studio**: http://localhost:54323

## 📁 Package Overview

### 🧠 Langflow Package
AI workflow orchestration for travel planning logic.
- **Location**: `packages/langflow/`
- **Purpose**: Visual AI workflows for user preferences, search coordination, and booking automation
- **Key Features**: User intake flows, search orchestration, booking fallback strategies

### 🔗 Edge Functions Package
Serverless API endpoints for external integrations.
- **Location**: `packages/edge-functions/`
- **Purpose**: API orchestration for flights, hotels, activities, and bookings
- **Key Features**: Rate limiting, error handling, mock API support

### 🌐 Web Package
Next.js frontend application.
- **Location**: `packages/web/`
- **Purpose**: User interface for travel planning and booking
- **Key Features**: Responsive design, authentication, real-time search

### 🗄️ Database Package
Supabase database schema and migrations.
- **Location**: `packages/database/`
- **Purpose**: Database structure, migrations, and seed data
- **Key Features**: RLS policies, TypeScript types, performance optimization

## 🧪 Testing

### Run Tests with Mock APIs (Recommended)

```bash
# Enable mock mode
export USE_MOCK_APIS=true

# Run all tests
npm run test

# Run specific package tests
npm run test:web
npm run test:edge-functions
npm run test:langflow
```

### Run Tests with Real APIs

```bash
# Requires all API keys to be configured
export USE_MOCK_APIS=false
npm run test
```

## 📚 Documentation

- **[Complete Architecture](_docs/Architecture.md)** - Full technical specification
- **[Contributing Guide](CONTRIBUTING.md)** - Development workflow and guidelines
- **[Package READMEs](packages/)** - Detailed documentation for each package

## 🔧 Development

### Feature Flags

Control feature visibility using environment variables:

```bash
# Enable/disable features
FEATURE_ACTIVITY_FILTERS=true
FEATURE_VOICE_CALLING=false
FEATURE_PDF_GENERATION=true
```

### Mock API Development

For contributor-friendly development without API keys:

```bash
# Enable mock APIs
USE_MOCK_APIS=true

# All external API calls will return mock data
npm run dev
```

### Adding New Features

1. **Create feature branch**: `git checkout -b feature/your-feature-name`
2. **Develop with mock APIs**: `USE_MOCK_APIS=true`
3. **Add tests**: Cover new functionality
4. **Update documentation**: README and code comments
5. **Submit PR**: Small, focused changes

## 🚢 Deployment

### Preview Deployment

Every pull request automatically deploys to a preview environment via Vercel.

### Production Deployment

```bash
# Deploy to production
vercel --prod

# Deploy database migrations
supabase db push

# Deploy Langflow workflows
# (Manual deployment via Langflow UI)
```

## 🏗️ CI/CD Pipeline

- **Automated Testing**: All PRs run tests with mock APIs
- **Code Quality**: ESLint, TypeScript checks, and formatting
- **Preview Deployments**: Automatic Vercel previews for each PR
- **Production Deployment**: Auto-deploy on merge to main

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. **Fork the repository**
2. **Create a feature branch**
3. **Set up mock APIs**: `USE_MOCK_APIS=true`
4. **Make your changes**
5. **Add tests**
6. **Submit a pull request**

## 🎯 Roadmap

### Phase 1: MVP 🚧
- [ ] Basic user intake flow
- [ ] Flight search integration
- [ ] Hotel search integration
- [ ] Simple activity recommendations
- [ ] Basic PDF itinerary generation

### Phase 2: Enhanced Features
- [ ] Advanced activity filtering
- [ ] Voice call fallback system
- [ ] Multi-language support
- [ ] Group travel planning
- [ ] Real-time price tracking

### Phase 3: Enterprise Features
- [ ] White-label solutions
- [ ] Advanced analytics dashboard
- [ ] API marketplace for travel partners
- [ ] AI-powered budget optimization
- [ ] Mobile app (React Native)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💡 Philosophy

**AI-First Architecture**: Built for seamless integration with AI tools and easy contributor onboarding.

**Mock-Friendly Development**: Contributors can run the full application without API keys.

**Trunk-Based Development**: Fast iteration with continuous deployment.

**Modular Design**: Each package is self-contained with clear responsibilities.

## 🆘 Support

- **Documentation**: Check package READMEs for detailed information
- **Issues**: Report bugs and request features on GitHub Issues
- **Discussions**: Join community discussions on GitHub Discussions
- **Discord**: Join our community Discord for real-time help

## 🙏 Acknowledgments

- **Langflow**: For visual AI workflow orchestration
- **Supabase**: For database and authentication infrastructure
- **Vercel**: For deployment and edge computing
- **OpenAI**: For AI capabilities
- **Community**: For contributions and feedback

---

**Ready to build the future of travel planning?** 🚀

Get started with our [Contributing Guide](CONTRIBUTING.md) and join our community of developers! 