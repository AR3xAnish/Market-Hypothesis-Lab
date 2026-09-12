# Market Hypothesis Lab

A disciplined quantitative research prototype that demonstrates how to turn a vague trading question into a structured, testable experiment, evaluate it against 20 years of historical daily price series without look-ahead bias, and present an honest, scientifically grounded result.

---

## 🌟 The Problem It Solves

When a trader or researcher asks:
> *"Does buying NIFTY after a sharp fall work?"*

Traditional financial tools or LLMs often commit one of two fatal errors:
1. **Blind Overconfidence**: Answering with an instant "Yes" or "No" based on unstated assumptions.
2. **Hidden Methodological Flaws**: Utilizing look-ahead bias (e.g., assuming same-day closing fills after observing the close), cherry-picked time horizons, or failing to establish an unconditional baseline benchmark.

**Market Hypothesis Lab** solves this by enforcing a linear 5-stage research workflow:
1. **ASK** — Submit a raw inquiry in plain English.
2. **CLARIFY** — Transparently configure parameters with explicit defaults before running.
3. **DEFINE** — Review a formal Experiment Card and a generated testable hypothesis statement.
4. **TEST** — Execute backtest computations directly inside PostgreSQL via SQL window functions without look-ahead bias.
5. **LEARN** — Strictly separate **"What the data shows"** (pure factual metrics and charts) from **"What we can reasonably conclude"** (cautious interpretation, evidence grading, and 4 mandatory real-world caveats) along with suggested follow-up investigations.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React + Vite)                    │
│   Tailwind CSS • Recharts • Lucide-React • Research UI      │
│                                                             │
│   [ASK]  ──>  [CLARIFY]  ──>  [DEFINE]  ──>  [TEST]  ──>  [LEARN]
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API (/api/*)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (Node.js + Express)                 │
│   /routes: questions.js, experiments.js, results.js         │
│   Pure node-postgres (pg) pool • No ORM • Strict SQL CTEs   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Raw SQL Window Functions
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                    │
│   Tables: nifty_prices, experiments, results                │
│   LAG(close, 1)        -> Single-day return                 │
│   LEAD(open, 1)         -> Next-day open entry (Anti-bias)   │
│   LEAD(close, H)        -> Day T+H close exit                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Choices & Rationale

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | Blazing fast build tooling, component modularity, instant HMR during research workflows. |
| **Styling** | Tailwind CSS | Clean, research-notebook aesthetic with custom slate/cyan/amber palette for unambiguous visual separation. |
| **Data Viz** | Recharts | Declarative SVG charting for comparative signal-vs-baseline bar charts and performance distributions. |
| **Backend** | Node.js + Express | Lightweight, reliable REST API server adhering to strict route separation. |
| **Database** | PostgreSQL + `pg` | Direct SQL execution without ORM abstractions. Database engine computes windowed financial series in milliseconds. |
| **Dataset** | 20-Year NIFTY CSV | Realistic daily price series (~5,240 sessions from 2005 to 2025) capturing historical market regimes (2008 GFC, 2020 COVID crash, secular rallies). *Llabeled as synthetic demonstration data generated to emulate historical index trajectory.* |

---

## ⚙️ Key Methodological Assumptions (CLARIFY Defaults)

To avoid silent assumptions, the system explicitly requires confirming five parameters:

1. **"Sharp Fall" Threshold (`-2.0%`)**:
   - Single-day close-to-close decline computed via `(close - LAG(close, 1)) / LAG(close, 1)`.
   - Represents an unusual tail event in NIFTY (~top 8% worst sessions). Editable from -0.5% to -10.0%.
2. **Holding Period (`5` Trading Days)**:
   - Measures short-term swing mean reversion without absorbing multi-week macro trend continuation. Editable from 1 to 30 trading days.
3. **Entry Execution Timing (`Day T+1 Open`)**:
   - **Anti-Look-Ahead Guarantee**: A trader only confirms a -2% daily drop at the close of Day T. The earliest feasible trade execution is the **Next Day's Open (T+1 Open)**.
4. **Exit Execution Timing (`Day T+H Close`)**:
   - Position closes at the close of the day $H$ trading sessions after entry.
5. **Historical Test Window (`2005-01-03` to `2025-01-31`)**:
   - Spans over 5,200 trading sessions, ensuring the strategy is tested across both high-volatility crashes and sustained bull markets.
6. **Transaction Costs & Slippage (Toggle, Default `Off / 0.0%`)**:
   - Off by default for pure statistical evaluation; toggling on subtracts 0.1% flat round-trip costs from every trade.
7. **Overlapping Signal Suppression (Non-Overlapping Windows)**:
   - **Overlapping signals suppressed — once a position opens, no new signal is registered until the prior holding period ends.**
   - *Methodology Note*: This was a deliberate methodology choice to avoid double-counting clustered crash events (e.g. multiple sharp-fall days within the same crash episode like October 2008 or March 2020). After a signal on Day $T$, the next earliest possible signal is Day $T + \text{holding\_period\_days}$.

---

## 🗄️ Database Schema

The database strictly adheres to the requested specification:

```sql
CREATE TABLE nifty_prices (
  date DATE PRIMARY KEY,
  open NUMERIC,
  high NUMERIC,
  low NUMERIC,
  close NUMERIC
);

CREATE TABLE experiments (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  fall_threshold_pct NUMERIC NOT NULL,
  holding_period_days INT NOT NULL,
  test_start DATE NOT NULL,
  test_end DATE NOT NULL,
  include_costs BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE results (
  id SERIAL PRIMARY KEY,
  experiment_id INT REFERENCES experiments(id) ON DELETE CASCADE,
  num_signals INT,
  avg_forward_return NUMERIC,
  baseline_avg_return NUMERIC,
  hit_rate NUMERIC,
  created_at TIMESTAMP DEFAULT now()
);
```

### Backtest Window Function Logic (Recursive CTE Non-Overlapping Engine)
```sql
WITH RECURSIVE
indexed_data AS (
  SELECT
    ROW_NUMBER() OVER (ORDER BY date) AS row_num,
    date,
    open,
    close,
    LAG(close, 1) OVER (ORDER BY date) AS prev_close,
    ROUND(((close - LAG(close, 1) OVER (ORDER BY date)) / LAG(close, 1) OVER (ORDER BY date) * 100.0)::numeric, 4) AS daily_return_pct,
    LEAD(open, 1) OVER (ORDER BY date) AS entry_open,
    LEAD(close, $holding_period) OVER (ORDER BY date) AS exit_close
  FROM nifty_prices
  WHERE date >= $start_date AND date <= $end_date
),
valid_rows AS (
  SELECT
    row_num,
    date AS signal_date,
    daily_return_pct,
    ROUND((((exit_close - entry_open) / entry_open * 100.0) - (CASE WHEN $include_costs THEN 0.1 ELSE 0.0 END))::numeric, 4) AS forward_return_pct
  FROM indexed_data
  WHERE prev_close IS NOT NULL AND entry_open IS NOT NULL AND exit_close IS NOT NULL
),
raw_signals AS (
  SELECT * FROM valid_rows WHERE daily_return_pct <= $threshold
),
non_overlapping AS (
  (SELECT * FROM raw_signals ORDER BY row_num ASC LIMIT 1)
  UNION ALL
  SELECT next_sig.*
  FROM non_overlapping curr
  CROSS JOIN LATERAL (
    SELECT * FROM raw_signals s
    WHERE s.row_num >= curr.row_num + $holding_period
    ORDER BY s.row_num ASC LIMIT 1
  ) next_sig
)
SELECT
  COUNT(*) AS num_signals,
  ROUND(AVG(forward_return_pct)::numeric, 4) AS avg_forward_return,
  (SELECT ROUND(AVG(forward_return_pct)::numeric, 4) FROM valid_rows) AS baseline_avg_return,
  ROUND((COUNT(*) FILTER (WHERE forward_return_pct > 0)::numeric / NULLIF(COUNT(*), 0) * 100.0)::numeric, 2) AS hit_rate
FROM non_overlapping;
```

---

## 🚀 How to Run the Project Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running on port 5432

### Step 1: Clone and Configure Environment
Create `server/.env` with your PostgreSQL credentials:
```env
PORT=5000
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=market_hypothesis_lab
```

### Step 2: Create Database and Seed Price Data
In your terminal (or PostgreSQL CLI):
```bash
# Create database
psql -U postgres -c "CREATE DATABASE market_hypothesis_lab;"

# Seed tables and load 20 years of daily price data
cd server
npm install
npm run seed
```
Output:
```
🚀 Starting database seed...
✅ Schema tables verified/created.
✅ Seeding completed successfully!
📊 Statistics: Total Price Rows: 5240 (2005-01-03 to 2025-01-31)
```

### Step 3: Start the Backend Server
```bash
cd server
npm start
# Backend running on http://localhost:5000
```

### Step 4: Start the Frontend Client
In a new terminal:
```bash
cd client
npm install
npm run dev
# Frontend running on http://localhost:5173
```

Open your browser at `http://localhost:5173`.

---

## 🔬 The 5-Stage Research Experience

1. **ASK**: Submit any market hypothesis (or pick from curated inquiries like "Does buying NIFTY after a sharp fall work?").
2. **CLARIFY**: View and tweak parameters. The system never silently invents values.
3. **DEFINE**: Inspect the formal Experiment Card and the dynamic plain-English hypothesis statement.
4. **TEST**: Watch the computation pipeline execute the SQL window functions.
5. **LEARN**:
   - **Section 1: What the data shows**: Factual metrics (Signal Events, Avg Forward Return, Baseline Avg Return, Hit Rate %) and comparative Recharts bar charts + expandable 435-trade audit log.
   - **Section 2: What we can reasonably conclude**: Qualitative synthesis, evidence grading (e.g. *Moderate Positive Evidence*), and 4 mandatory real-world caveat alerts (Small sample size, Regime clustering, Gap execution risk, Non-causality).
   - **Section 3: What to investigate next**: 2-3 interactive follow-up questions that immediately pre-fill the workflow when clicked.
   - **Past Experiments Drawer**: Instant review of historical runs persisted in PostgreSQL.

---

## 🔭 What Would Be Improved With More Time

1. **LLM-Driven Clarification & Semantic Parsing**:
   - Integrate an LLM (e.g., Gemini 2.5 Flash) to parse ambiguous natural language queries (e.g. *"What happens if tech stocks get hammered on earnings?"*) and autonomously propose parameter structures.
2. **Statistical Significance Testing**:
   - Automatically run two-sample t-tests and bootstrap p-value calculations to determine whether the excess return over baseline is statistically distinguishable from zero at $\alpha = 0.05$.
3. **Live NSE / Yahoo Finance Data Ingestion**:
   - Add automated cron jobs connecting to live market feeds (e.g., NSE Bhavcopy, Yahoo Finance) to keep the dataset updated daily.
4. **Multi-Condition Filters**:
   - Allow combining conditions (e.g., drop $\le -2\%$ *AND* RSI $< 30$ *OR* price below 200-day moving average).
5. **Monte Carlo Robustness & Walk-Forward Optimization**:
   - Simulate parameter sensitivity heatmaps across varying drop thresholds (-1% to -4%) and holding durations (1 to 20 days) to diagnose overfitting.
