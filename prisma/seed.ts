import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/password";
import { SystemRole, UserStatus } from "@prisma/client";

async function main() {
  const email = "admin@example.com";
  const passwordHash = await hashPassword("ChangeThisPassword123!");

  await prisma.user.upsert({
    where: { email },
    update: {
      systemRole: SystemRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      email,
      systemRole: SystemRole.ADMIN,
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
