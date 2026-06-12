import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import qiePassAdapter from '@/lib/qie-pass-adapter';
import prisma from '@/lib/prisma';
import { findUserByWallet, createUser } from '@/lib/db';
import { syncAndFetchUserProfile } from '@/lib/user-service';

const SESSION_COOKIE_NAME = 'qie_dashboard_session';

/**
 * GET: Retrieves the current logged-in user profile if session exists.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const walletAddress = sessionCookie.value;
    const profile = await syncAndFetchUserProfile(walletAddress);

    if (!profile) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json({ authenticated: true, user: profile }, { status: 200 });
  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST: Handles QIE Pass authentication multi-step integration actions:
 * - 'initiate': Start verification request
 * - 'status': Poll request status
 * - 'claim': Claim credentials & finalize login
 * - 'simulate-kyc': Sandbox helper to simulate user KYC approval
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, walletAddress, requestId } = body;

    if (!action) {
      return NextResponse.json({ error: 'Missing action parameter' }, { status: 400 });
    }

    // 1. INITIATE FLOW
    if (action === 'initiate') {
      if (!walletAddress) {
        return NextResponse.json({ error: 'Missing walletAddress' }, { status: 400 });
      }
      const normalizedAddress = walletAddress.toLowerCase();
      const result = await qiePassAdapter.initiateVerification(normalizedAddress);
      return NextResponse.json(result, { status: 200 });
    }

    // 2. STATUS FLOW
    if (action === 'status') {
      if (!requestId) {
        return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
      }
      const result = await qiePassAdapter.getVerificationStatus(requestId);
      return NextResponse.json(result, { status: 200 });
    }

    // 3. CLAIM CREDENTIALS AND FINALIZE LOGIN FLOW
    if (action === 'claim') {
      if (!requestId) {
        return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
      }

      // Claim details
      const claimResult = await qiePassAdapter.claimAndVerify(requestId);
      if (!claimResult.success || !claimResult.profile) {
        return NextResponse.json({ error: claimResult.error || 'Identity claim failed' }, { status: 400 });
      }

      const { qieUserId, walletAddress: userWallet, username, avatarUrl, bio, skills, interests } = claimResult.profile;
      const normalizedAddress = userWallet.toLowerCase();

      // Find or create user in DB/in-memory using DB wrapper
      let user = await findUserByWallet(normalizedAddress);
      if (!user) {
        user = await createUser(normalizedAddress, qieUserId, username);
        
        // Update details if required
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              avatar: avatarUrl,
              bio,
              skills,
              interests,
            },
          });
        } catch (dbError) {
          // If in in-memory fallback, update the object inside db.ts directly
          user.avatar = avatarUrl;
          user.bio = bio;
          user.skills = skills;
          user.interests = interests;
        }
      }

      // Sync user profile & fetch details
      const fullProfile = await syncAndFetchUserProfile(normalizedAddress);

      // Set cookie session
      const cookieStore = await cookies();
      cookieStore.set(SESSION_COOKIE_NAME, normalizedAddress, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({ success: true, user: fullProfile }, { status: 200 });
    }

    // 4. SANDBOX KYC SIMULATOR
    if (action === 'simulate-kyc') {
      if (!requestId) {
        return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
      }
      const success = await qiePassAdapter.simulateKycSuccess(requestId);
      return NextResponse.json({ success }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action parameter' }, { status: 400 });
  } catch (error) {
    console.error('QIE Pass API Route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE: Logs the user out by clearing the session cookie.
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
