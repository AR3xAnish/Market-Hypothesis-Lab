import React, { useState } from 'react';
import { ArrowRight, Sparkles, HelpCircle, Compass, ShieldCheck } from 'lucide-react';

export default function AskStage({
  question,
  setQuestion,
  sampleQuestions,
  onProceed,
  isLoading,
}) {
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!question.trim()) {
      setError('Please enter a question or select an example below.');
      return;
    }
    setError('');
    onProceed(question);
  };

  const handleSelectSample = (sample) => {
    setQuestion(sample.text);
    setError('');
    onProceed(sample.text);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* Intro Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Stage 1: The Research Question</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight sm:text-4xl">
          What market hypothesis would you like to test?
        </h1>
        <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          Most trading intuition starts as a vague question. Instead of answering blindly with opinions,
          we will rigorously clarify your assumptions, define an experiment card, and test it against historical data without look-ahead bias.
        </p>
      </div>

      {/* Main Input Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          <div>
            <label htmlFor="raw-question" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Raw Trading Question
            </label>
            <div className="relative">
              <textarea
                id="raw-question"
                rows={3}
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. Does buying NIFTY after a sharp fall work?"
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-base focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition shadow-inner font-sans"
              />
            </div>
            {error && <p className="text-xs text-rose-400 mt-1.5">{error}</p>}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>We will make every mathematical assumption explicit before running.</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-semibold text-sm transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              <span>{isLoading ? 'Clarifying...' : 'Clarify Assumptions'}</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </form>
      </div>

      {/* Suggested Prompts */}
      <div className="mt-8">
        <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          <Compass className="w-4 h-4 text-indigo-400" />
          <span>Or choose an inquiry to explore</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {sampleQuestions.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className="text-left p-4 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-800/60 transition group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-800/40">
                  {sample.category}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-white line-clamp-2">
                "{sample.text}"
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                {sample.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
