import { prisma } from "@/lib/prisma";

type LogLevel = "info" | "warn" | "error";

export async function addIntegrationLog(integrationId: string, level: LogLevel, message: string, meta: any = {}) {
  await prisma.integrationLog.create({
    data: { integrationId, level, message, meta },
  });
}
