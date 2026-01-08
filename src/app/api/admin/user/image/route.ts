import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

export async function PATCH(req: Request) {
  try {
    const user = await requireAdminAuthUser();
    const body = await req.json().catch(() => ({}));
    const image = typeof body.image === "string" ? body.image.trim() : "";

    if (!image) {
      return Response.json({ error: "Image is required" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { image },
      select: { id: true, email: true, image: true },
    });

    return Response.json({ user: updated });
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}
