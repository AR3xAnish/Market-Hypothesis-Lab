const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Default recommended questions
const SAMPLE_QUESTIONS = [
  {
    id: 'nifty-sharp-fall',
    text: 'Does buying NIFTY after a sharp fall work?',
    category: 'Mean Reversion',
    description: 'Investigate if extreme single-day selling creates a systematic short-term rebound.',
    params: {
      fall_threshold_pct: -2.0,
      holding_period_days: 5,
      include_costs: false,
    },
  },
  {
    id: 'nifty-severe-crash',
    text: 'Is a severe 3% single-day crash an immediate dip-buying opportunity?',
    category: 'Tail Events',
    description: 'Test whether larger tail sell-offs produce stronger or weaker forward returns.',
    params: {
      fall_threshold_pct: -3.0,
      holding_period_days: 5,
      include_costs: false,
    },
  },
  {
    id: 'nifty-quick-bounce',
    text: 'Do post-crash bounces exhaust within 3 trading days?',
    category: 'Holding Horizon',
    description: 'Evaluate if a shorter 3-day holding horizon captures the bulk of the rebound.',
    params: {
      fall_threshold_pct: -2.0,
      holding_period_days: 3,
      include_costs: false,
    },
  },
  {
    id: 'nifty-ten-day-drift',
    text: 'Does a 10-day holding period outperform a 5-day holding period after a drop?',
    category: 'Trend & Drift',
    description: 'Compare longer holding duration against shorter horizons post-signal.',
    params: {
      fall_threshold_pct: -2.0,
      holding_period_days: 10,
      include_costs: false,
    },
  },
];

// Helper to generate hypothesis statement
function generateHypothesis({ fall_threshold_pct, holding_period_days }) {
  const absThreshold = Math.abs(parseFloat(fall_threshold_pct));
  const days = parseInt(holding_period_days, 10);
  return `NIFTY exhibits short-term mean reversion after a sharp one-day decline — average forward ${days}-day return following a ≥${absThreshold}% drop is higher than the average unconditional ${days}-day return.`;
}

// GET /api/questions/defaults - Get dataset bounds and sample prompts
router.get('/defaults', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        MIN(date)::text AS min_date,
        MAX(date)::text AS max_date,
        COUNT(*) AS total_days
      FROM nifty_prices
    `);

    const minDate = stats.rows[0]?.min_date || '2005-01-03';
    const maxDate = stats.rows[0]?.max_date || '2025-01-31';

    res.json({
      defaults: {
        fall_threshold_pct: -2.0,
        holding_period_days: 5,
        entry_timing: "Next trading day's Open (avoids look-ahead bias)",
        test_start: minDate,
        test_end: maxDate,
        include_costs: false,
        dataset_bounds: {
          min_date: minDate,
          max_date: maxDate,
          total_days: parseInt(stats.rows[0]?.total_days || '0', 10),
        },
      },
      sample_questions: SAMPLE_QUESTIONS,
    });
  } catch (err) {
    console.error('Error fetching question defaults:', err);
    res.status(500).json({ error: 'Failed to fetch default parameters' });
  }
});

// POST /api/questions/clarify - Clarifies raw question into parameters
router.post('/clarify', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question text is required' });
    }

    const stats = await pool.query(`
      SELECT MIN(date)::text AS min_date, MAX(date)::text AS max_date FROM nifty_prices
    `);
    const minDate = stats.rows[0]?.min_date || '2005-01-03';
    const maxDate = stats.rows[0]?.max_date || '2025-01-31';

    // Simple heuristic parser for user query
    let fallThreshold = -2.0;
    let holdingDays = 5;
    const textLower = question.toLowerCase();

    // Check for percentage mentions like "3%", "1.5%", "2%"
    const pctMatch = textLower.match(/([0-9]+(?:\.[0-9]+)?)\s*%/);
    if (pctMatch) {
      fallThreshold = -Math.abs(parseFloat(pctMatch[1]));
    }

    // Check for day mentions like "10 days", "3-day", "2 weeks"
    const daysMatch = textLower.match(/(\d+)\s*(?:day|days|trading days)/);
    if (daysMatch) {
      holdingDays = Math.min(30, Math.max(1, parseInt(daysMatch[1], 10)));
    } else if (textLower.includes('week') || textLower.includes('1 week')) {
      holdingDays = 5;
    } else if (textLower.includes('2 weeks') || textLower.includes('two weeks')) {
      holdingDays = 10;
    } else if (textLower.includes('month') || textLower.includes('1 month')) {
      holdingDays = 21;
    }

    const hypothesis = generateHypothesis({
      fall_threshold_pct: fallThreshold,
      holding_period_days: holdingDays,
    });

    res.json({
      question: question.trim(),
      parameters: {
        fall_threshold_pct: fallThreshold,
        holding_period_days: holdingDays,
        test_start: minDate,
        test_end: maxDate,
        include_costs: false,
        entry_timing: "Next trading day's Open",
      },
      hypothesis,
      rationales: {
        fall_threshold: `A ${Math.abs(fallThreshold)}% single-day close-to-close decline represents an unusual distribution event (~top 5-8% worst daily drops in NIFTY).`,
        holding_period: `${holdingDays} trading days corresponds to a typical swing mean-reversion cycle without absorbing multi-week macro trend continuation.`,
        entry_execution: `Execution at next day's Open eliminates look-ahead bias (traders cannot execute at the close after observing the close).`,
        test_period: `Full dataset (${minDate} to ${maxDate}) covers multiple bull, bear, and crisis regimes.`,
        transaction_costs: `Turned off by default for clean theoretical baseline; toggling on applies 0.1% round-trip friction.`,
      },
    });
  } catch (err) {
    console.error('Error clarifying question:', err);
    res.status(500).json({ error: 'Failed to clarify question' });
  }
});

module.exports = router;
