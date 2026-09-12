import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Database,
  Brain,
  ShieldCheck,
  CheckCircle,
  Table,
  RotateCcw,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function LearnStage({
  experiment,
  results,
  trades = [],
  conclusion,
  onInvestigateNext,
  onRestart,
}) {
  const [showAllTrades, setShowAllTrades] = useState(false);
  const [tradeFilter, setTradeFilter] = useState('all'); // all, win, loss

  const numSignals = results?.num_signals || 0;
  const avgForwardReturn = parseFloat(results?.avg_forward_return || 0);
  const baselineAvgReturn = parseFloat(results?.baseline_avg_return || 0);
  const excessReturn = parseFloat((avgForwardReturn - baselineAvgReturn).toFixed(4));
  const hitRate = parseFloat(results?.hit_rate || 0);
  const totalDays = results?.total_sample_days || 5234;

  // Chart data: Factual comparison
  const comparisonData = [
    {
      name: `Post-Signal (${experiment.fall_threshold_pct}% Drop)`,
      returnPct: avgForwardReturn,
      type: 'signal',
      label: `${avgForwardReturn >= 0 ? '+' : ''}${avgForwardReturn.toFixed(2)}%`,
    },
    {
      name: `Unconditional Baseline (All Days)`,
      returnPct: baselineAvgReturn,
      type: 'baseline',
      label: `${baselineAvgReturn >= 0 ? '+' : ''}${baselineAvgReturn.toFixed(2)}%`,
    },
  ];

  // Distribution chart data
  const filteredTrades = trades.filter((t) => {
    if (tradeFilter === 'win') return parseFloat(t.forward_return_pct) > 0;
    if (tradeFilter === 'loss') return parseFloat(t.forward_return_pct) <= 0;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-10">
      {/* Top Banner with Experiment Summary */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              Experiment Completed #{experiment.id}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {new Date(experiment.created_at || Date.now()).toLocaleDateString()}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100 mt-1">
            "{experiment.question}"
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-mono text-slate-400">
            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              Threshold: {experiment.fall_threshold_pct}%
            </span>
            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              Holding: {experiment.holding_period_days}d
            </span>
            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              Window: {experiment.test_start} to {experiment.test_end}
            </span>
            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              Costs: {experiment.include_costs ? '0.1% Applied' : 'None'}
            </span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>New Experiment</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: WHAT THE DATA SHOWS (PURE FACTUAL OUTPUT ONLY) */}
      {/* ========================================================================= */}
      <section className="bg-slate-950 border-2 border-cyan-900/50 rounded-2xl p-6 sm:p-8 relative overflow-hidden card-cyan-glow">
        <div className="flex items-center justify-between border-b border-cyan-950 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-slate-100 tracking-tight">
                  What the data shows
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/70 font-semibold">
                  Factual Output Only
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Direct empirical measurements computed from the historical price series without interpretive speculation.
              </p>
            </div>
          </div>
        </div>

        {/* Factual Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {/* Metric 1: Signal Events */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
              Signal Events
            </span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-100">
                {numSignals}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                / {totalDays} sessions
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">
              Trigger rate: {((numSignals / (totalDays || 1)) * 100).toFixed(2)}% of trading days
            </span>
          </div>

          {/* Metric 2: Average Forward Return */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
              Avg Forward Return
            </span>
            <div className="flex items-baseline space-x-1">
              <span
                className={`text-2xl sm:text-3xl font-bold font-mono ${
                  avgForwardReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {avgForwardReturn >= 0 ? '+' : ''}
                {avgForwardReturn.toFixed(2)}%
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">
              Over {experiment.holding_period_days}-day horizon following signal
            </span>
          </div>

          {/* Metric 3: Baseline Average Return */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
              Baseline Avg Return
            </span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-indigo-400">
                {baselineAvgReturn >= 0 ? '+' : ''}
                {baselineAvgReturn.toFixed(2)}%
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">
              Unconditional {experiment.holding_period_days}-day return on all sessions
            </span>
          </div>

          {/* Metric 4: Hit Rate */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
              Hit Rate (% Positive)
            </span>
            <div className="flex items-baseline space-x-1">
              <span
                className={`text-2xl sm:text-3xl font-bold font-mono ${
                  hitRate >= 50 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {hitRate.toFixed(1)}%
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1">
              {results?.winning_trades || Math.round((hitRate / 100) * numSignals)} win /{' '}
              {results?.losing_trades || numSignals - Math.round((hitRate / 100) * numSignals)} loss
            </span>
          </div>
        </div>

        {/* Visual Charts: Recharts Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Chart 1: Bar Comparison (Signal vs Baseline) */}
          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Return Comparison: Signal vs. Baseline
                </h4>
                <p className="text-[11px] text-slate-500">
                  Excess Return (Alpha):{' '}
                  <span className={excessReturn >= 0 ? 'text-emerald-400 font-mono font-bold' : 'text-rose-400 font-mono font-bold'}>
                    {excessReturn >= 0 ? '+' : ''}{excessReturn.toFixed(2)}%
                  </span>
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(v) => `${v}%`}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.5rem',
                      fontSize: '12px',
                    }}
                    formatter={(value) => [`${value}%`, 'Average Forward Return']}
                  />
                  <ReferenceLine y={0} stroke="#475569" />
                  <Bar dataKey="returnPct" radius={[6, 6, 0, 0]}>
                    {comparisonData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.type === 'signal' ? (entry.returnPct >= 0 ? '#10b981' : '#f43f5e') : '#6366f1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Signal Events Timeline Preview */}
          <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between h-full">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Signal Performance Breakdown
              </h4>
              <p className="text-[11px] text-slate-500 mb-4">
                Win/Loss balance across the {numSignals} historical triggers.
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Positive Trades (Wins)</span>
                    </span>
                    <span className="font-semibold text-emerald-400">
                      {results?.winning_trades || Math.round((hitRate / 100) * numSignals)} ({hitRate.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${hitRate}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span className="flex items-center space-x-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>Negative / Flat Trades</span>
                    </span>
                    <span className="font-semibold text-rose-400">
                      {results?.losing_trades || (numSignals - Math.round((hitRate / 100) * numSignals))} ({(100 - hitRate).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{ width: `${100 - hitRate}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>Unconditional Drift:</span>
                    <span className="text-indigo-300">+{baselineAvgReturn.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mean Reversion Premium:</span>
                    <span className={excessReturn >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                      {excessReturn >= 0 ? '+' : ''}{excessReturn.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80">
              <button
                onClick={() => setShowAllTrades(!showAllTrades)}
                className="w-full py-2 px-3 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 text-xs font-mono text-slate-300 flex items-center justify-center space-x-2 transition"
              >
                <Table className="w-3.5 h-3.5 text-cyan-400" />
                <span>{showAllTrades ? 'Hide Signal Trade Ledger' : `Inspect All ${numSignals} Signal Trades`}</span>
                {showAllTrades ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Signal Trades Ledger */}
        {showAllTrades && (
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Historical Trade Audit Log ({filteredTrades.length} records)
              </span>

              <div className="flex items-center space-x-2 text-xs font-mono">
                {['all', 'win', 'loss'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTradeFilter(filter)}
                    className={`px-2 py-0.5 rounded capitalize ${
                      tradeFilter === filter
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto max-h-72 border border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-400 sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="p-2.5">Signal Date</th>
                    <th className="p-2.5">Drop %</th>
                    <th className="p-2.5">Entry (T+1 Open)</th>
                    <th className="p-2.5">Exit (Close)</th>
                    <th className="p-2.5 text-right">Forward Return</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredTrades.slice(0, 100).map((trade, idx) => {
                    const ret = parseFloat(trade.forward_return_pct);
                    return (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="p-2.5 text-slate-400">{trade.signal_date}</td>
                        <td className="p-2.5 text-rose-400">{trade.daily_return_pct}%</td>
                        <td className="p-2.5">
                          {trade.entry_date} <span className="text-slate-500">(@ ₹{trade.entry_open})</span>
                        </td>
                        <td className="p-2.5">
                          {trade.exit_date} <span className="text-slate-500">(@ ₹{trade.exit_close})</span>
                        </td>
                        <td
                          className={`p-2.5 text-right font-semibold ${
                            ret > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {ret > 0 ? '+' : ''}
                          {ret.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredTrades.length > 100 && (
              <p className="text-[11px] text-slate-500 mt-2 font-mono text-center">
                Showing first 100 trades for performance. All {filteredTrades.length} trades are reflected in statistics.
              </p>
            )}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: WHAT WE CAN REASONABLY CONCLUDE (CAUTIOUS QUALITATIVE SYNTHESIS) */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-b from-amber-950/20 to-slate-950 border-2 border-amber-800/60 rounded-2xl p-6 sm:p-8 relative overflow-hidden card-amber-glow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-900/50 pb-4 mb-6 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-700/60 flex items-center justify-center text-amber-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-slate-100 tracking-tight">
                  What we can reasonably conclude
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/80 font-semibold">
                  Qualitative Interpretation
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cautious evaluation, evidence grading, and critical real-world caveats.
              </p>
            </div>
          </div>

          {/* Evidence Strength Badge */}
          <div className="self-start sm:self-center">
            <span
              className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider ${
                conclusion.evidenceLevel?.includes('Moderate')
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                  : conclusion.evidenceLevel?.includes('Weak')
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                  : 'bg-rose-950/80 text-rose-300 border border-rose-700/60'
              }`}
            >
              <span>Evidence Assessment:</span>
              <span>{conclusion.evidenceLevel || 'Moderate Positive Evidence'}</span>
            </span>
          </div>
        </div>

        {/* Synthesis Narrative */}
        <div className="bg-slate-950/80 border border-amber-900/40 rounded-xl p-5 mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Honest Research Assessment</span>
          </h4>
          <p className="text-sm text-slate-200 leading-relaxed">
            {conclusion.summary ||
              `The historical data suggests a tendency for NIFTY to rebound over a ${experiment.holding_period_days}-day horizon following a ≥${Math.abs(experiment.fall_threshold_pct)}% drop. However, this is a historical tendency, not a predictive law.`}
          </p>
        </div>

        {/* Explicit Caveats Grid */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Essential Caveats & Statistical Frictions (Do not ignore)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conclusion.caveats?.map((caveat, idx) => (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-1.5 hover:border-amber-900/50 transition"
              >
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-200">{caveat.title}</h5>
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                      caveat.severity === 'high'
                        ? 'bg-rose-950/60 text-rose-400 border border-rose-900/50'
                        : 'bg-amber-950/60 text-amber-400 border border-amber-900/50'
                    }`}
                  >
                    {caveat.severity} friction
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {caveat.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: WHAT TO INVESTIGATE NEXT (INTERACTIVE FOLLOW-UP QUESTIONS) */}
      {/* ========================================================================= */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-400">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100">
              What to investigate next
            </h3>
            <p className="text-xs text-slate-400">
              Good research never stops at a single backtest. Click any suggested branch to test it immediately.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {conclusion.nextInvestigations?.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onInvestigateNext(item)}
              className="text-left bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-700/80 rounded-xl p-4 transition group flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-900/50 mb-2 inline-block">
                  Follow-up #{idx + 1}
                </span>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-white line-clamp-2">
                  "{item.title}"
                </h4>
                <p className="text-xs text-slate-400 mt-2 line-clamp-3">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 group-hover:text-indigo-300 font-medium">
                <span>Load & Test</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
