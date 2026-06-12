import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { syncAndFetchUserProfile } from '@/lib/user-service';
import { generateReputationInsights } from '@/lib/ai-client';
import { getUserItems } from '@/lib/db';

const SESSION_COOKIE_NAME = 'qie_dashboard_session';

/**
 * POST: Generates personalized reputation summaries and checklist milestones.
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const walletAddress = sessionCookie.value;

    // Fetch and sync profile
    const profile = await syncAndFetchUserProfile(walletAddress);
    if (!profile || !profile.reputation) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Fetch the user's projects and contributions data from DB
    const { projects, contributions } = await getUserItems(profile.id);

    // Call AI client to generate insights
    const insights = await generateReputationInsights({
      username: profile.username,
      score: profile.reputation.score,
      level: profile.reputation.level,
      txCount: profile.reputation.liveTxCount,
      projectsBuilt: profile.reputation.projectsBuilt,
      votesCast: profile.reputation.votesCast,
      eventsAttended: profile.reputation.eventsAttended,
      skills: profile.skills,
      projects,
      contributions,
    });

    return NextResponse.json({ insights }, { status: 200 });
  } catch (error) {
    console.error('AI Insights API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
