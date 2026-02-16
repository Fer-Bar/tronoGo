/// <reference lib="webworker" />

export interface CompressionConfig {
    maxWidth: number;
    quality: number;
    mimeType: string;
}

self.onmessage = async (e: MessageEvent<{ file: File; config: CompressionConfig }>) => {
    const { file, config } = e.data;

    try {
        const bitmap = await createImageBitmap(file);

        let width = bitmap.width;
        let height = bitmap.height;

        // Calculate new dimensions
        if (width > config.maxWidth) {
            height = Math.round((height * config.maxWidth) / width);
            width = config.maxWidth;
        }

        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Could not get OffscreenCanvas context');
        }

        ctx.drawImage(bitmap, 0, 0, width, height);

        // Cleanup bitmap
        bitmap.close();

        const blob = await canvas.convertToBlob({
            type: config.mimeType,
            quality: config.quality,
        });

        // Create a file-like object (or just return blob and let main thread wrap it)
        // Workers can transfer Blobs but File constructor might not be available or fully compatible in all worker envs,
        // but `File` is generally available in modern workers.
        // However, to be safe and consistent, we'll return the Blob and metadata.

        self.postMessage({ success: true, blob });
    } catch (error) {
        self.postMessage({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error in worker'
        });
    }
};
