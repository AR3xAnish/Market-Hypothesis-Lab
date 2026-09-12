const pool = require('./db/pool');

async function testNonOverlappingBacktest() {
  const fallThreshold = -2.0;
  const holdingPeriod = 5;
  const startDate = '2005-01-03';
  const endDate = '2025-01-31';
  const includeCosts = false;

  const query = `
    WITH RECURSIVE
    indexed_data AS (
      SELECT
        ROW_NUMBER() OVER (ORDER BY date) AS row_num,
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
    valid_rows AS (
      SELECT
        row_num,
        date AS signal_date,
        daily_return_pct,
        entry_date,
        entry_open,
        exit_date,
        exit_close,
        ROUND(
          (((exit_close - entry_open) / entry_open * 100.0) - (CASE WHEN $4::boolean THEN 0.1 ELSE 0.0 END))::numeric,
          4
        ) AS forward_return_pct
      FROM indexed_data
      WHERE prev_close IS NOT NULL 
        AND entry_open IS NOT NULL 
        AND exit_close IS NOT NULL
    ),
    raw_signals AS (
      SELECT * FROM valid_rows WHERE daily_return_pct <= $5::numeric
    ),
    non_overlapping AS (
      (
        SELECT *
        FROM raw_signals
        ORDER BY row_num ASC
        LIMIT 1
      )
      UNION ALL
      SELECT next_sig.*
      FROM non_overlapping curr
      CROSS JOIN LATERAL (
        SELECT *
        FROM raw_signals s
        WHERE s.row_num >= curr.row_num + $1::int
        ORDER BY s.row_num ASC
        LIMIT 1
      ) next_sig
    )
    SELECT
      (SELECT COUNT(*) FROM valid_rows) AS total_sample_days,
      (SELECT ROUND(AVG(forward_return_pct)::numeric, 4) FROM valid_rows) AS baseline_avg_return,
      COUNT(*) AS num_signals,
      ROUND(AVG(forward_return_pct)::numeric, 4) AS avg_forward_return,
      ROUND((COUNT(*) FILTER (WHERE forward_return_pct > 0)::numeric / NULLIF(COUNT(*), 0) * 100.0)::numeric, 2) AS hit_rate,
      COUNT(*) FILTER (WHERE forward_return_pct > 0) AS winning_trades,
      COUNT(*) FILTER (WHERE forward_return_pct <= 0) AS losing_trades
    FROM non_overlapping;
  `;

  try {
    const res = await pool.query(query, [holdingPeriod, startDate, endDate, includeCosts, fallThreshold]);
    console.log('De-duplicated Non-Overlapping Backtest Query Results:');
    console.log(res.rows[0]);

    // Also check the non_overlapping trades list
    const tradesQuery = `
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
          LEAD(date, 1) OVER (ORDER BY date) AS entry_date,
          LEAD(close, $1::int) OVER (ORDER BY date) AS exit_close,
          LEAD(date, $1::int) OVER (ORDER BY date) AS exit_date
        FROM nifty_prices
        WHERE date >= $2::date AND date <= $3::date
      ),
      valid_rows AS (
        SELECT
          row_num,
          date AS signal_date,
          daily_return_pct,
          entry_date,
          entry_open,
          exit_date,
          exit_close,
          ROUND(
            (((exit_close - entry_open) / entry_open * 100.0) - (CASE WHEN $4::boolean THEN 0.1 ELSE 0.0 END))::numeric,
            2
          ) AS forward_return_pct
        FROM indexed_data
        WHERE prev_close IS NOT NULL 
          AND entry_open IS NOT NULL 
          AND exit_close IS NOT NULL
      ),
      raw_signals AS (
        SELECT * FROM valid_rows WHERE daily_return_pct <= $5::numeric
      ),
      non_overlapping AS (
        (
          SELECT *
          FROM raw_signals
          ORDER BY row_num ASC
          LIMIT 1
        )
        UNION ALL
        SELECT next_sig.*
        FROM non_overlapping curr
        CROSS JOIN LATERAL (
          SELECT *
          FROM raw_signals s
          WHERE s.row_num >= curr.row_num + $1::int
          ORDER BY s.row_num ASC
          LIMIT 1
        ) next_sig
      )
      SELECT
        signal_date::text,
        daily_return_pct,
        entry_date::text,
        entry_open,
        exit_date::text,
        exit_close,
        forward_return_pct
      FROM non_overlapping
      ORDER BY row_num ASC;
    `;
    const tradesRes = await pool.query(tradesQuery, [holdingPeriod, startDate, endDate, includeCosts, fallThreshold]);
    console.log(`Total non-overlapping trades count: ${tradesRes.rows.length}`);
    console.log('Sample first 2 non-overlapping trades:');
    console.log(tradesRes.rows.slice(0, 2));
  } catch (err) {
    console.error('Error running test backtest:', err);
  } finally {
    await pool.end();
  }
}

testNonOverlappingBacktest();
