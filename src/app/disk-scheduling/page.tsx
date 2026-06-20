'use client';

import { useEffect, useRef } from 'react';
import { useDiskStore } from '@/stores/disk-store';
import { runDiskAlgorithm, DiskAlgorithm, DiskDirection } from '@/lib/algorithms/disk-scheduling';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HardDrive, Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { motion } from 'framer-motion';

const ALGORITHMS: { value: DiskAlgorithm; label: string; desc: string; needsDir?: boolean }[] = [
  { value: 'fcfs', label: 'FCFS', desc: 'First Come, First Served' },
  { value: 'sstf', label: 'SSTF', desc: 'Shortest Seek Time First' },
  { value: 'scan', label: 'SCAN', desc: 'Elevator Algorithm', needsDir: true },
  { value: 'cscan', label: 'C-SCAN', desc: 'Circular SCAN' },
  { value: 'look', label: 'LOOK', desc: 'LOOK (no edge travel)', needsDir: true },
  { value: 'clook', label: 'C-LOOK', desc: 'Circular LOOK' },
];

export default function DiskSchedulingPage() {
  const {
    requests, headPosition, direction, maxCylinder, algorithm, result,
    setRequests, setHeadPosition, setDirection, setAlgorithm, setResult,
    currentStep, setStep, isPlaying, setPlaying, speed, setSpeed,
  } = useDiskStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleRun = () => {
    if (requests.length === 0) return;
    const r = runDiskAlgorithm(algorithm, requests, headPosition, direction, maxCylinder);
    setResult(r);
    setStep(r.path.length - 1);
    setPlaying(false);
  };

  useEffect(() => {
    if (isPlaying && result) {
      intervalRef.current = setInterval(() => {
        const next = Math.min(currentStep + 1, result.path.length - 1);
        setStep(next);
        if (next >= result.path.length - 1) setPlaying(false);
      }, 700 / speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, currentStep, speed, result, setStep, setPlaying]);

  // Disk track SVG visualization
  const visiblePath = result ? result.path.slice(0, currentStep + 1) : [];
  const currentHead = visiblePath[visiblePath.length - 1] ?? headPosition;

  // Line chart data
  const lineData = visiblePath.map((pos, i) => ({ step: i, position: pos }));

  // Comparison
  const compData = result
    ? ALGORITHMS.map((a) => {
        const r = runDiskAlgorithm(a.value, requests, headPosition, direction, maxCylinder);
        return { name: a.label, 'Seek Distance': r.seekDistance };
      })
    : [];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up">
      <Header
        title="Disk Scheduling"
        badge="Chapter 12"
        subtitle="Visualize FCFS, SSTF, SCAN, C-SCAN, LOOK, and C-LOOK with animated disk head movement."
        icon={<HardDrive className="w-5 h-5 text-indigo-400" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass rounded-xl p-5 space-y-4">
            <div>
              <Label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">Request Queue</Label>
              <Input
                value={requests.join(' ')}
                onChange={(e) => {
                  const nums = e.target.value.split(/[\s,]+/).map(Number).filter((n) => !isNaN(n) && n >= 0 && n <= maxCylinder);
                  setRequests(nums);
                }}
                placeholder="e.g. 98 183 37 122 14"
                className="bg-white/5 border-white/10 text-white text-sm font-mono"
              />
            </div>
            <div>
              <Label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">
                Initial Head: <span className="text-indigo-300 font-mono">{headPosition}</span>
              </Label>
              <Slider value={[headPosition]} onValueChange={(vals) => setHeadPosition((vals as number[])[0])} min={0} max={maxCylinder} step={1} />
            </div>
            <div>
              <Label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">
                Max Cylinder: <span className="text-indigo-300 font-mono">{maxCylinder}</span>
              </Label>
              <Input
                type="number" min={50} max={999} value={maxCylinder}
                onChange={(e) => { /* not stored for simplicity */ }}
                className="h-8 w-28 text-sm bg-white/5 border-white/10 text-white"
                disabled
              />
            </div>
            {ALGORITHMS.find((a) => a.value === algorithm)?.needsDir && (
              <div>
                <Label className="text-xs text-white/40 mb-2 block uppercase tracking-wider">Direction</Label>
                <div className="flex gap-2">
                  {(['right', 'left'] as DiskDirection[]).map((d) => (
                    <button key={d} onClick={() => setDirection(d)}
                      className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${direction === d ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/25' : 'text-white/40 bg-white/5 border border-white/5'}`}>
                      {d === 'right' ? '→ Right' : '← Left'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="glass rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider">Algorithm</h3>
            <div className="space-y-2">
              {ALGORITHMS.map((a) => (
                <button key={a.value} onClick={() => setAlgorithm(a.value)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${algorithm === a.value ? 'bg-indigo-500/15 border border-indigo-500/25 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent'}`}>
                  <span className="font-semibold">{a.label}</span>
                  <span className="text-xs ml-2 opacity-60">{a.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleRun} disabled={requests.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-5 glow-indigo">
            <Play className="w-4 h-4 mr-2" />
            Run {ALGORITHMS.find((a) => a.value === algorithm)?.label}
          </Button>
        </div>

        {/* Right */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              {/* Playback */}
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="ghost" size="sm" onClick={() => setStep(0)} className="h-8 w-8 p-0 text-white/40 hover:text-white hover:bg-white/10"><SkipBack className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => setStep(Math.max(0, currentStep - 1))} className="h-8 px-3 text-white/60 hover:text-white hover:bg-white/10 text-xs">−1</Button>
                  <Button size="sm" onClick={() => { if (currentStep >= result.path.length - 1) setStep(0); setPlaying(!isPlaying); }}
                    className="h-8 px-4 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/20">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span className="ml-1.5 text-xs">{isPlaying ? 'Pause' : 'Play'}</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setStep(Math.min(result.path.length - 1, currentStep + 1))} className="h-8 px-3 text-white/60 hover:text-white hover:bg-white/10 text-xs">+1</Button>
                  <Button variant="ghost" size="sm" onClick={() => setStep(result.path.length - 1)} className="h-8 w-8 p-0 text-white/40 hover:text-white hover:bg-white/10"><SkipForward className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => { setResult(null); setStep(0); setPlaying(false); }} className="h-8 w-8 p-0 text-white/30 hover:text-red-400 hover:bg-red-400/10 ml-1"><RotateCcw className="w-3.5 h-3.5" /></Button>
                  <div className="flex-1 min-w-[100px] mx-2">
                    <Slider value={[currentStep]} onValueChange={(vals) => { setStep((vals as number[])[0]); setPlaying(false); }} max={result.path.length - 1} step={1} />
                  </div>
                  <span className="text-xs font-mono text-white/40">{currentStep}/{result.path.length - 1}</span>
                  <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="h-7 text-xs bg-white/5 border border-white/10 rounded text-white/60 px-1 cursor-pointer">
                    <option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option><option value={4}>4×</option>
                  </select>
                </div>
              </div>

              {/* Disk track visualization */}
              <div className="glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Disk Track</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-white/40">Head: </span>
                      <span className="text-sm font-bold text-indigo-300 font-mono">{currentHead}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-white/40">Seek: </span>
                      <span className="text-sm font-bold text-amber-300 font-mono">
                        {visiblePath.length > 1
                          ? visiblePath.slice(1).reduce((sum, p, i) => sum + Math.abs(p - visiblePath[i]), 0)
                          : 0}
                      </span>
                    </div>
                  </div>
                </div>
                {/* SVG disk track */}
                <div className="relative h-20 w-full rounded-lg bg-white/3 border border-white/5 overflow-hidden">
                  <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${maxCylinder} 80`} preserveAspectRatio="none">
                    {/* Path lines */}
                    {visiblePath.slice(1).map((pos, i) => (
                      <line key={i}
                        x1={visiblePath[i]} y1={40} x2={pos} y2={40}
                        stroke="#6366f1" strokeWidth="1.5" opacity={0.6}
                        strokeDasharray="4 2"
                      />
                    ))}
                    {/* Request marks */}
                    {requests.map((r, i) => (
                      <circle key={i} cx={r} cy={40} r="3" fill="#ffffff20" stroke="#ffffff30" strokeWidth="1" />
                    ))}
                    {/* Visited marks */}
                    {visiblePath.slice(1).map((pos, i) => (
                      <circle key={i} cx={pos} cy={40} r="4" fill="#6366f1" opacity={0.7} />
                    ))}
                  </svg>
                  {/* Animated head */}
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-12 rounded-full bg-indigo-400 shadow-lg shadow-indigo-500/50"
                    style={{ left: `${(currentHead / maxCylinder) * 100}%`, marginLeft: -6 }}
                    animate={{ left: `${(currentHead / maxCylinder) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                  />
                  {/* Cylinder labels */}
                  <div className="absolute bottom-1 left-1 text-[9px] text-white/20 font-mono">0</div>
                  <div className="absolute bottom-1 right-1 text-[9px] text-white/20 font-mono">{maxCylinder}</div>
                </div>

                {/* Sequence */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {visiblePath.map((pos, i) => (
                    <span key={i} className={`text-xs font-mono px-2 py-0.5 rounded ${i === 0 ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-white/60'}`}>
                      {i === 0 ? `★${pos}` : pos}
                    </span>
                  ))}
                </div>
              </div>

              {/* Head movement line chart */}
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">Head Movement</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={lineData}>
                    <XAxis dataKey="step" label={{ value: 'Step', position: 'insideBottom', fill: '#64748b', fontSize: 10 }} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, maxCylinder]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#e2e8f0' }} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <Line type="monotone" dataKey="position" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Comparison */}
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">Seek Distance Comparison</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={compData}>
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#e2e8f0' }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="Seek Distance" fill="#6366f1" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="glass rounded-xl flex flex-col items-center justify-center min-h-[400px] border border-dashed border-white/10">
              <HardDrive className="w-10 h-10 text-indigo-400/30 mb-3" />
              <p className="text-white/30 text-sm">Configure and click Run</p>
              <p className="text-white/15 text-xs mt-1">Disk head animation and seek analysis will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
