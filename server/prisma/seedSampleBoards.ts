import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CardSeed {
  title: string;
  description?: string;
}

interface ColumnSeed {
  title: string;
  cards: CardSeed[];
}

interface BoardSeed {
  title: string;
  columns: ColumnSeed[];
}

const boards: BoardSeed[] = [
  {
    title: "Product Launch",
    columns: [
      {
        title: "Backlog",
        cards: [
          { title: "Define launch success metrics" },
          {
            title: "Draft press release",
            description: "Coordinate with PR agency on embargo date.",
          },
          { title: "Line up launch day influencers" },
        ],
      },
      {
        title: "In Progress",
        cards: [
          { title: "Finalize pricing tiers" },
          {
            title: "Build landing page",
            description: "Hero section + pricing + FAQ.",
          },
        ],
      },
      {
        title: "Review",
        cards: [{ title: "Legal review of terms of service" }],
      },
      {
        title: "Done",
        cards: [
          { title: "Set up analytics tracking" },
          { title: "Reserve social handles" },
        ],
      },
    ],
  },
  {
    title: "Website Redesign",
    columns: [
      {
        title: "To Do",
        cards: [
          { title: "Audit current site content" },
          { title: "Competitor design research" },
          { title: "Create sitemap v2" },
        ],
      },
      {
        title: "Design",
        cards: [
          {
            title: "Wireframe homepage",
            description: "Mobile-first, 3 hero variants.",
          },
          { title: "Design system color palette" },
        ],
      },
      {
        title: "Development",
        cards: [{ title: "Set up new CMS" }, { title: "Migrate blog posts" }],
      },
      {
        title: "Launched",
        cards: [{ title: "Old site archived" }],
      },
    ],
  },
  {
    title: "Marketing Campaign Q4",
    columns: [
      {
        title: "Ideas",
        cards: [
          { title: "Holiday email series" },
          { title: "Partner co-marketing webinar" },
        ],
      },
      {
        title: "In Progress",
        cards: [
          {
            title: "Design ad creatives",
            description: "Instagram + LinkedIn formats.",
          },
          { title: "Write blog: year in review" },
          { title: "Schedule social calendar" },
        ],
      },
      {
        title: "Scheduled",
        cards: [{ title: "Black Friday promo email" }],
      },
      {
        title: "Complete",
        cards: [{ title: "Q3 retrospective report" }],
      },
    ],
  },
  {
    title: "Mobile App Sprint 12",
    columns: [
      {
        title: "Sprint Backlog",
        cards: [
          { title: "Offline mode caching" },
          { title: "Push notification preferences screen" },
        ],
      },
      {
        title: "In Progress",
        cards: [
          {
            title: "Fix crash on iOS 18 share sheet",
            description: "Repro rate ~4% of sessions.",
          },
          { title: "Dark mode polish" },
        ],
      },
      {
        title: "Code Review",
        cards: [{ title: "Biometric login PR #482" }],
      },
      {
        title: "Done",
        cards: [
          { title: "Upgrade React Native to 0.75" },
          { title: "App icon refresh" },
        ],
      },
    ],
  },
  {
    title: "Bug Triage",
    columns: [
      {
        title: "New",
        cards: [
          { title: "Login button unresponsive on Safari" },
          { title: "Timezone off by one hour in reports" },
          { title: "Export CSV missing header row" },
        ],
      },
      {
        title: "Confirmed",
        cards: [{ title: "Memory leak in dashboard chart widget" }],
      },
      {
        title: "Fix In Progress",
        cards: [{ title: "Race condition on concurrent card moves" }],
      },
      {
        title: "Resolved",
        cards: [
          { title: "Broken password reset link" },
          { title: "Duplicate webhook events" },
        ],
      },
    ],
  },
  {
    title: "Personal Tasks",
    columns: [
      {
        title: "To Do",
        cards: [
          { title: "Renew passport" },
          { title: "Book dentist appointment" },
          { title: "Plan weekend trip" },
        ],
      },
      {
        title: "This Week",
        cards: [
          { title: "Grocery shopping" },
          { title: "Finish tax paperwork" },
        ],
      },
      {
        title: "Done",
        cards: [{ title: "Car oil change" }],
      },
    ],
  },
  {
    title: "New Hire Onboarding",
    columns: [
      {
        title: "Before Day 1",
        cards: [
          { title: "Order laptop and equipment" },
          { title: "Create accounts (email, Slack, GitHub)" },
        ],
      },
      {
        title: "Week 1",
        cards: [
          {
            title: "Intro meetings with team",
            description: "30 min each with 5 teammates.",
          },
          { title: "Complete compliance training" },
          { title: "Set up local dev environment" },
        ],
      },
      {
        title: "30-Day Check-in",
        cards: [{ title: "Schedule 1:1 with manager" }],
      },
      {
        title: "Completed",
        cards: [{ title: "Signed offer letter" }],
      },
    ],
  },
];

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "demo@example.com" },
  });
  if (!user) {
    throw new Error("Demo user not found. Run `npm run prisma:seed` first.");
  }

  for (const boardSeed of boards) {
    const existing = await prisma.board.findFirst({
      where: { ownerId: user.id, title: boardSeed.title },
    });
    if (existing) {
      console.log(`Skipping "${boardSeed.title}" (already exists)`);
      continue;
    }

    await prisma.board.create({
      data: {
        title: boardSeed.title,
        ownerId: user.id,
        columns: {
          create: boardSeed.columns.map((col, colIndex) => ({
            title: col.title,
            position: colIndex + 1,
            cards: {
              create: col.cards.map((card, cardIndex) => ({
                title: card.title,
                description: card.description,
                position: cardIndex + 1,
              })),
            },
          })),
        },
      },
    });

    console.log(`Created board "${boardSeed.title}"`);
  }

  console.log("Sample boards seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
