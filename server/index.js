const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const questionsRouter = require('./routes/questions');
const experimentsRouter = require('./routes/experiments');
const resultsRouter = require('./routes/results');
const pool = require('./db/pool');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/questions', questionsRouter);
app.use('/api/experiments', experimentsRouter);
app.use('/api/results', resultsRouter);

// Health check and dataset summary
app.get('/api/health', async (req, res) => {
  try {
    const dbTest = await pool.query('SELECT NOW() AS current_time, COUNT(*) AS price_count FROM nifty_prices');
    res.json({
      status: 'ok',
      database: 'connected',
      price_records: parseInt(dbTest.rows[0].price_count, 10),
      timestamp: dbTest.rows[0].current_time,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Start listening
const server = app.listen(PORT, () => {
  console.log(`📡 Market Hypothesis Lab backend listening on http://localhost:${PORT}`);
});

module.exports = { app, server };
