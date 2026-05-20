export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface WalletProfile {
  address: string;
  ens?: string;
  firstSeen: string;
  lastActive: string;
  txCount: number;
  totalValueUSD: number;
  riskScore: number;
  riskLevel: RiskLevel;
  flags: RiskFlag[];
  tokenHoldings: TokenHolding[];
  defiExposure: DefiExposure[];
  chainBreakdown: ChainBreakdown[];
  _meta?: { source: string; latencyMs: number };
}

export interface RiskFlag {
  id: string;
  type: 'mixer' | 'sanctioned' | 'structuring' | 'rugpull' | 'new_wallet' | 'high_velocity' | 'tornado' | 'phishing';
  severity: RiskLevel;
  description: string;
  detectedAt: string;
  evidence?: string;
}

export interface TokenHolding {
  symbol: string;
  name: string;
  address: string;
  balanceUSD: number;
  isFlagged: boolean;
  flagReason?: string;
  chain: string;
  priceChange24h: number;
}

export interface DefiExposure {
  protocol: string;
  type: 'dex' | 'lending' | 'bridge' | 'mixer' | 'yield' | 'nft';
  valueUSD: number;
  isSuspicious: boolean;
  chain: string;
  logoColor: string;
}

export interface ChainBreakdown {
  chain: string;
  txCount: number;
  valueUSD: number;
  color: string;
}

export interface Transaction {
  hash: string;
  blockNumber: number;
  timestamp: string;
  from: string;
  to: string;
  valueETH: number;
  valueUSD: number;
  gasUsed: number;
  gasPriceGwei: number;
  status: 'success' | 'failed' | 'pending';
  isSuspicious: boolean;
  suspicionReason?: string;
  chain: string;
  method?: string;
}

export interface LiveTransaction extends Transaction {
  id: string;
  isNew?: boolean;
}
