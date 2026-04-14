import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

export const runtime = 'nodejs';

function safeImageExtFromType(type: string) {
  if (type === 'image/jpeg') return '.jpg';
  if (type === 'image/png') return '.png';
  if (type === 'image/webp') return '.webp';
  if (type === 'image/gif') return '.gif';
  if (type === 'image/svg+xml') return '.svg';
  return '';
}

function safeBaseName(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'No file uploaded',
        },
        { status: 400 }
      );
    }

    const ext = safeImageExtFromType(file.type);
    if (!ext) {
      return NextResponse.json(
        {
          success: false,
          message: `Unsupported image type: ${file.type}`,
        },
        { status: 400 }
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: `${file.name} is too large. Max size is 5MB`,
        },
        { status: 400 }
      );
    }

    const dir = path.join(process.cwd(), 'public', 'assets', 'templates');
    await fs.mkdir(dir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const originalName =
      typeof file.name === 'string' && file.name.trim()
        ? file.name.trim()
        : 'template';

    const baseName = safeBaseName(originalName.replace(/\.[^.]+$/, '')) || 'template';
    const fileName = `${baseName}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    const fullPath = path.join(dir, fileName);

    await fs.writeFile(fullPath, buffer);

    return NextResponse.json({
      success: true,
      url: `/assets/templates/${fileName}`,
      fileName,
    });
  } catch (error: unknown) {
    console.error('POST /api/platform/templates/upload error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed',
      },
      { status: 500 }
    );
  }
}