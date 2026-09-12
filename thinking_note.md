# Thinking Note
### "Does buying NIFTY after a sharp fall work?"

---

## 1. How I Interpret the Question

The question is really three sub-questions bundled into one sentence:

- **What counts as a "sharp fall"?** — a single-day drop, a multi-day cumulative drop, or a statistically unusual move (e.g. a drop larger than N standard deviations of recent volatility)?
- **What does "buying" mean operationally?** — buy at what price, in what size, and exit when?
- **What does "work" mean?** — profitable on average? Profitable after costs? Better than doing nothing? Better than buying on a random day? Statistically significant, or just true in hindsight over one sample period?

None of these are specified, and each choice materially changes the answer. A -1% single-day definition will fire dozens of times a year and mostly capture noise; a -5% single-day definition will fire a handful of times a decade and mostly capture crisis events (2008, 2020). These are not the same experiment, so before testing anything, the system has to make its working definition explicit rather than silently picking one.

**Information needed before testing:**
- Daily (or intraday) NIFTY price history covering multiple market regimes (not just one bull run)
- A precise, falsifiable definition of "sharp fall"
- A precise entry rule, exit rule, and holding period
- A benchmark to compare against (e.g. NIFTY's average return on any random day) — without this, "positive average return" is meaningless, since NIFTY drifts upward over most long periods anyway

---

## 2. Assumptions vs. What the User Said vs. What the System Should Ask

| What the user actually said | What I assumed | What the system should ask instead of assuming |
|---|---|---|
| "buying NIFTY" | Buy the NIFTY 50 index (via a proxy instrument, e.g. an ETF or futures) — not a discretionary stock basket | Confirm instrument: index ETF, futures, or index value itself (no slippage/liquidity modeling) |
| "after a sharp fall" | A single-day close-to-close decline of ≥ 2% | What threshold and time-window defines "sharp"? (1-day / 3-day / volatility-adjusted) |
| "does it work" | Work = positive average forward return over the holding period, compared to NIFTY's average return on all days | Should "work" mean average return, hit-rate (% of times profitable), or risk-adjusted return? |
| (unstated) holding period | 5 trading days | How long is the position held before being exited? |
| (unstated) test period | Longest available history — ideally 10–15+ years, spanning multiple crashes and recoveries | Is there a specific period of interest (e.g. only post-2015, only excluding COVID)? |
| (unstated) costs | Ignore transaction costs/slippage in the first pass, but flag this explicitly | Should costs and slippage be included? |

The key discipline here: the system should **never silently convert an assumption into a fact**. Every assumed parameter should be shown to the user as an editable, confirmable value before the experiment runs.

---

## 3. Minimum Questions to Ask the User

1. How do you define a "sharp fall"? (magnitude + time window)
2. How long do you hold the position after buying? (1 day / 5 days / 1 month / until recovery?)
3. What time period should be tested? (full history / a specific era / excluding known outliers like COVID crash?)
4. What does "success" mean to you? (average return / win-rate / beating a buy-and-hold benchmark?)
5. Should transaction costs and slippage be factored in?

These five are prioritized because without them the experiment simply cannot be run — everything else (filters, position sizing, statistical significance) is refinement on top of these.

---

## 4. The Experiment, Defined

| Parameter | Definition |
|---|---|
| **Market / Instrument** | NIFTY 50 index (daily close-to-close data) |
| **Entry Condition** | Single-day return ≤ −2% (close-to-close) |
| **Entry Execution** | Buy at next day's open (to avoid look-ahead bias — you can't buy at today's close using today's information) |
| **Exit Condition** | Fixed holding period, exit at close |
| **Holding Period** | 5 trading days (adjustable parameter) |
| **Test Period** | Full available history (e.g. 2005–2025), so the sample spans multiple crash/recovery cycles rather than just one |
| **Filters** | None initially, to keep the base case simple — could later add "exclude overlapping signal days" so consecutive falls aren't double-counted |
| **Cost Assumptions** | Base case ignores transaction costs and slippage; explicitly labeled as an idealized result |
| **Hypothesis** | "NIFTY exhibits short-term mean reversion after a sharp one-day decline — average forward 5-day return following a ≥2% drop is higher than the average unconditional 5-day return." |

---

## 5. What Could Go Wrong

- **Ambiguous definitions** — a different "sharp fall" threshold or holding period can flip the conclusion entirely; the result is conditional on arbitrary-seeming choices, not a universal truth.
- **Look-ahead bias** — using today's close to decide to buy at today's close (rather than tomorrow's open) would make the backtest unrealistic, since that price wasn't tradeable at decision time.
- **Small sample size / overfitting** — large single-day drops (≥2%) may only occur a few dozen times in a decade. A handful of these will be crisis events (2008, 2020) whose recoveries dominate the average — meaning the result reflects two or three episodes, not a robust pattern.
- **Regime dependence** — a rule "discovered" on 2005–2025 data (mostly a long bull market for Indian equities) may not hold in a prolonged bear market or a different macro regime.
- **Ignoring costs and slippage** — a strategy that looks profitable gross of costs can be unprofitable net of costs, especially with a short holding period generating frequent trades.
- **Survivorship / index composition changes** — NIFTY's constituents have changed over 20 years; today's index doesn't perfectly represent the index at each historical point.
- **Confusing correlation with causation** — even a statistically clean result only shows historical association between "sharp fall" and subsequent return, not a guaranteed causal mechanism that will persist going forward.
- **Insufficient evidence for confidence** — even if the average return is positive, without a measure of variance/significance (e.g. how many of the trades were actually profitable, or a t-stat) the result could just be noise dressed up as a pattern.

The most important discipline for the system to enforce: clearly separate **what the data shows** (a set of average/median returns from historical instances) from **what we can reasonably conclude** (weak/moderate/strong evidence for a real effect, always caveated), and never let the second overstate the first.
