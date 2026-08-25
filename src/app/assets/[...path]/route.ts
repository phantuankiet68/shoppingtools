import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const runtime = 'nodejs';

// ============================================================
// CONTENT TYPE
// ============================================================

function getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();

    switch (ext) {
        // Images
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';

        case '.png':
            return 'image/png';

        case '.webp':
            return 'image/webp';

        case '.gif':
            return 'image/gif';

        case '.svg':
            return 'image/svg+xml';

        case '.avif':
            return 'image/avif';

        // Video
        case '.mp4':
            return 'video/mp4';

        case '.webm':
            return 'video/webm';

        case '.mov':
            return 'video/quicktime';

        case '.m4v':
            return 'video/x-m4v';

        // Audio
        case '.mp3':
            return 'audio/mpeg';

        case '.wav':
            return 'audio/wav';

        case '.ogg':
            return 'audio/ogg';

        default:
            return 'application/octet-stream';
    }
}

// ============================================================
// PATH VALIDATION
// ============================================================

function resolveStoragePath(segments: string[]): {
    storageRoot: string;
    filePath: string;
} | null {
    if (!segments.length) {
        return null;
    }

    // Reject obvious traversal attempts.
    if (segments.some((segment) => segment === '..' || segment === '.' || segment.includes('\\'))) {
        return null;
    }

    const storageRoot = path.resolve(process.cwd(), 'storage');

    const filePath = path.resolve(storageRoot, ...segments);

    // Make sure the resolved path is still inside storage/.
    if (filePath !== storageRoot && !filePath.startsWith(`${storageRoot}${path.sep}`)) {
        return null;
    }

    return {
        storageRoot,
        filePath,
    };
}

// ============================================================
// RANGE PARSER
// ============================================================

interface ByteRange {
    start: number;
    end: number;
}

function parseRange(rangeHeader: string, fileSize: number): ByteRange | null {
    if (!rangeHeader.startsWith('bytes=')) {
        return null;
    }

    // We intentionally support a single range only.
    const value = rangeHeader.slice('bytes='.length).split(',')[0].trim();

    const [startText, endText] = value.split('-');

    // bytes=-500
    // Last 500 bytes.
    if (!startText && endText) {
        const suffixLength = Number(endText);

        if (!Number.isFinite(suffixLength) || suffixLength <= 0) {
            return null;
        }

        const start = Math.max(fileSize - suffixLength, 0);

        return {
            start,
            end: fileSize - 1,
        };
    }

    const start = Number(startText);

    if (!Number.isFinite(start) || start < 0 || start >= fileSize) {
        return null;
    }

    // bytes=100-
    if (!endText) {
        return {
            start,
            end: fileSize - 1,
        };
    }

    const requestedEnd = Number(endText);

    if (!Number.isFinite(requestedEnd) || requestedEnd < start) {
        return null;
    }

    return {
        start,
        end: Math.min(requestedEnd, fileSize - 1),
    };
}

// ============================================================
// GET ASSET
// ============================================================

export async function GET(
    request: Request,
    {
        params,
    }: {
        params: Promise<{
            path?: string[];
        }>;
    },
) {
    try {
        const { path: segments } = await params;

        if (!segments || segments.length === 0) {
            return new NextResponse('Not Found', {
                status: 404,
            });
        }

        const resolved = resolveStoragePath(segments);

        if (!resolved) {
            return new NextResponse('Forbidden', {
                status: 403,
            });
        }

        const { filePath } = resolved;

        // ========================================================
        // FILE STAT
        // ========================================================

        let stat;

        try {
            stat = await fs.stat(filePath);
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
                return new NextResponse('Not Found', {
                    status: 404,
                });
            }

            throw error;
        }

        if (!stat.isFile()) {
            return new NextResponse('Not Found', {
                status: 404,
            });
        }

        const fileSize = stat.size;
        const contentType = getContentType(filePath);

        // ========================================================
        // RANGE REQUEST
        // ========================================================

        const rangeHeader = request.headers.get('range');

        if (rangeHeader) {
            const range = parseRange(rangeHeader, fileSize);

            if (!range) {
                return new Response(null, {
                    status: 416,
                    headers: {
                        'Content-Range': `bytes */${fileSize}`,
                        'Accept-Ranges': 'bytes',
                    },
                });
            }

            const chunkSize = range.end - range.start + 1;

            const fileHandle = await fs.open(filePath, 'r');

            try {
                const buffer = Buffer.allocUnsafe(chunkSize);

                await fileHandle.read(buffer, 0, chunkSize, range.start);

                return new Response(new Uint8Array(buffer), {
                    status: 206,
                    headers: {
                        'Content-Type': contentType,
                        'Content-Length': String(chunkSize),
                        'Content-Range': `bytes ${range.start}-${range.end}/${fileSize}`,
                        'Accept-Ranges': 'bytes',
                        'Cache-Control': 'public, max-age=31536000, immutable',
                    },
                });
            } finally {
                await fileHandle.close();
            }
        }

        // ========================================================
        // FULL FILE
        // ========================================================

        const file = await fs.readFile(filePath);

        return new Response(new Uint8Array(file), {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Length': String(fileSize),
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('GET /assets/* error:', error);

        return new NextResponse('Internal Server Error', {
            status: 500,
        });
    }
}
