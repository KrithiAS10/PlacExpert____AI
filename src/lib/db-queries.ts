import { prisma } from "./prisma";

export async function getUserData(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      roadmaps: {
        include: {
          phases: {
            include: {
              tasks: true
            }
          }
        }
      },
      analytics: true,
      activities: {
        orderBy: { timestamp: 'desc' },
        take: 10
      },
      _count: {
        select: { solvedProblems: true }
      }
    }
  });

  if (!user) return null;

  // Attach totalSolvedProblems for easier access
  return {
    ...user,
    totalSolvedProblems: user._count.solvedProblems
  };
}

export async function getResources() {
  return await prisma.resource.findMany();
}

export async function getAllUsers() {
  return await prisma.user.findMany({
    include: {
      roadmaps: true
    }
  });
}
