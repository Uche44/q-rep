'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, Shield, Cpu, Activity, Award, LogOut, Plus, 
  Send, Compass, Sparkles, AlertCircle, ExternalLink, Calendar, CheckSquare, Settings
} from 'lucide-react';
import { getTierProgressDetails } from '@/lib/reputation-engine';

export default function DashboardPage() {
  const router = useRouter();
  
  // States
  const [user, setUser] = useState<any>(null);
  const [contributions, setContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'activity' | 'submit' | 'ai' | 'edit'>('activity');
  
  // Onboarding interest-picker states (for new users)
  const ECOSYSTEM_AREAS = [
    'DeFi & Protocols',
    'Infrastructure & Nodes',
    'Identity & Privacy',
    'Payments & Commerce',
    'Gaming & NFTs',
    'Developer Tooling',
    'Governance & DAOs',
    'Community & Education',
  ];
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [onboardingGoals, setOnboardingGoals] = useState('');
  const [onboardingGuide, setOnboardingGuide] = useState<any>(null);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [onboardingError, setOnboardingError] = useState('');
  
  // Submit Form States
  const [formType, setFormType] = useState('project');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSource, setFormSource] = useState('');
  const [formDemoUrl, setFormDemoUrl] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  // Edit Profile Form States
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editTwitter, setEditTwitter] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [editInterests, setEditInterests] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [editError, setEditError] = useState('');

  // 1. Fetch user session and sync on-chain data
  async function fetchUserSession() {
    try {
      const res = await fetch('/api/auth/qie-pass');
      if (!res.ok) throw new Error('Auth fetch failed');
      const data = await res.json();
      
      if (data.authenticated) {
        setUser(data.user);
        setEditUsername(data.user.username || '');
        setEditBio(data.user.bio || '');
        setEditTwitter(data.user.twitter || '');
        setEditLinkedin(data.user.linkedin || '');
        setEditSkills(data.user.skills ? data.user.skills.join(', ') : '');
        setEditInterests(data.user.interests ? data.user.interests.join(', ') : '');
        setEditAvatar(data.user.avatar || '');
        
        // Fetch contributions
        const contribsRes = await fetch('/api/contributions');
        if (contribsRes.ok) {
          const contribsData = await contribsRes.json();
          setContributions(contribsData.contributions || []);
        }
      } else {
        // Redirect to landing if not logged in
        router.push('/');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUserSession();
  }, []);

  // 2. Handle contribution submission
  const handleSubmitContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormSuccess('');
    setFormError('');

    if (!formTitle && formType === 'project') {
      setFormError('Project title is required.');
      setSubmitting(false);
      return;
    }

    if (!formSource) {
      setFormError('GitHub Repository or Source Link is required.');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        type: formType,
        source: formSource,
        title: formTitle,
        description: formDesc,
        githubUrl: formSource,
        demoUrl: formDemoUrl,
        tags: formTags ? formTags.split(',').map(t => t.trim()) : ['Ecosystem Build'],
      };

      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFormSuccess(`Contribution logged! Earned ${data.contribution.points} reputation points.`);
        // Reset form
        setFormTitle('');
        setFormDesc('');
        setFormSource('');
        setFormDemoUrl('');
        setFormTags('');
        
        // Refresh session to get updated score & tier
        await fetchUserSession();
      } else {
        setFormError(data.error || 'Failed to record contribution.');
      }
    } catch (err) {
      setFormError('Network timeout. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Trigger AI growth recommendations
  const generateAIPlan = async () => {
    setAiLoading(true);
    setAiInsights(null);
    try {
      const res = await fetch('/api/ai-insights', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setAiInsights(data.insights);
      } else {
        console.error('AI API failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  // Determine if user is brand new (no reputation activity yet)
  const isNewUser = (u: any) =>
    !u?.reputation?.score && !u?.reputation?.contributionsCount && contributions.length === 0;

  // Onboarding guide generation for new users
  const handleGenerateOnboardingGuide = async () => {
    if (selectedInterests.length === 0) {
      setOnboardingError('Please select at least one area you are interested in.');
      return;
    }
    setOnboardingError('');
    setOnboardingLoading(true);
    setOnboardingGuide(null);
    try {
      const res = await fetch('/api/ai-insights/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests: selectedInterests, goals: onboardingGoals }),
      });
      if (res.ok) {
        const data = await res.json();
        setOnboardingGuide(data.guide);
      } else {
        setOnboardingError('Failed to generate guide. Please try again.');
      }
    } catch (err) {
      setOnboardingError('Network error. Please try again.');
    } finally {
      setOnboardingLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await fetch('/api/auth/qie-pass', { method: 'DELETE' });
    router.push('/');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setEditSuccess('');
    setEditError('');

    try {
      const payload = {
        username: editUsername,
        bio: editBio,
        twitter: editTwitter,
        linkedin: editLinkedin,
        skills: editSkills ? editSkills.split(',').map(s => s.trim()).filter(Boolean) : [],
        interests: editInterests ? editInterests.split(',').map(i => i.trim()).filter(Boolean) : [],
        avatar: editAvatar,
      };

      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEditSuccess('Passport profile updated successfully!');
        setUser(data.user);
        // Refresh session to sync updated fields
        setEditUsername(data.user.username || '');
        setEditBio(data.user.bio || '');
        setEditTwitter(data.user.twitter || '');
        setEditLinkedin(data.user.linkedin || '');
        setEditSkills(data.user.skills ? data.user.skills.join(', ') : '');
        setEditInterests(data.user.interests ? data.user.interests.join(', ') : '');
        setEditAvatar(data.user.avatar || '');
      } else {
        setEditError(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      setEditError('Network timeout or connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-background px-6 py-12 flex flex-col items-center justify-center min-h-[80vh] space-y-6">
        <div className="w-12 h-12 rounded-full border-2 border-qie-pink border-t-transparent animate-spin" />
        <p className="text-sm text-zinc-400 font-medium">Synchronizing live QIE Blockchain activity...</p>
      </div>
    );
  }

  if (!user) return null;

  // Calculate progress metrics
  const score = user.reputation?.score || 0;
  const progress = getTierProgressDetails(score);

  return (
    <div className="flex-grow flex flex-col bg-background">
      {/* HEADER NAV */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-white/5 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-lg bg-gradient-to-tr from-qie-pink to-indigo-600 flex items-center justify-center p-1">
            <span className="font-display font-black text-black text-sm">Q</span>
          </Link>
          <span className="font-display font-semibold tracking-wider text-sm">MY REPUTATION</span>
        </div>

        <nav className="flex items-center gap-6">
          <Link href="/directory" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Ecosystem Leaderboard
          </Link>
          <button
            onClick={handleDisconnect}
            className="text-xs border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            id="btn-logout"
          >
            <LogOut className="w-3.5 h-3.5" /> Disconnect
          </button>
        </nav>
      </header>

      {/* DASHBOARD GRID CONTAINER */}
      <div className="max-w-7xl mx-auto px-6 py-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
        
        {/* LEFT COLUMN: USER BRIEF & TIER PROGRESS (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* USER BRIEF CARD */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-zinc-800 border border-white/10 overflow-hidden flex items-center justify-center">
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-0.5">
                <h2 className="font-display font-bold text-lg text-white">{user.username}</h2>
                <p className="text-xs font-mono text-zinc-500">{user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-6)}</p>
              </div>
            </div>

            {user.bio && (
              <p className="text-xs text-zinc-400 bg-white/5 border border-white/5 p-3 rounded-xl italic">
                "{user.bio}"
              </p>
            )}

            {/* Social Handles */}
            {(user.twitter || user.linkedin) && (
              <div className="flex items-center gap-3 border-t border-white/5 pt-3">
                {user.twitter && (
                  <a 
                    href={user.twitter.startsWith('http') ? user.twitter : `https://twitter.com/${user.twitter.replace('@', '')}`}
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <TwitterIcon className="w-3.5 h-3.5 text-sky-400" />
                    <span>Twitter</span>
                  </a>
                )}
                {user.linkedin && (
                  <a 
                    href={user.linkedin.startsWith('http') ? user.linkedin : `https://linkedin.com/in/${user.linkedin}`}
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <LinkedinIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            )}

            <button
              onClick={() => setActiveTab('edit')}
              className="w-full border border-white/10 hover:border-white/20 text-xs font-semibold py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" /> Edit Passport
            </button>

            <div className="border-t border-white/5 pt-4 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Ecosystem Rank</p>
                <p className="font-display font-extrabold text-xl text-white">#{user.reputation?.rank || 1}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Tier Rating</p>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-qie-pink-dim border border-qie-pink/20 text-xs font-semibold text-qie-pink">
                  {progress.currentLevel}
                </span>
              </div>
            </div>
          </div>

          {/* REPUTATION TIER PROGRESS */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-semibold text-zinc-400">Reputation Level Progress</span>
              <span className="font-display font-black text-2xl text-qie-pink">{score} <span className="text-xs font-normal text-zinc-500">Points</span></span>
            </div>

            {/* PROGRESS BAR */}
            <div className="space-y-1.5">
              <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-qie-pink h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,79,163,0.4)]"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>{progress.currentLevel} ({progress.minScore})</span>
                <span>{progress.nextLevel} ({progress.nextMinScore})</span>
              </div>
            </div>
          </div>

          {/* LIVE BLOCKCHAIN ACTIVITY PANEL */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Live Blockchain Sync</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500">Wallet Balance</span>
                <span className="font-mono font-medium">{Number(user.reputation?.liveBalance).toFixed(4)} QIE</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500">Live Transaction Count</span>
                <span className="font-mono font-medium">{user.reputation?.liveTxCount} txs</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500">Contract Interactions</span>
                <span className="font-mono font-medium text-qie-pink">{user.reputation?.liveContractInteractions} calls</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500">Validator / Staking activity</span>
                <span className="font-mono font-medium">{user.reputation?.eventsAttended} events</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500">Governance Votes</span>
                <span className="font-mono font-medium">{user.reputation?.votesCast} votes</span>
              </div>
              <div className="flex justify-between text-zinc-300">
                <span className="text-zinc-500">Active History Days</span>
                <span className="font-mono font-medium">{user.reputation?.liveActiveDays} days</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: MAIN CONTENT INTERACTION TABS (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* TAB SELECTION HEADER */}
          <div className="flex border-b border-white/5">
            <button
              onClick={() => setActiveTab('activity')}
              className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'activity' 
                  ? 'border-qie-pink text-qie-pink' 
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" /> Activity Feed
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'submit' 
                  ? 'border-qie-pink text-qie-pink' 
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Plus className="w-4 h-4" /> Log Contributions
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'ai' 
                  ? 'border-qie-pink text-qie-pink' 
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" /> AI Growth Plan
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`pb-4 px-6 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'edit' 
                  ? 'border-qie-pink text-qie-pink' 
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" /> Edit Profile
            </button>
          </div>

          {/* TAB CONTENT: 1. ACTIVITY FEED */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Recent Profile Activity</h3>
              
              {contributions.length === 0 ? (
                <div className="glass-card rounded-xl p-8 text-center text-zinc-500 text-xs">
                  No off-chain contributions logged yet. Submit a project or article to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {contributions.map((c, idx) => (
                    <div key={idx} className="glass-card rounded-xl p-4 flex items-start justify-between border border-white/5 hover:border-white/10 transition-colors">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/5 font-semibold text-zinc-300 capitalize">
                            {c.type.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <p className="text-sm font-bold text-white">
                          {c.source.startsWith('http') ? (
                            <a href={c.source} target="_blank" rel="noreferrer" className="hover:text-qie-pink flex items-center gap-1.5">
                              {c.source} <ExternalLink className="w-3.5 h-3.5 inline" />
                            </a>
                          ) : (
                            c.source
                          )}
                        </p>

                        {c.metadata && (() => {
                          try {
                            const meta = JSON.parse(c.metadata);
                            return (
                              <div className="space-y-1">
                                {meta.title && <p className="text-xs font-semibold text-zinc-300">{meta.title}</p>}
                                {meta.description && <p className="text-xs text-zinc-400">{meta.description}</p>}
                              </div>
                            );
                          } catch {
                            return null;
                          }
                        })()}
                      </div>
                      
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-qie-pink">+{c.points} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: 2. LOG CONTRIBUTIONS FORM */}
          {activeTab === 'submit' && (
            <div className="glass-card rounded-xl p-6 border border-white/5 space-y-6">
              <div className="space-y-1">
                <h3 className="font-display font-bold text-lg text-white">Register Off-Chain Contributions</h3>
                <p className="text-xs text-zinc-500">Submit link evidence. All submissions dynamically increment your reputation score.</p>
              </div>

              {formSuccess && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400">
                  {formSuccess}
                </div>
              )}

              {formError && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmitContribution} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Contribution Type</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:outline-none focus:border-qie-pink"
                    >
                      <option value="project" className="bg-zinc-950">Deployed Project (+50)</option>
                      <option value="article" className="bg-zinc-950">Article/Documentation (+20)</option>
                      <option value="bug_report" className="bg-zinc-950">Bug Report (+15)</option>
                      <option value="credential" className="bg-zinc-950">Ecosystem Badge/Credential (+20)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Source Link (GitHub / Project Link)</label>
                    <input
                      type="text"
                      placeholder="https://github.com/username/project"
                      value={formSource}
                      onChange={(e) => setFormSource(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:outline-none focus:border-qie-pink font-mono"
                    />
                  </div>
                </div>

                {formType === 'project' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400 font-semibold">Project Title</label>
                      <input
                        type="text"
                        placeholder="My Awesome DApp"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:outline-none focus:border-qie-pink"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-zinc-400 font-semibold">Live Demo Link (Optional)</label>
                      <input
                        type="text"
                        placeholder="https://mydapp.com"
                        value={formDemoUrl}
                        onChange={(e) => setFormDemoUrl(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:outline-none focus:border-qie-pink font-mono"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Description / Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Provide a brief summary of what you did..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:outline-none focus:border-qie-pink"
                  />
                </div>

                {formType === 'project' && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Tags (comma separated)</label>
                    <input
                      type="text"
                      placeholder="DeFi, Payments, Wallet"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:outline-none focus:border-qie-pink"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-white text-black font-semibold text-xs py-2.5 rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Recording...' : 'Submit Contribution'}
                </button>
              </form>
            </div>
          )}

          {/* TAB CONTENT: 3. AI REPUTATION ADVISOR */}
          {activeTab === 'ai' && (
            <div className="glass-card rounded-xl p-6 border border-white/5 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-qie-pink animate-pulse" />
                    {isNewUser(user) ? 'AI Ecosystem Onboarding' : 'AI Reputation Insights'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {isNewUser(user)
                      ? 'Tell us what you want to build or contribute, and we will generate a personalised getting-started plan.'
                      : 'AI reads your verified metrics (transactions, code, votes) to draft a progress plan.'}
                  </p>
                </div>

                {!isNewUser(user) && (
                  <button
                    onClick={generateAIPlan}
                    disabled={aiLoading}
                    className="bg-qie-pink text-black font-semibold text-xs px-4 py-2 rounded-lg hover:bg-qie-pink/90 transition-colors cursor-pointer"
                  >
                    {aiLoading ? 'Analyzing...' : 'Generate New Insights'}
                  </button>
                )}
              </div>

              {/* ── NEW USER: INTEREST PICKER ── */}
              {isNewUser(user) && !onboardingGuide && (
                <div className="space-y-6">
                  {/* Intro callout */}
                  <div className="p-4 bg-indigo-950/30 border border-indigo-500/15 rounded-xl flex gap-3 items-start">
                    <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Welcome to QRep! You haven&apos;t started your on-chain journey yet — that&apos;s okay.
                      Pick the areas below that excite you and we will build a custom step-by-step plan to help you earn your first reputation points.
                    </p>
                  </div>

                  {/* Interest chip grid */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">What areas are you interested in?</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {ECOSYSTEM_AREAS.map((area) => {
                        const isSelected = selectedInterests.includes(area);
                        return (
                          <button
                            key={area}
                            type="button"
                            onClick={() => setSelectedInterests(prev =>
                              isSelected ? prev.filter(a => a !== area) : [...prev, area]
                            )}
                            className={`text-[11px] font-semibold px-3 py-2 rounded-xl border transition-all cursor-pointer text-left leading-tight ${
                              isSelected
                                ? 'bg-qie-pink/20 border-qie-pink text-qie-pink'
                                : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                            }`}
                          >
                            {area}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Optional goals textarea */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Any specific goals? <span className="normal-case font-normal text-zinc-500">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. I want to build a DeFi protocol, earn a grant, or become a validator..."
                      value={onboardingGoals}
                      onChange={(e) => setOnboardingGoals(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs focus:outline-none focus:border-qie-pink text-zinc-200 resize-none"
                    />
                  </div>

                  {onboardingError && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                      {onboardingError}
                    </p>
                  )}

                  <button
                    onClick={handleGenerateOnboardingGuide}
                    disabled={onboardingLoading || selectedInterests.length === 0}
                    className="w-full bg-qie-pink text-black font-semibold text-xs py-3 rounded-xl hover:bg-qie-pink/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {onboardingLoading ? 'Building your plan...' : 'Generate My Ecosystem Starter Plan'}
                  </button>

                  {onboardingLoading && (
                    <div className="space-y-3">
                      <div className="shimmer-bg h-10 rounded-xl" />
                      <div className="shimmer-bg h-24 rounded-xl" />
                      <div className="shimmer-bg h-16 rounded-xl" />
                    </div>
                  )}
                </div>
              )}

              {/* ── NEW USER: GUIDE RESULT ── */}
              {isNewUser(user) && onboardingGuide && (
                <div className="space-y-6 animate-fade-in-up">
                  {/* Reset button */}
                  <button
                    onClick={() => { setOnboardingGuide(null); setSelectedInterests([]); setOnboardingGoals(''); }}
                    className="text-[11px] text-zinc-500 hover:text-zinc-300 underline cursor-pointer transition-colors"
                  >
                    ← Change my interests
                  </button>

                  {/* Summary */}
                  <div className="p-4 bg-qie-pink-dim border border-qie-pink/10 rounded-xl space-y-1.5">
                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-qie-pink" /> Your Personalised QIE Roadmap
                    </h4>
                    <p className="text-sm font-medium text-zinc-100 italic">
                      &quot;{onboardingGuide.summary}&quot;
                    </p>
                  </div>

                  {/* Interest area badges */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Chosen Focus Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {onboardingGuide.selectedAreas.map((area: string, idx: number) => (
                        <span key={idx} className="text-[11px] px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* First steps checklist */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-qie-pink" /> Your First Steps to Reputation Points
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {onboardingGuide.firstSteps.map((step: string, idx: number) => (
                        <div key={idx} className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-start gap-2.5">
                          <span className="text-qie-pink font-bold text-xs mt-0.5 flex-shrink-0">{idx + 1}.</span>
                          <span className="text-xs text-zinc-300 leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next milestone */}
                  <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">🎯 First Milestone</p>
                    <p className="text-xs text-zinc-300">{onboardingGuide.nextMilestone}</p>
                  </div>

                  {/* Suggested roles */}
                  {onboardingGuide.suggestedRoles?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-zinc-400" /> Ecosystem Roles to Aim For
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {onboardingGuide.suggestedRoles.map((role: string, idx: number) => (
                          <span key={idx} className="text-xs px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA to log first contribution */}
                  <button
                    onClick={() => setActiveTab('submit')}
                    className="w-full border border-qie-pink/30 hover:border-qie-pink text-qie-pink text-xs font-semibold py-2.5 rounded-xl hover:bg-qie-pink/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log My First Contribution Now
                  </button>
                </div>
              )}

              {/* ── RETURNING USER: STANDARD INSIGHTS ── */}
              {!isNewUser(user) && !aiInsights && !aiLoading && (
                <div className="bg-white/5 rounded-xl p-8 border border-white/5 text-center text-zinc-500 text-xs">
                  Click &apos;Generate New Insights&apos; to run the reputation parser.
                </div>
              )}

              {!isNewUser(user) && aiLoading && (
                <div className="space-y-4">
                  <div className="shimmer-bg h-12 rounded-xl" />
                  <div className="shimmer-bg h-24 rounded-xl" />
                  <div className="shimmer-bg h-16 rounded-xl" />
                </div>
              )}

              {!isNewUser(user) && aiInsights && (
                <div className="space-y-6 animate-fade-in-up">
                  {/* Summary */}
                  <div className="p-4 bg-qie-pink-dim border border-qie-pink/10 rounded-xl space-y-1.5">
                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-qie-pink" /> Executive Summary
                    </h4>
                    <p className="text-sm font-medium text-zinc-100 italic">
                      &quot;{aiInsights.summary}&quot;
                    </p>
                  </div>

                  {/* Growth Checklist */}
                  {aiInsights.growthChecklist && aiInsights.growthChecklist.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4 text-qie-pink" /> Milestones Checklist to Next Tier
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {aiInsights.growthChecklist.map((task: string, idx: number) => (
                          <div key={idx} className="bg-white/5 border border-white/5 p-3 rounded-lg flex items-start gap-2.5">
                            <span className="text-qie-pink text-xs pt-0.5">●</span>
                            <span className="text-xs text-zinc-300">{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-zinc-400" /> Key Recommendations
                      </h4>
                      <ul className="space-y-2 text-xs">
                        {aiInsights.recommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="bg-white/5 border border-white/5 p-3 rounded-lg text-zinc-300">
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggested Roles */}
                  {aiInsights.suggestedRoles && aiInsights.suggestedRoles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-zinc-400" /> Recommended Ecosystem Roles
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {aiInsights.suggestedRoles.map((role: string, idx: number) => (
                          <span key={idx} className="text-xs px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: 4. EDIT PROFILE */}
          {activeTab === 'edit' && (
            <div className="glass-card rounded-xl p-6 border border-white/5 space-y-6">
              <div className="space-y-1">
                <h3 className="font-display font-bold text-lg text-white">Edit Reputation Passport</h3>
                <p className="text-xs text-zinc-500">Update your public identity details, social profiles, and skill indicators.</p>
              </div>

              {editSuccess && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400">
                  {editSuccess}
                </div>
              )}

              {editError && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500">
                  {editError}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Unique Username</label>
                    <input
                      type="text"
                      required
                      placeholder="username"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:outline-none focus:border-qie-pink"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Avatar Image URL (Optional)</label>
                    <input
                      type="text"
                      placeholder="https://api.dicebear.com/7.x/identicon/svg?seed=..."
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:outline-none focus:border-qie-pink font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Twitter Account / URL</label>
                    <input
                      type="text"
                      placeholder="e.g. twitter_handle or full URL"
                      value={editTwitter}
                      onChange={(e) => setEditTwitter(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:outline-none focus:border-qie-pink font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">LinkedIn Profile / URL</label>
                    <input
                      type="text"
                      placeholder="e.g. in/username or full URL"
                      value={editLinkedin}
                      onChange={(e) => setEditLinkedin(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:outline-none focus:border-qie-pink font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-400 font-semibold">Bio / Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your role and background in the QIE ecosystem..."
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:outline-none focus:border-qie-pink"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Skills (comma separated)</label>
                    <input
                      type="text"
                      placeholder="Solidity, TypeScript, Rust, DeFi"
                      value={editSkills}
                      onChange={(e) => setEditSkills(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:outline-none focus:border-qie-pink"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-semibold">Interests (comma separated)</label>
                    <input
                      type="text"
                      placeholder="Smart Contracts, Web3 Payments, DAOs"
                      value={editInterests}
                      onChange={(e) => setEditInterests(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs focus:outline-none focus:border-qie-pink"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-white text-black font-semibold text-xs py-2.5 rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  {submitting ? 'Updating Passport...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
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
