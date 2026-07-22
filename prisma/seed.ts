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

  // Create Resources (domain-aware, per-category for smart recommendations)
  // Delete existing resources first to prevent duplicates
  await prisma.resource.deleteMany({});
  await prisma.resource.createMany({
    data: [
      // DSA
      { title: 'Mastering Recursion',              type: 'VIDEO',   category: 'DSA',           url: 'https://www.youtube.com/watch?v=ngCos392W4w',                                     duration: '12m',  isFeatured: true  },
      { title: 'Dynamic Programming Full Course',  type: 'VIDEO',   category: 'DSA',           url: 'https://www.youtube.com/watch?v=oBt53YbR9Kk',                                     duration: '5h',   isFeatured: false },
      { title: 'Graph Algorithms Explained',       type: 'ARTICLE', category: 'DSA',           url: 'https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/',               duration: '20m',  isFeatured: false },
      { title: 'Top 50 LeetCode Problems',         type: 'ARTICLE', category: 'DSA',           url: 'https://leetcode.com/problem-list/top-interview-questions/',                       duration: '—',    isFeatured: false },

      // Database / DBMS
      { title: 'B-Trees in DBMS',                  type: 'ARTICLE', category: 'Database',      url: 'https://www.geeksforgeeks.org/introduction-of-b-tree-2/',                          duration: '8m',   isFeatured: true  },
      { title: 'SQL for Beginners – Full Course',  type: 'VIDEO',   category: 'Database',      url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',                                     duration: '4h',   isFeatured: false },
      { title: 'Database Normalization Guide',     type: 'ARTICLE', category: 'Database',      url: 'https://www.geeksforgeeks.org/normal-forms-in-dbms/',                              duration: '15m',  isFeatured: false },
      { title: 'ACID Properties Explained',        type: 'ARTICLE', category: 'Database',      url: 'https://www.geeksforgeeks.org/acid-properties-in-dbms/',                           duration: '10m',  isFeatured: false },

      // System Design
      { title: 'System Design Primer',             type: 'ARTICLE', category: 'System Design', url: 'https://github.com/donnemartin/system-design-primer',                              duration: '20m',  isFeatured: true  },
      { title: 'System Design Interview – Crack',  type: 'VIDEO',   category: 'System Design', url: 'https://www.youtube.com/watch?v=i53Gi_K3o7I',                                     duration: '1h',   isFeatured: false },
      { title: 'Designing URL Shortener',          type: 'ARTICLE', category: 'System Design', url: 'https://www.geeksforgeeks.org/system-design-url-shortening-service/',               duration: '12m',  isFeatured: false },

      // OS
      { title: 'Deadlock Prevention',              type: 'ARTICLE', category: 'OS',            url: 'https://www.geeksforgeeks.org/deadlock-prevention/',                                duration: '15m',  isFeatured: false },
      { title: 'OS Process Scheduling – Video',    type: 'VIDEO',   category: 'OS',            url: 'https://www.youtube.com/watch?v=2h3eWaPx8SA',                                     duration: '45m',  isFeatured: false },
      { title: 'Virtual Memory Explained',         type: 'ARTICLE', category: 'OS',            url: 'https://www.geeksforgeeks.org/virtual-memory-in-operating-system/',                 duration: '10m',  isFeatured: false },

      // Networking / CN
      { title: 'Computer Networking Full Course',  type: 'VIDEO',   category: 'Networking',    url: 'https://www.youtube.com/watch?v=IPvYjXCsTg8',                                     duration: '3h',   isFeatured: false },
      { title: 'OSI Model Explained Simply',       type: 'ARTICLE', category: 'Networking',    url: 'https://www.geeksforgeeks.org/layers-of-osi-model/',                               duration: '10m',  isFeatured: false },
      { title: 'TCP vs UDP – Deep Dive',           type: 'ARTICLE', category: 'Networking',    url: 'https://www.geeksforgeeks.org/differences-between-tcp-and-udp/',                   duration: '8m',   isFeatured: false },

      // Web Development
      { title: 'React Full Course 2024',           type: 'VIDEO',   category: 'Web',           url: 'https://www.youtube.com/watch?v=4UZrsTqkcW4',                                     duration: '5h',   isFeatured: false },
      { title: 'Node.js Crash Course',             type: 'VIDEO',   category: 'Web',           url: 'https://www.youtube.com/watch?v=fBNz5xF-Kx4',                                     duration: '1.5h', isFeatured: false },
      { title: 'REST API Best Practices',          type: 'ARTICLE', category: 'Web',           url: 'https://www.geeksforgeeks.org/rest-api-introduction/',                             duration: '12m',  isFeatured: false },
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
