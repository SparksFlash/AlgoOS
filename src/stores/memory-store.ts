import { create } from 'zustand';
import { PageResult, PageAlgorithm } from '@/lib/algorithms/page-replacement';

interface MemoryStore {
  referenceString: number[];
  frameCount: number;
  algorithm: PageAlgorithm;
  result: PageResult | null;
  currentStep: number;
  isPlaying: boolean;
  speed: number;
  setReferenceString: (s: number[]) => void;
  setFrameCount: (n: number) => void;
  setAlgorithm: (a: PageAlgorithm) => void;
  setResult: (r: PageResult | null) => void;
  setStep: (s: number) => void;
  setPlaying: (v: boolean) => void;
  setSpeed: (v: number) => void;
}

export const useMemoryStore = create<MemoryStore>((set) => ({
  referenceString: [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1],
  frameCount: 3,
  algorithm: 'fifo',
  result: null,
  currentStep: 0,
  isPlaying: false,
  speed: 1,
  setReferenceString: (s) => set({ referenceString: s, result: null }),
  setFrameCount: (n) => set({ frameCount: n, result: null }),
  setAlgorithm: (a) => set({ algorithm: a, result: null }),
  setResult: (r) => set({ result: r, currentStep: 0 }),
  setStep: (s) => set({ currentStep: s }),
  setPlaying: (v) => set({ isPlaying: v }),
  setSpeed: (v) => set({ speed: v }),
}));
