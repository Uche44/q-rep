import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { syncAndFetchUserProfile } from '@/lib/user-service';

const SESSION_COOKIE_NAME = 'qie_dashboard_session';

export async function POST(req: NextRequest) {
  try {
    // 1. Check Authentication via session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: 'Unauthorized: Please authenticate first' }, { status: 401 });
    }

    const walletAddress = sessionCookie.value.toLowerCase();

    // Find the current user in PostgreSQL
    const currentUser = await prisma.user.findFirst({
      where: {
        walletAddress: { equals: walletAddress, mode: 'insensitive' }
      }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // 2. Parse request body
    const body = await req.json();
    const { username, bio, twitter, linkedin, skills, interests, avatar } = body;

    // Validate username input
    if (username !== undefined) {
      const trimmedUsername = username.trim();
      
      // Check length and format (alphanumeric, underscores, dashes, 3-25 chars)
      const usernameRegex = /^[a-zA-Z0-9_-]{3,25}$/;
      if (!usernameRegex.test(trimmedUsername)) {
        return NextResponse.json({ 
          error: 'Username must be between 3 and 25 characters, and only contain alphanumeric characters, underscores (_), or hyphens (-).' 
        }, { status: 400 });
      }

      // Check uniqueness: check if another user already has this username
      const existingUser = await prisma.user.findFirst({
        where: {
          username: { equals: trimmedUsername, mode: 'insensitive' },
          id: { not: currentUser.id }
        }
      });

      if (existingUser) {
        return NextResponse.json({ error: 'Username is already taken by another ecosystem passport.' }, { status: 400 });
      }
    }

    // 3. Update the database record
    const updateData: any = {};
    if (username !== undefined) updateData.username = username.trim();
    if (bio !== undefined) updateData.bio = bio;
    if (twitter !== undefined) updateData.twitter = twitter ? twitter.trim() : null;
    if (linkedin !== undefined) updateData.linkedin = linkedin ? linkedin.trim() : null;
    if (skills !== undefined && Array.isArray(skills)) updateData.skills = skills;
    if (interests !== undefined && Array.isArray(interests)) updateData.interests = interests;
    if (avatar !== undefined) updateData.avatar = avatar;

    await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData
    });

    // 4. Fetch the synced and recalculated full profile
    const updatedProfile = await syncAndFetchUserProfile(walletAddress);

    return NextResponse.json({ success: true, user: updatedProfile }, { status: 200 });
  } catch (error) {
    console.error('Profile update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
