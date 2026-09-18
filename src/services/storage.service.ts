/**
 * Supabase Cloud Storage Service
 * Handles archiving and retrieving official Agent and Merchant registration forms
 * in the 'registration-forms' bucket of Supabase Storage.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pxdeuforfrpgpulpmbfv.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_rUndEWDqvHPNpYXsh1A4yg_Dz6grY0S';
const BUCKET_NAME = 'registration-forms';

export interface StorageArchiveResult {
  success: boolean;
  storageKey?: string;
  publicUrl?: string;
  error?: string;
}

/**
 * Uploads a completed form JSON snapshot to Supabase Storage
 */
export async function uploadFormToSupabaseStorage(
  folder: 'agents' | 'merchants',
  fileName: string,
  formData: any
): Promise<StorageArchiveResult> {
  try {
    const cleanFileName = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
    const objectPath = `${folder}/${cleanFileName}`;
    const targetUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${objectPath}`;

    const payloadString = JSON.stringify({
      archiveType: folder === 'agents' ? 'AGENT_REGISTRATION_FORM' : 'MERCHANT_REGISTRATION_FORM',
      archivedAt: new Date().toISOString(),
      platform: 'Legacy Cuisine F&B Aggregator',
      storageBucket: BUCKET_NAME,
      data: formData,
    }, null, 2);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'x-upsert': 'true',
      },
      body: payloadString,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[SupabaseStorage] Upload warning for ${objectPath}: ${response.status} - ${errText}`);
      return {
        success: false,
        error: errText,
      };
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${objectPath}`;
    return {
      success: true,
      storageKey: `${BUCKET_NAME}/${objectPath}`,
      publicUrl,
    };
  } catch (err: any) {
    console.error(`[SupabaseStorage] Error archiving form to storage:`, err);
    return {
      success: false,
      error: err.message || 'Storage archive failed',
    };
  }
}

/**
 * Archive an Agent Registration Form to Supabase Storage
 */
export async function archiveAgentForm(record: any): Promise<StorageArchiveResult> {
  const fileId = record.id || record.agentNo || `agent-${Date.now()}`;
  return uploadFormToSupabaseStorage('agents', `${fileId}.json`, record);
}

/**
 * Archive a Merchant Registration Form to Supabase Storage
 */
export async function archiveMerchantForm(record: any): Promise<StorageArchiveResult> {
  const fileId = record.id || record.registrationNo || `merchant-${Date.now()}`;
  return uploadFormToSupabaseStorage('merchants', `${fileId}.json`, record);
}
