'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Cpu, Activity, Award, User, ArrowRight, Zap, Globe, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  // Modal & Auth States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // QIE Pass Integration States
  const [verificationReq, setVerificationReq] = useState<any>(null);
  const [kycSimulating, setKycSimulating] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check auth state on load
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/qie-pass');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setIsLoggedIn(true);
            setCurrentUser(data.user);
          }
        }
      } catch (err) {
        console.error('Check auth error:', err);
      }
    }
    checkAuth();
    return () => stopPolling();
  }, []);

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const startPolling = (requestId: string) => {
    stopPolling();
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/auth/qie-pass', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'status', requestId }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setVerificationReq((prev: any) => ({ ...prev, status: data.status }));

            // If status is verified, auto-trigger credential claim
            if (data.status === 'verified') {
              stopPolling();
              handleClaimCredentials(requestId);
            }
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2500); // Poll every 2.5s
  };

  const handleConnectSimulator = async (address: string) => {
    setLoading(true);
    setError('');
    setVerificationReq(null);
    stopPolling();

    try {
      // Step 1: Initiate verification request via QIE Pass API
      const response = await fetch('/api/auth/qie-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initiate',
          walletAddress: address,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setVerificationReq(data);

        if (data.status === 'verified') {
          // User already verified and consented -> claim immediately
          handleClaimCredentials(data.requestId);
        } else {
          // If a real redirectUrl is returned, open it in a new tab
          if (data.redirectUrl && !data.redirectUrl.startsWith('/')) {
            window.open(data.redirectUrl, '_blank');
          }
          // Poll for approval status (KYC onboarding or Consent pending)
          startPolling(data.requestId);
        }
      } else {
        setError(data.error || 'Identity request failed.');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Connection timed out. QIE Pass gateway is unreachable.');
      setLoading(false);
    }
  };

  const handleClaimCredentials = async (requestId: string) => {
    stopPolling(); // Always stop polling before claiming
    setLoading(true);
    try {
      // Step 3: Claim data and login
      const response = await fetch('/api/auth/qie-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'claim',
          requestId,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setIsLoggedIn(true);
        setCurrentUser(data.user);
        setIsModalOpen(false);
        router.push('/dashboard');
      } else {
        setError(data.error || 'Failed to verify claimed credentials.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to assert claimed credential tokens.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateKycSuccess = async () => {
    if (!verificationReq?.requestId) return;
    setKycSimulating(true);
    try {
      await fetch('/api/auth/qie-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate-kyc',
          requestId: verificationReq.requestId,
        }),
      });
      // Polling will detect the change in 2.5 seconds, but let's poll immediately for UX
      const statusRes = await fetch('/api/auth/qie-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status', requestId: verificationReq.requestId }),
      });
      const statusData = await statusRes.json();
      if (statusRes.ok && statusData.status === 'verified') {
        stopPolling();
        handleClaimCredentials(verificationReq.requestId);
      }
    } catch (err) {
      console.error('Simulate KYC error:', err);
    } finally {
      setKycSimulating(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch('/api/auth/qie-pass', { method: 'DELETE' });
      setIsLoggedIn(false);
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleCloseModal = () => {
    stopPolling();
    setVerificationReq(null);
    setIsModalOpen(false);
    setLoading(false);
    setError('');
  };

  // Pre-configured simulation profiles
  const simulatedProfiles = [
    {
      label: 'Core Protocol Builder (Pre-Verified KYC)',
      address: '0x1990a424e0f523420c979a18a172424039111111',
      desc: 'Already verified with QIE Pass. Direct sign-in via consent polling.',
    },
    {
      label: 'New Developer (Needs KYC Onboarding)',
      address: '0x83af2371141498d89fefe700d5a22f08ea38f15',
      desc: 'Triggers QIE Pass onboarding flow and redirects to KYC validation.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HEADER */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-white/5 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-qie-pink to-indigo-600 flex items-center justify-center p-1">
            <span className="font-display font-black text-black text-sm">Q</span>
          </div>
          <span className="font-display font-semibold tracking-wider text-sm hidden sm:inline">QRep</span>
        </div>

        <nav className="flex items-center gap-6">
          <Link href="/directory" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Ecosystem Directory
          </Link>
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-medium text-qie-pink hover:underline">
                My Dashboard
              </Link>
              <button
                onClick={handleDisconnect}
                className="text-xs border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                id="btn-logout"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-sm bg-white text-black hover:bg-zinc-200 font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
              id="btn-connect"
            >
              Connect QIE Pass
            </button>
          )}
        </nav>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative px-6 py-20 lg:py-32 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 w-full animate-fade-in-up">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-qie-pink/20 bg-qie-pink-dim text-xs font-semibold text-qie-pink tracking-wider">
            <Zap className="w-3.5 h-3.5" /> REPUTATION LAYER FOR QIE BLOCKCHAIN
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Prove Your Impact. <br />
            <span className="bg-gradient-to-r from-white via-zinc-200 to-qie-pink bg-clip-text text-transparent">
              Claim Your Passport.
            </span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-lg mx-auto lg:mx-0">
            A verified ecosystem directory for QIE developers and builders. Synchronize your wallet transactions, contract deployments, and governance activity into a dynamic reputation profile.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 bg-qie-pink text-black hover:bg-qie-pink/90 font-semibold px-6 py-3.5 rounded-xl transition-all shadow-md group"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-qie-pink text-black hover:bg-qie-pink/90 font-semibold px-6 py-3.5 rounded-xl transition-all shadow-md group cursor-pointer"
              >
                Connect via QIE Pass <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
            <Link
              href="/directory"
              className="border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold px-6 py-3.5 rounded-xl transition-all"
            >
              Browse Leaderboard
            </Link>
          </div>
        </div>

        {/* Visual Hero Mockup (Passport Card Preview) */}
        <div className="flex-1 w-full max-w-md relative">
          <div className="absolute inset-0 bg-qie-pink/20 rounded-3xl blur-3xl opacity-30 animate-pulse-glow" />
          <div className="relative glass-card rounded-2xl p-6 border border-white/10 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-qie-pink" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm">qie_builder_a424e</h3>
                  <p className="text-xs text-zinc-500">0x1990...1111</p>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-500">
                Gold Builder
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-zinc-500">Reputation Score</p>
                <p className="font-display font-extrabold text-2xl text-qie-pink">542</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-zinc-500">Ecosystem Rank</p>
                <p className="font-display font-extrabold text-2xl text-white">#12</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-xs font-semibold text-zinc-400">Activity Overview</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-qie-pink" /> Live Txs</span>
                  <span className="font-mono font-semibold">1,248</span>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-zinc-400" /> Projects Built</span>
                  <span className="font-mono font-semibold">4</span>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-zinc-400" /> Votes Cast</span>
                  <span className="font-mono font-semibold">23</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-xs text-zinc-400 flex items-start gap-2.5">
              <span className="text-qie-pink">✨</span>
              <p>AI: "Strong technical builder. Your smart contract interactions put you in the top 15%."</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SCORING MECHANICS */}
      <section className="px-6 py-20 bg-surface/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-xl mx-auto">
            <h2 className="font-display text-3xl font-bold tracking-tight">Traceable Scoring Engine</h2>
            <p className="text-zinc-400 text-sm">
              Your reputation score is calculated deterministically from verified activities. No black boxes, no arbitrary ratings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-xl p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-qie-pink-dim border border-qie-pink/20 flex items-center justify-center text-qie-pink">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-lg">Build Projects</h3>
              <p className="text-zinc-400 text-sm">
                Deploy smart contracts or host open-source projects. Each verified build yields the highest weight.
              </p>
              <div className="font-mono text-xs text-qie-pink font-bold">+50 Points per Project</div>
            </div>

            <div className="glass-card rounded-xl p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-lg">Govern & Vote</h3>
              <p className="text-zinc-400 text-sm">
                Vote on DAO proposals, sponsor upgrades, and support ecosystem governance validators.
              </p>
              <div className="font-mono text-xs text-indigo-400 font-bold">+5 Points per Vote</div>
            </div>

            <div className="glass-card rounded-xl p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-lg">Transact Live</h3>
              <p className="text-zinc-400 text-sm">
                Frequent wallet transactions, staking delegations, and live contract calls display active node usage.
              </p>
              <div className="font-mono text-xs text-emerald-400 font-bold">+1 Point per Live Transaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="mt-auto border-t border-white/5 px-6 py-8 bg-background flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <p>© 2026 QIE Ecosystem Reputation Passport. Built for QIE Blockchain.</p>
        <div className="flex gap-6">
          <Link href="/directory" className="hover:text-zinc-300">Leaderboard Directory</Link>
          <a href="https://docs.qie.digital" target="_blank" rel="noreferrer" className="hover:text-zinc-300">Docs</a>
          <a href="https://mainnet.qie.digital" target="_blank" rel="noreferrer" className="hover:text-zinc-300">Explorer</a>
        </div>
      </footer>

      {/* QIE PASS AUTH INTEGRATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 border border-white/10 space-y-6 relative animate-fade-in-up">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white text-lg font-bold"
            >
              ×
            </button>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-qie-pink-dim border border-qie-pink/20 flex items-center justify-center text-qie-pink">
                <Globe className="w-5 h-5" />
              </div>
              <h2 className="font-display text-xl font-bold">Connect via QIE Pass</h2>
              <p className="text-xs text-zinc-400">
                Sign in using the official QIE Pass L1 Identity Provider. This triggers a privacy-preserving credential verification request.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500">
                {error}
              </div>
            )}

            {/* FLOW 1: AUTH LOGGING / VERIFYING */}
            {loading && !verificationReq && (
              <div className="py-6 flex flex-col items-center justify-center space-y-4">
                <div className="w-8 h-8 rounded-full border-2 border-qie-pink border-t-transparent animate-spin" />
                <p className="text-xs text-zinc-400 font-medium">Initiating QIE Pass Request...</p>
              </div>
            )}

            {/* FLOW 2: PENDING KYC ONBOARDING REDIRECT */}
            {verificationReq && verificationReq.status === 'pending_kyc' && (
              <div className="space-y-4 bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-amber-500">KYC Verification Required</h4>
                    <p className="text-[11px] text-zinc-400">
                      Your wallet address is not registered on QIE Pass. You must complete a one-time KYC verification setup.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {verificationReq.redirectUrl && !verificationReq.redirectUrl.startsWith('/') && (
                    <a
                      href={verificationReq.redirectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-qie-pink hover:bg-qie-pink/90 text-black font-bold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center mb-2"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Go to QIE Pass KYC Portal
                    </a>
                  )}
                  <button
                    onClick={() => handleClaimCredentials(verificationReq.requestId)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    I&apos;ve Completed Verification → Sign In
                  </button>
                  <button
                    onClick={handleSimulateKycSuccess}
                    disabled={kycSimulating}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${kycSimulating ? 'animate-spin' : ''}`} />
                    {kycSimulating ? 'Simulating KYC...' : 'Simulate QIE Pass KYC Portal'}
                  </button>
                  <p className="text-[10px] text-zinc-500 text-center">
                    Note: Clicking above simulates the user completing document submission on the QIE Pass app.
                  </p>
                </div>
              </div>
            )}

            {/* FLOW 3: PENDING CONSENT APPROVAL */}
            {verificationReq && verificationReq.status === 'pending_consent' && (
              <div className="space-y-4 bg-qie-pink-dim border border-qie-pink/20 p-4 rounded-xl">
                <div className="flex gap-2">
                  <Shield className="w-5 h-5 text-qie-pink flex-shrink-0" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-qie-pink">Waiting for Credentials Consent</h4>
                    <p className="text-[11px] text-zinc-400">
                      Your identity is verified. QIE Pass is waiting for you to approve sharing claims with this dashboard.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  {verificationReq.redirectUrl && !verificationReq.redirectUrl.startsWith('/') && (
                    <a
                      href={verificationReq.redirectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-qie-pink hover:bg-qie-pink/90 text-black font-bold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center mb-2"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Go to QIE Pass Consent Portal
                    </a>
                  )}
                  <button
                    onClick={() => handleClaimCredentials(verificationReq.requestId)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    I&apos;ve Approved Consent → Sign In
                  </button>
                  <button
                    onClick={handleSimulateKycSuccess} // reuse helper to flip status in sandbox
                    className="w-full bg-qie-pink hover:bg-qie-pink/90 text-black font-bold text-xs py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    Approve Consent in QIE Pass (Simulator)
                  </button>
                </div>
              </div>
            )}

            {/* DEFAULT VIEW: PROFILES LIST AND INPUT */}
            {!verificationReq && !loading && (
              <>
                {/* Preconfigured simulators */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-zinc-500">Connect with simulated QIE Pass profiles</p>
                  {simulatedProfiles.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleConnectSimulator(p.address)}
                      className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:border-qie-pink/30 hover:bg-white/10 transition-all text-xs flex justify-between items-center group cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <span className="font-semibold text-zinc-200 group-hover:text-qie-pink transition-colors">
                          {p.label}
                        </span>
                        <span className="block text-[10px] text-zinc-500 font-mono">
                          {p.address.slice(0, 10)}...{p.address.slice(-6)}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-qie-pink group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>

                {/* Custom Input */}
                <div className="space-y-2 border-t border-white/5 pt-4">
                  <p className="text-xs font-semibold text-zinc-500">Or enter your QIE Wallet Address or QIE Pass ID</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="0x... / name.qie / did:qie:..."
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 hover:border-white/20 focus:border-qie-pink focus:outline-none rounded-lg px-3 py-2 text-xs font-mono text-zinc-200"
                    />
                    <button
                      onClick={() => {
                        const trimmed = customAddress.trim();
                        const isHexAddress = /^0x[a-fA-F0-9]{40}$/.test(trimmed);
                        const isDid = trimmed.startsWith('did:qie:');
                        const isQieDomain = trimmed.endsWith('.qie');

                        if (isHexAddress || isDid || isQieDomain) {
                          handleConnectSimulator(trimmed);
                        } else {
                          setError('Please enter a valid QIE Wallet Address (0x...), QIE Pass DID (did:qie:...), or QIE Domain (.qie)');
                        }
                      }}
                      disabled={!customAddress}
                      className="bg-white text-black font-semibold text-xs px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors cursor-pointer"
                    >
                      Connect
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
