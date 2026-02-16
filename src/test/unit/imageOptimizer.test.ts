import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { compressImage } from '../../utils/imageOptimizer';

// Mock the worker module
vi.mock('../../utils/imageCompression.worker?worker', () => {
    return {
        default: class MockWorker {
            onmessage: ((e: MessageEvent) => void) | null = null;
            onerror: ((e: ErrorEvent) => void) | null = null;

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            postMessage(_data: unknown) {
                // Simulate successful compression
                setTimeout(() => {
                    if (this.onmessage) {
                        this.onmessage({
                            data: {
                                success: true,
                                blob: new Blob(['mock-compressed-worker'], { type: 'image/jpeg' })
                            }
                        } as MessageEvent);
                    }
                }, 10);
            }

            terminate() {}
        }
    };
});

describe('compressImage', () => {
    let originalWorker: unknown;
    let originalOffscreenCanvas: unknown;
    let originalCreateObjectURL: unknown;
    let originalRevokeObjectURL: unknown;
    let originalImage: unknown;

    beforeEach(() => {
        originalWorker = global.Worker;
        originalOffscreenCanvas = global.OffscreenCanvas;
        originalCreateObjectURL = global.URL.createObjectURL;
        originalRevokeObjectURL = global.URL.revokeObjectURL;
        originalImage = global.Image;

        // Mock URL methods globally
        global.URL.createObjectURL = vi.fn(() => 'blob:url');
        global.URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
        global.Worker = originalWorker as typeof Worker;
        global.OffscreenCanvas = originalOffscreenCanvas as typeof OffscreenCanvas;
        global.URL.createObjectURL = originalCreateObjectURL as typeof URL.createObjectURL;
        global.URL.revokeObjectURL = originalRevokeObjectURL as typeof URL.revokeObjectURL;
        global.Image = originalImage as typeof Image;
        vi.restoreAllMocks();
    });

    it('uses Web Worker when available', async () => {
        // Ensure Worker and OffscreenCanvas are defined
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        global.Worker = class {} as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        global.OffscreenCanvas = class {} as any;

        const file = new File(['test'], 'test.png', { type: 'image/png' });

        const compressed = await compressImage(file);

        expect(compressed).toBeInstanceOf(File);
        expect(compressed.type).toBe('image/jpeg');

        // Verify content size matches mock blob
        expect(compressed.size).toBe(new Blob(['mock-compressed-worker']).size);
    });

    it('falls back to main thread when Worker is missing', async () => {
        // Remove Worker support to trigger fallback
        // @ts-expect-error - Deleting global property for test
        delete global.Worker;

        // Mock Image and Canvas for main thread execution
        const mockContext = {
            drawImage: vi.fn(),
        };
        const mockCanvas = {
            getContext: vi.fn().mockReturnValue(mockContext),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            toBlob: vi.fn((cb, _type, _quality) => {
                // Simulate async blob creation
                setTimeout(() => {
                    cb(new Blob(['mock-compressed-main'], { type: 'image/jpeg' }));
                }, 10);
            }),
            width: 100,
            height: 100,
        };

        // Mock document.createElement
        const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (tag === 'canvas') return mockCanvas as any;
            return document.createElement(tag);
        });

        // Mock Image loading
        global.Image = class {
            onload: (() => void) | null = null;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onerror: ((e: any) => void) | null = null;
            width = 100;
            height = 100;
            _src = '';

            get src() { return this._src; }
            set src(val: string) {
                this._src = val;
                // Trigger onload on next tick
                setTimeout(() => {
                    if (this.onload) this.onload();
                }, 20);
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;

        const file = new File(['test'], 'test.png', { type: 'image/png' });

        const compressed = await compressImage(file);

        expect(compressed).toBeInstanceOf(File);
        expect(createElementSpy).toHaveBeenCalledWith('canvas');
        expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
        expect(mockContext.drawImage).toHaveBeenCalled();

        // Verify content size matches mock blob
        expect(compressed.size).toBe(new Blob(['mock-compressed-main']).size);
    });

    it('returns original file if not an image', async () => {
        const file = new File(['text'], 'test.txt', { type: 'text/plain' });
        const result = await compressImage(file);
        expect(result).toBe(file);
    });
});
