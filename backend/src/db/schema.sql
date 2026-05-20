-- ChainScope PostgreSQL Schema

CREATE TABLE IF NOT EXISTS wallets (
  address         VARCHAR(42) PRIMARY KEY,
  ens             VARCHAR(255),
  risk_score      INTEGER NOT NULL DEFAULT 0,
  risk_level      VARCHAR(10) NOT NULL DEFAULT 'low',
  tx_count        INTEGER NOT NULL DEFAULT 0,
  total_value_usd NUMERIC(20, 2) NOT NULL DEFAULT 0,
  first_seen      TIMESTAMPTZ,
  last_active     TIMESTAMPTZ,
  raw_profile     JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallets_risk_score ON wallets(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_wallets_risk_level ON wallets(risk_level);
CREATE INDEX IF NOT EXISTS idx_wallets_last_active ON wallets(last_active DESC);

CREATE TABLE IF NOT EXISTS transactions (
  hash            VARCHAR(66) PRIMARY KEY,
  block_number    BIGINT NOT NULL,
  from_address    VARCHAR(42) NOT NULL,
  to_address      VARCHAR(42),
  value_eth       NUMERIC(30, 18) NOT NULL DEFAULT 0,
  value_usd       NUMERIC(20, 2) NOT NULL DEFAULT 0,
  gas_used        BIGINT,
  gas_price_gwei  NUMERIC(20, 9),
  status          VARCHAR(10) NOT NULL DEFAULT 'success',
  is_suspicious   BOOLEAN NOT NULL DEFAULT FALSE,
  suspicion_reason TEXT,
  chain           VARCHAR(50) NOT NULL DEFAULT 'Ethereum',
  method          VARCHAR(100),
  tx_timestamp    TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_txs_from ON transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_txs_to ON transactions(to_address);
CREATE INDEX IF NOT EXISTS idx_txs_suspicious ON transactions(is_suspicious) WHERE is_suspicious = TRUE;
CREATE INDEX IF NOT EXISTS idx_txs_timestamp ON transactions(tx_timestamp DESC);

CREATE TABLE IF NOT EXISTS search_history (
  id          SERIAL PRIMARY KEY,
  address     VARCHAR(42) NOT NULL,
  searched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_address ON search_history(address);
CREATE INDEX IF NOT EXISTS idx_search_time ON search_history(searched_at DESC);
