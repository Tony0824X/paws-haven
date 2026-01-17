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

/**
 * Get all pets (admin view - including adopted/pending)
 */
export async function getAllPetsAdmin(): Promise<Pet[]> {
    if (!isSupabaseConfigured() || !supabase) {
        return [];
    }

    const { data, error } = await supabase
        .from('pets')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching all pets for admin:', error);
        return [];
    }

    return (data || []).map(dbPetToPet);
}

/**
 * Create a new pet
 */
export async function createPet(pet: Omit<Pet, 'id'>): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!isSupabaseConfigured() || !supabase) {
        return { success: false, error: 'Supabase not configured' };
    }

    const dbPet: Partial<DbPet> = {
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        age: pet.age,
        gender: pet.gender,
        weight: pet.weight,
        location: pet.location,
        description: pet.description,
        images: pet.images,
        health_status: pet.healthStatus,
        traits: pet.traits,
        is_featured: pet.isFeatured || false,
        is_new: pet.isNew || false,
        status: (pet.status || 'available') as any,
    };

    const { data, error } = await supabase
        .from('pets')
        .insert(dbPet)
        .select('id')
        .single();

    if (error) {
        console.error('Error creating pet:', error);
        return { success: false, error: error.message };
    }

    return { success: true, id: data.id };
}

/**
 * Update an existing pet
 */
export async function updatePet(id: string, updates: Partial<Pet>): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured() || !supabase) {
        return { success: false, error: 'Supabase not configured' };
    }

    const dbUpdates: Partial<DbPet> = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.type) dbUpdates.type = updates.type;
    if (updates.breed) dbUpdates.breed = updates.breed;
    if (updates.age) dbUpdates.age = updates.age;
    if (updates.gender) dbUpdates.gender = updates.gender;
    if (updates.weight) dbUpdates.weight = updates.weight;
    if (updates.location) dbUpdates.location = updates.location;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.images) dbUpdates.images = updates.images;
    if (updates.healthStatus) dbUpdates.health_status = updates.healthStatus;
    if (updates.traits) dbUpdates.traits = updates.traits;
    if (updates.isFeatured !== undefined) dbUpdates.is_featured = updates.isFeatured;
    if (updates.isNew !== undefined) dbUpdates.is_new = updates.isNew;
    if (updates.status) dbUpdates.status = updates.status as any;

    const { error } = await supabase
        .from('pets')
        .update(dbUpdates)
        .eq('id', id);

    if (error) {
        console.error('Error updating pet:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * Delete a pet
 */
export async function deletePet(id: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) {
        return false;
    }

    const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting pet:', error);
        return false;
    }

    return true;
}
