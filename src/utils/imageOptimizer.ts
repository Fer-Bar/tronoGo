import ImageWorker from './imageCompression.worker?worker';

// Configuration
const MAX_WIDTH = 1920;
const QUALITY = 0.8;
const MIME_TYPE = 'image/jpeg';

/**
 * Optimizes an image file by resizing and compressing it.
 * Uses Web Worker and OffscreenCanvas if available to avoid blocking the main thread.
 * Falls back to main thread Canvas API otherwise.
 */
export async function compressImage(file: File): Promise<File> {
    // If not an image, return original
    if (!file.type.startsWith('image/')) {
        return file;
    }

    // Check for Worker and OffscreenCanvas support
    if (typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined') {
        try {
            return await compressImageInWorker(file);
        } catch (error) {
            console.warn('Worker compression failed, falling back to main thread:', error);
            // Fallback to main thread implementation
        }
    }

    return compressImageMainThread(file);
}

async function compressImageInWorker(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        const worker = new ImageWorker();

        worker.onmessage = (e) => {
            const { success, blob, error } = e.data;
            worker.terminate();

            if (success && blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                    type: MIME_TYPE,
                    lastModified: Date.now(),
                });
                resolve(compressedFile);
            } else {
                reject(new Error(error || 'Worker compression failed'));
            }
        };

        worker.onerror = (err) => {
            worker.terminate();
            reject(err);
        };

        worker.postMessage({
            file,
            config: {
                maxWidth: MAX_WIDTH,
                quality: QUALITY,
                mimeType: MIME_TYPE
            }
        });
    });
}

function compressImageMainThread(file: File): Promise<File> {
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
