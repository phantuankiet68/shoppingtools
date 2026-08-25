import { spawn } from 'node:child_process';
import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export interface MockVideoGeneratorOptions {
    projectId: string;

    sceneId?: string;

    sceneNumber?: number;

    durationSeconds?: number;

    width?: number;

    height?: number;

    title?: string;

    prompt?: string;

    scriptText?: string;

    outputDir?: string;

    outputFileName?: string;

    generateThumbnail?: boolean;
}

export interface MockVideoGeneratorResult {
    videoPath: string;

    videoUrl: string;

    thumbnailPath?: string;

    thumbnailUrl?: string;

    durationSeconds: number;

    width: number;

    height: number;

    fileName: string;

    thumbnailFileName?: string;
}

export class MockVideoGenerator {
    private readonly defaultWidth = 1080;

    private readonly defaultHeight = 1920;

    private readonly defaultDurationSeconds = 5;

    async generate(options: MockVideoGeneratorOptions): Promise<MockVideoGeneratorResult> {
        this.validateOptions(options);

        const width = options.width ?? this.defaultWidth;

        const height = options.height ?? this.defaultHeight;

        const durationSeconds = this.normalizeDuration(
            options.durationSeconds ?? this.defaultDurationSeconds,
        );

        const outputDir =
            options.outputDir ??
            path.join(process.cwd(), 'public', 'uploads', 'ai-video', options.projectId, 'scenes');

        await mkdir(outputDir, {
            recursive: true,
        });

        const fileName =
            options.outputFileName ??
            this.createVideoFileName(options.sceneId, options.sceneNumber);

        const videoPath = path.join(outputDir, fileName);

        await this.renderVideo({
            outputPath: videoPath,
            durationSeconds,
            width,
            height,
            title: options.title,
            sceneNumber: options.sceneNumber,
            prompt: options.prompt,
            scriptText: options.scriptText,
        });

        await this.ensureFile(videoPath);

        let thumbnailPath: string | undefined;
        let thumbnailFileName: string | undefined;

        if (options.generateThumbnail !== false) {
            thumbnailFileName = this.createThumbnailFileName(options.sceneId, options.sceneNumber);

            thumbnailPath = path.join(outputDir, thumbnailFileName);

            await this.renderThumbnail({
                videoPath,
                thumbnailPath,
            });

            await this.ensureFile(thumbnailPath);
        }

        const videoUrl = this.toPublicUrl(videoPath, 'video');

        const thumbnailUrl = thumbnailPath
            ? this.toPublicUrl(thumbnailPath, 'thumbnail')
            : undefined;

        return {
            videoPath,
            videoUrl,
            thumbnailPath,
            thumbnailUrl,
            durationSeconds,
            width,
            height,
            fileName,
            thumbnailFileName,
        };
    }

    private validateOptions(options: MockVideoGeneratorOptions): void {
        if (!options.projectId) {
            throw new Error('projectId is required for mock video generation');
        }

        if (
            options.width !== undefined &&
            (!Number.isInteger(options.width) || options.width <= 0)
        ) {
            throw new Error('width must be a positive integer');
        }

        if (
            options.height !== undefined &&
            (!Number.isInteger(options.height) || options.height <= 0)
        ) {
            throw new Error('height must be a positive integer');
        }

        if (
            options.durationSeconds !== undefined &&
            (!Number.isFinite(options.durationSeconds) || options.durationSeconds <= 0)
        ) {
            throw new Error('durationSeconds must be greater than zero');
        }
    }

    private normalizeDuration(durationSeconds: number): number {
        return Math.max(1, Math.min(Math.round(durationSeconds), 60));
    }

    private createVideoFileName(sceneId?: string, sceneNumber?: number): string {
        if (sceneNumber !== undefined) {
            return `scene-${String(sceneNumber).padStart(3, '0')}.mp4`;
        }

        if (sceneId) {
            return `scene-${this.safeFileName(sceneId)}.mp4`;
        }

        return `scene-${Date.now()}.mp4`;
    }

    private createThumbnailFileName(sceneId?: string, sceneNumber?: number): string {
        if (sceneNumber !== undefined) {
            return `scene-${String(sceneNumber).padStart(3, '0')}.jpg`;
        }

        if (sceneId) {
            return `scene-${this.safeFileName(sceneId)}.jpg`;
        }

        return `scene-${Date.now()}.jpg`;
    }

    private async renderVideo(options: {
        outputPath: string;

        durationSeconds: number;

        width: number;

        height: number;

        title?: string;

        sceneNumber?: number;

        prompt?: string;

        scriptText?: string;
    }): Promise<void> {
        const title = this.escapeDrawText(
            options.title ?? `AI Video Scene ${options.sceneNumber ?? ''}`.trim(),
        );

        const sceneLabel =
            options.sceneNumber !== undefined ? `SCENE ${options.sceneNumber}` : 'AI VIDEO';

        const prompt = this.escapeDrawText(this.truncateText(options.prompt ?? '', 100));

        const scriptText = this.escapeDrawText(this.truncateText(options.scriptText ?? '', 140));

        const filter = this.buildVideoFilter({
            width: options.width,
            height: options.height,
            title,
            sceneLabel,
            prompt,
            scriptText,
        });

        const args = [
            '-y',

            '-f',
            'lavfi',

            '-i',
            `color=c=0x101828:s=${options.width}x${options.height}:d=${options.durationSeconds}:r=30`,

            '-vf',
            filter,

            '-t',
            String(options.durationSeconds),

            '-r',
            '30',

            '-c:v',
            'libx264',

            '-preset',
            'medium',

            '-crf',
            '23',

            '-pix_fmt',
            'yuv420p',

            '-movflags',
            '+faststart',

            options.outputPath,
        ];

        await this.runFfmpeg(args);
    }

    private buildVideoFilter(options: {
        width: number;

        height: number;

        title: string;

        sceneLabel: string;

        prompt: string;

        scriptText: string;
    }): string {
        const centerX = Math.floor(options.width / 2);

        const centerY = Math.floor(options.height / 2);

        const titleY = Math.floor(options.height * 0.42);

        const labelY = Math.floor(options.height * 0.34);

        const scriptY = Math.floor(options.height * 0.56);

        const promptY = Math.floor(options.height * 0.7);

        const escapedTitle = this.escapeFilterText(options.title);

        const escapedLabel = this.escapeFilterText(options.sceneLabel);

        const escapedScript = this.escapeFilterText(options.scriptText);

        const escapedPrompt = this.escapeFilterText(options.prompt);

        return [
            `drawbox=x=70:y=70:w=${options.width - 140}:h=${options.height - 140}:color=white@0.08:t=2`,
            `drawbox=x=110:y=${labelY - 55}:w=${options.width - 220}:h=90:color=white@0.06:t=fill`,
            `drawtext=text='${escapedLabel}':fontcolor=white:fontsize=34:x=(w-text_w)/2:y=${labelY}`,
            `drawtext=text='${escapedTitle}':fontcolor=white:fontsize=64:fontweight=bold:x=(w-text_w)/2:y=${titleY}`,
            `drawtext=text='${escapedScript}':fontcolor=white@0.88:fontsize=30:x=(w-text_w)/2:y=${scriptY}:text_align=center`,
            `drawtext=text='${escapedPrompt}':fontcolor=white@0.55:fontsize=24:x=(w-text_w)/2:y=${promptY}:text_align=center`,
            `drawtext=text='KBUILDER AI VIDEO':fontcolor=white@0.35:fontsize=22:x=(w-text_w)/2:y=h-120`,
            `format=yuv420p`,
        ].join(',');
    }

    private async renderThumbnail(options: {
        videoPath: string;

        thumbnailPath: string;
    }): Promise<void> {
        const args = [
            '-y',

            '-ss',
            '0',

            '-i',
            options.videoPath,

            '-frames:v',
            '1',

            '-vf',
            'scale=540:-2',

            '-q:v',
            '2',

            options.thumbnailPath,
        ];

        await this.runFfmpeg(args);
    }

    private runFfmpeg(args: string[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const process = spawn('ffmpeg', args, {
                stdio: ['ignore', 'pipe', 'pipe'],
                windowsHide: true,
            });

            let stderr = '';

            process.stderr.on('data', (chunk: Buffer) => {
                stderr += chunk.toString();
            });

            process.on('error', (error) => {
                reject(new Error(`Failed to start FFmpeg: ${error.message}`));
            });

            process.on('close', (code) => {
                if (code === 0) {
                    resolve();
                    return;
                }

                reject(
                    new Error([`FFmpeg exited with code ${code}`, stderr.slice(-5000)].join(': ')),
                );
            });
        });
    }

    private async ensureFile(filePath: string): Promise<void> {
        try {
            await access(filePath);
        } catch {
            throw new Error(`FFmpeg output file was not created: ${filePath}`);
        }
    }

    private toPublicUrl(filePath: string, type: 'video' | 'thumbnail'): string {
        const publicDirectory = path.join(process.cwd(), 'public');

        const relativePath = path.relative(publicDirectory, filePath);

        const normalizedPath = relativePath.split(path.sep).join('/');

        if (type === 'video') {
            return `/${normalizedPath}`;
        }

        return `/${normalizedPath}`;
    }

    private safeFileName(value: string): string {
        return value
            .replace(/[^a-zA-Z0-9_-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 100);
    }

    private truncateText(value: string, maxLength: number): string {
        if (value.length <= maxLength) {
            return value;
        }

        return `${value.slice(0, maxLength - 3)}...`;
    }

    private escapeDrawText(value: string): string {
        return value
            .replace(/\\/g, '\\\\')
            .replace(/:/g, '\\:')
            .replace(/'/g, "\\'")
            .replace(/\[/g, '\\[')
            .replace(/\]/g, '\\]')
            .replace(/%/g, '\\%')
            .replace(/,/g, '\\,');
    }

    private escapeFilterText(value: string): string {
        return value
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/:/g, '\\:')
            .replace(/,/g, '\\,')
            .replace(/\[/g, '\\[')
            .replace(/\]/g, '\\]')
            .replace(/;/g, '\\;');
    }
}

export const mockVideoGenerator = new MockVideoGenerator();

export default mockVideoGenerator;
