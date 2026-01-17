import { isSupabaseConfigured, getSupabase } from './supabase';

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    avatarUrl: string;
}

// Default avatar URL for users without avatar
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=f97316&color=fff&size=200';

/**
 * Check if user is logged in
 */
export async function isAuthenticated(): Promise<boolean> {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) return false;

    const { data: { session } } = await client.auth.getSession();
    return !!session;
}

/**
 * Get current authenticated user
 */
export async function getCurrentAuthUser(): Promise<AuthUser | null> {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) return null;

    const { data: { session } } = await client.auth.getSession();
    if (!session?.user) return null;

    const userName = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';

    return {
        id: session.user.id,
        email: session.user.email || '',
        name: userName,
        avatarUrl: session.user.user_metadata?.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=f97316&color=fff&size=200`,
    };
}

/**
 * Get current user ID from Supabase session
 */
export async function getCurrentUserId(): Promise<string | null> {
    const client = getSupabase();
    if (!client) return null;

    const { data: { session } } = await client.auth.getSession();
    return session?.user?.id || null;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
        return { success: false, error: 'Supabase 尚未配置' };
    }

    const { error } = await client.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
        return { success: false, error: 'Supabase 尚未配置' };
    }

    const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: name,
                avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f97316&color=fff&size=200`,
            },
        },
    });

    if (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
    }

    // Check if email confirmation is required
    if (data?.user && !data.session) {
        return { success: true, error: '請檢查您的電子郵件以確認帳號' };
    }

    return { success: true };
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
    const client = getSupabase();
    if (client) {
        await client.auth.signOut();
    }
}

/**
 * Guest/demo login using Supabase anonymous authentication
 */
export async function demoLogin(): Promise<{ success: boolean; error?: string }> {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
        return { success: false, error: 'Supabase 尚未配置' };
    }

    // Use Supabase anonymous sign-in
    const { data, error } = await client.auth.signInAnonymously();

    if (error) {
        console.error('Anonymous sign in error:', error);
        return { success: false, error: error.message };
    }

    if (data.user) {
        console.log('Anonymous user signed in:', data.user.id);
    }

    return { success: true };
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
        callback(null);
        return () => { };
    }

    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
            const userName = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';
            callback({
                id: session.user.id,
                email: session.user.email || '',
                name: userName,
                avatarUrl: session.user.user_metadata?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=f97316&color=fff&size=200`,
            });
        } else {
            callback(null);
        }
    });

    return () => subscription.unsubscribe();
}
