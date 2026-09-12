import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StageStepper from './components/StageStepper';
import AskStage from './components/AskStage';
import ClarifyStage from './components/ClarifyStage';
import DefineStage from './components/DefineStage';
import TestStage from './components/TestStage';
import LearnStage from './components/LearnStage';
import PastExperimentsModal from './components/PastExperimentsModal';
import { fetchDefaults, clarifyQuestion, runExperiment, fetchExperimentById } from './services/api';

const STAGE_ORDER = ['ASK', 'CLARIFY', 'DEFINE', 'TEST', 'LEARN'];

export default function App() {
  const [currentStage, setCurrentStage] = useState('ASK');
  const [maxReachedStage, setMaxReachedStage] = useState(1);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Core state
  const [question, setQuestion] = useState('Does buying NIFTY after a sharp fall work?');
  const [params, setParams] = useState({
    fall_threshold_pct: -2.0,
    holding_period_days: 5,
    test_start: '2005-01-03',
    test_end: '2025-01-31',
    include_costs: false,
    entry_timing: "Next trading day's Open",
  });
  const [rationales, setRationales] = useState({});
  const [hypothesis, setHypothesis] = useState('');
  const [datasetBounds, setDatasetBounds] = useState(null);
  const [sampleQuestions, setSampleQuestions] = useState([]);

  // Execution & results state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState('');
  const [experiment, setExperiment] = useState(null);
  const [results, setResults] = useState(null);
  const [trades, setTrades] = useState([]);
  const [conclusion, setConclusion] = useState({});

  // Fetch initial defaults
  useEffect(() => {
    async function init() {
      try {
        const data = await fetchDefaults();
        if (data.defaults) {
          setDatasetBounds(data.defaults.dataset_bounds);
          setParams((prev) => ({
            ...prev,
            test_start: data.defaults.test_start,
            test_end: data.defaults.test_end,
          }));
        }
        if (data.sample_questions) {
          setSampleQuestions(data.sample_questions);
        }
      } catch (err) {
        console.error('Failed to initialize app defaults:', err);
      }
    }
    init();
  }, []);

  // Update hypothesis when params change
  useEffect(() => {
    const absThreshold = Math.abs(params.fall_threshold_pct);
    const days = params.holding_period_days;
    setHypothesis(
      `NIFTY exhibits short-term mean reversion after a sharp one-day decline — average forward ${days}-day return following a ≥${absThreshold}% drop is higher than the average unconditional ${days}-day return.`
    );
  }, [params.fall_threshold_pct, params.holding_period_days]);

  // Stage transition helpers
  const advanceToStage = (stageName) => {
    const stageIdx = STAGE_ORDER.indexOf(stageName) + 1;
    setMaxReachedStage((prev) => Math.max(prev, stageIdx));
    setCurrentStage(stageName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. ASK -> CLARIFY
  const handleAskSubmit = async (submittedQuestion) => {
    try {
      setIsExecuting(true);
      const data = await clarifyQuestion(submittedQuestion);
      if (data.parameters) {
        setParams((prev) => ({
          ...prev,
          ...data.parameters,
        }));
      }
      if (data.rationales) {
        setRationales(data.rationales);
      }
      if (data.hypothesis) {
        setHypothesis(data.hypothesis);
      }
      advanceToStage('CLARIFY');
    } catch (err) {
      console.error('Clarify failed, using defaults:', err);
      advanceToStage('CLARIFY');
    } finally {
      setIsExecuting(false);
    }
  };

  // 2. CLARIFY -> DEFINE
  const handleClarifyConfirm = () => {
    advanceToStage('DEFINE');
  };

  // 3. DEFINE -> TEST -> LEARN
  const handleExecuteBacktest = async () => {
    advanceToStage('TEST');
    setIsExecuting(true);
    setExecutionError('');

    try {
      const payload = {
        question,
        fall_threshold_pct: params.fall_threshold_pct,
        holding_period_days: params.holding_period_days,
        test_start: params.test_start,
        test_end: params.test_end,
        include_costs: params.include_costs,
      };

      // Ensure minimum 2 seconds in TEST stage so user sees the progress steps clearly
      const [data] = await Promise.all([
        runExperiment(payload),
        new Promise((resolve) => setTimeout(resolve, 2200)),
      ]);

      setExperiment(data.experiment);
      setResults(data.results);
      setTrades(data.trades || []);
      setConclusion(data.conclusion || {});

      advanceToStage('LEARN');
    } catch (err) {
      console.error('Backtest failed:', err);
      setExecutionError(err.message || 'Execution failed. Please try again.');
    } finally {
      setIsExecuting(false);
    }
  };

  // 4. LEARN -> Suggested Next Investigation
  const handleInvestigateNext = (item) => {
    setQuestion(item.title);
    if (item.suggested_params) {
      setParams((prev) => ({
        ...prev,
        ...item.suggested_params,
      }));
    }
    advanceToStage('CLARIFY');
  };

  // Load past experiment from history
  const handleSelectPastExperiment = async (id) => {
    try {
      const data = await fetchExperimentById(id);
      if (data.experiment) {
        setExperiment(data.experiment);
        setQuestion(data.experiment.question);
        setParams({
          fall_threshold_pct: parseFloat(data.experiment.fall_threshold_pct),
          holding_period_days: parseInt(data.experiment.holding_period_days, 10),
          test_start: data.experiment.test_start,
          test_end: data.experiment.test_end,
          include_costs: data.experiment.include_costs,
        });
        setResults({
          num_signals: data.experiment.num_signals,
          avg_forward_return: data.experiment.avg_forward_return,
          baseline_avg_return: data.experiment.baseline_avg_return,
          hit_rate: data.experiment.hit_rate,
        });
        setConclusion(data.conclusion || {});
        setIsHistoryOpen(false);
        advanceToStage('LEARN');
      }
    } catch (err) {
      console.error('Failed to load past experiment:', err);
    }
  };

  const handleRestart = () => {
    setQuestion('Does buying NIFTY after a sharp fall work?');
    advanceToStage('ASK');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        totalDays={datasetBounds?.total_days}
        dateRange={
          datasetBounds
            ? `${datasetBounds.min_date?.slice(0, 4)} - ${datasetBounds.max_date?.slice(0, 4)}`
            : '2005 - 2025'
        }
      />

      {/* Stage Stepper Header */}
      <StageStepper
        currentStage={currentStage}
        maxReachedStage={maxReachedStage}
        onStageClick={(stage) => {
          if (!isExecuting) advanceToStage(stage);
        }}
      />

      {/* Stage Main Body */}
      <main className="flex-1">
        {currentStage === 'ASK' && (
          <AskStage
            question={question}
            setQuestion={setQuestion}
            sampleQuestions={sampleQuestions}
            onProceed={handleAskSubmit}
            isLoading={isExecuting}
          />
        )}

        {currentStage === 'CLARIFY' && (
          <ClarifyStage
            question={question}
            params={params}
            setParams={setParams}
            rationales={rationales}
            datasetBounds={datasetBounds}
            onProceed={handleClarifyConfirm}
            onBack={() => advanceToStage('ASK')}
          />
        )}

        {currentStage === 'DEFINE' && (
          <DefineStage
            question={question}
            params={params}
            hypothesis={hypothesis}
            onProceed={handleExecuteBacktest}
            onBack={() => advanceToStage('CLARIFY')}
          />
        )}

        {currentStage === 'TEST' && (
          <TestStage error={executionError} />
        )}

        {currentStage === 'LEARN' && experiment && results && (
          <LearnStage
            experiment={experiment}
            results={results}
            trades={trades}
            conclusion={conclusion}
            onInvestigateNext={handleInvestigateNext}
            onRestart={handleRestart}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Market Hypothesis Lab • Quantitative Research Framework</span>
          <span className="text-slate-600">
            PostgreSQL Window Functions (No Look-Ahead) • Node.js + React
          </span>
        </div>
      </footer>

      {/* Past Experiments History Modal */}
      <PastExperimentsModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectExperiment={handleSelectPastExperiment}
      />
    </div>
  );
}
