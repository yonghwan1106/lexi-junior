# Database Setup Instructions

The lexi-junior application requires several database tables to function properly. Follow these steps to set up your Supabase database.

## Quick Setup (Recommended)

### Option 1: Using Supabase SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/hzmeplltczukavqhtxvx
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `supabase/migrations/20250609000000_initial_schema.sql`
5. Click "Run" to execute the migration
6. Repeat for `supabase/migrations/20250610000000_setup_pgvector_rag.sql`

### Option 2: Using Supabase CLI

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
npx supabase login

# Link your project
npx supabase link --project-ref hzmeplltczukavqhtxvx

# Push migrations
npx supabase db push
```

## What Gets Created

### Tables

1. **profiles** - User profile information
   - id (UUID, references auth.users)
   - email (TEXT)
   - full_name (TEXT)
   - avatar_url (TEXT)
   - created_at, updated_at (TIMESTAMP)

2. **subscriptions** - User subscription plans
   - id (UUID)
   - user_id (UUID, references auth.users)
   - plan_type (TEXT: 'free', 'plus', 'pro')
   - status (TEXT: 'active', 'cancelled', 'expired')
   - current_period_end (TIMESTAMP)
   - created_at, updated_at (TIMESTAMP)

3. **contracts** - Uploaded contracts and analysis
   - id (UUID)
   - user_id (UUID, references auth.users)
   - title (TEXT)
   - contract_type (TEXT: 'employment', 'lease', 'freelance', 'other')
   - risk_level (TEXT: 'safe', 'caution', 'danger')
   - original_file_path (TEXT)
   - analysis_result (JSONB)
   - created_at, updated_at (TIMESTAMP)

4. **chat_sessions** - Chat conversation sessions
   - id (UUID)
   - user_id (UUID, references auth.users)
   - title (TEXT)
   - created_at, updated_at (TIMESTAMP)

5. **chat_messages** - Individual chat messages
   - id (UUID)
   - session_id (UUID, references chat_sessions)
   - role (TEXT: 'user', 'assistant')
   - content (TEXT)
   - sources (JSONB)
   - created_at (TIMESTAMP)

6. **legal_documents** - RAG knowledge base
   - id (UUID)
   - title (TEXT)
   - content (TEXT)
   - source_url (TEXT)
   - document_type (TEXT)
   - category (TEXT)
   - embedding (VECTOR(1536))
   - metadata (JSONB)
   - created_at, updated_at (TIMESTAMP)

### Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Users can only view/edit their own data
- Chat messages are accessible through session ownership
- Service role can access all data (for admin operations)

### Triggers

- **on_auth_user_created**: Automatically creates profile and free subscription when user signs up
- **update_updated_at**: Automatically updates the updated_at timestamp on record changes

### Functions

- **handle_new_user()**: Creates profile and subscription for new users
- **match_legal_documents()**: Performs vector similarity search for RAG

## Verification

After running the migrations, verify the setup:

1. Go to Supabase Dashboard → Table Editor
2. You should see all 6 tables listed
3. Go to SQL Editor and run:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';
```

You should see:
- profiles
- subscriptions
- contracts
- chat_sessions
- chat_messages
- legal_documents

## Troubleshooting

### "relation does not exist" errors

If you see errors like "relation 'profiles' does not exist":
1. Make sure you ran the migrations in order (20250609 before 20250610)
2. Check that you're running the SQL in the correct project
3. Verify you have the correct permissions (should be project owner or admin)

### RLS Policy Errors

If you get "permission denied" or "new row violates row-level security policy" errors:
1. Check that the RLS policies were created correctly
2. Verify that auth.uid() is working (user is authenticated)
3. Try temporarily disabling RLS to test: `ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;`

### Extension Errors (pgvector)

If you get "extension 'vector' does not exist":
1. Go to Database → Extensions in Supabase dashboard
2. Search for "vector"
3. Click "Enable" on the pgvector extension
4. Re-run the migration

## Manual Table Creation (If Migrations Fail)

If automated migrations don't work, you can create tables manually:

1. Go to Supabase Dashboard → Table Editor
2. Click "+ New table"
3. Use the schema definitions from the migration files
4. Don't forget to:
   - Enable RLS
   - Add policies
   - Create indexes
   - Set up foreign keys

## Need Help?

If you encounter issues:
1. Check Supabase logs in Dashboard → Logs
2. Check browser console for errors
3. Verify environment variables are set correctly
4. Ensure your Supabase project is not paused

## Next Steps

After database setup is complete:
1. Test user registration at /login
2. Verify profile page loads at /profile
3. Try uploading a contract at /upload
4. Test the chatbot at /chat
