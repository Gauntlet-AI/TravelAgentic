# Web Package

This package contains the Next.js frontend application for TravelAgentic.

## Overview

The web application provides the user interface for:

- User onboarding and preference collection
- Travel search and filtering
- Booking management
- Itinerary viewing and PDF downloads
- Account management

## Directory Structure

```
packages/web/
├── app/            → Next.js 15 App Router pages and layouts
├── components/     → Reusable UI components
├── hooks/          → Custom React hooks
├── lib/            → Utility functions and API clients
├── public/         → Static assets
├── styles/         → CSS and styling files
├── .next/          → Next.js build output (gitignored)
├── node_modules/   → Local dependencies (some hoisted to root)
├── .eslintrc.json  → ESLint configuration
├── .prettierrc.json → Prettier configuration
├── .prettierignore → Prettier ignore patterns
├── package.json    → Package dependencies and scripts
├── tsconfig.json   → TypeScript configuration
├── tailwind.config.ts → Tailwind CSS configuration
├── next.config.mjs → Next.js configuration
└── README.md       → This file
```

## Workspace Architecture

This package is part of a monorepo workspace structure:

```
TravelAgentic/
├── packages/web/           ← You are here
├── node_modules/           ← Dependencies hoisted here
├── package.json            ← Root workspace configuration
└── .gitignore              ← Single gitignore for entire project
```

**Key Points:**

- **Dependencies are hoisted** to the root `node_modules` for efficiency
- **Next.js binary** is available from root: `../../node_modules/.bin/next`
- **Workspace scripts** delegate to this package: `npm run dev` calls `packages/web/npm run dev`
- **No local .gitignore** - uses root `.gitignore` which covers all patterns

## Setup

### Development Environment

```bash
# From project root (recommended):
npm run install:all      # Install all workspace dependencies
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# From packages/web directory (also works):
npm install              # Install local dependencies
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality Commands:
npm run validate         # Type-check + lint + format:check
npm run fix              # Auto-fix formatting and linting
npm run lint             # Run ESLint
npm run lint:fix         # Run ESLint with auto-fix
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run type-check       # Run TypeScript type checking
```

### Environment Variables

Required environment variables (add to `.env.local`):

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Endpoints
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_LANGFLOW_URL=http://localhost:7860

# Phase Configuration
NEXT_PUBLIC_DEVELOPMENT_PHASE=1
NEXT_PUBLIC_USE_MOCK_APIS=true
NEXT_PUBLIC_ENABLE_CONCURRENT_SEARCH=true
NEXT_PUBLIC_ENABLE_ADVANCED_AUTOMATION=false

# Analytics (optional)
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id
```

## Architecture

### State Management

The application uses React Context for global state management:

```typescript
// contexts/AppContext.tsx
import { createContext, useContext } from 'react';

interface AppContextType {
  user: User | null;
  preferences: UserPreferences;
  bookings: Booking[];
  // ... other state
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
```

### API Integration

API calls are centralized in the `lib/api` directory:

```typescript
// lib/api/flights.ts
export const searchFlights = async (params: FlightSearchParams) => {
  const response = await fetch('/api/flights/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return response.json();
};
```

### Authentication

Authentication is handled through Supabase Auth:

```typescript
// lib/auth.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};
```

## Components

### Component Structure

All components follow a consistent structure:

```typescript
// components/Button/Button.tsx
import { FC, ReactNode } from 'react'
import styles from './Button.module.css'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

/**
 * Reusable button component with consistent styling
 */
export const Button: FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false
}) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
```

### Key Components

- **Layout Components**: Header, Footer, Navigation
- **Search Components**: FlightSearch, HotelSearch, ActivitySearch
- **Booking Components**: BookingCard, BookingList, BookingDetails
- **Form Components**: UserPreferences, PaymentForm
- **UI Components**: Button, Input, Modal, Loading

## Pages

### Page Structure

```
pages/
├── index.tsx           → Landing page
├── onboarding/         → User onboarding flow
├── search/             → Search results pages
├── booking/            → Booking management
├── profile/            → User profile
├── itinerary/          → Itinerary viewing
└── api/                → API routes (proxy to edge functions)
```

### Key Pages

1. **Landing Page** (`/`) - Marketing and sign-up
2. **Onboarding** (`/onboarding`) - User preference collection
3. **Search** (`/search`) - Travel search and filtering
4. **Booking** (`/booking`) - Booking management and checkout
5. **Profile** (`/profile`) - User account management
6. **Itinerary** (`/itinerary`) - Travel itinerary viewing

## Styling

### CSS Modules

We use CSS Modules for component-specific styling:

```css
/* components/Button/Button.module.css */
.button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary {
  background-color: #007bff;
  color: white;
}

.secondary {
  background-color: #6c757d;
  color: white;
}
```

### Global Styles

Global styles are defined in `styles/globals.css`:

```css
/* styles/globals.css */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --error-color: #dc3545;
  --warning-color: #ffc107;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}
```

## Testing

### Unit Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Code quality validation
npm run validate         # Run all checks (type + lint + format)
npm run fix              # Auto-fix code style issues
```

### E2E Tests

```bash
# Run Playwright tests
npm run test:e2e

# Run tests in headed mode
npm run test:e2e:headed
```

### Testing Setup

```typescript
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../../components/Button/Button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## Performance

### Optimization Strategies

1. **Image Optimization**: Use Next.js Image component
2. **Code Splitting**: Automatic with Next.js
3. **Lazy Loading**: Use React.lazy for heavy components
4. **Caching**: Implement SWR for data fetching
5. **Bundle Analysis**: Use @next/bundle-analyzer

### Performance Monitoring

```typescript
// lib/analytics.ts
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID, {
      page_path: url,
    });
  }
};
```

## Deployment

### Docker Deployment

```bash
# Build for production
npm run build

# Build Docker container (from project root)
docker build -t travelagentic .

# Deploy with Docker Compose
docker-compose -f ../../docker-compose.prod.yml up -d
```

### Build Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;
```

## Phase Configuration

Phase-based configuration is implemented using environment variables:

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
  const phase = parseInt(process.env.NEXT_PUBLIC_DEVELOPMENT_PHASE || '1');
  const config = getPhaseConfig(phase);

  return (
    <div>
      {config.browserFallback && <BrowserFallbackIndicator />}
      {/* ... rest of component */}
    </div>
  )
}
```

## Contributing

### Development Guidelines

1. **Install dependencies**: `npm run install:all` (from root)
2. **Follow the established file structure** and App Router patterns
3. **Use TypeScript** for all new code with strict typing
4. **Validate frequently**: `npm run validate` during development
5. **Auto-fix issues**: `npm run fix` before committing
6. **Add unit tests** for new components
7. **Update component documentation** with proper JSDoc comments
8. **Test with different phase configurations**
9. **Follow established naming conventions** and code style

### Code Style

```typescript
// ✅ Good
interface UserPreferences {
  budget: number;
  destination: string;
  dates: { start: Date; end: Date };
}

// ❌ Bad
interface userPrefs {
  budget: any;
  destination: any;
  dates: any;
}
```

### Commit Guidelines

Follow conventional commits:

```bash
# Feature
git commit -m "feat: add flight search component"

# Bug fix
git commit -m "fix: resolve booking form validation"

# Documentation
git commit -m "docs: update component README"
```
