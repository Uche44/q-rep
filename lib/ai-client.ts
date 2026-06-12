import https from 'https';
import http from 'http';

export interface AIInsightRequest {
  username: string;
  score: number;
  level: string;
  txCount: number;
  projectsBuilt: number;
  votesCast: number;
  eventsAttended: number;
  skills: string[];
  projects?: Array<{
    title: string;
    description: string;
    githubUrl?: string | null;
    demoUrl?: string | null;
    tags: string[];
  }>;
  contributions?: Array<{
    type: string;
    source: string;
    points: number;
    metadata?: string | null;
  }>;
}

export interface AIInsightResponse {
  summary: string;
  recommendations: string[];
  growthChecklist: string[];
  suggestedRoles: string[];
}

/**
 * Custom native HTTP/HTTPS POST helper with configurable timeout
 */
function httpRequest(
  url: string,
  headers: Record<string, string>,
  body: any
): Promise<{ ok: boolean; status: number; json: () => Promise<any>; text: () => Promise<string> }> {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;
      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: headers,
        timeout: 60000, // 60 seconds timeout
      };

      const req = protocol.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            ok: (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 300,
            status: res.statusCode || 0,
            json: async () => JSON.parse(data),
            text: async () => data,
          });
        });
      });

      req.on('error', (e) => {
        reject(e);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Timeout Error (attempted address: ${parsedUrl.hostname}, timeout: 60000ms)`));
      });

      req.write(JSON.stringify(body));
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Bulletproof helper to parse JSON content returned by LLMs
 */
function parseJSONContent(content: string): any {
  let cleaned = content.trim();
  
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```json\s*/i, '');
      cleaned = cleaned.replace(/^```\s*/, '');
      cleaned = cleaned.replace(/```$/, '');
      cleaned = cleaned.trim();
    }
    try {
      return JSON.parse(cleaned);
    } catch (e2) {
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        try {
          return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
        } catch (e3) {
          throw new Error('Failed to parse JSON content from AI response');
        }
      }
      throw e2;
    }
  }
}

/**
 * Calls Hugging Face or OpenAI API to generate reputation insights.
 * Falls back to rule-based engine if api keys are not set or request fails.
 */
export async function generateReputationInsights(
  data: AIInsightRequest
): Promise<AIInsightResponse> {
  const hfKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_KEY || process.env.HF_TOKEN;
  const openAIKey = process.env.OPENAI_API_KEY;

  const systemPrompt = `You are a career and ecosystem growth advisor for the QIE Blockchain. 
Your job is to analyze a builder's verified reputation profile and their completed contributions to provide highly polished, constructive, and inspiring career insights and a roadmap.
Provide the response strictly in JSON format matching this schema:
{
  "summary": "1-2 sentence profile highlight summarizing their biggest strengths based on their projects and contributions",
  "recommendations": ["recommendation 1 based on their active skills/contributions", "recommendation 2"],
  "growthChecklist": ["specific milestone to reach next level, e.g. build another DeFi project or vote on governance", "task to reach next tier 2"],
  "suggestedRoles": ["role 1 fitting their specific tech stack", "role 2"]
}`;

  let projectInfo = 'None';
  if (data.projects && data.projects.length > 0) {
    projectInfo = data.projects.map(p => `- ${p.title}: ${p.description} (Tags: ${p.tags.join(', ')})`).join('\n');
  }

  let contributionInfo = 'None';
  if (data.contributions && data.contributions.length > 0) {
    contributionInfo = data.contributions.map(c => `- Type: ${c.type}, Source: ${c.source}, Points: ${c.points}`).join('\n');
  }

  const userPrompt = `
Builder Name: ${data.username}
Reputation Score: ${data.score}
Reputation Level: ${data.level}
Transactions Count: ${data.txCount}
Projects Built: ${data.projectsBuilt}
Governance Votes Cast: ${data.votesCast}
Events Attended: ${data.eventsAttended}
Skills listed: ${data.skills.join(', ') || 'None'}

Verified Projects:
${projectInfo}

Other Contributions:
${contributionInfo}
`;

  // 1. Prioritize Hugging Face if key is available
  if (hfKey) {
    try {
      let endpoint = process.env.HUGGINGFACE_API_BASE || 'https://router.huggingface.co/v1';
      if (!endpoint.endsWith('/chat/completions') && !endpoint.endsWith('/chat/completions/')) {
        endpoint = endpoint.replace(/\/$/, '') + '/chat/completions';
      }
      
      const modelName = process.env.HUGGINGFACE_MODEL || 'meta-llama/Llama-3.2-3B-Instruct';

      const response = await httpRequest(endpoint, {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hfKey}`,
      }, {
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      });

      if (response.ok) {
        const result = await response.json();
        const contentStr = result.choices?.[0]?.message?.content;
        if (contentStr) {
          const parsed = parseJSONContent(contentStr);
          return {
            summary: parsed.summary || '',
            recommendations: parsed.recommendations || [],
            growthChecklist: parsed.growthChecklist || [],
            suggestedRoles: parsed.suggestedRoles || [],
          };
        }
      } else {
        const errText = await response.text();
        console.warn(`Hugging Face API returned error (HTTP ${response.status}):`, errText);
      }
    } catch (e) {
      console.error('Hugging Face API Error, falling back to other methods:', e);
    }
  }

  // 2. OpenAI Fallback
  if (openAIKey) {
    try {
      const apiEndpoint = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1/chat/completions';
      const modelName = process.env.OPENAI_MODEL_NAME || 'gpt-4o-mini';

      const response = await httpRequest(apiEndpoint, {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAIKey}`,
      }, {
        model: modelName,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      if (response.ok) {
        const result = await response.json();
        const contentStr = result.choices?.[0]?.message?.content;
        if (contentStr) {
          const parsed = parseJSONContent(contentStr);
          return {
            summary: parsed.summary || '',
            recommendations: parsed.recommendations || [],
            growthChecklist: parsed.growthChecklist || [],
            suggestedRoles: parsed.suggestedRoles || [],
          };
        }
      }
    } catch (e) {
      console.error('OpenAI API Error, falling back to rule-based engine:', e);
    }
  }

  // 3. Fallback Rule-Based Engine (Vercel best practice: reliable offline fallback)
  const recommendations: string[] = [];
  const growthChecklist: string[] = [];
  const suggestedRoles: string[] = [];

  if (data.projectsBuilt < 3) {
    recommendations.push('Deploy more applications on the QIE testnet to show active smart contract engineering.');
    growthChecklist.push('Build and deploy 1 project to earn 50 reputation points.');
  } else {
    recommendations.push('Superb building track record! Share your projects in the developer community channels.');
  }

  if (data.votesCast < 5) {
    recommendations.push('Participate in active QIE governance proposals. Casting votes establishes community trust.');
    growthChecklist.push('Vote on the next 3 active QIE DAO proposals (5 points each).');
  }

  if (data.eventsAttended < 2) {
    recommendations.push('Attend developer hackathons and meetups to expand your network.');
    growthChecklist.push('Register for the upcoming QIE Global Hackathon.');
  }

  if (data.skills.includes('Solidity') || data.skills.includes('Rust')) {
    suggestedRoles.push('Smart Contract Architect', 'Protocol Engineer');
  } else {
    suggestedRoles.push('Full Stack Web3 Builder', 'Developer Relations Advocate');
  }

  // Summary selection based on level
  let summary = `${data.username} is a promising contributor in the QIE ecosystem.`;
  if (data.level === 'Gold' || data.level === 'Platinum' || data.level === 'Diamond') {
    summary = `${data.username} is an elite ${data.level} tier builder. They exhibit high expertise in smart contracts and community building.`;
  } else if (data.level === 'Silver') {
    summary = `${data.username} is a solid Silver tier contributor with established on-chain activity and contract interaction history.`;
  }

  return {
    summary,
    recommendations,
    growthChecklist,
    suggestedRoles,
  };
}

export interface AITalentBuilder {
  id: string;
  walletAddress: string;
  username: string;
  avatar: string | null;
  bio: string | null;
  skills: string[];
  interests: string[];
  reputation?: {
    score: number;
    level: string;
    rank: number;
    projectsBuilt: number;
    votesCast: number;
    eventsAttended: number;
    contributionsCount: number;
  } | null;
  projects?: Array<{
    title: string;
    description: string;
    tags: string[];
  }>;
}

export interface AITalentSearchMatch {
  userId: string;
  username: string;
  reputationScore: number;
  reputationLevel: string;
  suitabilityExplanation: string;
  matchingScore: number;
}

export interface AITalentSearchResponse {
  matches: AITalentSearchMatch[];
}

export async function searchTalentWithAI(
  query: string,
  builders: AITalentBuilder[]
): Promise<AITalentSearchResponse> {
  const hfKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_KEY || process.env.HF_TOKEN;
  const openAIKey = process.env.OPENAI_API_KEY;

  const systemPrompt = `You are a technical recruiter and talent matcher for the QIE Blockchain ecosystem.
Analyze the recruiter's search query and the list of available builders to identify the best matches.
For each matching builder, you must provide:
1. "userId": matching the exact builder id.
2. "username": matching the exact builder username.
3. "reputationScore": matching the builder's reputation score.
4. "reputationLevel": matching the builder's reputation level.
5. "suitabilityExplanation": a highly detailed 2-3 sentence paragraph explaining exactly why this builder is a good fit for the query, referencing their specific skills, bio, or projects.
6. "matchingScore": an integer from 0 to 100 representing how well they fit the recruiter's request.

Provide the response strictly in JSON format matching this schema:
{
  "matches": [
    {
      "userId": "builder-id-here",
      "username": "builder-username-here",
      "reputationScore": 120,
      "reputationLevel": "Silver",
      "suitabilityExplanation": "Explanation paragraph of why this builder matches the query.",
      "matchingScore": 85
    }
  ]
}

Only return builders who actually have some relevance or matching skills/projects. Return up to 10 best matches, sorted by matchingScore in descending order.`;

  // Simplify builders list to minimize prompt size
  const simplifiedBuilders = builders.map(b => ({
    id: b.id,
    username: b.username,
    bio: b.bio || '',
    skills: b.skills || [],
    reputation: b.reputation ? {
      score: b.reputation.score,
      level: b.reputation.level,
      projectsBuilt: b.reputation.projectsBuilt,
      votesCast: b.reputation.votesCast,
      eventsAttended: b.reputation.eventsAttended,
      contributionsCount: b.reputation.contributionsCount
    } : null,
    projects: b.projects ? b.projects.map(p => ({
      title: p.title,
      description: p.description,
      tags: p.tags
    })) : []
  }));

  const userPrompt = `
Recruiter Query: "${query}"

Available Builders List:
${JSON.stringify(simplifiedBuilders, null, 2)}
`;

  // 1. Prioritize Hugging Face if key is available
  if (hfKey) {
    try {
      let endpoint = process.env.HUGGINGFACE_API_BASE || 'https://router.huggingface.co/v1';
      if (!endpoint.endsWith('/chat/completions') && !endpoint.endsWith('/chat/completions/')) {
        endpoint = endpoint.replace(/\/$/, '') + '/chat/completions';
      }
      
      const modelName = process.env.HUGGINGFACE_MODEL || 'meta-llama/Llama-3.2-3B-Instruct';

      const response = await httpRequest(endpoint, {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hfKey}`,
      }, {
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
      });

      if (response.ok) {
        const result = await response.json();
        const contentStr = result.choices?.[0]?.message?.content;
        if (contentStr) {
          const parsed = parseJSONContent(contentStr);
          if (parsed && Array.isArray(parsed.matches)) {
            return {
              matches: parsed.matches.map((m: any) => ({
                userId: m.userId || '',
                username: m.username || '',
                reputationScore: Number(m.reputationScore) || 0,
                reputationLevel: m.reputationLevel || 'Bronze',
                suitabilityExplanation: m.suitabilityExplanation || '',
                matchingScore: Number(m.matchingScore) || 0
              }))
            };
          }
        }
      } else {
        const errText = await response.text();
        console.warn(`Hugging Face API returned error (HTTP ${response.status}):`, errText);
      }
    } catch (e) {
      console.error('Hugging Face API Error for search, falling back to other methods:', e);
    }
  }

  // 2. OpenAI Fallback
  if (openAIKey) {
    try {
      const apiEndpoint = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1/chat/completions';
      const modelName = process.env.OPENAI_MODEL_NAME || 'gpt-4o-mini';

      const response = await httpRequest(apiEndpoint, {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAIKey}`,
      }, {
        model: modelName,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      if (response.ok) {
        const result = await response.json();
        const contentStr = result.choices?.[0]?.message?.content;
        if (contentStr) {
          const parsed = parseJSONContent(contentStr);
          if (parsed && Array.isArray(parsed.matches)) {
            return {
              matches: parsed.matches.map((m: any) => ({
                userId: m.userId || '',
                username: m.username || '',
                reputationScore: Number(m.reputationScore) || 0,
                reputationLevel: m.reputationLevel || 'Bronze',
                suitabilityExplanation: m.suitabilityExplanation || '',
                matchingScore: Number(m.matchingScore) || 0
              }))
            };
          }
        }
      }
    } catch (e) {
      console.error('OpenAI API Error for search, falling back to rule-based engine:', e);
    }
  }

  // 3. Fallback Rule-Based Engine
  console.log('Using rule-based keyword match fallback for talent search');
  
  const queryLower = query.toLowerCase();
  const stopwords = new Set([
    'the', 'a', 'an', 'looking', 'for', 'who', 'with', 'and', 'builder', 'developer',
    'engineer', 'designer', 'talent', 'need', 'seeking', 'to', 'in', 'on', 'at', 'of',
    'knows', 'has', 'have', 'built'
  ]);
  const queryWords = queryLower
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !stopwords.has(w));

  const matches: AITalentSearchMatch[] = [];

  for (const builder of builders) {
    let score = 0;
    const matchedReasons: string[] = [];

    // Check skills
    for (const word of queryWords) {
      const matchedSkill = builder.skills.find(s => s.toLowerCase().includes(word));
      if (matchedSkill) {
        score += 30;
        if (!matchedReasons.includes(`expertise in ${matchedSkill}`)) {
          matchedReasons.push(`expertise in ${matchedSkill}`);
        }
      }
    }

    // Check bio
    const bioLower = (builder.bio || '').toLowerCase();
    for (const word of queryWords) {
      if (bioLower.includes(word)) {
        score += 15;
        if (!matchedReasons.includes('relevant background in their profile bio')) {
          matchedReasons.push('relevant background in their profile bio');
        }
      }
    }

    // Check interests
    for (const word of queryWords) {
      const matchedInterest = builder.interests.find(i => i.toLowerCase().includes(word));
      if (matchedInterest) {
        score += 10;
      }
    }

    // Check projects
    if (builder.projects && builder.projects.length > 0) {
      for (const proj of builder.projects) {
        const titleLower = proj.title.toLowerCase();
        const descLower = proj.description.toLowerCase();
        const tagsLower = proj.tags.map(t => t.toLowerCase());

        for (const word of queryWords) {
          if (titleLower.includes(word) || descLower.includes(word) || tagsLower.includes(word)) {
            score += 25;
            if (!matchedReasons.includes(`built the project "${proj.title}"`)) {
              matchedReasons.push(`built the project "${proj.title}"`);
            }
          }
        }
      }
    }

    // Check custom role/activities keywords
    if (queryLower.includes('governance') || queryLower.includes('vote') || queryLower.includes('voting')) {
      if (builder.reputation && builder.reputation.votesCast > 0) {
        score += 20;
        matchedReasons.push(`active governance participant with ${builder.reputation.votesCast} votes`);
      }
    }
    if (queryLower.includes('event') || queryLower.includes('hackathon') || queryLower.includes('attend')) {
      if (builder.reputation && builder.reputation.eventsAttended > 0) {
        score += 20;
        matchedReasons.push(`attended ${builder.reputation.eventsAttended} ecosystem events`);
      }
    }
    if (queryLower.includes('experience') || queryLower.includes('senior') || queryLower.includes('expert') || queryLower.includes('lead')) {
      if (builder.reputation && builder.reputation.score > 300) {
        score += 20;
        matchedReasons.push(`senior ecosystem standing with a reputation level of ${builder.reputation.level}`);
      }
    }

    if (score > 0) {
      const finalMatchScore = Math.min(95, Math.round(50 + (score / 3)));
      
      let suitabilityExplanation = '';
      if (matchedReasons.length > 0) {
        suitabilityExplanation = `${builder.username} matches your query because of their ${matchedReasons.join(' and ')}. `;
      } else {
        suitabilityExplanation = `${builder.username} has relevant profile signals for your search. `;
      }

      suitabilityExplanation += `They have a reputation score of ${builder.reputation?.score || 0} (${builder.reputation?.level || 'Bronze'} tier) and have deployed ${builder.reputation?.projectsBuilt || 0} projects on QIE.`;

      matches.push({
        userId: builder.id,
        username: builder.username,
        reputationScore: builder.reputation?.score || 0,
        reputationLevel: builder.reputation?.level || 'Bronze',
        suitabilityExplanation,
        matchingScore: finalMatchScore
      });
    }
  }

  if (matches.length === 0 && builders.length > 0) {
    const sortedBuilders = [...builders].sort((a, b) => (b.reputation?.score || 0) - (a.reputation?.score || 0)).slice(0, 5);
    for (const builder of sortedBuilders) {
      matches.push({
        userId: builder.id,
        username: builder.username,
        reputationScore: builder.reputation?.score || 0,
        reputationLevel: builder.reputation?.level || 'Bronze',
        suitabilityExplanation: `${builder.username} is one of the top contributors in the QIE ecosystem with a reputation score of ${builder.reputation?.score || 0}. While they don't explicitly list matching keywords, their overall active participation makes them a reliable candidate.`,
        matchingScore: 50
      });
    }
  }

  return {
    matches: matches.sort((a, b) => b.matchingScore - a.matchingScore).slice(0, 10)
  };
}
