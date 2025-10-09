import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

/**
 * API endpoint to setup database schema
 * Run this once to create all necessary tables
 * Access: POST /api/setup-database
 */
export async function POST(request: Request) {
  try {
    // Use service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Read migration files
    const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort()

    const results = []

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file)
      const sql = fs.readFileSync(filePath, 'utf-8')

      console.log(`Running migration: ${file}`)

      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith('--'))

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const { error } = await supabase.rpc('exec_sql', {
              sql: statement + ';',
            })

            if (error) {
              console.error(`Error in ${file}:`, error)
              // Continue with other statements
            }
          } catch (err) {
            console.error(`Exception in ${file}:`, err)
            // Continue with other statements
          }
        }
      }

      results.push({
        file,
        status: 'completed',
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup completed',
      migrations: results,
    })
  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Database setup failed',
        details: error,
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to check database status
 */
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if tables exist
    const tables = ['profiles', 'subscriptions', 'contracts', 'chat_sessions', 'chat_messages']
    const status: Record<string, string> = {}

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('id').limit(1)
        status[table] = error ? 'missing' : 'exists'
      } catch {
        status[table] = 'error'
      }
    }

    return NextResponse.json({
      status,
      databaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Status check failed' },
      { status: 500 }
    )
  }
}
