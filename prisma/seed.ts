import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/password";
import { UserRole, UserStatus } from "@prisma/client";

async function main() {
  const email = "admin@example.com";
  const passwordHash = await hashPassword("ChangeThisPassword123!");

  await prisma.user.upsert({
    where: { email },
    update: {
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      email,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      passwordHash,
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
