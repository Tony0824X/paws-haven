import { getSupabase, DEMO_USER_ID, DbApplication, isSupabaseConfigured } from './supabase';
import { getCurrentUserId } from './authService';
import { Application } from '../types';

interface ApplicationFormData {
    name: string;
    phone: string;
    email: string;
    job: string;
    experience: string;
    environment: string;
    companionTime: string;
    reason: string;
    commitment: boolean;
    followup: boolean;
}

// Convert database application to frontend Application type
function dbApplicationToApplication(dbApp: DbApplication & { pets?: { name: string; breed: string } }): Application {
    return {
        id: dbApp.id,
        petName: dbApp.pets?.name || 'Unknown',
        petBreed: dbApp.pets?.breed || 'Unknown',
        status: dbApp.status,
    };
}

/**
 * Submit a new adoption application
 */
export async function submitApplication(
    petId: string,
    formData: ApplicationFormData
): Promise<{ success: boolean; id?: string; error?: string }> {
    const supabase = getSupabase();

    if (!isSupabaseConfigured() || !supabase) {
        // Return success even without Supabase for demo purposes
        console.log('Supabase not configured, simulating application submission');
        return { success: true, id: 'demo-' + Date.now() };
    }

    // Get the current user's ID from the session
    const userId = await getCurrentUserId();

    if (!userId) {
        console.error('No authenticated user found');
        return { success: false, error: '請先登入' };
    }

    console.log('Submitting application for user:', userId, 'pet:', petId);

    const { data, error } = await supabase
        .from('applications')
        .insert({
            user_id: userId,
            pet_id: petId,
            status: '審核中',
            form_data: formData,
        })
        .select('id')
        .single();

    if (error) {
        console.error('Error submitting application:', error);
        return { success: false, error: error.message };
    }

    console.log('Application submitted successfully:', data.id);
    return { success: true, id: data.id };
}

/**
 * Get all applications for the current user
 */
export async function getApplications(): Promise<Application[]> {
    const supabase = getSupabase();

    if (!isSupabaseConfigured() || !supabase) {
        return [];
    }

    const userId = await getCurrentUserId();

    if (!userId) {
        console.log('No authenticated user, returning empty applications');
        return [];
    }

    const { data, error } = await supabase
        .from('applications')
        .select(`
      *,
      pets (name, breed)
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching applications:', error);
        return [];
    }

    return (data || []).map(dbApplicationToApplication);
}

/**
 * Get a single application by ID
 */
export async function getApplicationById(id: string): Promise<(Application & { formData: ApplicationFormData }) | null> {
    const supabase = getSupabase();

    if (!isSupabaseConfigured() || !supabase) {
        return null;
    }

    const { data, error } = await supabase
        .from('applications')
        .select(`
      *,
      pets (name, breed)
    `)
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching application:', error);
        return null;
    }

    if (!data) return null;

    return {
        ...dbApplicationToApplication(data),
        formData: data.form_data as ApplicationFormData,
    };
}

/**
 * Check if user has an active application for a pet
 */
export async function hasActiveApplication(petId: string): Promise<boolean> {
    const supabase = getSupabase();

    if (!isSupabaseConfigured() || !supabase) {
        return false;
    }

    const userId = await getCurrentUserId();

    if (!userId) {
        return false;
    }

    const { data, error } = await supabase
        .from('applications')
        .select('id')
        .eq('user_id', userId)
        .eq('pet_id', petId)
        .in('status', ['審核中', '已通過'])
        .maybeSingle();

    if (error || !data) {
        return false;
    }

    return true;
}
