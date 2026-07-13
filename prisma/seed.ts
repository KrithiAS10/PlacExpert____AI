import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create a default user
  const user = await prisma.user.upsert({
    where: { email: 'krithi@example.com' },
    update: {},
    create: {
      name: 'Krithi A S',
      email: 'krithi@example.com',
      role: 'ADMIN',
      currentDay: 15,
      readinessScore: 3.2,
      streak: 12,
    },
  });

  // Create Roadmap
  await prisma.roadmap.create({
    data: {
      title: 'SDE Preparation 2026',
      description: 'Comprehensive 45-day roadmap for top tech roles.',
      userId: user.id,
      phases: {
        create: [
          {
            title: 'Week 1-2: Core Subjects',
            order: 1,
            tasks: {
              create: [
                { title: 'OS: Process Management', day: 1, status: 'COMPLETED' },
                { title: 'DBMS: Normalization', day: 5, status: 'COMPLETED' },
              ]
            }
          },
          {
            title: 'Week 3: DSA Basics',
            order: 2,
            tasks: {
              create: [
                { title: 'Arrays: Traversal & Search', day: 15, status: 'PENDING' },
                { title: 'Strings: Palindrome & Anagram', day: 16, status: 'PENDING' },
              ]
            }
          }
        ]
      }
    }
  });

  // Create Resources
  await prisma.resource.createMany({
    data: [
      { title: 'Mastering Recursion', type: 'VIDEO', category: 'DSA', url: '#', duration: '12m', isFeatured: true },
      { title: 'B-Trees in DBMS', type: 'ARTICLE', category: 'Database', url: '#', duration: '8m', isFeatured: true },
      { title: 'Deadlock Prevention', type: 'ARTICLE', category: 'OS', url: '#', duration: '15m' },
    ]
  });

  // Create Analytics
  await prisma.analytics.createMany({
    data: [
      { userId: user.id, metric: 'Readiness', value: 3.2, date: new Date('2026-05-01') },
      { userId: user.id, metric: 'Readiness', value: 4.5, date: new Date('2026-05-08') },
    ]
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
