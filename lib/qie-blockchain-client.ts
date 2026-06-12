import { createPublicClient, http, formatEther } from 'viem';

export const qieMainnet = {
  id: 1990,
  name: 'QIE Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'QIEV3',
    symbol: 'QIEV3',
  },
  rpcUrls: {
    default: { http: ['https://rpc1mainnet.qie.digital/'] },
    public: { http: ['https://rpc1mainnet.qie.digital/'] },
  },
  blockExplorers: {
    default: { name: 'QIE Explorer', url: 'https://mainnet.qie.digital' },
  },
};

export const qieTestnet = {
  id: 1983,
  name: 'QIE Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'QIE',
    symbol: 'QIE',
  },
  rpcUrls: {
    default: { http: ['https://rpc1testnet.qie.digital/'] },
    public: { http: ['https://rpc1testnet.qie.digital/'] },
  },
  blockExplorers: {
    default: { name: 'QIE Explorer', url: 'https://testnet.qie.digital' },
  },
};

export function getRpcClient(network: 'mainnet' | 'testnet' = 'mainnet') {
  const chain = network === 'mainnet' ? qieMainnet : qieTestnet;
  return createPublicClient({
    chain,
    transport: http(chain.rpcUrls.default.http[0]),
  });
}

export interface LiveActivity {
  balance: string;
  txCount: number;
  contractInteractions: number;
  validatorActivity: number;
  governanceParticipation: number;
  activeDaysCount: number;
  recentTxs: Array<{
    hash: string;
    from: string;
    to: string;
    value: string;
    timeStamp: string;
    isError: string;
    input: string;
  }>;
}

/**
 * Fetch live blockchain metrics for a given wallet address.
 * Combines direct RPC calls (balance, txCount) and Explorer API fetches (tx history, active days, contract interactions).
 */
export async function fetchLiveQieActivity(
  address: string,
  network: 'mainnet' | 'testnet' = (process.env.QIE_NETWORK as any) || 'mainnet'
): Promise<LiveActivity> {
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return {
      balance: '0',
      txCount: 0,
      contractInteractions: 0,
      validatorActivity: 0,
      governanceParticipation: 0,
      activeDaysCount: 1,
      recentTxs: [],
    };
  }

  const normalizedAddress = address.toLowerCase();

  // Return custom mock data for rich mock profiles to enable realistic search & dashboard display
  const MOCK_PROFILES_ACTIVITY: Record<string, LiveActivity> = {
    '0x2a1ec0de01111111111111111111111111111111': {
      balance: '42500.50',
      txCount: 1220,
      contractInteractions: 950,
      validatorActivity: 0,
      governanceParticipation: 0,
      activeDaysCount: 280,
      recentTxs: [
        { hash: '0xdefi111122223333444455556666777788889999aaaabbbbccccddddeeeeffff', from: '0x2a1ec0de01111111111111111111111111111111', to: '0x0000000000000000000000000000000000000001', value: '10.50', timeStamp: Math.floor(Date.now() / 1000 - 3600).toString(), isError: '0', input: '0xswapExactTokensForTokens' },
        { hash: '0xdefi88889999aaaabbbbccccddddeeeeffff1111222233334444555566667777', from: '0x2a1ec0de01111111111111111111111111111111', to: '0x0000000000000000000000000000000000000002', value: '0.00', timeStamp: Math.floor(Date.now() / 1000 - 86400).toString(), isError: '0', input: '0xaddLiquidity' }
      ]
    },
    '0x3b2ec0de02222222222222222222222222222222': {
      balance: '1250.75',
      txCount: 650,
      contractInteractions: 480,
      validatorActivity: 0,
      governanceParticipation: 0,
      activeDaysCount: 110,
      recentTxs: [
        { hash: '0xgame111122223333444455556666777788889999aaaabbbbccccddddeeeeffff', from: '0x3b2ec0de02222222222222222222222222222222', to: '0x0000000000000000000000000000000000000003', value: '0.00', timeStamp: Math.floor(Date.now() / 1000 - 7200).toString(), isError: '0', input: '0xmintNFT' }
      ]
    },
    '0x4c3ec0de03333333333333333333333333333333': {
      balance: '85000.00',
      txCount: 200,
      contractInteractions: 180,
      validatorActivity: 0,
      governanceParticipation: 0,
      activeDaysCount: 150,
      recentTxs: [
        { hash: '0xinfra111122223333444455556666777788889999aaaabbbbccccddddeeeeffff', from: '0x4c3ec0de03333333333333333333333333333333', to: '0x0000000000000000000000000000000000000004', value: '5000.00', timeStamp: Math.floor(Date.now() / 1000 - 1800).toString(), isError: '0', input: '0xdelegate' }
      ]
    },
    '0x5d4ec0de04444444444444444444444444444444': {
      balance: '320.10',
      txCount: 120,
      contractInteractions: 55,
      validatorActivity: 0,
      governanceParticipation: 0,
      activeDaysCount: 45,
      recentTxs: [
        { hash: '0xpay111122223333444455556666777788889999aaaabbbbccccddddeeeeffff', from: '0x5d4ec0de04444444444444444444444444444444', to: '0x0000000000000000000000000000000000000005', value: '5.50', timeStamp: Math.floor(Date.now() / 1000 - 1200).toString(), isError: '0', input: '0xpayMerchant' }
      ]
    },
    '0x6e5ec0de05555555555555555555555555555555': {
      balance: '145.00',
      txCount: 50,
      contractInteractions: 35,
      validatorActivity: 0,
      governanceParticipation: 0,
      activeDaysCount: 30,
      recentTxs: [
        { hash: '0xzk111122223333444455556666777788889999aaaabbbbccccddddeeeeffff', from: '0x6e5ec0de05555555555555555555555555555555', to: '0x0000000000000000000000000000000000000006', value: '0.00', timeStamp: Math.floor(Date.now() / 1000 - 24400).toString(), isError: '0', input: '0xverifyZKProof' }
      ]
    },
    '0x7f6ec0de06666666666666666666666666666666': {
      balance: '412.00',
      txCount: 60,
      contractInteractions: 40,
      validatorActivity: 0,
      governanceParticipation: 0,
      activeDaysCount: 35,
      recentTxs: [
        { hash: '0xtool111122223333444455556666777788889999aaaabbbbccccddddeeeeffff', from: '0x7f6ec0de06666666666666666666666666666666', to: '0x0000000000000000000000000000000000000007', value: '0.00', timeStamp: Math.floor(Date.now() / 1000 - 31200).toString(), isError: '0', input: '0xdeployContract' }
      ]
    },
    '0x8a7ec0de07777777777777777777777777777777': {
      balance: '95.00',
      txCount: 15,
      contractInteractions: 12,
      validatorActivity: 0,
      governanceParticipation: 0,
      activeDaysCount: 18,
      recentTxs: [
        { hash: '0xpixel111122223333444455556666777788889999aaaabbbbccccddddeeeeffff', from: '0x8a7ec0de07777777777777777777777777777777', to: '0x0000000000000000000000000000000000000008', value: '0.00', timeStamp: Math.floor(Date.now() / 1000 - 150000).toString(), isError: '0', input: '0xsetApprovalForAll' }
      ]
    },
    '0x9b8ec0de08888888888888888888888888888888': {
      balance: '150.00',
      txCount: 10,
      contractInteractions: 5,
      validatorActivity: 0,
      governanceParticipation: 0,
      activeDaysCount: 12,
      recentTxs: [
        { hash: '0xcomm111122223333444455556666777788889999aaaabbbbccccddddeeeeffff', from: '0x9b8ec0de08888888888888888888888888888888', to: '0x0000000000000000000000000000000000000009', value: '0.00', timeStamp: Math.floor(Date.now() / 1000 - 200000).toString(), isError: '0', input: '0xvoteOnProposal' }
      ]
    },
    '0x1990a424e0f523420c979a18a172424039111111': {
      balance: '542.00',
      txCount: 1248,
      contractInteractions: 850,
      validatorActivity: 0,
      governanceParticipation: 0,
      activeDaysCount: 190,
      recentTxs: []
    }
  };

  if (MOCK_PROFILES_ACTIVITY[normalizedAddress]) {
    return MOCK_PROFILES_ACTIVITY[normalizedAddress];
  }

  const client = getRpcClient(network);
  const explorerUrl = network === 'mainnet' 
    ? 'https://mainnet.qie.digital' 
    : 'https://testnet.qie.digital';

  try {
    // 1. Parallelize direct RPC calls for maximum performance (Vercel best practice: async-parallel)
    const [balanceBigInt, txCountNumber] = await Promise.all([
      client.getBalance({ address: address as `0x${string}` }),
      client.getTransactionCount({ address: address as `0x${string}` }),
    ]);

    const balance = formatEther(balanceBigInt);
    let contractInteractions = 0;
    let validatorActivity = 0;
    let governanceParticipation = 0;
    let activeDaysCount = 1;
    let recentTxs: LiveActivity['recentTxs'] = [];

    // 2. Fetch transaction history from the Explorer API
    try {
      // Standard blockscout/etherscan account txlist endpoint
      const explorerApiUrl = `${explorerUrl}/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc`;
      
      const response = await fetch(explorerApiUrl, { next: { revalidate: 60 } }); // Cache for 60 seconds
      if (response.ok) {
        const data = await response.json();
        if (data.status === '1' && Array.isArray(data.result)) {
          recentTxs = data.result.slice(0, 10); // Keep last 10 txs
          const allTxs = data.result;

          // Process stats
          const activeDays = new Set<string>();
          allTxs.forEach((tx: any) => {
            // Count unique days
            if (tx.timeStamp) {
              const dateStr = new Date(parseInt(tx.timeStamp) * 1000).toDateString();
              activeDays.add(dateStr);
            }

            // Detect contract interactions (to is a contract if input has data and to is not null)
            // Or if to is a known contract address (e.g. validator, governance)
            if (tx.input && tx.input !== '0x' && tx.to) {
              contractInteractions++;
            }

            // Simple heuristics for validator interactions (e.g. staking, delegating transactions)
            const inputData = tx.input ? tx.input.toLowerCase() : '';
            if (
              inputData.includes('delegate') || 
              inputData.includes('stake') || 
              inputData.includes('0x5c19e5b4') // staking signature hash example
            ) {
              validatorActivity++;
            }

            // Governance participation detection
            if (
              inputData.includes('vote') || 
              inputData.includes('propose')
            ) {
              governanceParticipation++;
            }
          });

          activeDaysCount = activeDays.size || 1;
        }
      }
    } catch (apiError) {
      console.error('Failed to fetch explorer transactions:', apiError);
      // Fallback: estimate from RPC results
      contractInteractions = Math.floor(txCountNumber * 0.2); // estimate 20%
    }

    return {
      balance,
      txCount: txCountNumber,
      contractInteractions,
      validatorActivity,
      governanceParticipation,
      activeDaysCount,
      recentTxs,
    };
  } catch (error) {
    console.error('Error fetching live QIE activity:', error);
    // Return empty fallback metrics rather than throwing, ensuring system resilience
    return {
      balance: '0',
      txCount: 0,
      contractInteractions: 0,
      validatorActivity: 0,
      governanceParticipation: 0,
      activeDaysCount: 1,
      recentTxs: [],
    };
  }
}
