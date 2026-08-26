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

function isSupportedImage(type: string) {
    return ['image/jpeg', 'image/png', 'image/webp'].includes(type);
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
    if (!isSupportedImage(file.type)) {
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
    if (!isSupportedImage(file.type)) {
        throw new Error(`Unsupported favicon image type: ${file.type}`);
    }

    if (file.size > MAX_FAVICON_SIZE) {
        throw new Error('Favicon image must be smaller than 5MB.');
    }

    const input = Buffer.from(await file.arrayBuffer());

    return sharp(input, {
        limitInputPixels: MAX_INPUT_PIXELS,
    })
        .rotate()
        .resize(256, 256, {
            fit: 'contain',
            withoutEnlargement: true,
        })
        .webp({
            quality: 85,
            effort: 4,
        })
        .toBuffer();
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

        const fileName = 'favicon.webp';
        const filePath = path.join(uploadDir, fileName);

        await fs.writeFile(filePath, optimizedFavicon);

        faviconUrl = `/uploads/sites/${siteId}/${fileName}`;
    }

    return {
        siteId,
        logoUrl,
        faviconUrl,
    };
}
