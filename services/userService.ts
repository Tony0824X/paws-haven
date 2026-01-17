import { getSupabase, DbUser, isSupabaseConfigured } from './supabase';
import { getCurrentUserId } from './authService';
import { User as UserType } from '../types';

export interface User extends UserType { }

export interface UserStats {
    favoritesCount: number;
    pendingApplicationsCount: number;
    adoptedCount: number;
}

export interface AdminStats {
    totalPets: number;
    totalApplications: number;
    pendingApplications: number;
    adoptedPets: number;
    totalUsers: number;
}

// Convert database user to frontend User type
function dbUserToUser(dbUser: DbUser): User {
    return {
        id: dbUser.id,
        email: dbUser.email || '',
        name: dbUser.name,
        avatarUrl: dbUser.avatar_url,
        badge: dbUser.badge,
        role: (dbUser as any).role || 'user',
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

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching user:', error);
        return null;
    }

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
 * Get user statistics
 */
export async function getUserStats(): Promise<UserStats> {
    const supabase = getSupabase();

    if (!isSupabaseConfigured() || !supabase) {
        return { favoritesCount: 0, pendingApplicationsCount: 0, adoptedCount: 0 };
    }

    const userId = await getCurrentUserId();
    if (!userId) return { favoritesCount: 0, pendingApplicationsCount: 0, adoptedCount: 0 };

    const [
        { count: favoritesCount },
        { count: pendingCount },
        { count: adoptedCount }
    ] = await Promise.all([
        supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', '審核中'),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', '已通過')
    ]);

    return {
        favoritesCount: favoritesCount || 0,
        pendingApplicationsCount: pendingCount || 0,
        adoptedCount: adoptedCount || 0,
    };
}

/**
 * Get Admin dashboard statistics
 */
export async function getAdminStats(): Promise<AdminStats> {
    const supabase = getSupabase();

    if (!isSupabaseConfigured() || !supabase) {
        return { totalPets: 0, totalApplications: 0, pendingApplications: 0, adoptedPets: 0, totalUsers: 0 };
    }

    const [
        { count: totalPets },
        { count: totalApps },
        { count: pendingApps },
        { count: adoptedPets },
        { count: totalUsers }
    ] = await Promise.all([
        supabase.from('pets').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', '審核中'),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', '已通過'),
        supabase.from('users').select('*', { count: 'exact', head: true })
    ]);

    return {
        totalPets: totalPets || 0,
        totalApplications: totalApps || 0,
        pendingApplications: pendingApps || 0,
        adoptedPets: adoptedPets || 0,
        totalUsers: totalUsers || 0,
    };
}
