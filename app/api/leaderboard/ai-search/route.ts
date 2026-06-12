import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { searchTalentWithAI, AITalentBuilder } from '@/lib/ai-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required and must be a string' }, { status: 400 });
    }

    // Fetch all users with their reputation profile and projects from PostgreSQL
    const dbUsers = await prisma.user.findMany({
      include: {
        reputation: true,
        projects: true
      }
    });

    const builders: AITalentBuilder[] = dbUsers.map(u => ({
      id: u.id,
      walletAddress: u.walletAddress,
      username: u.username,
      avatar: u.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.username}`,
      bio: u.bio,
      skills: u.skills || [],
      interests: u.interests || [],
      reputation: u.reputation ? {
        score: u.reputation.score,
        level: u.reputation.level,
        rank: u.reputation.rank || 0,
        projectsBuilt: u.reputation.projectsBuilt || 0,
        votesCast: u.reputation.votesCast || 0,
        eventsAttended: u.reputation.eventsAttended || 0,
        contributionsCount: u.reputation.contributionsCount || 0
      } : null,
      projects: u.projects ? u.projects.map(p => ({
        title: p.title,
        description: p.description,
        tags: p.tags || []
      })) : []
    }));

    const searchResult = await searchTalentWithAI(query, builders);

    // Enrich the match results with user details so the directory UI can display beautiful cards
    const enrichedMatches = searchResult.matches.map(match => {
      const user = dbUsers.find(u => u.id === match.userId || u.username.toLowerCase() === match.username.toLowerCase());
      return {
        ...match,
        avatar: user?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${match.username}`,
        bio: user?.bio || '',
        skills: user?.skills || [],
        interests: user?.interests || [],
        walletAddress: user?.walletAddress || '',
      };
    });

    return NextResponse.json({ matches: enrichedMatches }, { status: 200 });
  } catch (error) {
    console.error('AI Talent Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
