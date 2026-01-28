import { supabase } from '../lib/supabase';

/**
 * Uploads a file to Cloudflare R2 using a signed URL from Supabase Edge Function.
 * @param file The file object to upload.
 * @returns The public URL of the uploaded file.
 */
export async function uploadImageToR2(file: File): Promise<string> {
    // 1. Get signed URL from Edge Function
    const { data, error } = await supabase.functions.invoke('get-upload-url', {
        body: {
            filename: file.name,
            fileType: file.type
        }
    });

    if (error) {
        console.error('Error invoking function:', error);
        throw new Error(`Error preparing upload: ${error.message}`);
    }

    if (!data || !data.uploadUrl) {
        throw new Error('No upload URL received');
    }

    const { uploadUrl, publicUrl } = data;

    // 2. Upload file directly to R2
    const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': file.type
        },
        body: file
    });

    if (!uploadRes.ok) {
        throw new Error(`Error uploading to storage: ${uploadRes.statusText}`);
    }

    // 3. Return the public URL
    return publicUrl;
}
