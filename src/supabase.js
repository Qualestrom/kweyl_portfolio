import { createClient } from '@supabase/supabase-js';

// Environment variables or localStorage override
const supabaseUrl = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof window !== 'undefined' && localStorage.getItem('VITE_SUPABASE_URL')) ||
  '';

const supabaseAnonKey = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof window !== 'undefined' && localStorage.getItem('VITE_SUPABASE_ANON_KEY')) ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  !supabaseUrl.includes('placeholder')
);

// Fallback dummy client if credentials are not yet set, to prevent runtime crashes
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null;

export const STORAGE_BUCKET = 'portfolio-assets';

/**
 * Upload a file or blob to Supabase Storage and return public URL
 */
export async function uploadToSupabaseStorage(folder, file, customName = null) {
  if (!supabase) throw new Error('Supabase is not configured');

  const fileExt = file.name ? file.name.split('.').pop() : 'png';
  const fileName = customName || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      upsert: true,
      cacheControl: '3600',
      contentType: file.type || undefined
    });

  if (error) {
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return {
    filePath: data.path,
    publicUrl
  };
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFromSupabaseStorage(filePath) {
  if (!supabase) return;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([filePath]);
  if (error) console.warn('Supabase storage delete error:', error.message);
}
