import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
      passwordHash,
    },
  });

  const existingBoard = await prisma.board.findFirst({
    where: { ownerId: user.id, title: "Demo Board" },
  });

  if (!existingBoard) {
    await prisma.board.create({
      data: {
        title: "Demo Board",
        ownerId: user.id,
        columns: {
          create: [
            {
              title: "To Do",
              position: 1,
              cards: {
                create: [
                  { title: "Set up project", position: 1 },
                  { title: "Design schema", position: 2 },
                ],
              },
            },
            {
              title: "In Progress",
              position: 2,
              cards: { create: [{ title: "Build API", position: 1 }] },
            },
            {
              title: "Done",
              position: 3,
              cards: { create: [] },
            },
          ],
        },
      },
    });
  }

  console.log("Seed complete. Demo login: demo@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
