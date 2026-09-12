// Script to generate a realistic synthetic NIFTY 50 daily price history (2005 - 2025)
// Contains ~5,000 trading days with historical regime characteristics:
// - 2005-2007: Emerging markets bull run (2,000 -> 6,300)
// - 2008: Global Financial Crisis crash (6,300 -> 2,500)
// - 2009-2010: Rapid liquidity recovery (2,500 -> 6,000)
// - 2011-2013: European debt crisis / taper tantrum consolidation (4,800 - 6,200)
// - 2014-2019: Steady expansion (6,200 -> 12,300)
// - Feb-Mar 2020: COVID crash (12,300 -> 7,600) with severe single-day drops
// - 2020-2024: Massive post-COVID secular bull run (7,600 -> 24,000+)

const fs = require('fs');
const path = require('path');

function generateNiftyData() {
  const startDate = new Date('2005-01-03');
  const endDate = new Date('2025-01-31');

  // Key historical milestones [date, targetClose]
  const milestones = [
    { date: new Date('2005-01-03'), price: 2080 },
    { date: new Date('2006-05-10'), price: 3750 },
    { date: new Date('2006-06-14'), price: 2600 },
    { date: new Date('2007-12-31'), price: 6138 },
    { date: new Date('2008-01-08'), price: 6300 },
    { date: new Date('2008-10-27'), price: 2524 }, // Lehman / GFC trough
    { date: new Date('2009-05-18'), price: 4321 }, // Election upper circuit
    { date: new Date('2010-11-05'), price: 6312 },
    { date: new Date('2011-12-20'), price: 4544 }, // European debt crisis
    { date: new Date('2013-08-28'), price: 5120 }, // Taper tantrum
    { date: new Date('2015-03-03'), price: 8996 }, // Moditerm rally
    { date: new Date('2016-02-29'), price: 6987 }, // China devaluation / NPA shock
    { date: new Date('2016-11-08'), price: 8543 }, // Demonetization
    { date: new Date('2018-01-29'), price: 11130 },
    { date: new Date('2018-10-26'), price: 10030 }, // IL&FS crisis
    { date: new Date('2020-01-14'), price: 12362 }, // Pre-COVID peak
    { date: new Date('2020-03-23'), price: 7610 },  // COVID bottom
    { date: new Date('2021-10-18'), price: 18477 }, // Post-covid high
    { date: new Date('2022-06-17'), price: 15293 }, // Inflation correction
    { date: new Date('2023-03-20'), price: 16988 }, // Adani shock
    { date: new Date('2024-06-04'), price: 21884 }, // Election counting day dip
    { date: new Date('2024-09-26'), price: 26216 }, // All-time high
    { date: new Date('2025-01-31'), price: 23508 }  // Recent consolidation
  ];

  // Helper to interpolate base price
  function getTargetPrice(curDate) {
    if (curDate <= milestones[0].date) return milestones[0].price;
    if (curDate >= milestones[milestones.length - 1].date) return milestones[milestones.length - 1].price;
    for (let i = 0; i < milestones.length - 1; i++) {
      if (curDate >= milestones[i].date && curDate <= milestones[i + 1].date) {
        const span = milestones[i + 1].date - milestones[i].date;
        const progress = (curDate - milestones[i].date) / span;
        return milestones[i].price + (milestones[i + 1].price - milestones[i].price) * progress;
      }
    }
    return 10000;
  }

  // Pseudo-random generator with fixed seed for determinism
  let seed = 42;
  function random() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  function randomNormal() {
    let u = 0, v = 0;
    while (u === 0) u = random();
    while (v === 0) v = random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  const rows = ['date,open,high,low,close'];
  let curPrice = milestones[0].price;
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const targetPrice = getTargetPrice(currentDate);

      // Mean reversion towards macro trajectory + daily volatility
      const drift = (targetPrice - curPrice) * 0.05;
      
      // Plausible fat tails & periodic volatility clusters
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      let dailyVol = 0.011; // base 1.1% daily volatility

      if (year === 2008 || (year === 2020 && (month === 1 || month === 2 || month === 3))) {
        dailyVol = 0.026; // Crisis volatility
      } else if (year === 2006 || year === 2011 || year === 2015) {
        dailyVol = 0.015;
      }

      // Generate daily return with occasional jump shocks
      let shock = randomNormal() * dailyVol;
      const jumpRoll = random();
      if (jumpRoll < 0.04) {
        // Sudden 2% to 4% crash day
        shock = -0.02 - (random() * 0.025);
      } else if (jumpRoll > 0.98) {
        // Sudden recovery bounce +2% to +3.5%
        shock = 0.02 + (random() * 0.018);
      }

      const dailyReturn = shock + (drift / curPrice);
      const prevClose = curPrice;
      
      // Intraday Open with small overnight gap
      const gap = (randomNormal() * 0.004) * prevClose;
      const open = Number((prevClose + gap).toFixed(2));
      
      // Close price based on daily return from previous close
      const close = Number((prevClose * (1 + dailyReturn)).toFixed(2));
      
      // High and Low wrapping Open and Close
      const maxOC = Math.max(open, close);
      const minOC = Math.min(open, close);
      const highWick = Math.abs(randomNormal() * 0.005) * prevClose;
      const lowWick = Math.abs(randomNormal() * 0.005) * prevClose;

      const high = Number((maxOC + highWick).toFixed(2));
      const low = Number((Math.max(10, minOC - lowWick)).toFixed(2));

      rows.push(`${dateStr},${open},${high},${low},${close}`);
      curPrice = close;
    }
    // Next calendar day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const outDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outPath = path.join(outDir, 'nifty.csv');
  fs.writeFileSync(outPath, rows.join('\n'), 'utf8');
  console.log(`Generated ${rows.length - 1} daily price records in ${outPath}`);
}

generateNiftyData();
