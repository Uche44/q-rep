'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  User, Shield, Cpu, Activity, Award, Calendar, 
  ExternalLink, Compass, ArrowLeft, CheckCircle
} from 'lucide-react';
import { getTierProgressDetails } from '@/lib/reputation-engine';

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [builder, setBuilder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchBuilderProfile() {
      try {
        const res = await fetch(`/api/leaderboard?search=${encodeURIComponent(username)}`);
        if (res.ok) {
          const data = await res.json();
          // Find the exact username match
          const exactMatch = data.leaderboard?.find(
            (b: any) => b.username.toLowerCase() === username.toLowerCase()
          );
          
          if (exactMatch) {
            setBuilder(exactMatch);
          } else {
            setError('Builder profile not found.');
          }
        } else {
          setError('Failed to query ecosystem registry.');
        }
      } catch (err) {
        console.error(err);
        setError('Network timeout occurred.');
      } finally {
        setLoading(false);
      }
    }
    
    if (username) {
      fetchBuilderProfile();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="flex-1 bg-background px-6 py-12 flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-qie-pink border-t-transparent animate-spin" />
        <p className="text-xs text-zinc-500">Querying QIE Pass identity registry...</p>
      </div>
    );
  }

  if (error || !builder) {
    return (
      <div className="flex-1 bg-background px-6 py-12 flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <AlertCircle className="w-12 h-12 text-qie-pink" />
        <h2 className="font-display font-bold text-lg text-white">Error</h2>
        <p className="text-sm text-zinc-400">{error || 'Profile could not be loaded.'}</p>
        <Link href="/directory" className="text-xs bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-zinc-200 transition-colors">
          Return to Directory
        </Link>
      </div>
    );
  }

  const score = builder.reputation.score;
  const progress = getTierProgressDetails(score);

  return (
    <div className="flex-grow flex flex-col bg-background">
      {/* HEADER NAV */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-white/5 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-lg bg-gradient-to-tr from-qie-pink to-indigo-600 flex items-center justify-center p-1">
            <span className="font-display font-black text-black text-sm">Q</span>
          </Link>
          <span className="font-display font-semibold tracking-wider text-sm">REPUTATION PASSPORT</span>
        </div>

        <Link href="/directory" className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
        </Link>
      </header>

      {/* BODY */}
      <div className="max-w-4xl mx-auto px-6 py-12 w-full space-y-8 animate-fade-in-up">
        
        {/* CARD CONTAINER */}
        <div className="glass-card rounded-3xl p-8 border border-white/10 space-y-8 shadow-2xl relative">
          <div className="absolute top-0 right-8 transform -translate-y-1/2">
            <span className="px-4 py-1.5 rounded-full bg-qie-pink text-black font-display font-black text-xs uppercase tracking-widest shadow-md">
              Ecosystem Builder
            </span>
          </div>

          {/* Profile Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-white/5 pb-6">
            <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
              <img src={builder.avatar} alt={builder.username} className="w-full h-full object-cover" />
            </div>
            
            <div className="space-y-3 text-center sm:text-left flex-grow">
              <div className="space-y-0.5">
                <h1 className="font-display font-extrabold text-2xl text-white">{builder.username}</h1>
                <p className="text-xs font-mono text-zinc-500">{builder.walletAddress}</p>
              </div>

              {builder.bio && (
                <p className="text-sm text-zinc-400 leading-relaxed italic max-w-xl">
                  "{builder.bio}"
                </p>
              )}

              {/* Social profiles */}
              {(builder.twitter || builder.linkedin) && (
                <div className="flex items-center justify-center sm:justify-start gap-4 text-xs pt-1">
                  {builder.twitter && (
                    <a 
                      href={builder.twitter.startsWith('http') ? builder.twitter : `https://twitter.com/${builder.twitter.replace('@', '')}`}
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      <TwitterIcon className="w-4 h-4 text-sky-400" />
                      <span>Twitter</span>
                    </a>
                  )}
                  {builder.linkedin && (
                    <a 
                      href={builder.linkedin.startsWith('http') ? builder.linkedin : `https://linkedin.com/in/${builder.linkedin}`}
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      <LinkedinIcon className="w-4 h-4 text-blue-400" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>
              )}


              {/* Skills Tags */}
              {builder.skills && builder.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                  {builder.skills.map((skill: string, sIdx: number) => (
                    <span key={sIdx} className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 text-zinc-400">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Metrics Block */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center sm:text-left">
            <div className="space-y-1">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Reputation Score</p>
              <p className="font-display font-black text-3xl text-qie-pink">{score}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Level Tier</p>
              <p className="font-display font-extrabold text-xl text-white uppercase tracking-wider">{builder.reputation.level}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Ecosystem Rank</p>
              <p className="font-display font-black text-3xl text-white">#{builder.reputation.rank}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Contributions</p>
              <p className="font-display font-bold text-xl text-zinc-300">{builder.reputation.contributionsCount}</p>
            </div>
          </div>

          {/* Level Progress */}
          <div className="space-y-2 border-t border-white/5 pt-6">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Tier Progress</span>
              <span>Next Level: {progress.nextLevel}</span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-qie-pink h-full rounded-full transition-all duration-500"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>

          {/* Aggregate Activity Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400">Builder Code</span>
                <Cpu className="w-4 h-4 text-qie-pink" />
              </div>
              <div>
                <p className="font-display font-extrabold text-2xl text-white">{builder.reputation.projectsBuilt}</p>
                <p className="text-[10px] text-zinc-500">Verified Project Repositories</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400">Governance</span>
                <Shield className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="font-display font-extrabold text-2xl text-white">{builder.reputation.votesCast}</p>
                <p className="text-[10px] text-zinc-500">Votes Cast & Proposals</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400">Network Active Days</span>
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="font-display font-extrabold text-2xl text-white">{builder.reputation.eventsAttended}</p>
                <p className="text-[10px] text-zinc-500">Event Logs & Staking Activities</p>
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER CALL-TO-ACTION */}
        <div className="text-center space-y-4 pt-6">
          <p className="text-zinc-500 text-xs">Want to verify your own contributions and claim your profile?</p>
          <Link href="/" className="inline-block bg-white text-black font-semibold text-xs px-6 py-2.5 rounded-xl hover:bg-zinc-200 transition-colors">
            Get Your QIE Reputation Passport
          </Link>
        </div>

      </div>
    </div>
  );
}

// Simple fallback icon import to resolve dynamic typing
function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
