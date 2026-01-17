import { getSupabase, DbMessage, isSupabaseConfigured } from './supabase';
import { getCurrentUserId } from './authService';
import { Message, Pet } from '../types';
import { getPetById } from './petService';

export interface ChatSession {
    id: string;
    pet: Pet;
    volunteerName: string;
    lastMessageAt: string;
    lastMessage?: string;
}

// Convert database message to frontend Message type
function dbMessageToMessage(dbMsg: DbMessage): Message {
    return {
        id: dbMsg.id,
        sender: dbMsg.sender,
        text: dbMsg.text,
        timestamp: formatTimestamp(dbMsg.created_at),
        image: dbMsg.image_url,
    };
}

// Format timestamp for display
function formatTimestamp(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return '今天';
    } else if (diffDays === 1) {
        return '昨天';
    } else if (diffDays < 7) {
        return `${diffDays} 天前`;
    } else {
        return date.toLocaleDateString('zh-TW');
    }
}

/**
 * Get or create a chat session for a pet
 */
export async function getOrCreateChatSession(petId: string): Promise<string | null> {
    const supabase = getSupabase();

    if (!isSupabaseConfigured() || !supabase) {
        return null;
    }

    const userId = await getCurrentUserId();
    if (!userId) {
        console.error('No authenticated user for getOrCreateChatSession');
        return null;
    }

    // Try to get existing session
    const { data: existing } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('pet_id', petId)
        .maybeSingle();

    if (existing) {
        return existing.id;
    }

    // Create new session
    const { data: newSession, error } = await supabase
        .from('chat_sessions')
        .insert({
            user_id: userId,
            pet_id: petId,
            volunteer_name: 'Sarah',
        })
        .select('id')
        .single();

    if (error) {
        console.error('Error creating chat session:', error);
        return null;
    }

    return newSession?.id || null;
}

/**
 * Get all chat sessions for current user
 */
export async function getChatSessions(): Promise<ChatSession[]> {
    const supabase = getSupabase();

    if (!isSupabaseConfigured() || !supabase) {
        return [];
    }

    const userId = await getCurrentUserId();
    if (!userId) {
        console.log('No authenticated user for getChatSessions');
        return [];
    }

    const { data, error } = await supabase
        .from('chat_sessions')
        .select(`
      *,
      pets (*),
      messages (text, created_at)
    `)
        .eq('user_id', userId)
        .order('last_message_at', { ascending: false });

    if (error) {
        console.error('Error fetching chat sessions:', error);
        return [];
    }

    const sessions: ChatSession[] = [];

    for (const session of data || []) {
        if (!session.pets) continue;

        const pet = await getPetById(session.pet_id);
        if (!pet) continue;

        // Get last message
        const lastMessage = session.messages?.length > 0
            ? session.messages.sort((a: DbMessage, b: DbMessage) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0]
            : null;

        sessions.push({
            id: session.id,
            pet,
            volunteerName: session.volunteer_name,
            lastMessageAt: session.last_message_at,
            lastMessage: lastMessage?.text,
        });
    }

    return sessions;
}

/**
 * Get messages for a chat session
 */
export async function getMessages(sessionId: string): Promise<Message[]> {
    const supabase = getSupabase();

    if (!isSupabaseConfigured() || !supabase) {
        return [];
    }

    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching messages:', error);
        return [];
    }

    return (data || []).map(dbMessageToMessage);
}

/**
 * Send a message in a chat session
 */
export async function sendMessage(
    sessionId: string,
    text: string,
    sender: 'user' | 'volunteer' = 'user'
): Promise<Message | null> {
    const supabase = getSupabase();

    if (!isSupabaseConfigured() || !supabase) {
        return null;
    }

    const { data, error } = await supabase
        .from('messages')
        .insert({
            session_id: sessionId,
            sender,
            text,
        })
        .select()
        .single();

    if (error) {
        console.error('Error sending message:', error);
        return null;
    }

    return data ? dbMessageToMessage(data) : null;
}

/**
 * Get messages for a pet chat (creates session if needed)
 */
export async function getMessagesForPet(petId: string): Promise<{ sessionId: string; messages: Message[] } | null> {
    const supabase = getSupabase();

    if (!isSupabaseConfigured() || !supabase) {
        return null;
    }

    const sessionId = await getOrCreateChatSession(petId);
    if (!sessionId) return null;

    const messages = await getMessages(sessionId);
    return { sessionId, messages };
}
