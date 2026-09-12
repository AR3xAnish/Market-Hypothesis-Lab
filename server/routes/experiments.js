const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Cautious qualitative synthesis helper
function synthesizeConclusions({
  numSignals,
  avgForwardReturn,
  baselineAvgReturn,
  hitRate,
  fallThresholdPct,
  holdingPeriodDays,
  includeCosts,
}) {
  const excessReturn = avgForwardReturn - baselineAvgReturn;
  const isPositiveExcess = excessReturn > 0;
  const absThreshold = Math.abs(fallThresholdPct);

  // Evidence grading
  let evidenceLevel = 'Inconclusive';
  let badgeColor = 'amber';
  let summary = '';

  if (numSignals < 20) {
    evidenceLevel = 'Very Weak / Inconclusive';
    badgeColor = 'rose';
    summary = `The small sample of only ${numSignals} signal events provides insufficient statistical power to distinguish true market edge from random noise.`;
  } else if (isPositiveExcess && excessReturn >= 0.3 && hitRate >= 55) {
    evidenceLevel = 'Moderate Positive Evidence';
    badgeColor = 'emerald';
    summary = `The historical data suggests a tendency for NIFTY to rebound over a ${holdingPeriodDays}-day horizon following a ≥${absThreshold}% drop. However, this is a historical tendency, not a predictive law.`;
  } else if (isPositiveExcess && excessReturn > 0) {
    evidenceLevel = 'Weak Positive Evidence';
    badgeColor = 'amber';
    summary = `The forward return shows a slight positive edge (+${excessReturn.toFixed(2)}% over baseline), but the margin is narrow and may easily vanish once real-world execution frictions, slippage, or black-swan tail drops are factored in.`;
  } else {
    evidenceLevel = 'Unfavorable / Counter-Hypothesis';
    badgeColor = 'rose';
    summary = `The forward return following signal days is lower than the unconditional baseline (${avgForwardReturn.toFixed(2)}% vs. ${baselineAvgReturn.toFixed(2)}%), indicating that sharp drops often exhibited downward momentum rather than immediate mean reversion over ${holdingPeriodDays} days.`;
  }

  // Explicit, mandatory caveats
  const caveats = [
    {
      title: 'Small Sample Size & Degrees of Freedom',
      text: `Across the entire historical dataset, only ${numSignals} days triggered the ≥${absThreshold}% drop condition. Small samples are prone to selection noise and outliers (such as a single massive post-election or post-stimulus gap-up).`,
      severity: numSignals < 50 ? 'high' : 'medium',
    },
    {
      title: 'Regime Dependence & Volatility Clustering',
      text: 'Drop signals are rarely uniformly distributed; they cluster heavily during macro crises (e.g., 2008 Lehman collapse, March 2020 COVID shock). Results are strongly dictated by how those specific crisis episodes resolved rather than everyday price mechanics.',
      severity: 'high',
    },
    {
      title: 'Execution Reality & Overnight Gap Risk',
      text: 'Entering at next day\'s Open assumes seamless fills without severe opening gapping. In actual trading, high-volatility opens frequently exhibit wide bid-ask spreads, circuit limits, and intraday whipsaws.',
      severity: includeCosts ? 'medium' : 'high',
    },
    {
      title: 'Absence of Causal Guarantee',
      text: 'A quantitative correlation in historical price records does not establish causal predictability. Market regimes, liquidity structures, and macroeconomic factors evolve continuously.',
      severity: 'medium',
    },
  ];

  // 2-3 suggested follow-up questions
  const nextInvestigations = [];

  if (holdingPeriodDays === 5) {
    nextInvestigations.push({
      title: `What if the holding period were 10 days instead of 5?`,
      description: 'Test whether extending the time horizon gives mean reversion more time to play out, or invites trend continuation.',
      suggested_params: {
        holding_period_days: 10,
        fall_threshold_pct: fallThresholdPct,
        include_costs: includeCosts,
      },
    });
  } else {
    nextInvestigations.push({
      title: `What if the holding period were tightened to 3 days?`,
      description: 'Check if the initial bounce is short-lived and rapidly fades after 48-72 hours.',
      suggested_params: {
        holding_period_days: 3,
        fall_threshold_pct: fallThresholdPct,
        include_costs: includeCosts,
      },
    });
  }

  if (absThreshold === 2.0) {
    nextInvestigations.push({
      title: `Does the effect hold or strengthen during severe drops (≥ 3.0%)?`,
      description: 'Filter for deeper panic sell-offs to see if extreme fear amplifies the rebound or signifies catastrophic structural breakdowns.',
      suggested_params: {
        holding_period_days: holdingPeriodDays,
        fall_threshold_pct: -3.0,
        include_costs: includeCosts,
      },
    });
  } else {
    nextInvestigations.push({
      title: `How does a milder -1.5% drop threshold perform?`,
      description: 'Increase sample frequency by lowering the threshold to test if the edge persists on routine pullback days.',
      suggested_params: {
        holding_period_days: holdingPeriodDays,
        fall_threshold_pct: -1.5,
        include_costs: includeCosts,
      },
    });
  }

  if (!includeCosts) {
    nextInvestigations.push({
      title: 'How does factoring in 0.1% transaction costs and slippage impact the net edge?',
      description: 'Apply realistic round-trip brokerage and execution slippage to examine net realizable alpha.',
      suggested_params: {
        holding_period_days: holdingPeriodDays,
        fall_threshold_pct: fallThresholdPct,
        include_costs: true,
      },
    });
  } else {
    nextInvestigations.push({
      title: 'Does the hypothesis hold during the post-2020 low-interest regime?',
      description: 'Isolate the sample to modern trading (2020-2025) to test for structural market changes.',
      suggested_params: {
        holding_period_days: holdingPeriodDays,
        fall_threshold_pct: fallThresholdPct,
        include_costs: includeCosts,
        test_start: '2020-01-01',
      },
    });
  }

  return {
    evidenceLevel,
    badgeColor,
    summary,
    caveats,
    nextInvestigations,
  };
}

// POST /api/experiments/run - Execute backtest and persist
router.post('/run', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      question = 'Does buying NIFTY after a sharp fall work?',
      fall_threshold_pct = -2.0,
      holding_period_days = 5,
      test_start = '2005-01-03',
      test_end = '2025-01-31',
      include_costs = false,
    } = req.body;

    const fallThreshold = parseFloat(fall_threshold_pct);
    const holdingDays = parseInt(holding_period_days, 10);
    const costsActive = Boolean(include_costs);

    if (isNaN(fallThreshold) || isNaN(holdingDays)) {
      return res.status(400).json({ error: 'Invalid threshold or holding period' });
    }

    // 1. Run backtest using raw SQL window functions
    // Window functions:
    // - LAG(close, 1) to determine signal day drop
    // - LEAD(open, 1) to determine next day open (no look-ahead bias)
    // - LEAD(close, holdingDays) to determine exit price
    const backtestQuery = `
      WITH price_window AS (
        SELECT
          date,
          open,
          high,
          low,
          close,
          LAG(close, 1) OVER (ORDER BY date) AS prev_close,
          ROUND(((close - LAG(close, 1) OVER (ORDER BY date)) / LAG(close, 1) OVER (ORDER BY date) * 100.0)::numeric, 4) AS daily_return_pct,
          LEAD(open, 1) OVER (ORDER BY date) AS entry_open,
          LEAD(date, 1) OVER (ORDER BY date) AS entry_date,
          LEAD(close, $1::int) OVER (ORDER BY date) AS exit_close,
          LEAD(date, $1::int) OVER (ORDER BY date) AS exit_date
        FROM nifty_prices
        WHERE date >= $2::date AND date <= $3::date
      ),
      valid_trades AS (
        SELECT
          date AS signal_date,
          open AS signal_open,
          close AS signal_close,
          daily_return_pct,
          entry_date,
          entry_open,
          exit_date,
          exit_close,
          ROUND(
            (((exit_close - entry_open) / entry_open * 100.0) - (CASE WHEN $4::boolean THEN 0.1 ELSE 0.0 END))::numeric,
            4
          ) AS forward_return_pct
        FROM price_window
        WHERE prev_close IS NOT NULL 
          AND entry_open IS NOT NULL 
          AND exit_close IS NOT NULL
      )
      SELECT
        COUNT(*) AS total_sample_days,
        ROUND(AVG(forward_return_pct)::numeric, 4) AS baseline_avg_return,
        COUNT(*) FILTER (WHERE daily_return_pct <= $5::numeric) AS num_signals,
        ROUND(AVG(forward_return_pct) FILTER (WHERE daily_return_pct <= $5::numeric)::numeric, 4) AS avg_forward_return,
        ROUND((
          COUNT(*) FILTER (WHERE daily_return_pct <= $5::numeric AND forward_return_pct > 0)::numeric / 
          NULLIF(COUNT(*) FILTER (WHERE daily_return_pct <= $5::numeric), 0) * 100.0
        )::numeric, 2) AS hit_rate,
        COUNT(*) FILTER (WHERE daily_return_pct <= $5::numeric AND forward_return_pct > 0) AS winning_trades,
        COUNT(*) FILTER (WHERE daily_return_pct <= $5::numeric AND forward_return_pct <= 0) AS losing_trades
      FROM valid_trades;
    `;

    const summaryResult = await client.query(backtestQuery, [
      holdingDays,
      test_start,
      test_end,
      costsActive,
      fallThreshold,
    ]);

    const stats = summaryResult.rows[0];
    const numSignals = parseInt(stats.num_signals || '0', 10);
    const avgForwardReturn = parseFloat(stats.avg_forward_return || '0');
    const baselineAvgReturn = parseFloat(stats.baseline_avg_return || '0');
    const hitRate = parseFloat(stats.hit_rate || '0');
    const totalSampleDays = parseInt(stats.total_sample_days || '0', 10);
    const winningTrades = parseInt(stats.winning_trades || '0', 10);
    const losingTrades = parseInt(stats.losing_trades || '0', 10);

    // 2. Fetch all signal trades for charting and table review
    const tradesQuery = `
      WITH price_window AS (
        SELECT
          date,
          open,
          close,
          LAG(close, 1) OVER (ORDER BY date) AS prev_close,
          ROUND(((close - LAG(close, 1) OVER (ORDER BY date)) / LAG(close, 1) OVER (ORDER BY date) * 100.0)::numeric, 4) AS daily_return_pct,
          LEAD(open, 1) OVER (ORDER BY date) AS entry_open,
          LEAD(date, 1) OVER (ORDER BY date) AS entry_date,
          LEAD(close, $1::int) OVER (ORDER BY date) AS exit_close,
          LEAD(date, $1::int) OVER (ORDER BY date) AS exit_date
        FROM nifty_prices
        WHERE date >= $2::date AND date <= $3::date
      )
      SELECT
        date::text AS signal_date,
        daily_return_pct,
        entry_date::text,
        entry_open,
        exit_date::text,
        exit_close,
        ROUND(
          (((exit_close - entry_open) / entry_open * 100.0) - (CASE WHEN $4::boolean THEN 0.1 ELSE 0.0 END))::numeric,
          2
        ) AS forward_return_pct
      FROM price_window
      WHERE prev_close IS NOT NULL 
        AND entry_open IS NOT NULL 
        AND exit_close IS NOT NULL
        AND daily_return_pct <= $5::numeric
      ORDER BY date ASC;
    `;

    const tradesResult = await client.query(tradesQuery, [
      holdingDays,
      test_start,
      test_end,
      costsActive,
      fallThreshold,
    ]);

    // 3. Persist into experiments table
    await client.query('BEGIN');
    const expInsert = await client.query(
      `
      INSERT INTO experiments (
        question, fall_threshold_pct, holding_period_days, test_start, test_end, include_costs
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, created_at
      `,
      [question, fallThreshold, holdingDays, test_start, test_end, costsActive]
    );

    const experimentId = expInsert.rows[0].id;
    const createdAt = expInsert.rows[0].created_at;

    // 4. Persist into results table
    const resInsert = await client.query(
      `
      INSERT INTO results (
        experiment_id, num_signals, avg_forward_return, baseline_avg_return, hit_rate
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
      `,
      [experimentId, numSignals, avgForwardReturn, baselineAvgReturn, hitRate]
    );

    await client.query('COMMIT');

    // 5. Synthesize qualitative conclusions and caveats
    const conclusion = synthesizeConclusions({
      numSignals,
      avgForwardReturn,
      baselineAvgReturn,
      hitRate,
      fallThresholdPct: fallThreshold,
      holdingPeriodDays: holdingDays,
      includeCosts: costsActive,
    });

    // 6. Return comprehensive payload
    res.json({
      experiment: {
        id: experimentId,
        question,
        fall_threshold_pct: fallThreshold,
        holding_period_days: holdingDays,
        test_start,
        test_end,
        include_costs: costsActive,
        created_at: createdAt,
      },
      results: {
        id: resInsert.rows[0].id,
        num_signals: numSignals,
        avg_forward_return: avgForwardReturn,
        baseline_avg_return: baselineAvgReturn,
        excess_return: parseFloat((avgForwardReturn - baselineAvgReturn).toFixed(4)),
        hit_rate: hitRate,
        total_sample_days: totalSampleDays,
        winning_trades: winningTrades,
        losing_trades: losingTrades,
      },
      trades: tradesResult.rows,
      conclusion,
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Error running experiment backtest:', err);
    res.status(500).json({ error: 'Failed to execute backtest experiment', details: err.message });
  } finally {
    client.release();
  }
});

// GET /api/experiments - Fetch past experiments
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        e.id,
        e.question,
        e.fall_threshold_pct,
        e.holding_period_days,
        e.test_start::text,
        e.test_end::text,
        e.include_costs,
        e.created_at,
        r.num_signals,
        r.avg_forward_return,
        r.baseline_avg_return,
        r.hit_rate
      FROM experiments e
      LEFT JOIN results r ON r.experiment_id = e.id
      ORDER BY e.created_at DESC
      LIMIT 50;
    `;
    const list = await pool.query(query);
    res.json({ experiments: list.rows });
  } catch (err) {
    console.error('Error fetching past experiments:', err);
    res.status(500).json({ error: 'Failed to fetch experiments' });
  }
});

// GET /api/experiments/:id - Fetch single experiment details
router.get('/:id', async (req, res) => {
  try {
    const expId = parseInt(req.params.id, 10);
    const expQuery = `
      SELECT 
        e.id,
        e.question,
        e.fall_threshold_pct,
        e.holding_period_days,
        e.test_start::text,
        e.test_end::text,
        e.include_costs,
        e.created_at,
        r.id AS result_id,
        r.num_signals,
        r.avg_forward_return,
        r.baseline_avg_return,
        r.hit_rate
      FROM experiments e
      LEFT JOIN results r ON r.experiment_id = e.id
      WHERE e.id = $1
    `;
    const expRes = await pool.query(expQuery, [expId]);
    if (expRes.rows.length === 0) {
      return res.status(404).json({ error: 'Experiment not found' });
    }

    const row = expRes.rows[0];
    const conclusion = synthesizeConclusions({
      numSignals: row.num_signals,
      avgForwardReturn: parseFloat(row.avg_forward_return || '0'),
      baselineAvgReturn: parseFloat(row.baseline_avg_return || '0'),
      hitRate: parseFloat(row.hit_rate || '0'),
      fallThresholdPct: parseFloat(row.fall_threshold_pct),
      holdingPeriodDays: parseInt(row.holding_period_days, 10),
      includeCosts: row.include_costs,
    });

    res.json({
      experiment: row,
      conclusion,
    });
  } catch (err) {
    console.error('Error fetching experiment by id:', err);
    res.status(500).json({ error: 'Failed to fetch experiment' });
  }
});

module.exports = router;
