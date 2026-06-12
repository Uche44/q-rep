import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { findUserByWallet, createProject, createContribution, getUserItems } from '@/lib/db';
import { syncAndFetchUserProfile } from '@/lib/user-service';
import { DEFAULT_WEIGHTS } from '@/lib/reputation-engine';

const SESSION_COOKIE_NAME = 'qie_dashboard_session';

/**
 * GET: Retrieves the user's specific off-chain and on-chain contributions.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const walletAddress = sessionCookie.value;
    const user = await findUserByWallet(walletAddress);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Retrieve projects and contributions via DB wrapper (handles fallback automatically)
    const items = await getUserItems(user.id);

    return NextResponse.json({
      contributions: items.contributions,
      projects: items.projects,
    });
  } catch (error) {
    console.error('Contributions GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST: Logs a new contribution (project, article, bug report) and updates the reputation score.
 */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const walletAddress = sessionCookie.value;
    const body = await req.json();
    const { type, source, title, description, githubUrl, demoUrl, tags } = body;

    if (!type || !source) {
      return NextResponse.json({ error: 'Missing type or source parameters' }, { status: 400 });
    }

    // Resolve user
    const user = await findUserByWallet(walletAddress);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine reputation points based on weights
    let points = 0;
    switch (type) {
      case 'project':
        points = DEFAULT_WEIGHTS.projectWeight; // Default 50
        break;
      case 'article':
      case 'credential':
        points = DEFAULT_WEIGHTS.docWeight; // Default 20
        break;
      case 'bug_report':
        points = DEFAULT_WEIGHTS.bugWeight; // Default 15
        break;
      case 'event':
        points = DEFAULT_WEIGHTS.eventWeight; // Default 10
        break;
      case 'vote':
        points = DEFAULT_WEIGHTS.voteWeight; // Default 5
        break;
      default:
        points = 2; // general default fallback
    }

    // Create DB records using DB wrapper (handles fallbacks)
    if (type === 'project' && title) {
      await createProject(user.id, {
        title,
        description: description || 'No project description provided.',
        githubUrl: githubUrl || '',
        demoUrl: demoUrl || '',
        tags: tags || ['Ecosystem Build'],
      });
    }

    const contribution = await createContribution(user.id, {
      type,
      source,
      points,
      metadata: JSON.stringify({ title, description, githubUrl, demoUrl, tags }),
    });

    // Recalculate full reputation profile dynamically
    const updatedProfile = await syncAndFetchUserProfile(walletAddress);

    return NextResponse.json({
      success: true,
      contribution,
      user: updatedProfile,
    });
  } catch (error) {
    console.error('Contributions POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
