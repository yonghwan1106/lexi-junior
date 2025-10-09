import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * API endpoint to setup RAG system
 * This creates the necessary tables and extensions for vector search
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Enable pgvector extension
    const { error: extensionError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE EXTENSION IF NOT EXISTS vector;',
    })

    if (extensionError) {
      console.error('Extension error:', extensionError)
      // Continue even if extension already exists
    }

    // Create legal_documents table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS legal_documents (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        source_url TEXT,
        document_type TEXT,
        category TEXT,
        embedding vector(1536),
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS legal_documents_embedding_idx
      ON legal_documents USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100);

      CREATE INDEX IF NOT EXISTS legal_documents_category_idx
      ON legal_documents(category);

      CREATE INDEX IF NOT EXISTS legal_documents_type_idx
      ON legal_documents(document_type);
    `

    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: createTableSQL,
    })

    if (tableError) {
      console.error('Table creation error:', tableError)
      return NextResponse.json(
        { error: 'Failed to create tables', details: tableError },
        { status: 500 }
      )
    }

    // Create similarity search function
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION match_legal_documents(
        query_embedding vector(1536),
        match_threshold float DEFAULT 0.7,
        match_count int DEFAULT 5,
        filter_category text DEFAULT NULL
      )
      RETURNS TABLE (
        id uuid,
        title text,
        content text,
        source_url text,
        document_type text,
        category text,
        similarity float
      )
      LANGUAGE plpgsql
      AS $$
      BEGIN
        RETURN QUERY
        SELECT
          legal_documents.id,
          legal_documents.title,
          legal_documents.content,
          legal_documents.source_url,
          legal_documents.document_type,
          legal_documents.category,
          1 - (legal_documents.embedding <=> query_embedding) as similarity
        FROM legal_documents
        WHERE
          (filter_category IS NULL OR legal_documents.category = filter_category)
          AND 1 - (legal_documents.embedding <=> query_embedding) > match_threshold
        ORDER BY legal_documents.embedding <=> query_embedding
        LIMIT match_count;
      END;
      $$;
    `

    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: createFunctionSQL,
    })

    if (functionError) {
      console.error('Function creation error:', functionError)
      return NextResponse.json(
        { error: 'Failed to create function', details: functionError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'RAG system setup completed',
    })
  } catch (error) {
    console.error('RAG setup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'RAG setup failed' },
      { status: 500 }
    )
  }
}
