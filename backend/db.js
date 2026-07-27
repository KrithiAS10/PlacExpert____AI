// backend/db.js
// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();

//module.exports = prisma;

import { PrismaClient } from "@prisma/client";
import path from "path";
import { fileURLToPath } from "url";

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Instantiate Prisma
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${path.resolve(__dirname, "../prisma/placexpert.db")}`,
    },
  },
});

// Function to seed initial users if the database is completely empty
async function seedInitialData() {
  try {
    // 1. Simple heartbeat query to verify the database file is accessible
    await prisma.$connect();
    
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      console.log("📥 Shared database empty. Inserting sample testing profiles...");

      // Seed baseline demo profiles
      await prisma.user.createMany({
        data: [
          {
            name: "Rahul Sharma",
            email: "rahul@gmail.com",
            role: "Software Engineer",
            currentDay: 1,
            streak: 3,
          },
          {
            name: "Krithi A.S.",
            email: "krithi@example.com",
            role: "Software Engineer",
            currentDay: 1,
            streak: 5,
          }
        ],
      });

      console.log("✅ Sample data successfully synced via Prisma.");
    } else {
      console.log(`✅ Connected to shared database at root (Found ${userCount} existing users).`);
    }
  } catch (error) {
    console.error("❌ Shared database initialization/seeding error:", error);
  }
}

// Trigger check on script initialization
seedInitialData();