import { Transaction, TokenHolding, DefiExposure, ChainBreakdown } from '../types';

// Deterministic pseudo-random from address
function addrSeed(address: string): number {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = ((hash << 5) - hash + address.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function seededRand(seed: number, index: number): number {
  const x = Math.sin(seed + index) * 10000;
  return x - Math.floor(x);
}

const SUSPICIOUS_ADDRESSES = new Set([
  '0xd90e2f925da726b50c4ed8d0fb90ad053324f31b', // Tornado Cash
  '0x7f367cc41522ce07553e823bf3be79a889debe1b', // Sanctioned
  '0x098b716b8aaf21512996dc57eb0615e2383e2f96', // Mixer
]);

const TOKEN_POOL = [
  { symbol: 'WETH', name: 'Wrapped Ether', flagged: false, address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
  { symbol: 'USDC', name: 'USD Coin', flagged: false, address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
  { symbol: 'USDT', name: 'Tether USD', flagged: false, address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
  { symbol: 'DAI', name: 'Dai Stablecoin', flagged: false, address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
  { symbol: 'UNI', name: 'Uniswap', flagged: false, address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' },
  { symbol: 'AAVE', name: 'Aave Token', flagged: false, address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9' },
  { symbol: 'RUGX', name: 'RUGxFinance', flagged: true, address: '0xdead000000000000000000000000000000000001', flagReason: 'Known rug pull — liquidity removed 2024-03-12' },
  { symbol: 'SCAMINU', name: 'ScamInu', flagged: true, address: '0xdead000000000000000000000000000000000002', flagReason: 'Honeypot contract detected' },
  { symbol: 'LINK', name: 'Chainlink', flagged: false, address: '0x514910771AF9Ca656af840dff83E8264EcF986CA' },
  { symbol: 'CRV', name: 'Curve DAO Token', flagged: false, address: '0xD533a949740bb3306d119CC777fa900bA034cd52' },
  { symbol: 'FAKEETH', name: 'FakeEthereum', flagged: true, address: '0xdead000000000000000000000000000000000003', flagReason: 'Phishing token airdrop' },
];

const DEFI_PROTOCOLS = [
  { protocol: 'Uniswap V3', type: 'dex' as const, chain: 'Ethereum', isSuspicious: false, logoColor: '#FF007A' },
  { protocol: 'Aave V3', type: 'lending' as const, chain: 'Ethereum', isSuspicious: false, logoColor: '#B6509E' },
  { protocol: 'Curve Finance', type: 'dex' as const, chain: 'Ethereum', isSuspicious: false, logoColor: '#3A3A3A' },
  { protocol: 'Tornado Cash', type: 'mixer' as const, chain: 'Ethereum', isSuspicious: true, logoColor: '#1A1A2E' },
  { protocol: 'Stargate Bridge', type: 'bridge' as const, chain: 'Base', isSuspicious: false, logoColor: '#909090' },
  { protocol: 'Compound V3', type: 'lending' as const, chain: 'Ethereum', isSuspicious: false, logoColor: '#00D395' },
  { protocol: 'FixedFloat', type: 'mixer' as const, chain: 'Ethereum', isSuspicious: true, logoColor: '#FF4444' },
  { protocol: 'Lido', type: 'yield' as const, chain: 'Ethereum', isSuspicious: false, logoColor: '#00A3FF' },
  { protocol: 'Blur', type: 'nft' as const, chain: 'Ethereum', isSuspicious: false, logoColor: '#FF8700' },
];

const TX_METHODS = ['transfer', 'swap', 'approve', 'deposit', 'withdraw', 'addLiquidity', 'removeLiquidity', 'stake', 'mint'];

export function getMockWalletData(address: string) {
  const seed = addrSeed(address);
  const r = (i: number) => seededRand(seed, i);

  const txCount = Math.floor(r(0) * 4800) + 200; // 200–5000
  const totalValueUSD = Math.floor(r(1) * 2000000) + 1000;
  const walletAgeDays = Math.floor(r(2) * 1460) + 7; // 1 week to 4 years
  const firstSeenDate = new Date(Date.now() - walletAgeDays * 86400000);

  return { seed, r, txCount, totalValueUSD, walletAgeDays, firstSeenDate };
}

export function getMockTokenHoldings(address: string): TokenHolding[] {
  const { seed, r } = getMockWalletData(address);
  const count = Math.floor(r(10) * 6) + 3;
  const selected: TokenHolding[] = [];

  const shuffled = [...TOKEN_POOL].sort((a, b) => seededRand(seed, TOKEN_POOL.indexOf(a) + 100) - seededRand(seed, TOKEN_POOL.indexOf(b) + 100));

  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    const t = shuffled[i];
    selected.push({
      symbol: t.symbol,
      name: t.name,
      address: t.address,
      balanceUSD: Math.floor(seededRand(seed, i + 200) * 50000) + 100,
      isFlagged: t.flagged,
      flagReason: (t as any).flagReason,
      chain: seededRand(seed, i + 300) > 0.7 ? 'Base' : 'Ethereum',
      priceChange24h: (seededRand(seed, i + 400) - 0.5) * 40,
    });
  }
  return selected;
}

export function getMockDefiExposure(address: string): DefiExposure[] {
  const { seed, r } = getMockWalletData(address);
  const count = Math.floor(r(20) * 4) + 2;
  const shuffled = [...DEFI_PROTOCOLS].sort((a, b) => seededRand(seed, DEFI_PROTOCOLS.indexOf(a) + 500) - seededRand(seed, DEFI_PROTOCOLS.indexOf(b) + 500));

  return shuffled.slice(0, count).map((p, i) => ({
    ...p,
    valueUSD: Math.floor(seededRand(seed, i + 600) * 100000) + 500,
  }));
}

export function getMockChainBreakdown(address: string): ChainBreakdown[] {
  const { seed, r } = getMockWalletData(address);
  const ethPct = 0.4 + r(30) * 0.5;
  const basePct = (1 - ethPct) * (0.5 + r(31) * 0.4);
  const arbPct = 1 - ethPct - basePct;
  const total = getMockWalletData(address).txCount;

  return [
    { chain: 'Ethereum', txCount: Math.floor(total * ethPct), valueUSD: Math.floor(r(32) * 1000000) + 5000, color: '#627EEA' },
    { chain: 'Base', txCount: Math.floor(total * basePct), valueUSD: Math.floor(r(33) * 500000) + 1000, color: '#0052FF' },
    { chain: 'Arbitrum', txCount: Math.floor(total * arbPct), valueUSD: Math.floor(r(34) * 300000) + 500, color: '#28A0F0' },
  ].filter(c => c.txCount > 0);
}

export function getMockTransactions(address: string, page = 1, limit = 20): Transaction[] {
  const { seed } = getMockWalletData(address);
  const txs: Transaction[] = [];
  const offset = (page - 1) * limit;

  for (let i = offset; i < offset + limit; i++) {
    const r = (j: number) => seededRand(seed, i * 100 + j);
    const isSuspicious = r(0) < 0.12;
    const chains = ['Ethereum', 'Base', 'Arbitrum'];

    const isOutgoing = r(2) > 0.5;
    const counterparty = `0x${(seed + i + 1).toString(16).padStart(40, '0')}`;
    txs.push({
      hash: `0x${Array.from({ length: 64 }, (_, k) => Math.floor(seededRand(seed, i * 1000 + k) * 16).toString(16)).join('')}`,
      blockNumber: 20000000 - i * 3,
      timestamp: new Date(Date.now() - i * 180000 - Math.floor(r(1) * 120000)).toISOString(),
      from: isOutgoing ? address : counterparty,
      to: isOutgoing ? counterparty : address,
      valueETH: r(4) * 10,
      valueUSD: r(5) * 20000,
      gasUsed: Math.floor(r(6) * 200000) + 21000,
      gasPriceGwei: r(7) * 50 + 5,
      status: r(8) > 0.05 ? 'success' : 'failed',
      isSuspicious,
      suspicionReason: isSuspicious
        ? ['Interaction with Tornado Cash relayer', 'High-frequency small transfers (structuring pattern)', 'Transfer to sanctioned address', 'Flash loan attack pattern'][Math.floor(r(9) * 4)]
        : undefined,
      chain: chains[Math.floor(r(10) * chains.length)],
      method: TX_METHODS[Math.floor(r(11) * TX_METHODS.length)],
    });
  }
  return txs;
}

export function generateLiveTx(): Transaction & { id: string } {
  const addresses = [
    '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    '0xdead000000000000000000000000000000000001',
  ];
  const seed = Date.now();
  const r = (i: number) => seededRand(seed, i);
  const isSuspicious = r(0) < 0.15;
  const fromIdx = Math.floor(r(2) * addresses.length);
  let toIdx = Math.floor(r(3) * (addresses.length - 1));
  if (toIdx >= fromIdx) toIdx++;

  return {
    id: `live-${seed}`,
    hash: `0x${Array.from({ length: 64 }, (_, k) => Math.floor(seededRand(seed, k + 50) * 16).toString(16)).join('')}`,
    blockNumber: 20500000 + Math.floor(r(1) * 1000),
    timestamp: new Date().toISOString(),
    from: addresses[fromIdx],
    to: addresses[toIdx],
    valueETH: r(4) * 5,
    valueUSD: r(5) * 10000,
    gasUsed: Math.floor(r(6) * 150000) + 21000,
    gasPriceGwei: r(7) * 30 + 8,
    status: 'success',
    isSuspicious,
    suspicionReason: isSuspicious ? 'High-velocity transfer pattern detected' : undefined,
    chain: ['Ethereum', 'Base'][Math.floor(r(8) * 2)],
    method: TX_METHODS[Math.floor(r(9) * TX_METHODS.length)],
  };
}
