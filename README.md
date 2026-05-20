# ChainScope

On-chain fraud detection and wallet risk scoring for Ethereum and EVM-compatible chains. Paste in any wallet address and get a full breakdown: risk score, flagged tokens, DeFi exposure, transaction history, and live feed of what's hitting the mempool right now.

Built this because most block explorers just show you data — they don't tell you what to make of it. ChainScope runs a weighted signal model against every wallet and surfaces the things that actually matter: mixer interactions, sanctioned address exposure, structuring patterns, rug pull holdings, and more.

---

## Features

- **Live transaction feed** — WebSocket connection streams real Ethereum transactions as blocks land, filtered to non-zero ETH transfers
- **Wallet risk scoring** — 0–100 score built from a weighted signal model across 7 risk categories (mixer use, sanctioned addresses, structuring patterns, rug pull holdings, phishing tokens, wallet age, high velocity)
- **DeFi exposure analysis** — breaks down protocol interactions by type: DEX, lending, bridges, mixers, yield, NFT
- **Sanctioned address detection** — flags interactions with OFAC SDN list entries
- **Rug pull and phishing token flagging** — known bad tokens surfaced in the holdings panel
- **Multi-chain** — Ethereum, Base, and Arbitrum transaction history
- **ENS resolution** — resolves `.eth` names for known addresses
- **Persistent storage** — wallet profiles and search history saved to PostgreSQL, hot data cached in Redis

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Blockchain | Ethers.js v6, Alchemy RPC |
| Database | PostgreSQL |
| Cache | Redis |
| Real-time | WebSockets (`ws`) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (local or hosted)
- Redis (local or via Docker: `docker run -p 6379:6379 redis`)
- An [Alchemy](https://alchemy.com) account (free tier is fine — create an Ethereum Mainnet app)

### Install

```bash
# Clone the repo
git clone https://github.com/Dedeep1/ChainScope.git
cd ChainScope

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### Environment Variables

Create `backend/.env`:

```
ALCHEMY_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
PORT=3001

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/chainscope

# Redis
REDIS_URL=redis://localhost:6379
```

Run the database schema:

```bash
psql $DATABASE_URL < backend/src/db/schema.sql
```

### Run

Open two terminals:

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

Frontend runs on [http://localhost:3000](http://localhost:3000), backend on [http://localhost:3001](http://localhost:3001).

---

## Architecture

```
Alchemy RPC (Ethereum Mainnet)
        │
        ├── alchemy_getAssetTransfers ──→ Wallet transaction history
        │                                  └── Risk Engine (weighted scoring)
        │                                        └── PostgreSQL (wallet profiles)
        │                                              └── Redis (60s cache)
        │
        └── provider.on('block') ────────→ Live ETH transfers (6 per block)
                                                └── WebSocket broadcast → Frontend feed
```

When a wallet is searched:
1. The backend checks Redis for a cached profile (60s TTL)
2. On cache miss, Alchemy fetches transaction history and current balance
3. The risk engine scores the wallet across 7 weighted signal categories
4. The profile is written to PostgreSQL and cached in Redis
5. The response includes risk score, token holdings, DeFi exposure, and chain breakdown

The live feed runs independently — a `provider.on('block')` listener fires on every new Ethereum block (~12s), pulls the top 6 non-zero ETH transfers via `alchemy_getAssetTransfers`, and broadcasts each one to connected WebSocket clients. A 1,000-entry dedup set prevents the same transaction from appearing twice.

---

## Risk Score Model

| Signal | Points |
|---|---|
| Mixer / Tornado Cash interaction | +30 |
| OFAC sanctioned address contact | +25 |
| Structuring pattern (high-freq low-value) | +20 |
| Rug pull token holdings | +15 |
| New wallet (< 14 days) | +10 |
| Phishing token airdrop received | +8 |
| Unusually high transaction count | +5 |

Scores map to four levels: `low` (0–24), `medium` (25–49), `high` (50–74), `critical` (75–100).

---

## Project Structure

```
ChainScope/
├── backend/
│   └── src/
│       ├── routes/          # Express route handlers
│       ├── services/        # Ethers, risk engine, stats, DB, Redis
│       ├── websocket/       # WS server + live block streaming
│       ├── types/           # Shared TypeScript types
│       └── db/              # PostgreSQL schema
└── frontend/
    ├── app/                 # Next.js app router pages
    ├── components/          # UI components and charts
    ├── hooks/               # useWebSocket, etc.
    └── lib/                 # API client and utils
```
