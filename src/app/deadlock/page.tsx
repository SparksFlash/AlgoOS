'use client';

import { useState } from 'react';
import { bankersAlgorithm, computeNeed, BankersInput } from '@/lib/algorithms/deadlock';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_INPUT: BankersInput = {
  processes: ['P0', 'P1', 'P2', 'P3', 'P4'],
  resources: ['A', 'B', 'C'],
  allocation: [
    [0, 1, 0],
    [2, 0, 0],
    [3, 0, 2],
    [2, 1, 1],
    [0, 0, 2],
  ],
  max: [
    [7, 5, 3],
    [3, 2, 2],
    [9, 0, 2],
    [2, 2, 2],
    [4, 3, 3],
  ],
  available: [3, 3, 2],
};

function MatrixInput({
  label,
  matrix,
  rows,
  cols,
  onChange,
  rowLabels,
  colLabels,
}: {
  label: string;
  matrix: number[][];
  rows: number;
  cols: number;
  onChange: (r: number, c: number, v: number) => void;
  rowLabels: string[];
  colLabels: string[];
}) {
  return (
    <div>
      <p className="text-xs text-white/40 uppercase tracking-wider mb-2">{label}</p>
      <div className="overflow-x-auto">
        <table className="text-xs">
          <thead>
            <tr>
              <th className="w-8" />
              {colLabels.map((c) => (
                <th key={c} className="px-2 pb-1 text-white/30 font-mono">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r}>
                <td className="pr-2 text-white/30 font-mono text-xs">{rowLabels[r]}</td>
                {Array.from({ length: cols }).map((_, c) => (
                  <td key={c} className="px-1 py-0.5">
                    <Input
                      type="number" min={0} max={99}
                      value={matrix[r]?.[c] ?? 0}
                      onChange={(e) => onChange(r, c, parseInt(e.target.value) || 0)}
                      className="h-7 w-12 text-center text-xs bg-white/5 border-white/10 text-white font-mono p-1"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DeadlockPage() {
  const [input, setInput] = useState<BankersInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<ReturnType<typeof bankersAlgorithm> | null>(null);
  const [stepIdx, setStepIdx] = useState(0);

  const updateMatrix = (which: 'allocation' | 'max', r: number, c: number, v: number) => {
    setInput((prev) => {
      const m = prev[which].map((row) => [...row]);
      if (!m[r]) m[r] = Array(prev.resources.length).fill(0);
      m[r][c] = v;
      return { ...prev, [which]: m };
    });
    setResult(null);
  };

  const updateAvailable = (i: number, v: number) => {
    setInput((prev) => {
      const a = [...prev.available];
      a[i] = v;
      return { ...prev, available: a };
    });
    setResult(null);
  };

  const addProcess = () => {
    const n = input.processes.length;
    setInput((prev) => ({
      ...prev,
      processes: [...prev.processes, `P${n}`],
      allocation: [...prev.allocation, Array(prev.resources.length).fill(0)],
      max: [...prev.max, Array(prev.resources.length).fill(0)],
    }));
    setResult(null);
  };

  const removeProcess = () => {
    if (input.processes.length <= 1) return;
    setInput((prev) => ({
      ...prev,
      processes: prev.processes.slice(0, -1),
      allocation: prev.allocation.slice(0, -1),
      max: prev.max.slice(0, -1),
    }));
    setResult(null);
  };

  const handleRun = () => {
    const r = bankersAlgorithm(input);
    setResult(r);
    setStepIdx(r.steps.length - 1);
  };

  const need = computeNeed(input.allocation, input.max);
  const currentStep = result?.steps[stepIdx];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up">
      <Header
        title="Deadlock & Banker's Algorithm"
        badge="Chapter 8"
        subtitle="Input resource allocation matrices and run the Banker's safety algorithm step by step."
        icon={<AlertTriangle className="w-5 h-5 text-indigo-400" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Input */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-xl p-5 space-y-5">
            {/* Process count */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40 uppercase tracking-wider">Processes ({input.processes.length})</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={removeProcess} disabled={input.processes.length <= 1}
                  className="h-7 w-7 p-0 text-white/30 hover:text-red-400 hover:bg-red-400/10">
                  <Minus className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={addProcess} disabled={input.processes.length >= 8}
                  className="h-7 w-7 p-0 text-white/30 hover:text-emerald-400 hover:bg-emerald-400/10">
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <MatrixInput
              label="Allocation Matrix"
              matrix={input.allocation}
              rows={input.processes.length}
              cols={input.resources.length}
              onChange={(r, c, v) => updateMatrix('allocation', r, c, v)}
              rowLabels={input.processes}
              colLabels={input.resources}
            />

            <MatrixInput
              label="Max Matrix"
              matrix={input.max}
              rows={input.processes.length}
              cols={input.resources.length}
              onChange={(r, c, v) => updateMatrix('max', r, c, v)}
              rowLabels={input.processes}
              colLabels={input.resources}
            />

            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Available Resources</p>
              <div className="flex gap-2">
                {input.resources.map((res, i) => (
                  <div key={i} className="text-center">
                    <span className="text-[10px] text-white/30 block mb-1 font-mono">{res}</span>
                    <Input
                      type="number" min={0}
                      value={input.available[i] ?? 0}
                      onChange={(e) => updateAvailable(i, parseInt(e.target.value) || 0)}
                      className="h-8 w-14 text-center text-sm bg-white/5 border-white/10 text-white font-mono p-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Need matrix (computed) */}
          <div className="glass rounded-xl p-5">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Need Matrix (computed)</p>
            <div className="overflow-x-auto">
              <table className="text-xs">
                <thead>
                  <tr>
                    <th className="w-8" />
                    {input.resources.map((r) => <th key={r} className="px-3 pb-1 text-white/30 font-mono">{r}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {input.processes.map((pid, r) => (
                    <tr key={r}>
                      <td className="pr-2 text-white/30 font-mono text-xs">{pid}</td>
                      {input.resources.map((_, c) => (
                        <td key={c} className="px-3 py-1 text-center">
                          <span className={`font-mono text-xs px-2 py-0.5 rounded ${(need[r]?.[c] ?? 0) < 0 ? 'text-red-400 bg-red-400/10' : 'text-white/60 bg-white/5'}`}>
                            {need[r]?.[c] ?? 0}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Button onClick={handleRun}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-5 glow-indigo">
            Run Safety Algorithm
          </Button>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-3 space-y-4">
          {result ? (
            <>
              {/* Result banner */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-5 border ${result.isSafe ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}
              >
                <div className="flex items-center gap-3">
                  {result.isSafe
                    ? <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                    : <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
                  }
                  <div>
                    <p className={`font-bold ${result.isSafe ? 'text-emerald-300' : 'text-red-300'}`}>
                      {result.isSafe ? 'System is in SAFE State' : 'DEADLOCK Detected — Unsafe State'}
                    </p>
                    {result.isSafe && (
                      <p className="text-sm text-white/50 mt-0.5">
                        Safe sequence: <span className="font-mono text-emerald-300">{result.safeSequence.join(' → ')}</span>
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Step-by-step */}
              <div className="glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                    Safety Algorithm Steps
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setStepIdx(Math.max(0, stepIdx - 1))}
                      disabled={stepIdx === 0} className="h-7 w-7 p-0 text-white/40 hover:text-white hover:bg-white/10">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs font-mono text-white/40">{stepIdx + 1}/{result.steps.length}</span>
                    <Button variant="ghost" size="sm" onClick={() => setStepIdx(Math.min(result.steps.length - 1, stepIdx + 1))}
                      disabled={stepIdx === result.steps.length - 1} className="h-7 w-7 p-0 text-white/40 hover:text-white hover:bg-white/10">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {currentStep && (
                    <motion.div key={stepIdx} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                      {/* Description */}
                      <div className={`rounded-lg p-3 mb-4 text-sm ${currentStep.chosen ? 'bg-emerald-500/10 border border-emerald-500/15' : stepIdx === 0 ? 'bg-indigo-500/10 border border-indigo-500/15' : 'bg-red-500/10 border border-red-500/15'}`}>
                        <p className={`text-sm ${currentStep.chosen ? 'text-emerald-300' : stepIdx === 0 ? 'text-indigo-300' : 'text-red-300'}`}>
                          {currentStep.description}
                        </p>
                      </div>

                      {/* Work vector */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs text-white/40 w-14 shrink-0">Work</span>
                        <div className="flex gap-2">
                          {currentStep.work.map((v, i) => (
                            <span key={i} className="text-xs font-mono px-2 py-1 rounded bg-indigo-500/10 text-indigo-300">
                              {input.resources[i]}={v}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Finish vector */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs text-white/40 w-14 shrink-0">Finish</span>
                        <div className="flex gap-2">
                          {currentStep.finish.map((v, i) => (
                            <span key={i} className={`text-xs font-mono px-2 py-1 rounded ${v ? 'bg-emerald-500/10 text-emerald-300' : 'bg-white/5 text-white/40'}`}>
                              {input.processes[i]}:{v ? '✓' : '✗'}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Safe sequence so far */}
                      {currentStep.safeSequence.length > 0 && (
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-white/40 w-14 shrink-0">Seq</span>
                          <div className="flex gap-2 flex-wrap">
                            {currentStep.safeSequence.map((p, i) => (
                              <span key={i} className="text-xs font-mono px-2 py-1 rounded bg-amber-500/10 text-amber-300">
                                {i + 1}. {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* All steps overview */}
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider">Steps Overview</h3>
                <div className="space-y-1.5">
                  {result.steps.map((step, i) => (
                    <button key={i} onClick={() => setStepIdx(i)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${i === stepIdx ? 'bg-indigo-500/15 border border-indigo-500/20 text-white' : 'text-white/40 hover:text-white/60 hover:bg-white/3'}`}>
                      <span className="font-mono text-white/30 mr-2">{(i + 1).toString().padStart(2, '0')}</span>
                      {step.chosen ? (
                        <span className="text-emerald-400">✓ {step.chosen} selected</span>
                      ) : i === 0 ? (
                        <span className="text-indigo-400">Initial state</span>
                      ) : (
                        <span className="text-red-400">✗ Deadlock</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="glass rounded-xl flex flex-col items-center justify-center min-h-[400px] border border-dashed border-white/10">
              <AlertTriangle className="w-10 h-10 text-indigo-400/30 mb-3" />
              <p className="text-white/30 text-sm">Configure matrices and run the safety algorithm</p>
              <p className="text-white/15 text-xs mt-1">Results and step-by-step execution will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
