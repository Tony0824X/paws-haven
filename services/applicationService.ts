import { getSupabase, DbApplication, isSupabaseConfigured } from './supabase';
import { getCurrentUserId } from './authService';
import { Application, ApplicationFormData } from '../types';

// Convert database application to frontend Application type
function dbApplicationToApplication(dbApp: DbApplication & { pets?: { name: string; breed: string } }): Application {
    return {
        id: dbApp.id,
        petName: dbApp.pets?.name || 'Unknown',
        petBreed: dbApp.pets?.breed || 'Unknown',
        status: dbApp.status as any,
        petId: dbApp.pet_id,
        userId: dbApp.user_id,
        createdAt: dbApp.created_at,
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
        console.log('Supabase not configured, simulating application submission');
        return { success: true, id: 'demo-' + Date.now() };
    }

    // Get the current user's ID from the session
    const userId = await getCurrentUserId();

    if (!userId) {
        console.error('No authenticated user found');
        return { success: false, error: '請先登入' };
    }

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

/**
 * Get all applications (admin view)
 */
export async function getAllApplicationsAdmin(): Promise<Application[]> {
    const supabase = getSupabase();

    if (!isSupabaseConfigured() || !supabase) {
        return [];
    }

    const { data, error } = await supabase
        .from('applications')
        .select(`
      *,
      pets (name, breed)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching all applications for admin:', error);
        return [];
    }

    return (data || []).map(dbApplicationToApplication);
}

/**
 * Update application status (admin only)
 */
export async function updateApplicationStatus(
    id: string,
    status: '審核中' | '已通過' | '未通過' | '已取消',
    reviewerNotes?: string
): Promise<boolean> {
    const supabase = getSupabase();

    if (!isSupabaseConfigured() || !supabase) {
        return false;
    }

    const { error } = await supabase
        .from('applications')
        .update({
            status,
            reviewer_notes: reviewerNotes,
            reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);

    if (error) {
        console.error('Error updating application status:', error);
        return false;
    }

    return true;
}

/**
 * Delete an application (admin only)
 */
export async function deleteApplication(id: string): Promise<boolean> {
    const supabase = getSupabase();

    if (!isSupabaseConfigured() || !supabase) {
        return false;
    }

    const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting application:', error);
        return false;
    }

    return true;
}
