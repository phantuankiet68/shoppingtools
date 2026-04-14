import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { REGISTRY } from "@/lib/ui-builder/registry";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonObject = { [key: string]: JsonValue };

type BlockItem = {
  id?: string;
  kind?: string;
  props?: Record<string, unknown>;
};

type TemplateBlocks = {
  items?: BlockItem[];
};

type TemplateListItem = {
  id: string;
  code: string;
  label: string;
  kind: string;
  group: {
    id: string;
    code: string;
    name: string;
  };
  children: string[];
  rawChildren: string[];
  previewImageUrl: string | null;
  initialProps: JsonValue | null;
  isActive: boolean;
  isPublic: boolean;
  sortOrder: number;
  status: string;
  minTier: string;
  minTierLevel: number;
  createdAt: string;
  updatedAt: string;
};

function parseChildrenFromBlocks(blocks: unknown): string[] {
  if (!blocks || typeof blocks !== "object" || Array.isArray(blocks)) {
    return [];
  }

  const raw = blocks as TemplateBlocks;

  if (!Array.isArray(raw.items)) {
    return [];
  }

  return raw.items
    .map((item) => item?.kind)
    .filter((kind): kind is string => typeof kind === "string" && kind.trim().length > 0);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim() || "";
    const groupCode = searchParams.get("groupCode")?.trim() || "";
    const groupName = searchParams.get("groupName")?.trim() || "";
    const includeInactive = searchParams.get("includeInactive") === "true";
    const includeArchived = searchParams.get("includeArchived") === "true";
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const registryKindSet = new Set(REGISTRY.map((item) => item.kind));

    const rows = await prisma.templateCatalog.findMany({
      where: {
        ...(includeDeleted ? {} : { deletedAt: null }),
        ...(includeInactive ? {} : { isActive: true }),
        ...(includeArchived ? {} : { status: { not: "ARCHIVED" as const } }),
        ...(groupCode
          ? {
              group: {
                code: {
                  equals: groupCode,
                },
              },
            }
          : {}),
        ...(groupName
          ? {
              group: {
                name: {
                  equals: groupName,
                },
              },
            }
          : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q } },
                { code: { contains: q } },
                { kind: { contains: q } },
                { group: { name: { contains: q } } },
                { group: { code: { contains: q } } },
              ],
            }
          : {}),
      },
      orderBy: [{ sortOrder: "desc" }, { updatedAt: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
        kind: true,
        previewImageUrl: true,
        initialProps: true,
        blocks: true,
        isActive: true,
        isPublic: true,
        sortOrder: true,
        status: true,
        minTier: true,
        minTierLevel: true,
        createdAt: true,
        updatedAt: true,
        group: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    const data: TemplateListItem[] = rows.map((row) => {
      const blockKinds = parseChildrenFromBlocks(row.blocks);
      const rawChildren = blockKinds.length > 0 ? blockKinds : [row.kind];
      const uniqueChildren = Array.from(
        new Set(rawChildren.filter((kind): kind is string => typeof kind === "string" && kind.trim().length > 0)),
      );

      return {
        id: row.id,
        code: row.code,
        label: row.name,
        kind: row.kind,
        group: {
          id: row.group.id,
          code: row.group.code,
          name: row.group.name,
        },
        children: uniqueChildren,
        rawChildren,
        previewImageUrl: row.previewImageUrl,
        initialProps: (row.initialProps as JsonValue | null) ?? null,
        isActive: row.isActive,
        isPublic: row.isPublic,
        sortOrder: row.sortOrder,
        status: String(row.status),
        minTier: String(row.minTier),
        minTierLevel: row.minTierLevel,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      };
    });

    const unmatchedKinds = Array.from(
      new Set(
        data.flatMap((item) => item.children).filter((kind) => !registryKindSet.has(kind)),
      ),
    );

    return Response.json({
      success: true,
      data,
      meta: {
        total: data.length,
        totalRows: rows.length,
        registryCount: registryKindSet.size,
        unmatchedKinds,
      },
    });
  } catch (error) {
    console.error("GET /api/platform/templates/template-list error:", error);

    return Response.json(
      {
        success: false,
        message: "Không thể tải danh sách template",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}