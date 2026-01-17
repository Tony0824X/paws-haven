import { getSupabase, isSupabaseConfigured } from './supabase';
import { getCurrentUserId } from './authService';
import { Pet } from '../types';
import { getPetsByIds } from './petService';

/**
 * Get user's favorite pet IDs
 */
export async function getFavoriteIds(): Promise<string[]> {
    const supabase = getSupabase();

    if (!isSupabaseConfigured() || !supabase) {
        return [];
    }

    const userId = await getCurrentUserId();
    if (!userId) {
        console.log('No authenticated user for getFavoriteIds');
        return [];
    }

    const { data, error } = await supabase
        .from('favorites')
        .select('pet_id')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching favorites:', error);
        return [];
    }

    return (data || []).map(f => f.pet_id);
}

/**
 * Get user's favorite pets with full details
 */
export async function getFavoritePets(): Promise<Pet[]> {
    const favoriteIds = await getFavoriteIds();
    if (favoriteIds.length === 0) return [];

    return getPetsByIds(favoriteIds);
}

/**
 * Add a pet to favorites
 */
export async function addFavorite(petId: string): Promise<boolean> {
    const supabase = getSupabase();

    if (!isSupabaseConfigured() || !supabase) {
        return false;
    }

    const userId = await getCurrentUserId();
    if (!userId) {
        console.error('No authenticated user for addFavorite');
        return false;
    }

    const { error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, pet_id: petId });

    if (error) {
        // If it's a duplicate, that's fine
        if (error.code === '23505') {
            return true;
        }
        console.error('Error adding favorite:', error);
        return false;
    }

    return true;
}

/**
 * Remove a pet from favorites
 */
export async function removeFavorite(petId: string): Promise<boolean> {
    const supabase = getSupabase();

    if (!isSupabaseConfigured() || !supabase) {
        return false;
    }

    const userId = await getCurrentUserId();
    if (!userId) {
        return false;
    }

    const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('pet_id', petId);

    if (error) {
        console.error('Error removing favorite:', error);
        return false;
    }

    return true;
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(petId: string): Promise<{ isFavorite: boolean }> {
    const supabase = getSupabase();

    if (!isSupabaseConfigured() || !supabase) {
        return { isFavorite: false };
    }

    const userId = await getCurrentUserId();
    if (!userId) {
        console.error('No authenticated user for toggleFavorite');
        return { isFavorite: false };
    }

    // Check if already favorited
    const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('pet_id', petId)
        .maybeSingle();

    if (data) {
        // Already favorited, so remove
        await removeFavorite(petId);
        return { isFavorite: false };
    } else {
        // Not favorited, so add
        await addFavorite(petId);
        return { isFavorite: true };
    }
}

/**
 * Check if a pet is favorited
 */
export async function isFavorite(petId: string): Promise<boolean> {
    const supabase = getSupabase();

    if (!isSupabaseConfigured() || !supabase) {
        return false;
    }

    const userId = await getCurrentUserId();
    if (!userId) {
        return false;
    }

    const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('pet_id', petId)
        .maybeSingle();

    if (error || !data) {
        return false;
    }

    return true;
}
