const fs = require('fs');
const path = require('path');
const readline = require('readline');
const pool = require('./pool');

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🚀 Starting database seed...');

    // 1. Run schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log('✅ Schema tables verified/created.');

    // 2. Parse CSV and batch insert into nifty_prices
    const csvPath = path.join(__dirname, '..', '..', 'data', 'nifty.csv');
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at ${csvPath}`);
    }

    const fileStream = fs.createReadStream(csvPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let isHeader = true;
    let batch = [];
    const BATCH_SIZE = 500;
    let totalInserted = 0;

    async function insertBatch(rows) {
      if (rows.length === 0) return;
      const values = [];
      const placeholders = [];

      rows.forEach((row, idx) => {
        const offset = idx * 5;
        placeholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`);
        values.push(row.date, row.open, row.high, row.low, row.close);
      });

      const query = `
        INSERT INTO nifty_prices (date, open, high, low, close)
        VALUES ${placeholders.join(', ')}
        ON CONFLICT (date) DO UPDATE 
        SET open = EXCLUDED.open,
            high = EXCLUDED.high,
            low = EXCLUDED.low,
            close = EXCLUDED.close
      `;

      await client.query(query, values);
      totalInserted += rows.length;
    }

    for await (const line of rl) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (isHeader) {
        isHeader = false;
        continue;
      }

      const [date, open, high, low, close] = trimmed.split(',');
      if (date && open && high && low && close) {
        batch.push({
          date,
          open: parseFloat(open),
          high: parseFloat(high),
          low: parseFloat(low),
          close: parseFloat(close),
        });

        if (batch.length >= BATCH_SIZE) {
          await insertBatch(batch);
          batch = [];
        }
      }
    }

    if (batch.length > 0) {
      await insertBatch(batch);
    }

    // 3. Query stats
    const statsRes = await client.query(`
      SELECT 
        COUNT(*) AS total_count,
        MIN(date)::text AS min_date,
        MAX(date)::text AS max_date,
        ROUND(MIN(close)::numeric, 2) AS min_close,
        ROUND(MAX(close)::numeric, 2) AS max_close
      FROM nifty_prices
    `);

    console.log('✅ Seeding completed successfully!');
    console.log(`📊 Statistics:
      - Total Price Rows: ${statsRes.rows[0].total_count}
      - Date Range: ${statsRes.rows[0].min_date} to ${statsRes.rows[0].max_date}
      - Price Range: ₹${statsRes.rows[0].min_close} to ₹${statsRes.rows[0].max_close}
    `);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
