# TravelAgentic Setup Instructions

## Prerequisites

- Node.js 18.0.0 or higher
- NPM 8.0.0 or higher
- Git (for cloning the repository)

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/TravelAgentic.git
cd TravelAgentic
```

### 2. Install Dependencies (Workspace Setup)

```bash

# Install all workspace dependencies (recommended)

npm run install:all

# This installs dependencies for:

# - Root workspace

# - packages/web (Next.js app)

# - All other packages in the monorepo

```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env

# OpenAI API Key (required for AI features)

OPENAI_API_KEY=your_openai_api_key_here

# Next.js Configuration

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Development Server

```bash

# Start the development server (from root - recommended)

npm run dev

# The app will be available at http://localhost:3000

```

### 5. Code Quality & Validation

```bash

# Run all quality checks (TypeScript + ESLint + Prettier)

npm run validate

# Auto-fix formatting and linting issues

npm run fix

# Individual commands:

npm run type-check # TypeScript type checking
npm run lint # ESLint checking
npm run lint:fix # ESLint with auto-fix
npm run format # Format code with Prettier
npm run format:check # Check formatting without changes
```

### 6. Build for Production

```bash

# Create production build

npm run build

# Start production server

npm run start
```

## NPM-Specific Commands

### Package Management

```bash

# Install a new package

npm install package-name

# Install dev dependency

npm install --save-dev package-name

# Update packages

npm update

# Check for outdated packages

npm outdated

# Audit for vulnerabilities

npm audit

# Fix vulnerabilities

npm audit fix
```

### Troubleshooting NPM Issues

#### Clear NPM Cache

```bash
npm cache clean --force
```

#### Delete node_modules and Reinstall

```bash
rm -rf node_modules package-lock.json
npm install
```

#### Use Legacy Peer Deps (if needed)

```bash
npm install --legacy-peer-deps
```

#### Check NPM Configuration

```bash
npm config list
```

## Project Scripts

### Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Code Quality

- `npm run validate` - Run all checks (TypeScript + ESLint + Prettier)
- `npm run fix` - Auto-fix formatting and linting issues
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

### Workspace Management

- `npm run install:all` - Install all workspace dependencies
- `npm run clean` - Clean all node_modules and build artifacts

## Workspace Structure

TravelAgentic uses npm workspaces for a monorepo setup:

```
TravelAgentic/
├── node_modules/ # Hoisted dependencies (shared)
├── packages/
│ ├── web/ # Next.js application
│ │ ├── node_modules/ # Package-specific dependencies
│ │ └── package.json # Web package dependencies
│ ├── database/ # Database schemas
│ ├── langflow/ # AI workflows
│ └── mocks/ # Mock API data
├── package.json # Root workspace configuration
└── .gitignore # Single gitignore for entire project
```

**Key Points:**

- Dependencies are **hoisted** to the root `node_modules` when possible
- Some packages may have their own `node_modules` for specific versions
- Scripts run from root delegate to the appropriate workspace package
- **Single `.gitignore`** covers all packages

## Dependencies Explanation

### Core Framework

- **next**: React framework for production
- **react**: React library
- **react-dom**: React DOM bindings

### AI Integration

- **ai**: Vercel AI SDK for chat functionality
- **@ai-sdk/openai**: OpenAI integration for AI SDK

### UI Components (shadcn/ui)

- **@radix-ui/\***: Headless UI components
- **lucide-react**: Icon library
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx**: Conditional className utility
- **tailwind-merge**: Tailwind class merging

### Form Handling

- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Schema validation

### Date Handling

- **date-fns**: Date utility library
- **react-day-picker**: Date picker component

### Development Tools

- **typescript**: TypeScript support
- **eslint**: Code linting
- **autoprefixer**: CSS vendor prefixing
- **postcss**: CSS processing

## Avoiding pnpm

This project is configured to work exclusively with npm:

1. **No pnpm-lock.yaml**: Only package-lock.json is used
2. **Engine restrictions**: package.json specifies npm as the required package manager
3. **NPM-specific scripts**: All scripts use npm conventions
4. **Compatible versions**: All dependencies use npm-compatible version ranges

## Common NPM Issues and Solutions

### Issue: "Cannot resolve dependency"

**Solution**:
```bash
npm install --legacy-peer-deps
```

### Issue: "ERESOLVE unable to resolve dependency tree"

**Solution**:
```bash
npm install --force

# or

npm install --legacy-peer-deps
```

### Issue: "Module not found"

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Permission errors (macOS/Linux)

**Solution**:
```bash
sudo chown -R $(whoami) ~/.npm
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

Ensure the platform supports:

- Node.js 18+
- NPM build process
- Environment variables for API keys

## Support

If you encounter any npm-specific issues:

1. Check Node.js and npm versions
2. Clear npm cache
3. Delete node_modules and reinstall
4. Use --legacy-peer-deps flag if needed
5. Check .npmrc configuration
