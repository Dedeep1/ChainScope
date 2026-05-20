import { JsonRpcProvider, formatEther } from 'ethers';
import { Transaction } from '../types';

const RPC_URL = process.env.ALCHEMY_RPC_URL;
if (!RPC_URL) throw new Error('ALCHEMY_RPC_URL is not set in .env');

export const provider = new JsonRpcProvider(RPC_URL);

// ETH/USD price cache — refreshed every 60s via CoinGecko free API
let cachedEthPrice = 3000;
let ethPriceFetchedAt = 0;

async function getEthPrice(): Promise<number> {
  if (Date.now() - ethPriceFetchedAt < 60_000) return cachedEthPrice;
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const data = await res.json() as { ethereum: { usd: number } };
    cachedEthPrice = data.ethereum.usd;
    ethPriceFetchedAt = Date.now();
  } catch {
    // keep stale value
  }
  return cachedEthPrice;
}

type AlchemyTransfer = {
  blockNum: string;
  hash: string;
  from: string;
  to: string | null;
  value: number | null;
  asset: string | null;
  category: string;
  metadata: { blockTimestamp: string };
};

function transformTransfer(t: AlchemyTransfer, ethPrice: number): Transaction {
  const valueETH = t.value ?? 0;
  return {
    hash: t.hash,
    blockNumber: parseInt(t.blockNum, 16),
    timestamp: t.metadata?.blockTimestamp ?? new Date().toISOString(),
    from: t.from,
    to: t.to ?? '',
    valueETH,
    valueUSD: valueETH * ethPrice,
    gasUsed: t.category === 'erc20' ? 65000 : 21000,
    gasPriceGwei: 20,
    status: 'success',
    isSuspicious: false,
    chain: 'Ethereum',
    method: t.category === 'erc20' ? 'transfer' : t.category === 'internal' ? 'internal' : undefined,
  };
}

async function fetchTransfers(params: object): Promise<AlchemyTransfer[]> {
  const res = await fetch(RPC_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 1, jsonrpc: '2.0', method: 'alchemy_getAssetTransfers', params: [params] }),
  });
  const data = await res.json() as { result?: { transfers: AlchemyTransfer[] } };
  return data.result?.transfers ?? [];
}

export async function getTransactions(address: string, page = 1, limit = 20): Promise<Transaction[]> {
  const maxCount = `0x${Math.min(100, limit * 3).toString(16)}`;
  const baseParams = {
    toBlock: 'latest',
    category: ['external', 'internal', 'erc20'],
    withMetadata: true,
    excludeZeroValue: true,
    maxCount,
    order: 'desc',
  };

  const [sent, received] = await Promise.all([
    fetchTransfers({ ...baseParams, fromAddress: address }),
    fetchTransfers({ ...baseParams, toAddress: address }),
  ]);

  const seen = new Set<string>();
  const merged = [...sent, ...received]
    .filter(t => { if (seen.has(t.hash)) return false; seen.add(t.hash); return true; })
    .sort((a, b) => parseInt(b.blockNum, 16) - parseInt(a.blockNum, 16));

  const ethPrice = await getEthPrice();
  const offset = (page - 1) * limit;
  return merged.slice(offset, offset + limit).map(t => transformTransfer(t, ethPrice));
}

export async function getWalletInfo(address: string) {
  const [balanceResult, txCountResult, ensResult] = await Promise.allSettled([
    provider.getBalance(address),
    provider.getTransactionCount(address),
    provider.lookupAddress(address),
  ]);

  const balanceETH = balanceResult.status === 'fulfilled'
    ? parseFloat(formatEther(balanceResult.value))
    : 0;
  const ethPrice = await getEthPrice();

  return {
    balanceETH,
    balanceUSD: balanceETH * ethPrice,
    txCount: txCountResult.status === 'fulfilled' ? txCountResult.value : 0,
    ensName: ensResult.status === 'fulfilled' ? (ensResult.value ?? undefined) : undefined,
  };
}

export function subscribeNewBlocks(
  onTx: (tx: Transaction & { id: string }) => void,
  shouldProcess?: () => boolean,
): void {
  provider.on('block', async (blockNumber: number) => {
    if (shouldProcess && !shouldProcess()) return;
    try {
      const hexBlock = `0x${blockNumber.toString(16)}`;
      // Use alchemy_getAssetTransfers scoped to this block so we only get
      // non-zero ETH transfers — avoids $0.00 contract calls entirely.
      // 6 transfers per ~12s block ≈ one tx every 2s in the feed.
      const transfers = await fetchTransfers({
        fromBlock: hexBlock,
        toBlock: hexBlock,
        category: ['external'],
        excludeZeroValue: true,
        maxCount: '0x6',
        withMetadata: true,
      });

      if (!transfers.length) return;
      const ethPrice = await getEthPrice();

      for (const t of transfers) {
        const valueETH = t.value ?? 0;
        onTx({
          id: `live-${t.hash}`,
          hash: t.hash,
          blockNumber,
          timestamp: t.metadata?.blockTimestamp ?? new Date().toISOString(),
          from: t.from,
          to: t.to ?? '',
          valueETH,
          valueUSD: valueETH * ethPrice,
          gasUsed: 21000,
          gasPriceGwei: 20,
          status: 'success',
          isSuspicious: false,
          chain: 'Ethereum',
          method: 'transfer',
        });
      }
    } catch (err) {
      console.error('[Block stream] Error processing block:', err);
    }
  });
}
