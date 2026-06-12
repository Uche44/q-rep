import { NextRequest, NextResponse } from 'next/server';
import { getEcosystemLeaderboard } from '@/lib/db';

/**
 * GET: Fetches the public ecosystem leaderboard and directory.
 * Supports query params: ?search=usernameOrSkill&level=Gold
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const level = searchParams.get('level') || '';

    // Fetch ranked profiles via DB wrapper (handles fallback automatically)
    const profiles = await getEcosystemLeaderboard(search, level);

    const leaderboard = profiles.map((p: any) => ({
      username: p.user.username,
      walletAddress: p.user.walletAddress,
      avatar: p.user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${p.user.username}`,
      bio: p.user.bio || '',
      twitter: p.user.twitter || '',
      linkedin: p.user.linkedin || '',
      skills: p.user.skills || [],
      interests: p.user.interests || [],
      joinedAt: p.user.joinedAt,
      reputation: {
        score: p.rep.score,
        level: p.rep.level,
        rank: p.rep.rank,
        projectsBuilt: p.rep.projectsBuilt || 0,
        votesCast: p.rep.votesCast || 0,
        eventsAttended: p.rep.eventsAttended || 0,
        contributionsCount: p.rep.contributionsCount || 0,
      },
    }));

    return NextResponse.json({ leaderboard }, { status: 200 });
  } catch (error) {
    console.error('Leaderboard GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
