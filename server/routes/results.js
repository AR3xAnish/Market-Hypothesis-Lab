const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// GET /api/results/:experimentId
router.get('/:experimentId', async (req, res) => {
  try {
    const experimentId = parseInt(req.params.experimentId, 10);
    const query = `
      SELECT 
        r.*,
        e.question,
        e.fall_threshold_pct,
        e.holding_period_days,
        e.test_start::text,
        e.test_end::text,
        e.include_costs
      FROM results r
      JOIN experiments e ON e.id = r.experiment_id
      WHERE r.experiment_id = $1
    `;
    const result = await pool.query(query, [experimentId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Results not found for experiment' });
    }
    res.json({ result: result.rows[0] });
  } catch (err) {
    console.error('Error fetching result:', err);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

module.exports = router;
