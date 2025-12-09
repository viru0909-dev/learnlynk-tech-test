/**
 * Centralized Supabase Client Configuration
 * 
 * This file provides a singleton Supabase client instance with proper
 * environment variable validation and error handling for production use.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
    throw new Error(
        'Missing environment variable: NEXT_PUBLIC_SUPABASE_URL\n' +
        'Please add it to your .env.local file.\n' +
        'Get your Supabase URL from: https://app.supabase.com/project/_/settings/api'
    );
}

if (!supabaseAnonKey) {
    throw new Error(
        'Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
        'Please add it to your .env.local file.\n' +
        'Get your Supabase anon key from: https://app.supabase.com/project/_/settings/api'
    );
}

// Create and export the Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    },
});

// Export helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
    return !!(supabaseUrl && supabaseAnonKey);
};
