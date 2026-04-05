import { prisma } from '@/lib/prisma';
import { Prisma, EmailStatus, EmailProvider } from '@/generated/prisma';

interface ListEmailQuery {
  userId: string;
  siteId?: string;
  status?: EmailStatus;
  provider?: EmailProvider;
  templateKey?: string;
  search?: string;
  page: number;
  limit: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.floor(parsed);
}

function parseEmailStatus(value: string | null): EmailStatus | undefined {
  if (!value) return undefined;
  const normalized = value.toUpperCase();
  if (normalized in EmailStatus) {
    return EmailStatus[normalized as keyof typeof EmailStatus];
  }
  return undefined;
}

function parseEmailProvider(value: string | null): EmailProvider | undefined {
  if (!value) return undefined;
  const normalized = value.toUpperCase();
  if (normalized in EmailProvider) {
    return EmailProvider[normalized as keyof typeof EmailProvider];
  }
  return undefined;
}

function buildQuery(request: Request): ListEmailQuery {
  const { searchParams } = new URL(request.url);

  const userId = searchParams.get('userId')?.trim() || '';
  const siteId = searchParams.get('siteId')?.trim() || undefined;
  const templateKey = searchParams.get('templateKey')?.trim() || undefined;
  const search = searchParams.get('search')?.trim() || undefined;
  const status = parseEmailStatus(searchParams.get('status'));
  const provider = parseEmailProvider(searchParams.get('provider'));
  const page = parsePositiveInt(searchParams.get('page'), DEFAULT_PAGE);
  const limit = Math.min(parsePositiveInt(searchParams.get('limit'), DEFAULT_LIMIT), MAX_LIMIT);

  return {
    userId,
    siteId,
    status,
    provider,
    templateKey,
    search,
    page,
    limit,
  };
}

function buildWhereClause(query: ListEmailQuery): Prisma.EmailWhereInput {
  const andConditions: Prisma.EmailWhereInput[] = [{ userId: query.userId }];

  if (query.status) {
    andConditions.push({ status: query.status });
  }

  if (query.provider) {
    andConditions.push({ provider: query.provider });
  }

  if (query.templateKey) {
    andConditions.push({ templateKey: query.templateKey });
  }

  if (query.siteId) {
    andConditions.push({
      logs: {
        some: {
          siteId: query.siteId,
        },
      },
    });
  }

  if (query.search) {
    andConditions.push({
      OR: [
        {
          subject: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          templateKey: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          fromEmail: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          recipients: {
            some: {
              email: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
          },
        }
      ],
    });
  }

  return { AND: andConditions };
}

export async function GET(request: Request) {
  try {
    const query = buildQuery(request);

    if (!query.userId) {
      return Response.json({ message: 'userId is required.' }, { status: 400 });
    }

    const where = buildWhereClause(query);
    const skip = (query.page - 1) * query.limit;

    const [total, emails] = await Promise.all([
      prisma.email.count({ where }),
      prisma.email.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: query.limit,
        select: {
          id: true,
          templateId: true,
          templateKey: true,
          type: true,
          status: true,
          subject: true,
          previewText: true,
          fromName: true,
          fromEmail: true,
          replyToEmail: true,
          provider: true,
          scheduledAt: true,
          sentAt: true,
          totalRecipients: true,
          successCount: true,
          failedCount: true,
          testMode: true,
          lastError: true,
          createdAt: true,
          updatedAt: true,
          template: {
            select: {
              id: true,
              key: true,
              name: true,
            },
          },
          recipients: {
            orderBy: {
              createdAt: 'asc',
            },
            take: 10,
            select: {
              id: true,
              email: true,
              name: true,
              status: true,
              sentAt: true,
              deliveredAt: true,
              openedAt: true,
              clickedAt: true,
              bouncedAt: true,
              error: true,
            },
          },
          _count: {
            select: {
              recipients: true,
              logs: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / query.limit);

    return Response.json(
      {
        items: emails,
        pagination: {
          total,
          page: query.page,
          limit: query.limit,
          totalPages,
          hasNextPage: query.page < totalPages,
          hasPreviousPage: query.page > 1,
        },
        filters: {
          userId: query.userId,
          siteId: query.siteId ?? null,
          status: query.status ?? null,
          provider: query.provider ?? null,
          templateKey: query.templateKey ?? null,
          search: query.search ?? null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/email/list]', error);

    return Response.json(
      {
        message: error instanceof Error ? error.message : 'Internal server error.',
      },
      { status: 500 }
    );
  }
}
