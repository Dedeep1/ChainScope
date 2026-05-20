import { RiskFlag, RiskLevel, WalletProfile } from '../types';
import {
  getMockWalletData,
  getMockTokenHoldings,
  getMockDefiExposure,
  getMockChainBreakdown,
} from './mockEthers';
import { getWalletInfo } from './ethers';

function scoreToLevel(score: number): RiskLevel {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

function computeRiskScore(address: string): { score: number; flags: RiskFlag[] } {
  const { seed, r, walletAgeDays, txCount } = getMockWalletData(address);
  const tokens = getMockTokenHoldings(address);
  const defi = getMockDefiExposure(address);
  const flags: RiskFlag[] = [];
  let score = 0;

  // Mixer / Tornado Cash interaction (30 pts)
  const hasMixer = defi.some(d => d.type === 'mixer');
  if (hasMixer) {
    score += 30;
    const mixerProtocol = defi.find(d => d.type === 'mixer')!;
    flags.push({
      id: `flag-mixer-${seed}`,
      type: mixerProtocol.protocol.toLowerCase().includes('tornado') ? 'tornado' : 'mixer',
      severity: 'critical',
      description: `Direct interaction with ${mixerProtocol.protocol} detected`,
      detectedAt: new Date(Date.now() - r(50) * 30 * 86400000).toISOString(),
      evidence: `Protocol: ${mixerProtocol.protocol} | Volume: $${mixerProtocol.valueUSD.toLocaleString()}`,
    });
  }

  // Sanctioned address interaction (25 pts)
  const sanctionedInteraction = r(51) < 0.15;
  if (sanctionedInteraction) {
    score += 25;
    flags.push({
      id: `flag-sanction-${seed}`,
      type: 'sanctioned',
      severity: 'critical',
      description: 'Interaction with OFAC-sanctioned address detected',
      detectedAt: new Date(Date.now() - r(52) * 60 * 86400000).toISOString(),
      evidence: '0x7f367cc41522ce07553e823bf3be79a889debe1b (OFAC SDN list)',
    });
  }

  // High-velocity / structuring (20 pts)
  const highVelocity = txCount > 3000 && walletAgeDays < 180;
  if (highVelocity) {
    score += 20;
    flags.push({
      id: `flag-velocity-${seed}`,
      type: 'structuring',
      severity: 'high',
      description: 'Structuring pattern detected — high-frequency low-value transfers',
      detectedAt: new Date(Date.now() - r(53) * 14 * 86400000).toISOString(),
      evidence: `${txCount} txs in ${walletAgeDays} days = ${(txCount / walletAgeDays).toFixed(1)} tx/day avg`,
    });
  }

  // Rug pull token holdings (15 pts)
  const rugTokens = tokens.filter(t => t.isFlagged && t.flagReason?.includes('rug'));
  if (rugTokens.length > 0) {
    score += 15;
    flags.push({
      id: `flag-rug-${seed}`,
      type: 'rugpull',
      severity: 'high',
      description: `Holds ${rugTokens.length} known rug pull token(s)`,
      detectedAt: new Date(Date.now() - r(54) * 7 * 86400000).toISOString(),
      evidence: rugTokens.map(t => t.symbol).join(', '),
    });
  }

  // Phishing token airdrop (8 pts)
  const phishTokens = tokens.filter(t => t.isFlagged && t.flagReason?.includes('Phishing'));
  if (phishTokens.length > 0) {
    score += 8;
    flags.push({
      id: `flag-phish-${seed}`,
      type: 'phishing',
      severity: 'medium',
      description: 'Received phishing token airdrop(s)',
      detectedAt: new Date(Date.now() - r(55) * 3 * 86400000).toISOString(),
      evidence: phishTokens.map(t => t.symbol).join(', '),
    });
  }

  // New wallet age (10 pts)
  if (walletAgeDays < 14) {
    score += 10;
    flags.push({
      id: `flag-new-${seed}`,
      type: 'new_wallet',
      severity: 'low',
      description: 'Wallet is less than 14 days old',
      detectedAt: new Date(Date.now() - walletAgeDays * 86400000).toISOString(),
      evidence: `First seen: ${walletAgeDays} days ago`,
    });
  }

  // High-velocity general (5 pts)
  if (txCount > 4000) {
    score += 5;
    flags.push({
      id: `flag-hv-${seed}`,
      type: 'high_velocity',
      severity: 'medium',
      description: 'Unusually high transaction count',
      detectedAt: new Date(Date.now() - r(56) * 5 * 86400000).toISOString(),
      evidence: `${txCount} total transactions detected`,
    });
  }

  return { score: Math.min(100, score), flags };
}

export async function buildWalletProfile(address: string): Promise<WalletProfile> {
  const { txCount: mockTxCount, totalValueUSD: mockValueUSD, firstSeenDate } = getMockWalletData(address);
  const { score, flags } = computeRiskScore(address);
  const tokens = getMockTokenHoldings(address);
  const defi = getMockDefiExposure(address);
  const chains = getMockChainBreakdown(address);

  const lastActiveOffset = Math.floor(Math.abs(Math.sin(addrSeed(address)) * 7 * 86400000));

  let txCount = mockTxCount;
  let totalValueUSD = mockValueUSD;
  let ens: string | undefined;

  try {
    const real = await getWalletInfo(address);
    if (real.txCount > 0) txCount = real.txCount;
    if (real.balanceUSD > 0) totalValueUSD = real.balanceUSD;
    ens = real.ensName ?? undefined;
  } catch {
    // fall back to mock values
  }

  return {
    address,
    ens,
    firstSeen: firstSeenDate.toISOString(),
    lastActive: new Date(Date.now() - lastActiveOffset).toISOString(),
    txCount,
    totalValueUSD,
    riskScore: score,
    riskLevel: scoreToLevel(score),
    flags,
    tokenHoldings: tokens,
    defiExposure: defi,
    chainBreakdown: chains,
  };
}

function addrSeed(address: string): number {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = ((hash << 5) - hash + address.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
