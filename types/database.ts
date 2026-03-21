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
      user_memory: {
        Row: {
          id: string
          user_id: string
          name: string | null
          role: string | null
          active_projects: Json | null
          goals: string | null
          preferences: Json | null
          recent_context: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          role?: string | null
          active_projects?: Json | null
          goals?: string | null
          preferences?: Json | null
          recent_context?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          role?: string | null
          active_projects?: Json | null
          goals?: string | null
          preferences?: Json | null
          recent_context?: string | null
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          title: string
          description: string | null
          status: 'todo' | 'in-progress' | 'done'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          due_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          title: string
          description?: string | null
          status?: 'todo' | 'in-progress' | 'done'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          title?: string
          description?: string | null
          status?: 'todo' | 'in-progress' | 'done'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          created_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string | null
          tags: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content?: string | null
          tags?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string | null
          tags?: string[] | null
          created_at?: string
        }
      }
    }
  }
}
