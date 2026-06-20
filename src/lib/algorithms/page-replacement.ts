export interface PageStep {
  page: number;
  frames: (number | null)[];
  isHit: boolean;
  faultCount: number;
  evicted: number | null;
  clockBits?: number[];
  pointer?: number;
}

export interface PageResult {
  steps: PageStep[];
  totalFaults: number;
  totalHits: number;
  hitRatio: number;
}

export function fifo(referenceString: number[], frameCount: number): PageResult {
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const steps: PageStep[] = [];
  let faultCount = 0;
  let pointer = 0;

  for (const page of referenceString) {
    if (frames.includes(page)) {
      steps.push({ page, frames: [...frames], isHit: true, faultCount, evicted: null });
    } else {
      faultCount++;
      const evicted = frames[pointer];
      frames[pointer] = page;
      pointer = (pointer + 1) % frameCount;
      steps.push({ page, frames: [...frames], isHit: false, faultCount, evicted });
    }
  }

  const totalHits = referenceString.length - faultCount;
  return { steps, totalFaults: faultCount, totalHits, hitRatio: totalHits / referenceString.length };
}

export function lru(referenceString: number[], frameCount: number): PageResult {
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const lastUsed = new Map<number, number>();
  const steps: PageStep[] = [];
  let faultCount = 0;

  for (let i = 0; i < referenceString.length; i++) {
    const page = referenceString[i];
    if (frames.includes(page)) {
      lastUsed.set(page, i);
      steps.push({ page, frames: [...frames], isHit: true, faultCount, evicted: null });
    } else {
      faultCount++;
      let evicted: number | null = null;
      const emptySlot = frames.indexOf(null);
      if (emptySlot !== -1) {
        frames[emptySlot] = page;
      } else {
        let lruIdx = 0;
        let lruTime = Infinity;
        for (let j = 0; j < frames.length; j++) {
          const t = lastUsed.get(frames[j]!) ?? -1;
          if (t < lruTime) { lruTime = t; lruIdx = j; }
        }
        evicted = frames[lruIdx];
        frames[lruIdx] = page;
      }
      lastUsed.set(page, i);
      steps.push({ page, frames: [...frames], isHit: false, faultCount, evicted });
    }
  }

  const totalHits = referenceString.length - faultCount;
  return { steps, totalFaults: faultCount, totalHits, hitRatio: totalHits / referenceString.length };
}

export function optimal(referenceString: number[], frameCount: number): PageResult {
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const steps: PageStep[] = [];
  let faultCount = 0;

  for (let i = 0; i < referenceString.length; i++) {
    const page = referenceString[i];
    if (frames.includes(page)) {
      steps.push({ page, frames: [...frames], isHit: true, faultCount, evicted: null });
    } else {
      faultCount++;
      let evicted: number | null = null;
      const emptySlot = frames.indexOf(null);
      if (emptySlot !== -1) {
        frames[emptySlot] = page;
      } else {
        const nextUse = frames.map((f) => {
          const idx = referenceString.indexOf(f!, i + 1);
          return idx === -1 ? Infinity : idx;
        });
        const replaceIdx = nextUse.indexOf(Math.max(...nextUse));
        evicted = frames[replaceIdx];
        frames[replaceIdx] = page;
      }
      steps.push({ page, frames: [...frames], isHit: false, faultCount, evicted });
    }
  }

  const totalHits = referenceString.length - faultCount;
  return { steps, totalFaults: faultCount, totalHits, hitRatio: totalHits / referenceString.length };
}

export function clockAlgorithm(referenceString: number[], frameCount: number): PageResult {
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const bits: number[] = Array(frameCount).fill(0);
  const steps: PageStep[] = [];
  let faultCount = 0;
  let pointer = 0;

  for (const page of referenceString) {
    const idx = frames.indexOf(page);
    if (idx !== -1) {
      bits[idx] = 1;
      steps.push({ page, frames: [...frames], isHit: true, faultCount, evicted: null, clockBits: [...bits], pointer });
    } else {
      faultCount++;
      while (bits[pointer] === 1) {
        bits[pointer] = 0;
        pointer = (pointer + 1) % frameCount;
      }
      const evicted = frames[pointer];
      frames[pointer] = page;
      bits[pointer] = 1;
      pointer = (pointer + 1) % frameCount;
      steps.push({ page, frames: [...frames], isHit: false, faultCount, evicted, clockBits: [...bits], pointer });
    }
  }

  const totalHits = referenceString.length - faultCount;
  return { steps, totalFaults: faultCount, totalHits, hitRatio: totalHits / referenceString.length };
}

export type PageAlgorithm = 'fifo' | 'lru' | 'optimal' | 'clock';

export function runPageAlgorithm(alg: PageAlgorithm, ref: number[], frames: number): PageResult {
  switch (alg) {
    case 'fifo': return fifo(ref, frames);
    case 'lru': return lru(ref, frames);
    case 'optimal': return optimal(ref, frames);
    case 'clock': return clockAlgorithm(ref, frames);
  }
}
