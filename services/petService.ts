import { supabase, DbPet, isSupabaseConfigured } from './supabase';
import { Pet } from '../types';

// Convert database pet to frontend Pet type
function dbPetToPet(dbPet: DbPet): Pet {
    return {
        id: dbPet.id,
        name: dbPet.name,
        type: dbPet.type,
        breed: dbPet.breed,
        age: dbPet.age,
        gender: dbPet.gender,
        weight: dbPet.weight,
        location: dbPet.location,
        description: dbPet.description || [],
        images: dbPet.images || [],
        healthStatus: dbPet.health_status || [],
        traits: dbPet.traits || [],
        isFeatured: dbPet.is_featured,
        isNew: dbPet.is_new,
        status: dbPet.status,
    };
}

/**
 * Get all available pets
 */
export async function getPets(): Promise<Pet[]> {
    if (!isSupabaseConfigured() || !supabase) {
        console.log('Supabase not configured, returning empty array');
        return [];
    }

    const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching pets:', error);
        return [];
    }

    return (data || []).map(dbPetToPet);
}

/**
 * Get a single pet by ID
 */
export async function getPetById(id: string): Promise<Pet | null> {
    if (!isSupabaseConfigured() || !supabase) {
        return null;
    }

    const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching pet:', error);
        return null;
    }

    return data ? dbPetToPet(data) : null;
}

/**
 * Get pets by type (dog, cat, rabbit, bird)
 */
export async function getPetsByType(type: 'dog' | 'cat' | 'rabbit' | 'bird'): Promise<Pet[]> {
    if (!isSupabaseConfigured() || !supabase) {
        return [];
    }

    const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('type', type)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching pets by type:', error);
        return [];
    }

    return (data || []).map(dbPetToPet);
}

/**
 * Search pets by name or breed
 */
export async function searchPets(query: string): Promise<Pet[]> {
    if (!isSupabaseConfigured() || !supabase) {
        return [];
    }

    const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('status', 'available')
        .or(`name.ilike.%${query}%,breed.ilike.%${query}%`)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error searching pets:', error);
        return [];
    }

    return (data || []).map(dbPetToPet);
}

/**
 * Get featured pets
 */
export async function getFeaturedPets(): Promise<Pet[]> {
    if (!isSupabaseConfigured() || !supabase) {
        return [];
    }

    const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('is_featured', true)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching featured pets:', error);
        return [];
    }

    return (data || []).map(dbPetToPet);
}

/**
 * Get new pets
 */
export async function getNewPets(): Promise<Pet[]> {
    if (!isSupabaseConfigured() || !supabase) {
        return [];
    }

    const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('is_new', true)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching new pets:', error);
        return [];
    }

    return (data || []).map(dbPetToPet);
}

/**
 * Get pets by IDs
 */
export async function getPetsByIds(ids: string[]): Promise<Pet[]> {
    if (ids.length === 0) return [];

    if (!isSupabaseConfigured() || !supabase) {
        return [];
    }

    const { data, error } = await supabase
        .from('pets')
        .select('*')
        .in('id', ids);

    if (error) {
        console.error('Error fetching pets by IDs:', error);
        return [];
    }

    return (data || []).map(dbPetToPet);
}
