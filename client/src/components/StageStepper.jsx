import React from 'react';
import { HelpCircle, Sliders, FileText, Play, BookOpen, Check } from 'lucide-react';

const STAGES = [
  { id: 1, key: 'ASK', label: '1. Ask', icon: HelpCircle, description: 'Raw Question' },
  { id: 2, key: 'CLARIFY', label: '2. Clarify', icon: Sliders, description: 'Explicit Assumptions' },
  { id: 3, key: 'DEFINE', label: '3. Define', icon: FileText, description: 'Experiment Card' },
  { id: 4, key: 'TEST', label: '4. Test', icon: Play, description: 'Window Backtest' },
  { id: 5, key: 'LEARN', label: '5. Learn', icon: BookOpen, description: 'Facts & Conclusions' },
];

export default function StageStepper({ currentStage, onStageClick, maxReachedStage }) {
  return (
    <div className="w-full bg-slate-900/60 border-y border-slate-800/80 py-4 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {STAGES.map((stage, idx) => {
              const isCurrent = currentStage === stage.key;
              const isCompleted = stage.id < STAGES.find(s => s.key === currentStage)?.id;
              const isClickable = stage.id <= maxReachedStage;
              const Icon = stage.icon;

              return (
                <li key={stage.key} className="relative flex-1">
                  {idx > 0 && (
                    <div
                      className={`absolute top-4 -left-1/2 w-full h-0.5 -z-0 transition-colors duration-300 ${
                        isCompleted ? 'bg-cyan-600' : 'bg-slate-800'
                      }`}
                      aria-hidden="true"
                    />
                  )}

                  <div className="flex flex-col items-center group">
                    <button
                      type="button"
                      disabled={!isClickable}
                      onClick={() => isClickable && onStageClick(stage.key)}
                      className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                        isCurrent
                          ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-500/25 shadow-md shadow-cyan-500/30'
                          : isCompleted
                          ? 'bg-cyan-950 text-cyan-400 border border-cyan-700/60 hover:bg-cyan-900'
                          : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </button>
                    <div className="mt-2 text-center">
                      <span
                        className={`text-xs font-semibold tracking-wider uppercase block ${
                          isCurrent
                            ? 'text-cyan-400'
                            : isCompleted
                            ? 'text-slate-300'
                            : 'text-slate-600'
                        }`}
                      >
                        {stage.label}
                      </span>
                      <span className="hidden sm:block text-[11px] text-slate-500">
                        {stage.description}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
