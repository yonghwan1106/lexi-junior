export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          nickname: string | null
          email: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nickname?: string | null
          email: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nickname?: string | null
          email?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_type: 'free' | 'plus' | 'pro'
          status: 'active' | 'cancelled' | 'expired'
          started_at: string
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_type: 'free' | 'plus' | 'pro'
          status: 'active' | 'cancelled' | 'expired'
          started_at?: string
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_type?: 'free' | 'plus' | 'pro'
          status?: 'active' | 'cancelled' | 'expired'
          started_at?: string
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contracts: {
        Row: {
          id: string
          user_id: string
          title: string | null
          contract_type: 'employment' | 'lease' | 'freelance' | 'other' | null
          original_file_path: string
          extracted_text: string | null
          risk_level: 'safe' | 'caution' | 'danger' | null
          analysis_result: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          contract_type?: 'employment' | 'lease' | 'freelance' | 'other' | null
          original_file_path: string
          extracted_text?: string | null
          risk_level?: 'safe' | 'caution' | 'danger' | null
          analysis_result?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          contract_type?: 'employment' | 'lease' | 'freelance' | 'other' | null
          original_file_path?: string
          extracted_text?: string | null
          risk_level?: 'safe' | 'caution' | 'danger' | null
          analysis_result?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      legal_knowledge: {
        Row: {
          id: string
          category: string
          title: string
          content: string
          source: string | null
          embedding: number[] | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category: string
          title: string
          content: string
          source?: string | null
          embedding?: number[] | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: string
          title?: string
          content?: string
          source?: string | null
          embedding?: number[] | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          contract_id: string | null
          title: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contract_id?: string | null
          title?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          contract_id?: string | null
          title?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          sources: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          sources?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          sources?: Json | null
          created_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type Contract = Database['public']['Tables']['contracts']['Row']
export type LegalKnowledge = Database['public']['Tables']['legal_knowledge']['Row']
export type ChatSession = Database['public']['Tables']['chat_sessions']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']

export interface AnalysisResult {
  contractType: string
  overallRisk: 'safe' | 'caution' | 'danger'
  summary: string
  clauses: {
    id: string
    originalText: string
    riskLevel: 'safe' | 'caution' | 'danger'
    explanation: string
    recommendation: string | null
    legalBasis: string | null
  }[]
}
