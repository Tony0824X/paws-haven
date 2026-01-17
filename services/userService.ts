import { getSupabase, DbUser, isSupabaseConfigured } from './supabase';
import { getCurrentUserId } from './authService';

export interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl: string;
    badge: string;
}

export interface UserStats {
    favoritesCount: number;
    pendingApplicationsCount: number;
    adoptedCount: number;
}

// Convert database user to frontend User type
function dbUserToUser(dbUser: DbUser): User {
    return {
        id: dbUser.id,
        email: dbUser.email || '',
        name: dbUser.name,
        avatarUrl: dbUser.avatar_url,
        badge: dbUser.badge,
    };
}

/**
 * Get current user profile from database
 */
export async function getCurrentUser(): Promise<User | null> {
    const supabase = getSupabase();

    if (!isSupabaseConfigured() || !supabase) {
        return null;
    }

    // Get the current user ID from the session
    const userId = await getCurrentUserId();

    if (!userId) {
        console.log('No authenticated user for getCurrentUser');
        return null;
    }

    console.log('Getting user profile for:', userId);

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching user:', error);
        return null;
    }

    console.log('User profile:', data);
    return data ? dbUserToUser(data) : null;
}

/**
 * Update user profile
 */
export async function updateProfile(
    updates: Partial<{ name: string; avatarUrl: string }>
): Promise<boolean> {
    const supabase = getSupabase();

    if (!isSupabaseConfigured() || !supabase) {
        return false;
    }

    const userId = await getCurrentUserId();

    if (!userId) {
        return false;
    }

    const dbUpdates: Partial<DbUser> = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.avatarUrl) dbUpdates.avatar_url = updates.avatarUrl;

    const { error } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', userId);

    if (error) {
        console.error('Error updating profile:', error);
        return false;
    }

    return true;
}

/**
 * Get user statistics (favorites count, pending applications, adopted count)
 */
export async function getUserStats(): Promise<UserStats> {
    const supabase = getSupabase();

    if (!isSupabaseConfigured() || !supabase) {
        return {
            favoritesCount: 0,
            pendingApplicationsCount: 0,
            adoptedCount: 0,
        };
    }

    const userId = await getCurrentUserId();

    if (!userId) {
        return {
            favoritesCount: 0,
            pendingApplicationsCount: 0,
            adoptedCount: 0,
        };
    }

    // Get favorites count
    const { count: favoritesCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    // Get pending applications count
    const { count: pendingCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', '審核中');

    // Get adopted count (approved applications)
    const { count: adoptedCount } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', '已通過');

    return {
        favoritesCount: favoritesCount || 0,
        pendingApplicationsCount: pendingCount || 0,
        adoptedCount: adoptedCount || 0,
    };
}
