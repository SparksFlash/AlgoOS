import { create } from 'zustand';
import { DiskResult, DiskAlgorithm, DiskDirection } from '@/lib/algorithms/disk-scheduling';

interface DiskStore {
  requests: number[];
  headPosition: number;
  direction: DiskDirection;
  maxCylinder: number;
  algorithm: DiskAlgorithm;
  result: DiskResult | null;
  currentStep: number;
  isPlaying: boolean;
  speed: number;
  setRequests: (r: number[]) => void;
  setHeadPosition: (h: number) => void;
  setDirection: (d: DiskDirection) => void;
  setAlgorithm: (a: DiskAlgorithm) => void;
  setResult: (r: DiskResult | null) => void;
  setStep: (s: number) => void;
  setPlaying: (v: boolean) => void;
  setSpeed: (v: number) => void;
}

export const useDiskStore = create<DiskStore>((set) => ({
  requests: [98, 183, 37, 122, 14, 124, 65, 67],
  headPosition: 53,
  direction: 'right',
  maxCylinder: 199,
  algorithm: 'fcfs',
  result: null,
  currentStep: 0,
  isPlaying: false,
  speed: 1,
  setRequests: (r) => set({ requests: r, result: null }),
  setHeadPosition: (h) => set({ headPosition: h, result: null }),
  setDirection: (d) => set({ direction: d, result: null }),
  setAlgorithm: (a) => set({ algorithm: a, result: null }),
  setResult: (r) => set({ result: r, currentStep: 0 }),
  setStep: (s) => set({ currentStep: s }),
  setPlaying: (v) => set({ isPlaying: v }),
  setSpeed: (v) => set({ speed: v }),
}));
