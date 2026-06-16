import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'qie_dashboard_session';

// Ecosystem areas with their relevant contribution types
const ECOSYSTEM_AREA_MAP: Record<string, {
  description: string;
  firstSteps: string[];
  contributionTypes: string[];
  suggestedRoles: string[];
}> = {
  'DeFi & Protocols': {
    description: 'Build or contribute to decentralized finance applications, AMMs, lending protocols, and yield strategies on QIE.',
    firstSteps: [
      'Deploy a basic ERC-20 token contract on QIE Testnet using Hardhat or Remix.',
      'Fork and study QieSwap\'s open-source AMM contract on GitHub.',
      'Write a technical article comparing AMM models (Uniswap v2 vs v3) and publish it on Mirror or Hashnode.',
      'Submit a bug report or security advisory on any open-source QIE DeFi project.',
    ],
    contributionTypes: ['project', 'article', 'bug_report'],
    suggestedRoles: ['Smart Contract Engineer', 'Protocol Architect', 'DeFi Researcher'],
  },
  'Infrastructure & Nodes': {
    description: 'Run and optimize validators, build node tooling, monitoring dashboards, and DevOps pipelines for QIE network.',
    firstSteps: [
      'Spin up a QIE Testnet node using the QieStack CLI or official Docker images.',
      'Set up a validator monitoring dashboard using Grafana + Prometheus or Netdata.',
      'Publish a step-by-step validator setup guide to GitBook or GitHub.',
      'Open a GitHub issue or PR on the QIE node implementation repository.',
    ],
    contributionTypes: ['project', 'article'],
    suggestedRoles: ['Validator Operator', 'DevOps Engineer', 'Infrastructure Architect'],
  },
  'Identity & Privacy': {
    description: 'Build self-sovereign identity solutions, ZK-proof systems, and QIE Pass integrations.',
    firstSteps: [
      'Integrate QIE Pass as an identity provider in a test Next.js application.',
      'Explore ZK-SNARK libraries (Circom, Bellman) and write a "Hello ZK" proof tutorial.',
      'Create a DID document on QIE testnet and publish a walkthrough article.',
      'Submit a privacy improvement proposal or bug advisory related to credential handling.',
    ],
    contributionTypes: ['project', 'article', 'bug_report'],
    suggestedRoles: ['Identity Engineer', 'ZK Protocol Researcher', 'Privacy Advocate'],
  },
  'Payments & Commerce': {
    description: 'Build merchant payment tooling, point-of-sale systems, QR payment flows, and stablecoin integrations for real-world commerce.',
    firstSteps: [
      'Build a simple QR-code payment generator using QIE\'s RPC and viem library.',
      'Create a Next.js storefront demo accepting QUSDC stablecoin payments.',
      'Write a guide on integrating QiePay SDK for iOS and Android developers.',
      'Test and document the QUSDC stable coin contract API on testnet.',
    ],
    contributionTypes: ['project', 'article'],
    suggestedRoles: ['Payments Engineer', 'Mobile Web3 Developer', 'Merchant Integrations Lead'],
  },
  'Gaming & NFTs': {
    description: 'Build play-to-own games, dynamic NFT systems, and gaming infrastructure for the QIE chain.',
    firstSteps: [
      'Mint your first NFT collection on QIE Testnet using an ERC-721 contract.',
      'Build a simple on-chain game mechanic (e.g. randomized trait reveal) using Solidity.',
      'Write a technical article on dynamic NFT metadata using ERC-1155 on QIE.',
      'Create a Unity or Phaser demo game connected to a QIE wallet.',
    ],
    contributionTypes: ['project', 'article'],
    suggestedRoles: ['Game Developer', 'NFT Engineer', 'Metaverse Builder'],
  },
  'Developer Tooling': {
    description: 'Build SDKs, Hardhat plugins, Remix extensions, CLI tools, and testing frameworks that improve the QIE developer experience.',
    firstSteps: [
      'Create a Hardhat plugin that adds QIE Testnet as a default network configuration.',
      'Build a CLI script to scaffold new QIE smart contract projects.',
      'Write a comprehensive guide on unit testing Solidity contracts with Foundry on QIE.',
      'Publish a QIE network config package to npm.',
    ],
    contributionTypes: ['project', 'article'],
    suggestedRoles: ['Developer Experience Engineer', 'SDK Author', 'OSS Contributor'],
  },
  'Governance & DAOs': {
    description: 'Participate in and build governance infrastructure, DAO tooling, and on-chain voting systems within the QIE ecosystem.',
    firstSteps: [
      'Vote on an active QIE governance proposal via the official governance portal.',
      'Write a summary and analysis of an active QIE Improvement Proposal (QIP).',
      'Build a governance dashboard that shows active proposals, vote counts, and quorum.',
      'Submit your own QIP for a feature or improvement you\'d like to see in the ecosystem.',
    ],
    contributionTypes: ['vote', 'article', 'project'],
    suggestedRoles: ['Governance Coordinator', 'DAO Contributor', 'Protocol Politician'],
  },
  'Community & Education': {
    description: 'Grow the QIE ecosystem through content creation, documentation, translations, workshops, and community coordination.',
    firstSteps: [
      'Write a beginner-friendly "Getting Started with QIE" article and publish it online.',
      'Translate an existing QIE documentation page into another language.',
      'Host a community call or workshop introducing QIE to developers in your area.',
      'Create a YouTube tutorial covering how to connect MetaMask to QIE Testnet.',
    ],
    contributionTypes: ['article', 'credential'],
    suggestedRoles: ['Developer Relations', 'Technical Writer', 'Community Lead'],
  },
};

/**
 * POST: Generates an AI-powered onboarding guide for new users who have declared
 * their ecosystem interests but have no activity yet.
 */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { interests, goals } = body;

    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return NextResponse.json({ error: 'interests array is required' }, { status: 400 });
    }

    // Build a curated guide from the selected interest areas
    const selectedAreas = interests
      .map((interest: string) => ECOSYSTEM_AREA_MAP[interest])
      .filter(Boolean);

    if (selectedAreas.length === 0) {
      return NextResponse.json({ error: 'No matching ecosystem areas found' }, { status: 400 });
    }

    // Collect all first steps, contribution types, and roles across selected areas
    const allFirstSteps = selectedAreas.flatMap(a => a.firstSteps).slice(0, 6);
    const allRoles = [...new Set(selectedAreas.flatMap(a => a.suggestedRoles))].slice(0, 4);
    const allContribTypes = [...new Set(selectedAreas.flatMap(a => a.contributionTypes))];

    // Build a personalized summary sentence
    const areaNames = interests.join(', ');
    const goalsText = goals?.trim() ? ` Their stated goal: "${goals}".` : '';

    // Try AI generation first, fall back to curated guide
    const hfKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_KEY || process.env.HF_TOKEN;
    const openAIKey = process.env.OPENAI_API_KEY;

    let aiSummary: string | null = null;

    const systemPrompt = `You are an expert ecosystem growth advisor for the QIE Blockchain. 
A brand new user with zero on-chain activity has just joined. 
Based on their declared interests, provide a warm, inspiring, personalized 2-3 sentence welcome and direction summary.
Be specific to their interest areas. Keep it motivating and actionable. Return ONLY the summary text, no JSON.`;

    const userPrompt = `New user's declared ecosystem interests: ${areaNames}.${goalsText}
Write a warm, inspiring 2-3 sentence summary pointing them toward their first steps in the QIE ecosystem.`;

    if (hfKey) {
      try {
        const { default: https } = await import('https');
        const { default: http } = await import('http');

        const makeRequest = (url: string, headers: Record<string, string>, body: any) =>
          new Promise<string>((resolve, reject) => {
            const parsedUrl = new URL(url);
            const protocol = parsedUrl.protocol === 'https:' ? https : http;
            const req = protocol.request({
              hostname: parsedUrl.hostname,
              port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
              path: parsedUrl.pathname + parsedUrl.search,
              method: 'POST',
              headers,
              timeout: 30000,
            }, (res) => {
              let data = '';
              res.on('data', c => data += c);
              res.on('end', () => resolve(data));
            });
            req.on('error', reject);
            req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
            req.write(JSON.stringify(body));
            req.end();
          });

        let endpoint = process.env.HUGGINGFACE_API_BASE || 'https://router.huggingface.co/v1';
        if (!endpoint.endsWith('/chat/completions')) {
          endpoint = endpoint.replace(/\/$/, '') + '/chat/completions';
        }

        const rawResponse = await makeRequest(endpoint, {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${hfKey}`,
        }, {
          model: process.env.HUGGINGFACE_MODEL || 'meta-llama/Llama-3.2-3B-Instruct',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 200,
        });

        const parsed = JSON.parse(rawResponse);
        const content = parsed.choices?.[0]?.message?.content?.trim();
        if (content && content.length > 30) {
          aiSummary = content;
        }
      } catch (e) {
        console.warn('HF AI summary generation failed, using curated fallback:', e);
      }
    }

    // Fallback summary if AI unavailable
    if (!aiSummary) {
      const areaDescriptions = selectedAreas.map(a => a.description).join(' ');
      aiSummary = `Welcome to the QIE ecosystem! Based on your interest in ${areaNames}, you're positioned to make a real impact. ${areaDescriptions.slice(0, 180)}... Start with the checklist below to earn your first reputation points.`;
    }

    const guide = {
      summary: aiSummary,
      selectedAreas: interests,
      firstSteps: allFirstSteps,
      suggestedRoles: allRoles,
      contributionTypes: allContribTypes,
      nextMilestone: `Earn your first 50 reputation points by completing a project or 20 points by publishing a technical article.`,
    };

    return NextResponse.json({ guide }, { status: 200 });
  } catch (error) {
    console.error('Onboarding guide API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
