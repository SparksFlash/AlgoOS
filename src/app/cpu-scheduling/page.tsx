'use client';

import { useCPUStore, CPUAlgorithm } from '@/stores/cpu-store';
import { fcfs, sjf, srtf, roundRobin, priorityScheduling, mlfq } from '@/lib/algorithms/cpu-scheduling';
import Header from '@/components/layout/Header';
import ProcessInputTable from '@/components/cpu/ProcessInputTable';
import GanttChart from '@/components/cpu/GanttChart';
import MetricsTable from '@/components/cpu/MetricsTable';
import PlaybackControls from '@/components/cpu/PlaybackControls';
import { Button } from '@/components/ui/button';
import { Cpu, Play } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const ALGORITHMS: { value: CPUAlgorithm; label: string; desc: string }[] = [
  { value: 'fcfs', label: 'FCFS', desc: 'First Come First Served' },
  { value: 'sjf', label: 'SJF', desc: 'Shortest Job First (Non-preemptive)' },
  { value: 'srtf', label: 'SRTF', desc: 'Shortest Remaining Time First' },
  { value: 'rr', label: 'Round Robin', desc: 'Time-slice based' },
  { value: 'priority', label: 'Priority', desc: 'Non-preemptive Priority' },
  { value: 'priority-preemptive', label: 'Priority (P)', desc: 'Preemptive Priority' },
  { value: 'mlfq', label: 'MLFQ', desc: 'Multi-Level Feedback Queue' },
];

function runAlgorithm(algorithm: CPUAlgorithm, processes: Parameters<typeof fcfs>[0], quantum: number) {
  switch (algorithm) {
    case 'fcfs': return fcfs(processes);
    case 'sjf': return sjf(processes);
    case 'srtf': return srtf(processes);
    case 'rr': return roundRobin(processes, quantum);
    case 'priority': return priorityScheduling(processes, false);
    case 'priority-preemptive': return priorityScheduling(processes, true);
    case 'mlfq': return mlfq(processes);
  }
}

export default function CPUSchedulingPage() {
  const { processes, algorithm, quantum, result, setAlgorithm, setQuantum, setResult, setStep, setPlaying } = useCPUStore();

  const handleRun = () => {
    if (processes.length === 0) return;
    const r = runAlgorithm(algorithm, processes, quantum);
    setResult(r);
    setStep(r.gantt.length);
    setPlaying(false);
  };

  const totalTime = result ? Math.max(...result.gantt.map((b) => b.end)) : 1;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up">
      <Header
        title="CPU Scheduling"
        badge="Chapter 5"
        subtitle="Visualize FCFS, SJF, SRTF, Round Robin, Priority, and MLFQ algorithms with animated Gantt charts and metrics."
        icon={<Cpu className="w-5 h-5 text-indigo-400" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel */}
        <div className="lg:col-span-1 space-y-4">
          <ProcessInputTable />

          {/* Algorithm selector */}
          <div className="glass rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider">Algorithm</h3>
            <div className="space-y-2">
              {ALGORITHMS.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setAlgorithm(a.value)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                    algorithm === a.value
                      ? 'bg-indigo-500/15 border border-indigo-500/25 text-white'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className="font-semibold">{a.label}</span>
                  <span className="text-xs ml-2 opacity-60">{a.desc}</span>
                </button>
              ))}
            </div>

            {algorithm === 'rr' && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <Label className="text-xs text-white/40 mb-2 block">Time Quantum</Label>
                <Input
                  type="number" min={1} max={20} value={quantum}
                  onChange={(e) => setQuantum(parseInt(e.target.value) || 1)}
                  className="h-8 w-24 text-sm bg-white/5 border-white/10 text-white"
                />
              </div>
            )}
          </div>

          <Button
            onClick={handleRun}
            disabled={processes.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-5 glow-indigo"
          >
            <Play className="w-4 h-4 mr-2" />
            Run {ALGORITHMS.find((a) => a.value === algorithm)?.label}
          </Button>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              <PlaybackControls totalSteps={result.gantt.length} />
              <GanttChart gantt={result.gantt} totalTime={totalTime} />
              <MetricsTable result={result} />
            </>
          ) : (
            <div className="glass rounded-xl flex flex-col items-center justify-center min-h-[400px] border border-dashed border-white/10">
              <Cpu className="w-10 h-10 text-indigo-400/30 mb-3" />
              <p className="text-white/30 text-sm">Configure processes and click Run</p>
              <p className="text-white/15 text-xs mt-1">The Gantt chart and metrics will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
