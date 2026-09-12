import React from 'react';
import { ArrowLeft, Play, FileText, CheckCircle2, ShieldAlert, Cpu, Sparkles, Scale } from 'lucide-react';

export default function DefineStage({
  question,
  params,
  hypothesis,
  onProceed,
  onBack,
}) {
  const absThreshold = Math.abs(params.fall_threshold_pct);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-white mb-3 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Clarify Parameters</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
            Stage 3: Experiment Specification
          </span>
          <h2 className="text-xl font-bold text-slate-100">
            Formal Experiment Card
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Review the formal specification of your hypothesis before triggering the historical backtest.
        </p>
      </div>

      {/* Main Experiment Card */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden card-subtle-glow">
        <div className="flex items-start justify-between border-b border-slate-800 pb-5 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Research Protocol #EXP-{Math.floor(1000 + Math.random() * 9000)}
              </span>
              <h3 className="text-lg font-bold text-slate-100 mt-0.5">
                NIFTY Post-Decline Mean Reversion Test
              </h3>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-800/60 text-emerald-400 text-xs font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Specification Locked</span>
          </div>
        </div>

        {/* Structured Spec Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono mb-6">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-500 uppercase">Target Market</span>
              <span className="text-slate-200 font-semibold">NIFTY 50 Index (Equities)</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-500 uppercase">Trigger Condition</span>
              <span className="text-rose-400 font-semibold">Daily Return ≤ {params.fall_threshold_pct}%</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-500 uppercase">Entry Execution</span>
              <span className="text-emerald-400 font-semibold">Day T+1 Open (No Look-Ahead)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 uppercase">Exit Execution</span>
              <span className="text-cyan-300 font-semibold">Day T+{params.holding_period_days} Close</span>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-500 uppercase">Holding Horizon</span>
              <span className="text-cyan-400 font-semibold">{params.holding_period_days} Trading Days</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-500 uppercase">Historical Window</span>
              <span className="text-slate-200 font-semibold">{params.test_start} → {params.test_end}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-500 uppercase">Friction / Costs</span>
              <span className={params.include_costs ? 'text-amber-400 font-semibold' : 'text-slate-400 font-semibold'}>
                {params.include_costs ? '0.1% Round-Trip Slippage' : '0.0% (Zero Cost Baseline)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 uppercase">Benchmark</span>
              <span className="text-indigo-400 font-semibold">Unconditional {params.holding_period_days}-Day Drift</span>
            </div>
          </div>
        </div>

        {/* Hypothesis Statement Box */}
        <div className="bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-slate-900 border border-cyan-800/40 rounded-xl p-5 mb-6 relative">
          <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Formal Testable Hypothesis Statement</span>
          </div>
          <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed italic">
            "{hypothesis || `NIFTY exhibits short-term mean reversion after a sharp one-day decline — average forward ${params.holding_period_days}-day return following a ≥${absThreshold}% drop is higher than the average unconditional ${params.holding_period_days}-day return.`}"
          </p>
        </div>

        {/* Integrity Checklist */}
        <div className="border-t border-slate-800 pt-4 mb-6">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-2">
            Research Integrity Verification
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Zero look-ahead bias</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Unconditional baseline prepared</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>SQL window functions engine</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-4 py-2.5 text-xs text-slate-400 hover:text-white rounded-lg transition"
          >
            Adjust Parameters
          </button>

          <button
            type="button"
            onClick={onProceed}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Run Historical Backtest (TEST)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
