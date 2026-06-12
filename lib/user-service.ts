import { findUserByWallet, updateUserReputation } from './db';
import { fetchLiveQieActivity } from './qie-blockchain-client';
import { calculateReputationScore, getReputationLevel } from './reputation-engine';

export interface UserReputationSummary {
  id: string;
  username: string;
  walletAddress: string;
  avatar: string;
  bio: string;
  skills: string[];
  interests: string[];
  joinedAt: Date;
  reputation: {
    score: number;
    level: string;
    rank: number;
    projectsBuilt: number;
    votesCast: number;
    eventsAttended: number;
    contributionsCount: number;
    liveBalance: string;
    liveTxCount: number;
    liveContractInteractions: number;
    liveActiveDays: number;
  } | null;
}

/**
 * Synchronizes DB/in-memory records with live blockchain data, recalculates points, and updates the ReputationProfile.
 */
export async function syncAndFetchUserProfile(
  walletAddress: string,
  network: 'mainnet' | 'testnet' = (process.env.QIE_NETWORK as any) || 'mainnet'
): Promise<UserReputationSummary | null> {
  const normalizedAddress = walletAddress.toLowerCase();

  try {
    // 1. Fetch user using our wrapper (handles in-memory fallback automatically)
    const user = await findUserByWallet(normalizedAddress);
    if (!user) return null;

    // 2. Fetch live blockchain activity
    const liveActivity = await fetchLiveQieActivity(normalizedAddress, network);

    // 3. Count DB-based contributions
    const projectsCount = user.projects?.length || 0;
    const dbContributions = user.contributions || [];
    
    const votesCount = liveActivity.governanceParticipation + dbContributions.filter((c: any) => c.type === 'vote').length;
    const eventsCount = liveActivity.validatorActivity + dbContributions.filter((c: any) => c.type === 'event').length;
    const docsCount = dbContributions.filter((c: any) => c.type === 'article' || c.type === 'credential').length;
    const bugsCount = dbContributions.filter((c: any) => c.type === 'bug_report').length;

    // 4. Calculate total score using the engine
    const score = calculateReputationScore({
      txCount: liveActivity.txCount,
      votes: votesCount,
      events: eventsCount,
      projects: projectsCount,
      docs: docsCount,
      bugs: bugsCount,
    });

    const level = getReputationLevel(score);
    const totalContributions = liveActivity.txCount + votesCount + eventsCount + projectsCount + docsCount + bugsCount;

    // 5. Update user reputation profile (re-calculates rank inside)
    const updatedRep = await updateUserReputation(
      user.id,
      score,
      level,
      projectsCount,
      votesCount,
      eventsCount,
      totalContributions
    );

    return {
      id: user.id,
      username: user.username,
      walletAddress: user.walletAddress,
      avatar: user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`,
      bio: user.bio || '',
      skills: user.skills || [],
      interests: user.interests || [],
      joinedAt: user.joinedAt,
      reputation: {
        score,
        level,
        rank: updatedRep?.rank || 1,
        projectsBuilt: projectsCount,
        votesCast: votesCount,
        eventsAttended: eventsCount,
        contributionsCount: totalContributions,
        liveBalance: liveActivity.balance,
        liveTxCount: liveActivity.txCount,
        liveContractInteractions: liveActivity.contractInteractions,
        liveActiveDays: liveActivity.activeDaysCount,
      },
    };
  } catch (error) {
    console.error('Error syncing user profile:', error);
    return null;
  }
}
