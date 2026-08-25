import { spawn } from 'node:child_process';
import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export interface FfmpegRenderScene {
    videoUrl: string;
    durationSeconds?: number;
}

export interface FfmpegRenderOptions {
    projectId: string;
    scenes: FfmpegRenderScene[];
    outputDir?: string;
    outputFileName?: string;
}

export interface FfmpegRenderResult {
    outputPath: string;
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
    // ============================================================
    // COMPOSE VIDEO
    // ============================================================

    async render(options: FfmpegRenderOptions): Promise<FfmpegRenderResult> {
        if (!options.projectId) {
            throw new Error('projectId is required');
        }

        if (!options.scenes.length) {
            throw new Error('At least one video scene is required');
        }

        const outputDir =
            options.outputDir ??
            path.join(process.cwd(), 'public', 'uploads', 'ai-video', options.projectId);

        await mkdir(outputDir, {
            recursive: true,
        });

        const outputFileName = options.outputFileName ?? `video-${Date.now()}.mp4`;

        const outputPath = path.join(outputDir, outputFileName);

        const scenePaths = options.scenes.map((scene) => scene.videoUrl);

        await this.ensureInputs(scenePaths);

        const concatFilePath = path.join(outputDir, `concat-${Date.now()}.txt`);

        const concatContent = scenePaths
            .map((scenePath) => `file '${this.escapeConcatPath(scenePath)}'`)
            .join('\n');

        await writeFile(concatFilePath, concatContent, 'utf8');

        try {
            await this.runFfmpeg([
                '-y',
                '-f',
                'concat',
                '-safe',
                '0',
                '-i',
                concatFilePath,
                '-c',
                'copy',
                outputPath,
            ]);
        } finally {
            await this.removeFile(concatFilePath);
        }

        await this.ensureFile(outputPath);

        const durationSeconds = options.scenes.reduce(
            (total, scene) => total + (scene.durationSeconds ?? 0),
            0,
        );

        return {
            outputPath,
            durationSeconds,
            width: 1080,
            height: 1920,
        };
    }

    // ============================================================
    // GENERATE THUMBNAIL
    // ============================================================

    async generateThumbnail(options: FfmpegThumbnailOptions): Promise<string> {
        if (!options.videoPath) {
            throw new Error('videoPath is required');
        }

        if (!options.outputPath) {
            throw new Error('outputPath is required');
        }

        const timeSeconds = options.timeSeconds ?? 0;

        const width = options.width ?? 540;

        if (timeSeconds < 0) {
            throw new Error('timeSeconds cannot be negative');
        }

        if (width <= 0) {
            throw new Error('Thumbnail width must be greater than 0');
        }

        await this.ensureInputs([options.videoPath]);

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

    // ============================================================
    // VALIDATE INPUT FILES
    // ============================================================

    private async ensureInputs(inputs: string[]): Promise<void> {
        for (const input of inputs) {
            if (input.startsWith('http://') || input.startsWith('https://')) {
                throw new Error(`FFmpeg requires local video files. Remote URL received: ${input}`);
            }

            try {
                await access(input);
            } catch {
                throw new Error(`Video file not found: ${input}`);
            }
        }
    }

    // ============================================================
    // VALIDATE OUTPUT FILE
    // ============================================================

    private async ensureFile(filePath: string): Promise<void> {
        try {
            await access(filePath);
        } catch {
            throw new Error(`FFmpeg output file was not created: ${filePath}`);
        }
    }

    // ============================================================
    // RUN FFMPEG
    // ============================================================

    private runFfmpeg(args: string[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const ffmpegProcess = spawn('ffmpeg', args, {
                stdio: ['ignore', 'pipe', 'pipe'],
            });

            let stderr = '';

            ffmpegProcess.stderr.on('data', (chunk: Buffer) => {
                stderr += chunk.toString();
            });

            ffmpegProcess.on('error', (error) => {
                reject(new Error(`Failed to start FFmpeg: ${error.message}`));
            });

            ffmpegProcess.on('close', (code) => {
                if (code === 0) {
                    resolve();
                    return;
                }

                reject(new Error(`FFmpeg exited with code ${code}: ${stderr.slice(-4000)}`));
            });
        });
    }

    // ============================================================
    // CONCAT PATH ESCAPING
    // ============================================================

    private escapeConcatPath(filePath: string): string {
        return filePath.replace(/'/g, "'\\''");
    }

    // ============================================================
    // REMOVE TEMP FILE
    // ============================================================

    private async removeFile(filePath: string): Promise<void> {
        try {
            const fs = await import('node:fs/promises');

            await fs.unlink(filePath);
        } catch {
            // Ignore cleanup errors.
        }
    }
}

export const videoFfmpegRenderer = new VideoFfmpegRenderer();

export default videoFfmpegRenderer;
