import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, message: "Method Not Allowed" });
  }

  try {
    const limit = Math.min(Number(req.query.limit || 30), 100);
    const skip = Math.max(Number(req.query.skip || 0), 0);

    const status = String(req.query.status || "").trim();
    const type = String(req.query.type || "").trim();
    const q = String(req.query.q || "").trim();

    const admin = { id: "YOUR_ADMIN_USER_ID" };

    const where: any = {
      userId: admin.id,
    };

    if (status) where.status = status;
    if (type) where.type = type;

    if (q) {
      where.OR = [
        { subject: { contains: q, mode: "insensitive" } },
        { templateKey: { contains: q, mode: "insensitive" } },
        { fromEmail: { contains: q, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.email.findMany({
        where,
        orderBy: [{ createdAt: "desc" }],
        skip,
        take: limit,
        select: {
          id: true,
          userId: true,
          type: true,
          status: true,
          subject: true,
          previewText: true,
          templateKey: true,
          fromName: true,
          fromEmail: true,
          scheduledAt: true,
          sentAt: true,
          totalRecipients: true,
          successCount: true,
          failedCount: true,
          lastError: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { recipients: true } },
        },
      }),
      prisma.email.count({ where }),
    ]);

    return res.status(200).json({
      ok: true,
      data: {
        items,
        pagination: { total, skip, limit },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      message: error?.message || "Failed to load emails",
    });
  }
}
