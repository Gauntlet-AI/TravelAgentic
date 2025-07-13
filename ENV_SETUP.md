# 🔧 Environment Configuration Guide

## 📁 **Single Source of Truth**

All environment variables are consolidated in the **root `.env` file** for maximum simplicity.

```
TravelAgentic/
├── .env                    # ← ALL CONFIG HERE
├── .env.example           # ← Template for new developers
└── docker-compose.yml     # ← Reads from root .env
```

## 🚀 **Quick Setup**

### **1. Initial Setup**
```bash
# Copy template and fill in your values
cp .env.example .env
# Edit .env with your API keys
```

### **2. Start with Docker**
```bash
# Docker automatically reads root .env
docker-compose up --build
```

### **3. Local Development** 
```bash
# All services use root .env
npm run dev                               # Web on :3000
cd packages/langgraph && python main.py  # LangGraph on :8000
```

## 🧹 **Migration from Scattered .env Files**

If you have **old scattered `.env` files** from previous setup, use this cleanup script:

### **Cleanup Script**
```bash
#!/bin/bash
# cleanup-env-files.sh - Remove scattered .env files

echo "🧹 TravelAgentic Environment Cleanup"
echo "===================================="

# Files to check and remove
OLD_ENV_FILES=(
    "packages/web/.env.local"
    "packages/web/.env"
    "packages/langgraph/.env"
    "packages/langgraph/.env.example"
)

echo "Checking for old environment files..."
echo ""

FOUND_FILES=()

# Check which files exist
for file in "${OLD_ENV_FILES[@]}"; do
    if [ -f "$file" ]; then
        FOUND_FILES+=("$file")
        echo "📁 Found: $file"
    fi
done

if [ ${#FOUND_FILES[@]} -eq 0 ]; then
    echo "✅ No old .env files found - you're already using consolidated setup!"
    exit 0
fi

echo ""
echo "⚠️  These files can cause configuration conflicts with the new consolidated setup."
echo "   The root .env file is now the single source of truth."
echo ""

# Ask for confirmation
read -p "🗑️  Remove these files? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Removing old environment files..."
    
    for file in "${FOUND_FILES[@]}"; do
        if rm "$file" 2>/dev/null; then
            echo "✅ Removed: $file"
        else
            echo "❌ Failed to remove: $file"
        fi
    done
    
    echo ""
    echo "🎉 Cleanup complete!"
    echo "   All configuration is now in the root .env file"
    echo "   Run 'docker-compose up --build' to start with clean config"
else
    echo ""
    echo "❌ Cleanup cancelled"
    echo "   Note: Old .env files may override root .env values"
    echo "   This can cause configuration inconsistencies"
fi
```

### **Run the Cleanup**
```bash
# Make script executable and run
chmod +x cleanup-env-files.sh
./cleanup-env-files.sh
```

### **Or Manual Cleanup**
```bash
# Remove old .env files manually
rm -f packages/web/.env.local
rm -f packages/web/.env  
rm -f packages/langgraph/.env
rm -f packages/langgraph/.env.example

echo "✅ Old .env files removed!"
```

## 📋 **Environment Variables Overview**

### **🔑 Required (Core)**
- `OPENAI_API_KEY` - AI chat and travel planning
- `SUPABASE_*` - Database and authentication
- `AMADEUS_*` - Travel API integration

### **🎛️ Service Configuration**
- `USE_MOCK_APIS=true` - Development mode
- `LANGGRAPH_URL` - AI service connection
- `NODE_ENV` - Environment setting

### **🌐 Optional APIs**
- `STRIPE_*` - Payment processing
- `TWILIO_*` - Voice calling
- `TEQUILA_*` - Additional travel APIs

## 🐳 **Docker vs Local**

### **Docker** (Recommended)
- ✅ Uses root `.env` automatically
- ✅ Service names: `langgraph:8000`, `web:3000`
- ✅ No additional configuration needed

### **Local Development**
- ✅ Uses root `.env` automatically
- ✅ Localhost URLs: `localhost:8000`, `localhost:3000`
- ✅ Same configuration file

## 🔄 **Simplified Configuration**

### **What's Included** ✅
- OpenAI integration (primary AI)
- Core travel APIs (Amadeus)
- Database & authentication (Supabase)
- Service networking
- Development settings

### **What's Removed** 🗑️
- Feature flags (simplified deployment)
- Phase management (no longer needed)
- Anthropic support (OpenAI only)
- A/B testing configuration
- Legacy feature toggles

## 🎯 **Best Practices**

1. **Never commit `.env`** - Contains secrets
2. **Update `.env.example`** - Keep template current
3. **Use Docker for development** - Most consistent
4. **Root `.env` for everything** - Single source of truth
5. **Run cleanup script** - Remove conflicting `.env` files

## 🚨 **Security Notes**

- All sensitive data is in root `.env` (gitignored)
- Public variables use `NEXT_PUBLIC_` prefix
- Docker Compose passes variables to containers securely
- Never hardcode secrets in docker-compose.yml

## ⚡ **Minimum Required Variables**

```bash
# Essential for basic functionality
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
AMADEUS_CLIENT_ID=your_amadeus_id
AMADEUS_CLIENT_SECRET=your_amadeus_secret
```

## 🔍 **Troubleshooting**

### **Configuration Issues**
```bash
# Check which .env files exist
find . -name ".env*" -type f

# Should only show:
# ./.env
# ./.env.example
```

### **Docker Environment**
```bash
# Verify Docker Compose reads root .env
docker-compose config | grep OPENAI_API_KEY
```

---

*Clean, simple, focused configuration - just what you need!* 🎉 