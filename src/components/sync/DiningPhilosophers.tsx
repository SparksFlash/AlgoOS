'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

type PhilosopherState = 'thinking' | 'hungry' | 'eating';

const STATE_COLORS: Record<PhilosopherState, string> = {
  thinking: '#6366f1',
  hungry: '#f59e0b',
  eating: '#10b981',
};

const STATE_LABELS: Record<PhilosopherState, string> = {
  thinking: 'Thinking',
  hungry: 'Hungry',
  eating: 'Eating',
};

const N = 5;
const CYCLE_MS = 2000;

function canEat(states: PhilosopherState[], forks: boolean[], i: number): boolean {
  const left = i;
  const right = (i + 1) % N;
  return states[i] === 'hungry' && !forks[left] && !forks[right];
}

export default function DiningPhilosophers({ speed = 1 }: { speed?: number }) {
  const [states, setStates] = useState<PhilosopherState[]>(Array(N).fill('thinking'));
  const [forks, setForks] = useState<boolean[]>(Array(N).fill(false));
  const [running, setRunning] = useState(false);
  const [deadlockMode, setDeadlockMode] = useState(false);
  const [isDeadlocked, setIsDeadlocked] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tick = (prevStates: PhilosopherState[], prevForks: boolean[]) => {
    const newStates = [...prevStates];
    const newForks = [...prevForks];
    let changed = false;

    if (deadlockMode) {
      // Everyone grabs left fork → deadlock
      const allHungry = newStates.every((s) => s === 'hungry' || s === 'eating');
      if (!allHungry) {
        newStates.fill('hungry');
        for (let i = 0; i < N; i++) newForks[i] = true; // all left forks taken
        setIsDeadlocked(true);
      }
      setStates(newStates); setForks(newForks);
      return;
    }

    setIsDeadlocked(false);

    for (let i = 0; i < N; i++) {
      if (newStates[i] === 'eating') {
        // release forks after eating
        if (Math.random() < 0.5) {
          newForks[i] = false;
          newForks[(i + 1) % N] = false;
          newStates[i] = 'thinking';
          changed = true;
        }
      } else if (newStates[i] === 'thinking') {
        if (Math.random() < 0.4) {
          newStates[i] = 'hungry';
          changed = true;
        }
      } else if (newStates[i] === 'hungry') {
        if (canEat(newStates, newForks, i)) {
          newForks[i] = true;
          newForks[(i + 1) % N] = true;
          newStates[i] = 'eating';
          changed = true;
        }
      }
    }

    setStates(newStates);
    setForks(newForks);
  };

  useEffect(() => {
    if (!running) { if (timeoutRef.current) clearTimeout(timeoutRef.current); return; }
    const loop = () => {
      setStates((prev) => {
        setForks((prevF) => {
          tick(prev, prevF);
          return prevF;
        });
        return prev;
      });
      timeoutRef.current = setTimeout(loop, CYCLE_MS / speed);
    };
    timeoutRef.current = setTimeout(loop, CYCLE_MS / speed);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [running, speed, deadlockMode]);

  const radius = 110;
  const cx = 160, cy = 160;

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Dining Philosophers</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDeadlockMode((d) => !d)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all border ${deadlockMode ? 'bg-red-500/20 border-red-500/30 text-red-300' : 'bg-white/5 border-white/10 text-white/50'}`}
          >
            {deadlockMode ? '💀 Deadlock Mode' : 'Deadlock Mode'}
          </button>
          <button
            onClick={() => {
              setRunning((r) => !r);
              if (!running) { setStates(Array(N).fill('thinking')); setForks(Array(N).fill(false)); setIsDeadlocked(false); }
            }}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all border ${running ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'}`}
          >
            {running ? '⏸ Pause' : '▶ Start'}
          </button>
        </div>
      </div>

      {isDeadlocked && (
        <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 text-center">
          💀 DEADLOCK — All philosophers holding left fork, waiting for right fork
        </div>
      )}

      <div className="flex justify-center">
        <svg width="320" height="320" viewBox="0 0 320 320">
          {/* Table */}
          <circle cx={cx} cy={cy} r={60} fill="rgba(99,102,241,0.05)" stroke="rgba(99,102,241,0.15)" strokeWidth={1.5} />
          <text x={cx} y={cy + 5} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize={10}>Dining Table</text>

          {/* Forks */}
          {Array.from({ length: N }).map((_, i) => {
            const angle = ((i + 0.5) / N) * 2 * Math.PI - Math.PI / 2;
            const fr = radius - 30;
            const fx = cx + fr * Math.cos(angle);
            const fy = cy + fr * Math.sin(angle);
            return (
              <g key={`fork-${i}`}>
                <motion.circle
                  cx={fx} cy={fy} r={8}
                  fill={forks[i] ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.05)'}
                  stroke={forks[i] ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.15)'}
                  strokeWidth={1.5}
                  animate={{ scale: forks[i] ? 1.2 : 1 }}
                  transition={{ duration: 0.2 }}
                />
                <text x={fx} y={fy + 4} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={8} fontFamily="monospace">
                  F{i}
                </text>
              </g>
            );
          })}

          {/* Philosophers */}
          {Array.from({ length: N }).map((_, i) => {
            const angle = (i / N) * 2 * Math.PI - Math.PI / 2;
            const px = cx + radius * Math.cos(angle);
            const py = cy + radius * Math.sin(angle);
            const color = STATE_COLORS[states[i]];
            return (
              <g key={`phil-${i}`}>
                <motion.circle
                  cx={px} cy={py} r={24}
                  fill={`${color}20`}
                  stroke={color}
                  strokeWidth={2}
                  animate={{ scale: states[i] === 'eating' ? 1.1 : 1 }}
                  transition={{ duration: 0.3 }}
                />
                <text x={px} y={py - 3} textAnchor="middle" fill="white" fontSize={11} fontWeight="bold">P{i}</text>
                <text x={px} y={py + 10} textAnchor="middle" fill={color} fontSize={7}>{STATE_LABELS[states[i]]}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2">
        {(Object.entries(STATE_COLORS) as [PhilosopherState, string][]).map(([state, color]) => (
          <div key={state} className="flex items-center gap-1.5 text-xs text-white/50">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            {STATE_LABELS[state]}: {states.filter((s) => s === state).length}
          </div>
        ))}
      </div>
    </div>
  );
}
