import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { access, mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

const execFileAsync = promisify(execFile);

export interface FfmpegRenderScene {
    videoUrl: string;
    durationSeconds?: number;
}

export interface FfmpegRenderOptions {
    projectId: string;
    width: number;
    height: number;
    aspectRatio: string;
    durationSeconds: number;
    voiceUrl?: string;
    backgroundMusic?: string;
    scenes: FfmpegRenderScene[];
    outputDir?: string;
    outputFileName?: string;
}

export interface FfmpegRenderResult {
    outputPath: string;
    videoUrl: string;
    thumbnailUrl?: string;
    durationSeconds: number;
    width: number;
    height: number;
}

export interface FfmpegThumbnailOptions {
    videoPath: string;
    outputPath: string;
    timeSeconds?: number;
    width?: number;
}

export class VideoFfmpegRenderer {
    private ffmpegPathPromise?: Promise<string>;
    private ffprobePathPromise?: Promise<string>;
    async render(options: FfmpegRenderOptions): Promise<FfmpegRenderResult> {
        if (!options.projectId) {
            throw new Error('projectId is required');
        }

        if (!options.scenes.length) {
            throw new Error('At least one video scene is required');
        }

        const width = options.width;
        const height = options.height;

        const projectStorageDir = path.join(
            process.cwd(),
            'storage',
            'ai-video',
            'projects',
            options.projectId,
        );

        const outputDir = options.outputDir ?? path.join(projectStorageDir, 'final');

        const workDir = path.join(projectStorageDir, '.work');

        await mkdir(outputDir, {
            recursive: true,
        });

        await mkdir(workDir, {
            recursive: true,
        });

        const outputFileName = options.outputFileName ?? 'video.mp4';

        const outputPath = path.join(outputDir, outputFileName);

        const localScenePaths: string[] = [];
        let concatFilePath: string | null = null;
        let localVoicePath: string | null = null;

        try {
            for (let index = 0; index < options.scenes.length; index += 1) {
                const scene = options.scenes[index];

                if (!scene?.videoUrl?.trim()) {
                    throw new Error(`Scene ${index + 1} video URL is empty`);
                }

                const localPath = await this.resolveSceneVideo(scene.videoUrl, workDir, index + 1);

                localScenePaths.push(localPath);
            }

            concatFilePath = path.join(workDir, `concat-${Date.now()}.txt`);

            const concatContent = localScenePaths
                .map((filePath) => `file '${this.escapeConcatPath(filePath)}'`)
                .join('\n');

            await writeFile(concatFilePath, concatContent, 'utf8');

            /*
             * Resolve voice before rendering.
             *
             * /assets/... -> storage/...
             * HTTP URL -> download to .work
             */
            if (options.voiceUrl?.trim()) {
                localVoicePath = await this.resolveVoiceAudio(options.voiceUrl, workDir);

                console.log('[ffmpeg] Using voice audio:', {
                    voiceUrl: options.voiceUrl,
                    filePath: localVoicePath,
                });
            }

            const ffmpegArgs = [
                '-y',
                '-stream_loop',
                '-1',
                '-f',
                'concat',
                '-safe',
                '0',
                '-i',
                concatFilePath,
            ];

            /*
             * Add voice as second input when available.
             */
            if (localVoicePath) {
                ffmpegArgs.push('-i', localVoicePath);
            }

            /*
             * Video output.
             *
             * If voice exists:
             *   [1:a] -> audio input
             *
             * The voice is trimmed to video duration.
             * If voice is shorter, it simply ends.
             */
            if (localVoicePath) {
                ffmpegArgs.push(
                    '-map',
                    '0:v:0',
                    '-map',
                    '1:a:0',
                    '-c:v',
                    'libx264',
                    '-preset',
                    'medium',
                    '-crf',
                    '18',
                    '-pix_fmt',
                    'yuv420p',
                    '-movflags',
                    '+faststart',
                    '-c:a',
                    'aac',
                    '-b:a',
                    '192k',
                    '-ar',
                    '44100',
                    '-ac',
                    '2',
                    '-shortest',
                    '-s',
                    `${width}x${height}`,
                    outputPath,
                );
            } else {
                /*
                 * No voice:
                 * preserve existing silent-video behavior.
                 */
                ffmpegArgs.push(
                    '-c:v',
                    'libx264',
                    '-preset',
                    'medium',
                    '-crf',
                    '18',
                    '-pix_fmt',
                    'yuv420p',
                    '-movflags',
                    '+faststart',
                    '-an',
                    '-s',
                    `${width}x${height}`,
                    outputPath,
                );
            }

            await this.runFfmpeg(ffmpegArgs);

            await this.ensureFile(outputPath);

            const durationSeconds = await this.getMediaDuration(outputPath);

            const videoUrl = this.toStorageUrl(outputPath);

            console.log('[ffmpeg] Final video created:', {
                projectId: options.projectId,
                outputPath,
                videoUrl,
                durationSeconds,
                hasVoice: Boolean(localVoicePath),
            });

            return {
                outputPath,
                videoUrl,
                durationSeconds,
                width,
                height,
            };
        } finally {
            if (concatFilePath) {
                await this.removeFile(concatFilePath);
            }

            if (localVoicePath && localVoicePath.startsWith(workDir)) {
                await this.removeFile(localVoicePath);
            }

            for (const filePath of localScenePaths) {
                /*
                 * Only remove temporary downloaded
                 * provider files.
                 *
                 * Stored scene files must stay.
                 */
                if (filePath.startsWith(workDir)) {
                    await this.removeFile(filePath);
                }
            }
        }
    }

    async generateThumbnail(options: FfmpegThumbnailOptions): Promise<string> {
        if (!options.videoPath) {
            throw new Error('videoPath is required');
        }

        if (!options.outputPath) {
            throw new Error('outputPath is required');
        }

        const timeSeconds = Math.max(0, options.timeSeconds ?? 0);

        const width = options.width ?? 540;

        await this.ensureFile(options.videoPath);

        await mkdir(path.dirname(options.outputPath), {
            recursive: true,
        });

        await this.runFfmpeg([
            '-y',
            '-ss',
            String(timeSeconds),
            '-i',
            options.videoPath,
            '-frames:v',
            '1',
            '-vf',
            `scale=${width}:-2`,
            '-q:v',
            '2',
            options.outputPath,
        ]);

        await this.ensureFile(options.outputPath);

        return options.outputPath;
    }

    private async resolveSceneVideo(
        videoUrl: string,
        workDir: string,
        sceneNumber: number,
    ): Promise<string> {
        const value = videoUrl.trim();

        if (!value) {
            throw new Error(`Scene ${sceneNumber} video URL is empty`);
        }

        /*
         * Internal storage URL:
         *
         * /assets/ai-video/projects/...
         */
        if (value.startsWith('/assets/')) {
            const filePath = this.storageUrlToFilePath(value);

            await this.ensureFile(filePath);

            console.log('[ffmpeg] Using stored scene:', {
                sceneNumber,
                filePath,
            });

            return filePath;
        }

        /*
         * Remote provider URL.
         *
         * Compatibility for non-migrated scenes.
         */
        if (value.startsWith('http://') || value.startsWith('https://')) {
            return this.downloadRemoteVideo(value, workDir, sceneNumber);
        }

        await this.ensureFile(value);

        return value;
    }

    private async resolveVoiceAudio(voiceUrl: string, workDir: string): Promise<string> {
        const value = voiceUrl.trim();

        if (!value) {
            throw new Error('Voice URL is empty');
        }

        /*
         * Stored voice:
         *
         * /assets/ai-video/projects/.../voice/voice.mp3
         */
        if (value.startsWith('/assets/')) {
            const filePath = this.storageUrlToFilePath(value);

            await this.ensureFile(filePath);

            return filePath;
        }

        /*
         * Remote voice URL.
         */
        if (value.startsWith('http://') || value.startsWith('https://')) {
            const outputPath = path.join(workDir, `voice-${Date.now()}.mp3`);

            console.log('[ffmpeg] Downloading remote voice:', {
                host: this.getSafeHost(value),
            });

            const response = await fetch(value, {
                method: 'GET',
                redirect: 'follow',
            });

            if (!response.ok) {
                throw new Error(`Failed to download voice audio: HTTP ${response.status}`);
            }

            const arrayBuffer = await response.arrayBuffer();

            if (arrayBuffer.byteLength === 0) {
                throw new Error('Downloaded voice audio is empty');
            }

            await writeFile(outputPath, Buffer.from(arrayBuffer));

            await this.ensureFile(outputPath);

            return outputPath;
        }

        await this.ensureFile(value);

        return value;
    }

    private async downloadRemoteVideo(
        url: string,
        workDir: string,
        sceneNumber: number,
    ): Promise<string> {
        const outputPath = path.join(
            workDir,
            `scene-${String(sceneNumber).padStart(2, '0')}-${Date.now()}.mp4`,
        );

        console.log('[ffmpeg] Downloading remote scene:', {
            sceneNumber,
            host: this.getSafeHost(url),
        });

        const response = await fetch(url, {
            method: 'GET',
            redirect: 'follow',
        });

        if (!response.ok) {
            throw new Error(`Failed to download scene ${sceneNumber}: HTTP ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();

        if (arrayBuffer.byteLength === 0) {
            throw new Error(`Downloaded scene ${sceneNumber} is empty`);
        }

        await writeFile(outputPath, Buffer.from(arrayBuffer));

        await this.ensureFile(outputPath);

        return outputPath;
    }

    private async runFfmpeg(args: string[]): Promise<void> {
        const ffmpegPath = await this.resolveFfmpegPath();

        console.log('[ffmpeg] Running:', {
            executable: ffmpegPath,
        });

        await new Promise<void>((resolve, reject) => {
            const child = execFile(
                ffmpegPath,
                args,
                {
                    windowsHide: true,
                    maxBuffer: 20 * 1024 * 1024,
                },
                (error, _stdout, stderr) => {
                    if (!error) {
                        resolve();
                        return;
                    }

                    reject(new Error(`FFmpeg failed: ${stderr || error.message}`));
                },
            );

            child.on('error', (error) => {
                reject(new Error(`Failed to start FFmpeg: ${error.message}`));
            });
        });
    }

    private async resolveFfmpegPath(): Promise<string> {
        if (this.ffmpegPathPromise) {
            return this.ffmpegPathPromise;
        }

        this.ffmpegPathPromise = (async () => {
            const configured = process.env.FFMPEG_PATH?.trim();

            if (configured) {
                await this.ensureFile(configured);

                return configured;
            }

            if (process.platform === 'win32') {
                try {
                    const { stdout } = await execFileAsync('where.exe', ['ffmpeg'], {
                        windowsHide: true,
                    });

                    const firstPath = stdout
                        .split(/\r?\n/)
                        .map((item) => item.trim())
                        .find(Boolean);

                    if (firstPath) {
                        return firstPath;
                    }
                } catch {
                    // Continue.
                }
            }

            try {
                const { stdout } = await execFileAsync(
                    process.platform === 'win32' ? 'where.exe' : 'which',
                    ['ffmpeg'],
                    {
                        windowsHide: true,
                    },
                );

                const firstPath = stdout
                    .split(/\r?\n/)
                    .map((item) => item.trim())
                    .find(Boolean);

                if (firstPath) {
                    return firstPath;
                }
            } catch {
                // Continue.
            }

            throw new Error(
                'FFmpeg executable was not found. Set FFMPEG_PATH in .env or add ffmpeg to PATH.',
            );
        })();

        return this.ffmpegPathPromise;
    }

    private storageUrlToFilePath(url: string): string {
        const prefix = '/assets/';

        if (!url.startsWith(prefix)) {
            throw new Error(`Unsupported storage URL: ${url}`);
        }

        const relativePath = url.slice(prefix.length).replace(/^\/+/, '');

        if (!relativePath || relativePath.includes('\0')) {
            throw new Error(`Invalid storage URL: ${url}`);
        }

        if (relativePath.split('/').some((segment) => segment === '.' || segment === '..')) {
            throw new Error(`Invalid storage URL: ${url}`);
        }

        const storageRoot = path.resolve(process.cwd(), 'storage');

        const filePath = path.resolve(storageRoot, relativePath);

        if (filePath !== storageRoot && !filePath.startsWith(`${storageRoot}${path.sep}`)) {
            throw new Error(`Storage path escapes storage root: ${url}`);
        }

        return filePath;
    }

    private toStorageUrl(filePath: string): string {
        const storageRoot = path.resolve(process.cwd(), 'storage');

        const normalizedFilePath = path.resolve(filePath);

        if (
            normalizedFilePath !== storageRoot &&
            !normalizedFilePath.startsWith(`${storageRoot}${path.sep}`)
        ) {
            throw new Error(`Rendered file is outside storage directory: ${filePath}`);
        }

        const relativePath = path.relative(storageRoot, normalizedFilePath);

        if (!relativePath) {
            throw new Error(`Invalid rendered storage path: ${filePath}`);
        }

        return `/assets/${relativePath.split(path.sep).join('/')}`;
    }

    private async ensureFile(filePath: string): Promise<void> {
        try {
            await access(filePath);
        } catch {
            throw new Error(`File not found: ${filePath}`);
        }
    }

    private escapeConcatPath(filePath: string): string {
        return filePath.replace(/'/g, "'\\''");
    }

    private async removeFile(filePath: string): Promise<void> {
        try {
            await unlink(filePath);
        } catch {
            // Ignore cleanup errors.
        }
    }

    private getSafeHost(value: string): string {
        try {
            return new URL(value).host;
        } catch {
            return 'unknown';
        }
    }
    private async getMediaDuration(filePath: string): Promise<number> {
        await this.ensureFile(filePath);

        const ffprobePath = await this.resolveFfprobePath();

        const { stdout, stderr } = await execFileAsync(
            ffprobePath,
            [
                '-v',
                'error',
                '-show_entries',
                'format=duration',
                '-of',
                'default=noprint_wrappers=1:nokey=1',
                filePath,
            ],
            {
                windowsHide: true,
                maxBuffer: 1024 * 1024,
            },
        );

        const duration = Number.parseFloat(stdout.trim());

        if (!Number.isFinite(duration) || duration <= 0) {
            throw new Error(
                `FFprobe returned invalid duration for ${filePath}: ${
                    stdout.trim() || stderr.trim() || 'empty output'
                }`,
            );
        }

        return duration;
    }

    private async resolveFfprobePath(): Promise<string> {
        if (this.ffprobePathPromise) {
            return this.ffprobePathPromise;
        }

        this.ffprobePathPromise = (async () => {
            const configured = process.env.FFPROBE_PATH?.trim();

            if (configured) {
                await this.ensureFile(configured);

                return configured;
            }

            const ffmpegPath = process.env.FFMPEG_PATH?.trim();

            if (ffmpegPath) {
                const candidate = path.join(
                    path.dirname(ffmpegPath),
                    process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe',
                );

                try {
                    await this.ensureFile(candidate);

                    return candidate;
                } catch {
                    // Continue with PATH lookup.
                }
            }

            if (process.platform === 'win32') {
                try {
                    const { stdout } = await execFileAsync('where.exe', ['ffprobe'], {
                        windowsHide: true,
                    });

                    const firstPath = stdout
                        .split(/\r?\n/)
                        .map((item) => item.trim())
                        .find(Boolean);

                    if (firstPath) {
                        return firstPath;
                    }
                } catch {
                    // Continue.
                }
            }

            try {
                const { stdout } = await execFileAsync(
                    process.platform === 'win32' ? 'where.exe' : 'which',
                    ['ffprobe'],
                    {
                        windowsHide: true,
                    },
                );

                const firstPath = stdout
                    .split(/\r?\n/)
                    .map((item) => item.trim())
                    .find(Boolean);

                if (firstPath) {
                    return firstPath;
                }
            } catch {
                // Continue.
            }

            throw new Error(
                'FFprobe executable was not found. Set FFPROBE_PATH in .env or add ffprobe to PATH.',
            );
        })();

        return this.ffprobePathPromise;
    }
}

export const ffmpegVideoRenderService = new VideoFfmpegRenderer();

export const videoFfmpegRenderer = ffmpegVideoRenderService;

export default ffmpegVideoRenderService;
