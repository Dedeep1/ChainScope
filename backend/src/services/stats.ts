const BASELINE_WALLETS_ANALYZED = 6245;
const BASELINE_SUSPICIOUS_FLAGGED = 847;

let walletsAnalyzed = BASELINE_WALLETS_ANALYZED;
let suspiciousFlagged = BASELINE_SUSPICIOUS_FLAGGED;
let txsSeen = 0;
let currentBlock = 0;
const CHAINS_MONITORED = 3;

export function incrementWallets() { walletsAnalyzed++; }
export function incrementSuspicious() { suspiciousFlagged++; }
export function incrementTxsSeen() { txsSeen++; }
export function setCurrentBlock(n: number) { if (n > currentBlock) currentBlock = n; }

export function getStats() {
  return { walletsAnalyzed, suspiciousFlagged, txsSeen, currentBlock, chainsMonitored: CHAINS_MONITORED };
}
