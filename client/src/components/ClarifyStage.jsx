import React from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Info, Calendar, DollarSign, Clock, TrendingDown, Crosshair } from 'lucide-react';

export default function ClarifyStage({
  question,
  params,
  setParams,
  rationales,
  datasetBounds,
  onProceed,
  onBack,
}) {
  const updateParam = (key, val) => {
    setParams((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-white mb-3 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Question</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                Stage 2: Clarification
              </span>
              <h2 className="text-xl font-bold text-slate-100">
                Define Quantitative Parameters
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Trading questions require exact mathematical definitions. Every assumption below is explicitly editable.
            </p>
          </div>

          <div className="text-right sm:text-left bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300">
            <span className="text-slate-500 text-[10px] uppercase block">Question In Scope</span>
            <span className="truncate max-w-xs block font-medium">"{question}"</span>
          </div>
        </div>
      </div>

      {/* Parameter Cards Grid */}
      <div className="space-y-4">
        {/* 1. Sharp Fall Threshold */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-5 hover:border-slate-700/80 transition">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1 sm:max-w-md">
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-semibold text-slate-100">
                  1. "Sharp Fall" Threshold
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-900/60">
                  Signal Trigger
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {rationales?.fall_threshold ||
                  'Single-day close-to-close decline. Default of -2.0% filters for significant index sell-offs.'}
              </p>
            </div>

            <div className="flex items-center space-x-3 bg-slate-950/70 p-3 rounded-lg border border-slate-800 self-start">
              <div className="space-y-1 text-right">
                <label className="text-[10px] font-mono text-slate-500 block uppercase">
                  Decline %
                </label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    step="0.1"
                    max="-0.1"
                    min="-10.0"
                    value={params.fall_threshold_pct}
                    onChange={(e) => updateParam('fall_threshold_pct', parseFloat(e.target.value) || -2.0)}
                    className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right font-mono text-sm text-rose-300 focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-xs font-mono text-slate-400">%</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-col space-y-1 pl-2 border-l border-slate-800 text-[10px]">
                {[-1.5, -2.0, -3.0, -4.0].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => updateParam('fall_threshold_pct', preset)}
                    className={`px-1.5 py-0.5 rounded font-mono transition ${
                      params.fall_threshold_pct === preset
                        ? 'bg-rose-900 text-rose-200 font-semibold'
                        : 'text-slate-400 hover:text-white bg-slate-800/40'
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Holding Period */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-5 hover:border-slate-700/80 transition">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1 sm:max-w-md">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-slate-100">
                  2. Holding Period After Entry
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-900/60">
                  Horizon
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {rationales?.holding_period ||
                  'Number of trading days held after entry before closing at market close.'}
              </p>
            </div>

            <div className="flex items-center space-x-3 bg-slate-950/70 p-3 rounded-lg border border-slate-800 self-start">
              <div className="space-y-1 text-right">
                <label className="text-[10px] font-mono text-slate-500 block uppercase">
                  Duration
                </label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    step="1"
                    value={params.holding_period_days}
                    onChange={(e) => updateParam('holding_period_days', parseInt(e.target.value, 10) || 5)}
                    className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right font-mono text-sm text-cyan-300 focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-xs font-mono text-slate-400">days</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-col space-y-1 pl-2 border-l border-slate-800 text-[10px]">
                {[3, 5, 10, 20].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => updateParam('holding_period_days', days)}
                    className={`px-1.5 py-0.5 rounded font-mono transition ${
                      params.holding_period_days === days
                        ? 'bg-cyan-900 text-cyan-200 font-semibold'
                        : 'text-slate-400 hover:text-white bg-slate-800/40'
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Entry Execution & Look-ahead Bias Protection */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-5 hover:border-slate-700/80 transition">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1 sm:max-w-lg">
              <div className="flex items-center space-x-2">
                <Crosshair className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-slate-100">
                  3. Entry Execution Timing
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-900/60">
                  Anti-Bias Lock
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Executed strictly at <strong>next day's Open (T+1 Open)</strong>, not same-day close.
                In real trading, a trader only confirms a -2% daily drop at the close of Day T, meaning the earliest feasible entry without look-ahead bias is Day T+1's open.
              </p>
            </div>

            <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-3 text-xs text-emerald-300 flex items-center space-x-2 shrink-0 self-start">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-mono text-[11px]">T+1 Open (No Look-Ahead)</span>
            </div>
          </div>
        </div>

        {/* 4. Test Period */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-5 hover:border-slate-700/80 transition">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1 sm:max-w-md">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-slate-100">
                  4. Historical Test Period
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-900/60">
                  Sample Window
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full available historical dataset range (2005 to 2025). You may adjust to isolate specific eras (e.g. post-2020).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block">Start Date</span>
                <input
                  type="date"
                  min={datasetBounds?.min_date || '2005-01-03'}
                  max={params.test_end}
                  value={params.test_start}
                  onChange={(e) => updateParam('test_start', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <span className="text-slate-600 hidden sm:inline">→</span>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase block">End Date</span>
                <input
                  type="date"
                  min={params.test_start}
                  max={datasetBounds?.max_date || '2025-01-31'}
                  value={params.test_end}
                  onChange={(e) => updateParam('test_end', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 5. Transaction Costs Toggle */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-5 hover:border-slate-700/80 transition">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1 sm:max-w-md">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-100">
                  5. Transaction Costs & Slippage
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-900/60">
                  Friction
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Off by default for pure statistical evaluation. When enabled, subtracts 0.1% flat round-trip costs from every trade.
              </p>
            </div>

            <div className="flex items-center space-x-3 bg-slate-950/70 p-3 rounded-lg border border-slate-800 self-start">
              <span className="text-xs font-mono text-slate-400">
                {params.include_costs ? '0.1% Flat Deducted' : '0.0% (Zero Friction)'}
              </span>
              <button
                type="button"
                onClick={() => updateParam('include_costs', !params.include_costs)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  params.include_costs ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
                role="switch"
                aria-checked={params.include_costs}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    params.include_costs ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit Question</span>
        </button>

        <button
          type="button"
          onClick={onProceed}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-semibold text-sm transition shadow-lg shadow-cyan-500/20"
        >
          <span>Confirm & Define Experiment</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>
    </div>
  );
}
