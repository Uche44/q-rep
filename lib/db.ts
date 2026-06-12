import prisma from './prisma';

/**
 * Find a user by wallet address, including all related data.
 * Always uses PostgreSQL — no in-memory fallback.
 */
export async function findUserByWallet(walletAddress: string) {
  const address = walletAddress.toLowerCase();
  return prisma.user.findFirst({
    where: {
      walletAddress: { equals: address, mode: 'insensitive' },
    },
    include: {
      projects: { orderBy: { createdAt: 'desc' } },
      contributions: { orderBy: { createdAt: 'desc' } },
      reputation: true,
    },
  });
}

/**
 * Create a new user in the database.
 */
export async function createUser(
  walletAddress: string,
  qieUserId: string,
  username: string
) {
  const address = walletAddress.toLowerCase();

  // Handle duplicate usernames by appending a short suffix
  let finalUsername = username;
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    finalUsername = `${username}_${address.slice(2, 6)}`;
  }

  return prisma.user.create({
    data: {
      walletAddress: address,
      qieUserId,
      username: finalUsername,
      bio: 'Welcome to the QIE ecosystem reputation passport.',
      skills: ['Web3 Builder'],
      interests: ['Ecosystem Growth'],
    },
    include: {
      projects: { orderBy: { createdAt: 'desc' } },
      contributions: { orderBy: { createdAt: 'desc' } },
      reputation: true,
    },
  });
}

/**
 * Upsert the reputation profile for a user and recalculate rank.
 */
export async function updateUserReputation(
  userId: string,
  score: number,
  level: string,
  projectsCount: number,
  votesCount: number,
  eventsCount: number,
  totalContributions: number
) {
  // Upsert reputation record
  const rep = await prisma.reputationProfile.upsert({
    where: { userId },
    update: {
      score,
      level,
      projectsBuilt: projectsCount,
      votesCast: votesCount,
      eventsAttended: eventsCount,
      contributionsCount: totalContributions,
    },
    create: {
      userId,
      score,
      level,
      projectsBuilt: projectsCount,
      votesCast: votesCount,
      eventsAttended: eventsCount,
      contributionsCount: totalContributions,
    },
  });

  // Recalculate rank: count how many users have a higher score
  const higherCount = await prisma.reputationProfile.count({
    where: { score: { gt: score } },
  });
  const rank = higherCount + 1;

  return prisma.reputationProfile.update({
    where: { id: rep.id },
    data: { rank },
  });
}

/**
 * Create a project record for a user.
 */
export async function createProject(
  userId: string,
  projectData: {
    title: string;
    description: string;
    githubUrl: string;
    demoUrl: string;
    tags: string[];
  }
) {
  return prisma.project.create({
    data: { userId, ...projectData },
  });
}

/**
 * Create a contribution record for a user.
 */
export async function createContribution(
  userId: string,
  contributionData: {
    type: string;
    source: string;
    points: number;
    metadata: string;
  }
) {
  return prisma.contribution.create({
    data: { userId, ...contributionData },
  });
}

/**
 * Retrieve all users with their reputations for the leaderboard, with optional search and level filters.
 */
export async function getEcosystemLeaderboard(search = '', level = '') {
  const userFilters: any = {};
  if (search) {
    userFilters.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { skills: { hasSome: [search] } },
      { bio: { contains: search, mode: 'insensitive' } },
    ];
  }

  const repFilters: any = {};
  if (level) {
    repFilters.level = level;
  }

  const profiles = await prisma.reputationProfile.findMany({
    where: {
      ...repFilters,
      user: userFilters,
    },
    orderBy: { score: 'desc' },
    include: { user: true },
  });

  return profiles.map((p, idx) => ({
    user: p.user,
    rep: { ...p, rank: idx + 1 },
  }));
}

/**
 * Get a user's projects and contributions.
 */
export async function getUserItems(userId: string) {
  const [projects, contributions] = await Promise.all([
    prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.contribution.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
  ]);
  return { projects, contributions };
}
