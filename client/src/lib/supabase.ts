import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dzhprgxsvtekeqmpjmbb.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6aHByZ3hzdnRla2VxbXBqbWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MjI0MDUsImV4cCI6MjA2NzA5ODQwNX0.6Q6Ran3Ai7RRPRxfBJRWMIAo_HPZ8zBD97TQoQWBv-U'

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase configuration missing')
  console.log('URL:', supabaseUrl)
  console.log('Key exists:', !!supabaseKey)
} else {
  console.log('✅ Supabase configuration loaded')
  console.log('URL:', supabaseUrl)
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

export interface Database {
  public: {
    Tables: {
      hospitals: {
        Row: {
          id: string
          name: string
          address: string
          phone: string
          specialty: string[]
          opening_hours: string
          latitude: number
          longitude: number
          rating: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          phone: string
          specialty: string[]
          opening_hours: string
          latitude: number
          longitude: number
          rating?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          phone?: string
          specialty?: string[]
          opening_hours?: string
          latitude?: number
          longitude?: number
          rating?: number
          created_at?: string
        }
      }
    }
  }
}