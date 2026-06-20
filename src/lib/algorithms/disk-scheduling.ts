export interface DiskResult {
  sequence: number[];
  seekDistance: number;
  path: number[];
}

export type DiskDirection = 'left' | 'right';

function totalSeek(path: number[]): number {
  let dist = 0;
  for (let i = 1; i < path.length; i++) dist += Math.abs(path[i] - path[i - 1]);
  return dist;
}

export function diskFCFS(requests: number[], head: number): DiskResult {
  const path = [head, ...requests];
  return { sequence: requests, seekDistance: totalSeek(path), path };
}

export function diskSSTF(requests: number[], head: number): DiskResult {
  const rem = [...requests];
  const sequence: number[] = [];
  const path = [head];
  let cur = head;

  while (rem.length > 0) {
    rem.sort((a, b) => Math.abs(a - cur) - Math.abs(b - cur));
    const next = rem.shift()!;
    sequence.push(next);
    path.push(next);
    cur = next;
  }

  return { sequence, seekDistance: totalSeek(path), path };
}

export function diskSCAN(requests: number[], head: number, direction: DiskDirection, maxCylinder = 199): DiskResult {
  const sorted = [...requests].sort((a, b) => a - b);
  const left = sorted.filter((r) => r < head).reverse();
  const right = sorted.filter((r) => r >= head);
  const path = [head];
  const sequence: number[] = [];

  if (direction === 'right') {
    for (const r of right) { path.push(r); sequence.push(r); }
    if (left.length > 0) {
      path.push(maxCylinder);
      for (const r of left) { path.push(r); sequence.push(r); }
    }
  } else {
    for (const r of left) { path.push(r); sequence.push(r); }
    if (right.length > 0) {
      path.push(0);
      for (const r of right) { path.push(r); sequence.push(r); }
    }
  }

  return { sequence, seekDistance: totalSeek(path), path };
}

export function diskCSCAN(requests: number[], head: number, maxCylinder = 199): DiskResult {
  const sorted = [...requests].sort((a, b) => a - b);
  const right = sorted.filter((r) => r >= head);
  const left = sorted.filter((r) => r < head);
  const path = [head];
  const sequence: number[] = [];

  for (const r of right) { path.push(r); sequence.push(r); }
  if (left.length > 0) {
    path.push(maxCylinder);
    path.push(0);
    for (const r of left) { path.push(r); sequence.push(r); }
  }

  return { sequence, seekDistance: totalSeek(path), path };
}

export function diskLOOK(requests: number[], head: number, direction: DiskDirection): DiskResult {
  const sorted = [...requests].sort((a, b) => a - b);
  const left = sorted.filter((r) => r < head).reverse();
  const right = sorted.filter((r) => r >= head);
  const path = [head];
  const sequence: number[] = [];

  if (direction === 'right') {
    for (const r of right) { path.push(r); sequence.push(r); }
    for (const r of left) { path.push(r); sequence.push(r); }
  } else {
    for (const r of left) { path.push(r); sequence.push(r); }
    for (const r of right) { path.push(r); sequence.push(r); }
  }

  return { sequence, seekDistance: totalSeek(path), path };
}

export function diskCLOOK(requests: number[], head: number): DiskResult {
  const sorted = [...requests].sort((a, b) => a - b);
  const right = sorted.filter((r) => r >= head);
  const left = sorted.filter((r) => r < head);
  const path = [head];
  const sequence: number[] = [];

  for (const r of right) { path.push(r); sequence.push(r); }
  for (const r of left) { path.push(r); sequence.push(r); }

  return { sequence, seekDistance: totalSeek(path), path };
}

export type DiskAlgorithm = 'fcfs' | 'sstf' | 'scan' | 'cscan' | 'look' | 'clook';

export function runDiskAlgorithm(
  alg: DiskAlgorithm,
  requests: number[],
  head: number,
  direction: DiskDirection = 'right',
  maxCylinder = 199,
): DiskResult {
  switch (alg) {
    case 'fcfs': return diskFCFS(requests, head);
    case 'sstf': return diskSSTF(requests, head);
    case 'scan': return diskSCAN(requests, head, direction, maxCylinder);
    case 'cscan': return diskCSCAN(requests, head, maxCylinder);
    case 'look': return diskLOOK(requests, head, direction);
    case 'clook': return diskCLOOK(requests, head);
  }
}
