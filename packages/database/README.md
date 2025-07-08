# Database Package

This package contains Supabase database migrations, schemas, and documentation for TravelAgentic.

## Overview

The database package manages:
- Database schema definitions
- Migration files
- Seed data for development
- Database utilities and helpers
- RLS (Row Level Security) policies

## Directory Structure

```
packages/database/
├── migrations/     → SQL migration files
├── schemas/        → Database schema definitions
├── seeds/          → Development seed data
├── policies/       → RLS policies
├── functions/      → Database functions
├── types/          → TypeScript type definitions
└── README.md       → This file
```

## Schema Overview

### Core Tables

#### Users and Authentication
```sql
-- Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  budget_min INTEGER,
  budget_max INTEGER,
  preferred_destinations TEXT[],
  travel_style TEXT, -- 'luxury', 'budget', 'adventure', 'relaxation'
  automation_level INTEGER DEFAULT 5, -- 0-10 scale
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Bookings and Itineraries
```sql
-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  booking_type TEXT NOT NULL, -- 'flight', 'hotel', 'activity'
  external_booking_id TEXT,
  provider TEXT NOT NULL, -- 'amadeus', 'booking.com', etc.
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
  booking_data JSONB NOT NULL,
  total_price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Itineraries
CREATE TABLE public.itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'draft', -- 'draft', 'confirmed', 'completed'
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Itinerary bookings (junction table)
CREATE TABLE public.itinerary_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES itineraries(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(itinerary_id, booking_id)
);
```

#### Search and Caching
```sql
-- Search cache for performance
CREATE TABLE public.search_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_type TEXT NOT NULL, -- 'flights', 'hotels', 'activities'
  search_params_hash TEXT NOT NULL,
  search_params JSONB NOT NULL,
  results JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(search_type, search_params_hash)
);

-- Search history
CREATE TABLE public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  search_type TEXT NOT NULL,
  search_params JSONB NOT NULL,
  results_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Voice Calls and Automation
```sql
-- Voice call logs
CREATE TABLE public.voice_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  call_sid TEXT UNIQUE,
  status TEXT DEFAULT 'initiated', -- 'initiated', 'in-progress', 'completed', 'failed'
  purpose TEXT NOT NULL, -- 'booking', 'modification', 'cancellation'
  transcript TEXT,
  duration_seconds INTEGER,
  cost_usd DECIMAL(10,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature flags
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name TEXT UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES users(id), -- NULL for global flags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Row Level Security (RLS)

### Users Table
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only view/edit their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### Bookings Table
```sql
-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users can only access their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);
```

## Database Functions

### Update Timestamp Function
```sql
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at column
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Search Cache Cleanup
```sql
-- Function to clean expired search cache
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM search_cache WHERE expires_at < NOW();
END;
$$ language 'plpgsql';

-- Schedule cleanup (run daily)
SELECT cron.schedule('cleanup-cache', '0 0 * * *', 'SELECT cleanup_expired_cache();');
```

## Setup

### Local Development

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase project
supabase init

# Start local Supabase
supabase start

# Apply migrations
supabase db push

# Reset database (if needed)
supabase db reset
```

### Production Deployment

```bash
# Link to production project
supabase link --project-ref your-project-ref

# Deploy migrations
supabase db push

# Deploy functions
supabase functions deploy
```

## Migrations

### Creating New Migrations

```bash
# Create new migration
supabase migration new add_user_preferences

# Edit the migration file
# migrations/YYYYMMDDHHMMSS_add_user_preferences.sql
```

### Migration Best Practices

1. **Always use transactions** for complex migrations
2. **Add indexes** for performance-critical queries
3. **Include rollback instructions** in comments
4. **Test migrations** on staging before production
5. **Keep migrations atomic** and focused

### Example Migration

```sql
-- Migration: Add user preferences table
-- Up

BEGIN;

CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  budget_min INTEGER,
  budget_max INTEGER,
  preferred_destinations TEXT[],
  travel_style TEXT CHECK (travel_style IN ('luxury', 'budget', 'adventure', 'relaxation')),
  automation_level INTEGER DEFAULT 5 CHECK (automation_level >= 0 AND automation_level <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_travel_style ON user_preferences(travel_style);

COMMIT;

-- Down (rollback instructions)
-- DROP TABLE IF EXISTS user_preferences;
```

## Seed Data

### Development Seeds

```sql
-- seeds/dev_users.sql
INSERT INTO users (id, email, full_name) VALUES
  ('01234567-89ab-cdef-0123-456789abcdef', 'test@example.com', 'Test User'),
  ('11234567-89ab-cdef-0123-456789abcdef', 'admin@example.com', 'Admin User');

-- seeds/dev_preferences.sql
INSERT INTO user_preferences (user_id, budget_min, budget_max, travel_style, automation_level) VALUES
  ('01234567-89ab-cdef-0123-456789abcdef', 1000, 5000, 'adventure', 7),
  ('11234567-89ab-cdef-0123-456789abcdef', 500, 2000, 'budget', 5);
```

### Loading Seeds

```bash
# Load all seed files
supabase db seed

# Load specific seed file
psql -h localhost -p 5432 -U postgres -d postgres -f seeds/dev_users.sql
```

## Database Utilities

### TypeScript Types

```typescript
// types/database.ts
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // ... other tables
    }
  }
}
```

### Query Helpers

```typescript
// helpers/bookings.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

type BookingRow = Database['public']['Tables']['bookings']['Row']

export const getBookingsByUser = async (userId: string): Promise<BookingRow[]> => {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
```

## Performance Considerations

### Indexing Strategy

```sql
-- Performance indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_search_cache_type_hash ON search_cache(search_type, search_params_hash);
CREATE INDEX idx_search_cache_expires_at ON search_cache(expires_at);
```

### Query Optimization

1. **Use appropriate indexes** for frequent queries
2. **Implement pagination** for large result sets
3. **Cache frequently accessed data** in search_cache table
4. **Use database functions** for complex operations
5. **Monitor query performance** with Supabase Dashboard

## Monitoring and Maintenance

### Database Health Checks

```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Backup Strategy

```bash
# Automated backups are handled by Supabase
# Manual backup for local development
supabase db dump -f backup.sql

# Restore from backup
supabase db reset
psql -h localhost -p 5432 -U postgres -d postgres -f backup.sql
```

## Contributing

### Database Changes

1. **Create migration files** for all schema changes
2. **Update TypeScript types** after schema changes
3. **Add appropriate indexes** for new queries
4. **Test migrations** locally before committing
5. **Document breaking changes** in migration comments

### Code Review Checklist

- [ ] Migration includes both up and down instructions
- [ ] RLS policies are properly configured
- [ ] Indexes are added for performance
- [ ] TypeScript types are updated
- [ ] Seed data is provided for testing
- [ ] Documentation is updated 