'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Trophy, Medal, Compass, Award, ExternalLink, RefreshCw, Cpu, Activity, Shield, Sparkles, Bot } from 'lucide-react';

export default function DirectoryPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [aiMatches, setAiMatches] = useState<any[]>([]);
  const [aiSearching, setAiSearching] = useState(false);

  // Fetch directory list from API
  async function fetchDirectory(search = '', level = '') {
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (level) queryParams.append('level', level);

      const res = await fetch(`/api/leaderboard?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (err) {
      console.error('Fetch directory error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function searchWithAI(query: string) {
    if (!query.trim()) {
      setAiMatches([]);
      setLoading(false);
      return;
    }
    setAiSearching(true);
    setLoading(true);
    try {
      const res = await fetch('/api/leaderboard/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiMatches(data.matches || []);
      } else {
        console.error('AI search request failed');
      }
    } catch (err) {
      console.error('AI Search error:', err);
    } finally {
      setLoading(false);
      setAiSearching(false);
    }
  }

  useEffect(() => {
    if (!aiMode) {
      fetchDirectory(searchQuery, filterLevel);
    }
  }, [aiMode, filterLevel]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (aiMode) {
      searchWithAI(searchQuery);
    } else {
      fetchDirectory(searchQuery, filterLevel);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    if (aiMode) {
      searchWithAI(searchQuery);
    } else {
      fetchDirectory(searchQuery, filterLevel);
    }
  };

  // Helper to render rank icons
  const renderRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-zinc-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="font-mono text-zinc-500 font-bold text-sm">#{rank}</span>;
  };

  return (
    <div className="flex-grow flex flex-col bg-background">
      {/* NAV HEADER */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-white/5 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-lg bg-gradient-to-tr from-qie-pink to-indigo-600 flex items-center justify-center p-1">
            <span className="font-display font-black text-black text-sm">Q</span>
          </Link>
          <span className="font-display font-semibold tracking-wider text-sm">ECOSYSTEM PORTAL</span>
        </div>

        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/dashboard" className="text-sm bg-white text-black hover:bg-zinc-200 font-semibold px-4 py-2 rounded-lg transition-colors">
            My Passport
          </Link>
        </nav>
      </header>

      {/* PORTAL MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-10 w-full flex-grow space-y-8">
        
        {/* PAGE TITLE & INTRO */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Ecosystem Directory</h1>
            <p className="text-zinc-400 text-sm max-w-xl">
              Meet and discover validators, developers, and community contributors within the QIE network. Verified by on-chain reputation.
            </p>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 self-start text-xs border border-white/10 hover:border-white/20 hover:bg-white/5 text-zinc-400 hover:text-white px-3 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Sync Directory
          </button>
        </div>

        {/* MODE SELECTOR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface/30 p-4 border border-white/5 rounded-2xl">
          <div className="flex flex-col space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Search Mode</label>
            <div className="bg-zinc-900/80 border border-white/5 p-1 rounded-xl flex gap-1 self-start">
              <button
                type="button"
                onClick={() => {
                  setAiMode(false);
                  setSearchQuery('');
                  setLeaderboard([]);
                  fetchDirectory('', '');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  !aiMode
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                Standard Search
              </button>
              <button
                type="button"
                onClick={() => {
                  setAiMode(true);
                  setSearchQuery('');
                  setAiMatches([]);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  aiMode
                    ? 'bg-gradient-to-r from-indigo-500 to-qie-pink text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Talent Finder
              </button>
            </div>
          </div>

          {aiMode && (
            <div className="flex items-center gap-2 bg-indigo-950/20 border border-indigo-500/10 p-3 rounded-xl max-w-md">
              <Bot className="w-5 h-5 text-indigo-400 flex-shrink-0 animate-pulse" />
              <p className="text-[11px] text-zinc-300 leading-normal">
                Describe the stack, projects, or background you're seeking. AI matches all ecosystem builders and details their fit.
              </p>
            </div>
          )}
        </div>

        {/* SEARCH AND FILTERS BAR */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center bg-surface/30 p-4 border border-white/5 rounded-2xl">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder={
                aiMode
                  ? "Describe the role/talent you need (e.g. 'A DeFi builder with Solidity and governance votes')..."
                  : "Search by username, skills (e.g. Solidity)..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-qie-pink focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-200"
            />
          </div>

          {/* Level Filter */}
          {!aiMode && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <label className="text-xs text-zinc-400 whitespace-nowrap font-semibold">Reputation Level:</label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-qie-pink text-zinc-300 w-full md:w-auto"
              >
                <option value="" className="bg-zinc-950">All Levels</option>
                <option value="Diamond" className="bg-zinc-950">Diamond (1500+)</option>
                <option value="Platinum" className="bg-zinc-950">Platinum (701+)</option>
                <option value="Gold" className="bg-zinc-950">Gold (301+)</option>
                <option value="Silver" className="bg-zinc-950">Silver (101+)</option>
                <option value="Bronze" className="bg-zinc-950">Bronze (0+)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full md:w-auto bg-white text-black font-semibold text-xs px-6 py-2.5 rounded-xl hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            {aiMode ? "Find Talent" : "Search"}
          </button>
        </form>

        {/* CARDS GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="shimmer-bg h-48 rounded-2xl" />
            <div className="shimmer-bg h-48 rounded-2xl" />
            <div className="shimmer-bg h-48 rounded-2xl" />
          </div>
        ) : aiMode ? (
          aiMatches.length === 0 ? (
            <div className="glass-card rounded-2xl p-16 text-center text-zinc-500 text-sm">
              {searchQuery ? "No matching builders found for your description. Try describing skills, roles, or project scopes." : "Type a description above and click 'Find Talent' to search using AI."}
            </div>
          ) : (
            /* AI SEARCH MATCHES GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
              {aiMatches.map((builder, idx) => (
                <div
                  key={idx}
                  className="glass-card glass-card-hover rounded-2xl p-6 border border-white/5 flex flex-col justify-between space-y-6 relative overflow-hidden group"
                >
                  {builder.matchingScore >= 80 && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 to-qie-pink" />
                  )}

                  <div className="space-y-4">
                    {/* Profile Header */}
                    <div className="flex items-start justify-between border-b border-white/5 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden flex items-center justify-center">
                          <img src={builder.avatar} alt={builder.username} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-sm text-white hover:text-qie-pink transition-colors">
                            <Link href={`/profile/${builder.username}`}>
                              {builder.username}
                            </Link>
                          </h3>
                          <p className="text-[10px] font-mono text-zinc-500">
                            {builder.walletAddress ? `${builder.walletAddress.slice(0, 6)}...${builder.walletAddress.slice(-4)}` : ''}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" /> {builder.matchingScore}% Match
                      </div>
                    </div>

                    {/* AI Suitability Explanation */}
                    <div className="p-3 bg-indigo-950/20 border border-indigo-500/10 rounded-xl space-y-1.5">
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5 text-indigo-400" /> AI Fit Analysis
                      </p>
                      <p className="text-xs text-zinc-300 leading-relaxed italic">
                        "{builder.suitabilityExplanation}"
                      </p>
                    </div>

                    {/* Score & Tier Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Reputation Score</p>
                        <p className="font-display font-extrabold text-sm text-qie-pink">
                          {builder.reputationScore}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Level Tier</p>
                        <span className="inline-block text-[10px] font-bold text-white uppercase tracking-wider">
                          {builder.reputationLevel}
                        </span>
                      </div>
                    </div>

                    {/* Skills tags */}
                    {builder.skills && builder.skills.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
                        {builder.skills.slice(0, 3).map((skill: string, sIdx: number) => (
                          <span key={sIdx} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-zinc-400">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-end text-xs text-zinc-500">
                    <Link
                      href={`/profile/${builder.username}`}
                      className="text-[10px] text-qie-pink hover:underline flex items-center gap-1 group-hover:text-white transition-colors"
                    >
                      View Passport <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* LEADERBOARD CARDS GRID */
          leaderboard.length === 0 ? (
            <div className="glass-card rounded-2xl p-16 text-center text-zinc-500 text-sm">
              No ecosystem members found matching your search parameters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
              {leaderboard.map((builder, idx) => (
                <div
                  key={idx}
                  className="glass-card glass-card-hover rounded-2xl p-6 border border-white/5 flex flex-col justify-between space-y-6"
                >
                  {/* Profile Header */}
                  <div className="flex items-start justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden flex items-center justify-center">
                        <img src={builder.avatar} alt={builder.username} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-sm text-white hover:text-qie-pink transition-colors">
                          <Link href={`/profile/${builder.username}`}>
                            {builder.username}
                          </Link>
                        </h3>
                        <p className="text-[10px] font-mono text-zinc-500">
                          {builder.walletAddress.slice(0, 6)}...{builder.walletAddress.slice(-4)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {renderRankBadge(builder.reputation.rank)}
                    </div>
                  </div>

                  {/* Score & Tier Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Score</p>
                      <p className="font-display font-extrabold text-lg text-qie-pink">
                        {builder.reputation.score}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Level</p>
                      <span className="inline-block text-[10px] font-bold text-white uppercase tracking-wider">
                        {builder.reputation.level}
                      </span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  {builder.skills && builder.skills.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {builder.skills.slice(0, 3).map((skill: string, sIdx: number) => (
                        <span key={sIdx} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-zinc-400">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Activity summary icons */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5 text-zinc-500" /> {builder.reputation.projectsBuilt}
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-zinc-500" /> {builder.reputation.votesCast}
                      </span>
                      <span className="flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-zinc-500" /> {builder.reputation.contributionsCount}
                      </span>
                    </div>

                    <Link
                      href={`/profile/${builder.username}`}
                      className="text-[10px] text-qie-pink hover:underline flex items-center gap-1"
                    >
                      View Passport <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
