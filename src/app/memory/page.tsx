'use client';

import { useEffect, useRef } from 'react';
import { useMemoryStore } from '@/stores/memory-store';
import { runPageAlgorithm, PageAlgorithm } from '@/lib/algorithms/page-replacement';
import Header from '@/components/layout/Header';
import PageFrameGrid from '@/components/memory/PageFrameGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Database, Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const ALGORITHMS: { value: PageAlgorithm; label: string; desc: string }[] = [
  { value: 'fifo', label: 'FIFO', desc: 'First In, First Out' },
  { value: 'lru', label: 'LRU', desc: 'Least Recently Used' },
  { value: 'optimal', label: 'Optimal', desc: 'Optimal (Belady\'s)' },
  { value: 'clock', label: 'Clock', desc: 'Second Chance (Clock)' },
];

export default function MemoryPage() {
  const {
    referenceString, frameCount, algorithm, result,
    setReferenceString, setFrameCount, setAlgorithm, setResult,
    currentStep, setStep, isPlaying, setPlaying, speed, setSpeed,
  } = useMemoryStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleRun = () => {
    const r = runPageAlgorithm(algorithm, referenceString, frameCount);
    setResult(r);
    setStep(r.steps.length);
    setPlaying(false);
  };

  useEffect(() => {
    if (isPlaying && result) {
      intervalRef.current = setInterval(() => {
        setStep(Math.min(currentStep + 1, result.steps.length));
        if (currentStep + 1 >= result.steps.length) setPlaying(false);
      }, 900 / speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, currentStep, speed, result, setStep, setPlaying]);

  const refStringRaw = referenceString.join(' ');

  // Comparison chart data
  const compData = result
    ? ALGORITHMS.map((a) => {
        const r = runPageAlgorithm(a.value, referenceString, frameCount);
        return { name: a.label, Faults: r.totalFaults, Hits: r.totalHits };
      })
    : [];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up">
      <Header
        title="Page Replacement"
        badge="Chapter 9–10"
        subtitle="Simulate FIFO, LRU, Optimal, and Clock algorithms. See page hits and faults frame-by-frame."
        icon={<Database className="w-5 h-5 text-indigo-400" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass rounded-xl p-5 space-y-4">
            <div>
              <Label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">Reference String</Label>
              <Input
                value={refStringRaw}
                onChange={(e) => {
                  const nums = e.target.value.split(/[\s,]+/).map(Number).filter((n) => !isNaN(n) && n >= 0);
                  setReferenceString(nums);
                }}
                placeholder="e.g. 7 0 1 2 0 3 0 4"
                className="bg-white/5 border-white/10 text-white text-sm font-mono"
              />
              <p className="text-[10px] text-white/25 mt-1">Space-separated page numbers</p>
            </div>
            <div>
              <Label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">
                Number of Frames: <span className="text-indigo-300 font-mono">{frameCount}</span>
              </Label>
              <Slider
                value={[frameCount]}
                onValueChange={(vals) => setFrameCount((vals as number[])[0])}
                min={1} max={8} step={1}
              />
            </div>
          </div>

          {/* Algorithm */}
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
          </div>

          <Button
            onClick={handleRun}
            disabled={referenceString.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-5 glow-indigo"
          >
            <Play className="w-4 h-4 mr-2" />
            Simulate {ALGORITHMS.find((a) => a.value === algorithm)?.label}
          </Button>
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              {/* Playback */}
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="ghost" size="sm" onClick={() => setStep(0)}
                    className="h-8 w-8 p-0 text-white/40 hover:text-white hover:bg-white/10">
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setStep(Math.max(0, currentStep - 1))}
                    className="h-8 px-3 text-white/60 hover:text-white hover:bg-white/10 text-xs">−1</Button>
                  <Button size="sm"
                    onClick={() => { if (currentStep >= result.steps.length) setStep(0); setPlaying(!isPlaying); }}
                    className="h-8 px-4 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/20">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span className="ml-1.5 text-xs">{isPlaying ? 'Pause' : 'Play'}</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setStep(Math.min(result.steps.length, currentStep + 1))}
                    className="h-8 px-3 text-white/60 hover:text-white hover:bg-white/10 text-xs">+1</Button>
                  <Button variant="ghost" size="sm" onClick={() => setStep(result.steps.length)}
                    className="h-8 w-8 p-0 text-white/40 hover:text-white hover:bg-white/10">
                    <SkipForward className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setResult(null); setStep(0); setPlaying(false); }}
                    className="h-8 w-8 p-0 text-white/30 hover:text-red-400 hover:bg-red-400/10 ml-1">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                  <div className="flex-1 min-w-[100px] mx-2">
                    <Slider value={[currentStep]} onValueChange={(vals) => { setStep((vals as number[])[0]); setPlaying(false); }}
                      max={result.steps.length} step={1} />
                  </div>
                  <span className="text-xs font-mono text-white/40">{currentStep}/{result.steps.length}</span>
                  <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                    className="h-7 text-xs bg-white/5 border border-white/10 rounded text-white/60 px-1 cursor-pointer">
                    <option value={0.5}>0.5×</option>
                    <option value={1}>1×</option>
                    <option value={2}>2×</option>
                    <option value={4}>4×</option>
                  </select>
                </div>
              </div>

              <PageFrameGrid result={result} frameCount={frameCount} referenceString={referenceString} />

              {/* Comparison chart */}
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">Algorithm Comparison</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={compData} barGap={2}>
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#e2e8f0' }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="Faults" fill="#ef4444" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Hits" fill="#10b981" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="glass rounded-xl flex flex-col items-center justify-center min-h-[400px] border border-dashed border-white/10">
              <Database className="w-10 h-10 text-indigo-400/30 mb-3" />
              <p className="text-white/30 text-sm">Configure and click Simulate</p>
              <p className="text-white/15 text-xs mt-1">Page frames and fault analysis will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
