import fs from 'fs/promises';
import path from 'path';

type UploadSiteAssetsInput = {
    siteId: string;
    logoFile?: File | null;
    faviconFile?: File | null;
};

export async function uploadSiteAssets({ siteId, logoFile, faviconFile }: UploadSiteAssetsInput) {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'sites', siteId);

    await fs.mkdir(uploadDir, {
        recursive: true,
    });

    let logoUrl: string | null = null;
    let faviconUrl: string | null = null;

    if (logoFile?.size) {
        const ext = path.extname(logoFile.name) || '.png';
        const fileName = `logo-${Date.now()}${ext}`;

        await fs.writeFile(
            path.join(uploadDir, fileName),
            Buffer.from(await logoFile.arrayBuffer()),
        );

        logoUrl = `/uploads/sites/${siteId}/${fileName}`;
    }

    if (faviconFile?.size) {
        const ext = path.extname(faviconFile.name) || '.png';
        const fileName = `favicon-${Date.now()}${ext}`;

        await fs.writeFile(
            path.join(uploadDir, fileName),
            Buffer.from(await faviconFile.arrayBuffer()),
        );

        faviconUrl = `/uploads/sites/${siteId}/${fileName}`;
    }

    return {
        siteId,
        logoUrl,
        faviconUrl,
    };
}
