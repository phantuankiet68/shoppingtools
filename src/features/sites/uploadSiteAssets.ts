import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

type UploadSiteAssetsInput = {
    siteId: string;
    logoFile?: File | null;
    faviconFile?: File | null;
};

const MAX_LOGO_SIZE = 10 * 1024 * 1024;
const MAX_FAVICON_SIZE = 5 * 1024 * 1024;
const MAX_INPUT_PIXELS = 40_000_000;

function isSupportedLogoImage(type: string) {
    return ['image/jpeg', 'image/png', 'image/webp'].includes(type);
}

function isSupportedFaviconImage(type: string) {
    return [
        'image/x-icon',
        'image/vnd.microsoft.icon',
        'image/png',
        'image/jpeg',
        'image/webp',
    ].includes(type);
}

async function removePreviousFiles(dir: string, prefix: string) {
    const files = await fs.readdir(dir);

    await Promise.all(
        files
            .filter((file) => file.startsWith(`${prefix}.`) || file.startsWith(`${prefix}-`))
            .map((file) => fs.unlink(path.join(dir, file)).catch(() => undefined)),
    );
}

async function optimizeLogo(file: File) {
    if (!isSupportedLogoImage(file.type)) {
        throw new Error(`Unsupported logo image type: ${file.type}`);
    }

    if (file.size > MAX_LOGO_SIZE) {
        throw new Error('Logo image must be smaller than 10MB.');
    }

    const input = Buffer.from(await file.arrayBuffer());

    return sharp(input, {
        limitInputPixels: MAX_INPUT_PIXELS,
    })
        .rotate()
        .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true,
        })
        .webp({
            quality: 82,
            effort: 4,
        })
        .toBuffer();
}

async function optimizeFavicon(file: File) {
    if (!isSupportedFaviconImage(file.type)) {
        throw new Error(`Unsupported favicon image type: ${file.type}`);
    }

    if (file.size > MAX_FAVICON_SIZE) {
        throw new Error('Favicon image must be smaller than 5MB.');
    }

    const input = Buffer.from(await file.arrayBuffer());

    // Keep ICO files as ICO.
    if (
        file.type === 'image/x-icon' ||
        file.type === 'image/vnd.microsoft.icon' ||
        file.name.toLowerCase().endsWith('.ico')
    ) {
        return {
            buffer: input,
            extension: '.ico',
        };
    }

    const buffer = await sharp(input, {
        limitInputPixels: MAX_INPUT_PIXELS,
    })
        .rotate()
        .resize(256, 256, {
            fit: 'contain',
            withoutEnlargement: true,
        })
        .png({
            compressionLevel: 9,
        })
        .toBuffer();

    return {
        buffer,
        extension: '.png',
    };
}

export async function uploadSiteAssets({ siteId, logoFile, faviconFile }: UploadSiteAssetsInput) {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'sites', siteId);

    await fs.mkdir(uploadDir, {
        recursive: true,
    });

    let logoUrl: string | null = null;
    let faviconUrl: string | null = null;

    if (logoFile?.size) {
        const optimizedLogo = await optimizeLogo(logoFile);

        await removePreviousFiles(uploadDir, 'logo');

        const fileName = 'logo.webp';
        const filePath = path.join(uploadDir, fileName);

        await fs.writeFile(filePath, optimizedLogo);

        logoUrl = `/uploads/sites/${siteId}/${fileName}`;
    }

    if (faviconFile?.size) {
        const optimizedFavicon = await optimizeFavicon(faviconFile);

        await removePreviousFiles(uploadDir, 'favicon');

        const fileName = `favicon${optimizedFavicon.extension}`;
        const filePath = path.join(uploadDir, fileName);

        await fs.writeFile(filePath, optimizedFavicon.buffer);

        faviconUrl = `/uploads/sites/${siteId}/${fileName}`;
    }

    return {
        siteId,
        logoUrl,
        faviconUrl,
    };
}
