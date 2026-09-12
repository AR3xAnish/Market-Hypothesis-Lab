import React, { useEffect, useState } from 'react';
import { X, History, ArrowRight, Loader2, Database, Calendar } from 'lucide-react';
import { fetchExperiments, fetchExperimentById } from '../services/api';

export default function PastExperimentsModal({ isOpen, onClose, onSelectExperiment }) {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadExperiments();
    }
  }, [isOpen]);

  async function loadExperiments() {
    try {
      setLoading(true);
      setError('');
      const data = await fetchExperiments();
      setExperiments(data.experiments || []);
    } catch (err) {
      setError('Failed to load past experiments');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">
              Past Experiment Logs (Persisted in PostgreSQL)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-3">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              <span className="text-xs font-mono">Fetching experiments from database...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-xl text-xs text-rose-300">
              {error}
            </div>
          ) : experiments.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-mono">
              No previous experiments recorded yet. Run your first experiment!
            </div>
          ) : (
            experiments.map((exp) => {
              const avgRet = parseFloat(exp.avg_forward_return || 0);
              const baseRet = parseFloat(exp.baseline_avg_return || 0);
              const excess = avgRet - baseRet;

              return (
                <div
                  key={exp.id}
                  className="bg-slate-950/80 border border-slate-800 hover:border-indigo-700/60 rounded-xl p-4 transition group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800 font-semibold">
                        EXP #{exp.id}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(exp.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white">
                      "{exp.question}"
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
                      <span className="text-rose-400">
                        Drop: {exp.fall_threshold_pct}%
                      </span>
                      <span>•</span>
                      <span className="text-cyan-400">
                        Hold: {exp.holding_period_days}d
                      </span>
                      <span>•</span>
                      <span>
                        Signals: <strong className="text-slate-200">{exp.num_signals}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Hit Rate: <strong className="text-emerald-400">{parseFloat(exp.hit_rate || 0).toFixed(1)}%</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0 sm:border-l sm:border-slate-800/80 sm:pl-4">
                    <div className="text-right font-mono text-xs">
                      <span className="text-[10px] text-slate-500 uppercase block">Forward Return</span>
                      <span
                        className={`text-sm font-bold ${
                          avgRet >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {avgRet >= 0 ? '+' : ''}{avgRet.toFixed(2)}%
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Base: {baseRet >= 0 ? '+' : ''}{baseRet.toFixed(2)}%
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectExperiment(exp.id)}
                      className="px-3 py-2 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-medium flex items-center space-x-1.5 transition"
                    >
                      <span>Review</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
