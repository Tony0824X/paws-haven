import { createClient, SupabaseClient } from '@supabase/supabase-js';

// @ts-ignore - Vite specific import.meta.env
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
// @ts-ignore - Vite specific import.meta.env
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Debug log
console.log('Supabase URL:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT SET');
console.log('Supabase Key:', supabaseAnonKey ? 'SET (length: ' + supabaseAnonKey.length + ')' : 'NOT SET');

// Check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
    const configured = !!(
        supabaseUrl &&
        supabaseAnonKey &&
        supabaseUrl.includes('supabase')
    );
    console.log('Supabase configured:', configured);
    return configured;
};

// Create a lazy-loaded Supabase client
let _supabase: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
    if (!isSupabaseConfigured()) {
        return null;
    }

    if (!_supabase) {
        _supabase = createClient(supabaseUrl, supabaseAnonKey);
    }

    return _supabase;
};

// For backward compatibility - returns null if not configured
export const supabase = isSupabaseConfigured()
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Demo user ID for testing without authentication
export const DEMO_USER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567000';

// Type definitions for database tables
export interface DbPet {
    id: string;
    name: string;
    type: 'dog' | 'cat' | 'rabbit' | 'bird';
    breed: string;
    age: string;
    gender: '公' | '母' | '未知';
    weight: string;
    location: string;
    description: string[];
    images: string[];
    health_status: string[];
    traits: string[];
    is_featured: boolean;
    is_new: boolean;
    status: 'available' | 'pending' | 'adopted';
    created_at: string;
    updated_at: string;
}

export interface DbUser {
    id: string;
    email: string;
    name: string;
    avatar_url: string;
    badge: string;
    role: 'user' | 'admin';
    created_at: string;
    updated_at: string;
}

export interface DbFavorite {
    id: string;
    user_id: string;
    pet_id: string;
    created_at: string;
}

export interface DbApplication {
    id: string;
    user_id: string;
    pet_id: string;
    status: '審核中' | '已通過' | '未通過' | '已取消';
    form_data: Record<string, unknown>;
    reviewer_notes?: string;
    reviewed_at?: string;
    reviewed_by?: string;
    created_at: string;
    updated_at: string;
}

export interface DbChatSession {
    id: string;
    user_id: string;
    pet_id: string;
    volunteer_name: string;
    last_message_at: string;
    created_at: string;
}

export interface DbMessage {
    id: string;
    session_id: string;
    sender: 'user' | 'volunteer';
    text: string;
    image_url?: string;
    created_at: string;
}
