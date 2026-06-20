'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import DiningPhilosophers from '@/components/sync/DiningPhilosophers';
import ProducerConsumer from '@/components/sync/ProducerConsumer';
import { GitMerge, Utensils, Package } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export default function SynchronizationPage() {
  const [speed, setSpeed] = useState(1);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in-up">
      <Header
        title="Process Synchronization"
        badge="Chapter 6–7"
        subtitle="Animate classic synchronization problems — Dining Philosophers and Producer-Consumer with semaphore visualization."
        icon={<GitMerge className="w-5 h-5 text-indigo-400" />}
      />

      {/* Speed control */}
      <div className="glass rounded-xl p-4 mb-6 flex items-center gap-4 max-w-sm">
        <Label className="text-xs text-white/40 whitespace-nowrap uppercase tracking-wider">
          Simulation Speed: <span className="text-indigo-300 font-mono">{speed}×</span>
        </Label>
        <Slider
          value={[speed]}
          onValueChange={(vals) => setSpeed((vals as number[])[0])}
          min={0.25} max={4} step={0.25}
          className="flex-1"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Utensils className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white/70">Dining Philosophers Problem</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">5 Philosophers</span>
          </div>
          <DiningPhilosophers speed={speed} />
          <div className="mt-3 glass rounded-xl p-4 text-xs text-white/40 space-y-1.5 leading-relaxed">
            <p><span className="text-indigo-300 font-semibold">Problem:</span> 5 philosophers share 5 forks. Each needs 2 forks to eat.</p>
            <p><span className="text-amber-300 font-semibold">Deadlock:</span> All grab left fork simultaneously → circular wait.</p>
            <p><span className="text-emerald-300 font-semibold">Solution:</span> Allow at most 4 philosophers to try eating simultaneously.</p>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white/70">Producer-Consumer Problem</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/15">Bounded Buffer</span>
          </div>
          <ProducerConsumer speed={speed} />
          <div className="mt-3 glass rounded-xl p-4 text-xs text-white/40 space-y-1.5 leading-relaxed">
            <p><span className="text-indigo-300 font-semibold">Problem:</span> Producer fills buffer, consumer empties it concurrently.</p>
            <p><span className="text-amber-300 font-semibold">Semaphores:</span> <code className="text-white/60">mutex</code>=1 (mutual exclusion), <code className="text-white/60">empty</code>=N, <code className="text-white/60">full</code>=0</p>
            <p><span className="text-emerald-300 font-semibold">Wait:</span> Producer waits when full; Consumer waits when empty.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
