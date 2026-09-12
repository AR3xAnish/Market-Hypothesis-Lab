const pool = require('./db/pool');

async function testBacktest() {
  const fallThreshold = -2.0;
  const holdingPeriod = 5;
  const startDate = '2005-01-03';
  const endDate = '2025-01-31';
  const includeCosts = false;

  const query = `
    WITH price_window AS (
      SELECT
        date,
        open,
        high,
        low,
        close,
        LAG(close, 1) OVER (ORDER BY date) AS prev_close,
        ((close - LAG(close, 1) OVER (ORDER BY date)) / LAG(close, 1) OVER (ORDER BY date) * 100.0) AS daily_return_pct,
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
        ((exit_close - entry_open) / entry_open * 100.0) - (CASE WHEN $4::boolean THEN 0.1 ELSE 0.0 END) AS forward_return_pct
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
      )::numeric, 2) AS hit_rate
    FROM valid_trades;
  `;

  try {
    const res = await pool.query(query, [holdingPeriod, startDate, endDate, includeCosts, fallThreshold]);
    console.log('Backtest Query Results:');
    console.log(res.rows[0]);
  } catch (err) {
    console.error('Error running test backtest:', err);
  } finally {
    await pool.end();
  }
}

testBacktest();
