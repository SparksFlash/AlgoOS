import { create } from 'zustand';
import { Process, SchedulingResult, assignColors } from '@/lib/algorithms/cpu-scheduling';

export type CPUAlgorithm = 'fcfs' | 'sjf' | 'srtf' | 'rr' | 'priority' | 'priority-preemptive' | 'mlfq';

interface CPUStore {
  processes: Process[];
  algorithm: CPUAlgorithm;
  quantum: number;
  result: SchedulingResult | null;
  currentStep: number;
  isPlaying: boolean;
  speed: number;
  addProcess: (p: Omit<Process, 'color' | 'id'>) => void;
  removeProcess: (id: string) => void;
  updateProcess: (id: string, updates: Partial<Omit<Process, 'id' | 'color'>>) => void;
  setAlgorithm: (a: CPUAlgorithm) => void;
  setQuantum: (q: number) => void;
  setResult: (r: SchedulingResult | null) => void;
  setStep: (s: number) => void;
  setPlaying: (v: boolean) => void;
  setSpeed: (v: number) => void;
  reset: () => void;
}

let pidCounter = 1;

const DEFAULT_PROCESSES: Process[] = assignColors([
  { id: 'P1', arrivalTime: 0, burstTime: 6, priority: 2 },
  { id: 'P2', arrivalTime: 1, burstTime: 4, priority: 1 },
  { id: 'P3', arrivalTime: 2, burstTime: 2, priority: 3 },
  { id: 'P4', arrivalTime: 3, burstTime: 5, priority: 2 },
]);

export const useCPUStore = create<CPUStore>((set, get) => ({
  processes: DEFAULT_PROCESSES,
  algorithm: 'fcfs',
  quantum: 2,
  result: null,
  currentStep: 0,
  isPlaying: false,
  speed: 1,

  addProcess: (p) => {
    pidCounter++;
    const newP = assignColors([{ ...p, id: `P${pidCounter}` }])[0];
    // Keep color consistent with palette position
    const idx = get().processes.length;
    const colors = ['#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
    newP.color = colors[idx % colors.length];
    set((s) => ({ processes: [...s.processes, newP], result: null }));
  },

  removeProcess: (id) =>
    set((s) => ({ processes: s.processes.filter((p) => p.id !== id), result: null })),

  updateProcess: (id, updates) =>
    set((s) => ({
      processes: s.processes.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      result: null,
    })),

  setAlgorithm: (a) => set({ algorithm: a, result: null }),
  setQuantum: (q) => set({ quantum: q, result: null }),
  setResult: (r) => set({ result: r, currentStep: 0, isPlaying: false }),
  setStep: (s) => set({ currentStep: s }),
  setPlaying: (v) => set({ isPlaying: v }),
  setSpeed: (v) => set({ speed: v }),
  reset: () => set({ result: null, currentStep: 0, isPlaying: false }),
}));
