import { supabase, isSupabaseConfigured } from './supabase';
import { getCurrentUserId } from './authService';

export interface Notification {
    id: string;
    type: 'application_update' | 'new_pet' | 'message' | 'system';
    title: string;
    body: string;
    data?: any;
    isRead: boolean;
    createdAt: string;
}

// Convert database notification to frontend Notification type
function dbNotificationToNotification(dbNotif: any): Notification {
    return {
        id: dbNotif.id,
        type: dbNotif.type,
        title: dbNotif.title,
        body: dbNotif.body,
        data: dbNotif.data,
        isRead: dbNotif.is_read,
        createdAt: dbNotif.created_at,
    };
}

/**
 * Get all notifications for the current user
 */
export async function getNotifications(): Promise<Notification[]> {
    if (!isSupabaseConfigured() || !supabase) {
        return [];
    }

    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }

    return (data || []).map(dbNotificationToNotification);
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) {
        return false;
    }

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

    if (error) {
        console.error('Error marking notification as read:', error);
        return false;
    }

    return true;
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<boolean> {
    if (!isSupabaseConfigured() || !supabase) {
        return false;
    }

    const userId = await getCurrentUserId();
    if (!userId) return false;

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
    }

    return true;
}

/**
 * Subscribe to real-time notifications
 */
export function subscribeToNotifications(callback: (notification: Notification) => void): () => void {
    if (!isSupabaseConfigured() || !supabase) {
        return () => { };
    }

    // internal async wrapper to get user ID
    let subscription: any = null;

    const setupSubscription = async () => {
        const userId = await getCurrentUserId();
        if (!userId) return;

        subscription = supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    callback(dbNotificationToNotification(payload.new));
                }
            )
            .subscribe();
    };

    setupSubscription();

    return () => {
        if (subscription) {
            subscription.unsubscribe();
        }
    };
}
