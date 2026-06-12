const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mockUsers = [
  {
    username: 'alice_defi_queen',
    walletAddress: '0x2a1ec0de01111111111111111111111111111111',
    qieUserId: 'alice.qie',
    bio: 'Co-founder & Lead Smart Contract Architect of QieSwap. Passionate about liquidity mechanics, yield aggregation, and advanced EVM optimizations on QIE. Veteran solidity dev.',
    skills: ['Solidity', 'DeFi', 'Liquidity Pools', 'EVM', 'Smart Contracts', 'Governance', 'Yield Farming'],
    interests: ['AMM Design', 'Stablecoins', 'Protocol Security', 'Tokenomics'],
    reputation: {
      score: 1835,
      level: 'Diamond',
      projectsBuilt: 2,
      votesCast: 45,
      eventsAttended: 6,
      contributionsCount: 1289
    },
    projects: [
      {
        title: 'QieSwap AMM',
        description: 'Decentralized automated market maker protocol featuring low slippage and concentrated liquidity pools built specifically for QIE Network.',
        githubUrl: 'https://github.com/example/qieswap-core',
        demoUrl: 'https://qieswap.demo.qie',
        tags: ['DeFi', 'AMM', 'Solidity', 'Concentrated Liquidity']
      },
      {
        title: 'QieLend Protocol',
        description: 'Decentralized lending and borrowing platform allowing users to supply and borrow assets with dynamic algorithmic interest rates.',
        githubUrl: 'https://github.com/example/qielend-protocol',
        demoUrl: 'https://qielend.demo.qie',
        tags: ['DeFi', 'Lending', 'Borrowing', 'EVM']
      }
    ],
    contributions: [
      { type: 'project', source: 'QieSwap Core Launch', points: 50, metadata: JSON.stringify({ version: '1.0.0' }) },
      { type: 'project', source: 'QieLend Core Launch', points: 50, metadata: JSON.stringify({ version: '1.0.0' }) },
      { type: 'article', source: 'Deep Dive into QIE EVM Gastoken Optimization', points: 20, metadata: JSON.stringify({ platform: 'Medium' }) },
      { type: 'article', source: 'Building Yield Aggregators on QIE', points: 20, metadata: JSON.stringify({ platform: 'Substack' }) },
      { type: 'bug_report', source: 'Reentrancy path in validator rewards contract', points: 15, metadata: JSON.stringify({ severity: 'High' }) },
      { type: 'bug_report', source: 'Math overflow in governance voting power calculation', points: 15, metadata: JSON.stringify({ severity: 'Medium' }) },
      { type: 'vote', source: 'Vote for QIP-4: EVM Upgrade', points: 5, metadata: JSON.stringify({ proposalId: 'qip-4' }) },
      { type: 'vote', source: 'Vote for QIP-8: Gas Reductions', points: 5, metadata: JSON.stringify({ proposalId: 'qip-8' }) },
      { type: 'event', source: 'QIE Global Hackathon Mentor', points: 10, metadata: JSON.stringify({ role: 'Mentor' }) }
    ]
  },
  {
    username: 'gaming_guru_qie',
    walletAddress: '0x3b2ec0de02222222222222222222222222222222',
    qieUserId: 'guru.qie',
    bio: 'Lead developer at QieQuest. Building play-to-own RPG games utilizing dynamic NFTs and fast finality on QIE chain. Gaming & NFT infrastructure specialist.',
    skills: ['Rust', 'Unity', 'GameDev', 'NFTs', 'ERC-1155', 'Smart Contracts', 'Frontend'],
    interests: ['Web3 Gaming', 'Dynamic NFTs', 'Metaverses', 'Play-to-Own'],
    reputation: {
      score: 950,
      level: 'Platinum',
      projectsBuilt: 2,
      votesCast: 12,
      eventsAttended: 4,
      contributionsCount: 673
    },
    projects: [
      {
        title: 'QieQuest RPG',
        description: 'An open-world fantasy RPG utilizing dynamic NFTs on the QIE network to represent unique equipment, skills, and progress.',
        githubUrl: 'https://github.com/example/qiequest-game',
        demoUrl: 'https://qiequest.demo.qie',
        tags: ['Gaming', 'Unity', 'NFTs', 'Rust']
      },
      {
        title: 'QieMinter Asset Engine',
        description: 'Batch-minting utility and contract templates tailored to gaming developers looking to mint thousands of ERC-1155 game assets in one tx.',
        githubUrl: 'https://github.com/example/qieminter-engine',
        demoUrl: 'https://qieminter.demo.qie',
        tags: ['Developer Tools', 'NFTs', 'ERC-1155']
      }
    ],
    contributions: [
      { type: 'project', source: 'QieQuest RPG Game Launch', points: 50, metadata: JSON.stringify({ version: '0.8.0' }) },
      { type: 'project', source: 'QieMinter Batch SDK', points: 50, metadata: JSON.stringify({ version: '1.2.0' }) },
      { type: 'article', source: 'Introduction to ERC-1155 on QIE Chain', points: 20, metadata: JSON.stringify({ platform: 'Dev.to' }) },
      { type: 'article', source: 'Optimizing NFT Metadata Storage', points: 20, metadata: JSON.stringify({ platform: 'GitBook' }) },
      { type: 'vote', source: 'Vote for QIP-12: NFT Royalty Standard', points: 5, metadata: JSON.stringify({ proposalId: 'qip-12' }) },
      { type: 'event', source: 'HackQie Gaming Track Speaker', points: 10, metadata: JSON.stringify({ role: 'Speaker' }) }
    ]
  },
  {
    username: 'infra_god_qie',
    walletAddress: '0x4c3ec0de03333333333333333333333333333333',
    qieUserId: 'infra.qie',
    bio: 'Validator operator for QIE Network. Core infrastructure contributor. Building node telemetry tools, RPC load balancers, and open-source staking dashboards.',
    skills: ['Go', 'Docker', 'Kubernetes', 'DevOps', 'Staking', 'RPC Nodes', 'Telemetry', 'Monitoring'],
    interests: ['Consensus Mechanisms', 'Node Performance', 'Decentralization', 'Validator Security'],
    reputation: {
      score: 530,
      level: 'Gold',
      projectsBuilt: 2,
      votesCast: 12,
      eventsAttended: 5,
      contributionsCount: 226
    },
    projects: [
      {
        title: 'QieTelemetry',
        description: 'Real-time telemetry and dashboard for QIE node operators to monitor peer count, disk I/O, sync status, and consensus voting efficiency.',
        githubUrl: 'https://github.com/example/qietelemetry-dashboard',
        demoUrl: 'https://telemetry.demo.qie',
        tags: ['Infrastructure', 'Telemetry', 'Monitoring', 'Go']
      },
      {
        title: 'QieStack Deployer',
        description: 'CLI scripts for automated, containerized node deployment. Spin up mainnet or testnet validators in under five minutes with Docker.',
        githubUrl: 'https://github.com/example/qiestack-cli',
        demoUrl: 'https://qiestack.demo.qie',
        tags: ['Infrastructure', 'DevOps', 'Docker']
      }
    ],
    contributions: [
      { type: 'project', source: 'QieTelemetry Core Release', points: 50, metadata: JSON.stringify({ version: '1.0.1' }) },
      { type: 'project', source: 'QieStack DevOps CLI', points: 50, metadata: JSON.stringify({ version: '0.9.0' }) },
      { type: 'article', source: 'Step-by-Step QIE Validator Node Setup Guide', points: 20, metadata: JSON.stringify({ platform: 'GitBook' }) },
      { type: 'bug_report', source: 'Validator sync memory leak', points: 15, metadata: JSON.stringify({ severity: 'High' }) },
      { type: 'bug_report', source: 'RPC WebSocket connection dropped on high throughput', points: 15, metadata: JSON.stringify({ severity: 'High' }) },
      { type: 'vote', source: 'Vote for QIP-3: Block Time Reduction', points: 5, metadata: JSON.stringify({ proposalId: 'qip-3' }) },
      { type: 'event', source: 'QIE Node Operators Roundtable', points: 10, metadata: JSON.stringify({ role: 'Panelist' }) }
    ]
  },
  {
    username: 'pay_master',
    walletAddress: '0x5d4ec0de04444444444444444444444444444444',
    qieUserId: 'pay.qie',
    bio: 'Building QiePay mobile SDKs for real-world merchant integrations. Bringing stablecoin micropayments to retail stores. Expert in React Native and mobile wallets.',
    skills: ['React Native', 'TypeScript', 'Payments', 'APIs', 'Mobile Dev', 'Stablecoins', 'SDKs'],
    interests: ['Micropayments', 'Merchant Onboarding', 'Real-World Assets', 'UI/UX'],
    reputation: {
      score: 405,
      level: 'Gold',
      projectsBuilt: 2,
      votesCast: 15,
      eventsAttended: 3,
      contributionsCount: 144
    },
    projects: [
      {
        title: 'QiePay Mobile SDK',
        description: 'React Native SDK allowing iOS and Android apps to accept QIE and ecosystem stablecoins with local hardware merchant support.',
        githubUrl: 'https://github.com/example/qiepay-mobile-sdk',
        demoUrl: 'https://qiepay.demo.qie',
        tags: ['Payments', 'React Native', 'SDK', 'Mobile']
      },
      {
        title: 'QiePOS Point-of-Sale',
        description: 'Web-based POS interface for retail merchants. Generates instant QR codes for payment requests matching QIE standards.',
        githubUrl: 'https://github.com/example/qiepos-terminal',
        demoUrl: 'https://qiepos.demo.qie',
        tags: ['Payments', 'Point of Sale', 'TypeScript']
      }
    ],
    contributions: [
      { type: 'project', source: 'QiePay Mobile SDK Launch', points: 50, metadata: JSON.stringify({ version: '1.0.0' }) },
      { type: 'project', source: 'QiePOS Simulator', points: 50, metadata: JSON.stringify({ version: '2.0.0' }) },
      { type: 'article', source: 'Integrating QiePay in iOS/Android apps', points: 20, metadata: JSON.stringify({ platform: 'Medium' }) },
      { type: 'article', source: 'Micropayments Merchant Integration Guide', points: 20, metadata: JSON.stringify({ platform: 'Docs' }) },
      { type: 'vote', source: 'Vote for QIP-14: Stablecoin gas payment support', points: 5, metadata: JSON.stringify({ proposalId: 'qip-14' }) },
      { type: 'event', source: 'Payments in Web3 Panel at QieCon', points: 10, metadata: JSON.stringify({ role: 'Speaker' }) }
    ]
  },
  {
    username: 'zk_shadow',
    walletAddress: '0x6e5ec0de05555555555555555555555555555555',
    qieUserId: 'shadow.qie',
    bio: 'ZK-snark researcher and identity adapter builder. Enhancing QIE Pass privacy with zero-knowledge credential verification. Active in ZK research groups.',
    skills: ['Circom', 'ZK-Snarks', 'Cryptography', 'Rust', 'Identity', 'QIE Pass', 'Privacy'],
    interests: ['Self-Sovereign Identity', 'Private Governance', 'Zero Knowledge Proofs'],
    reputation: {
      score: 235,
      level: 'Silver',
      projectsBuilt: 1,
      votesCast: 8,
      eventsAttended: 2,
      contributionsCount: 64
    },
    projects: [
      {
        title: 'QiePrivateConsent ZK',
        description: 'Zero-knowledge verification helper. Generates client-side proofs of QIE Pass credentials (e.g. KYC status) without disclosing user addresses.',
        githubUrl: 'https://github.com/example/qieprivateconsent-zk',
        demoUrl: 'https://privateconsent.demo.qie',
        tags: ['Identity', 'ZK-Snarks', 'Circom', 'Privacy']
      }
    ],
    contributions: [
      { type: 'project', source: 'QiePrivateConsent Core Codebase', points: 50, metadata: JSON.stringify({ status: 'Alpha' }) },
      { type: 'article', source: 'Self-Sovereign Identity and ZK Proofs on QIE', points: 20, metadata: JSON.stringify({ platform: 'Substack' }) },
      { type: 'article', source: 'QIE Pass DID Integration Walkthrough', points: 20, metadata: JSON.stringify({ platform: 'Medium' }) },
      { type: 'bug_report', source: 'Private key derivation security advisory in JS wrapper', points: 15, metadata: JSON.stringify({ severity: 'High' }) },
      { type: 'vote', source: 'Vote for QIP-9: Zero-Knowledge Precompiles', points: 5, metadata: JSON.stringify({ proposalId: 'qip-9' }) },
      { type: 'event', source: 'ZK Privacy Hackathon', points: 10, metadata: JSON.stringify({ role: 'Judge' }) }
    ]
  },
  {
    username: 'tooling_titan',
    walletAddress: '0x7f6ec0de06666666666666666666666666666666',
    qieUserId: 'titan.qie',
    bio: 'Developing Hardhat plugins and Remix integrations specifically tailored for the QIE compiler and explorer. Making development on QIE seamless.',
    skills: ['TypeScript', 'Node.js', 'Hardhat', 'Compiler', 'Developer Tools', 'CI/CD'],
    interests: ['Dev Experience', 'Automated Testing', 'Tooling', 'Code Quality'],
    reputation: {
      score: 250,
      level: 'Silver',
      projectsBuilt: 1,
      votesCast: 6,
      eventsAttended: 3,
      contributionsCount: 74
    },
    projects: [
      {
        title: 'Remix QIE Compiler Plugin',
        description: 'Remix IDE extension enabling developers to compile, deploy and debug smart contracts directly on QIE Mainnet/Testnet from the browser.',
        githubUrl: 'https://github.com/example/remix-qie-compiler',
        demoUrl: 'https://remix-plugin.demo.qie',
        tags: ['Developer Tools', 'Remix', 'TypeScript']
      }
    ],
    contributions: [
      { type: 'project', source: 'Remix QIE Plugin Launch', points: 50, metadata: JSON.stringify({ version: '1.0.0' }) },
      { type: 'article', source: 'Debugging QIE Smart Contracts with Remix', points: 20, metadata: JSON.stringify({ platform: 'Hashnode' }) },
      { type: 'article', source: 'Hardhat Config Guide for QIE Testnet', points: 20, metadata: JSON.stringify({ platform: 'GitBook' }) },
      { type: 'bug_report', source: 'Artifact compilation error under compiler version 0.8.20', points: 15, metadata: JSON.stringify({ severity: 'Medium' }) },
      { type: 'vote', source: 'Vote for QIP-5: Standardizing Error Codes', points: 5, metadata: JSON.stringify({ proposalId: 'qip-5' }) },
      { type: 'event', source: 'QIE DevTools Workshop', points: 10, metadata: JSON.stringify({ role: 'Host' }) }
    ]
  },
  {
    username: 'pixel_perfect_qie',
    walletAddress: '0x8a7ec0de07777777777777777777777777777777',
    qieUserId: 'pixel.qie',
    bio: 'Creative designer and front-end developer. Designing gorgeous dashboard templates for QIE dApps. Creating modern, accessible Web3 components.',
    skills: ['React', 'CSS', 'UI/UX Design', 'Figma', 'TailwindCSS', 'Accessibility', 'Web3 React'],
    interests: ['Aesthetics', 'Glassmorphism', 'Micro-interactions', 'User Onboarding'],
    reputation: {
      score: 85,
      level: 'Bronze',
      projectsBuilt: 1,
      votesCast: 2,
      eventsAttended: 1,
      contributionsCount: 19
    },
    projects: [
      {
        title: 'QieComponents UI',
        description: 'Modern, highly accessible Tailwind and React components featuring glowing dark-mode aesthetics for QIE blockchain dashboards.',
        githubUrl: 'https://github.com/example/qiecomponents-ui',
        demoUrl: 'https://ui.demo.qie',
        tags: ['UI/UX', 'React', 'TailwindCSS', 'Design System']
      }
    ],
    contributions: [
      { type: 'project', source: 'QieComponents Core Repository', points: 50, metadata: JSON.stringify({ status: 'Beta' }) },
      { type: 'article', source: 'QIE Ecosystem Design & Accessibility Standards', points: 20, metadata: JSON.stringify({ platform: 'Figma Community' }) },
      { type: 'vote', source: 'Vote for QIP-11: Website Redesign Proposal', points: 5, metadata: JSON.stringify({ proposalId: 'qip-11' }) },
      { type: 'event', source: 'Ethereum/QIE Design Salon London', points: 10, metadata: JSON.stringify({ role: 'Participant' }) }
    ]
  },
  {
    username: 'community_champion',
    walletAddress: '0x9b8ec0de08888888888888888888888888888888',
    qieUserId: 'champion.qie',
    bio: 'Organizing community calls, managing QIE discord moderation, and translating technical docs into multiple languages. Bridge between devs and users.',
    skills: ['Community Management', 'Translation', 'Technical Writing', 'DAO Coordination', 'Governance'],
    interests: ['Decentralized Governance', 'Community Education', 'Localization'],
    reputation: {
      score: 75,
      level: 'Bronze',
      projectsBuilt: 0,
      votesCast: 5,
      eventsAttended: 2,
      contributionsCount: 18
    },
    projects: [],
    contributions: [
      { type: 'article', source: 'QIE Community FAQ Translation (Spanish/German)', points: 20, metadata: JSON.stringify({ languages: ['Spanish', 'German'] }) },
      { type: 'article', source: 'Ecosystem Glossary', points: 20, metadata: JSON.stringify({ platform: 'GitBook' }) },
      { type: 'vote', source: 'Vote for QIP-6: Community Grant Round 1', points: 5, metadata: JSON.stringify({ proposalId: 'qip-6' }) },
      { type: 'event', source: 'QIE Ecosystem Call Host', points: 10, metadata: JSON.stringify({ role: 'Host' }) },
      { type: 'event', source: 'Community Moderation Q2', points: 10, metadata: JSON.stringify({ role: 'Moderator' }) }
    ]
  }
];

async function seed() {
  console.log('Seeding mock data for QIE Ecosystem Leaderboard...');

  for (const mock of mockUsers) {
    const username = mock.username;
    const address = mock.walletAddress.toLowerCase();

    // 1. Clean up existing records for this user (safeguards against duplicates)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { walletAddress: address }
        ]
      }
    });

    if (existingUser) {
      console.log(`Cleaning up existing mock data for user: ${username}`);
      await prisma.user.delete({
        where: { id: existingUser.id }
      });
    }

    // 2. Insert User
    console.log(`Creating user: ${username}`);
    const user = await prisma.user.create({
      data: {
        qieUserId: mock.qieUserId,
        walletAddress: address,
        username: mock.username,
        bio: mock.bio,
        skills: mock.skills,
        interests: mock.interests,
        avatar: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${mock.username}`
      }
    });

    // 3. Insert Projects
    for (const proj of mock.projects) {
      console.log(`  Adding project: ${proj.title}`);
      await prisma.project.create({
        data: {
          userId: user.id,
          title: proj.title,
          description: proj.description,
          githubUrl: proj.githubUrl,
          demoUrl: proj.demoUrl,
          tags: proj.tags
        }
      });
    }

    // 4. Insert Contributions
    for (const contr of mock.contributions) {
      console.log(`  Adding contribution: ${contr.source}`);
      await prisma.contribution.create({
        data: {
          userId: user.id,
          type: contr.type,
          source: contr.source,
          points: contr.points,
          metadata: contr.metadata
        }
      });
    }

    // 5. Create/Upsert ReputationProfile
    console.log(`  Setting reputation profile for ${username}: score = ${mock.reputation.score}, level = ${mock.reputation.level}`);
    await prisma.reputationProfile.create({
      data: {
        userId: user.id,
        score: mock.reputation.score,
        level: mock.reputation.level,
        rank: 0,
        projectsBuilt: mock.reputation.projectsBuilt,
        votesCast: mock.reputation.votesCast,
        eventsAttended: mock.reputation.eventsAttended,
        contributionsCount: mock.reputation.contributionsCount
      }
    });
  }

  // 6. Recalculate ranks based on scores
  console.log('Recalculating ranks across the leaderboard...');
  const allProfiles = await prisma.reputationProfile.findMany({
    orderBy: { score: 'desc' }
  });

  for (let i = 0; i < allProfiles.length; i++) {
    const profile = allProfiles[i];
    await prisma.reputationProfile.update({
      where: { id: profile.id },
      data: { rank: i + 1 }
    });
  }

  console.log('Mock data seeded successfully.');
}

seed()
  .catch((e) => {
    console.error('Seed execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
