-- Schema for Market Hypothesis Lab
-- Exact schema specified in requirements

CREATE TABLE IF NOT EXISTS nifty_prices (
  date DATE PRIMARY KEY,
  open NUMERIC,
  high NUMERIC,
  low NUMERIC,
  close NUMERIC
);

CREATE TABLE IF NOT EXISTS experiments (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  fall_threshold_pct NUMERIC NOT NULL,
  holding_period_days INT NOT NULL,
  test_start DATE NOT NULL,
  test_end DATE NOT NULL,
  include_costs BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  experiment_id INT REFERENCES experiments(id) ON DELETE CASCADE,
  num_signals INT,
  avg_forward_return NUMERIC,
  baseline_avg_return NUMERIC,
  hit_rate NUMERIC,
  created_at TIMESTAMP DEFAULT now()
);

-- Index for performant range queries
CREATE INDEX IF NOT EXISTS idx_nifty_prices_date ON nifty_prices(date);
CREATE INDEX IF NOT EXISTS idx_experiments_created_at ON experiments(created_at DESC);
