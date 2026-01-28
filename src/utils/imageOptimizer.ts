/**
 * Optimizes an image file by resizing and compressing it.
 * Uses HTML Canvas for client-side processing.
 */
export async function compressImage(file: File): Promise<File> {
    // If not an image, return original
    if (!file.type.startsWith('image/')) {
        return file;
    }

    // Configuration
    const MAX_WIDTH = 1920;
    const QUALITY = 0.8;
    const MIME_TYPE = 'image/jpeg';

    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            let width = img.width;
            let height = img.height;

            // Calculate new dimensions
            if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Image compression failed'));
                        return;
                    }

                    // Create new file from blob
                    const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                        type: MIME_TYPE,
                        lastModified: Date.now(),
                    });

                    resolve(compressedFile);
                },
                MIME_TYPE,
                QUALITY
            );
        };

        img.onerror = (err) => {
            URL.revokeObjectURL(url);
            reject(err);
        };

        img.src = url;
    });
}
