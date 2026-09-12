import React from 'react';
import { Activity, Database, History, FlaskConical, ShieldAlert } from 'lucide-react';

export default function Header({ onOpenHistory, totalDays, dateRange }) {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-950/50">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-100 tracking-tight text-lg">Market Hypothesis Lab</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-400 border border-cyan-800/60">
                Research Prototype
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal">
              Disciplined quantitative validation • No look-ahead bias
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Dataset Status Badge */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>NIFTY 50</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{dateRange || '2005 - 2025'}</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-semibold">{totalDays ? `${totalDays} sessions` : '5,240 sessions'}</span>
          </div>

          {/* Past Experiments button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-700/80 transition shadow-sm"
            title="View Past Experiments"
          >
            <History className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Past Experiments</span>
          </button>
        </div>
      </div>
    </header>
  );
}
