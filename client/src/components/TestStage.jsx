import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Cpu, Database, Activity } from 'lucide-react';

const EXECUTION_STEPS = [
  'Connecting to PostgreSQL database...',
  'Querying NIFTY historical prices and computing LAG(close, 1) return series...',
  'Filtering signal events where single-day return is below threshold...',
  'Calculating forward trade returns via LEAD(open, 1) and LEAD(close, H) windows (eliminating look-ahead bias)...',
  'Evaluating unconditional benchmark holding return over all sessions...',
  'Compiling statistical hit rates and writing experiment to database...',
];

export default function TestStage({ onComplete, error }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < EXECUTION_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400 mb-6 shadow-lg shadow-cyan-950/50">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>

        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 mb-2 inline-block">
          Stage 4: Execution Engine
        </span>
        <h2 className="text-2xl font-bold text-slate-100">
          Executing Quantitative Backtest
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Running SQL window functions over historical sessions without look-ahead bias.
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-2 my-8 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, ((currentStepIndex + 1) / EXECUTION_STEPS.length) * 100)}%` }}
          />
        </div>

        {/* Stepped execution console */}
        <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-4 text-left font-mono text-xs space-y-2 max-h-48 overflow-y-auto">
          {EXECUTION_STEPS.slice(0, currentStepIndex + 1).map((step, idx) => {
            const isLatest = idx === currentStepIndex;
            return (
              <div key={idx} className="flex items-start space-x-2">
                {isLatest ? (
                  <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                )}
                <span className={isLatest ? 'text-cyan-300 font-semibold' : 'text-slate-400'}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-950/50 border border-rose-800 rounded-lg text-xs text-rose-300">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
