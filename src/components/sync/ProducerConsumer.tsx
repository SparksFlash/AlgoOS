'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BUFFER_SIZE = 6;

interface BufferItem {
  id: number;
  value: number;
}

let globalId = 0;

export default function ProducerConsumer({ speed = 1 }: { speed?: number }) {
  const [buffer, setBuffer] = useState<(BufferItem | null)[]>(Array(BUFFER_SIZE).fill(null));
  const [mutex, setMutex] = useState(1);
  const [empty, setEmpty] = useState(BUFFER_SIZE);
  const [full, setFull] = useState(0);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<{ text: string; type: 'produce' | 'consume' | 'wait' }[]>([]);
  const [producerWaiting, setProducerWaiting] = useState(false);
  const [consumerWaiting, setConsumerWaiting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addLog = (text: string, type: 'produce' | 'consume' | 'wait') => {
    setLog((prev) => [{ text, type }, ...prev].slice(0, 12));
  };

  useEffect(() => {
    if (!running) { if (intervalRef.current) clearInterval(intervalRef.current); return; }

    intervalRef.current = setInterval(() => {
      const action = Math.random() < 0.55 ? 'produce' : 'consume';

      if (action === 'produce') {
        setEmpty((e) => {
          if (e === 0) {
            setProducerWaiting(true);
            addLog('Producer: Buffer FULL — waiting on empty semaphore', 'wait');
            return e;
          }
          setProducerWaiting(false);
          setMutex(0);
          setBuffer((prev) => {
            const newBuf = [...prev];
            const slot = newBuf.findIndex((s) => s === null);
            if (slot === -1) return prev;
            const item = { id: ++globalId, value: Math.floor(Math.random() * 100) };
            newBuf[slot] = item;
            addLog(`Producer: produced item ${item.value} → slot [${slot}]`, 'produce');
            return newBuf;
          });
          setFull((f) => f + 1);
          setMutex(1);
          return e - 1;
        });
      } else {
        setFull((f) => {
          if (f === 0) {
            setConsumerWaiting(true);
            addLog('Consumer: Buffer EMPTY — waiting on full semaphore', 'wait');
            return f;
          }
          setConsumerWaiting(false);
          setMutex(0);
          setBuffer((prev) => {
            const newBuf = [...prev];
            const slot = newBuf.findLastIndex((s) => s !== null);
            if (slot === -1) return prev;
            const item = newBuf[slot]!;
            newBuf[slot] = null;
            addLog(`Consumer: consumed item ${item.value} from slot [${slot}]`, 'consume');
            return newBuf;
          });
          setEmpty((e) => e + 1);
          setMutex(1);
          return f - 1;
        });
      }
    }, 1000 / speed);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, speed]);

  const reset = () => {
    setBuffer(Array(BUFFER_SIZE).fill(null));
    setMutex(1); setEmpty(BUFFER_SIZE); setFull(0);
    setLog([]); setProducerWaiting(false); setConsumerWaiting(false);
    setRunning(false);
  };

  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Producer-Consumer</h3>
        <div className="flex gap-2">
          <button onClick={reset}
            className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/70 transition-all">
            Reset
          </button>
          <button onClick={() => setRunning((r) => !r)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all border ${running ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'}`}>
            {running ? '⏸ Pause' : '▶ Start'}
          </button>
        </div>
      </div>

      {/* Semaphores */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'mutex', value: mutex, color: mutex === 1 ? 'text-emerald-400' : 'text-red-400', bg: mutex === 1 ? 'bg-emerald-500/10' : 'bg-red-500/10', desc: 'Mutual Exclusion' },
          { label: 'empty', value: empty, color: 'text-indigo-400', bg: 'bg-indigo-500/10', desc: 'Empty slots' },
          { label: 'full', value: full, color: 'text-amber-400', bg: 'bg-amber-500/10', desc: 'Full slots' },
        ].map((sem) => (
          <div key={sem.label} className={`rounded-lg p-3 text-center ${sem.bg}`}>
            <p className="text-[10px] text-white/40 mb-1 font-mono">{sem.label}</p>
            <motion.p className={`text-2xl font-bold font-mono ${sem.color}`} animate={{ scale: [1, 1.15, 1] }} key={sem.value} transition={{ duration: 0.2 }}>
              {sem.value}
            </motion.p>
            <p className="text-[9px] text-white/25 mt-1">{sem.desc}</p>
          </div>
        ))}
      </div>

      {/* Buffer */}
      <div className="mb-4">
        <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Bounded Buffer ({BUFFER_SIZE} slots)</p>
        <div className="flex gap-2">
          {buffer.map((item, i) => (
            <div key={i} className="flex-1">
              <div className={`h-14 rounded-lg border flex flex-col items-center justify-center transition-all duration-300 ${
                item ? 'border-amber-500/30 bg-amber-500/10' : 'border-white/5 bg-white/2'
              }`}>
                <AnimatePresence mode="wait">
                  {item ? (
                    <motion.div key={item.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="text-center">
                      <p className="text-xs font-bold font-mono text-amber-300">{item.value}</p>
                    </motion.div>
                  ) : (
                    <p className="text-[10px] text-white/15">—</p>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-[9px] text-white/20 text-center mt-1 font-mono">[{i}]</p>
            </div>
          ))}
        </div>
      </div>

      {/* Threads */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Producer', waiting: producerWaiting, color: 'emerald' },
          { label: 'Consumer', waiting: consumerWaiting, color: 'indigo' },
        ].map((t) => (
          <div key={t.label} className={`rounded-lg p-3 border ${t.waiting ? 'border-red-500/20 bg-red-500/5' : `border-${t.color}-500/15 bg-${t.color}-500/5`}`}>
            <div className="flex items-center gap-2">
              <motion.div className={`w-2 h-2 rounded-full ${t.waiting ? 'bg-red-400' : running ? `bg-${t.color}-400` : 'bg-white/20'}`}
                animate={running && !t.waiting ? { opacity: [1, 0.3, 1] } : {}}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <span className="text-xs font-medium text-white/70">{t.label}</span>
              <span className={`text-[10px] ml-auto ${t.waiting ? 'text-red-400' : running ? `text-${t.color}-400` : 'text-white/20'}`}>
                {t.waiting ? 'waiting' : running ? 'running' : 'idle'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Log */}
      <div className="rounded-lg bg-black/20 border border-white/5 p-3 h-36 overflow-y-auto">
        <AnimatePresence>
          {log.map((entry, i) => (
            <motion.p key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
              className={`text-[10px] font-mono mb-1 ${
                entry.type === 'produce' ? 'text-emerald-400/80' :
                entry.type === 'consume' ? 'text-indigo-400/80' : 'text-red-400/70'
              }`}>
              {entry.text}
            </motion.p>
          ))}
        </AnimatePresence>
        {log.length === 0 && <p className="text-[10px] text-white/15 text-center mt-8">Press Start to begin simulation</p>}
      </div>
    </div>
  );
}
