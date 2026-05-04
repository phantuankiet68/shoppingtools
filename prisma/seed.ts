import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/password";
import { SystemRole, UserStatus } from "../src/generated/prisma/client";

async function main() {
  const users = [
    {
      email: "admin@example.com",
      password: "ChangeThisPassword123!",
      role: SystemRole.ADMIN,
    },
    {
      email: "superadmin@example.com",
      password: "phantuankiet@123",
      role: SystemRole.ADMIN,
    },
    {
      email: "admin1@example.com",
      password: "admin@123",
      role: SystemRole.ADMIN,
    },
    {
      email: "admin2@example.com",
      password: "123456",
      role: SystemRole.ADMIN,
    },
  ];

  for (const user of users) {
    const passwordHash = await hashPassword(user.password);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        systemRole: user.role,
        status: UserStatus.ACTIVE,
        passwordHash,
      },
      create: {
        email: user.email,
        systemRole: user.role,
        status: UserStatus.ACTIVE,
        passwordHash,
      },
    });
  }

  console.log("✅ Seed users success");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });