// prisma/seedAllRolesFromRoadmapsJS.mjs
// Run with: node prisma/seedAllRolesFromRoadmapsJS.mjs
//
// Reads every role currently defined in roadmaps.js and inserts it into
// the RoadmapTemplate table in placexpert.db — but SKIPS any role that
// already has rows in the database, so it's always safe to re-run.

import { PrismaClient } from "@prisma/client";
import { ROLE_ROADMAPS } from "../backend/constants/roadmaps.js"; // adjust path if needed

const prisma = new PrismaClient();

async function main() {
  const allRoleNames = Object.keys(ROLE_ROADMAPS);
  console.log(`Found ${allRoleNames.length} roles in roadmaps.js:`, allRoleNames);

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const roleName of allRoleNames) {
    const tasks = ROLE_ROADMAPS[roleName];

    if (!tasks || tasks.length === 0) {
      console.log(`⚠️ "${roleName}" has no tasks defined. Skipping.`);
      continue;
    }

    // Per-role duplicate check — skip if this role already has rows in the DB
    const existingCount = await prisma.roadmapTemplate.count({
      where: { roleName },
    });

    if (existingCount > 0) {
      console.log(`⏭️  "${roleName}" already has ${existingCount} rows in RoadmapTemplate. Skipping.`);
      totalSkipped++;
      continue;
    }

    // Insert all tasks for this role
    for (const task of tasks) {
      await prisma.roadmapTemplate.create({
        data: {
          roleName,
          dayNumber: task.dayNumber,
          title: task.title,
          category: task.category || "General",
          resourceName: task.resourceName || "Explore Resource",
          resourceLink: task.resourceLink || "https://roadmap.sh",
        },
      });
    }

    console.log(`✅ "${roleName}" seeded (${tasks.length} tasks).`);
    totalInserted++;
  }

  const total = await prisma.roadmapTemplate.count();
  console.log(`\n🎉 Done. Inserted ${totalInserted} new role(s), skipped ${totalSkipped} existing role(s).`);
  console.log(`RoadmapTemplate table now has ${total} total rows.`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
